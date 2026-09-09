import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateReadingTime, pluralize, slugifyTag } from './text.ts';

test('slugifyTag produces stable URL segments', () => {
  assert.equal(slugifyTag('Machine Learning'), 'machine-learning');
  assert.equal(slugifyTag('  systems / design  '), 'systems-design');
});

test('estimateReadingTime returns at least one minute', () => {
  assert.equal(estimateReadingTime('A short note.'), 1);
  assert.equal(estimateReadingTime('word '.repeat(440)), 2);
});

test('pluralize chooses the correct label', () => {
  assert.equal(pluralize(1, 'note'), '1 note');
  assert.equal(pluralize(2, 'note'), '2 notes');
});
