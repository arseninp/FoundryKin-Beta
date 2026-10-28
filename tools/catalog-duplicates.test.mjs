import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCatalog} from '../catalog/compile.mjs';
import {duplicateRules} from '../catalog/rules/duplicates.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
const P = 'textures/blocks/', I = 'textures/items/';
function fixture() {
  const blocks = {copper_block: {textures: 'copper'}, waxed_copper: {textures: 'copper'}, cut_copper: {textures: 'cut'}, waxed_cut_copper: {textures: 'cut'}, cut_copper_slab: {textures: 'cut'}, waxed_cut_copper_slab: {textures: 'cut'}, stone: {textures: 'stone'}, infested_stone: {textures: 'infested'}};
  return {blocks, terrain: {copper: {textures: P + 'copper'}, cut: {textures: P + 'cut'}, stone: {textures: P + 'stone'}, infested: {textures: {path: P + 'stone'}}}, models: Object.fromEntries(Object.keys(blocks).map(id => [id, {model: id.endsWith('_slab') ? 'slab' : 'cube'}])), existing: {[P + 'copper']: 1, [P + 'cut']: 1, [P + 'stone']: 1, [I + 'copper']: 1}, items: {copper_icon: {textures: I + 'copper'}}, icons: {copper_block: ['copper_icon']}, families: {cut_copper: {slab: 'cut_copper_slab'}, waxed_cut_copper: {slab: 'waxed_cut_copper_slab'}}};
}
test('waxed and infested classes collapse during compilation, not in card rendering', () => {
  const cat = compileCatalog(fixture());
  assert.deepEqual(cat.cards, ['copper_block', 'cut_copper', 'stone']);
  assert.equal(cat.aliases.waxed_copper, 'copper_block');
  assert.equal(cat.aliases.infested_stone, 'stone');
  assert.equal(cat.aliases.waxed_cut_copper_slab, 'cut_copper_slab');
  assert.ok(cat.records.waxed_cut_copper_slab);
  assert.equal(cat.decisions.length, 4);
});
test('duplicate families merge into one family while preserving the slab', () => {
  const cat = compileCatalog(fixture());
  assert.deepEqual(Object.keys(cat.families), ['cut_copper']);
  assert.equal(cat.families.cut_copper.slab, 'cut_copper_slab');
});
test('ordinary item icon is inherited only when the duplicate has no explicit icon links', () => {
  const cat = compileCatalog(fixture());
  assert.deepEqual(cat.records.waxed_copper.icons, [I + 'copper']);
  const data = fixture();data.icons.waxed_copper = [];
  assert.throws(() => compileCatalog(data), /Alias would lose/);
});
test('unique resources and different models are never silently discarded', () => {
  for (const mutate of [d => d.models.waxed_copper.model = 'stairs', d => d.blocks.infested_stone.textures = 'copper', d => d.models.infested_stone.states = {variant: true}]) {
    const data = fixture();mutate(data);assert.throws(() => compileCatalog(data), /Alias would lose/);
  }
});
test('all supported infested names and copper oxidation prefixes use their ordinary ids', () => {
  const ids = ['stone', 'cobblestone', 'stone_bricks', 'mossy_stone_bricks', 'cracked_stone_bricks', 'chiseled_stone_bricks', 'deepslate'];
  const blocks = Object.fromEntries(ids.flatMap(id => [[id, {}], ['infested_' + id, {}]]));
  for (const id of ['exposed_copper', 'weathered_copper', 'oxidized_copper']) {blocks[id] = {};blocks['waxed_' + id] = {};}
  const rules = duplicateRules(blocks);
  for (const id of ids) assert.equal(rules['infested_' + id].target, id);
  assert.equal(rules.waxed_oxidized_copper.target, 'oxidized_copper');
});
test('missing ordinary blocks, conflicting rules and cycles fail explicitly', () => {
  assert.throws(() => duplicateRules({waxed_copper: {}}), /Missing ordinary/);
  const data = fixture();
  assert.throws(() => duplicateRules(data.blocks, {waxed_copper: {target: 'stone', reason: 'wrong'}}), /Conflicting/);
  assert.throws(() => duplicateRules({a: {}, b: {}}, {a: {target: 'b', reason: 'test'}, b: {target: 'a', reason: 'test'}}), /cycle/);
});
test('ordinary objects sharing a PNG are not automatically merged', () => {
  const data = fixture();data.blocks.other_stone = {textures: 'stone'};data.models.other_stone = {model: 'cube'};
  assert.ok(compileCatalog(data).cards.includes('other_stone'));
});
test('conflicting canonical family forms are rejected and inputs stay unchanged', () => {
  const data = fixture(), before = JSON.stringify(data);compileCatalog(data);assert.equal(JSON.stringify(data), before);
  data.blocks.other_slab = {textures: 'cut'};data.models.other_slab = {model: 'slab'};
  data.families.waxed_cut_copper.slab = 'other_slab';
  assert.throws(() => compileCatalog(data), /Conflicting family/);
});
test('compiled aliases reopen canonical objects and child forms through the real access layer', () => {
  const access = createCatalogAccess(compileCatalog(fixture()));
  assert.equal(access.locate(I + 'copper', {preferredId: 'waxed_copper'}).object.id, 'copper_block');
  const selected = access.locate(P + 'cut', {preferredId: 'waxed_cut_copper_slab'});
  assert.equal(selected.object.id, 'cut_copper_slab');assert.equal(selected.object.card, 'cut_copper');assert.equal(selected.object.form, 'slab');
});
