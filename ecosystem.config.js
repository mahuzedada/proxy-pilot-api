module.exports = {
  options: {
    user: 'ec2-user',
    port: '22',
    repo: 'git@github.com:mahuzedada/proxy-pilot-api.git',
    'pre-deploy-local': '',
    'post-deploy': 'npm run post-deploy',
  },
  appName: require('./package.json').name,
  appsDirectoryPath: '/home/ec2-user',
};
