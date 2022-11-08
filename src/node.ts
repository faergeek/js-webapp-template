import 'dotenv-flow/config';

import { createServer } from 'node:http';

import invariant from 'tiny-invariant';

import { requestHandler } from './nodeRequestHandler';

const PORT = parseInt(String(process.env.PORT), 10);
invariant(isFinite(PORT));

const server = createServer(
  import.meta.webpackHot ? (...args) => requestHandler(...args) : requestHandler
).listen(PORT);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./nodeRequestHandler');
  import.meta.webpackHot.accept();
  import.meta.webpackHot.dispose(() => server.close());
}
