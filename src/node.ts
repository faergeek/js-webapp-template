import 'dotenv-flow/config';

import { createServer, Server } from 'http';
import invariant from 'tiny-invariant';

import { app } from './nodeRequestHandler';

const PORT = parseInt(String(process.env.PORT), 10);
invariant(isFinite(PORT));

const server =
  (import.meta.webpackHot?.data?.prevServer as Server | undefined) ||
  createServer(app).listen(PORT);

import.meta.webpackHot?.accept();

import.meta.webpackHot?.dispose(data => {
  data.prevServer = server;
});

import.meta.webpackHot?.accept('./nodeRequestHandler', () => {
  server.removeAllListeners('request');
  server.addListener('request', app);
});
