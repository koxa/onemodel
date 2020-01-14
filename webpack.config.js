var webpack = require('webpack');
var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = [{
    mode: 'development',
    target: 'web',
    entry: {
        client: './testapp/index.js'
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'eval-cheap-module-source-map',
},{
    mode: 'production',
    target: 'node',
    entry: {
        index: './src/index.js'
    },
    output: {
        library: 'OneModel',
        libraryTarget: 'umd',
        path: path.resolve('dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    externals: [nodeExternals()]
}];