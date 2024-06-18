const { merge } = require('webpack-merge');
const common = require('./webpack.config');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: '/mementoAI'
  }
});
