const { Server: KarmaServer } = require('karma');
const path = require('path');

const karmaTest = async standalone => {
  const configFile = path.join(
    __dirname,
    'test/browser/karma-' +
    (standalone ? 'standalone' : 'bower') +
    '.conf.js'
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

karmaTest('standalone')