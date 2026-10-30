import test from 'node:test';
import assert from 'node:assert/strict';
import {createSculkModels} from '../models/sculk.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/',one=name=>[P+name];
function record(id) {
 let model=id,faces,carried={};
 if(id==='sculk_sensor'||id==='calibrated_sculk_sensor') {
  model='sculk_sensor';faces={up:one(id==='sculk_sensor'?'sculk_sensor_top':'calibrated_sculk_sensor_top'),down:one('sculk_sensor_bottom'),north:one('sculk_sensor_side'),south:one(id==='sculk_sensor'?'sculk_sensor_side':'calibrated_sculk_sensor_input_side')};
  carried={up:one('sculk_sensor_tendril_inactive'),north:one('sculk_sensor_tendril_active'),south:one('calibrated_sculk_sensor_amethyst')};
  if(id==='sculk_sensor')delete carried.south;
 } else if(id==='sculk_shrieker') {
  faces={up:one('sculk_shrieker_top'),down:one('sculk_shrieker_bottom'),north:one('sculk_shrieker_side')};
  carried={up:[P+'sculk_shrieker_inner_top',P+'sculk_shrieker_can_summon_inner_top']};
 } else if(id==='sculk_catalyst') {
  faces={up:[P+'sculk_catalyst_top',P+'sculk_catalyst_top_bloom'],down:one('sculk_catalyst_bottom'),north:[P+'sculk_catalyst_side',P+'sculk_catalyst_side_bloom']};
 } else faces=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,one('cactus_'+face)]));
 const paths=[...new Set([...Object.values(faces).flat(),...Object.values(carried).flat()])];
 return {id,model,faces,carried,paths};
}
function setup(id,state={},slot) {
 const r=record(id),parts=utilityBindings(r)??r.faces,bindings=Object.fromEntries(Object.entries(parts).map(([role,paths])=>[role,paths[0]]));
 const Three=createThreeMock(),descriptor=createSculkModels(Three).find(m=>m.id===r.model),E={cur:id,state,slot,bindings,mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {r,Three,E,descriptor,build:()=>descriptor.build(E)};
}
test('five explicit records use four builders without inventing models for unknown sculk blocks',()=>{
 for(const [id,model] of Object.entries({sculk_sensor:'sculk_sensor',calibrated_sculk_sensor:'sculk_sensor',sculk_shrieker:'sculk_shrieker',sculk_catalyst:'sculk_catalyst',cactus:'cactus'}))assert.equal(SPECIAL_MODELS[id],model);
 assert.deepEqual(createSculkModels(createThreeMock()).map(m=>m.id),['sculk_sensor','sculk_shrieker','sculk_catalyst','cactus']);
 assert.equal(utilityBindings({model:'other'}),null);
});
test('both sensors preserve the half-height body and four tendrils, calibrated sensor adds two crystal planes',()=>{
 for(const id of ['sculk_sensor','calibrated_sculk_sensor'])for(const active of [false,true]) {
  const s=setup(id,{active});s.build();const m=meshesOf(s.E.group),cal=id==='calibrated_sculk_sensor';
  assert.equal(m.length,cal?12:10);assert.equal(m.filter(mesh=>mesh.material.path===s.E.bindings[active?'tendril_on':'tendril_off']).length,4);
  const tendrils=m.filter(mesh=>mesh.geometry.size[0]===.5&&mesh.geometry.size[1]===.5);
  assert.equal(tendrils.length,4);assert.ok(tendrils.every(mesh=>mesh.position.y===.25&&mesh.material.side===2));
  if(cal)assert.equal(m.filter(mesh=>mesh.material.path===s.E.bindings.amethyst).length,2);
 }
});
test('shrieker retains its half-height base and double-sided raised rim, selecting either owned inner image',()=>{
 for(const can_summon of [false,true]) {
  const s=setup('sculk_shrieker',{can_summon});s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,11);const top=m.find(mesh=>mesh.rotation.x===-Math.PI/2&&mesh.position.y===0);
  assert.equal(top.material.path,s.E.bindings[can_summon?'inner_summon':'inner']);assert.equal(m.filter(mesh=>mesh.position.y===7/16).length,1);
 }
});
test('catalyst bloom changes top and sides together while keeping the bottom',()=>{
 for(const bloom of [false,true]) {
  const s=setup('sculk_catalyst',{bloom});s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,6);assert.equal(m.filter(mesh=>mesh.material.path===s.E.bindings[bloom?'side_bloom':'side']).length,4);
  assert.equal(m.filter(mesh=>mesh.material.path===s.E.bindings[bloom?'top_bloom':'top']).length,1);
  assert.equal(m.filter(mesh=>mesh.material.path===s.E.bindings.bottom).length,1);
 }
});
test('cactus retains full-width caps and four inset sides instead of a generic cube',()=>{
 const s=setup('cactus');s.build();const m=meshesOf(s.E.group);assert.equal(m.length,6);
 assert.deepEqual(m.map(mesh=>[mesh.position.x,mesh.position.y,mesh.position.z]),[[0,.5,0],[0,-.5,0],[0,0,-7/16],[0,0,7/16],[7/16,0,0],[-7/16,0,0]]);
 assert.ok(m.every(mesh=>JSON.stringify(mesh.geometry.size)==='[1,1]'));
});
test('states are independent of all edited resources and do not mutate source records',()=>{
 for(const [id,state] of [['sculk_sensor',{active:true}],['calibrated_sculk_sensor',{active:false}],['sculk_shrieker',{can_summon:true}],['sculk_catalyst',{bloom:true}],['cactus',{}]]) {
  let expected;
  for(const slot of record(id).paths) {
   const s=setup(id,state,slot),before=JSON.stringify(s.r);s.build();
   const snapshot=meshesOf(s.E.group).map(mesh=>({path:mesh.material.path,uv:mesh.geometry.rows,size:mesh.geometry.size,pos:[mesh.position.x,mesh.position.y,mesh.position.z],rot:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z]}));
   expected??=snapshot;assert.deepEqual(snapshot,expected);assert.equal(JSON.stringify(s.r),before);
  }
 }
});
test('invalid states, missing owned alternatives and late material failure reject partial output',()=>{
 for(const [id,key] of [['sculk_sensor','active'],['sculk_shrieker','can_summon'],['sculk_catalyst','bloom']]) {
  const s=setup(id,{[key]:'yes'});assert.throws(s.build,/Invalid sculk state/);assert.equal(s.E.group.children.length,0);
 }
 const r=record('sculk_shrieker');r.paths=r.paths.filter(path=>!path.includes('can_summon'));assert.throws(()=>utilityBindings(r),/Missing or ambiguous/);
 const c=setup('calibrated_sculk_sensor');delete c.E.mats[c.E.bindings.amethyst];assert.throws(c.build,/Missing model material/);assert.equal(c.E.group.children.length,0);assert.ok(c.Three.created.every(g=>g.disposed));
});
