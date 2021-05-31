import * as express from 'express';
import * as path from 'path';
import renderToString from 'preact-render-to-string';
import invariant from 'tiny-invariant';

import { App } from './app';

function getEntryUrls(entry) {
  if (typeof entry === 'string') {
    return [entry];
  }

  if (Array.isArray(entry)) {
    return entry;
  }

  invariant(entry === undefined);
  return [];
}

export const app = express().use(
  express.static(path.resolve('build', 'public'), { maxAge: '1 year' }),
  async (req, res, next) => {
    try {
      const webpackAssets = await import('../build/webpack-assets.json');

      res.set('Content-Type', 'text/html').send(
        `<!doctype html>${renderToString(
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
              <App />
            </div>
          </html>
        )}`
      );
    } catch (err) {
      next(err);
    }
  }
);
