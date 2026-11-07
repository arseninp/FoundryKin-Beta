import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const controls=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(id='pitcher_crop',state={})=>({model:'pitcher',object:{id,card:id,form:'native'},state,paths:['pod.png','leaf.png'],slot:'pod.png'});
test('pitcher defaults, typed stages and bilingual labels follow each source',()=>{
 for(const id of ['pitcher_crop','pitcher_plant']) {
  const {schema,state}=controls.previewControlSpec({},plan(id)),plant=id==='pitcher_plant';
  assert.deepEqual(schema.map(item=>item.key),['stage','pod_only']);
  assert.deepEqual(schema[0].values.map(item=>item.value),plant?[4]:[0,1,2,3,4]);
  assert.deepEqual(schema[0].label,['Growth stage','Стадия роста']);
  assert.deepEqual(schema[1].values.map(item=>item.value),[false,true]);
  assert.deepEqual(schema[1].values[1].label,['Pod only','Только стручок']);
  assert.deepEqual(state,{stage:plant?4:0,pod_only:false});
 }
});
test('pitcher stages and pod view are independent of PNG and preserve input',()=>{
 for(const id of ['pitcher_crop','pitcher_plant'])for(const stage of id==='pitcher_plant'?[4]:[0,1,2,3,4])for(const pod_only of [false,true]) {
  const p=plan(id,{stage,pod_only}),before=JSON.stringify(p),spec=controls.previewControlSpec({},p);
  for(const texture of p.paths) {
   const result=controls.previewControlSelection(p,{...spec.state,texture,form:'native'});
   assert.deepEqual(result.state,{stage,pod_only});assert.equal(result.slot,texture);assert.equal(result.form,'native');
  }
  assert.equal(JSON.stringify(p),before);
 }
});
test('pitcher controls reject invalid stages, pod types and source IDs',()=>{
 for(const id of ['pitcher_crop','pitcher_plant']) {
  for(const stage of [null,-1,5,1.5,'4',false,...(id==='pitcher_plant'?[0,1,2,3]:[])]) {
   assert.throws(()=>controls.previewControlSpec({},plan(id,{stage})),/Invalid pitcher/);
   assert.throws(()=>controls.previewControlSelection(plan(id),{stage}),/Invalid pitcher/);
  }
  for(const pod_only of [null,'true',0,1,[],{}]) {
   assert.throws(()=>controls.previewControlSpec({},plan(id,{pod_only})),/Invalid pitcher/);
   assert.throws(()=>controls.previewControlSelection(plan(id),{pod_only}),/Invalid pitcher/);
  }
 }
 assert.throws(()=>controls.previewFields({},plan('unknown')),/Invalid pitcher/);
 assert.throws(()=>controls.previewControlSelection(plan('unknown'),{}),/Invalid pitcher/);
});
test('pitcher fields are isolated and moss, stages and azalea stay available',()=>{
 const first=controls.previewFields({},plan());first[0][1][0][1]=99;
 assert.equal(controls.previewFields({},plan())[0][1][0][1],0);
 for(const model of ['crop','stage_cross'])assert.equal(controls.previewFields({},{model,object:{id:'test',card:'test'},state:{},stages:4})[0][1].length,4);
 for(const model of ['azalea','potted_azalea'])assert.equal(controls.previewFields({},{model,object:{id:'azalea',card:'azalea'},state:{}})[0][0],'potted');
 assert.equal(controls.previewFields({},{model:'pale_moss_carpet',object:{id:'pale_moss_carpet',card:'pale_moss_carpet'},state:{}}).length,5);
 assert.deepEqual(controls.previewControlSelection(plan('pitcher_plant'),{texture:'leaf.png'}).state,{stage:4,pod_only:false});
});
