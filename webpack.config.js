import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import makeWebpackConfig from '@faergeek/make-webpack-config';
import { virtualRoutes } from '@workspace/virtual-routes';

const routesDir = path.resolve('workspace', 'app', 'routes');

/**
 * @param {NonNullable<import('webpack-cli').Argv['env']>} env
 * @param {import('webpack-cli').Argv} argv
 */
export default function webpackConfig(env, argv) {
  const dev = argv.configNodeEnv === 'development';
  const watch = env.WEBPACK_WATCH;

  return makeWebpackConfig({
    analyze: !dev,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [
          fileURLToPath(import.meta.url),
          './.browserslistrc',
          './.swcrc',
          './workspace/virtual-routes/index.ts',
        ],
      },
    },
    dev,
    node: {
      entry: '@workspace/node',
      outputPath: path.resolve('workspace', 'node', 'dist'),
    },
    nodeArgs: ['--enable-source-maps', '--inspect=9229'],
    plugins: () => [virtualRoutes(routesDir)],
    reactRefresh: true,
    serviceWorker: {
      entry: { sw: '@workspace/service-worker' },
      outputPath: path.resolve('workspace', 'service-worker', 'dist'),
    },
    watch,
    webPage: {
      entry: '@workspace/web-page',
      outputPath: path.resolve('workspace', 'web-page', 'dist'),
    },
  });
}
