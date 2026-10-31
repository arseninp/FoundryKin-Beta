import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const CORALS=['tube','brain','bubble','fire','horn'];
const IDS=['fern','short_grass','reeds','nether_sprouts','hanging_roots','web',...CORALS.flatMap(c=>[c+'_coral','dead_'+c+'_coral'])];
const blocks=ids=>Object.fromEntries(ids.map(id=>[id,{textures:'fixture'}]));
test('six simple plants and ten living/dead coral plants have explicit cross assignments',()=>{
 assert.equal(IDS.length,16);const input=blocks(IDS),before=JSON.stringify(input),plan=planModelAssignments(input);
 assert.deepEqual(plan.unresolved,[]);assert.equal(Object.keys(plan.assignments).length,16);
 for(const id of IDS)assert.equal(plan.assignments[id].model,'cross',id);
 assert.equal(JSON.stringify(input),before);
});
test('coral fans use the ordinary cross, solid coral blocks stay cubes, and unknown names are not guessed',()=>{
 const fans=CORALS.flatMap(c=>[c+'_coral_fan','dead_'+c+'_coral_fan',c+'_coral_wall_fan','dead_'+c+'_coral_wall_fan']);
 const solids=CORALS.flatMap(c=>[c+'_coral_block','dead_'+c+'_coral_block']);
 const unknown=['future_coral','future_fern','future_roots'],plan=planModelAssignments(blocks([...fans,...solids,...unknown,'cactus']));
 assert.deepEqual(plan.unresolved,[...unknown].sort());
 for(const id of fans)assert.equal(plan.assignments[id].model,'cross',id);
 for(const id of solids)assert.equal(plan.assignments[id].model,'cube',id);
 assert.equal(plan.assignments.cactus.model,'cactus');
});
test('all sixteen objects reuse the existing two double-sided cross planes regardless of editing slot',()=>{
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
