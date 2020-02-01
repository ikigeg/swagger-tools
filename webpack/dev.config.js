module.exports = {
  mode: 'development',
  optimization: {
    minimize: false
  },
  devtool: 'inline-source-map',
  entry: {
    'swagger-tools': './src/index.js',
    'test-browser-1_2': './test/1.2/test-specs.js',
    'test-browser-2_0': './test/2.0/test-specs.js'
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  // optimization: {
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     cacheGroups: {
  //     vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         enforce: true,
  //         chunks: 'all'
  //       }
  //     }
  //   }
  // },
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
  node: {
    fs: 'empty',
  },
};
