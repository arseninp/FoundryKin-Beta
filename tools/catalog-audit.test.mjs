import test from 'node:test';
import assert from 'node:assert/strict';
import {assembleChunks, fromRawFiles, parseLooseJson} from '../catalog/load.mjs';
import {atlasPaths, auditCatalog, classifyVariant, comparePair} from '../catalog/audit.mjs';
const B = 'textures/blocks/';
const atlas = {
  furnace_top: {textures: B + 'furnace_top'}, furnace_side: {textures: B + 'furnace_side'},
  furnace_front_off: {textures: B + 'furnace_front_off'}, furnace_front_on: {textures: B + 'furnace_front_on'},
  lamp_off: {textures: B + 'lamp_off'}, lamp_on: {textures: B + 'lamp_on'},
  candle: {textures: [B + 'candle', B + 'candles/candle_lit']}, door_lower: {textures: [B + 'door_a_lower', B + 'door_b_lower']},
  sand: {textures: B + 'sand'}, stray: {textures: B + 'stray'}, anim: {textures: B + 'water_still'}
};
const blocks = {
  furnace: {textures: {down: 'furnace_top', up: 'furnace_top', north: 'furnace_side', east: 'furnace_side', west: 'furnace_side', south: 'furnace_front_off'}},
  lit_furnace: {textures: {down: 'furnace_top', up: 'furnace_top', north: 'furnace_side', south: 'furnace_side', west: 'furnace_side', east: 'furnace_front_on'}},
  redstone_lamp: {textures: 'lamp_off'}, lit_redstone_lamp: {textures: 'lamp_on'},
  candle: {textures: 'candle'}, oak_door: {textures: 'door_lower'}, birch_door: {textures: 'door_lower'},
  sand: {textures: 'sand'}, air: {}, water: {textures: 'anim'}
};
test('loose JSON accepts a byte order mark, comments and trailing commas', () => {
  assert.deepEqual(parseLooseJson('\uFEFF{"a": [1, 2,], /* c */ "b": "x//y", // line\n}'), {a: [1, 2], b: 'x//y'});
  assert.throws(() => parseLooseJson('{'));
});
test('chunks assemble by section, reject duplicates and verify manifest counts', () => {
  const manifest = {schema: 1, source: {commit: 'x'}, counts: {blocks: 2, terrain: 1, existing: 1}};
  const parts = [{name: 'blocks-000.json', value: {a: {}}}, {name: 'blocks-001.json', value: {b: {}}}, {name: 'terrain-000.json', value: {k: {textures: 'p'}}}, {name: 'existing-000.json', value: {p: 1}}, {name: 'auxiliary-000.json', value: {}}];
  const data = assembleChunks(manifest, parts);
  assert.deepEqual(Object.keys(data.blocks), ['a', 'b']);assert.deepEqual(Object.keys(data.terrain.texture_data), ['k']);
  assert.throws(() => assembleChunks(manifest, [...parts, {name: 'blocks-002.json', value: {a: {}}}]), /Duplicate/);
  assert.throws(() => assembleChunks({...manifest, counts: {...manifest.counts, blocks: 3}}, parts), /count mismatch/);
  assert.throws(() => assembleChunks(manifest, [{name: 'blocks-000.json', value: []}]), /Invalid catalog section/);
  assert.throws(() => assembleChunks({schema: 2, counts: {}}, []), /Unsupported/);
});
test('raw files drop the version header and keep only block definitions', () => {
  const raw = fromRawFiles({blocks: {format_version: [1, 1, 0], stone: {textures: 's'}}, terrain: {texture_data: {}}});
  assert.deepEqual(Object.keys(raw.blocks), ['stone']);
  assert.throws(() => fromRawFiles({blocks: {}, terrain: {}}), /Invalid raw/);
});
test('atlas entries expose every alternative once, in order', () => {
  assert.deepEqual(atlasPaths({textures: ['a', {path: 'b'}, 'a']}), ['a', 'b']);
  assert.deepEqual(atlasPaths({textures: {path: 'c'}}), ['c']);
  assert.deepEqual(atlasPaths({}), []);
});
test('state pairs are recognised even when the front face moves to another side', () => {
  const report = auditCatalog({blocks, terrain: {texture_data: atlas}});
  const furnace = report.statePairs.find(pair => pair.base === 'furnace'), lamp = report.statePairs.find(pair => pair.base === 'redstone_lamp');
  assert.deepEqual([furnace.verified, furnace.identical, furnace.swap], [true, false, ['furnace_front_off', 'furnace_front_on']]);
  assert.deepEqual([lamp.verified, lamp.swap], [true, ['lamp_off', 'lamp_on']]);
  const a = {up: 'x', down: 'x', north: 'y', south: 'y', east: 'z', west: 'z'};
  assert.equal(comparePair(a, {...a, up: 'q', north: 'r'}).verified, false);
  assert.deepEqual(comparePair(a, a), {verified: true, identical: true, swap: null});
});
test('alternatives beyond the first array element are listed per block and classified once', () => {
  const report = auditCatalog({blocks, terrain: {texture_data: atlas}});
  assert.deepEqual(report.alternatives.candle, [B + 'candles/candle_lit']);
  assert.deepEqual(report.alternatives.oak_door, [B + 'door_b_lower']);assert.deepEqual(report.alternatives.birch_door, [B + 'door_b_lower']);
  assert.equal(report.counts.blocksWithAlternatives, 3);assert.equal(report.counts.alternativePaths, 2);
  assert.deepEqual(report.alternativeClasses, {state: 1, door: 1});
  assert.deepEqual(report.sharedArrayKeys, [{key: 'door_lower', paths: 2, users: ['birch_door', 'oak_door']}]);
});
test('technical blocks, orphans, missing files and animations are reported without throwing', () => {
  const report = auditCatalog({blocks, terrain: {texture_data: atlas}, existing: {[B + 'sand']: 1}, flipbook: [{flipbook_texture: B + 'water_still'}]});
  assert.deepEqual(report.technical, [{id: 'air', reason: 'no-textures'}]);
  assert.deepEqual(report.orphanKeys, ['stray']);assert.deepEqual(report.orphanPaths, [B + 'stray']);
  assert.ok(report.missingFiles.includes(B + 'furnace_top') && !report.missingFiles.includes(B + 'sand'));
  assert.deepEqual(report.animatedBlocks, ['water']);
  assert.equal(auditCatalog({blocks, terrain: {texture_data: atlas}}).missingFiles, null);
});
test('unresolved atlas keys and incomplete face maps are explicit findings', () => {
  const report = auditCatalog({blocks: {a: {textures: 'ghost'}, b: {textures: {}}}, terrain: {texture_data: {}}});
  assert.deepEqual(report.unresolved, [{id: 'a', key: 'ghost'}]);assert.deepEqual(report.incomplete, ['b']);
});
test('variant classes follow the texture name only as a hint', () => {
  const samples = {'candles/red_candle_lit': 'state', 'crafter_top_triggered': 'state', 'beetroots_stage_2': 'stage', 'bubble_column_outer_c': 'stage', 'leaves_opaque': 'render', 'door_iron_lower': 'door', 'cake_inner': 'other'};
  for (const [name, kind] of Object.entries(samples)) assert.equal(classifyVariant(B + name), kind, name);
});
test('the audit does not mutate its inputs', () => {
  const input = {blocks, terrain: {texture_data: atlas}}, before = JSON.stringify(input);
  auditCatalog(input);assert.equal(JSON.stringify(input), before);
});
