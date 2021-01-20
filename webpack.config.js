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

const BUILD_ROOT = path.resolve('build');
const PUBLIC_ROOT = path.resolve(BUILD_ROOT, 'public');

const ASSETS_RE = /\.(svg|png|gif|jpe?g|eot|ttf|woff2?)$/;

function makeConfig({ dev, node, watch = false }) {
  return {
    name: node ? 'node' : 'browser',
    target: node ? 'node' : 'web',
    stats: watch ? 'none' : 'errors-warnings',
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    externals: node
      ? nodeExternals({ allowlist: [/^webpack\/hot/, ASSETS_RE] })
      : undefined,
    entry: {
      main: (node
        ? [
            'source-map-support/register',
            watch && 'webpack/hot/signal',
            'dotenv-flow/config',
            './src/node',
          ]
        : [dev && watch && 'webpack-plugin-serve/client', './src/browser']
      ).filter(Boolean),
    },
    output: {
      chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      crossOriginLoading: watch ? 'anonymous' : undefined,
      devtoolModuleFilenameTemplate: node
        ? path.relative(BUILD_ROOT, '[resource-path]')
        : undefined,
      filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      libraryTarget: node ? 'commonjs' : undefined,
      path: node ? BUILD_ROOT : PUBLIC_ROOT,
      publicPath: watch ? 'http://localhost:8081/' : '/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve('src'),
          loader: 'babel-loader',
          options: {
            caller: { watch },
            envName: dev ? 'development' : 'production',
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
          test: ASSETS_RE,
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
      watch && new FriendlyErrorsWebpackPlugin(),
      watch && node && new webpack.HotModuleReplacementPlugin(),
      dev &&
        watch &&
        !node &&
        new ReactRefreshWebpackPlugin({ overlay: { sockIntegration: 'wps' } }),
      watch &&
        node &&
        new RunScriptWebpackPlugin({
          name: 'main.js',
          nodeArgs: ['--inspect=9229'],
          signal: true,
        }),
      watch &&
        !node &&
        new WebpackPluginServe({
          client: { retry: true },
          hmr: dev ? 'refresh-on-failure' : false,
          log: { level: 'warn' },
          port: 8081,
          static: [PUBLIC_ROOT],
          waitForBuild: true,
          middleware: (app, builtins) =>
            builtins.headers({ 'Access-Control-Allow-Origin': '*' }),
        }),
      !node &&
        new AssetsPlugin({
          entrypoints: true,
          includeAuxiliaryAssets: true,
          path: BUILD_ROOT,
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
      minimizer: [
        '...',
        new CssMinimizerPlugin({ minimizerOptions: { preset: ['advanced'] } }),
      ],
      runtimeChunk: 'single',
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

module.exports = (env, argv) => {
  return argv.mode
    ? [
        makeConfig({
          dev: argv.mode === 'development',
          node: false,
          watch: argv.watch,
        }),
        makeConfig({
          dev: argv.mode === 'development',
          node: true,
          watch: argv.watch,
        }),
      ]
    : [
        makeConfig({ dev: false, node: false, watch: false }),
        makeConfig({ dev: false, node: false, watch: true }),
        makeConfig({ dev: false, node: true, watch: false }),
        makeConfig({ dev: false, node: true, watch: true }),
        makeConfig({ dev: true, node: false, watch: false }),
        makeConfig({ dev: true, node: false, watch: true }),
        makeConfig({ dev: true, node: true, watch: false }),
        makeConfig({ dev: true, node: true, watch: true }),
      ];
};
