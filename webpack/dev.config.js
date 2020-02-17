const merge = require('webpack-merge');
const common = require('./common.config');

// eslint-disable-next-line no-console
console.log('not working :(');
process.exit(1);

module.exports = merge([
  common,
  {
    output: {
      chunkFilename: '[name].bundle.js',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            // test: /[\\/]node_modules[\\/](async|js-yaml|lodash|spark-md5|traverse|z-schema|path-to-regexp|json-refs)[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },
  },
]);
