import test from 'node:test';
import assert from 'node:assert/strict';
import { check, SUCCESSORS, INTERNAL } from './check-legacy-successors.mjs';
test('classifies resolved, missing, internal and unknown ids', () => {
  const r = check(['oak_planks', 'white_wool'], ['planks', 'wool', 'log', 'movingBlock', 'mystery']);
  assert.deepEqual(r.resolved.map(x => x.id), ['planks', 'wool']);
  assert.deepEqual(r.missing.map(x => x.id), ['log']);
  assert.deepEqual(r.internal.map(x => x.id), ['movingBlock']);
  assert.deepEqual(r.unknown, ['mystery']);
});
test('any listed successor is enough', () => {
  assert.equal(check(['smooth_stone_slab'], ['stone_slab']).resolved[0].successor, 'smooth_stone_slab');
});
test('an id cannot be both successor-mapped and internal', () => {
  for (const id of Object.keys(INTERNAL)) assert.equal(Object.hasOwn(SUCCESSORS, id), false);
});
