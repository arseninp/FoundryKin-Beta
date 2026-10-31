import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const CORALS=['tube','brain','bubble','fire','horn'];
const IDS=['fern','short_grass','reeds','nether_sprouts','hanging_roots','web','crimson_roots','warped_roots',...CORALS.flatMap(c=>[c+'_coral','dead_'+c+'_coral'])];
const blocks=ids=>Object.fromEntries(ids.map(id=>[id,{textures:'fixture'}]));
test('eight simple plants and ten living/dead coral plants have explicit cross assignments',()=>{
 assert.equal(IDS.length,18);const input=blocks(IDS),before=JSON.stringify(input),plan=planModelAssignments(input);
 assert.deepEqual(plan.unresolved,[]);assert.equal(Object.keys(plan.assignments).length,18);
 for(const id of IDS)assert.equal(plan.assignments[id].model,'cross',id);
 assert.equal(JSON.stringify(input),before);
});
test('coral fans use the ordinary cross, solid coral blocks stay cubes, and unknown names are not guessed',()=>{
 const fans=CORALS.flatMap(c=>[c+'_coral_fan','dead_'+c+'_coral_fan',c+'_coral_wall_fan','dead_'+c+'_coral_wall_fan']);
 const solids=CORALS.flatMap(c=>[c+'_coral_block','dead_'+c+'_coral_block']);
 const unknown=['future_coral','future_fern','future_roots','future_crimson_roots','future_warped_roots'],plan=planModelAssignments(blocks([...fans,...solids,...unknown,'cactus']));
 assert.deepEqual(plan.unresolved,[...unknown].sort());
 for(const id of fans)assert.equal(plan.assignments[id].model,'cross',id);
 for(const id of solids)assert.equal(plan.assignments[id].model,'cube',id);
 assert.equal(plan.assignments.cactus.model,'cactus');
});
test('all eighteen objects reuse the existing two double-sided cross planes regardless of editing slot',()=>{
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='cross');
 for(const id of IDS) {
  const path='textures/blocks/fixture_'+id,faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,path]));
  const before=JSON.stringify(faceMap);let expected;
  for(const slot of [path,'textures/items/fixture_icon']) {
   const material={},E={cur:id,slot,faceMap,mats:{[path]:material},hiddenMat:{},group:new Three.Group()};model.build(E);const m=meshesOf(E.group);
   assert.equal(m.length,2,id);assert.equal(material.side,2);assert.ok(m.every(mesh=>mesh.material===material));
   const snapshot=m.map(mesh=>({size:mesh.geometry.size,uv:mesh.geometry.rows,pos:[mesh.position.x,mesh.position.y,mesh.position.z],ry:mesh.rotation.y}));
   expected??=snapshot;assert.deepEqual(snapshot,expected);assert.deepEqual(m.map(mesh=>mesh.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);
   assert.deepEqual(m.map(mesh=>mesh.rotation.y),[0,Math.PI/2]);
  }
  assert.equal(JSON.stringify(faceMap),before);
 }
});
test('missing coral material is rejected without inserting a partial model',()=>{
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='cross'),E={faceMap:{up:'textures/blocks/fixture_coral'},mats:{},hiddenMat:{},group:new Three.Group()};
 assert.throws(()=>model.build(E),/Missing planar material/);assert.equal(E.group.children.length,0);
});

// Selected definitions from blocks-001/005 and atlas entries from terrain-001/004 at PIN 46ba6ea.
const ROOTS={
 crimson_roots:{sound:'roots',textures:{down:'crimson_roots',east:'crimson_roots',north:'crimson_roots',south:'crimson_roots_pot',up:'crimson_roots',west:'crimson_roots'}},
 warped_roots:{sound:'roots',textures:{down:'warped_roots',east:'warped_roots',north:'warped_roots',south:'warped_roots_pot',up:'warped_roots',west:'warped_roots'}}
};
const ROOT_ATLAS={
 crimson_roots:{textures:'textures/blocks/crimson_roots'},crimson_roots_pot:{textures:'textures/blocks/crimson_roots_pot'},
 warped_roots:{textures:'textures/blocks/warped_roots'},warped_roots_pot:{textures:'textures/blocks/warped_roots_pot'}
};
test('selected pinned root definitions keep pot resources but build only the ordinary plant for every edit slot',()=>{
 const before=JSON.stringify({ROOTS,ROOT_ATLAS}),plan=planModelAssignments(ROOTS);assert.deepEqual(plan.unresolved,[]);
 for(const [id,definition] of Object.entries(ROOTS)) {
  const main='textures/blocks/'+id,pot=main+'_pot',record=normalizeBlock(id,definition,ROOT_ATLAS,plan.assignments[id]);
  assert.equal(record.model,'cross');assert.deepEqual(record.paths,[main,pot]);assert.deepEqual(record.variants.up,[main]);assert.deepEqual(record.variants.south,[pot]);
  const faceMap=Object.fromEntries(Object.entries(record.faces).map(([face,paths])=>{assert.equal(paths.length,1);return [face,paths[0]];}));
  for(const slot of record.paths) {
   const Three=createThreeMock(),material={path:main},potMaterial={path:pot},E={slot,faceMap,mats:{[main]:material,[pot]:potMaterial},hiddenMat:{},group:new Three.Group()};
   createPlanarModels(Three).find(model=>model.id===record.model).build(E);
   const meshes=meshesOf(E.group);assert.equal(meshes.length,2);assert.ok(meshes.every(mesh=>mesh.material===material));
   assert.deepEqual(meshes.map(mesh=>mesh.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);assert.deepEqual(meshes.map(mesh=>mesh.rotation.y),[0,Math.PI/2]);
   assert.deepEqual(potMaterial,{path:pot});
  }
 }
 assert.equal(JSON.stringify({ROOTS,ROOT_ATLAS}),before);
});
test('root normalization does not silently drop a missing main or pot resource',()=>{
 const plan=planModelAssignments(ROOTS);
 for(const [id,definition] of Object.entries(ROOTS))for(const missing of [id,id+'_pot']) {
  const inventory=Object.fromEntries(Object.values(ROOT_ATLAS).map(entry=>[entry.textures,true]));delete inventory['textures/blocks/'+missing];
  assert.throws(()=>normalizeBlock(id,definition,ROOT_ATLAS,{...plan.assignments[id],existing:inventory}),/Missing resource file/);
 }
});
