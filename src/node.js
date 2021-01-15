import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import { createRequestHandler } from './nodeRequestHandler';

let manifest;

function getAssetUrlFromManifest(asset) {
  if (!manifest) {
    manifest = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'dist', 'manifest.json'),
        'utf-8'
      )
    );
  }

  return `${manifest[asset]}`;
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

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
  module.hot.accept('./nodeRequestHandler', () => {
    server.removeListener('request', requestHandler);
    requestHandler = createRequestHandler(requestHandlerOptions);
    server.on('request', requestHandler);
  });
}

server.listen(8080);
