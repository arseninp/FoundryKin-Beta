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
// Independent expectation from the pinned polished_cinnabar.texture_set.json, not runtime metadata.
const MATERIAL_COLOR='textures/blocks/polished_cinnabar',MATERIAL_MAP='textures/blocks/polished_cinnabar_mers';
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
  if(expected.has(MATERIAL_COLOR)){
   expected.add(MATERIAL_MAP);
   assert.deepEqual(records[id].textureSets,{[MATERIAL_COLOR]:{metalness_emissive_roughness_subsurface:MATERIAL_MAP}},id);
  }else assert.equal(Object.hasOwn(records[id],'textureSets'),false,id);
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

test('pinned bubble effect owns exactly its eighteen declared roles, not fallback cube faces',()=>{
 const definition=sections.blocks.bubble_column,before=JSON.stringify({definition,terrain:sections.terrain}),record=normalizeBlock('bubble_column',definition,sections.terrain,{model:'sprite'});
 const expected=[...new Set(['bubble_column_up_top','bubble_column_down_top','bubble_column_outer','bubble_column_mid'].flatMap(key=>resourcePaths(sections.terrain[key].textures)))].sort();
 assert.equal(expected.length,18);assert.deepEqual(record.paths,expected);assert.equal(Object.keys(record.bindings).length,18);
 assert.deepEqual([...new Set(Object.values(record.bindings).flat())].sort(),expected);
 assert.equal(record.paths.includes('textures/blocks/pumpkin_side'),false);assert.equal(record.model,'sprite');
 assert.deepEqual(Object.keys(record.faces),['up','down','north','south']);assert.deepEqual(Object.keys(record.variants),['up','down','north','south']);
 for(const face of Object.keys(record.faces)){assert.deepEqual(record.faces[face],records.bubble_column.faces[face]);assert.deepEqual(record.variants[face],records.bubble_column.variants[face]);}
 assert.equal(record.source.kind,'engine-effect');assert.equal(record.source.template,'bubble_column');assert.deepEqual(record.source.definition,definition);
 assert.equal(JSON.stringify({definition,terrain:sections.terrain}),before);
 record.source.definition.textures.east='changed';assert.equal(definition.textures.east,'pumpkin_side');
});
test('raw input inspection and unrelated sprite IDs are not silently rewritten',()=>{
 assert.ok(records.bubble_column.paths.includes('textures/blocks/pumpkin_side'));assert.equal(Object.hasOwn(records.bubble_column,'source'),false);
 const other=normalizeBlock('future_bubble_column',sections.blocks.bubble_column,sections.terrain,{model:'sprite'});
 assert.deepEqual(other.paths,records.bubble_column.paths);assert.deepEqual(other.faces,records.bubble_column.faces);assert.equal(Object.hasOwn(other,'source'),false);
});
test('bubble normalization retains strict complete-role and exact-path validation',()=>{
 const short=structuredClone(sections.terrain);short.bubble_column_outer.textures.pop();
 assert.throws(()=>normalizeBlock('bubble_column',sections.blocks.bubble_column,short,{model:'sprite'}),/Incomplete bubble column variants/);
 const foreign=structuredClone(sections.terrain);foreign.bubble_column_outer.textures[0]='textures/blocks/foreign';
 assert.throws(()=>normalizeBlock('bubble_column',sections.blocks.bubble_column,foreign,{model:'sprite'}),/Invalid or unowned bubble column resource/);
 const existing=Object.fromEntries(records.bubble_column.paths.map(path=>[path,1]));delete existing[records.bubble_column.variants.up[0]];
 assert.throws(()=>normalizeBlock('bubble_column',sections.blocks.bubble_column,sections.terrain,{model:'sprite',existing}),/Missing resource file/);
});
test('bubble source normalization preserves explicitly declared icons and carried textures',()=>{
 const icon='textures/items/bubble_test',carried='textures/items/bubble_carried_test',definition={...structuredClone(sections.blocks.bubble_column),carried_textures:'bubble_carried_test'};
 const terrain={...sections.terrain,bubble_carried_test:{textures:carried}},existing=Object.fromEntries([...records.bubble_column.paths,icon,carried].map(path=>[path,1]));
 const before=JSON.stringify({definition,terrain,existing}),record=normalizeBlock('bubble_column',definition,terrain,{model:'sprite',icons:[icon],existing});
 assert.equal(record.paths.length,20);assert.ok(record.paths.includes(icon));assert.ok(record.paths.includes(carried));assert.deepEqual(record.icons,[icon]);
 for(const face of ['up','down','north','south','east','west']){assert.deepEqual(record.carried[face],[carried]);assert.deepEqual(record.carriedVariants[face],[carried]);}
 assert.deepEqual(record.source.definition,definition);assert.equal(JSON.stringify({definition,terrain,existing}),before);
});
