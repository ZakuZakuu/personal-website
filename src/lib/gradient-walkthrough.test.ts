import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceExample, initialExample } from './gradient-walkthrough.ts';

test('forward, backward and step keep the intended state transitions', () => {
  let state = initialExample();
  for (const next of ['forward', 'backward', 'step', 'done']) {
    state = advanceExample(state);
    assert.equal(state.next, next);
  }
  assert.match(state.message, /w = 2\.6，b = 1\.8/);
  assert.deepEqual(advanceExample(state), state);
});

test('reset starts with unchanged weights and no computed gradient', () => {
  assert.equal(initialExample().next, 'zero');
  assert.match(initialExample().message, /w = 1，b = 1/);
});
