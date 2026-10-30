import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createFittingModels} from '../models/fittings.mjs';
import {createPlantModels} from '../models/plants.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
function setup(factory, id, roles) {
 const Three = createThreeMock(), model = factory(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
const LECTERN = {down: 'd', east: 'b', north: 'f', south: 's', west: 's', up: 't'}, LEVER = {down: 'v', east: 'p', north: 'v', south: 'v', west: 'v', up: 'v'};
test('policy assigns ladder, lectern, lever, every wood shelf and the three tall flowers explicitly', () => {
 const woods = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'pale_oak', 'bamboo', 'crimson', 'warped', 'poplar'];
 const ids = ['ladder', 'lectern', 'lever', 'lilac', 'rose_bush', 'peony', 'bookshelf', 'chiseled_bookshelf', 'sunflower', ...woods.map(w => w + '_shelf')];
 const plan = planModelAssignments(Object.fromEntries(ids.map(id => [id, {}])));
 for (const w of woods) assert.equal(plan.assignments[w + '_shelf'].model, 'shelf');
 for (const [id, model] of Object.entries({ladder: 'ladder', lectern: 'lectern', lever: 'lever', lilac: 'flower', rose_bush: 'flower', peony: 'flower', bookshelf: 'cube', chiseled_bookshelf: 'cube'})) assert.equal(plan.assignments[id].model, model, id);
 assert.deepEqual(plan.unresolved, ['sunflower']);
});
test('fitting and plant models register explicit builders with their camera scale', () => {
 const Three = createThreeMock();
 assert.deepEqual(createFittingModels(Three).map(m => [m.id, m.scale]), [['ladder', 1], ['lectern', 1], ['lever', 1], ['shelf', 1]]);
 assert.deepEqual(createPlantModels(Three).map(m => [m.id, m.scale]), [['flower', 1.4], ['spore_blossom', 1]]);
 assert.throws(() => createFittingModels({}), /require Three/);assert.throws(() => createPlantModels({}), /require Three/);
});
test('ladder is one double-sided plane; shelf is a half-turned group of four boxes', () => {
 const l = setup(createFittingModels, 'ladder', {up: 'l'});l.build();const a = meshesOf(l.E.group);
 assert.equal(a.length, 1);assert.equal(l.mats.l.side, 2);assert.equal(a[0].position.z, 7 / 16);
 const s = setup(createFittingModels, 'shelf', {up: 's'});s.build();
 assert.equal(s.E.group.children.length, 1);assert.equal(s.E.group.children[0].rotation.y, Math.PI);assert.equal(meshesOf(s.E.group).length, 16);
});
test('lectern and lever tilt only the reading desk and the handle around their pivots', () => {
 const c = setup(createFittingModels, 'lectern', LECTERN);c.build();const groups = c.E.group.children.filter(x => x.children);
 assert.equal(groups.length, 1);assert.equal(groups[0].rotation.x, -Math.PI / 8);assert.equal(groups[0].children.length, 6);assert.equal(meshesOf(c.E.group).length, 16);assert.ok(uvInside(meshesOf(c.E.group)));
 const v = setup(createFittingModels, 'lever', LEVER);v.build();const g = v.E.group.children.filter(x => x.children);
 assert.equal(g.length, 1);assert.equal(g[0].rotation.x, -Math.PI / 4);assert.equal(g[0].children.length, 5);assert.equal(meshesOf(v.E.group).length, 11);
 assert.deepEqual([g[0].position.x, g[0].position.y, g[0].position.z], [0, (1 - 8) / 16, 0]);
});
test('tall flowers are two crossed double-sided pairs at the lower and upper block', () => {
 const f = setup(createPlantModels, 'flower', {up: 't', down: 'b', north: 'a'});f.build();const m = meshesOf(f.E.group);
 assert.deepEqual(m.map(x => [x.material.path, x.position.y, x.rotation.y]), [['b', -.5, 0], ['b', -.5, Math.PI / 2], ['t', .5, 0], ['t', .5, Math.PI / 2]]);
 assert.equal(f.mats.b.side, 2);assert.equal(f.mats.t.side, 2);
});
test('missing materials and bindings reject the model before anything is added and free geometry', () => {
 const l = setup(createFittingModels, 'lever', LEVER);l.E.mats.p = l.E.hiddenMat;
 assert.throws(l.build, /Missing model material: p/);assert.equal(l.E.group.children.length, 0);assert.ok(l.Three.created.every(g => g.disposed));
 const {up, ...rest} = LECTERN;assert.throws(setup(createFittingModels, 'lectern', rest).build, /Missing lectern binding: up/);
 assert.throws(setup(createFittingModels, 'shelf', {north: 's'}).build, /Missing shelf binding: up/);
 assert.throws(setup(createPlantModels, 'flower', {up: 't'}).build, /Missing tall flower binding: down/);
});
test('spore blossom keeps its base and four nested tilted petals', () => {
 const s = setup(createPlantModels, 'spore_blossom', {up: 'base', down: 'petal'});s.build();
 assert.equal(s.E.group.children.length, 5);assert.equal(meshesOf(s.E.group).length, 5);
 assert.equal(s.E.group.children[0].material, s.mats.base);
 for (let i = 0; i < 4; i++) {
  const outer = s.E.group.children[i + 1], inner = outer.children[0];
  assert.equal(outer.rotation.y, [0, Math.PI / 2, Math.PI, -Math.PI / 2][i]);
  assert.equal(inner.rotation.z, -Math.PI / 8);assert.equal(inner.children[0].material, s.mats.petal);
 }
 assert.deepEqual(s.E.group.children[1].children[0].children[0].geometry.rows, [[0, 0], [0, 1], [1, 0], [1, 1]]);
 assert.equal(s.mats.base.side, 2);assert.equal(s.mats.petal.side, 2);
 const missing = setup(createPlantModels, 'spore_blossom', {up: 'base', down: 'petal'});delete missing.E.mats.petal;
 assert.throws(missing.build, /Missing spore blossom material/);assert.equal(missing.E.group.children.length, 0);
 assert.equal(planModelAssignments({spore_blossom: {}}).assignments.spore_blossom.model, 'spore_blossom');
});
