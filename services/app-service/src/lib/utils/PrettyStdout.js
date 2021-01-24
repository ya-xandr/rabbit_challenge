const { isJSON } = require('./string');

const ANSI_COLORS = {
  debug: '\x1b[0;35m',
  info: '\x1b[0;36m',
  warn: '\x1b[0;33m',
  error: '\x1b[0;31m',
  fatal: '\x1b[1;41m',
  reset: '\x1b[0m',
};
const levelNameFromCode = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

const formatAuditLogs = (record) => {
  const { method, url } = record.req;
  const { statusCode } = record.res;
  const result = record;
  result.msg = `${method} ${url} - ${statusCode} ${record.latency}ms`;
  return result;
};

const getLevelColor = (record) => {
  const levelName = levelNameFromCode[record.level] || 'info';
  return ANSI_COLORS[levelName] || '';
};

const write = (raw) => {
  let record = isJSON(raw) ? JSON.parse(raw) : raw;
  if (record.audit) {
    record = formatAuditLogs(record);
  }
  const color = getLevelColor(record);
  process.stdout.write(
    `${color
    }[${record.hostname}]`
      + `${ANSI_COLORS.reset}   `
      + `${new Date(record.time).toLocaleString()}`
      + `${ANSI_COLORS.reset}   ${
        color
      }${record.msg}${
        ANSI_COLORS.reset
      }\n`,
  );
};

module.exports = {
  write,
};
