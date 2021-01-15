const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const webpack = require('webpack');

const packageJson = require('./package.json');

const BROWSER_OUTPUT_PATH = path.join(__dirname, 'public', '_assets');
const NODE_OUTPUT_PATH = path.join(__dirname, 'dist');
const REPORTS_OUTPUT_PATH = path.join(__dirname, 'reports');

module.exports = ({ dev = false, node = false } = {}) => ({
  mode: dev ? 'development' : 'production',
  devtool: dev && !node ? 'inline-source-map' : 'source-map',
  target: node ? 'node' : 'web',
  stats: 'minimal',

  entry: {
    main: (node
      ? [dev && 'webpack/hot/poll?1000', './src/node']
      : [dev && 'webpack-hot-middleware/client?reload=true', './src/browser']
    ).filter(Boolean),
  },

  output: {
    path: node ? NODE_OUTPUT_PATH : BROWSER_OUTPUT_PATH,
    filename: `[name]${dev || node ? '' : '.[chunkhash]'}.js`,
    chunkFilename: `[name]${dev || node ? '' : '.[chunkhash]'}.js`,
    publicPath: '/_assets/',
    devtoolModuleFilenameTemplate: node ? '../[resource-path]' : undefined,
  },

  node: node
    ? {
        __filename: false,
        __dirname: false,
        global: false,
      }
    : undefined,

  externals: node
    ? (_context, request, cb) => {
        if (
          ([
            ...Object.keys(packageJson.dependencies),
            ...Object.keys(packageJson.devDependencies),
          ].some(packageName => request.startsWith(packageName)) &&
            !request.startsWith('webpack/hot')) ||
          /webpack\.config$/.test(request)
        ) {
          cb(null, `commonjs ${request}`);
        } else {
          cb();
        }
      }
    : undefined,

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'source-map-loader',
      },

      {
        test: /\.js$/,
        include: [path.join(__dirname, 'src')],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,

            presets: [
              [
                '@babel/preset-env',
                {
                  corejs: 3,
                  loose: true,
                  modules: false,
                  useBuiltIns: 'usage',
                  targets: node ? { node: 'current' } : undefined,
                },
              ],
            ],
          },
        },
      },

      {
        test: /\.css$/,
        use: node
          ? 'null-loader'
          : [
              MiniCssExtractPlugin.loader,
              { loader: 'css-loader', options: { importLoaders: 1 } },
              'postcss-loader',
            ],
      },
    ],
  },

  plugins: [
    new Dotenv({ systemvars: true }),
    process.stdout.isTTY && new SimpleProgressWebpackPlugin(),
    dev && new webpack.HotModuleReplacementPlugin(),

    node &&
      new webpack.BannerPlugin({
        banner: "require('source-map-support').install();",
        raw: true,
        entryOnly: false,
      }),

    node
      ? new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: dev ? 'server' : 'static',
          analyzerPort: 8081,
          openAnalyzer: false,

          reportFilename: path.relative(
            NODE_OUTPUT_PATH,
            path.join(REPORTS_OUTPUT_PATH, 'node-bundle.html')
          ),
        })
      : new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: dev ? 'server' : 'static',
          analyzerPort: 8082,
          openAnalyzer: false,

          reportFilename: path.relative(
            BROWSER_OUTPUT_PATH,
            path.join(REPORTS_OUTPUT_PATH, 'browser-bundle.html')
          ),
        }),

    !node &&
      !dev &&
      new (require('webpack-manifest-plugin').WebpackManifestPlugin)({
        fileName: path.relative(
          BROWSER_OUTPUT_PATH,
          path.join(NODE_OUTPUT_PATH, 'manifest.json')
        ),
      }),

    !node &&
      new MiniCssExtractPlugin({
        filename: dev ? '[name].css' : '[name].[contenthash].css',
      }),
  ].filter(Boolean),

  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
  },
});
