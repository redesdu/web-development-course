/**
 * Shared word counting for written answers.
 *
 * Written answers across the course use the same minimum so that students meet
 * one consistent expectation. Code editors are excluded on purpose: a correct
 * HTML fragment is judged by its structure, not by how many words it contains.
 */

export const MINIMUM_ANSWER_WORDS = 20;

/**
 * Count the words a reader would count.
 *
 * Splitting on whitespace alone counts punctuation-only fragments as words, so
 * a token is only counted when it contains at least one letter or digit. This
 * keeps "the server responds, then stops." at five words rather than six.
 */
export function countWords(text: string): number {
  if (typeof text !== 'string') return 0;

  return text
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token))
    .length;
}

export function meetsWordMinimum(text: string, minimum: number = MINIMUM_ANSWER_WORDS): boolean {
  return countWords(text) >= minimum;
}

/** The counter shown next to a written answer, for example "12 / 20 words". */
export function wordCountLabel(text: string, minimum: number = MINIMUM_ANSWER_WORDS): string {
  return `${countWords(text)} / ${minimum} words`;
}
