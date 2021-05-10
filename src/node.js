import 'dotenv-flow/config';

import * as assert from 'assert';
import * as http from 'http';

import { app } from './nodeRequestHandler';

const PORT = parseInt(process.env.PORT, 10);
assert(isFinite(PORT));

if (module.hot) {
  module.hot.accept('./nodeRequestHandler');
}

http.createServer(module.hot ? (req, res) => app(req, res) : app).listen(PORT);
