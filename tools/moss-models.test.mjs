import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createMossModels, paleMossState} from '../models/moss.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const DIRS = ['north', 'south', 'east', 'west'], LEVELS = ['none', 'short', 'tall'];
const ROLES = {up: 'top', down: 'top', north: 'top', south: 'top', east: 'top', west: 'top', side_base: 'base', side_tip: 'tip'};
function stateOf(upper, values) {
 return Object.fromEntries([['upper_block_bit', upper], ...DIRS.map((d, i) => ['pale_moss_carpet_side_' + d, values[i]])]);
}
function setup(state, roles = ROLES) {
 const Three = createThreeMock(), model = createMossModels(Three)[0];
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {state, bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
test('all 162 pale moss states build the base plate and one two-plane group per visible side', () => {
 let count = 0;
 for (const upper of [false, true]) for (const n of LEVELS) for (const s of LEVELS) for (const e of LEVELS) for (const w of LEVELS) {
  const values = [n, s, e, w], x = setup(stateOf(upper, values));x.build();
  const sides = x.E.group.children.filter(c => c.children);
  assert.equal(x.E.group.children.length, (upper ? 0 : 6) + values.filter(v => v !== 'none').length);
  assert.equal(sides.length, values.filter(v => v !== 'none').length);
  sides.forEach((g, i) => {
   const dir = DIRS.filter((d, j) => values[j] !== 'none')[i], level = values[DIRS.indexOf(dir)];
   assert.equal(g.children.length, 2);assert.deepEqual(g.rotation.y, {north: 0, east: -Math.PI / 2, south: Math.PI, west: Math.PI / 2}[dir]);
   for (const m of g.children) {assert.deepEqual(m.geometry.size, [1, 1]);assert.equal(m.material.path, upper || level === 'short' ? 'tip' : 'base');}
  });
  count++;
 }
 assert.equal(count, 162);
});
test('state values are validated, and side images are required only when a side is shown', () => {
 assert.throws(() => paleMossState({upper_block_bit: 'false'}), /upper_block_bit/);
 assert.throws(() => paleMossState({pale_moss_carpet_side_north: 'invalid'}), /moss side/);
 assert.deepEqual(paleMossState(undefined), {upper: false, sides: {north: 'none', south: 'none', east: 'none', west: 'none'}});
 const plain = setup({}, {up: 'top', down: 'top', north: 'top', south: 'top', east: 'top', west: 'top'});plain.build();
 assert.equal(plain.E.group.children.length, 6);
 const shown = setup({pale_moss_carpet_side_east: 'tall'}, {up: 'top', down: 'top', north: 'top', south: 'top', east: 'top', west: 'top'});
 assert.throws(shown.build, /Missing pale moss side material/);assert.equal(shown.E.group.children.length, 0);
});
test('a missing material rejects the carpet before anything is added and frees geometry', () => {
 const x = setup(stateOf(false, ['tall', 'none', 'short', 'none']));x.E.mats.tip = x.E.hiddenMat;
 assert.throws(x.build, /Missing model material: tip/);assert.equal(x.E.group.children.length, 0);assert.ok(x.Three.created.every(g => g.disposed));
 assert.throws(() => createMossModels({}), /require Three/);
});
function catalog(extra = true) {
 const P = 'textures/blocks/', atlas = {pale_moss_block: {textures: P + 'pale_moss_block'}, pale_moss_carpet_side: {textures: [P + 'pale_moss_carpet_side_base', ...(extra ? [P + 'pale_moss_carpet_side_tip'] : [])]}};
 const record = normalizeBlock('pale_moss_carpet', {textures: 'pale_moss_block', carried_textures: 'pale_moss_carpet_side'}, atlas, {model: 'pale_moss_carpet'});
 return {schema: 1, records: {pale_moss_carpet: record}, items: {}, aliases: {}, families: {}, resources: {}};
}
test('preview resolves pale moss faces and both side images from the record, and passes the explicit state', () => {
 const Three = createThreeMock(), model = createMossModels(Three)[0], P = 'textures/blocks/';
 const registry = {get: id => {assert.equal(id, 'pale_moss_carpet');return model;}, build: (id, E) => model.build(E)};
 const c = catalog(), before = JSON.stringify(c), p = createPreviewResolver(c, registry)({id: 'pale_moss_carpet', state: {pale_moss_carpet_side_north: 'tall', pale_moss_carpet_side_west: 'short'}});
 assert.deepEqual(p.bindings, {up: P + 'pale_moss_block', down: P + 'pale_moss_block', north: P + 'pale_moss_block', south: P + 'pale_moss_block', east: P + 'pale_moss_block', west: P + 'pale_moss_block', side_base: P + 'pale_moss_carpet_side_base', side_tip: P + 'pale_moss_carpet_side_tip'});
 const mats = Object.fromEntries(c.records.pale_moss_carpet.paths.map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 p.build(E);assert.equal(E.group.children.length, 8);
 assert.deepEqual(meshesOf(E.group).slice(6).map(m => m.material.path), [P + 'pale_moss_carpet_side_base', P + 'pale_moss_carpet_side_base', P + 'pale_moss_carpet_side_tip', P + 'pale_moss_carpet_side_tip']);
 assert.equal(JSON.stringify(c), before);
 assert.throws(() => createPreviewResolver(catalog(false), registry)({id: 'pale_moss_carpet'}), /Missing or ambiguous pale moss resource/);
});
