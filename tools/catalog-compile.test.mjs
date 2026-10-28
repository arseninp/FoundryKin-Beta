import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCatalog} from '../catalog/compile.mjs';
function fixture() {
  const stone = 'textures/blocks/stone', icon = 'textures/items/stone', shield = 'textures/entity/shield';
  return {blocks: {stone: {textures: 'stone'}, waxed_stone: {textures: 'stone'}, stone_slab: {textures: 'stone'}}, terrain: {stone: {textures: stone}}, existing: {[stone]: 1, [icon]: 1, [shield]: 1}, models: {stone: {model: 'cube'}, waxed_stone: {model: 'cube'}, stone_slab: {model: 'slab'}}, items: {stone_icon: {textures: icon}, shield: {textures: {path: shield}}}, icons: {stone: ['stone_icon'], waxed_stone: ['stone_icon']}, aliases: {waxed_stone: {target: 'stone', reason: 'shared editor resources'}}, families: {stone: {slab: 'stone_slab'}}};
}
test('one assembly retains alias ids, family variants and explicit sprite resources', () => {
  const cat = compileCatalog(fixture());
  assert.deepEqual(cat.cards, ['stone']);
  assert.equal(cat.aliases.waxed_stone, 'stone');
  assert.equal(cat.families.stone.slab, 'stone_slab');
  assert.deepEqual(cat.items.shield.paths, ['textures/entity/shield']);
  assert.equal(cat.items.shield.kind, 'sprite');
  assert.equal(cat.resources['textures/blocks/stone'].length, 3);
  assert.ok(cat.resources['textures/items/stone'].some(owner => owner.kind === 'item'));
});
test('special resources survive without a replacement slot list', () => {
  const data = fixture();data.terrain.carried = {textures: ['textures/blocks/c1', 'textures/blocks/c2']};
  for (const path of data.terrain.carried.textures) data.existing[path] = 1;
  for (const id of ['stone', 'waxed_stone']) data.blocks[id].carried_textures = {side: 'carried', up: 'stone', down: 'stone'};
  const cat = compileCatalog(data);
  assert.ok(cat.records.stone.paths.includes('textures/blocks/c2'));
  assert.ok(cat.records.stone.icons.includes('textures/items/stone'));
});
test('missing model, image, item key and icon owner fail explicitly', () => {
  for (const mutate of [d => delete d.models.stone, d => delete d.existing['textures/items/stone'], d => d.icons.stone.push('absent'), d => d.icons.absent = ['stone_icon']]) {
    const data = fixture();mutate(data);assert.throws(() => compileCatalog(data));
  }
});
test('a shared PNG does not merge a slab into a cube', () => {
  const data = fixture();data.aliases.stone_slab = {target: 'stone', reason: 'unsafe proposal'};
  assert.throws(() => compileCatalog(data), /Alias would lose/);
});
test('duplicate and nested family membership are rejected', () => {
  for (const mutate of [d => d.families.stone.other = 'stone_slab', d => d.families.stone_slab = {}, d => d.families.stone.native = 'stone']) {
    const data = fixture();mutate(data);assert.throws(() => compileCatalog(data));
  }
});
test('missing and alias family endpoints are rejected', () => {
  for (const id of ['absent', 'waxed_stone']) {
    const data = fixture();data.families.stone.slab = id;assert.throws(() => compileCatalog(data));
  }
});
test('source inputs are unchanged, and every block resource is reverse indexed', () => {
  const data = fixture(), before = JSON.stringify(data), cat = compileCatalog(data);
  assert.equal(JSON.stringify(data), before);
  for (const record of Object.values(cat.records)) for (const path of record.paths) assert.ok(cat.resources[path].some(owner => owner.kind === 'block' && owner.id === record.id));
});
