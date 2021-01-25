const { findAnagrams } = require('../../lib/anagrams/finder');
const logger = require('../../lib/logger');

const filterWordlist = (words, phrase) => {
  const chars = phrase.split('').reduce((ac, value) => {
    if (value !== ' ' && !ac.includes(value)) {
      ac.push(value);
    }
    return ac;
  }, []);

  return words.filter((word) => {
    let wordOK = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const char of word) {
      if (char !== "'" && !chars.includes(char)) {
        wordOK = false;
        break;
      }
    }
    return wordOK;
  });
};

const findAnswers = async (req, res) => {
  const { body: { anagram, matches } } = req;
  logger.info(`An anagram of the phrase is: ${anagram}`);
  logger.info(`${matches.length} secret phrases should be founded:`);
  for (let i = 0; i < matches.length; i += 1) {
    logger.info(`${i}) ${matches[i]}`);
  }

  // const wordlist = ['a', 'poul', 'try', 'out', 'wits', 'ants'];
  let wordlist = [];
  try {
    wordlist = req.files[0].buffer
      .toString('utf8')
      .split('\n')
      .filter((word) => Boolean(word.trim().length));

    wordlist = filterWordlist(wordlist, anagram);
  } catch (error) {
    res.status(400).json({ message: 'Wrong wordlist format' });
  }

  logger.info(`${wordlist.length} words added`);
  console.log(wordlist);

  const answers = await findAnagrams(anagram, matches, wordlist);

  res.status(200).json({ answers });
};

module.exports = {
  findAnswers,
};
