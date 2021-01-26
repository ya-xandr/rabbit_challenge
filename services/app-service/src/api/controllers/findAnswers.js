const { findAnagrams } = require('../../lib/anagrams/finder');
const logger = require('../../lib/logger');

const convertPraseToCharPool = (phrase) => {
  const charList = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const char of phrase) {
    if (char !== ' ') {
      if (Object.prototype.hasOwnProperty.call(charList, char)) {
        charList[char] += 1;
      } else {
        charList[char] = 1;
      }
    }
  }
  return charList;
};

const prepareWordlist = (wordlist) => wordlist.sort((a, b) => b.length - a.length);

const filterWordlist = (words, charPool) => words.filter(
  (word) => {
    const wordCharPool = convertPraseToCharPool(word);
    return Object.keys(wordCharPool).every(
      (char) => Object.prototype.hasOwnProperty.call(charPool, char) && wordCharPool[char] <= charPool[char],
    );
  },
);

const findAnswers = async (req, res) => {
  const { body: { anagram, matches } } = req;
  logger.info(`An anagram of the phrase is: ${anagram}`);
  logger.info(`${matches.length} secret phrases should be founded:`);
  for (let i = 0; i < matches.length; i += 1) {
    logger.info(`${i}) ${matches[i]}`);
  }

  const charPool = convertPraseToCharPool(anagram);

  let wordlist = [];
  try {
    wordlist = req.files[0].buffer
      .toString('utf8')
      .split('\n')
      .filter((word) => Boolean(word.trim().length));

    wordlist = filterWordlist(wordlist, charPool);
  } catch (error) {
    res.status(400).json({ message: 'Wrong wordlist format' });
  }

  logger.info(`${wordlist.length} words added`);

  wordlist = prepareWordlist(wordlist);

  try {
    const answers = await findAnagrams(charPool, matches, wordlist);
    res.status(200).json({ answers });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

module.exports = {
  findAnswers,
};
