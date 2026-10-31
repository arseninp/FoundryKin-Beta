import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPrimitiveModels} from '../models/primitives.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const IDS=['allow','deny','border_block','barrier','structure_void'];
const read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const blocks=Object.assign({},...['blocks-000.json','blocks-001.json','blocks-004.json'].map(read));
const terrain=Object.assign({},...['terrain-000.json','terrain-001.json'].map(read));
const selected=()=>Object.fromEntries(IDS.map(id=>{assert.ok(Object.hasOwn(blocks,id),id);return [id,structuredClone(blocks[id])];}));
test('five named technical records have explicit cube assignments without changing their definitions',()=>{
 const input=selected(),before=JSON.stringify(input),plan=planModelAssignments(input);
 assert.deepEqual(plan.unresolved,[]);assert.equal(Object.keys(plan.assignments).length,5);
 for(const id of IDS)assert.equal(plan.assignments[id].model,'cube',id);
 assert.ok(plan.decisions.every(row=>row.reason==='special-model'));assert.equal(JSON.stringify(input),before);
});
test('each pinned single-texture record supplies its own material to the existing unit cube',()=>{
 const Three=createThreeMock(),models=createPrimitiveModels(Three),input=selected(),plan=planModelAssignments(input);
 for(const id of IDS) {
  const definition=input[id];assert.equal(typeof definition.textures,'string');assert.equal(definition.carried_textures,undefined);
  const path=terrain[definition.textures].textures;assert.equal(typeof path,'string');assert.ok(path.startsWith('textures/'));
  const faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,path])),before=JSON.stringify(faceMap),material={path};
  const E={cur:id,slot:path,faceMap,mats:{[path]:material},group:new Three.Group()},model=models.find(row=>row.id===plan.assignments[id].model);model.build(E);
  const meshes=meshesOf(E.group);assert.equal(meshes.length,1,id);assert.deepEqual(meshes[0].geometry.size,[1,1,1]);
  assert.equal(meshes[0].material.length,6);assert.ok(meshes[0].material.every(mat=>mat===material));
  assert.deepEqual([meshes[0].position.x,meshes[0].position.y,meshes[0].position.z],[0,0,0]);assert.equal(JSON.stringify(faceMap),before);
 }
});
test('unknown technical-looking IDs are not guessed from a known texture or partial name',()=>{
 const ids=['future_barrier','structure_void_variant','unknown_technical'];
 const plan=planModelAssignments(Object.fromEntries(ids.map(id=>[id,{textures:'barrier'}])));
 assert.deepEqual(plan.unresolved,[...ids].sort());assert.deepEqual(Object.keys(plan.assignments),[]);
});
test('missing cube material fails before a mesh is attached',()=>{
 const Three=createThreeMock(),model=createPrimitiveModels(Three).find(row=>row.id==='cube'),E={cur:'barrier',faceMap:Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,'missing'])),mats:{},group:new Three.Group()};
 assert.throws(()=>model.build(E),/Missing primitive material/);assert.equal(E.group.children.length,0);
});
