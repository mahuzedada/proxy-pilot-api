const { join } = require('path');
const { options, appName, appsDirectoryPath } = require('./ecosystem.config');

module.exports = {
  apps: [
    {
      name: appName,
      script: './dist/src/main.js',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],

  deploy: {
    production: {
      ...options,
      host: 'procamp-dev',
      ref: 'origin/main',
      'post-deploy': `${options['post-deploy']} && chmod +x ./script.sh && pm2 reload ecosystem.dev.config.js`,
      path: join(appsDirectoryPath, appName),
    },
  },
};
