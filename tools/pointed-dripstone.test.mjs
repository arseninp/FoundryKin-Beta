import test from 'node:test';
import assert from 'node:assert/strict';
import {createStrandModels} from '../models/strands.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/pointed_dripstone_';
function setup(state={},slot) {
 const paths=['down','up'].flatMap(d=>['base','middle','frustum','tip','merge'].map(p=>P+d+'_'+p));
 const record={id:'pointed_dripstone',model:'pointed_dripstone',paths},parts=utilityBindings(record),bindings=Object.fromEntries(Object.entries(parts).map(([role,rows])=>[role,rows[0]]));
 const Three=createThreeMock(),descriptor=createStrandModels(Three).find(m=>m.id==='pointed_dripstone');
 const E={state,slot,bindings,faceMap:bindings,mats:Object.fromEntries(paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {record,parts,Three,E,descriptor,build:()=>descriptor.build(E)};
}
test('pointed dripstone is explicitly assigned and owns all ten named resources including merge textures',()=>{
 const s=setup();assert.equal(SPECIAL_MODELS.pointed_dripstone,'pointed_dripstone');assert.equal(s.descriptor.scale,1.4);
 assert.equal(Object.keys(s.parts).length,10);assert.deepEqual(s.parts.down_tip_merge,[P+'down_merge']);assert.deepEqual(s.parts.up_tip_merge,[P+'up_merge']);
 assert.deepEqual([...new Set(Object.values(s.parts).flat())].sort(),s.record.paths.slice().sort());
});
test('all four states preserve four half-block crosses in the selected direction',()=>{
 for(const direction of ['down','up'])for(const merged of [false,true]) {
  const s=setup({direction,merged});s.build();const m=meshesOf(s.E.group),parts=['base','middle','frustum',merged?'merge':'tip'];
  assert.equal(m.length,8);
  m.forEach((mesh,index)=>{
   const n=Math.floor(index/2);assert.equal(mesh.material.path,P+direction+'_'+parts[n]);assert.deepEqual(mesh.geometry.size,[Math.SQRT2*.5,.5]);
   assert.equal(mesh.position.y,direction==='up'?-.75+n*.5:.75-n*.5);assert.equal(mesh.rotation.y,index%2?Math.PI/2:0);assert.equal(mesh.material.side,2);
  });
 }
});
test('default is downward with an ordinary tip, independent of all ten edited images',()=>{
 let expected;
 for(const slot of setup().record.paths) {
  const s=setup({},slot),before=JSON.stringify(s.record);s.build();
  const snapshot=meshesOf(s.E.group).map(mesh=>({path:mesh.material.path,uv:mesh.geometry.rows,y:mesh.position.y,ry:mesh.rotation.y}));
  expected??=snapshot;assert.deepEqual(snapshot,expected);assert.equal(JSON.stringify(s.record),before);
 }
 assert.ok(expected.every(row=>row.path.startsWith(P+'down_')));assert.equal(expected.at(-1).path,P+'down_tip');
});
test('invalid parameters and absent owned textures fail explicitly',()=>{
 for(const state of [{direction:'sideways'},{merged:'yes'}]){const s=setup(state);assert.throws(s.build,/Invalid dripstone/);assert.equal(s.E.group.children.length,0);}
 const s=setup();s.record.paths=s.record.paths.filter(path=>path!==P+'up_merge');assert.throws(()=>utilityBindings(s.record),/Missing or ambiguous pointed_dripstone_up_merge/);
});
test('late material failure frees all allocated planes and leaves the scene empty',()=>{
 const s=setup({merged:true});delete s.E.mats[P+'down_merge'];assert.throws(s.build,/Missing model material/);
 assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
});
