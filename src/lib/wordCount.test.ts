import { MINIMUM_ANSWER_WORDS, countWords, meetsWordMinimum, wordCountLabel } from './wordCount';

describe('countWords', () => {
  test('counts words separated by any whitespace', () => {
    expect(countWords('the browser sends a request')).toBe(5);
    expect(countWords('the browser\nsends   a\trequest')).toBe(5);
  });

  test('ignores leading and trailing whitespace', () => {
    expect(countWords('   one two   ')).toBe(2);
    expect(countWords('')).toBe(0);
    expect(countWords('    ')).toBe(0);
  });

  test('does not count punctuation on its own as a word', () => {
    expect(countWords('the server responds , then stops .')).toBe(5);
    expect(countWords('--- ... ***')).toBe(0);
  });

  test('counts a word with attached punctuation once', () => {
    expect(countWords('the server responds, then stops.')).toBe(5);
    expect(countWords('DELETE /saved-restaurants/42 removes it')).toBe(4);
  });

  test('counts words with accents and non-Latin letters', () => {
    expect(countWords('así functions correctly')).toBe(3);
    expect(countWords('状態 コード evidence')).toBe(3);
  });

  test('counts numbers as words', () => {
    expect(countWords('status 404 means not found')).toBe(5);
  });
});

describe('meetsWordMinimum', () => {
  const nineteen = Array.from({ length: 19 }, (_, index) => `word${index}`).join(' ');
  const twenty = `${nineteen} word19`;

  test('uses twenty words as the shared course minimum', () => {
    expect(MINIMUM_ANSWER_WORDS).toBe(20);
  });

  test('rejects an answer one word short', () => {
    expect(countWords(nineteen)).toBe(19);
    expect(meetsWordMinimum(nineteen)).toBe(false);
  });

  test('accepts an answer at exactly the minimum', () => {
    expect(countWords(twenty)).toBe(20);
    expect(meetsWordMinimum(twenty)).toBe(true);
  });

  test('accepts a custom minimum', () => {
    expect(meetsWordMinimum('one two three', 3)).toBe(true);
    expect(meetsWordMinimum('one two three', 4)).toBe(false);
  });
});

describe('wordCountLabel', () => {
  test('reads as a progress counter', () => {
    expect(wordCountLabel('one two three')).toBe('3 / 20 words');
    expect(wordCountLabel('')).toBe('0 / 20 words');
  });
});
