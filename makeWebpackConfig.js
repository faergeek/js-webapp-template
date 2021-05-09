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

const ASSETS_RE = /\.(svg|png|gif|jpe?g|eot|ttf|woff2?)$/;

function makeConfig({
  deps,
  dev,
  entry,
  name,
  node,
  paths,
  reactRefresh,
  watch,
}) {
  const babelPlugins = [];
  const plugins = [new WebpackBar({ name })];

  if (!node) {
    plugins.push(
      new AssetsPlugin({
        entrypoints: true,
        includeAuxiliaryAssets: true,
        path: paths.build,
        prettyPrint: dev,
      }),
      new MiniCssExtractPlugin({
        filename: watch ? '[name].css' : '[name].[contenthash].css',
      })
    );
  }

  if (watch) {
    plugins.push(new FriendlyErrorsWebpackPlugin({ clearConsole: false }));

    if (node) {
      plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new RunScriptWebpackPlugin({
          name: 'main.js',
          nodeArgs: ['--inspect=9229'],
          signal: true,
        })
      );
    } else {
      if (dev) {
        if (reactRefresh) {
          babelPlugins.push('react-refresh/babel');

          plugins.push(
            new (require('@pmmmwh/react-refresh-webpack-plugin'))({
              overlay: { sockIntegration: 'wps' },
            })
          );
        }
      } else {
        plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: false }));
      }

      plugins.push(
        new WebpackPluginServe({
          client: { retry: true },
          hmr: dev ? 'refresh-on-failure' : false,
          log: { level: 'warn' },
          port: 8081,
          static: [paths.public],
          waitForBuild: true,
          middleware: (app, builtins) =>
            builtins.headers({ 'Access-Control-Allow-Origin': '*' }),
        })
      );
    }
  }

  return {
    name,
    dependencies: deps,
    target: node
      ? 'node'
      : dev
      ? 'browserslist:development'
      : 'browserslist:production',
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
            entry,
          ]
        : [dev && watch && 'webpack-plugin-serve/client', entry]
      ).filter(Boolean),
    },
    output: {
      chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      crossOriginLoading: watch ? 'anonymous' : undefined,
      devtoolModuleFilenameTemplate: node
        ? path.relative(paths.build, '[resource-path]')
        : undefined,
      filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      libraryTarget: node ? 'commonjs' : undefined,
      path: node ? paths.build : paths.public,
      publicPath: watch ? 'http://localhost:8081/' : '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          include: paths.src,
          loader: 'babel-loader',
          options: {
            envName: dev ? 'development' : 'production',
            plugins: babelPlugins,
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
    plugins,
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

function makeWebpackConfig({ dev, entry, paths, reactRefresh, watch }) {
  return [
    makeConfig({
      dev,
      entry: entry.browser,
      name: 'browser',
      node: false,
      paths,
      reactRefresh,
      watch,
    }),
    makeConfig({
      deps: ['browser'],
      dev,
      entry: entry.node,
      name: 'node',
      node: true,
      paths,
      reactRefresh,
      watch,
    }),
  ];
}

module.exports = makeWebpackConfig;
