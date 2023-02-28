const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    target: 'web',
    entry: {
      index: './src/index.js',
    },
    output: {
      library: 'OneModel',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      path: path.resolve('dist'),
      filename: 'onemodel.umd.dev.js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.DefinePlugin({
        'process.env.WEBPACK_TARGET': JSON.stringify('web'),
      }),
    ],
    devtool: 'source-map',
    externals: [nodeExternals()],
  },
  {
    mode: 'development',
    target: 'node',
    entry: {
      index: './src/index.js',
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve('dist'),
      filename: 'onemodel.common.dev.js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /.js?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.WEBPACK_TARGET': JSON.stringify('node'),
      }),
    ],
    devtool: 'source-map',
    externals: [nodeExternals()],
  },
  {
    name: 'client',
    mode: 'development',
    target: 'web',
    entry: {
      client: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './testapp/client.js',
      ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name]-web.js',
      publicPath: '/',
      hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
      hotUpdateMainFilename: '.hot/[hash].hot-update.json',
    },
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.WEBPACK_TARGET': JSON.stringify('web'),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    devtool: 'eval-source-map',
  },
  {
    name: 'server',
    mode: 'development',
    target: 'node',
    entry: {
      server: './testapp/server.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      publicPath: '/',
    },
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.DefinePlugin({
        'process.env.WEBPACK_TARGET': JSON.stringify('node'),
      }),
    ],
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    devtool: 'eval-source-map',
  },
];
