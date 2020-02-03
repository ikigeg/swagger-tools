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
      library: ['SwaggerTools', 'specs'],
      libraryTarget: 'umd',
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

// console.log('----->', config);

module.exports = config;

/*
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
  else if(typeof exports === 'object') {
    console.log('here');
    exports["SwaggerTools"] = factory();
  }
	else {
    (root.SwaggerTools || (root.SwaggerTools = {})).specs = factory()
		root["SwaggerTools"] = factory();
  }
})(window, function() {
*/
