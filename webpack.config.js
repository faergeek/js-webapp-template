const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const packageJson = require('./package.json');

const BROWSER_OUTPUT_PATH = path.join(__dirname, 'public', '_assets');
const NODE_OUTPUT_PATH = path.join(__dirname, 'dist');
const REPORTS_OUTPUT_PATH = path.join(__dirname, 'reports');

module.exports = ({ dev = false, node = false } = {}) =>
  new SpeedMeasurePlugin().wrap({
    mode: dev ? 'development' : 'production',
    devtool: dev && !node ? 'eval-source-map' : 'source-map',
    target: node ? 'node' : 'web',
    stats: 'minimal',

    entry: {
      main: (node
        ? [dev && 'webpack/hot/poll?1000', './src/node']
        : [dev && 'webpack-hot-middleware/client?reload=true', './src/browser']
      ).filter(Boolean)
    },

    output: {
      path: node ? NODE_OUTPUT_PATH : BROWSER_OUTPUT_PATH,
      filename: `[name]${dev || node ? '' : '.[chunkhash]'}.js`,
      chunkFilename: `[name]${dev || node ? '' : '.[chunkhash]'}.js`,
      publicPath: '/_assets/',
      devtoolModuleFilenameTemplate: node ? '../[resource-path]' : undefined
    },

    node: node
      ? {
          Buffer: false,
          __filename: false,
          __dirname: false,
          console: false,
          global: false,
          process: false,
          setImmediate: false
        }
      : undefined,

    externals: node
      ? (_context, request, cb) => {
          if (
            ([
              ...Object.keys(packageJson.dependencies),
              ...Object.keys(packageJson.devDependencies)
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
          use: 'source-map-loader'
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
                    targets: node ? { node: 'current' } : undefined
                  }
                ]
              ]
            }
          }
        },

        {
          test: /\.css$/,
          use: node
            ? 'null-loader'
            : [
                {
                  loader: MiniCssExtractPlugin.loader,

                  options: {
                    hmr: dev,
                    reloadAll: true
                  }
                },

                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1
                  }
                },

                'postcss-loader'
              ]
        },

        {
          test: /\.(svg|png|gif|jpe?g|eot|ttf|woff2?)$/,
          loader: 'url-loader',
          options: {
            emitFile: !node,
            name: dev ? '[name].[ext]' : '[name].[hash].[ext]',
            limit: 4000
          }
        }
      ]
    },

    plugins: [
      new Dotenv({ systemvars: true }),
      process.stdout.isTTY && new SimpleProgressWebpackPlugin(),
      dev && new webpack.HotModuleReplacementPlugin(),

      node &&
        new webpack.BannerPlugin({
          banner: "require('source-map-support').install();",
          raw: true,
          entryOnly: false
        }),

      node
        ? new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
            analyzerMode: dev ? 'server' : 'static',
            analyzerPort: 8081,
            openAnalyzer: false,

            reportFilename: path.relative(
              NODE_OUTPUT_PATH,
              path.join(REPORTS_OUTPUT_PATH, 'node-bundle.html')
            )
          })
        : new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
            analyzerMode: dev ? 'server' : 'static',
            analyzerPort: 8082,
            openAnalyzer: false,

            reportFilename: path.relative(
              BROWSER_OUTPUT_PATH,
              path.join(REPORTS_OUTPUT_PATH, 'browser-bundle.html')
            )
          }),

      !node &&
        !dev &&
        new (require('webpack-manifest-plugin'))({
          fileName: path.relative(
            BROWSER_OUTPUT_PATH,
            path.join(NODE_OUTPUT_PATH, 'manifest.json')
          )
        }),

      !node && !dev && new webpack.HashedModuleIdsPlugin(),

      !node &&
        new MiniCssExtractPlugin({
          filename: dev ? '[name].css' : '[name].[contenthash].css'
        })
    ].filter(Boolean),

    optimization: {
      noEmitOnErrors: true,

      minimizer: [
        new OptimizeCSSAssetsPlugin(),

        new TerserPlugin({
          extractComments: true,
          parallel: true,
          sourceMap: true
        })
      ]
    }
  });
