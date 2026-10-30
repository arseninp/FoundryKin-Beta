import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function berry(stage=0,slot) {
 const sequence=[0,1,2,3].map(n=>P+'sweet_berry_bush_stage'+n),icon='textures/items/sweet_berries';
 const atlas=Object.fromEntries(sequence.map((path,n)=>['s'+n,{textures:path}]));atlas.icon={textures:icon};
 const definition={textures:{down:'s0',up:'s1',north:'s2',east:'s3',south:'s3',west:'s3'},carried_textures:'icon'};
 const r=normalizeBlock('sweet_berry_bush',definition,atlas,{model:SPECIAL_MODELS.sweet_berry_bush,icons:[icon]});
 const bindings=Object.fromEntries(Object.entries(r.bindings).map(([role,paths])=>[role,paths[0]])),Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='stage_cross');
 const E={bindings,state:{stage},slot,mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {r,sequence,icon,Three,E,build:()=>model.build(E)};
}
test('berry stages follow the declared down/up/north/east order without rewriting source variants',()=>{
 const s=berry();assert.equal(s.r.model,'stage_cross');assert.equal(s.r.paths.length,5);
 assert.deepEqual(Object.values(s.r.bindings).map(paths=>paths[0]),s.sequence);
 assert.deepEqual(s.r.variants.up,[s.sequence[1]]);assert.deepEqual(s.r.variants.down,[s.sequence[0]]);
 assert.ok(!Object.values(s.r.bindings).flat().includes(s.icon));
});
test('all four berry stages ignore every edited resource including the carried berry icon',()=>{
 for(let stage=0;stage<4;stage++)for(const slot of berry().r.paths) {
  const s=berry(stage,slot),before=JSON.stringify(s.r);s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,2);assert.ok(m.every(mesh=>mesh.material.path===s.sequence[stage]&&mesh.material.side===2));
  assert.deepEqual(m.map(mesh=>mesh.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);assert.equal(JSON.stringify(s.r),before);
 }
});
test('missing, ambiguous and foreign berry stage faces reject rather than selecting the wrong PNG',()=>{
 for(const mutate of [r=>{delete r.faces.east;},r=>{r.faces.north.push(r.faces.down[0]);},r=>{r.paths=r.paths.filter(path=>path!==r.faces.down[0]);}]) {
  const r=structuredClone(berry().r);mutate(r);assert.throws(()=>modelPartBindings(r),/Missing or ambiguous stage face|Missing or invalid staged cross sequence/);
 }
 const s=berry(4);assert.throws(s.build,/Invalid staged cross stage/);assert.equal(s.E.group.children.length,0);
});
test('bush and cactus flower reuse an explicit cross without using their selected carried icon as geometry',()=>{
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='cross');
 for(const id of ['bush','cactus_flower']) {
  assert.equal(SPECIAL_MODELS[id],'cross');const path=P+id,icon='textures/items/fixture_'+id;
  const r=normalizeBlock(id,{textures:'body',carried_textures:'icon'},{body:{textures:path},icon:{textures:icon}},{model:SPECIAL_MODELS[id],icons:[icon]});
  assert.ok(r.paths.includes(icon));assert.equal(r.model,'cross');
  for(const slot of r.paths) {
   const E={slot,faceMap:Object.fromEntries(Object.entries(r.faces).map(([face,paths])=>[face,paths[0]])),mats:{[path]:{path},[icon]:{path:icon}},hiddenMat:{},group:new Three.Group()};
   model.build(E);assert.equal(meshesOf(E.group).length,2);assert.ok(meshesOf(E.group).every(mesh=>mesh.material.path===path));
  }
 }
});
test('face-encoded stage rule only applies to the explicitly assigned staged model',()=>{
 const r=structuredClone(berry().r);r.model='cross';assert.equal(modelPartBindings(r),null);
});
