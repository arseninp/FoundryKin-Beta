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
 assert.deepEqual(createSpecialModels(Three).map(m => [m.id, m.scale]), [['farmland', 1], ['snow_layer', 1], ['grass_path', 1], ['enchanting_table', 1], ['stonecutter', 1], ['sea_pickle', 1], ['flower_pot', 1], ['decorated_pot', 1.4], ['conduit', 1], ['dragon_egg', 1], ['fire', 1]]);
 assert.throws(() => createSpecialModels({}), /require Three/);
 const s = setup('stonecutter', SIX);s.E.mats.e = s.E.hiddenMat;
 assert.throws(s.build, /Missing model material: e/);assert.equal(s.E.group.children.length, 0);assert.ok(s.Three.created.every(g => g.disposed));
 const {up, ...rest} = SIX;assert.throws(setup('grass_path', rest).build, /Missing grass path binding: up/);
 assert.throws(setup('sea_pickle', {north: 'p'}).build, /Missing sea pickle binding: up/);
});

// Element bounds, side UV and cap UV from Java dragon_egg.json blob 042d4ebedf87d6d7015a5abbc8b6e16fc065b434.
const EGG_REFERENCE=[
 [[6,15,6],[10,16,10],[6,0,10,1],[6,6,10,10],false],
 [[5,14,5],[11,15,11],[5,1,11,2],[5,5,11,11],false],
 [[4,13,4],[12,14,12],[4,2,12,3],[4,4,12,12],false],
 [[3,0,3],[13,13,13],[3,3,13,16],[3,3,13,13],true],
 [[2,1,2],[14,11,14],[2,5,14,15],[2,2,14,14],true],
 [[1,3,1],[15,8,15],[1,8,15,13],[1,1,15,15],true]
];
test('dragon egg is explicitly assigned without guessing unknown egg IDs',()=>{
 const plan=planModelAssignments({dragon_egg:{},future_dragon_egg:{}});assert.equal(plan.assignments.dragon_egg.model,'dragon_egg');assert.deepEqual(plan.unresolved,['future_dragon_egg']);
 const s=setup('dragon_egg',{up:'textures/blocks/dragon_egg'});assert.equal(s.model.scale,1);assert.equal(s.model.mode,'volume');
});
test('dragon egg matches all six reference elements and thirty-three declared face rectangles',()=>{
 const s=setup('dragon_egg',{up:'egg'});s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,33);assert.ok(uvInside(meshes));let index=0;
 for(const [a,b,side,cap,bottom] of EGG_REFERENCE) {
  const w=(b[0]-a[0])/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])/16,x=(a[0]+b[0]-16)/32,y=(a[1]+b[1]-16)/32,z=(a[2]+b[2]-16)/32,Q=Math.PI/2;
  const expected=[[[w,h],[x,y,(a[2]-8)/16],[0,Math.PI,0],side],[[w,h],[x,y,(b[2]-8)/16],[0,0,0],side],[[d,h],[(b[0]-8)/16,y,z],[0,Q,0],side],[[d,h],[(a[0]-8)/16,y,z],[0,-Q,0],side],[[w,d],[x,(b[1]-8)/16,z],[-Q,0,0],cap]];
  if(bottom)expected.push([[w,d],[x,(a[1]-8)/16,z],[Q,0,0],cap]);
  for(const [size,position,rotation,r] of expected) {
   const m=meshes[index++];assert.deepEqual(m.geometry.size,size);assert.deepEqual([m.position.x,m.position.y,m.position.z],position);assert.deepEqual([m.rotation.x,m.rotation.y,m.rotation.z],rotation);
   assert.deepEqual(m.geometry.rows,[[r[0]/16,1-r[1]/16],[r[2]/16,1-r[1]/16],[r[0]/16,1-r[3]/16],[r[2]/16,1-r[3]/16]]);
  }
 }
 assert.equal(index,33);assert.ok(meshes.every(m=>m.material===s.mats.egg));
 assert.equal(Math.max(...meshes.filter(m=>m.rotation.x===-Math.PI/2).map(m=>m.position.y)),.5);assert.equal(Math.min(...meshes.filter(m=>m.rotation.x===Math.PI/2).map(m=>m.position.y)),-.5);
});
test('dragon egg geometry ignores the editing slot and keeps the owned material policy unchanged',()=>{
 let expected;
 for(const slot of ['textures/blocks/dragon_egg','textures/items/unrelated']) {
  const s=setup('dragon_egg',{up:'textures/blocks/dragon_egg'});s.E.slot=slot;const before=JSON.stringify(s.E.mats);s.build();
  const actual=meshesOf(s.E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,p:[m.position.x,m.position.y,m.position.z],r:[m.rotation.x,m.rotation.y,m.rotation.z]}));expected??=actual;assert.deepEqual(actual,expected);assert.equal(JSON.stringify(s.E.mats),before);
 }
});
test('dragon egg rejects missing bindings and materials and frees geometry after allocation failures',()=>{
 assert.throws(setup('dragon_egg',{north:'egg'}).build,/Missing dragon egg binding: up/);
 for(const hidden of [false,true]) {
  const s=setup('dragon_egg',{up:'egg'}),existing={};s.E.group.add(existing);if(hidden)s.E.mats.egg=s.E.hiddenMat;else delete s.E.mats.egg;
  assert.throws(s.build,/Missing model material: egg/);assert.deepEqual(s.E.group.children,[existing]);assert.equal(s.Three.created.length,0);
 }
 for(const failMesh of [false,true]) {
  const s=setup('dragon_egg',{up:'egg'}),existing={},before=JSON.stringify(s.E.mats);s.E.group.add(existing);
  if(failMesh){const Base=s.Three.Mesh;s.Three.Mesh=class extends Base{constructor(...args){if(s.Three.created.length===8)throw new Error('mesh failure');super(...args);}};}
  else {const Base=s.Three.PlaneGeometry;s.Three.PlaneGeometry=class extends Base{constructor(...args){if(s.Three.created.length===7)throw new Error('geometry failure');super(...args);}};}
  assert.throws(s.build,/failure/);assert.deepEqual(s.E.group.children,[existing]);assert.equal(JSON.stringify(s.E.mats),before);assert.ok(s.Three.created.every(g=>g.disposed));
 }
});
