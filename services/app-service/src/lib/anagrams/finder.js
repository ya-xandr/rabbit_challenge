const { Worker, MessageChannel } = require('worker_threads');
const path = require('path');
const config = require('../../config');
const logger = require('../logger');

const WORKERS_NUMBER = config.cpu;

const runInspector = (semaphores, availableMatches, stats) => new Promise((resolve, reject) => {
  const { port1, port2 } = new MessageChannel();
  const worker = new Worker(path.join(__dirname, '..', 'utils/inspector.js'), { });
  port1.on('message', (result) => {
    if (result.log) {
      logger.debug(`State: ${result.log}`);
    } else {
      logger.debug(result);
      resolve(result);
    }
  });
  worker.postMessage({
    port: port2, semaphores, availableMatches, stats,
  }, [port2]);
  worker.on('error', reject);
  worker.on('exit', (code) => {
    if (code !== 0) { reject(new Error(`Worker stopped with exit code ${code}`)); }
  });
});

const runTask = (workerData, semaphores, availableMatches, stats) => new Promise((resolve, reject) => {
  const { port1, port2 } = new MessageChannel();
  const worker = new Worker(path.join(__dirname, 'worker.js'), { workerData });
  port1.on('message', (result) => {
    if (result.log) {
      logger.debug(result.log);
    } else {
      resolve(result);
    }
  });
  worker.postMessage({
    port: port2, semaphores, availableMatches, stats,
  }, [port2]);
  worker.on('error', reject);
  worker.on('exit', (code) => {
    if (code !== 0) { reject(new Error(`Worker stopped with exit code ${code}`)); }
  });
});

const findAnagrams = async (charPool, matches, wordlist) => {
  const pool = [];
  const wordSab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * wordlist.length);
  const semaphores = new Int32Array(wordSab);
  for (let i = 0; i < semaphores.length; i += 1) {
    semaphores[i] = i;
  }
  const matchesSab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * matches.length);
  const availableMatches = new Int32Array(matchesSab);
  for (let i = 0; i < availableMatches.length; i += 1) {
    availableMatches[i] = i;
  }

  const statsSab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
  const stats = new Int32Array(statsSab);
  for (let i = 0; i < availableMatches.length; i += 1) {
    stats[i] = 0;
  }

  const workerData = {
    charPool,
    matches,
    wordlist,
  };

  runInspector(
    semaphores,
    availableMatches,
    stats,
  );

  for (let i = 0; i < WORKERS_NUMBER; i += 1) {
    workerData.workerNumber = i;
    pool.push(
      runTask(
        workerData,
        semaphores,
        availableMatches,
        stats,
      ),
    );
  }

  const workersResults = await Promise.all(pool);

  const phrases = [].concat(...workersResults);
  for (let i = 0; i < availableMatches.length; i += 1) {
    availableMatches[i] = -1;
  }
  return phrases;
};

module.exports = {
  findAnagrams,
};
