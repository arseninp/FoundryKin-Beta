import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {compileAliases} from '../catalog/identity.mjs';
import {duplicateRules} from '../catalog/rules/duplicates.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const merge=names=>Object.assign({},...names.map(read));
const blocks=merge(['blocks-000.json','blocks-001.json','blocks-002.json','blocks-004.json']);
const terrain=merge(['terrain-000.json','terrain-001.json','terrain-004.json']);
const pairs=['','dead_'].flatMap(prefix=>['tube','brain','bubble','fire','horn'].map(kind=>[prefix+kind+'_coral_fan',prefix+kind+'_coral_wall_fan']));
const ids=pairs.flat();
function selected(){return Object.fromEntries(ids.map(id=>{assert.ok(Object.hasOwn(blocks,id),'Missing pinned block: '+id);return [id,structuredClone(blocks[id])];}));}
function normalized(input){const plan=planModelAssignments(input);assert.deepEqual(plan.unresolved,[]);return Object.fromEntries(Object.entries(input).map(([id,definition])=>[id,normalizeBlock(id,definition,terrain,plan.assignments[id])]));}
test('all twenty pinned fan definitions collapse to ten ordinary entries with their original resources',()=>{
 const input=selected(),before=JSON.stringify(input),records=normalized(input),saved=JSON.stringify(records),identity=compileAliases(records,duplicateRules(input));
 assert.equal(Object.keys(records).length,20);assert.equal(Object.keys(identity.aliases).length,10);
 assert.deepEqual(identity.visible,pairs.map(([fan])=>fan).sort());
 for(const [fan,wall] of pairs) {
  assert.equal(records[fan].model,'cross');assert.equal(records[wall].model,'cross');assert.equal(identity.aliases[wall],fan);
  assert.deepEqual(records[wall].paths,records[fan].paths);assert.equal(records[fan].paths.length,1);
  assert.ok(!identity.visible.includes(wall));
 }
 assert.equal(JSON.stringify(input),before);assert.equal(JSON.stringify(records),saved);
});
test('unknown fan-like names stay unresolved',()=>{
 assert.deepEqual(planModelAssignments({future_coral_fan:{},brain_coral_wall_fan_extra:{}}).unresolved,['brain_coral_wall_fan_extra','future_coral_fan']);
});
test('every pair still rejects a unique wall resource, different model or changed indexed variants',()=>{
 for(const [,wall] of pairs)for(const mutate of [r=>{r.icons=['textures/items/unique_fixture'];r.paths.push(r.icons[0]);},r=>{r.model='cube';},r=>{r.variants.up.push(r.variants.up[0]);}]) {
  const input=selected(),records=normalized(input);mutate(records[wall]);
  assert.throws(()=>compileAliases(records,duplicateRules(input)),/Alias would lose model, state or resource/);
 }
});
test('all ten ordinary records build the existing two-sided cross with their own material',()=>{
 const records=normalized(selected()),Three=createThreeMock(),model=createPlanarModels(Three).find(row=>row.id==='cross'),saved=JSON.stringify(records);
 for(const [id] of pairs) {
  const record=records[id],path=record.paths[0],material={path},E={cur:id,slot:path,faceMap:Object.fromEntries(Object.entries(record.faces).map(([face,paths])=>[face,paths[0]])),mats:{[path]:material},hiddenMat:{},group:new Three.Group()};
  model.build(E);const meshes=meshesOf(E.group);assert.equal(meshes.length,2,id);assert.equal(material.side,Three.DoubleSide);
  assert.ok(meshes.every(mesh=>mesh.material===material));assert.deepEqual(meshes.map(mesh=>mesh.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);
  assert.deepEqual(meshes.map(mesh=>mesh.rotation.y),[0,Math.PI/2]);
 }
 assert.equal(JSON.stringify(records),saved);
});
