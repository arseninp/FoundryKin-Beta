import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const controls=createPreviewControls({en:{stage:'Stem stage',texture:'Texture'},ru:{stage:'Стадия стебля',texture:'Текстура'}});
const plan=(stages=3,state={})=>({object:{id:'nether_wart',card:'nether_wart'},model:'stage_cross',stages,state,paths:['a','b'],slot:'a'});
test('staged cross options use the resolver stage count and numeric values',()=>{
 for(const count of [1,2,3,4,8]) {
  const result=controls.previewControlSpec({},plan(count));
  assert.equal(result.schema.length,1);
  assert.equal(result.schema[0].key,'stage');
  assert.deepEqual(result.schema[0].label,['Growth stage','Стадия роста']);
  assert.deepEqual(result.schema[0].values.map(option=>option.value),Array.from({length:count},(_,i)=>i));
  assert.deepEqual(result.state,{stage:0});
 }
});
test('selected growth stage survives while edited PNG stays independent',()=>{
 const source=plan(4,{stage:2}),spec=controls.previewControlSpec({},source);
 assert.equal(spec.state.stage,2);
 assert.deepEqual(controls.previewControlSelection(source,{stage:3,texture:'b'}),{form:undefined,slot:'b',state:{stage:3}});
 assert.equal(source.state.stage,2);
 assert.equal(source.slot,'a');
 assert.equal(controls.previewTextureField(source).values.length,2);
});
test('invalid stage counts and selected stages are rejected',()=>{
 for(const count of [undefined,null,0,-1,1.5,'3',NaN,Infinity]) {
  const source=plan();source.stages=count;
  assert.throws(()=>controls.previewControlSpec({},source),/control stages/);
 }
 for(const stage of [-1,3,1.5,'1',NaN,Infinity])assert.throws(()=>controls.previewControlSpec({},plan(3,{stage})),/control stage/);
});
test('returned fields are independent and unrelated controls are preserved',()=>{
 const first=controls.previewFields({},plan());first[0][1][0][1]=99;
 assert.equal(controls.previewFields({},plan())[0][1][0][1],0);
 const stem=controls.previewControlSpec({},{object:{id:'pumpkin',card:'pumpkin'},model:'pumpkin',state:{}});
 assert.equal(stem.state.stage,7);
 assert.deepEqual(stem.schema.find(field=>field.key==='stage').label,['Stem stage','Стадия стебля']);
 const plain=controls.previewControlSpec({},{object:{id:'fern',card:'fern'},model:'cross',state:{}});
 assert.equal(plain.schema,null);
});
