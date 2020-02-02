const merge = require('webpack-merge');
const common = require('./common.config');

module.exports = merge(common, {
  entry: {
    'swagger-tools': './src/index.js',
  },
  output: {
    library: 'SwaggerTools',
    libraryTarget: 'umd',
  },
});
