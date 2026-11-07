import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(model='cocoa',state={},extra={})=>({model,object:{id:model,card:model,form:'native'},state,...extra});
test('cocoa exposes numeric stages 0..2, mature default and EN/RU',()=>{
 const p=plan(),spec=c.previewControlSpec({},p);
 assert.deepEqual(spec.state,{stage:2});assert.equal(spec.schema.length,1);
 assert.deepEqual(spec.schema[0],{key:'stage',label:['Growth stage','Стадия роста'],values:[0,1,2].map(value=>({value,label:[String(value),String(value)]}))});
 assert.deepEqual(c.previewControlSelection(p,{texture:'a.png'}).state,{stage:2});
});
test('cocoa stages round trip independently from PNG and preserve plans',()=>{
 for(const stage of [0,1,2])for(const texture of ['a.png','b.png']) {
  const p=plan('cocoa',{stage}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSpec({},p).state,{stage});
  const result=c.previewControlSelection(p,{stage,texture,form:'native'});
  assert.deepEqual(result,{form:'native',slot:texture,state:{stage}});assert.equal(JSON.stringify(p),before);
 }
 const p=plan('cocoa',{stage:2});assert.equal(c.previewControlSelection(p,{stage:0,texture:'b.png'}).state.stage,0);
 const fields=c.previewFields({},p);fields[0][1][0][1]=99;assert.equal(c.previewFields({},p)[0][1][0][1],0);
});
test('invalid cocoa stages fail in schemas and selections',()=>{
 for(const stage of [-1,3,1.5,'1',null,false,NaN,Infinity,[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan('cocoa',{stage})),/Invalid cocoa control stage/);
  assert.throws(()=>c.previewControlSelection(plan(),{stage}),/Invalid cocoa control stage/);
 }
 assert.throws(()=>c.previewControlSpec({},plan('cocoa',null)),/Invalid cocoa control state/);
});
test('earlier stage, chorus, pot, berry, pitcher and moss controls remain available',()=>{
 for(const model of ['stage_cross','crop']) {
  const spec=c.previewControlSpec({},plan(model,{stage:3},{stages:4}));
  assert.deepEqual(spec.state,{stage:3});assert.deepEqual(spec.schema[0].values.map(v=>v.value),[0,1,2,3]);
  assert.throws(()=>c.previewControlSpec({},plan(model,{stage:4},{stages:4})),/Invalid/);
 }
 assert.deepEqual(c.previewControlSpec({},plan('chorus_plant')).schema.map(v=>v.key),['north','south','east','west','up','down']);
 assert.deepEqual(c.previewControlSpec({},plan('chorus_flower',{dead:true})).state,{dead:true});
 for(const model of ['azalea','potted_azalea'])assert.deepEqual(c.previewControlSpec({},plan(model,{potted:true})).state,{potted:true});
 assert.deepEqual(c.previewControlSpec({},plan('cave_vines')).state,{berries:false});assert.deepEqual(c.previewControlSpec({},plan('cave_vines_part')).state,{berries:true});
 assert.deepEqual(c.previewControlSpec({},plan('pitcher',{stage:4},{object:{id:'pitcher_plant',card:'pitcher_plant',form:'native'}})).state,{stage:4,pod_only:false});
 assert.deepEqual(c.previewControlSpec({},plan('pale_moss_carpet')).state,{upper_block_bit:false,pale_moss_carpet_side_north:'none',pale_moss_carpet_side_south:'none',pale_moss_carpet_side_east:'none',pale_moss_carpet_side_west:'none'});
});
