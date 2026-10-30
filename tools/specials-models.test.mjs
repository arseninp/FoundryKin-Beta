import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createSpecialModels} from '../models/specials.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const SIX = {up: 'u', down: 'd', north: 'n', south: 's', east: 'e', west: 'w'};
function setup(id, roles) {
 const Three = createThreeMock(), model = createSpecialModels(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
test('policy assigns the four special blocks and leaves the old stonecutter unresolved', () => {
 const plan = planModelAssignments(Object.fromEntries(['grass_path', 'enchanting_table', 'stonecutter_block', 'stonecutter', 'sea_pickle'].map(id => [id, {}])));
 assert.deepEqual(Object.fromEntries(Object.entries(plan.assignments).map(([id, a]) => [id, a.model])), {enchanting_table: 'enchanting_table', grass_path: 'grass_path', sea_pickle: 'sea_pickle', stonecutter_block: 'stonecutter'});
 assert.deepEqual(plan.unresolved, ['stonecutter']);
});
test('dirt path and enchanting table are lowered boxes whose sides show only the visible strip', () => {
 for (const [id, height] of [['grass_path', 15], ['enchanting_table', 12]]) {
  const s = setup(id, SIX);s.build();const m = meshesOf(s.E.group);
  assert.equal(m.length, 6, id);assert.ok(uvInside(m), id);
  const top = m.find(x => x.rotation.x === -Math.PI / 2), side = m.find(x => x.rotation.y === Math.PI);
  assert.deepEqual([top.material.path, top.position.y], ['u', (height - 8) / 16]);assert.deepEqual(side.geometry.size, [1, height / 16]);
 }
});
test('stonecutter is a 9 px base plus two opposite saw blades on the east image', () => {
 const s = setup('stonecutter', SIX);s.build();const m = meshesOf(s.E.group);
 assert.equal(m.length, 8);assert.equal(m.filter(x => x.material.path === 'e').length, 2);assert.equal(m.filter(x => x.material.path === 'n').length, 3);assert.ok(uvInside(m));
 assert.deepEqual(m.slice(-2).map(x => x.rotation.y), [Math.PI, 0]);
});
test('sea pickle is a 4 by 6 pixel shaft with two crossed double-sided leaf strips', () => {
 const s = setup('sea_pickle', {up: 'p'});s.build();const m = meshesOf(s.E.group);
 assert.equal(m.length, 8);assert.equal(s.mats.p.side, 2);assert.deepEqual(m.slice(-2).map(x => x.rotation.y), [Math.PI / 4, -Math.PI / 4]);assert.ok(uvInside(m));
});
test('registration, missing materials and bindings are validated before anything is added', () => {
 const Three = createThreeMock();
 assert.deepEqual(createSpecialModels(Three).map(m => [m.id, m.scale]), [['grass_path', 1], ['enchanting_table', 1], ['stonecutter', 1], ['sea_pickle', 1]]);
 assert.throws(() => createSpecialModels({}), /require Three/);
 const s = setup('stonecutter', SIX);s.E.mats.e = s.E.hiddenMat;
 assert.throws(s.build, /Missing model material: e/);assert.equal(s.E.group.children.length, 0);assert.ok(s.Three.created.every(g => g.disposed));
 const {up, ...rest} = SIX;assert.throws(setup('grass_path', rest).build, /Missing grass path binding: up/);
 assert.throws(setup('sea_pickle', {north: 'p'}).build, /Missing sea pickle binding: up/);
});
