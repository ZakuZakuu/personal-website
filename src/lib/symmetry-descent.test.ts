import assert from 'node:assert/strict';
import { test } from 'node:test';
import { descent, symmetryLoss } from './symmetry-descent.ts';

test('the two asymmetric global minima have zero loss', () => {
  assert.equal(symmetryLoss([1, 0]), 0);
  assert.equal(symmetryLoss([0, 1]), 0);
});

test('identical initialization stays on the symmetry axis', () => {
  const points = descent([0.5, 0.5], 0.08, 300);
  assert.equal(points.length, 301);
  assert.ok(points.every(([x, y]) => x === y));
  assert.ok(symmetryLoss(points[300]) > 0);
});

test('one simultaneous update matches the worked example', () => {
  const [, [x, y]] = descent([0.6, 0.4], 0.1, 1);
  assert.ok(Math.abs(x - 0.5808) < 1e-12);
  assert.ok(Math.abs(y - 0.3712) < 1e-12);
});

test('small asymmetry grows and mirrored starts give mirrored results', () => {
  const a = descent([0.51, 0.49], 0.08, 300);
  const b = descent([0.49, 0.51], 0.08, 300);
  assert.ok(a[300][0] - a[300][1] > 0.9);
  assert.ok(symmetryLoss(a[300]) < 0.001);
  assert.deepEqual(a[300], [b[300][1], b[300][0]]);
});

test('zero steps preserves the initial point', () => {
  assert.deepEqual(descent([0, 1], 0.15, 0), [[0, 1]]);
});
