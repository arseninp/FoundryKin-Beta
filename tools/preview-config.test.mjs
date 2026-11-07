import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as config from '../preview-config.mjs';
import {createPreviewText} from '../preview-text.mjs';
import {STONE_REVIEW_BLOCKS} from '../preview-stone-data.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Baseline from config blob 6747bcd83101cc3a7a9265ec34aa4e9890c4d699; change snapshots only intentionally.
test('split config retains its public exports and original 602 ordered IDs',()=>{
 assert.deepEqual(Object.keys(config).sort(),['REVIEW_IDS','TEXT']);
 assert.equal(config.REVIEW_IDS.length,602);assert.equal(new Set(config.REVIEW_IDS).size,602);
 assert.ok(Object.isFrozen(config.REVIEW_IDS));
 assert.equal(digest(config.REVIEW_IDS),'383f57f30d695202881230ee6769ee0bec1a4729b89ba4b27d09b471ed958fba');
});
test('split config retains all original translations and their key order',()=>{
 assert.deepEqual(Object.keys(config.TEXT),['en','ru']);
 assert.equal(Object.keys(config.TEXT.en).length,684);
 assert.deepEqual(Object.keys(config.TEXT.en),Object.keys(config.TEXT.ru));
 for(const labels of Object.values(config.TEXT))for(const value of Object.values(labels))assert.ok(typeof value==='string'&&value.length>0);
 assert.equal(digest(config.TEXT),'a406284765d3fae91d89ff6ca1a87bff01cd5fa53f97eff098bd83491bb069db');
});
test('stone review data has 247 immutable distinct IDs with EN/RU labels',()=>{
 assert.equal(STONE_REVIEW_BLOCKS.length,247);assert.ok(Object.isFrozen(STONE_REVIEW_BLOCKS));
 const ids=new Set();
 for(const row of STONE_REVIEW_BLOCKS){assert.ok(Object.isFrozen(row));assert.equal(row.length,3);assert.match(row[0],/^[a-z0-9_]+$/);assert.ok(!ids.has(row[0]));ids.add(row[0]);assert.ok(row[1].trim());assert.match(row[2],/[А-Яа-яЁё]/);}
 for(const id of ['stone_stairs','end_brick_stairs','prismarine_bricks_stairs','normal_stone_stairs','stone_brick_stairs','sandstone_stairs','red_sandstone_stairs'])assert.ok(ids.has(id),id);
 for(const id of ['cobblestone_stairs','end_stone_brick_stairs','prismarine_brick_stairs'])assert.ok(!ids.has(id),id);
});
test('base and stone source datasets compose to 849 IDs without collisions or mutation',()=>{
 const before=JSON.stringify({config,STONE_REVIEW_BLOCKS});
 const combined=[...config.REVIEW_IDS,...STONE_REVIEW_BLOCKS.map(([id])=>id)];
 assert.equal(combined.length,849);assert.equal(new Set(combined).size,849);
 assert.deepEqual(combined.slice(0,602),config.REVIEW_IDS);
 assert.equal(JSON.stringify({config,STONE_REVIEW_BLOCKS}),before);
});
test('text factory preserves grammatical forms and does not mutate source label arrays',()=>{
 const input={SHULKER_BOXES:[['undyed','Shulker box','Шалкеровый ящик']],WOOL_COLORS:[['white','White','Белая','Белый','Белые']],WOOL_FORMS:[['wool','wool','шерсть',2],['carpet','carpet','ковёр',3],['wool_stairs','wool stairs','шерстяные ступени',4]],MATERIAL_FORMS:[['concrete','concrete','бетон',3]],FINISHING_BLOCKS:[],WOOD_BLOCKS:[],FIXTURE_BLOCKS:[]};
 const before=JSON.stringify(input),first=createPreviewText(input),second=createPreviewText(input);
 assert.equal(first.ru.card_white_wool,'Белая шерсть');assert.equal(first.ru.card_white_carpet,'Белый ковёр');assert.equal(first.ru.card_white_wool_stairs,'Белые шерстяные ступени');assert.equal(first.ru.card_white_concrete,'Белый бетон');
 assert.equal(first.en.card_undyed_shulker_box,'Shulker box');assert.equal(first.ru.card_undyed_shulker_box,'Шалкеровый ящик');
 assert.deepEqual(first,second);assert.notEqual(first,second);assert.notEqual(first.en,second.en);assert.equal(JSON.stringify(input),before);
});
test('mineral extension preserves the original 213 rows and appends only reviewed full blocks',()=>{
 assert.equal(digest(STONE_REVIEW_BLOCKS.slice(0,213)),'05c6d06a57c1b6dd469a0058222bd5117336ac3ff2b315d892580896899c4b62');
 const expected='amethyst_block bedrock calcite chiseled_cinnabar chiseled_deepslate chiseled_nether_bricks chiseled_polished_blackstone chiseled_resin_bricks chiseled_sulfur clay coal_block coal_ore coarse_dirt copper_block copper_ore cracked_deepslate_bricks cracked_deepslate_tiles cracked_nether_bricks cracked_polished_blackstone_bricks deepslate_coal_ore deepslate_copper_ore deepslate_diamond_ore deepslate_emerald_ore deepslate_gold_ore deepslate_iron_ore deepslate_lapis_ore deepslate_redstone_ore diamond_block diamond_ore dirt dripstone_block emerald_block emerald_ore end_stone'.split(' ');
 assert.equal(expected.length,34);assert.deepEqual(STONE_REVIEW_BLOCKS.slice(213).map(([id])=>id),expected);
});
