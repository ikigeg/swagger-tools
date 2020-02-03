const merge = require('webpack-merge');
const common = require('./common.config');

const config = merge([
  common,
  {
    entry: {
      'swagger-tools': './src/index.js',
    },
    output: {
      filename: '[name]-standalone.js',
      chunkFilename: 'swagger-tools-standalone.vendors.js',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },
  },
]);

console.log('----->', config);

module.exports = config;
