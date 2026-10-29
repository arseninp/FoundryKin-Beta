import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCatalog} from '../catalog/compile.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
const P = 'textures/blocks/';
function fixture() {
 const ids = ['furnace', 'lit_furnace', 'stone', 'infested_stone', 'stone_slab'];
 return {blocks: Object.fromEntries(ids.map(id => [id, {textures: id.startsWith('infested_') || id === 'stone_slab' ? 'stone' : id}])), terrain: Object.fromEntries(['furnace', 'lit_furnace', 'stone'].map(id => [id, {textures: P + id}])), existing: Object.fromEntries(['furnace', 'lit_furnace', 'stone'].map(id => [P + id, 1])), models: Object.fromEntries(ids.map(id => [id, {model: id === 'stone_slab' ? 'slab' : 'cube'}])), families: {stone: {slab: 'stone_slab'}}};
}
test('compiler, state groups, duplicate aliases and family forms work together', () => {
 const input = fixture(), before = JSON.stringify(input), cat = compileCatalog(input);
 assert.deepEqual(cat.cards, ['furnace', 'stone']);
 assert.deepEqual(cat.stateGroups.furnace.paths, [P + 'furnace', P + 'lit_furnace']);
 assert.equal(cat.families.stone.slab, 'stone_slab');
 assert.equal(cat.aliases.infested_stone, 'stone');
 assert.equal(JSON.stringify(input), before);
 const access = createCatalogAccess(cat);
 assert.deepEqual(access.describe('lit_furnace'), {kind: 'block', id: 'lit_furnace', card: 'furnace', form: 'native', state: {powered: 'on'}});
 assert.equal(access.describe('infested_stone').id, 'stone');
 assert.equal(access.describe('stone_slab').form, 'slab');
});
test('opening the on texture from the ordinary card selects its state without losing the source ID', () => {
 const cat = compileCatalog(fixture()), access = createCatalogAccess(cat);
 const result = access.locate(P + 'lit_furnace', {preferredId: 'furnace'});
 assert.equal(result.status, 'found');assert.equal(result.object.id, 'lit_furnace');
 assert.equal(result.object.state.powered, 'on');assert.equal(result.object.card, 'furnace');
});
test('duplicate ID can target a state record and follow its route', () => {
 const input = fixture();input.blocks.old_lit = {textures: 'lit_furnace'};input.models.old_lit = {model: 'cube'};
 input.aliases = {old_lit: {target: 'lit_furnace', reason: 'legacy ID'}};
 const cat = compileCatalog(input), result = createCatalogAccess(cat).describe('old_lit');
 assert.equal(result.card, 'furnace');assert.equal(result.state.powered, 'on');
 assert.ok(!cat.cards.includes('old_lit'));
});
test('state group can be a family member; routes retain both form and state', () => {
 const input = fixture();input.families.stone.device = 'lit_furnace';
 const cat = compileCatalog(input), access = createCatalogAccess(cat);
 assert.deepEqual(cat.cards, ['stone']);
 const result = access.describe('lit_furnace');
 assert.equal(result.card, 'stone');assert.equal(result.form, 'device');assert.equal(result.state.powered, 'on');
});
test('shared resources remain ambiguous unless a saved object disambiguates', () => {
 const input = fixture();input.terrain.furnace.textures = [P + 'furnace', P + 'stone'];input.terrain.lit_furnace.textures = [P + 'lit_furnace', P + 'stone'];
 const access = createCatalogAccess(compileCatalog(input));
 assert.equal(access.locate(P + 'stone').status, 'ambiguous');
 assert.equal(access.locate(P + 'stone', {preferredId: 'lit_furnace'}).object.state.powered, 'on');
 assert.equal(access.locate(P + 'lit_furnace', {preferredId: 'stone'}).status, 'mismatch');
});
test('corrupt state tables fail and returned state objects are independent copies', () => {
 const cat = compileCatalog(fixture()), access = createCatalogAccess(cat);
 access.describe('lit_furnace').state.powered = 'off';
 assert.equal(access.describe('lit_furnace').state.powered, 'on');
 const broken = structuredClone(cat);delete broken.stateRoutes.lit_furnace;
 assert.throws(() => createCatalogAccess(broken), /Missing state route/);
 const wrong = structuredClone(cat);wrong.stateRoutes.lit_furnace.state.powered = 'off';
 assert.throws(() => createCatalogAccess(wrong), /disagrees/);
});
test('model mismatch in an approved pair stops compilation', () => {
 const input = fixture();input.models.lit_furnace.model = 'stairs';
 assert.throws(() => compileCatalog(input), /State model mismatch/);
});
