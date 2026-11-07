import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plans=[['cave_vines','cave_vines',false],['cave_vines_part','cave_vines_body_with_berries',true],['cave_vines_part','cave_vines_head_with_berries',true]];
const plan=(model,id,state={})=>({model,object:{id,card:id,form:'native'},state});
test('berry controls expose typed source defaults and EN/RU labels',()=>{
 for(const [model,id,berries] of plans) {
  const spec=c.previewControlSpec({},plan(model,id));
  assert.deepEqual(spec.state,{berries});assert.equal(spec.schema.length,1);
  assert.deepEqual(spec.schema[0].label,['Glow berries','Светящиеся ягоды']);
  assert.deepEqual(spec.schema[0].values,[{value:false,label:['Without berries','Без ягод']},{value:true,label:['With berries','С ягодами']}]);
 }
});
test('berries switch both ways independently from PNG and preserve input',()=>{
 for(const [model,id] of plans)for(const berries of [false,true]) {
  const p=plan(model,id,{berries:!berries}),before=JSON.stringify(p);
  for(const texture of ['plain.png','berries.png']) {
   const result=c.previewControlSelection(p,{berries,texture,form:'native'});
   assert.deepEqual(result.state,{berries});assert.equal(result.slot,texture);assert.equal(result.form,'native');
   assert.equal(c.previewControlSpec({},plan(model,id,result.state)).state.berries,berries);
  }
  assert.equal(JSON.stringify(p),before);
 }
});
test('invalid berry values fail in both schema and selection',()=>{
 for(const [model,id] of plans)for(const berries of [null,0,1,'true',[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan(model,id,{berries})),/Invalid cave vine/);
  assert.throws(()=>c.previewControlSelection(plan(model,id),{berries}),/Invalid cave vine/);
 }
});
test('texture-only defaults, isolated fields and previous controls are preserved',()=>{
 for(const [model,id,berries] of plans)assert.deepEqual(c.previewControlSelection(plan(model,id),{texture:'x.png'}).state,{berries});
 const p=plan('cave_vines','cave_vines'),fields=c.previewFields({},p);fields[0][1][0][1]='changed';
 assert.equal(c.previewFields({},p)[0][1][0][1],false);
 assert.deepEqual(c.previewControlSpec({},plan('pitcher','pitcher_plant')).state,{stage:4,pod_only:false});
 assert.equal(c.previewFields({},plan('pale_moss_carpet','pale_moss_carpet')).length,5);
 for(const model of ['azalea','potted_azalea'])assert.equal(c.previewFields({},plan(model,'azalea'))[0][0],'potted');
 for(const model of ['crop','stage_cross'])assert.equal(c.previewFields({},{...plan(model,'test'),stages:4})[0][1].length,4);
});
