import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const controls=createPreviewControls({en:{stage:'Stem stage',texture:'Texture'},ru:{stage:'Стадия стебля',texture:'Текстура'}});
const plan=(id='wheat',stages=4,state={})=>({object:{id,card:id},model:'crop',stages,state,paths:['a','b'],slot:'a'});
test('crop stages come from each plan rather than a fixed crop count',()=>{
 for(const id of ['wheat','carrots','potatoes','beetroot'])for(const stages of [1,3,4,8]) {
  const spec=controls.previewControlSpec({},plan(id,stages));
  assert.deepEqual(spec.schema.map(field=>field.key),['stage']);
  assert.deepEqual(spec.schema[0].label,['Growth stage','Стадия роста']);
  assert.deepEqual(spec.schema[0].values.map(option=>option.value),Array.from({length:stages},(_,i)=>i));
  assert.deepEqual(spec.state,{stage:0});
 }
});
test('crop stage selection is independent of the edited PNG and does not mutate the plan',()=>{
 const source=plan('carrots',4,{stage:2}),spec=controls.previewControlSpec({},source);
 assert.equal(spec.state.stage,2);
 assert.deepEqual(controls.previewControlSelection(source,{stage:3,texture:'b'}),{form:undefined,slot:'b',state:{stage:3}});
 assert.equal(source.state.stage,2);
 assert.equal(source.slot,'a');
 assert.equal(controls.previewTextureField(source).values.length,2);
});
test('crop rejects missing or invalid stage counts and out-of-range selected stages',()=>{
 for(const stages of [undefined,null,0,-1,1.5,'4',NaN,Infinity]) {
  const source=plan();source.stages=stages;
  assert.throws(()=>controls.previewControlSpec({},source),/crop control stages/);
 }
 for(const stage of [-1,4,1.5,'2',NaN,Infinity])assert.throws(()=>controls.previewControlSpec({},plan('wheat',4,{stage})),/crop control stage/);
});
test('crop field copies are isolated and model-specific labels can override defaults',()=>{
 const source=plan(),first=controls.previewFields({},source);first[0][1][0][1]=99;
 assert.equal(controls.previewFields({},source)[0][1][0][1],0);
 const localized=createPreviewControls({en:{crop_stage:'Crop stage'},ru:{crop_stage:'Стадия посева'}});
 assert.deepEqual(localized.previewControlSpec({},source).schema[0].label,['Crop stage','Стадия посева']);
});
