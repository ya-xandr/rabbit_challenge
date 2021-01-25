const { workerData, parentPort } = require('worker_threads');
const logger = require('../logger');

logger.info(`Worker #${workerData.workerNumber} starts at: ${Date.now}`);

parentPort.postMessage(workerData.wordlist[workerData.workerNumber]);
