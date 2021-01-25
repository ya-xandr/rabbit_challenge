const { Worker } = require('worker_threads');
const path = require('path');
// eslint-disable-next-line no-unused-vars
const backtracking = require('./backtracking');

const WORKERS_NUMBER = 4;

const runTask = (workerData) => new Promise((resolve, reject) => {
  const worker = new Worker(path.join(__dirname, 'worker.js'), { workerData });
  worker.on('message', resolve);
  worker.on('error', reject);
  worker.on('exit', (code) => {
    if (code !== 0) { reject(new Error(`Worker stopped with exit code ${code}`)); }
  });
});

const convertPraseToCharPool = (phrase) => {
  const charList = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const char of phrase) {
    if (![' ', "'"].includes(char)) {
      if (Object.prototype.hasOwnProperty.call(charList, char)) {
        charList[char] += 1;
      } else {
        charList[char] = 1;
      }
    }
  }
  return charList;
};

const findAnagrams = async (anagram, matches, wordlist) => {
  const pool = [];
  const charPool = convertPraseToCharPool(anagram);
  const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * wordlist.length);
  const semaphores = new Int32Array(sab);
  for (let i = 0; i < semaphores.length; i += 1) {
    semaphores[i] = i;
  }
  for (let i = 0; i < WORKERS_NUMBER; i += 1) {
    pool.push(runTask({
      workerNumber: i,
      charPool,
      matches,
      wordlist,
      semaphores,
    }));
  }
  const results = await Promise.all(pool);

  // const results = backtracking(wordlist, charPool, matches);

  return results;
};

module.exports = {
  findAnagrams,
};
