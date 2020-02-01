const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'swagger-tools': './src/index.js',
    'test-browser-1_2': './test/1.2/test-specs.js',
    'test-browser-2_0': './test/2.0/test-specs.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  node: {
    fs: 'empty',
  },
};
