import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createGrowthModels} from '../models/growth.mjs';
import {createCaveVineModels} from '../models/cave-vines.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
// Selected definitions and sequences from blocks-000 and terrain-000 at PIN 46ba6ea.
const BLOCKS={
 cave_vines:{sound:'cave_vines',textures:{down:'cave_vines_head',side:'cave_vines_body',up:'cave_vines_body'}},
 cave_vines_body_with_berries:{sound:'cave_vines',textures:{down:'cave_vines_body',side:'cave_vines_body',up:'cave_vines_body'}},
 cave_vines_head_with_berries:{sound:'cave_vines',textures:{down:'cave_vines_head',side:'cave_vines_head',up:'cave_vines_head'}}
};
const ATLAS={cave_vines_body:{textures:[P+'cave_vines_body',P+'cave_vines_body_berries']},cave_vines_head:{textures:[P+'cave_vines_head',P+'cave_vines_head_berries']}};
const IDS=Object.keys(BLOCKS);
function setup(id,state={},slot) {
 const record=normalizeBlock(id,BLOCKS[id],ATLAS,{model:SPECIAL_MODELS[id]}),Three=createThreeMock(),model=createCaveVineModels(Three).find(m=>m.id===record.model);
 const E={cur:id,state,slot:slot??record.paths[0],bindings:Object.fromEntries(Object.entries(record.bindings).map(([role,paths])=>[role,paths[0]])),mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {record,Three,model,E,build:()=>model.build(E)};
}
const snapshot=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,pos:[m.position.x,m.position.y,m.position.z],rotation:[m.rotation.x,m.rotation.y,m.rotation.z],path:m.material.path}));
test('three exact assignments reuse two registered descriptors with correct camera classes',()=>{
 assert.equal(SPECIAL_MODELS.cave_vines,'cave_vines');
 for(const id of IDS.slice(1))assert.equal(SPECIAL_MODELS[id],'cave_vines_part');
 assert.equal(Object.hasOwn(SPECIAL_MODELS,'future_cave_vines'),false);
 assert.deepEqual(createCaveVineModels(createThreeMock()).map(m=>m.id),['cave_vines','cave_vines_part']);
 assert.deepEqual(createGrowthModels(createThreeMock()).map(m=>m.id),['crop','turtle_egg','vines','sniffer_egg']);
 assert.throws(()=>createCaveVineModels({}),/require Three/);
 for(const id of IDS)assert.equal(setup(id).model.scale,id==='cave_vines'?1.4:1);
});
test('pinned normalization keeps both berry alternatives and separate body and head resources',()=>{
 const before=JSON.stringify({BLOCKS,ATLAS});
 for(const id of IDS) {
  const {record}=setup(id);assert.equal(record.paths.length,id==='cave_vines'?4:2);
  const roles=id==='cave_vines'?['body','head']:[id.includes('_body_')?'body':'head'];
  assert.deepEqual(Object.keys(record.bindings),roles.flatMap(role=>[role+'_plain',role+'_berries']));
  for(const role of roles){assert.deepEqual(record.bindings[role+'_plain'],[P+'cave_vines_'+role]);assert.deepEqual(record.bindings[role+'_berries'],[P+'cave_vines_'+role+'_berries']);}
 }
 assert.equal(JSON.stringify({BLOCKS,ATLAS}),before);
});
test('whole column has body above head; native part records remain one block',()=>{
 for(const id of IDS)for(const berries of [false,true]) {
  const s=setup(id,{berries});s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,id==='cave_vines'?4:2);
  assert.ok(meshes.every(m=>m.geometry.size[0]===Math.SQRT2&&m.geometry.size[1]===1));
  assert.deepEqual(meshes.map(m=>m.position.y),id==='cave_vines'?[.5,.5,-.5,-.5]:[0,0]);
  const parts=id==='cave_vines'?['body','body','head','head']:Array(2).fill(id.includes('_body_')?'body':'head');
  assert.deepEqual(meshes.map(m=>m.material.path),parts.map(part=>P+'cave_vines_'+part+(berries?'_berries':'')));
  assert.deepEqual(meshes.map(m=>m.rotation.y),id==='cave_vines'?[0,Math.PI/2,0,Math.PI/2]:[0,Math.PI/2]);
  assert.ok(meshes.every(m=>m.material===s.E.mats[m.material.path]));
 }
});
test('native berry IDs default to berries; editing any owned PNG never changes explicit state or geometry',()=>{
 for(const id of IDS) {
  const defaults=setup(id);defaults.build();assert.ok(meshesOf(defaults.E.group).every(m=>m.material.path.endsWith('_berries')===(id!=='cave_vines')));
  for(const berries of [false,true]) {
   let expected;
   for(const slot of defaults.record.paths) {
    const s=setup(id,{berries},slot),before=JSON.stringify({state:s.E.state,bindings:s.E.bindings});s.build();expected??=snapshot(s.E);assert.deepEqual(snapshot(s.E),expected);assert.equal(JSON.stringify({state:s.E.state,bindings:s.E.bindings}),before);
   }
  }
 }
});
test('incomplete, sparse, foreign, or wrongly assigned part sequences reject during normalization',()=>{
 for(const id of IDS)for(const change of [r=>r.variants.up.pop(),r=>{delete r.variants.up[0];},r=>{r.variants.up[0]=P+'foreign';},r=>{r.id='future_cave_vines';}]) {
  const r=setup(id).record;change(r);assert.throws(()=>modelPartBindings(r),/Incomplete cave vine|Unknown cave vine/);
 }
 for(const id of IDS) {
  const inventory=Object.fromEntries(setup(id).record.paths.map(path=>[path,true]));delete inventory[Object.keys(inventory)[0]];
  assert.throws(()=>normalizeBlock(id,BLOCKS[id],ATLAS,{model:SPECIAL_MODELS[id],existing:inventory}),/Missing resource file/);
 }
});
test('invalid berry state, source IDs and selected bindings fail before geometry allocation',()=>{
 for(const id of IDS) {
  for(const berries of [null,0,1,'true']){const s=setup(id,{berries});assert.throws(s.build,/Invalid cave vine berries state/);assert.equal(s.Three.created.length,0);}
  const s=setup(id,{berries:true});delete s.E.bindings[Object.keys(s.E.bindings).find(role=>role.endsWith('_berries'))];assert.throws(s.build,/Missing cave vine binding/);assert.equal(s.Three.created.length,0);
 }
 const s=setup('cave_vines');s.E.cur='unknown';assert.throws(s.build,/Unknown cave vine object/);assert.equal(s.Three.created.length,0);
});
test('missing materials and allocation failure leave the scene and material policy unchanged',()=>{
 for(const id of IDS) {
  const s=setup(id,{berries:true}),existing={};s.E.group.add(existing);delete s.E.mats[Object.values(s.E.bindings).find(path=>path.endsWith('_berries'))];const before=JSON.stringify(s.E.mats);
  assert.throws(s.build,/Missing model material/);assert.deepEqual(s.E.group.children,[existing]);assert.equal(JSON.stringify(s.E.mats),before);assert.ok(s.Three.created.every(g=>g.disposed));
  const t=setup(id),Base=t.Three.PlaneGeometry,materials=JSON.stringify(t.E.mats);t.E.group.add(existing);
  t.Three.PlaneGeometry=class extends Base{constructor(...args){if(t.Three.created.length===1)throw new Error('allocation');super(...args);}};
  assert.throws(t.build,/allocation/);assert.deepEqual(t.E.group.children,[existing]);assert.equal(JSON.stringify(t.E.mats),materials);assert.ok(t.Three.created.every(g=>g.disposed));
 }
});
test('weeping and twisting columns retain their existing orientation and bindings',()=>{
 for(const id of ['weeping_vines','twisting_vines']) {
  const Three=createThreeMock(),E={cur:id,bindings:{up:'up',down:'down'},mats:{up:{path:'up'},down:{path:'down'}},group:new Three.Group()};
  createGrowthModels(Three).find(m=>m.id==='vines').build(E);const meshes=meshesOf(E.group);assert.equal(meshes.length,4);
  assert.deepEqual(meshes.map(m=>m.material.path),['down','down','up','up']);assert.deepEqual(meshes.map(m=>m.position.y),id==='weeping_vines'?[-.5,-.5,.5,.5]:[.5,.5,-.5,-.5]);
 }
});
