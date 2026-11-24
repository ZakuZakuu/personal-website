import assert from 'node:assert/strict';
import test from 'node:test';

import { workedExample } from './gradient-walkthrough.ts';

test('backpropagates the squared error through the product and bias', () => {
  const forward = workedExample('forward');
  assert.equal(forward.prediction, 3);
  assert.equal(forward.loss, 16);
  assert.equal(forward.weightGradient, null);

  const backward = workedExample('backward');
  assert.equal(backward.predictionGradient, -8);
  assert.equal(backward.weightGradient, -16);
  assert.equal(backward.biasGradient, -8);
  assert.equal(backward.w, 1);
});

test('SGD uses the stored gradient and preserves the old forward result', () => {
  const updated = workedExample('step');
  assert.equal(updated.w, 2.6);
  assert.equal(updated.b, 1.8);
  assert.equal(updated.weightGradient, -16);
  assert.equal(updated.loss, 16);
  assert.equal(workedExample('zero').weightGradient, null);
});
