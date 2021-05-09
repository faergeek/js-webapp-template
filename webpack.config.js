const path = require('path');
const makeWebpackConfig = require('./makeWebpackConfig');

module.exports = (env, argv) =>
  makeWebpackConfig({
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
    reactRefresh: true,
    watch: argv.watch,
  });
