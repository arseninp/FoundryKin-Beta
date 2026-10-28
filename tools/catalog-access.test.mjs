import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogAccess} from '../catalog/access.mjs';
const common = 'textures/blocks/common', slab = 'textures/blocks/slab', icon = 'textures/items/stone';
function fixture() {
  return {schema: 1, records: {stone: {paths: [common, icon]}, waxed_stone: {paths: [common, icon]}, stone_slab: {paths: [slab]}, unrelated: {paths: [common]}}, items: {stone_icon: {paths: [icon]}}, aliases: {waxed_stone: 'stone'}, families: {stone: {native: 'stone', slab: 'stone_slab'}}, resources: {[common]: [{kind: 'block', id: 'stone'}, {kind: 'block', id: 'waxed_stone'}, {kind: 'block', id: 'unrelated'}], [slab]: [{kind: 'block', id: 'stone_slab'}], [icon]: [{kind: 'block', id: 'stone'}, {kind: 'item', id: 'stone_icon'}]}};
}
test('saved object id wins over alphabetical resource-owner order', () => {
  const access = createCatalogAccess(fixture());
  assert.equal(access.locate(common, {preferredId: 'unrelated'}).object.id, 'unrelated');
  assert.equal(access.locate(common, {preferredId: 'stone'}).object.id, 'stone');
  assert.equal(access.locate(common).status, 'ambiguous');
});
test('retired duplicate ids resolve to one canonical object', () => {
  const access = createCatalogAccess(fixture());
  assert.equal(access.describe('waxed_stone').id, 'stone');
  assert.equal(access.locate(common, {preferredId: 'waxed_stone'}).object.id, 'stone');
  assert.equal(access.locate(common).candidates.length, 2);
});
test('a saved family id can reopen a unique child resource', () => {
  const result = createCatalogAccess(fixture()).locate(slab, {preferredId: 'stone'});
  assert.deepEqual(result, {status: 'found', object: {kind: 'block', id: 'stone_slab', card: 'stone', form: 'slab'}});
});
test('an existing but wrong saved object is never silently replaced', () => {
  assert.equal(createCatalogAccess(fixture()).locate(slab, {preferredId: 'unrelated'}).status, 'mismatch');
});
test('item and block identities stay separate even when sharing the same path', () => {
  const access = createCatalogAccess(fixture());
  assert.equal(access.locate(icon).object.id, 'stone');
  assert.equal(access.locate(icon, {kind: 'item'}).object.id, 'stone_icon');
  assert.equal(access.describe('stone_icon', 'item').form, null);
});
test('missing paths and obsolete unknown ids have explicit results', () => {
  const access = createCatalogAccess(fixture());
  assert.equal(access.locate('textures/blocks/absent').status, 'missing');
  assert.equal(access.locate(slab, {preferredId: 'removed_id'}).object.id, 'stone_slab');
  assert.equal(access.describe('removed_id'), null);
});
test('corrupt aliases, families, indices and categories are rejected', () => {
  for (const mutate of [d => d.aliases.stone = 'waxed_stone', d => d.aliases.waxed_stone = 'missing', d => d.families.stone.slab = 'missing']) {
    const data = fixture();mutate(data);assert.throws(() => createCatalogAccess(data));
  }
  const data = fixture();data.resources[common].push({kind: 'block', id: 'missing'});
  assert.throws(() => createCatalogAccess(data).locate(common));
  assert.throws(() => createCatalogAccess(fixture()).locate(common, {kind: 'invalid'}));
});
test('querying does not mutate source records or leak internal family descriptors', () => {
  const data = fixture(), before = JSON.stringify(data), access = createCatalogAccess(data);
  const first = access.describe('stone_slab');first.card = 'changed';
  assert.equal(access.describe('stone_slab').card, 'stone');access.locate(common);
  assert.equal(JSON.stringify(data), before);
});
