const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');
const { WebpackPluginServe } = require('webpack-plugin-serve');
const WebpackBar = require('webpackbar');

function makeWebpackConfig({ dev, watch }) {
  const buildRoot = path.resolve('build');
  const publicRoot = path.resolve('build', 'public');
  const srcRoot = path.resolve('src');
  const assetsRegExp = /\.(svg|png|gif|jpe?g|eot|ttf|woff2?)$/;

  function makeConfig({ dev, node, watch = false }) {
    const name = node ? 'node' : 'browser';
    const reactRefresh = dev && watch && !node;

    function wrapEntry(entry) {
      return (node
        ? [
            'source-map-support/register',
            watch && 'webpack/hot/signal',
            'dotenv-flow/config',
            entry,
          ]
        : [dev && watch && 'webpack-plugin-serve/client', entry]
      ).filter(Boolean);
    }

    return {
      name,
      dependencies: node ? ['browser'] : undefined,
      target: node
        ? 'node'
        : dev
        ? 'browserslist:development'
        : 'browserslist:production',
      stats: watch ? 'none' : 'errors-warnings',
      devtool: dev ? 'cheap-module-source-map' : 'source-map',
      externals: node
        ? nodeExternals({ allowlist: [/^webpack\/hot/, assetsRegExp] })
        : undefined,
      entry: {
        main: wrapEntry(node ? './src/node' : './src/browser'),
      },
      output: {
        chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
        crossOriginLoading: watch ? 'anonymous' : undefined,
        devtoolModuleFilenameTemplate: node
          ? path.relative(buildRoot, '[resource-path]')
          : undefined,
        filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
        libraryTarget: node ? 'commonjs' : undefined,
        path: node ? buildRoot : publicRoot,
        publicPath: watch ? 'http://localhost:8081/' : '/',
      },
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            include: srcRoot,
            loader: 'babel-loader',
            options: {
              envName: dev ? 'development' : 'production',
              plugins: reactRefresh ? ['react-refresh/babel'] : [],
            },
          },
          {
            test: /\.(css|sass|scss)$/,
            use: (node ? [] : [MiniCssExtractPlugin.loader]).concat([
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  modules: {
                    auto: true,
                    exportOnlyLocals: node,
                    exportLocalsConvention: 'dashesOnly',
                    localIdentName: dev
                      ? '[local]@[1]#[contenthash:base64:5]'
                      : undefined,
                    localIdentRegExp: /\/([^/]*)\.module\.\w+$/i,
                  },
                },
              },
              'postcss-loader',
            ]),
          },
          { test: /\.(css|js)$/, use: 'source-map-loader' },
          {
            test: /\.(sass|scss)$/,
            use: [
              {
                loader: 'resolve-url-loader',
                options: { keepQuery: true, sourceMap: true },
              },
              'sass-loader',
            ],
          },
          {
            test: assetsRegExp,
            type: 'javascript/auto',
            use: [
              {
                loader: 'url-loader',
                options: {
                  emitFile: !node,
                  limit: 4000,
                  name: watch ? '[name].[ext]' : '[name].[contenthash].[ext]',
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new WebpackBar({ name }),
        watch && new FriendlyErrorsWebpackPlugin({ clearConsole: false }),
        watch && node && new webpack.HotModuleReplacementPlugin(),
        watch &&
          node &&
          new RunScriptWebpackPlugin({
            name: 'main.js',
            nodeArgs: ['--inspect=9229'],
            signal: true,
          }),
        reactRefresh &&
          new ReactRefreshWebpackPlugin({
            overlay: { sockIntegration: 'wps' },
          }),
        watch &&
          !node &&
          new WebpackPluginServe({
            client: { retry: true },
            hmr: dev ? 'refresh-on-failure' : false,
            log: { level: 'warn' },
            port: 8081,
            static: [publicRoot],
            waitForBuild: true,
            middleware: (app, builtins) =>
              builtins.headers({ 'Access-Control-Allow-Origin': '*' }),
          }),
        !node &&
          new AssetsPlugin({
            entrypoints: true,
            includeAuxiliaryAssets: true,
            path: buildRoot,
            prettyPrint: dev,
          }),
        !node &&
          new MiniCssExtractPlugin({
            filename: watch ? '[name].css' : '[name].[contenthash].css',
          }),
        !dev &&
          watch &&
          !node &&
          new BundleAnalyzerPlugin({ openAnalyzer: false }),
      ].filter(Boolean),
      optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
        runtimeChunk: node ? undefined : 'single',
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/](?!webpack[\\/]hot[\\/]).*\.js$/,
              name: 'vendors',
              chunks: 'initial',
              enforce: true,
            },
            css: {
              test: /\.css$/,
              name: 'main',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      },
    };
  }

  return [
    makeConfig({ dev, node: false, watch }),
    makeConfig({ dev, node: true, watch }),
  ];
}

module.exports = (env, argv) =>
  makeWebpackConfig({
    dev: argv.mode === 'development',
    watch: argv.watch,
  });
