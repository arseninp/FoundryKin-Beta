import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const controls=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(id='azalea',potted=false)=>({object:{id,card:id},model:potted?'potted_azalea':'azalea',state:{potted},paths:['plant','pot','soil'],slot:'plant'});
test('both azaleas retain a boolean pot toggle in both model states',()=>{
 for(const id of ['azalea','flowering_azalea'])for(const potted of [false,true]) {
  const spec=controls.previewControlSpec({},plan(id,potted));
  assert.deepEqual(spec.schema.map(field=>field.key),['potted']);
  assert.deepEqual(spec.schema[0].label,['Pot','Горшок']);
  assert.deepEqual(spec.schema[0].values,[{value:false,label:['Without pot','Без горшка']},{value:true,label:['Potted','В горшке']}]);
  assert.deepEqual(spec.state,{potted});
 }
});
test('pot selection can be reversed independently of PNG without mutating the plan',()=>{
 for(const id of ['azalea','flowering_azalea']) {
  const bare=plan(id),potted=plan(id,true);
  assert.deepEqual(controls.previewControlSelection(bare,{potted:true,texture:'pot'}),{form:undefined,slot:'pot',state:{potted:true}});
  assert.deepEqual(controls.previewControlSelection(potted,{potted:false,texture:'soil'}),{form:undefined,slot:'soil',state:{potted:false}});
  assert.equal(bare.state.potted,false);assert.equal(potted.state.potted,true);
  assert.equal(bare.slot,'plant');assert.equal(potted.slot,'plant');
 }
});
test('pot defaults to false and returned field options are isolated',()=>{
 const source=plan();source.state={};
 assert.deepEqual(controls.previewControlSpec({},source).state,{potted:false});
 const fields=controls.previewFields({},source);fields[0][1][0][1]=true;
 assert.equal(controls.previewFields({},source)[0][1][0][1],false);
});
test('pot labels allow model overrides and unrelated models get no pot toggle',()=>{
 const localized=createPreviewControls({en:{potted_azalea_potted:'Container'},ru:{potted_azalea_potted:'Ёмкость'}});
 assert.deepEqual(localized.previewControlSpec({},plan('azalea',true)).schema[0].label,['Container','Ёмкость']);
 for(const model of ['flower_pot','cross'])assert.equal(controls.previewControlSpec({},{object:{id:'test',card:'test'},model,state:{}}).schema,null);
});
