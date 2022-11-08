const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  // output: {
  //   filename: 'assets/js/[name].[fullhash].bundle.js',
  //   // path: outputPath,
  //   publicPath: '/',
  //   clean: true,
  //   path: path.resolve(__dirname, '../build')
  //   // assetModuleFilename: ${appFolder && `${appFolder}/`}assets/[name][ext],
  // },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  }
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     template: path.join(__dirname, '../src/index.html'),
  //     inject: true,
  //     minify: true,
  //     publicPath: '/'
  //     // env: {
  //     //   dev: true,
  //     //   rc: false,
  //     //   prod: false,
  //     // },
  //   })
  // ]
});
