import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { finished } from 'node:stream/promises';

import {
  AgnosticRouteObject,
  unstable_createStaticHandler as createStaticHandler,
} from '@remix-run/router';
import * as bodyParser from 'body-parser';
import * as express from 'express';
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

export const requestHandler = express()
  .use(express.static(path.resolve('public')))
  .use(
    express.static(path.resolve('build', 'public'), {
      immutable: !import.meta.webpackHot,
      maxAge: import.meta.webpackHot ? undefined : '1 year',
    })
  )
  .use(bodyParser.urlencoded({ extended: false }))
  .use(nocache())
  .use(async (req, res, next) => {
    try {
      const { main }: { main: { css: string[]; js: string[] } } = JSON.parse(
        await readFile(path.resolve(__dirname, 'webpack-assets.json'), 'utf-8')
      );

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
        <Entry css={main.css} js={main.js} router={router}>
          <StaticRouterProvider
            context={context}
            hydrate={false}
            router={router}
          />
        </Entry>
      );

      res
        .status(context.statusCode)
        .set('Content-Type', 'text/html')
        .write('<!DOCTYPE html>');

      stream.pipe(res);

      await finished(stream);
    } catch (err) {
      next(err);
    }
  });
