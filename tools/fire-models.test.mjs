import test from 'node:test';
import assert from 'node:assert/strict';
import {createFireModels} from '../models/fire.mjs';
import {createSpecialModels} from '../models/specials.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(id='fire',state={},slot) {
 const Three=createThreeMock(),descriptor=createFireModels(Three)[0],bindings={up:'textures/blocks/'+id+'_0',down:'textures/blocks/'+id+'_1'};
 const E={cur:id,state,slot,bindings,mats:Object.fromEntries(Object.values(bindings).map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}};
 return {Three,E,descriptor,build:()=>descriptor.build(E)};
}
function snapshot(group) {
 return group.children.map(child=>({pos:[child.position.x,child.position.y,child.position.z],rot:[child.rotation.x,child.rotation.y,child.rotation.z],children:child.children?snapshot(child):undefined,size:child.geometry?.size,uv:child.geometry?.rows,path:child.material?.path}));
}
test('both fire blocks explicitly share one registered builder; decorated pot restores its camera class',()=>{
 assert.equal(SPECIAL_MODELS.fire,'fire');assert.equal(SPECIAL_MODELS.soul_fire,'fire');
 const models=createSpecialModels(createThreeMock());assert.equal(models.filter(m=>m.id==='fire').length,1);
 assert.equal(models.find(m=>m.id==='decorated_pot').scale,1.4);assert.equal(models.find(m=>m.id==='flower_pot').scale,1);
});
test('fire keeps four inclined inner planes and four perimeter planes, with no roof',()=>{
 const s=setup();s.build();const roots=s.E.group.children,meshes=meshesOf(s.E.group);
 assert.equal(roots.length,8);assert.equal(roots.filter(x=>x.children).length,4);assert.equal(meshes.length,8);
 assert.ok(meshes.every(m=>JSON.stringify(m.geometry.size)==='[1,1.4]'&&m.material.side===2));
 assert.deepEqual(roots.slice(0,4).map(x=>[x.position.x,x.position.y,x.position.z]),[[0,-.5,.05],[0,-.5,-.05],[.05,-.5,0],[-.05,-.5,0]]);
 assert.deepEqual(roots.slice(0,4).map(x=>[x.rotation.x,x.rotation.z]),[[Math.PI/8,0],[-Math.PI/8,0],[0,-Math.PI/8],[0,Math.PI/8]]);
 assert.ok(roots.slice(0,4).every(g=>g.children[0].position.y===.7));
 assert.ok(roots.slice(4).every(m=>m.position.y===.2&&m.rotation.x===0));
});
test('primary and alternate fire materials are explicit and independent of every edited slot',()=>{
 for(const id of ['fire','soul_fire'])for(const variant of ['primary','alternate']) {
  let expected;
  for(const slot of ['textures/blocks/'+id+'_0','textures/blocks/'+id+'_1','textures/items/unrelated']) {
   const s=setup(id,{variant},slot),before=JSON.stringify(s.E.bindings);s.build();
   const path=s.E.bindings[variant==='primary'?'up':'down'];assert.ok(meshesOf(s.E.group).every(m=>m.material.path===path));
   expected??=snapshot(s.E.group);assert.deepEqual(snapshot(s.E.group),expected);assert.equal(JSON.stringify(s.E.bindings),before);
  }
 }
 const s=setup();s.build();assert.ok(meshesOf(s.E.group).every(m=>m.material.path===s.E.bindings.up));
});
test('invalid variants, missing roles and missing materials reject before attachment',()=>{
 for(const variant of ['bad',false,1]) {const s=setup('fire',{variant});assert.throws(s.build,/Invalid fire variant/);assert.equal(s.E.group.children.length,0);}
 const a=setup('fire',{variant:'alternate'});delete a.E.bindings.down;assert.throws(a.build,/Missing fire binding/);assert.equal(a.E.group.children.length,0);
 const b=setup();delete b.E.mats[b.E.bindings.up];assert.throws(b.build,/Missing fire material/);assert.equal(b.E.group.children.length,0);
});
test('allocation failure frees prepared geometry without attaching or mutating the material',()=>{
 const s=setup(),Base=s.Three.PlaneGeometry;
 s.Three.PlaneGeometry=class extends Base {constructor(...args){if(s.Three.created.length===3)throw new Error('allocation');super(...args);}};
 assert.throws(s.build,/allocation/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 assert.equal(s.E.mats[s.E.bindings.up].side,undefined);
});
