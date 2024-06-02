import assets from 'assets.json';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';

import { handleFetchError } from './_core/fetch';
import { Entry } from './entry';
import { routes } from './routes';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const ASSETS_CACHE_KEY = `assets-${__webpack_hash__}`;
const MEMEGEN_CACHE_KEY = 'memegen';
const ALL_CACHE_KEYS = [ASSETS_CACHE_KEY, MEMEGEN_CACHE_KEY];

const assetsByUrl = Object.fromEntries(
  Object.values(assets)
    .flatMap(assetRecords =>
      Object.values(assetRecords)
        .filter(
          (assetRecord): assetRecord is NonNullable<typeof assetRecord> =>
            assetRecord != null,
        )
        .flatMap(assetRecord => [
          ...assetRecord.auxiliary,
          ...assetRecord.css,
          ...assetRecord.js,
        ]),
    )
    .map(asset => ({
      immutable: asset.immutable,
      url: new URL(asset.path, origin).href,
    }))
    .map(asset => [asset.url, asset]),
);

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([caches.open(ASSETS_CACHE_KEY), caches.open(MEMEGEN_CACHE_KEY)])
      .then(([assetsCache, memegenCache]) =>
        Promise.all([
          assetsCache.addAll(
            Object.values(assetsByUrl).map(asset => asset.url),
          ),
          memegenCache.addAll(['https://api.memegen.link/templates']),
        ]),
      )
      .then(() => self.skipWaiting()),
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
              : Promise.resolve(),
          ),
        ),
      ),
  );
});

const realFetch = self.fetch;

function handleFetchRequest(request: Request): Promise<Response> | void {
  switch (new URL(request.url).origin) {
    case origin:
      if (assetsByUrl[request.url]) {
        const asset = assetsByUrl[request.url];

        const assetsCachePromise = caches.open(ASSETS_CACHE_KEY);

        if (asset.immutable) {
          return assetsCachePromise.then(assetsCache =>
            assetsCache
              .match(request)
              .then(cachedResponse => cachedResponse ?? realFetch(request)),
          );
        } else {
          return realFetch(request).then(
            response => {
              const clonedResponse = response.clone();

              assetsCachePromise.then(assetsCache => {
                assetsCache.put(request, clonedResponse);
              });

              return response;
            },
            err =>
              assetsCachePromise.then(assetsCache =>
                assetsCache
                  .match(request)
                  .then(
                    cachedResponse => cachedResponse ?? Promise.reject(err),
                  ),
              ),
          );
        }
      } else if (request.destination === 'document') {
        const abortController = new AbortController();

        request.signal.addEventListener('abort', () => {
          abortController.abort();
        });

        setTimeout(() => {
          abortController.abort();
        }, 3000);

        return realFetch(request, { signal: abortController.signal }).catch(
          async () => {
            const { query } = createStaticHandler(routes);
            const context = await query(request);

            if (context instanceof Response) {
              return context;
            }

            const router = createStaticRouter(routes, context);

            const html = `<!DOCTYPE html>${renderToString(
              <Entry
                css={assets.initial.main.css.map(asset => asset.path)}
                js={assets.initial.main.js.map(asset => asset.path)}
                nonce=""
                router={router}
              >
                <StaticRouterProvider
                  context={context}
                  hydrate={false}
                  router={router}
                />
              </Entry>,
            )}`;

            return new Response(html, {
              status: context.statusCode,
              headers: {
                'content-type': 'text/html',
              },
            });
          },
        );
      }
      break;
    case 'https://api.memegen.link':
      if (request.method === 'GET') {
        return caches.open(MEMEGEN_CACHE_KEY).then(memegenCache =>
          memegenCache.match(request).then(cachedResponse => {
            const fetchPromise = realFetch(request).then(response => {
              memegenCache.put(request, response.clone());

              return response;
            }, handleFetchError);

            return cachedResponse ?? fetchPromise;
          }),
        );
      }
      break;
  }
}

self.fetch = async (...args) =>
  handleFetchRequest(new Request(...args)) ?? realFetch(...args);

self.addEventListener('fetch', event => {
  const responsePromise = handleFetchRequest(event.request);

  if (responsePromise) {
    event.respondWith(responsePromise);
  }
});
