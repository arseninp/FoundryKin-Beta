import test from 'node:test';
import assert from 'node:assert/strict';
import {admitBlocks} from './prepare-catalog-inputs.mjs';
const source = {commit: '0123456789012345678901234567890123456789'};
const registry = ids => ({data_items: ids.map(id => ({name: 'minecraft:' + id}))});
test('every registry ID is accounted for, including present definitions without textures', () => {
 const definitions = {stone: {textures: 'stone'}, air: {}, red_shrub: {sound: 'grass'}, camera: {}, bad: 7, empty: {textures: {}}, old: {textures: 'legacy'}};
 const ids = ['stone', 'air', 'red_shrub', 'camera', 'bad', 'empty', 'missing'];
 const result = admitBlocks(definitions, registry(ids), {exclude: {camera: 'out-of-scope'}}, source);
 assert.deepEqual(Object.keys(result.blocks), ['stone']);
 assert.deepEqual(result.report.withoutTextures, ['air', 'red_shrub']);
 assert.deepEqual(result.report.withoutResourceDefinition, ['missing']);
 assert.deepEqual(result.report.invalidResourceDefinition, ['bad', 'empty']);
 assert.equal(Object.values(result.report.coverage).reduce((a, b) => a + b, 0), ids.length);
 assert.deepEqual(result.report.coverage, {admitted: 1, excluded: 1, 'missing-definition': 1, 'no-textures': 2, 'invalid-definition': 1, 'invalid-textures': 1});
 assert.ok(result.report.rejected.some(row => row.id === 'old' && row.reason === 'not-in-release-registry'));
});
test('an explicitly excluded missing resource stays excluded, not silently absent', () => {
 const result = admitBlocks({stone: {textures: 'stone'}}, registry(['stone', 'camera']), {exclude: {camera: 'outside-editor-scope'}}, source);
 assert.deepEqual(result.report.withoutResourceDefinition, []);
 assert.equal(result.report.coverage.excluded, 1);
});
test('malformed texture values receive an explicit status instead of being admitted', () => {
 for (const textures of [null, '', [], {}, {up: 7}, {up: ''}]) {
  const report = admitBlocks({stone: {textures: 'stone'}, bad: {textures}}, registry(['stone', 'bad']), {exclude: {}}, source).report;
  assert.deepEqual(report.invalidResourceDefinition, ['bad']);
  assert.equal(report.coverage['invalid-textures'], 1);
 }
});
test('valid definitions are cloned and reports remain deterministically ordered', () => {
 const definitions = {b: {textures: {side: 'side', up: 'top', down: 'bottom'}}, a: {textures: 'stone'}};
 const before = JSON.stringify(definitions), first = admitBlocks(definitions, registry(['b', 'a']), {exclude: {}}, source);
 const second = admitBlocks(definitions, registry(['a', 'b']), {exclude: {}}, source);
 assert.deepEqual(first, second);first.blocks.b.textures.up = 'changed';
 assert.equal(JSON.stringify(definitions), before);
});
