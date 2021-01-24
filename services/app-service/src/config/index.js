const environment = process.env.NODE_ENV || 'development';
// eslint-disable-next-line import/no-dynamic-require
const envConfigs = require(`./${environment}.json`);

const isDev = ['docker-dev'].includes(environment);

const sharedConfigs = {
  appName: 'app-service',
  port: 3000,
  logger: {
    level: isDev ? 'debug' : 'info',
  },
  isDev,
  environment,
};

module.exports = { ...sharedConfigs, ...envConfigs };
