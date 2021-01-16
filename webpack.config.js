const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

const packageJson = require('./package.json');

const BROWSER_OUTPUT_PATH = path.resolve('public', '_assets');
const NODE_OUTPUT_PATH = path.resolve('dist');

module.exports = ({ dev = false, node = false } = {}) => ({
  mode: dev ? 'development' : 'production',
  devtool: dev && !node ? 'inline-source-map' : 'source-map',
  target: node ? 'node' : 'web',
  stats: 'minimal',

  entry: {
    main: (node
      ? [
          'source-map-support/register',
          dev && 'webpack/hot/poll?1000',
          './src/node',
        ]
      : [dev && 'webpack-hot-middleware/client?reload=true', './src/browser']
    ).filter(Boolean),
  },

  output: {
    path: node ? NODE_OUTPUT_PATH : BROWSER_OUTPUT_PATH,
    filename: `[name]${dev || node ? '' : '.[contenthash]'}.js`,
    chunkFilename: `[name]${dev || node ? '' : '.[contenthash]'}.js`,
    publicPath: '/_assets/',
    devtoolModuleFilenameTemplate: node
      ? path.relative(NODE_OUTPUT_PATH, '[resource-path]')
      : undefined,
  },

  externals: node
    ? ({ request }, cb) => {
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
        include: [path.resolve('src')],
        use: {
          loader: 'babel-loader',
          options: {
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
    dev && new webpack.HotModuleReplacementPlugin(),

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
