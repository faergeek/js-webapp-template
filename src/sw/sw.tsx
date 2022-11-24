/// <reference lib="dom" />
/// <reference lib="webworker" />
/// <reference lib="webworker.iterable" />
import { unstable_createStaticHandler as createStaticHandler } from '@remix-run/router';
import assets from 'assets.json';
import { renderToString } from 'react-dom/server';
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from 'react-router-dom/server';

import { handleFetchError } from '../_core/fetch';
import { Entry } from '../entry';
import { routes } from '../routes';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const ASSETS_CACHE_KEY = `assets-${__webpack_hash__}`;
const MEMEGEN_CACHE_KEY = 'memegen';
const ALL_CACHE_KEYS = [ASSETS_CACHE_KEY, MEMEGEN_CACHE_KEY];

const assetUrls = Object.entries(assets).flatMap(([, entry]) => [
  ...Object.values(entry.auxiliary),
  ...(__DEV__ ? [] : Object.values(entry.css)),
  ...Object.values(entry.js),
]);

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([caches.open(ASSETS_CACHE_KEY), caches.open(MEMEGEN_CACHE_KEY)])
      .then(([assetsCache, memegenCache]) =>
        Promise.all([
          assetsCache.addAll(assetUrls),
          memegenCache.addAll(['https://api.memegen.link/templates']),
        ])
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.map(key =>
            !ALL_CACHE_KEYS.includes(key)
              ? caches.delete(key)
              : Promise.resolve()
          )
        )
      )
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method === 'GET' &&
    assetUrls.includes(requestUrl.pathname)
  ) {
    event.respondWith(
      caches
        .match(event.request)
        .then(cachedResponse => cachedResponse ?? fetch(event.request))
    );
  } else if (
    event.request.destination === 'document' &&
    requestUrl.origin === location.origin
  ) {
    const abortController = new AbortController();

    event.request.signal.addEventListener('abort', () => {
      abortController.abort();
    });

    setTimeout(() => {
      abortController.abort();
    }, 3000);

    event.respondWith(
      fetch(event.request, { signal: abortController.signal }).catch(
        async () => {
          const { query } = createStaticHandler(routes);
          const context = await query(event.request);

          if (context instanceof Response) {
            return context;
          }

          const router = createStaticRouter(routes, context);

          const html = `<!DOCTYPE html>${renderToString(
            <Entry
              css={assets.main.css}
              js={assets.main.js}
              nonce=""
              router={router}
            >
              <StaticRouterProvider
                context={context}
                hydrate={false}
                router={router}
              />
            </Entry>
          )}`;

          return new Response(html, {
            status: context.statusCode,
            headers: {
              'content-type': 'text/html',
            },
          });
        }
      )
    );
  } else if (
    event.request.method === 'GET' &&
    requestUrl.origin === 'https://api.memegen.link'
  ) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(response => {
          const clonedResponse = response.clone();

          caches
            .open(MEMEGEN_CACHE_KEY)
            .then(cache => cache.put(event.request, clonedResponse));

          return response;
        }, handleFetchError);

        return cachedResponse ?? fetchPromise;
      })
    );
  }
});
