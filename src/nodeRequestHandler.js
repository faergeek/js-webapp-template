import * as express from 'express';
import * as path from 'path';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import invariant from 'tiny-invariant';

import webpackAssets from '../build/webpack-assets.json';
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
  (req, res) => {
    res.set('Content-Type', 'text/html').send(
      `<!doctype html>${renderToString(
        <html lang="en">
          <meta charSet="utf-8" />
          <title>JS WebApp Template</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {getEntryUrls(webpackAssets.main.css).map(href => (
            <link key={href} rel="stylesheet" href={href} />
          ))}
          {getEntryUrls(webpackAssets.main.js).map(src => (
            <script
              key={src}
              crossOrigin={
                process.env.NODE_ENV === 'production' ? undefined : 'anonymous'
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
  }
);
