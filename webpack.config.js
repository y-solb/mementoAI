const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.jsx', // 진입 파일
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // 빌드 파일
    publicPath: '/mementoAI'
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader', //
        options: {
          presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]]
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'] // 확장자 설정 추가, 확장자 없이 import 할 수 있도록
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ]
};
