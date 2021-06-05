const makeWebpackConfig = require('@faergeek/make-webpack-config');
const path = require('path');

module.exports = (env, argv) =>
  makeWebpackConfig({
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    dev: argv.mode === 'development',
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
    watch: argv.watch,
  });
