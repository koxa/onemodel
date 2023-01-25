const webpack = require("webpack");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = [
  {
    mode: "development",
    target: "web",
    entry: { client: "./testapp/client.js" },
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "[name]-web.js",
    },
    plugins: [new NodePolyfillPlugin()],
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.ts?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    devtool: "source-map",
  },
  {
    mode: "development",
    target: "web",
    entry: {
      index: "./src/index.js",
    },
    output: {
      library: "OneModel",
      libraryTarget: "umd",
      umdNamedDefine: true,
      path: path.resolve("dist"),
      filename: "onemodel.umd.web.dev.js",
    },
    plugins: [new NodePolyfillPlugin()],
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.ts?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    devtool: "source-map",
    externals: [nodeExternals()],
  },
  {
    mode: "production",
    target: "web",
    entry: {
      index: "./src/index.js",
    },
    output: {
      library: "OneModel",
      libraryTarget: "umd",
      umdNamedDefine: true,
      path: path.resolve("dist"),
      filename: "onemodel.umd.web.js",
    },
    plugins: [new NodePolyfillPlugin()],
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.ts?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    devtool: "source-map",
    externals: [nodeExternals()],
  },
  {
    mode: "development",
    target: "node",
    entry: {
      index: "./src/index.js",
    },
    output: {
      libraryTarget: "commonjs2",
      path: path.resolve("dist"),
      filename: "onemodel.common.node.dev.js",
    },
    module: {
      rules: [
        {
          test: /.js?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /.ts?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    devtool: "source-map",
    externals: [nodeExternals()],
  },
  {
    mode: "production",
    target: "node",
    entry: {
      index: "./src/index.js",
    },
    output: {
      libraryTarget: "commonjs2",
      path: path.resolve("dist"),
      filename: "onemodel.common.node.js",
    },
    module: {
      rules: [
        {
          test: /.js?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /.ts?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      concatenateModules: true,
    },
    devtool: "source-map",
    externals: [nodeExternals()],
  },
];
