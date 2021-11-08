const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    publicPath: '/' + process.env.URL_PATH || '',
    path: path.resolve(__dirname, '../build')
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      // include all types of chunks
      chunks: 'all'
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ]
  },
  plugins: [
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static'
    })
  ]
});
