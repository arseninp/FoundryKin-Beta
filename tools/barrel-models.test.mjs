import test from 'node:test';
import assert from 'node:assert/strict';
import {createBarrelModels} from '../models/barrel.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function setup(state={},slot) {
 const closed=P+'barrel_top',open=P+'barrel_top_open',side=P+'barrel_side',bottom=P+'barrel_bottom';
 const r={id:'barrel',model:'barrel',variants:{north:[closed,open]},faces:{up:[side],down:[side],north:[closed,open],south:[bottom],east:[side],west:[side]},paths:[closed,open,side,bottom]};
 const parts=utilityBindings(r),bindings=Object.fromEntries(Object.entries(parts).map(([role,paths])=>[role,paths[0]]));
 const Three=createThreeMock(),descriptor=createBarrelModels(Three)[0],E={state,slot,bindings,mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {r,parts,Three,E,descriptor,build:()=>descriptor.build(E)};
}
test('barrel has an explicit builder and binds both top variants from source north while normalizing the presentation',()=>{
 const s=setup();assert.equal(SPECIAL_MODELS.barrel,'barrel');assert.equal(s.descriptor.id,'barrel');assert.equal(s.descriptor.scale,1);
 assert.deepEqual(s.parts,{top_closed:[P+'barrel_top'],top_open:[P+'barrel_top_open'],bottom:[P+'barrel_bottom'],side:[P+'barrel_side']});
});
test('closed and open states preserve a full cube and change only the top material',()=>{
 for(const open of [false,true]) {
  const s=setup({open});s.build();const m=meshesOf(s.E.group);assert.equal(m.length,6);
  assert.ok(m.every(mesh=>JSON.stringify(mesh.geometry.size)==='[1,1]'));
  const top=m.find(mesh=>mesh.rotation.x===-Math.PI/2),bottom=m.find(mesh=>mesh.rotation.x===Math.PI/2);
  assert.equal(top.material.path,P+(open?'barrel_top_open':'barrel_top'));assert.equal(bottom.material.path,P+'barrel_bottom');
  assert.equal(m.filter(mesh=>mesh.material.path===P+'barrel_side').length,4);
 }
 const s=setup();s.build();assert.equal(meshesOf(s.E.group).find(mesh=>mesh.rotation.x===-Math.PI/2).material.path,P+'barrel_top');
});
test('editing any owned image cannot open the barrel or change its orientation',()=>{
 for(const open of [false,true]) {
  let expected;
  for(const slot of setup().r.paths) {
   const s=setup({open},slot),before=JSON.stringify(s.r);s.build();
   const snapshot=meshesOf(s.E.group).map(mesh=>({path:mesh.material.path,uv:mesh.geometry.rows,pos:[mesh.position.x,mesh.position.y,mesh.position.z],rot:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z]}));
   expected??=snapshot;assert.deepEqual(snapshot,expected);assert.equal(JSON.stringify(s.r),before);
  }
 }
});
test('invalid states, incomplete sequences and foreign resources fail explicitly',()=>{
 for(const open of ['yes',0,1]) {const s=setup({open});assert.throws(s.build,/Invalid barrel open state/);assert.equal(s.E.group.children.length,0);}
 const missing=setup().r;missing.variants.north.pop();assert.throws(()=>utilityBindings(missing),/Incomplete barrel top variants/);
 const foreign=setup().r;foreign.paths=foreign.paths.filter(path=>!path.endsWith('top_open'));assert.throws(()=>utilityBindings(foreign),/Missing or ambiguous barrel open top/);
});
test('missing materials never attach a partial barrel and free prepared geometry',()=>{
 const s=setup({open:true});delete s.E.mats[P+'barrel_side'];assert.throws(s.build,/Missing model material/);
 assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
});
