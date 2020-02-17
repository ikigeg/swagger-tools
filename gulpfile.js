/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Apigee Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const path = require('path');
const del = require('del');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const exposify = require('exposify');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const karma = require('karma');

const folders = {
  build: path.join(__dirname, 'browser'),
  test: path.join(__dirname, 'test'),
  vendor: path.join(__dirname, 'test', 'vendor'),
};

let runningAllTests = false;

function displayCoverageReport(display) {
  if (display) {
    gulp.src([]).pipe($.istanbul.writeReports());
  }
}

gulp.task('browserify-swagger', async () => {
  const bundle = ({ isStandalone, useDebug }) =>
    new Promise((resolve, reject) => {
      const b = browserify('./src/lib/specs.js', {
        debug: useDebug,
        standalone: 'SwaggerTools.specs',
      });

      if (!isStandalone) {
        // Expose Bower modules so they can be required
        exposify.config = {
          async: 'async',
          debug: 'debug',
          'json-refs': 'JsonRefs',
          'js-yaml': 'jsyaml',
          lodash: '_',
          'spark-md5': 'SparkMD5',
          'swagger-converter': 'SwaggerConverter.convert',
          traverse: 'traverse',
          'z-schema': 'ZSchema',
        };

        b.transform('exposify');
      }

      b.bundle()
        .pipe(
          source(
            'swagger-tools' +
            (isStandalone ? '-standalone' : '') +
            (!useDebug ? '-min' : '') +
            '.js'
          )
        )
        .pipe($.if(!useDebug, buffer()))
        .pipe($.if(!useDebug, $.uglify()))
        .pipe(gulp.dest('browser/'))
        .on('error', reject)
        .on('end', resolve);
    });
  
  await del(['./browser/swagger-tools*.js']);

  await bundle({ isStandalone: true, useDebug: true });
  await bundle({ isStandalone: true, useDebug: false });
  await bundle({ isStandalone: false, useDebug: true });
  await bundle({ isStandalone: false, useDebug: false });
});

gulp.task('browserify-tests', async () => {
  const bundle = version => new Promise((resolve, reject) => {
    const b = browserify([path.join(folders.test, version, 'test-specs.js')], {
      debug: true,
    });

    return b.bundle()
      .pipe(source(`test-browser-${version.replace('.', '_')}.js`))
      .pipe(gulp.dest(folders.build))
      .on('error', reject)
      .on('end', resolve);
  });

  await del([path.join(folders.build, 'test*.js')]);

  await bundle('1.2');
  await bundle('2.0');
});

gulp.task('lint', function () {
  return gulp
    .src([
      './bin/swagger-tools',
      './index.js',
      './src/lib/**/*.js',
      './src/middleware/helpers.js',
      './src/middleware/swagger-*.js',
      './test/**/*.js',
      './gulpfile.js',
      '!./src/middleware/swagger-ui/**/*.js',
      '!./test/**/test-specs-browser.js',
      '!./test/browser/vendor/*.js',
    ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('eslint', function () {
  return gulp
    .src([
      './bin/swagger-tools',
      './index.js',
      './src/lib/**/*.js',
      './src/middleware/helpers.js',
      './src/middleware/swagger-*.js',
      './test/**/*.js',
      './gulpfile.js',
      '!./src/middleware/swagger-ui/**/*.js',
      '!./test/**/test-specs-browser.js',
      '!./test/browser/vendor/*.js',
    ])
    .pipe($.prettierPlugin())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('test-node', function () {
  return new Promise(function (resolve, reject) {
    gulp
      .src([
        './index.js',
        './src/lib/**/*.js',
        './src/middleware/helpers.js',
        './src/middleware/swagger-*.js',
        '!./src/middleware/swagger-ui/**/*.js',
        '!./test/**/test-specs-browser.js',
      ])
      .pipe($.istanbul())
      .pipe($.istanbul.hookRequire()) // Force `require` to return covered files
      .on('finish', function () {
        gulp
          .src(['./test/**/test-*.js', '!./test/**/test-specs-browser.js'])
          .pipe($.mocha({ reporter: 'spec', timeout: 5000 }))
          .on('error', function (err) {
            reject(err);
          })
          .on('end', function () {
            displayCoverageReport(!runningAllTests);

            resolve();
          });
      });
  });
});

gulp.task('test-browser', ['browserify-swagger', 'browserify-tests'], async () => {
  const finisher = async err => {
    await del([path.join(folders.build, 'test*.js')]);

    displayCoverageReport(runningAllTests);
    if (err) {
      console.log('Finisher error:', err);
    }
    return err;
  };

  const karmaTest = configFile => {
    return new Promise((resolve, reject) =>
      new karma.Server(
        {
          configFile,
          singleRun: true,
        },
        err => {
          if (err) {
            return reject(err);
          }
          return resolve();
        }
      ).start());
  };

  const runTest = async ({ version, standalone }) => {
    const configFile = path.join(
      folders.test, version, `karma-${standalone ? 'standalone' : 'bower'}.conf.js`
    );
    return karmaTest(configFile);
  };
  
  try {
    await runTest({ version: '1.2', standalone: false });
    // await runTest({ version: '1.2', standalone: true });
    // await runTest({ version: '2.0', standalone: false });
    // await runTest({ version: '2.0', standalone: true });
    // await finisher();
  } catch (err) {
    await finisher(err);
  }
});

gulp.task('test', function (cb) {
  runningAllTests = true;

  // Done this way to ensure that test-node runs prior to test-browser.  Since both of those tasks are independent,
  // doing this 'The Gulp Way' isn't feasible.

  runSequence('test-node', 'test-browser', cb);
});

// gulp.task('default', ['eslint', 'test']);
gulp.task('default', ['lint', 'test']);
