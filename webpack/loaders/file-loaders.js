module.exports = [
  {
    loader: 'file-loader',
    options: {
      name: '[path][name].[ext]',
      outputPath: file => file.split('src/')[1]
    }
  }
];

