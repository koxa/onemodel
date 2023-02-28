// eslint-disable-next-line no-unused-vars
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = [
  {
    mode: 'production',
    target: 'web',
    entry: {
      index: './src/index.js',
    },
    output: {
      library: 'OneModel',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      path: path.resolve('dist'),
      filename: 'onemodel.umd.js',
    },
    plugins: [
      new NodePolyfillPlugin(),
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
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    // devtool: 'source-map',
    externals: [nodeExternals()],
  },
  {
    mode: 'production',
    target: 'node',
    entry: {
      index: './src/index.js',
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve('dist'),
      filename: 'onemodel.common.js',
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
    // devtool: 'source-map',
    externals: [nodeExternals()],
  },
];
