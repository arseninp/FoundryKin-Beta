import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}}),defaults={brown_mushroom_block:14,red_mushroom_block:14,mushroom_stem:10};
const plan=(id,state={},model='cube')=>({model,object:{id,card:id,form:'native'},state});
test('mushroom schemas expose numeric variants 0..15 and source defaults',()=>{
 for(const [id,variant] of Object.entries(defaults)) {
  const p=plan(id),spec=c.previewControlSpec({},p);assert.deepEqual(spec.state,{variant});
  assert.deepEqual(spec.schema,[{key:'variant',label:['Variant','Вариант'],values:Array.from({length:16},(_,value)=>({value,label:[String(value),String(value)]}))}]);
  assert.deepEqual(c.previewControlSelection(p,{texture:'a.png'}).state,{variant});
 }
});
test('all variants round trip independently from PNG and do not mutate plans',()=>{
 for(const id of Object.keys(defaults))for(let variant=0;variant<16;variant++)for(const texture of ['a.png','b.png']) {
  const p=plan(id,{variant:15}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSelection(p,{variant,texture,form:'native'}),{form:'native',slot:texture,state:{variant}});
  assert.deepEqual(c.previewControlSpec({},plan(id,{variant})).state,{variant});assert.equal(JSON.stringify(p),before);
 }
});
test('invalid variants fail at both entry points',()=>{
 for(const id of Object.keys(defaults))for(const variant of [-1,16,1.5,'1',null,false,NaN,Infinity,[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan(id,{variant})),/Invalid mushroom control variant/);
  assert.throws(()=>c.previewControlSelection(plan(id),{variant}),/Invalid mushroom control variant/);
 }
 assert.throws(()=>c.previewControlSpec({},plan('red_mushroom_block',null)),/Invalid mushroom control state/);
});
test('variant controls are scoped to mushroom cubes and schemas are isolated',()=>{
 for(const id of ['stone','crafter'])assert.equal(c.previewControlSpec({},plan(id)).schema,null);
 assert.equal(c.previewControlSpec({},plan('red_mushroom_block',{},'cross')).schema,null);
 const p=plan('mushroom_stem'),fields=c.previewFields({},p);fields[0][1][0][1]=99;assert.equal(c.previewFields({},p)[0][1][0][1],0);
 for(const id of ['bee_nest','beehive'])assert.deepEqual(c.previewControlSpec({},plan(id)).state,{honey:false});
});
