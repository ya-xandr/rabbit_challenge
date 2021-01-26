const { parentPort } = require('worker_threads');
const logger = require('../logger');

parentPort.on('message', (data) => {
  logger.info(`Inspector starts at: ${(new Date()).toISOString()}`);

  const { port, availableMatches, stats } = data;

  const interval = setInterval(() => {
    port.postMessage({ log: JSON.stringify(availableMatches) });
    port.postMessage({ log: `anangram sets produced: ${stats[0]}, permutations made: ${stats[1]}` });
    if (availableMatches.every((item) => item === -1)) {
      clearInterval(interval);
    }
  }, 60000);

  port.postMessage({ inspector: 'Stop' });
});
