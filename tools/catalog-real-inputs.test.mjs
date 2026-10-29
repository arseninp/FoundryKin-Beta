/* Full pinned block/terrain coverage, not a browser test or a PNG inventory check. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeBlock, resourcePaths} from '../catalog/resources.mjs';
const base = new URL('../data/catalog-candidate/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', base), 'utf8'));
assert.equal(manifest.source.commit, '46ba6ea985fb5a92d79a9419198f10dda14c199d');
const sections = {blocks: {}, terrain: {}, auxiliary: {}};
for (const file of manifest.files) {
 const section = /^(blocks|terrain|auxiliary)-[0-9]{3}\.json$/.exec(file.name)?.[1];
 if (!section) continue;
 const text = readFileSync(new URL(file.name, base), 'utf8');
 assert.equal(createHash('sha256').update(text).digest('hex'), file.sha256, file.name);
 for (const [id, value] of Object.entries(JSON.parse(text))) {
  assert.ok(!Object.hasOwn(sections[section], id), 'Duplicate ' + section + ': ' + id);
  sections[section][id] = value;
 }
}
assert.equal(Object.keys(sections.blocks).length, manifest.counts.blocks);
assert.equal(Object.keys(sections.terrain).length, manifest.counts.terrain);
const records = Object.fromEntries(Object.entries(sections.blocks).map(([id, definition]) => [id, normalizeBlock(id, definition, sections.terrain)]));
const doors = {wooden_door: 'wood', spruce_door: 'spruce', birch_door: 'birch', jungle_door: 'jungle', acacia_door: 'acacia', dark_oak_door: 'dark_oak', iron_door: 'iron'};
test('every pinned block normalizes without dropping its declared resource paths', () => {
 for (const [id, definition] of Object.entries(sections.blocks)) {
  const expected = new Set();
  for (const value of [definition.textures, definition.carried_textures]) {
   const keys = typeof value === 'string' ? [value] : value ? Object.values(value) : [];
   for (const key of keys) {
    assert.ok(Object.hasOwn(sections.terrain, key), id + ': missing key ' + key);
    if (key === 'door_lower' || key === 'door_upper') {
     assert.ok(Object.hasOwn(doors, id), 'Unassigned shared door array: ' + id);
     expected.add('textures/blocks/door_' + doors[id] + '_' + (key === 'door_lower' ? 'lower' : 'upper'));
    } else for (const path of resourcePaths(sections.terrain[key].textures)) expected.add(path);
   }
  }
  assert.deepEqual(records[id].paths, [...expected].sort(), id);
 }
});
test('real shared door arrays produce exactly the assigned upper and lower halves', () => {
 for (const [id, wood] of Object.entries(doors)) assert.deepEqual(records[id].paths, ['textures/blocks/door_' + wood + '_lower', 'textures/blocks/door_' + wood + '_upper'], id);
});
test('real azalea and bamboo resources include potted parts and the shoot', () => {
 for (const [id, prefix] of [['azalea', 'potted_azalea_bush_'], ['flowering_azalea', 'potted_flowering_azalea_bush_']]) {
  for (const part of ['plant', 'side', 'top']) assert.ok(records[id].paths.includes('textures/blocks/' + prefix + part), id + ': ' + part);
 }
 assert.ok(records.bamboo.paths.includes('textures/blocks/bamboo_sapling'));
 assert.ok(records.bamboo.paths.includes('textures/items/bamboo'));
});
test('auxiliary resource definitions remain readable and are not silently discarded', () => {
 for (const id of ['end_gateway', 'lava_cauldron']) {
  assert.ok(Object.hasOwn(sections.auxiliary, id), id);
  assert.ok(normalizeBlock(id, sections.auxiliary[id], sections.terrain).paths.length > 0, id);
 }
});
