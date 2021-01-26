const { workerData, parentPort } = require('worker_threads');
const logger = require('../logger');
const backtracking = require('./backtracking');

parentPort.on('message', (data) => {
  const {
    workerNumber, wordlist, matches, charPool,
  } = workerData;

  logger.info(`Worker #${workerNumber} starts at: ${(new Date()).toISOString()}`);

  const {
    port, semaphores, availableMatches, stats,
  } = data;

  const result = backtracking(wordlist, charPool, matches, semaphores, availableMatches, workerNumber, port, stats);

  port.postMessage(result);
});
