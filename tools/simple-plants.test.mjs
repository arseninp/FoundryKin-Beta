import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const PLANTS={
 golden_dandelion:'textures/blocks/golden_dandelion',
 torchflower:'textures/blocks/torchflower',
 poplar_sapling:'textures/blocks/poplar_sapling',
 deadbush:'textures/blocks/deadbush',
 short_dry_grass:'textures/blocks/short_dry_grass',
 tall_dry_grass:'textures/blocks/tall_dry_grass',
 crimson_fungus:'textures/blocks/crimson_fungus',
 warped_fungus:'textures/blocks/warped_fungus'
};
test('the eight explicit simple plants reuse cross without a new builder or broad name heuristic',()=>{
 const blocks=Object.fromEntries(Object.keys(PLANTS).map(id=>[id,{}])),before=JSON.stringify(blocks);
 const plan=planModelAssignments(blocks);assert.deepEqual(plan.unresolved,[]);
 for(const id of Object.keys(PLANTS))assert.equal(plan.assignments[id].model,'cross',id);
 assert.equal(JSON.stringify(blocks),before);
});
test('unknown plants and special objects remain unresolved rather than becoming crosses',()=>{
 const ids=['future_sapling','future_fungus','future_cactus','mangrove_propagule','open_eyeblossom'];
 const plan=planModelAssignments(Object.fromEntries(ids.map(id=>[id,{textures:'plant'}])));
 assert.deepEqual(plan.unresolved,[...ids].sort());assert.equal(Object.keys(plan.assignments).length,0);
});
test('all eight materials render as the accepted pair of double-sided centered cross planes',()=>{
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='cross');
 for(const [id,path] of Object.entries(PLANTS)) {
  const material={},faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,'stone'])),before=JSON.stringify(faceMap);
  const E={cur:id,faceMap,mats:{[path]:material},hiddenMat:{},group:new Three.Group(),slot:'textures/items/unrelated'};
  model.build(E);const m=meshesOf(E.group);assert.equal(m.length,2,id);
  assert.deepEqual(m.map(x=>x.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);
  assert.deepEqual(m.map(x=>x.rotation.y),[0,Math.PI/2]);assert.ok(m.every(x=>x.material===material&&x.position.y===0));
  assert.equal(material.side,2);assert.equal(JSON.stringify(faceMap),before);
 }
});
test('missing plant material is rejected without inserting a mesh',()=>{
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='cross'),E={faceMap:{up:'textures/blocks/missing'},mats:{},hiddenMat:{},group:new Three.Group()};
 assert.throws(()=>model.build(E),/Missing planar material/);assert.equal(E.group.children.length,0);
});
