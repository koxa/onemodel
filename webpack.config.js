var webpack = require('webpack');
var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = [
    {
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
        //devtool: 'eval-cheap-module-source-map',
    }, {
        mode: 'development',
        target: 'web',
        entry: {
            index: './src/index.js'
        },
        output: {
            library: 'OneModel',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            path: path.resolve('dist'),
            filename: 'onemodel.umd.dev.js'
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
        devtool: ''
        //externals: [nodeExternals()]
    }, {
        mode: 'production',
        target: 'web',
        entry: {
            index: './src/index.js'
        },
        output: {
            library: 'OneModel',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            path: path.resolve('dist'),
            filename: 'onemodel.umd.js'
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
        devtool: ''
        //externals: [nodeExternals()]
    },
    {
        mode: 'development',
        target: 'node',
        entry: {
            index: './src/index.js'
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve('dist'),
            filename: 'onemodel.common.dev.js'
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
        devtool: ''
        //externals: [nodeExternals()]
    },
    {
        mode: 'production',
        target: 'node',
        entry: {
            index: './src/index.js'
        },
        output: {
            libraryTarget: 'commonjs2',
            path: path.resolve('dist'),
            filename: 'onemodel.common.js'
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
        devtool: ''
        //externals: [nodeExternals()]
    }
];