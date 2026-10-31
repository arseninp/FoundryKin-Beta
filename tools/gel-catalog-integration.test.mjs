import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createGelModels} from '../models/gels.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const blocks={...read('blocks-002.json'),...read('blocks-004.json')},terrain={...read('terrain-001.json'),...read('terrain-003.json')};
test('pinned slime and honey definitions reach two-volume builders with all owned resources',()=>{
 const input=Object.fromEntries(['slime','honey_block'].map(id=>[id,structuredClone(blocks[id])])),before=JSON.stringify(input),plan=planModelAssignments(input);
 assert.deepEqual(plan.unresolved,[]);assert.equal(plan.assignments.slime.model,'slime');assert.equal(plan.assignments.honey_block.model,'honey_block');
 for(const id of Object.keys(input)) {
  const record=normalizeBlock(id,input[id],terrain,plan.assignments[id]),saved=JSON.stringify(record);
  assert.equal(record.paths.length,id==='slime'?1:3);
  const bindings=Object.fromEntries(Object.entries(record.faces).map(([face,paths])=>{assert.equal(paths.length,1);assert.ok(record.paths.includes(paths[0]));return [face,paths[0]];}));
  for(const slot of record.paths) {
   const Three=createThreeMock(),model=createGelModels(Three).find(row=>row.id===record.model),mats=Object.fromEntries(record.paths.map(path=>[path,{path}]));
   const E={cur:id,slot,bindings,mats,hiddenMat:{},group:new Three.Group()};model.build(E);const meshes=meshesOf(E.group);
   assert.equal(meshes.length,12);assert.deepEqual([...new Set(meshes.map(mesh=>mesh.material.path))].sort(),record.paths);
   assert.ok(meshes.every(mesh=>mesh.material===mats[mesh.material.path]));
  }
  assert.equal(JSON.stringify(record),saved);
 }
 assert.equal(JSON.stringify(input),before);
});
test('unrelated slime and honey-like IDs remain unresolved',()=>{
 assert.deepEqual(planModelAssignments({future_slime:{textures:'slime_block'},honey_device:{textures:'honey_top'}}).unresolved,['future_slime','honey_device']);
});
