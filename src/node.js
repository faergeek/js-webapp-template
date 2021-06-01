import 'dotenv-flow/config';

import * as http from 'http';
import invariant from 'tiny-invariant';

import { app } from './nodeRequestHandler';

const PORT = parseInt(process.env.PORT, 10);
invariant(isFinite(PORT));

if (module.hot) {
  module.hot.accept('./nodeRequestHandler');
}

http.createServer(module.hot ? (req, res) => app(req, res) : app).listen(PORT);
