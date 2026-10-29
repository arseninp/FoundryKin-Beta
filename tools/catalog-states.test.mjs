import test from 'node:test';
import assert from 'node:assert/strict';
import {powerRules, compileStateGroups} from '../catalog/states.mjs';
const make = (model, ...paths) => ({model, paths});
const data = () => ({furnace: make('cube', 'side', 'off'), lit_furnace: make('cube', 'side', 'on'), stone: make('cube', 'stone')});
test('power states become one card without deleting records or unique paths', () => {
 const records = data(), before = JSON.stringify(records);
 const plan = compileStateGroups(records, powerRules(records));
 assert.deepEqual(plan.cards, ['furnace', 'stone']);
 assert.deepEqual(plan.groups.furnace.paths, ['off', 'on', 'side']);
 assert.deepEqual(plan.routes.lit_furnace, {card: 'furnace', state: {powered: 'on'}});
 assert.equal(JSON.stringify(records), before);
});
test('torch has the ordinary lit card and an explicit off default', () => {
 const records = {redstone_torch: make('torch', 'on'), unlit_redstone_torch: make('torch', 'off')};
 const plan = compileStateGroups(records, powerRules(records));
 assert.deepEqual(plan.cards, ['redstone_torch']);
 assert.equal(plan.groups.redstone_torch.variants.off, 'unlit_redstone_torch');
});
test('unknown lit prefixes and incomplete pairs are not automatically grouped', () => {
 const records = {a: make('cube', 'a'), lit_a: make('cube', 'b'), furnace: make('cube', 'off')};
 assert.deepEqual(powerRules(records), []);
 assert.deepEqual(compileStateGroups(records, []).cards, ['a', 'furnace', 'lit_a']);
});
test('model mismatch is rejected even when resources match', () => {
 const records = data(); records.lit_furnace.model = 'stairs';
 assert.throws(() => compileStateGroups(records, powerRules(records)), /model mismatch/);
});
test('all approved power pairs retain both states', () => {
 for (const [off, on] of [['blast_furnace','lit_blast_furnace'],['smoker','lit_smoker'],['redstone_lamp','lit_redstone_lamp'],['unpowered_repeater','powered_repeater'],['unpowered_comparator','powered_comparator']]) {
  const records = {[off]: make('device', 'off'), [on]: make('device', 'on')};
  const plan = compileStateGroups(records, powerRules(records));
  assert.equal(plan.cards.length, 1); assert.equal(Object.keys(plan.routes).length, 2);
 }
});
test('bad defaults, missing members and repeated membership are rejected', () => {
 const rule = {card: 'furnace', parameter: 'powered', default: 'off', variants: {off: 'furnace', on: 'lit_furnace'}};
 for (const rules of [[{...rule, default: 'absent'}], [rule, rule], [{...rule, variants: {off: 'furnace', on: 'missing'}}], [{...rule, variants: {off: 'furnace', on: 'furnace'}}]]) assert.throws(() => compileStateGroups(data(), rules));
});
