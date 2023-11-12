const { join } = require('path');
const { options, appName, appsDirectoryPath } = require('./ecosystem.config');

module.exports = {
  apps: [
    {
      name: appName,
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      ...options,
      host: 'afro-proxy',
      ref: 'origin/main',
      'post-deploy': `${options['post-deploy']} && pm2 reload ecosystem.prod.config.js`,
      path: join(appsDirectoryPath, appName),
    },
  },
};
