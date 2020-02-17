const karma = require('karma');
const path = require('path');

process.env.BUILD_DIR = 'dist';
process.env.MINIFIED = 'false';

const karmaTest = async ({ standalone, version }) => {
  const configFile = path.join(
    __dirname,
    version,
    `karma-${(standalone ? 'standalone' : 'bower')}.conf.js`
  );

  await new Promise((resolve, reject) =>
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

async function runTests() {
  // Test our development version
  await karmaTest({ standalone: true, version: '1.2' });
  // await karmaTest({ standalone: false, version: '1.2' });
  await karmaTest({ standalone: true, version: '2.0' });
  // await karmaTest({ standalone: false, version: '2.0' });

  // Test our production minified version
  process.env.MINIFIED = 'true';
  await karmaTest({ standalone: true, version: '1.2' });
  // await karmaTest({ standalone: false, version: '1.2' });
  await karmaTest({ standalone: true, version: '2.0' });
  // await karmaTest({ standalone: false, version: '2.0' });
}

try {
  runTests();
} catch (err) {
  console.log('Karma test failed', err);
  process.exit(1);
}
