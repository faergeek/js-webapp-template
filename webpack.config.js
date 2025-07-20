import * as path from 'node:path';

import makeWebpackConfig from '@faergeek/make-webpack-config';

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
          new URL(import.meta.url).pathname,
          new URL('.browserslistrc', import.meta.url).pathname,
        ],
      },
    },
    dev,
    entry: {
      webPage: './src/browser',
      node: './src/node',
      serviceWorker: './src/serviceWorker',
    },
    paths: {
      build: path.resolve('build'),
      public: path.resolve('build', 'public'),
      src: path.resolve('src'),
    },
    reactRefresh: true,
    watch,
  });
}
