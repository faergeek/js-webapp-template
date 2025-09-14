/// <reference types="@workspace/app/virtual-routes" />
/// <reference types="@faergeek/make-webpack-config/module" />
import '@workspace/app/setPublicPath';

import { isDataRequest } from '@workspace/app';
import { respond } from '@workspace/respond';
import assets from 'assets.json';
import { renderToReadableStream } from 'react-dom/server';
import invariant from 'tiny-invariant';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const ASSETS_CACHE_KEY = `assets-${__webpack_hash__}`;

const assetsByPath = new Map(
  Object.values(assets)
    .flatMap(assetRecords =>
      Object.values(assetRecords).flatMap(assetRecord =>
        assetRecord
          ? [...assetRecord.auxiliary, ...assetRecord.css, ...assetRecord.js]
          : [],
      ),
    )
    .map(asset => ({
      immutable: asset.immutable,
      path: __webpack_public_path__ + asset.path,
    }))
    .map(asset => [asset.path, asset]),
);

self.addEventListener('install', event => event.waitUntil(install()));
self.addEventListener('activate', event => event.waitUntil(activate()));

async function install() {
  const assetsCache = await caches.open(ASSETS_CACHE_KEY);

  await assetsCache.addAll(
    assetsByPath.values().map(asset => new URL(asset.path, origin).href),
  );

  await self.skipWaiting();
}

async function activate() {
  const keys = await caches.keys();

  await Promise.all(
    keys.map(key =>
      key === ASSETS_CACHE_KEY ? Promise.resolve() : caches.delete(key),
    ),
  );

  if ('navigationPreload' in self.registration) {
    await self.registration.navigationPreload.enable();
  }

  await self.clients.claim();
}

async function fallbackToCache(cacheKey: string, event: FetchEvent) {
  try {
    const response = await fetch(event.request);
    const cloned = response.clone();

    event.waitUntil(
      caches.open(cacheKey).then(cache => cache.put(event.request, cloned)),
    );

    return response;
  } catch (err) {
    const response = await caches.match(event.request);
    if (!response) throw err;

    return response;
  }
}

async function cacheFirst(event: FetchEvent) {
  const response = await caches.match(event.request);
  invariant(response);
  return response;
}

async function routerResponse(request: Request) {
  const result = await respond(request);
  if (result instanceof Response) return result;

  const { bootstrapScripts, children, headers, nonce, status } = result;

  const body = await renderToReadableStream(children, {
    bootstrapScripts,
    nonce,
    signal: request.signal,
  });

  return new Response(body, { headers, status });
}

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    const preloadPromise =
      'preloadResponse' in event
        ? (event.preloadResponse as Promise<Response | undefined>)
        : Promise.resolve(undefined);

    return event.respondWith(
      preloadPromise
        .then(preloadResponse =>
          preloadResponse?.ok
            ? preloadResponse
            : Promise.reject(preloadResponse),
        )
        .catch(() => routerResponse(event.request)),
    );
  }

  if (isDataRequest(event.request)) {
    return event.respondWith(routerResponse(event.request));
  }

  const url = new URL(event.request.url);
  const asset = assetsByPath.get(url.pathname);

  if (asset) {
    return asset.immutable
      ? event.respondWith(cacheFirst(event))
      : event.respondWith(fallbackToCache(ASSETS_CACHE_KEY, event));
  }
});
