/// <reference types="@faergeek/make-webpack-config/module" />
import '@workspace/app/setPublicPath';

import { createServer } from 'node:http';
import type { ListenOptions } from 'node:net';
import process from 'node:process';

import dotEnvFlow from 'dotenv-flow';
import pc from 'picocolors';
import invariant from 'tiny-invariant';

import { createRequestHandler } from './requestHandler';

dotEnvFlow.config({ silent: process.env.NODE_ENV === 'production' });

const host = process.env.HOST;
const port = parseInt(String(process.env.PORT), 10);
invariant(isFinite(port));

const cookieSigningSecret = process.env.COOKIE_SIGNING_SECRET;
invariant(cookieSigningSecret);

const server = createServer(
  createRequestHandler({ cookieSigningSecret }),
).listen({ host, port } satisfies ListenOptions, () => {
  const info = server.address();
  invariant(info && typeof info === 'object');

  const address =
    info.address === '::1' || info.address === '127.0.0.1'
      ? 'localhost'
      : info.address;

  // eslint-disable-next-line no-console
  console.log(
    pc.green(`Server is listening on http://${address}:${info.port}`),
  );
});

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./requestHandler', () => {
    server.closeAllConnections();
    server.removeAllListeners('request');
    server.on('request', createRequestHandler({ cookieSigningSecret }));
  });

  import.meta.webpackHot.accept();

  import.meta.webpackHot.dispose(() => {
    // eslint-disable-next-line no-console
    console.log(pc.red('🔥 [HMR] shutting the server down...'));
    server.close();
    server.closeAllConnections();
  });
}
