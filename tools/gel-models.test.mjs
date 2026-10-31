import test from 'node:test';
import assert from 'node:assert/strict';
import {createGelModels} from '../models/gels.mjs';
import {createModelRegistry} from '../models/registry.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(id,slot) {
 const Three=createThreeMock(),f=id==='slime'?{up:'textures/blocks/slime'}:{up:'textures/blocks/honey_top',down:'textures/blocks/honey_bottom',north:'textures/blocks/honey_side'};
 const mats=Object.fromEntries([...new Set(Object.values(f))].map(path=>[path,{path,opacity:1,transparent:true,depthWrite:false,side:0,map:{revision:0}}]));
 const E={cur:id,slot:slot??Object.values(f)[0],bindings:f,mats,hiddenMat:{},group:new Three.Group()};
 const model=createGelModels(Three).find(row=>row.id===id);return {Three,f,mats,E,model,build:()=>model.build(E)};
}
test('gel builders use the existing explicit registry without duplicate registration',()=>{
 const Three=createThreeMock(),registry=createModelRegistry();registry.register(createGelModels(Three));
 assert.deepEqual(registry.ids(),['honey_block','slime']);registry.validate({a:{model:'slime'},b:{model:'honey_block'}});
 assert.throws(()=>registry.register(createGelModels(Three)),/Duplicate model/);registry.seal();assert.throws(()=>registry.register([]),/sealed/);
 assert.throws(()=>createGelModels({}),/Gel models require Three/);
});
for(const [id,low,high] of [['slime',3,13],['honey_block',1,15]])test(id+' has the reference inner bounds, outer bounds, UVs and exact source material roles',()=>{
 const s=setup(id);s.build();const meshes=meshesOf(s.E.group),inside=meshes.slice(0,6),outside=meshes.slice(6);
 assert.equal(meshes.length,12);assert.equal(s.model.scale,1);assert.equal(s.model.mode,'volume');
 const width=(high-low)/16,edge=(8-low)/16;
 for(const mesh of inside){assert.deepEqual(mesh.geometry.size,[width,width]);assert.equal(Math.max(Math.abs(mesh.position.x),Math.abs(mesh.position.y),Math.abs(mesh.position.z)),edge);assert.deepEqual(mesh.geometry.rows,[[low/16,1-low/16],[high/16,1-low/16],[low/16,1-high/16],[high/16,1-high/16]]);}
 for(const mesh of outside){assert.deepEqual(mesh.geometry.size,[1,1]);assert.equal(Math.max(Math.abs(mesh.position.x),Math.abs(mesh.position.y),Math.abs(mesh.position.z)),.5);assert.deepEqual(mesh.geometry.rows,[[0,1],[1,1],[0,0],[1,0]]);}
 const expected=id==='slime'?Array(6).fill(s.f.up):[s.f.up,s.f.down,s.f.north,s.f.north,s.f.north,s.f.north];
 assert.deepEqual(inside.map(mesh=>mesh.material.path),expected);assert.ok(outside.every(mesh=>mesh.material.path===(id==='slime'?s.f.up:s.f.down)));
});
test('edited PNG selection never changes either volume or resource bindings',()=>{
 for(const id of ['slime','honey_block']) {
  const sample=setup(id);let expected;
  for(const slot of Object.keys(sample.mats)) {
   const s=setup(id,slot),before=JSON.stringify(s.f);s.build();
   const snapshot=meshesOf(s.E.group).map(mesh=>({size:mesh.geometry.size,pos:[mesh.position.x,mesh.position.y,mesh.position.z],rotation:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z],uv:mesh.geometry.rows,path:mesh.material.path}));
   expected??=snapshot;assert.deepEqual(snapshot,expected);assert.equal(JSON.stringify(s.f),before);
  }
 }
});
test('both volumes borrow live source materials without cloning them or forcing opacity',()=>{
 for(const id of ['slime','honey_block']) {
  const s=setup(id),before=JSON.stringify(s.mats);s.build();assert.equal(JSON.stringify(s.mats),before);
  for(const material of Object.values(s.mats))material.map={revision:1};
  for(const mesh of meshesOf(s.E.group)){assert.equal(mesh.material,s.mats[mesh.material.path]);assert.equal(mesh.material.map.revision,1);assert.equal(mesh.material.opacity,1);assert.equal(mesh.material.depthWrite,false);}
 }
});
test('missing roles, hidden materials and allocation failure leave no partial scene',()=>{
 const role=setup('honey_block');delete role.E.bindings.north;assert.throws(role.build,/Missing honey_block binding/);assert.equal(role.E.group.children.length,0);
 const missing=setup('honey_block');delete missing.E.mats[missing.f.north];assert.throws(missing.build,/Missing model material/);assert.equal(missing.E.group.children.length,0);assert.ok(missing.Three.created.every(g=>g.disposed));
 const hidden=setup('slime');hidden.E.mats[hidden.f.up]=hidden.E.hiddenMat;assert.throws(hidden.build,/Missing model material/);assert.equal(hidden.E.group.children.length,0);
 const failing=setup('honey_block'),Base=failing.Three.PlaneGeometry;
 failing.Three.PlaneGeometry=class extends Base{constructor(...args){if(failing.Three.created.length===7)throw new Error('allocation');super(...args);}};
 assert.throws(failing.build,/allocation/);assert.equal(failing.E.group.children.length,0);assert.ok(failing.Three.created.every(g=>g.disposed));
});
