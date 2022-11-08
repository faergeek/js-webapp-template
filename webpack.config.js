const makeWebpackConfig = require('@faergeek/make-webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const dev = argv.nodeEnv === 'development';
  const watch = env.WEBPACK_WATCH;

  return makeWebpackConfig({
    analyze: !dev,
    dev,
    entry: {
      browser: './src/browser',
      node: './src/node',
    },
    paths: {
      build: path.resolve('build'),
      public: path.resolve('build', 'public'),
      src: path.resolve('src'),
    },
    reactRefresh: true,
    watch,
  });
};
