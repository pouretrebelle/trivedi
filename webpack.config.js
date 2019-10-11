'use strict'

var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  devtool: 'eval-source-map',
  entry: [path.join(__dirname, 'src/main.js')],
  output: {
    path: path.join(__dirname, '/docs/'),
    filename: '[name].js',
    publicPath: '',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
    }),
  ],
  mode: devMode ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.html?$/,
        loaders: ['html-loader'],
      },
    ],
  },
}
