import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { finished } from 'node:stream/promises';

import {
  AgnosticRouteObject,
  unstable_createStaticHandler as createStaticHandler,
} from '@remix-run/router';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { nanoid } from 'nanoid';
import * as nocache from 'nocache';
import { renderToNodeStream } from 'react-dom/server';
import { RouteObject } from 'react-router-dom';
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from 'react-router-dom/server';
import invariant from 'tiny-invariant';

import { Entry } from './entry';
import { routes } from './routes';

function convertRoute(route: RouteObject): AgnosticRouteObject {
  const hasErrorBoundary = route.errorElement != null;

  return route.index
    ? {
        ...route,
        hasErrorBoundary,
      }
    : {
        ...route,
        hasErrorBoundary,
        children: route.children?.map(convertRoute),
      };
}

const require = createRequire(
  new URL(path.resolve('build', 'main.cjs'), 'file://')
);

async function getAssets() {
  let assets: { main: { css: string[]; js: string[] } };

  if (__DEV__) {
    assets = JSON.parse(
      await readFile(path.resolve('build', 'webpack-assets.json'), 'utf-8')
    );
  } else {
    assets = require('../build/webpack-assets.json');
  }

  return assets;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      nonce: string;
    }
  }
}

export const requestHandler = express()
  .use(morgan(__DEV__ ? 'dev' : 'combined'))
  .use((req, _res, next) => {
    req.nonce = nanoid();
    next();
  })
  .use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          connectSrc: [
            "'self'",
            'https://api.memegen.link',
            ...(__DEV__
              ? [
                  (req: http.IncomingMessage) => {
                    const url = new URL(`ws://${req.headers.host}`);
                    url.port = '8000';
                    return url.origin;
                  },
                ]
              : []),
          ],
          imgSrc: ["'self'", 'data:', 'https://api.memegen.link'],
          scriptSrc: [
            "'strict-dynamic'",
            req => `'nonce-${(req as unknown as express.Request).nonce}'`,
            "'unsafe-inline'",
            'https:',
          ],
          scriptSrcAttr: null,
          upgradeInsecureRequests: __DEV__ ? null : [],
        },
      },
      hsts: !__DEV__,
    })
  )
  .use(express.static(path.resolve('public')))
  .use(
    express.static(
      path.resolve('build', 'public'),
      __DEV__
        ? undefined
        : {
            immutable: true,
            maxAge: '1 year',
          }
    )
  )
  .use('/download', async (req, res, next) => {
    const url = req.query.url;

    if (typeof url !== 'string') {
      next();
      return;
    }

    const response = await fetch(url);
    res.set('content-type', response.headers.get('content-type') ?? undefined);
    res.send(Buffer.from(await response.arrayBuffer()));
  })
  .use(bodyParser.urlencoded({ extended: false }))
  .use(nocache())
  .use(async (req, res, next) => {
    try {
      const { main } = await getAssets();

      const abortController = new AbortController();

      req.on('close', () => {
        abortController.abort();
      });

      let body: BodyInit | undefined;
      switch (req.headers['content-type']) {
        case 'application/x-www-form-urlencoded': {
          const searchParams = new URLSearchParams();

          Object.entries(req.body).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach(v => {
                searchParams.append(key, v);
              });
            } else if (typeof value === 'string') {
              searchParams.append(key, value);
            }
          });

          body = searchParams.toString();
          break;
        }
      }

      const origin = `${req.protocol}://${req.get('host')}`;

      const request = new Request(new URL(req.originalUrl, origin), {
        signal: abortController.signal,
        method: req.method,
        headers: new Headers(
          Object.entries(req.headers).flatMap(
            ([key, value]): Array<[string, string]> => {
              if (!value) {
                return [];
              }

              if (Array.isArray(value)) {
                return value.map(v => [key, v]);
              }

              return [[key, value]];
            }
          )
        ),
        body,
      });

      const { query } = createStaticHandler(routes.map(convertRoute));
      const context = await query(request);

      if (context instanceof Response) {
        if (context.status >= 300 && context.status < 400) {
          const location = context.headers.get('Location');
          invariant(
            location,
            'Received response 3xx status, but without location'
          );
          res.redirect(context.status, location);
          return;
        }

        throw context;
      }

      const router = createStaticRouter(routes, context);

      const stream = renderToNodeStream(
        <Entry css={main.css} js={main.js} nonce={req.nonce} router={router}>
          <StaticRouterProvider
            context={context}
            hydrate={false}
            router={router}
          />
        </Entry>
      );

      res
        .status(context.statusCode)
        .set('content-type', 'text/html')
        .write('<!DOCTYPE html>');

      stream.pipe(res);

      await finished(stream);
    } catch (err) {
      next(err);
    }
  });
