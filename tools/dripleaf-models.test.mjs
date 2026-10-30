import test from 'node:test';
import assert from 'node:assert/strict';
import {createDripleafModels} from '../models/dripleaf.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(id,slot) {
 const Three=createThreeMock(),descriptor=createDripleafModels(Three).find(m=>m.id===id);
 const bindings=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,'textures/blocks/'+face]));
 const E={bindings,faceMap:bindings,slot,mats:Object.fromEntries(Object.values(bindings).map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {Three,descriptor,E,build:()=>descriptor.build(E)};
}
const snapshot=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,path:m.material.path,pos:[m.position.x,m.position.y,m.position.z],rot:[m.rotation.x,m.rotation.y,m.rotation.z,m.rotation.order]}));
test('both block IDs have explicit dripleaf builders, preserving existing camera scales',()=>{
 assert.equal(SPECIAL_MODELS.big_dripleaf,'big_dripleaf');assert.equal(SPECIAL_MODELS.small_dripleaf_block,'small_dripleaf');
 assert.deepEqual(createDripleafModels(createThreeMock()).map(m=>[m.id,m.scale]),[['big_dripleaf',1],['small_dripleaf',1]]);
 assert.throws(()=>createDripleafModels({}),/require Three/);
});
test('big dripleaf has two stem planes, one top and three quarter-height side planes',()=>{
 const s=setup('big_dripleaf');s.build();const m=meshesOf(s.E.group);
 assert.equal(m.length,6);assert.deepEqual(m.map(x=>x.material.path),['north','north','east','up','down','down'].map(x=>'textures/blocks/'+x));
 assert.deepEqual(m[0].geometry.size,[6*Math.SQRT2/16,15/16]);assert.equal(m[2].position.y,7/16);assert.equal(m[2].rotation.x,-Math.PI/2);
 assert.deepEqual(m.slice(3).map(x=>x.geometry.size),[[1,.25],[1,.25],[1,.25]]);
 assert.ok(m.every(x=>x.rotation.order==='YXZ'&&x.material.side===2));
});
test('small dripleaf preserves two stem sections and all three leaves with four rims each',()=>{
 const s=setup('small_dripleaf');s.build();const m=meshesOf(s.E.group);
 assert.equal(m.length,19);assert.deepEqual(m.slice(0,4).map(x=>x.position.y),[-.5,-.5,7/16,7/16]);
 const leaves=m.filter(x=>x.rotation.x===-Math.PI/2);
 assert.equal(leaves.length,3);assert.deepEqual(leaves.map(x=>x.position.y),[3/16,8/16,12/16]);
 assert.equal(leaves[2].rotation.y,Math.PI/2);assert.equal(leaves[2].rotation.order,'YXZ');
 assert.equal(m.filter(x=>x.geometry.size[1]===1/16).length,12);
 assert.ok(m.every(x=>x.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
});
test('editing any PNG never hides leaves, changes parts or alters rotation order',()=>{
 for(const id of ['big_dripleaf','small_dripleaf']) {
  let expected;
  for(const slot of ['textures/blocks/up','textures/blocks/down','textures/blocks/north','textures/items/unrelated']) {
   const s=setup(id,slot),before=JSON.stringify(s.E.bindings);s.build();expected??=snapshot(s.E);assert.deepEqual(snapshot(s.E),expected);assert.equal(JSON.stringify(s.E.bindings),before);
  }
 }
});
test('missing roles and late material failures leave no partially attached dripleaf',()=>{
 const a=setup('small_dripleaf');delete a.E.bindings.north;assert.throws(a.build,/Missing dripleaf binding/);assert.equal(a.E.group.children.length,0);
 for(const id of ['big_dripleaf','small_dripleaf']) {
  const s=setup(id);delete s.E.mats[s.E.bindings.down];assert.throws(s.build,/Missing model material/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 }
});
