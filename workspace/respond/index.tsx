import {
  csrfTokenContext,
  isDataRequest,
  routes,
  ShellContextProvider,
} from '@workspace/app';
import assets from 'assets.json';
import { nanoid } from 'nanoid';
import { StrictMode } from 'react';
import type { StaticHandler } from 'react-router';
import {
  createStaticHandler,
  createStaticRouter,
  isRouteErrorResponse,
  matchRoutes,
  RouterContextProvider,
  StaticRouterProvider,
} from 'react-router';
import invariant from 'tiny-invariant';
import children from 'virtual:@faergeek/fs-routes';

export const commonHeaders = new Headers({
  'x-content-type-options': 'nosniff',
});

if (!__DEV__) {
  commonHeaders.set(
    'strict-transport-security',
    'max-age=31536000; includeSubDomains',
  );
}
const defaultHandler = createStaticHandler(routes);
const dataHandler = createStaticHandler([{ path: '/api', children }]);

async function respondWithData(
  handler: StaticHandler,
  request: Request,
  requestContext: RouterContextProvider,
) {
  try {
    const queryResult: unknown = await handler.queryRoute(request, {
      requestContext,
    });

    if (queryResult instanceof Response) return queryResult;

    return new Response(JSON.stringify(queryResult), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    if (err instanceof Response) return err;

    if (isRouteErrorResponse(err)) {
      return new Response(err.data, {
        status: err.status,
        statusText: err.statusText,
      });
    }

    throw err;
  }
}

function cspHeader(nonce: string, url: URL) {
  const cspDirectives = new Map([
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['connect-src', ["'self'", 'https://api.memegen.link']],
    ['img-src', ["'self'", 'data:', 'https://api.memegen.link']],
    ['script-src', [`'nonce-${nonce}'`]],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['font-src', ["'self'", 'https:', 'data:']],
    ['form-action', ["'self'"]],
    ['frame-ancestors', ["'self'"]],
    ['object-src', ["'none'"]],
    ['worker-src', ["'self'"]],
  ]);

  if (__DEV__) {
    cspDirectives.get('connect-src')?.push(`ws://${url.hostname}:8000`);
  } else {
    cspDirectives.set('upgrade-insecure-requests', []);
  }

  return Array.from(cspDirectives.entries())
    .map(([key, value]) => [key, ...value].join(' '))
    .join(';');
}

export async function respond(
  request: Request,
  { csrfToken }: { csrfToken?: string } = {},
) {
  const requestContext = new RouterContextProvider();
  requestContext.set(csrfTokenContext, csrfToken);

  if (isDataRequest(request)) {
    return respondWithData(dataHandler, request, requestContext);
  }

  const url = new URL(request.url);
  const matches = matchRoutes(routes, url.pathname);

  const leafMatch = matches?.at(-1);
  if (leafMatch && !leafMatch.route.Component) {
    const lazy = await leafMatch.route.lazy?.();

    if (!lazy?.Component) {
      return respondWithData(defaultHandler, request, requestContext);
    }
  }

  const nonce = nanoid();

  const asyncAssets = (matches ?? [])
    .map(match =>
      match.route.lazyChunkName
        ? assets.async[match.route.lazyChunkName]
        : undefined,
    )
    .filter(asset => asset != null);

  const queryResult = await defaultHandler.query(request, {
    requestContext,
  });

  if (queryResult instanceof Response) return queryResult;

  const headers = new Headers(commonHeaders);
  headers.set('content-security-policy', cspHeader(nonce, url));
  headers.set('content-type', 'text/html');
  headers.set('cross-origin-Opener-Policy', 'same-origin');
  headers.set('cross-origin-resource-policy', 'same-origin');
  headers.set('origin-agent-cluster', '?1');
  headers.set('referrer-policy', 'no-referrer');
  invariant(assets.initial.main);

  return {
    bootstrapScripts: assets.initial.main.js
      .concat(asyncAssets.flatMap(asset => asset.js))
      .map(asset => __webpack_public_path__ + asset.path),
    children: (
      <StrictMode>
        <ShellContextProvider
          value={{
            css: assets.initial.main.css
              .concat(asyncAssets.flatMap(asset => asset.css))
              .map(asset => __webpack_public_path__ + asset.path),
            nonce,
          }}
        >
          <StaticRouterProvider
            context={queryResult}
            nonce={nonce}
            router={createStaticRouter(defaultHandler.dataRoutes, queryResult)}
          />
        </ShellContextProvider>
      </StrictMode>
    ),
    headers,
    nonce,
    status: queryResult.statusCode,
  };
}
