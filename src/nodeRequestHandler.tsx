import * as compression from 'compression';
import * as express from 'express';
import { readFile } from 'fs/promises';
import * as path from 'path';
import renderToString from 'preact-render-to-string';
import invariant from 'tiny-invariant';

import { App } from './app';

function getEntryUrls(entry: string | string[] | undefined) {
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
  compression(),
  express.static(path.resolve('public')),
  express.static(path.resolve('build', 'public'), {
    immutable: !import.meta.webpackHot,
    maxAge: import.meta.webpackHot ? undefined : '1 year',
  }),
  async (_req, res, next) => {
    try {
      const { main } = JSON.parse(
        await readFile(path.resolve(__dirname, 'webpack-assets.json'), 'utf-8')
      );

      res.set('Content-Type', 'text/html').send(
        `<!doctype html>${renderToString(
          <html lang="en">
            <meta charSet="utf-8" />
            <title>JS WebApp Template</title>
            <meta
              name="viewport"
              content="width=device-width,initial-scale=1"
            />
            {getEntryUrls(main.css).map(href => (
              <link key={href} rel="stylesheet" href={href} />
            ))}
            {getEntryUrls(main.js).map(src => (
              <script key={src} defer src={src} />
            ))}
            <App />
          </html>
        )}`
      );
    } catch (err) {
      next(err);
    }
  }
);
