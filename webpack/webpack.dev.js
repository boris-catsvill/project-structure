const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    port: 9002,
    hot: true,
    compress: true,
    publicPath: '/',
    contentBase: path.join(__dirname, '../dist'),
    historyApiFallback: true,
    writeToDisk: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL,
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(__dirname, '../dist')
      ]
    })
  ]
});
