import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock, resourcePaths, resourceSignature} from '../catalog/resources.mjs';
import {compileAliases} from '../catalog/identity.mjs';
const atlas = {stone: {textures: 'textures/blocks/stone'}, alternate: {textures: {path: 'textures/blocks/stone'}}, stages: {textures: ['textures/blocks/a', {path: 'textures/blocks/b'}]}};
const make = (id, options = {}) => normalizeBlock(id, {textures: 'stone'}, atlas, {model: 'cube', ...options});
test('string, array and path-object resources retain all alternatives', () => {
  assert.deepEqual(resourcePaths(atlas.stages.textures), ['textures/blocks/a', 'textures/blocks/b']);
});
test('carried face maps and non-item-folder icons remain explicit', () => {
  const block = normalizeBlock('grass', {textures: 'stone', carried_textures: {side: 'stages', up: 'alternate', down: 'stone'}}, atlas, {model: 'cube', icons: ['textures/entity/shield']});
  assert.equal(block.carried.north.length, 2);
  assert.deepEqual(block.icons, ['textures/entity/shield']);
  assert.equal(block.paths.length, 4);
});
test('unresolved keys, incomplete faces, absent files and unsafe paths fail closed', () => {
  assert.throws(() => normalizeBlock('stone', {textures: 'missing'}, atlas));
  assert.throws(() => normalizeBlock('stone', {textures: {up: 'stone'}}, atlas));
  assert.throws(() => make('stone', {existing: {}}));
  for (const path of ['textures/../secret', 'https://host/image', 'textures//image']) assert.throws(() => resourcePaths(path));
});
test('atlas key spelling does not determine identity', () => {
  const second = normalizeBlock('other', {textures: 'alternate'}, atlas, {model: 'cube'});
  assert.equal(resourceSignature(make('stone')), resourceSignature(second));
});
test('approved waxed and infested aliases keep one visible canonical object', () => {
  const records = Object.fromEntries(['stone', 'infested_stone', 'waxed_stone'].map(id => [id, make(id)]));
  const plan = compileAliases(records, {infested_stone: {target: 'stone', reason: 'identical editor resources'}, waxed_stone: {target: 'stone', reason: 'wax is not a texture'}});
  assert.deepEqual(plan.visible, ['stone']); assert.equal(plan.decisions.length, 2);
});
test('shared PNG never erases different geometry, states, icons or carried paths', () => {
  for (const options of [{model: 'stairs'}, {states: {lit: true}}, {icons: ['textures/items/icon']}]) {
    assert.throws(() => compileAliases({a: make('a'), b: make('b', options)}, {b: {target: 'a', reason: 'test'}}));
  }
  const carried = normalizeBlock('b', {textures: 'stone', carried_textures: 'stages'}, atlas, {model: 'cube'});
  assert.throws(() => compileAliases({a: make('a'), b: carried}, {b: {target: 'a', reason: 'test'}}));
});
test('chains resolve; cycles and missing endpoints are rejected', () => {
  const records = Object.fromEntries(['a', 'b', 'c'].map(id => [id, make(id)]));
  assert.equal(compileAliases(records, {c: {target: 'b', reason: 'test'}, b: {target: 'a', reason: 'test'}}).aliases.c, 'a');
  assert.throws(() => compileAliases(records, {a: {target: 'b', reason: 'test'}, b: {target: 'a', reason: 'test'}}));
  assert.throws(() => compileAliases(records, {a: {target: 'missing', reason: 'test'}}));
});
test('normalization and alias compilation do not mutate source definitions', () => {
  const definition = {textures: 'stages'}, before = JSON.stringify(definition);
  const record = normalizeBlock('a', definition, atlas, {model: 'cube'});record.faces.up.push('textures/blocks/c');
  assert.equal(JSON.stringify(definition), before);assert.equal(atlas.stages.textures.length, 2);
});
