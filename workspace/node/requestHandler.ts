import type { RequestListener } from 'node:http';
import * as path from 'node:path';
import { Readable, Writable } from 'node:stream';

import { commonHeaders, respond } from '@workspace/respond';
import assets from 'assets.json';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { nanoid } from 'nanoid';
import { renderToReadableStream } from 'react-dom/server';
import { createCookie } from 'react-router';

const nodePublicRoot = path.resolve('workspace', 'node', 'dist', 'public');

const serviceWorkerPublicRoot = path.resolve(
  'workspace',
  'service-worker',
  'dist',
  'public',
);

const webPagePublicRoot = path.resolve(
  'workspace',
  'web-page',
  'dist',
  'public',
);

function setAssetHeaders(res: express.Response) {
  res.setHeaders(commonHeaders);
}

const serveNodeAssets = express.static(nodePublicRoot, {
  setHeaders: setAssetHeaders,
});

const serveServiceWorkerAssets = express.static(serviceWorkerPublicRoot, {
  setHeaders: res => {
    setAssetHeaders(res);
    res.setHeader('Service-Worker-Allowed', '/');
  },
});

const serveWebPageImmutableAssets = express.static(webPagePublicRoot, {
  immutable: true,
  maxAge: '1 year',
  setHeaders: setAssetHeaders,
});

const serveWebPageOtherAssets = express.static(webPagePublicRoot, {
  setHeaders: setAssetHeaders,
});

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

const forbidden = new Response('Forbidden', {
  status: 403,
  statusText: 'Forbidden',
});

export function createRequestHandler({
  cookieSigningSecret,
}: {
  cookieSigningSecret: string;
}): RequestListener {
  const csrfTokenCookie = createCookie('csrf-token', {
    decode: s => s,
    encode: String,
    httpOnly: true,
    path: '/',
    priority: 'low',
    sameSite: 'strict',
    secure: true,
    secrets: [cookieSigningSecret],
  });

  async function getCsrfTokenFromCookie(request: Request) {
    const value: unknown = await csrfTokenCookie.parse(
      request.headers.get('cookie'),
    );

    return typeof value === 'string' ? value : undefined;
  }

  async function getCsrfTokenValidationResponse(
    request: Request,
    { csrfTokenFromCookie }: { csrfTokenFromCookie: string | undefined },
  ) {
    if (request.method === 'GET' || request.method === 'HEAD') return;

    if (!csrfTokenFromCookie) return forbidden;

    const contentType = request.headers.get('content-type');
    if (typeof contentType !== 'string') return forbidden;

    const contentTypeValue = contentType.split(';')[0].toLowerCase();

    if (contentTypeValue === 'application/x-www-form-urlencoded') {
      const formData = await request.clone().formData();
      const csrfToken = formData.get('csrf_token');
      if (csrfToken === csrfTokenFromCookie) return;
    }

    return forbidden;
  }

  return express()
    .disable('x-powered-by')
    .use(morgan(__DEV__ ? 'dev' : 'combined'))
    .use(compression())
    .use(
      __webpack_public_path__,
      (req, res, next) => {
        if (assetsByPath.get(req.originalUrl)?.immutable) {
          serveWebPageImmutableAssets(req, res, next);
        } else {
          serveWebPageOtherAssets(req, res, next);
        }
      },
      serveNodeAssets,
      serveServiceWorkerAssets,
    )
    .use(async (req, res, next) => {
      try {
        const abortController = new AbortController();
        req.once('error', error => {
          if (error.message === 'aborted') abortController.abort();
        });

        const requestInit: RequestInit = {
          signal: abortController.signal,
          method: req.method,
          headers: Object.entries(req.headers).flatMap(
            ([key, value]): Array<[string, string]> =>
              value == null
                ? []
                : Array.isArray(value)
                  ? value.map(v => [key, v])
                  : [[key, value]],
          ),
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (requestInit as any).duplex = 'half';
          requestInit.body = Readable.toWeb(req) as ReadableStream;
        }

        const request = new Request(
          `${req.protocol}://${req.host}${req.originalUrl}`,
          requestInit,
        );

        const csrfTokenFromCookie = await getCsrfTokenFromCookie(request);
        const csrfToken = csrfTokenFromCookie ?? nanoid();

        const result =
          (await getCsrfTokenValidationResponse(request, {
            csrfTokenFromCookie,
          })) ?? (await respond(request, { csrfToken }));

        if (result instanceof Response) {
          res.statusCode = result.status;
          res.setHeaders(result.headers);

          if (result.body) await result.body.pipeTo(Writable.toWeb(res));
          else res.end();
        } else {
          const { bootstrapScripts, children, headers, nonce, status } = result;

          if (csrfToken !== csrfTokenFromCookie) {
            headers.set(
              'set-cookie',
              await csrfTokenCookie.serialize(csrfToken),
            );
          }

          const body = await renderToReadableStream(children, {
            bootstrapScripts,
            nonce,
            signal: request.signal,
          });

          res.statusCode = status;
          res.setHeaders(headers);

          await body.pipeTo(Writable.toWeb(res));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          res.end();
        } else {
          next(err);
        }
      }
    });
}
