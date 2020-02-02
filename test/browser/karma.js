const { Server: KarmaServer } = require('karma');
const path = require('path');
const fs = require('fs');

const DIST = path.resolve(path.join(__dirname, '..', '..', 'dist'));
const TEST_BROWSER_1_2 = 'test-browser-1_2.js';
const TEST_BROWSER_2_0 = 'test-browser-2_0.js';
const SWAGGER_TOOLS_STANDALONE = 'swagger-tools-standalone.js';

const karmaTest = async (standalone, version) => {
  const configFile = path.join(
    __dirname,
    `karma-${(standalone ? 'standalone' : 'bower')}-${version.replace('.', '_')}.conf.js`
  );

  await new Promise((resolve, reject) =>
    new KarmaServer(
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

const copyFile = (source, dest) => {
  return new Promise((resolve, reject) => {
    return fs.copyFile(source, dest, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

async function runTests() {
  await copyFile(path.join(DIST, TEST_BROWSER_1_2), path.join(__dirname, TEST_BROWSER_1_2));
  await copyFile(path.join(DIST, TEST_BROWSER_2_0), path.join(__dirname, TEST_BROWSER_2_0));
  await copyFile(path.join(DIST, SWAGGER_TOOLS_STANDALONE), path.join(__dirname, SWAGGER_TOOLS_STANDALONE));
  // copy them to this __dirname
  await karmaTest(true, '1.2'); // karma-standalone-1_2.conf.js karma-standalone-1_2.conf.js
}

try {
  runTests();
} catch (err) {
  console.log('Karma test failed', err);
  process.exit(1);
}


// console.log(__dirname)
// console.log('distFolder', distFolder);