import * as path from 'node:path';

import makeWebpackConfig from '@faergeek/make-webpack-config';

export default function webpackConfig(env, argv) {
  const dev = argv.defineProcessEnvNodeEnv === 'development';
  const watch = env.WEBPACK_WATCH;

  return makeWebpackConfig({
    analyze: !dev,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [new URL(import.meta.url).pathname],
      },
    },
    dev,
    entry: {
      webPage: './src/browser',
      node: './src/node',
      serviceWorker: './src/sw/sw',
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
