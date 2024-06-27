const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.jsx', // 진입 파일
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' // 빌드 파일
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader', // Webpack이 번들링하는 과정에서 Babel을 사용하여 최신 JavaScript 및 React 코드를 구형 브라우저에서도 실행 가능하도록 변환
        options: {
          presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]]
        }
        /** @babel/preset-env: 최신 JavaScript 문법을 구형 브라우저에서도 호환되도록 변환
            @babel/preset-react: JSX 문법을 변환하고, React 관련 코드 변환
            { runtime: 'automatic' }: React 17부터 도입된 자동 JSX 런타임을 사용하여 import React from 'react'; 구문을 생략할 수 있음 
        **/
      },
      {
        test: /\.html$/,
        loader: 'html-loader', // Webpack이 HTML 파일을 로드
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
      template: 'index.html' // 템플릿으로 사용할 HTML 파일 지정
    })
  ]
};
