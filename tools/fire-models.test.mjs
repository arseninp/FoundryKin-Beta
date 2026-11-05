import test from 'node:test';
import assert from 'node:assert/strict';
import {createFireModels} from '../models/fire.mjs';
import {createModelMaterials} from '../models/materials.mjs';
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
function worldPoint(point,node) {
 let [x,y,z]=point;const r=node.rotation,p=node.position;
 [x,y]=[x*Math.cos(r.z)-y*Math.sin(r.z),x*Math.sin(r.z)+y*Math.cos(r.z)];
 [x,z]=[x*Math.cos(r.y)+z*Math.sin(r.y),-x*Math.sin(r.y)+z*Math.cos(r.y)];
 [y,z]=[y*Math.cos(r.x)-z*Math.sin(r.x),y*Math.sin(r.x)+z*Math.cos(r.x)];
 return [x+p.x,y+p.y,z+p.z];
}
test('fire world-space corners stay above the floor and UVs cover the source frame',()=>{
 for(const id of ['fire','soul_fire'])for(const variant of ['primary','alternate']) {
  const s=setup(id,{variant});s.build();let top=-Infinity;
  for(const part of s.E.group.children) {
   const mesh=part.children?part.children[0]:part,[w,h]=mesh.geometry.size;
   const points=[[-w/2,-h/2,0],[w/2,-h/2,0],[-w/2,h/2,0],[w/2,h/2,0]].map(point=>{
    const local=worldPoint(point,mesh);return part===mesh?local:worldPoint(local,part);
   });
   const low=Math.min(...points.map(point=>point[1]));assert.ok(Math.abs(low+.5)<1e-12);
   assert.ok(points.every(point=>point.every(Number.isFinite)&&point[1]>=-.5-1e-12));
   top=Math.max(top,...points.map(point=>point[1]));
   assert.deepEqual(mesh.geometry.rows,[[0,1],[1,1],[0,0],[1,0]]);
  }
  assert.ok(Math.abs(top-.9)<1e-12);
 }
});
test('fire rejects foreign identities and cleans every allocation even when cleanup throws',()=>{
 const wrong=setup('other');assert.throws(wrong.build,/Unknown fire object/);assert.equal(wrong.Three.created.length,0);
 const invalid=setup('fire',[]);assert.throws(invalid.build,/Invalid fire variant/);assert.equal(invalid.Three.created.length,0);
 const s=setup(),Base=s.Three.Mesh,material=s.E.mats[s.E.bindings.up],disposed=[];
 s.Three.Mesh=class extends Base {constructor(...args){if(s.Three.created.length===3)throw new Error('mesh allocation');super(...args);}};
 const Plane=s.Three.PlaneGeometry;
 s.Three.PlaneGeometry=class extends Plane {constructor(...args){super(...args);const index=s.Three.created.length;this.dispose=()=>{disposed.push(index);if(index===1)throw new Error('dispose');};}};
 assert.throws(s.build,error=>error instanceof AggregateError&&error.errors.some(item=>item.message==='mesh allocation')&&error.errors.some(item=>item.message==='dispose'));
 assert.deepEqual(disposed,[1,2,3]);assert.equal(s.E.group.children.length,0);assert.equal(material.side,undefined);
});
test('both fires use unlit materials without changing texture ownership or alpha policy',()=>{
 for(const id of ['fire','soul_fire'])for(const variant of ['primary','alternate'])for(const semi of [false,true]) {
  const s=setup(id,{variant}),a=s.E.bindings.up,b=s.E.bindings.down;
  const bindings={up:a,down:b,north:a,south:a,east:a,west:a},disposed=[];
  s.Three.MeshBasicMaterial=class {constructor(options){Object.assign(this,options);this.isMeshBasicMaterial=true;}dispose(){disposed.push(this);}};
  s.Three.MeshLambertMaterial=class {constructor(){throw new Error('Fire must not depend on scene lighting');}};
  const textures=Object.fromEntries([a,b].map(path=>[path,{isTexture:true,userData:{semi},dispose(){throw new Error('Borrowed texture disposal');}}]));
  const owned=createModelMaterials(s.Three,s.descriptor,bindings,textures);s.E.bindings=bindings;s.E.mats=owned.mats;s.build();
  assert.deepEqual(s.descriptor.emissiveRoles,Object.keys(bindings));
  for(const mesh of meshesOf(s.E.group)) {
   const mat=mesh.material;assert.equal(mat.isMeshBasicMaterial,true);assert.equal(mat.side,s.Three.DoubleSide);
   assert.equal(mat.map,textures[variant==='primary'?a:b]);assert.equal(mat.transparent,semi);assert.equal(mat.alphaTest,semi?0:.05);assert.equal(mat.depthWrite,!semi);
  }
  const next=Object.fromEntries([a,b].map(path=>[path,{isTexture:true,userData:{semi:!semi}}]));owned.update(next);
  assert.equal(owned.mats[a].map,next[a]);assert.equal(owned.mats[a].transparent,!semi);owned.dispose();owned.dispose();assert.equal(disposed.length,2);
 }
});
