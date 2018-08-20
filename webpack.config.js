var webpack = require('webpack');
var path = require('path');

module.exports = [{
    mode: 'development',
    target: 'web',
    entry: {
        frontend: './umodel/index.js'
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
                exclude: /node_modules/,
                options: {
                    presets: ['env']
                }
            }
        ]
    },
    devtool: 'eval-cheap-module-source-map',
}];