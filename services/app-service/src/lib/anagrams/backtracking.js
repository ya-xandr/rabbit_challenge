/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const md5 = require('md5');

const factorials = {
  1: 1,
  2: 2,
  3: 6,
  4: 24,
  5: 120,
  6: 720,
  7: 5040,
  8: 40320,
  9: 362880,
  10: 3628800,
  11: 39916800,
  12: 479001600,
  13: 6227020800,
  14: 87178291200,
  15: 1307674368000,
  16: 20922789888000,
  17: 355687428096000,
  18: 6402373705728000,
  19: 121645100408832000,
  20: 2432902008176640000,
  21: 51090942171709440000,
  22: 1124000727777607680000,
  23: 25852016738884976640000,
  24: 620448401733239439360000,
  25: 15511210043330985984000000,
};

const results = [];

const findMatches = (hash, matches, availableMatches) => availableMatches.findIndex(
  (item) => item !== -1 && matches[item] === hash,
);

// eslint-disable-next-line no-unused-vars
const permutator = (inputArr, matches, availableMatches, port) => {
  // eslint-disable-next-line consistent-return
  const permute = (arr, memo = []) => {
    if (matches.length === 0) {
      return;
    }
    if (arr.length === 0) {
      const phrase = memo.join(' ');
      const matchIndex = findMatches(md5(phrase), matches, availableMatches);
      if (matchIndex > -1) {
        results.push(phrase);
        Atomics.store(availableMatches, matchIndex, -1);
        port.postMessage({ log: `complete phrase for matchIndex ${matchIndex}: ${phrase} ` });
      }
    }
    for (let i = 0; i < arr.length; i += 1) {
      const curr = arr.slice();
      const next = curr.splice(i, 1);
      permute(curr.slice(), memo.concat(next));
    }
  };

  permute(inputArr);
};

function backtracking(
  wordlist, charPool, matches,
  result, semaphores, availableMatches,
  workerNumber, port, stats, minIndex,
) {
  if (availableMatches.every((item) => item === -1)) {
    return;
  }
  let completeAnagram = true;
  for (const char in charPool) {
    if (Object.hasOwnProperty.call(charPool, char) && charPool[char] > 0) {
      completeAnagram = false;
      break;
    }
  }
  if (completeAnagram) {
    Atomics.add(stats, 0, 1);
    permutator(result, matches, availableMatches, port);
    Atomics.add(stats, 1, factorials[result.length]);
  }
  for (; minIndex < wordlist.length; minIndex += 1) {
    if (Atomics.compareExchange(semaphores, minIndex, minIndex, -1) !== -1) {
      const word = wordlist[minIndex];
      let wordOK = true;
      for (const char of word) {
        if (Object.prototype.hasOwnProperty.call(charPool, char)) {
          charPool[char] -= 1;
          if (charPool[char] < 0) wordOK = false;
        } else {
          wordOK = false;
        }
      }

      if (wordOK) {
        result.push(word);
        backtracking(
          wordlist, charPool, matches,
          result, semaphores, availableMatches,
          workerNumber, port, stats, minIndex + 1,
        );
        result.pop();
      }

      Atomics.store(semaphores, minIndex, minIndex);

      for (const char of word) {
        if (Object.prototype.hasOwnProperty.call(charPool, char)) {
          charPool[char] += 1;
        }
      }
    }
  }
}

module.exports = (wordlist, charPool, matches, semaphores, availableMatches, workerNumber, port, stats) => {
  backtracking(wordlist, charPool, matches, [], semaphores, availableMatches, workerNumber, port, stats, 0);
  return results;
};
