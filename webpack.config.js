const makeWebpackConfig = require('@faergeek/make-webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const dev = argv.mode === 'development';

  return makeWebpackConfig({
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
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
    prefresh: true,
    watch: env.WEBPACK_WATCH,
  });
};
