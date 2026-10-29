import test from 'node:test';
import assert from 'node:assert/strict';
import { admitBlocks, parseJsonc } from './prepare-catalog-inputs.mjs';
const source = { commit: '0123456789012345678901234567890123456789' };
const definitions = {
  planks: { textures: 'planks' }, oak_planks: { textures: 'wood_oak' },
  wool: { textures: 'wool' }, white_wool: { textures: 'wool_colored_white' },
  carpet: { textures: 'wool' }, white_carpet: { textures: 'wool_colored_white' },
  camera: { textures: 'camera' }, bone_block: { textures: 'bone_block', properties: ['deprecated'] }
};
const registry = { data_items: ['oak_planks', 'white_wool', 'white_carpet', 'camera', 'bone_block'].map(id => ({ name: 'minecraft:' + id })) };
test('legacy resource entries do not become catalog inputs', () => {
  const result = admitBlocks(definitions, registry, { exclude: { camera: 'outside-editor-scope' } }, source);
  assert.deepEqual(Object.keys(result.blocks), ['bone_block', 'oak_planks', 'white_carpet', 'white_wool']);
  assert.equal(result.blocks.white_carpet.textures, 'wool_colored_white');
  assert.equal(result.report.rejected.length, 4);
  assert.equal(result.source.commit, source.commit);
});
test('a deprecated property is not evidence that a whole block is obsolete', () => {
  assert.ok(admitBlocks(definitions, registry, { exclude: {} }, source).blocks.bone_block);
});
test('input definitions are not mutated', () => {
  const before = JSON.stringify(definitions);
  const result = admitBlocks(definitions, registry, { exclude: {} }, source);
  result.blocks.white_wool.textures = 'changed';
  assert.equal(JSON.stringify(definitions), before);
});
test('unknown, empty and duplicate registries fail closed', () => {
  assert.throws(() => admitBlocks(definitions, {}, { exclude: {} }, source));
  assert.throws(() => admitBlocks(definitions, { data_items: [] }, { exclude: {} }, source));
  assert.throws(() => admitBlocks(definitions, { data_items: [{ name: 'minecraft:camera' }, { name: 'minecraft:camera' }] }, { exclude: {} }, source));
  assert.throws(() => admitBlocks(definitions, registry, { exclude: {} }, { commit: 'main' }));
});
test('JSONC parser preserves URL strings while removing comments and trailing commas', () => {
  assert.deepEqual(parseJsonc('{"url":"https://example.test",/*comment*/"n":1,}'), { url: 'https://example.test', n: 1 });
});
