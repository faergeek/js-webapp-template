import { createRouterComponent } from '@curi/react-dom';
import { createRouter } from '@curi/router';
import { createReusable } from '@hickory/in-memory';
import * as assert from 'assert';
import * as express from 'express';
import * as path from 'path';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';

import { App } from './app';
import { routes } from './pages/_routes';

function getEntryUrls(entry) {
  if (typeof entry === 'string') {
    return [entry];
  }

  if (Array.isArray(entry)) {
    return entry;
  }

  assert(entry === undefined);
  return [];
}

const reusable = createReusable();

export const app = express().use(
  express.static(path.resolve('build', 'public'), { maxAge: '1 year' }),
  async (req, res, next) => {
    const router = createRouter(reusable, routes, {
      history: { location: { url: req.originalUrl } },
    });

    const Router = createRouterComponent(router);

    try {
      const webpackAssets = await import('../build/webpack-assets.json');

      router.once(({ response }) => {
        res
          .status((response.meta && response.meta.status) || 200)
          .set('Content-Type', 'text/html');

        res.write('<!doctype html>');

        renderToNodeStream(
          <html lang="en">
            <meta charSet="utf-8" />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />

            <meta
              name="viewport"
              content="width=device-width,initial-scale=1"
            />

            <title>Webpack SSR HMR Boilerplate</title>

            {getEntryUrls(webpackAssets.main.css).map(href => (
              <link key={href} rel="stylesheet" href={href} />
            ))}

            {getEntryUrls(webpackAssets.main.js).map(src => (
              <script
                key={src}
                crossOrigin={
                  process.env.NODE_ENV === 'production'
                    ? undefined
                    : 'anonymous'
                }
                defer
                src={src}
              />
            ))}

            <div id="root">
              <Router>
                <App />
              </Router>
            </div>
          </html>
        ).pipe(res);
      });
    } catch (err) {
      next(err);
    }
  }
);
