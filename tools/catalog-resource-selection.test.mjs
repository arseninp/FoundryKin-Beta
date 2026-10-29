import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock, resolveTexture} from '../catalog/resources.mjs';
const doors = {wooden_door: 'wood', spruce_door: 'spruce', birch_door: 'birch', jungle_door: 'jungle', acacia_door: 'acacia', dark_oak_door: 'dark_oak', iron_door: 'iron'};
const path = (wood, half) => 'textures/blocks/door_' + wood + '_' + half;
function atlas() {
 return Object.fromEntries(['lower', 'upper'].map(half => ['door_' + half, {textures: Object.values(doors).map(wood => path(wood, half))}]));
}
const definition = {textures: {up: 'door_lower', down: 'door_lower', side: 'door_upper'}};
test('each shared-atlas door gets only its own two halves', () => {
 for (const [id, wood] of Object.entries(doors)) {
  const record = normalizeBlock(id, definition, atlas(), {model: 'door'});
  assert.deepEqual(record.paths, [path(wood, 'lower'), path(wood, 'upper')].sort());
  assert.deepEqual(record.faces.up, [path(wood, 'lower')]);
  assert.deepEqual(record.faces.north, [path(wood, 'upper')]);
 }
});
test('atlas order and repeated entries cannot change the selected wood', () => {
 const input = atlas();
 for (const row of Object.values(input)) row.textures = [row.textures[0], ...row.textures.reverse()];
 assert.deepEqual(normalizeBlock('iron_door', definition, input).paths, [path('iron', 'lower'), path('iron', 'upper')]);
 assert.equal(resolveTexture('door_lower', input).length, 7);
});
test('unknown shared-atlas owners and missing assigned images fail explicitly', () => {
 assert.throws(() => normalizeBlock('mystery_door', definition, atlas()), /Unassigned/);
 const input = atlas();input.door_lower.textures = [path('wood', 'lower')];
 assert.throws(() => normalizeBlock('iron_door', definition, input), /Missing assigned/);
});
test('independent door keys and ordinary state arrays retain all alternatives', () => {
 const input = {copper_door: {textures: ['textures/blocks/copper_a', 'textures/blocks/copper_b']}, candle: {textures: ['textures/blocks/candle', 'textures/blocks/candle_lit']}};
 for (const id of ['copper_door', 'candle']) assert.deepEqual(normalizeBlock(id, {textures: id}, input).paths, input[id].textures);
});
test('carried face maps are preserved and invalid ID types never coerce', () => {
 const input = {stone: {textures: 'textures/blocks/stone'}, carried: {textures: ['textures/blocks/a', 'textures/blocks/b']}};
 const record = normalizeBlock('stone', {textures: 'stone', carried_textures: {side: 'carried', up: 'stone', down: 'stone'}}, input);
 assert.equal(record.paths.length, 3);assert.equal(record.carried.north.length, 2);
 for (const id of [null, undefined, 12, {toString: () => 'stone'}]) assert.throws(() => normalizeBlock(id, {textures: 'stone'}, input), /Invalid block id/);
});
test('normalization does not mutate source arrays or definitions', () => {
 const input = atlas(), before = JSON.stringify({input, definition});
 normalizeBlock('birch_door', definition, input).faces.up.push('textures/blocks/fake');
 assert.equal(JSON.stringify({input, definition}), before);
});
