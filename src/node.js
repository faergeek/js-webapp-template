import * as assert from 'assert';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import { createRequestHandler } from './nodeRequestHandler';

const PORT = parseInt(process.env.PORT, 10);
const BUILD_ROOT = path.resolve('build');
const PUBLIC_ROOT = path.resolve(BUILD_ROOT, 'public');

assert(isFinite(PORT));

let manifest;

function getAssetUrlFromManifest(asset) {
  if (!manifest) {
    manifest = JSON.parse(
      fs.readFileSync(path.resolve(BUILD_ROOT, 'manifest.json'), 'utf-8')
    );
  }

  return `${manifest[asset]}`;
}

let requestHandlerOptions;

if (process.env.NODE_ENV === 'production') {
  requestHandlerOptions = {
    getAssetUrl: getAssetUrlFromManifest,
    publicDir: PUBLIC_ROOT,
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
    publicDir: PUBLIC_ROOT,
    webpackDevMiddleware: webpackDevMiddleware(compiler),
    webpackHotMiddleware: webpackHotMiddleware(compiler),
  };
}

let requestHandler = createRequestHandler(requestHandlerOptions);

const server = http.createServer();
server.on('request', requestHandler);

if (module.hot) {
  module.hot.accept('./nodeRequestHandler', () => {
    server.removeListener('request', requestHandler);
    requestHandler = createRequestHandler(requestHandlerOptions);
    server.on('request', requestHandler);
  });
}

server.listen(PORT);
