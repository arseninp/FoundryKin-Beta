import test from 'node:test';
import assert from 'node:assert/strict';
import {createBambooModels} from '../models/bamboo.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const ROLES = {north: 'stem', south: 'small', east: 'one', up: 'big', west: 'stem', down: 'shoot'};
function setup(id, roles = ROLES) {
 const Three = createThreeMock(), model = createBambooModels(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
test('bamboo family registers three explicit models, with the stem framed at three blocks', () => {
 const models = createBambooModels(createThreeMock());
 assert.deepEqual(models.map(m => m.id), ['bamboo', 'bamboo_fence', 'bamboo_gate']);
 assert.equal(models[0].scale, 1.8);assert.ok(models.slice(1).every(m => m.scale === 1 && m.mode === 'volume'));
 assert.throws(() => createBambooModels({}), /require Three/);
});
test('adult bamboo is three stem segments with three crossed leaf pairs; only leaves are double sided', () => {
 const s = setup('bamboo');s.build();const m = meshesOf(s.E.group);
 assert.equal(m.length, 9);
 assert.deepEqual(m.slice(0, 3).map(x => [x.geometry.kind, x.material.path, x.position.y]), [['box', 'stem', -1], ['box', 'stem', 0], ['box', 'stem', 1]]);
 assert.deepEqual(m.slice(3).map(x => [x.material.path, x.position.y]), [['one', -1.3], ['one', -1.3], ['small', 0], ['small', 0], ['big', 1], ['big', 1]]);
 assert.deepEqual(m.slice(3).map(x => x.rotation.y), [0, Math.PI / 2, 0, Math.PI / 2, 0, Math.PI / 2]);
 assert.equal(s.mats.stem.side, undefined);for (const leaf of ['one', 'small', 'big'])assert.equal(s.mats[leaf].side, 2);
 assert.equal(s.mats.shoot.side, undefined);assert.ok(uvInside(m));
});
test('fence and gate keep their accepted face counts, one material and bounded atlas UVs', () => {
 for (const [id, count] of [['bamboo_fence', 26], ['bamboo_gate', 38]]) {
  const s = setup(id, {up: 'wood'});s.build();const m = meshesOf(s.E.group);
  assert.equal(m.length, count, id);assert.ok(m.every(x => x.material === s.mats.wood && x.geometry.size.every(v => v > 0)));assert.ok(uvInside(m), id);
 }
 const s = setup('bamboo_fence', {up: 'wood'});s.build();const post = meshesOf(s.E.group)[0];
 assert.deepEqual([post.geometry.size, post.position.z], [[.25, 1], -.125]);
});
test('a missing material or binding rejects the model before anything is added and frees geometry', () => {
 const s = setup('bamboo');s.E.mats.big = s.E.hiddenMat;
 assert.throws(s.build, /Missing model material: big/);assert.equal(s.E.group.children.length, 0);
 assert.ok(s.Three.created.length > 0 && s.Three.created.every(g => g.disposed));
 const t = setup('bamboo_gate', {up: 'wood'});delete t.E.mats.wood;
 assert.throws(t.build, /Missing model material/);assert.equal(t.E.group.children.length, 0);
 const {up, ...rest} = ROLES, u = setup('bamboo', rest);assert.throws(u.build, /Missing bamboo binding: up/);
 const v = setup('bamboo_fence', {north: 'wood'});assert.throws(v.build, /Missing bamboo fence binding: up/);
});
