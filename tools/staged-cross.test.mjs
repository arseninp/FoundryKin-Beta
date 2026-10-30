import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function setup(id,stage,slot) {
 const sequence=id==='nether_wart'?[0,1,1,2].map(n=>P+'nether_wart_stage_'+n):[0,1].map(n=>P+'torchflower_crop_stage_'+n);
 const icon='textures/items/fixture_'+id,record=normalizeBlock(id,{textures:'stages'},{stages:{textures:sequence}},{model:SPECIAL_MODELS[id],icons:[icon]});
 const Three=createThreeMock(),model=createPlanarModels(Three).find(m=>m.id==='stage_cross');
 const bindings=Object.fromEntries(Object.entries(record.bindings).map(([role,paths])=>[role,paths[0]]));
 const E={bindings,state:stage===undefined?{}:{stage},slot,mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {record,sequence,icon,Three,model,E,build:()=>model.build(E)};
}
for(const id of ['nether_wart','torchflower_crop'])test(id+' preserves original stage indices and renders the selected cross independently of every edited resource',()=>{
 const sample=setup(id);assert.equal(sample.record.model,'stage_cross');assert.deepEqual(sample.record.variants.up,sample.sequence);
 assert.equal(Object.keys(sample.record.bindings).length,sample.sequence.length);
 assert.ok(!Object.values(sample.record.bindings).flat().includes(sample.icon));
 for(let stage=0;stage<sample.sequence.length;stage++)for(const slot of sample.record.paths) {
  const s=setup(id,stage,slot),before=JSON.stringify(s.record);s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,2);assert.ok(m.every(mesh=>mesh.material.path===s.sequence[stage]&&mesh.material.side===2));
  assert.deepEqual(m.map(mesh=>mesh.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);assert.deepEqual(m.map(mesh=>mesh.rotation.y),[0,Math.PI/2]);
  assert.equal(JSON.stringify(s.record),before);
 }
});
test('nether wart keeps four stages despite three unique images, and the default uses the first stage',()=>{
 const s=setup('nether_wart');assert.equal(new Set(s.sequence).size,3);assert.equal(s.sequence.length,4);
 assert.deepEqual(s.record.bindings.stage_1,s.record.bindings.stage_2);s.build();assert.ok(meshesOf(s.E.group).every(mesh=>mesh.material.path===s.sequence[0]));
});
test('invalid stages, gaps and foreign indexed resources fail explicitly',()=>{
 for(const stage of [-1,4,1.5,'1']) {const s=setup('nether_wart',stage);assert.throws(s.build,/Invalid staged cross stage/);assert.equal(s.E.group.children.length,0);}
 const gap=setup('nether_wart');delete gap.E.bindings.stage_1;assert.throws(gap.build,/Invalid staged cross stage/);
 const foreign=setup('nether_wart').record;foreign.paths=foreign.paths.filter(path=>!path.endsWith('stage_2'));assert.throws(()=>modelPartBindings(foreign),/Missing or invalid staged cross sequence/);
});
test('missing materials and allocation failure never attach a partial cross or mutate material sidedness',()=>{
 const missing=setup('torchflower_crop',1);delete missing.E.mats[missing.sequence[1]];assert.throws(missing.build,/Missing planar material/);assert.equal(missing.E.group.children.length,0);
 const s=setup('torchflower_crop'),Base=s.Three.PlaneGeometry;
 s.Three.PlaneGeometry=class extends Base {constructor(...args){if(s.Three.created.length===1)throw new Error('allocation');super(...args);}};
 assert.throws(s.build,/allocation/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));assert.equal(s.E.mats[s.sequence[0]].side,undefined);
});
