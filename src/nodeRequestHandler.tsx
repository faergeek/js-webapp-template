import type * as http from 'node:http';
import * as path from 'node:path';

import assets from 'assets.json';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { nanoid } from 'nanoid';
import * as nocache from 'nocache';
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';
import invariant from 'tiny-invariant';

import { Entry } from './entry';
import { routes } from './routes';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      nonce: string;
    }
  }
}

export const requestHandler: http.RequestListener = express()
  .use(morgan(__DEV__ ? 'dev' : 'combined'))
  .use((req, _res, next) => {
    req.nonce = nanoid();
    next();
  })
  .use(
    helmet({
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
            ...(__DEV__ ? ['http:'] : []),
          ],
          scriptSrcAttr: null,
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https:',
            ...(__DEV__ ? ['http:'] : []),
          ],
          upgradeInsecureRequests: __DEV__ ? null : [],
        },
      },
      hsts: !__DEV__,
    }),
  )
  .use(
    express.static(
      path.resolve('public'),
      __DEV__
        ? undefined
        : {
            immutable: true,
            maxAge: '1 year',
          },
    ),
  )
  .use(
    express.static(
      path.resolve('build', 'public'),
      __DEV__
        ? undefined
        : {
            immutable: true,
            maxAge: '1 year',
          },
    ),
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
      const abortController = new AbortController();

      res.on('close', () => {
        abortController.abort();
      });

      const request = new Request(
        new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`),
        {
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
              },
            ),
          ),
          body: (() => {
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

                return searchParams;
              }
              default:
                return undefined;
            }
          })(),
        },
      );

      const staticHandler = createStaticHandler(routes, {
        future: {
          v7_throwAbortReason: true,
        },
      });

      const context = await staticHandler.query(request);

      if (context instanceof Response) {
        if (context.status >= 300 && context.status < 400) {
          const location = context.headers.get('Location');
          invariant(
            location,
            'Received response 3xx status, but without location',
          );
          res.redirect(context.status, location);
          return;
        }

        throw context;
      }

      const router = createStaticRouter(routes, context);

      const { pipe } = renderToPipeableStream(
        <StrictMode>
          <Entry
            css={assets.initial.main.css.map(asset => asset.path)}
            js={assets.initial.main.js.map(asset => asset.path)}
            nonce={req.nonce}
            router={router}
          >
            <StaticRouterProvider
              context={context}
              hydrate={false}
              router={router}
            />
          </Entry>
        </StrictMode>,
        {
          nonce: req.nonce,
          onShellError: next,
          onShellReady: () => {
            res.status(context.statusCode).set('content-type', 'text/html');
            pipe(res);
          },
        },
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      next(err);
    }
  });
