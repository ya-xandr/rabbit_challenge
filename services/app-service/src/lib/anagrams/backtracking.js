/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const md5 = require('md5');

const results = [];

const findMatches = (phrase, matches) => matches.findIndex((item) => item === md5(phrase));

// eslint-disable-next-line no-unused-vars
const permutator = (inputArr, matches) => {
  // eslint-disable-next-line consistent-return
  const permute = (arr, memo = []) => {
    if (matches.length === 0) {
      return -1;
    }
    if (arr.length === 0) {
      const phrase = memo.join(' ');
      const matchIndex = findMatches(phrase, matches);
      if (matchIndex > -1) {
        results.push(phrase);
        delete matches[matchIndex];
      }
    } else {
      for (let i = 0; i < arr.length; i += 1) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), memo.concat(next));
      }
    }
  };

  permute(inputArr);
};

function backtracking(wordlist, charPool, matches, result, minIndex) {
  if (matches.length === 0) {
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
    console.log(`complete phrase: ${result.join(' ')}`);
    // permutator(result, matches);
    // console.log(`matches left: ${matches.join(' ')}`);
  }
  for (; minIndex < wordlist.length; minIndex += 1) {
    const word = wordlist[minIndex];
    let wordOK = true;
    for (const char of word) {
      if (Object.prototype.hasOwnProperty.call(charPool, char)) {
        charPool[char] -= 1;
        if (charPool[char] < 0) wordOK = false;
      } else if (![' ', "'"].includes(char)) {
        wordOK = false;
      }
    }

    if (wordOK) {
      result.push(word);
      backtracking(wordlist, charPool, matches, result, minIndex);
      result.pop();
    }

    for (const char of word) {
      if (Object.prototype.hasOwnProperty.call(charPool, char) && ![' ', "'"].includes(char)) {
        charPool[char] += 1;
      }
    }
  }
}

const findAnagrams = (wordlist, charPool, matches) => {
  console.log(charPool);
  backtracking(wordlist, charPool, matches, [], 0);
  console.log(results);
  return results;
};

module.exports = findAnagrams;
