import { staticFiles } from '@curi/static';
import * as fs from 'fs';
import * as http from 'http';
import 'isomorphic-unfetch';
import * as path from 'path';

import { renderHtml } from './nodeRenderHtml';
import { createRequestHandler } from './nodeRequestHandler';
import { routes, staticFallback, staticPages } from './routes';

let manifest;

function getAssetUrlFromManifest(asset) {
  if (!manifest) {
    manifest = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, '..', 'dist', 'manifest.json'))
        .toString()
    );
  }

  return `${manifest[asset]}`;
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const argv = process.argv.slice(2);

if (argv[0] === 'prerender') {
  staticFiles({
    fallback: staticFallback,
    pages: staticPages,
    router: { routes },

    output: {
      dir: PUBLIC_DIR,

      render: ({ response, router }) =>
        renderHtml({
          getAssetUrl: getAssetUrlFromManifest,
          response,
          router,
        }),
    },
  }).then(
    results => {
      // eslint-disable-next-line no-console
      console.log(
        results
          .map(result =>
            result.success
              ? `✔ ${result.pathname}`
              : `✖ ${result.pathname} (${result.error.message})`
          )
          .join('\n')
      );
    },

    err => {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  );
} else {
  let requestHandlerOptions;

  if (process.env.NODE_ENV === 'production') {
    requestHandlerOptions = {
      getAssetUrl: getAssetUrlFromManifest,
      publicDir: PUBLIC_DIR,
    };
  } else {
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const webpackConfig = require('../webpack.config')({
      dev: true,
      node: false,
    });

    const compiler = webpack(webpackConfig);

    requestHandlerOptions = {
      getAssetUrl: asset => `${webpackConfig.output.publicPath + asset}`,
      publicDir: PUBLIC_DIR,
      webpackDevMiddleware: webpackDevMiddleware(compiler),
      webpackHotMiddleware: webpackHotMiddleware(compiler),
    };
  }

  let requestHandler = createRequestHandler(requestHandlerOptions);

  const server = http.createServer();
  server.on('request', requestHandler);

  if (module.hot) {
    module.hot.accept(['./nodeRenderHtml', './routes']);

    module.hot.accept('./nodeRequestHandler', () => {
      server.removeListener('request', requestHandler);
      requestHandler = createRequestHandler(requestHandlerOptions);
      server.on('request', requestHandler);
    });
  }

  server.listen(8080);
}
