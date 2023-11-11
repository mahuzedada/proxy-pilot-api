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
      host: 'ec2-3-138-125-138.us-east-2.compute.amazonaws.com',
      ref: 'origin/main',
      'post-deploy': `${options['post-deploy']} && pm2 reload ecosystem.prod.config.js`,
      path: join(appsDirectoryPath, appName),
    },
  },
};
