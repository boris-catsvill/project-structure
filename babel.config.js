module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: '> 3%'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-optional-chaining'
  ]
};
