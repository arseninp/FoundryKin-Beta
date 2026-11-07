import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const controls=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const sides=['north','south','east','west'],levels=['none','short','tall'];
const key=side=>'pale_moss_carpet_side_'+side;
const plan=(state={})=>({model:'pale_moss_carpet',object:{id:'pale_moss_carpet',card:'pale_moss_carpet',form:'native'},state,paths:['base.png','tip.png'],slot:'base.png'});
test('moss controls expose five typed defaults and bilingual labels',()=>{
 const {schema,state}=controls.previewControlSpec({},plan());
 assert.deepEqual(schema.map(item=>item.key),['upper_block_bit',...sides.map(key)]);
 assert.deepEqual(state,{upper_block_bit:false,...Object.fromEntries(sides.map(side=>[key(side),'none']))});
 assert.deepEqual(schema[0].label,['Upper part','Верхняя часть']);
 assert.deepEqual(schema[0].values.map(item=>item.value),[false,true]);
 for(const item of schema.slice(1)) {
  assert.deepEqual(item.values.map(option=>option.value),levels);
  assert.deepEqual(item.values.map(option=>option.label),[['None','Нет'],['Short','Короткий'],['Tall','Высокий']]);
 }
});
test('all 162 moss states round trip independently from PNG and form',()=>{
 let count=0;
 for(const upper of [false,true])for(let n=0;n<81;n++) {
  let value=n;
  const state={upper_block_bit:upper};
  for(const side of sides){state[key(side)]=levels[value%3];value=Math.floor(value/3);}
  const p=plan(state),before=JSON.stringify(p),spec=controls.previewControlSpec({},p);
  assert.deepEqual(spec.state,state);
  for(const texture of p.paths) {
   const selection=controls.previewControlSelection(p,{...spec.state,texture,form:'native'});
   assert.equal(selection.slot,texture);assert.equal(selection.form,'native');assert.deepEqual(selection.state,state);
  }
  assert.equal(JSON.stringify(p),before);count++;
 }
 assert.equal(count,162);
});
test('moss controls reject invalid types and side levels at both entry points',()=>{
 for(const value of [null,'true',0,1,[],{}]) {
  assert.throws(()=>controls.previewControlSpec({},plan({upper_block_bit:value})),/Invalid pale moss/);
  assert.throws(()=>controls.previewControlSelection(plan(),{upper_block_bit:value}),/Invalid pale moss/);
 }
 for(const side of sides)for(const value of [null,false,0,'medium','',[],{}]) {
  assert.throws(()=>controls.previewControlSpec({},plan({[key(side)]:value})),/Invalid pale moss/);
  assert.throws(()=>controls.previewControlSelection(plan(),{[key(side)]:value}),/Invalid pale moss/);
 }
});
test('moss schemas are isolated and texture-only selection keeps defaults',()=>{
 const first=controls.previewFields({},plan());first[1][1][0][1]='changed';
 assert.equal(controls.previewFields({},plan())[1][1][0][1],'none');
 assert.deepEqual(controls.previewControlSelection(plan(),{texture:'tip.png'}).state,controls.previewControlSpec({},plan()).state);
 assert.equal(controls.previewTextureField(plan()).values.length,2);
});
test('existing stages, reversible azalea pot and chest controls remain intact',()=>{
 for(const model of ['stage_cross','crop']) {
  const p={model,object:{id:'test',card:'test'},state:{stage:2},stages:4};
  assert.deepEqual(controls.previewControlSpec({},p).schema[0].values.map(item=>item.value),[0,1,2,3]);
  assert.equal(controls.previewControlSelection(p,{stage:3,texture:'other.png'}).state.stage,3);
  assert.throws(()=>controls.previewFields({},{...p,state:{stage:4}}),/Invalid/);
 }
 for(const model of ['azalea','potted_azalea']) {
  const p={model,object:{id:'azalea',card:'azalea'},state:{potted:true}};
  assert.equal(controls.previewControlSpec({},p).schema[0].key,'potted');
  assert.equal(controls.previewControlSelection(p,{potted:false}).state.potted,false);
 }
 assert.deepEqual(controls.previewFields({},{model:'chest',object:{id:'ender_chest',card:'ender_chest'},state:{}}).map(item=>item[0]),['open']);
});
