require('dotenv/config');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const jsLoaders = require('./loaders/js-loaders');
const cssLoaders = require('./loaders/css-loaders');
const fileLoaders = require('./loaders/file-loaders');

module.exports = {
  target: 'web',
  entry: {
    app: path.join(__dirname, '../src/index.js'),
    styles: path.join(__dirname, '../src/styles/all.css')
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: fileLoaders
      },
      {
        // | svg - add in case when we need load svg font
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: fileLoaders
      },
      {
        test: /\.css$/i,
        use: cssLoaders
      },
      {
        test: /\.(js)?$/,
        use: jsLoaders,
        exclude: [/(node_modules)/]
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          attributes: {
            list: [
              "...",
              {
                tag: "link",
                attribute: "href",
                type: "src"
              }
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.URL_PATH': JSON.stringify(process.env.URL_PATH || ''),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
      'process.env.IMGUR_UPLOAD_URL': JSON.stringify(process.env.IMGUR_UPLOAD_URL),
      'process.env.IMGUR_CLIENT_ID': JSON.stringify(process.env.IMGUR_CLIENT_ID),
      'process.env.LOCALE': JSON.stringify(process.env.LOCALE)
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/index.html')
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  ]
};
