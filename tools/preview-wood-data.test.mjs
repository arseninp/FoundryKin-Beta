import test from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../preview-wood-data.mjs';
const rows=data.WOOD_REVIEW_BLOCKS;
test('wood review data exports exactly 50 immutable distinct source records',()=>{
 assert.deepEqual(Object.keys(data),['WOOD_REVIEW_BLOCKS']);assert.equal(rows.length,50);assert.ok(Object.isFrozen(rows));
 assert.equal(new Set(rows.map(([id])=>id)).size,50);
 for(const row of rows){assert.ok(Object.isFrozen(row));assert.equal(row.length,3);assert.match(row[0],/^[a-z0-9_]+$/);assert.ok(typeof row[1]==='string'&&row[1].trim());assert.match(row[2],/[А-Яа-яЁё]/);}
});
test('wood review data matches the reviewed source IDs including stripped prefix order',()=>{
 const expected='acacia_log acacia_wood stripped_acacia_log stripped_acacia_wood birch_log birch_wood stripped_birch_log stripped_birch_wood cherry_log cherry_wood stripped_cherry_log stripped_cherry_wood dark_oak_log dark_oak_wood stripped_dark_oak_log stripped_dark_oak_wood jungle_log jungle_wood stripped_jungle_log stripped_jungle_wood mangrove_log mangrove_wood stripped_mangrove_log stripped_mangrove_wood oak_log oak_wood stripped_oak_log stripped_oak_wood pale_oak_log pale_oak_wood stripped_pale_oak_log stripped_pale_oak_wood poplar_log poplar_wood stripped_poplar_log stripped_poplar_wood spruce_log spruce_wood stripped_spruce_log stripped_spruce_wood crimson_stem crimson_hyphae stripped_crimson_stem stripped_crimson_hyphae warped_stem warped_hyphae stripped_warped_stem stripped_warped_hyphae bamboo_block stripped_bamboo_block'.split(' ');
 assert.equal(expected.length,50);assert.deepEqual(rows.map(([id])=>id),expected);
});
test('wood review labels preserve grammatical forms and special object names',()=>{
 const labels=Object.fromEntries(rows.map(([id,en,ru])=>[id,{en,ru}]));
 assert.equal(labels.oak_log.ru,'Бревно дуба');assert.equal(labels.stripped_dark_oak_wood.ru,'Обтёсанная древесина тёмного дуба');
 assert.equal(labels.stripped_oak_log.en,'Stripped oak log');assert.equal(labels.crimson_stem.ru,'Багровый стебель');
 assert.equal(labels.warped_hyphae.en,'Warped hyphae');assert.equal(labels.stripped_bamboo_block.ru,'Блок обтёсанного бамбука');
 for(const id of ['oak_stripped_log','crimson_log','warped_log','bamboo_log'])assert.ok(!Object.hasOwn(labels,id));
});
test('wood review records cannot be mutated through exported arrays',()=>{
 const before=JSON.stringify(rows);
 assert.throws(()=>rows.push(['other','Other','Другое']),TypeError);
 assert.throws(()=>{rows[0][0]='other';},TypeError);
 assert.equal(JSON.stringify(rows),before);
});
test('review entry point includes base, mineral, wood and leaf source IDs exactly once',async()=>{
 const [{REVIEW_IDS},base,{STONE_REVIEW_BLOCKS},{LEAF_REVIEW_BLOCKS}]=await Promise.all([import('../preview.mjs'),import('../preview-config.mjs'),import('../preview-stone-data.mjs'),import('../preview-leaf-data.mjs')]);
 const expected=[...base.REVIEW_IDS,...STONE_REVIEW_BLOCKS.map(([id])=>id),...rows.map(([id])=>id),...LEAF_REVIEW_BLOCKS.map(([id])=>id)];
 assert.equal(REVIEW_IDS.length,939);assert.deepEqual(REVIEW_IDS,expected);assert.equal(new Set(REVIEW_IDS).size,939);assert.ok(Object.isFrozen(REVIEW_IDS));
});
