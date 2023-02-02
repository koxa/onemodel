const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    target: 'web',
    entry: { client: './testapp/client.js' },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      watchFiles: ['src/**/*', 'public/**/*'],
      port: 8080,
    },
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: '[name]-web.js',
    },
    plugins: [new NodePolyfillPlugin()],
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devtool: 'source-map',
  },
  {
    mode: 'development',
    entry: {
      server: './testapp/server.js',
    },
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: '[name].js',
    },
    target: 'node',
    plugins: [new NodePolyfillPlugin()],
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
    devtool: 'source-map',
  },
];
