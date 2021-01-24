const bunyan = require('bunyan');
const PrettyStdout = require('./utils/PrettyStdout');
const config = require('../config');

const logger = bunyan.createLogger({
  name: config.appName,
  level: config.logger.level,
  serializers: bunyan.stdSerializers,
  stream: config.isDev ? PrettyStdout : undefined,
});

module.exports = logger;
