const logger = require('../../lib/logger');

const findAnswers = async (req, res) => {
  const { body: { anagram, matches } } = req;
  logger.info(`An anagram of the phrase is: ${anagram}`);
  logger.info(`${matches.length} secret phrases should be founded:`);
  for (let i = 0; i < matches.length; i += 1) {
    logger.info(`${i}) ${matches[i]}`);
  }

  let wordlist = [];
  try {
    wordlist = req.files[0].buffer
      .toString('utf8')
      .split('\n')
      .filter((word) => Boolean(word.trim().length));
  } catch (error) {
    res.status(400).json({ message: 'Wrong wordlist format' });
  }
  logger.info(`${wordlist.length} words added`);
  res.status(200).json({ list: {} });
};

module.exports = {
  findAnswers,
};
