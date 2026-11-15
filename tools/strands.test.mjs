/* Segmented contracts use the production library, resources and resolver. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelLibrary} from '../models/library.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const PARTS=['base','middle','frustum','tip','tip_merge'],P='textures/blocks/';
function setup(){
 const paths={pale_hanging_moss:['middle','tip'].map(part=>P+'pale_hanging_moss_'+part),sulfur_spike:['down','up'].flatMap(direction=>PARTS.map(part=>P+'sulfur_spike_'+direction+'_'+part)),pointed_dripstone:['down','up'].flatMap(direction=>PARTS.map(part=>P+'pointed_dripstone_'+direction+'_'+(part==='tip_merge'?'merge':part))),bamboo_fence:[P+'bamboo_fence'],stone:[P+'stone']};
 const atlas={moss_middle:{textures:paths.pale_hanging_moss[0]},moss_tip:{textures:paths.pale_hanging_moss[1]},sulfur:{textures:paths.sulfur_spike},dripstone:{textures:paths.pointed_dripstone},bamboo:{textures:paths.bamboo_fence[0]},stone:{textures:paths.stone[0]}};
 const definitions={pale_hanging_moss:{textures:'moss_middle',carried_textures:'moss_tip'},sulfur_spike:{textures:'sulfur'},pointed_dripstone:{textures:'dripstone'},bamboo_fence:{textures:'bamboo'},stone:{textures:'stone'}};
 const models={pale_hanging_moss:'pale_hanging_moss',sulfur_spike:'sulfur_spike',pointed_dripstone:'pointed_dripstone',bamboo_fence:'bamboo_fence',stone:'cube'};
 const existing=Object.fromEntries(Object.values(paths).flat().map(path=>[path,{}]));
 const records=Object.fromEntries(Object.entries(definitions).map(([id,definition])=>[id,normalizeBlock(id,definition,atlas,{model:models[id],existing})]));
 const catalog={schema:1,records,items:{},aliases:{},families:{},resources:{}},Three=createThreeMock(),registry=createModelLibrary(Three);
 registry.validate(records);const resolve=createPreviewResolver(catalog,registry,Three);
 function render(id,state={},slot){
  const plan=resolve({id,state,slot}),group=new Three.Group(),mats=Object.fromEntries(records[id].paths.map(path=>[path,{path}]));
  plan.build({group,mats});return {plan,group,meshes:meshesOf(group)};
 }
 return {paths,atlas,definitions,models,existing,records,catalog,registry,resolve,render};
}
function snapshot(meshes){return meshes.map(mesh=>({path:mesh.material.path,size:mesh.geometry.size,uv:mesh.geometry.rows,position:[mesh.position.x,mesh.position.y,mesh.position.z],rotation:[mesh.rotation.x,mesh.rotation.y,mesh.rotation.z],side:mesh.material.side}));}
test('all original paths remain selectable: two moss and ten spike textures',()=>{
 const s=setup();assert.equal(s.records.pale_hanging_moss.paths.length,2);assert.equal(s.records.sulfur_spike.paths.length,10);
 for(const id of ['pale_hanging_moss','sulfur_spike']){
  assert.deepEqual(s.records[id].paths,[...s.paths[id]].sort());
  for(const slot of s.paths[id]){const plan=s.resolve({id,slot});assert.equal(plan.slot,slot);assert.deepEqual([...plan.paths].sort(),[...s.paths[id]].sort());}
 }
});
test('hanging moss is a continuous middle and tip cross, independent of selected PNG',()=>{
 const s=setup();let reference;
 for(const slot of s.paths.pale_hanging_moss){
  const {meshes}=s.render('pale_hanging_moss',{},slot);assert.equal(meshes.length,4);
  assert.deepEqual(meshes.map(mesh=>mesh.position.y),[.5,.5,-.5,-.5]);
  assert.deepEqual(meshes.map(mesh=>mesh.material.path),[s.paths.pale_hanging_moss[0],s.paths.pale_hanging_moss[0],s.paths.pale_hanging_moss[1],s.paths.pale_hanging_moss[1]]);
  for(const mesh of meshes){assert.deepEqual(mesh.geometry.size,[Math.SQRT2,1]);assert.equal(mesh.material.side,2);}
  const shape=snapshot(meshes);reference??=shape;assert.deepEqual(shape,reference);
 }
});
test('all four sulfur states preserve orientation and merged tip across every selected PNG',()=>{
 const s=setup(),before=JSON.stringify(s.catalog);
 for(const direction of ['down','up'])for(const merged of [false,true]){
  let reference;const order=['base','middle','frustum',merged?'tip_merge':'tip'];
  for(const slot of s.paths.sulfur_spike){
   const {plan,meshes}=s.render('sulfur_spike',{direction,merged},slot);assert.equal(plan.slot,slot);assert.equal(meshes.length,8);assert.deepEqual(plan.state,{direction,merged});
   meshes.forEach((mesh,i)=>{const k=Math.floor(i/2);assert.equal(mesh.material.path,P+'sulfur_spike_'+direction+'_'+order[k]);assert.equal(mesh.position.y,direction==='up'?-.75+k*.5:.75-k*.5);assert.deepEqual(mesh.geometry.size,[Math.SQRT2*.5,.5]);assert.equal(mesh.rotation.y,i%2?Math.PI/2:0);});
   const shape=snapshot(meshes);reference??=shape;assert.deepEqual(shape,reference);
  }
 }
 const defaults=s.resolve({id:'sulfur_spike'});assert.deepEqual(defaults.state,{direction:'down',merged:false});
 assert.throws(()=>s.resolve({id:'sulfur_spike',state:{direction:'sideways'}}),/Invalid sulfur/);
 assert.throws(()=>s.resolve({id:'sulfur_spike',state:{merged:'yes'}}),/Invalid sulfur/);
 assert.equal(JSON.stringify(s.catalog),before);
});
test('the shared registry still builds dripstone, bamboo fence and cube without legacy delegation',()=>{
 const s=setup();assert.equal(s.render('pointed_dripstone').meshes.length,8);assert.equal(s.render('bamboo_fence').meshes.length,26);assert.equal(s.render('stone').meshes.length,1);
 for(const id of ['pointed_dripstone','sulfur_spike','pale_hanging_moss'])assert.equal(s.registry.get(id).scale,1.4);
 assert.equal(s.registry.get('cube').scale,1);assert.throws(()=>s.registry.build('unknown',{}),/Unknown/);
});
test('missing inventory or declared segmented resources fail rather than inventing paths',()=>{
 const s=setup(),missing={...s.existing};delete missing[P+'pale_hanging_moss_tip'];
 assert.throws(()=>normalizeBlock('pale_hanging_moss',s.definitions.pale_hanging_moss,s.atlas,{model:'pale_hanging_moss',existing:missing}),/Missing resource file/);
 s.records.pale_hanging_moss.paths=s.records.pale_hanging_moss.paths.filter(path=>path!==P+'pale_hanging_moss_tip');
 assert.throws(()=>s.resolve({id:'pale_hanging_moss'}),/Missing or ambiguous model resource/);
 const spike=setup();spike.records.sulfur_spike.paths=spike.records.sulfur_spike.paths.filter(path=>path!==P+'sulfur_spike_up_tip_merge');
 assert.throws(()=>spike.resolve({id:'sulfur_spike'}),/Missing or ambiguous model resource/);
});
