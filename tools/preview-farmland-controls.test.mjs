import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(model='farmland',state={})=>({model,object:{id:model,card:model,form:'native'},state});
test('farmland has wet default and bilingual typed choices',()=>{
 const spec=c.previewControlSpec({},plan());
 assert.deepEqual(spec.state,{wet:true});
 assert.deepEqual(spec.schema,[{key:'wet',label:['Moisture','Влажность'],values:[{value:false,label:['Dry','Сухая']},{value:true,label:['Moist','Увлажнённая']}]}]);
 assert.deepEqual(c.previewControlSelection(plan(),{texture:'a.png'}).state,{wet:true});
});
test('moisture reverses independently from PNG without mutating plans',()=>{
 for(const wet of [false,true])for(const texture of ['a.png','b.png']) {
  const p=plan('farmland',{wet:!wet}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSelection(p,{wet,texture,form:'native'}),{form:'native',slot:texture,state:{wet}});
  assert.deepEqual(c.previewControlSpec({},plan('farmland',{wet})).state,{wet});assert.equal(JSON.stringify(p),before);
 }
});
test('invalid wet values fail at both entry points',()=>{
 for(const wet of [null,0,1,'true',[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan('farmland',{wet})),/Invalid farmland control wet/);
  assert.throws(()=>c.previewControlSelection(plan(),{wet}),/Invalid farmland control wet/);
 }
 assert.throws(()=>c.previewControlSpec({},plan('farmland',null)),/Invalid farmland control state/);
});
test('cocoa, chorus, azalea and berries retain their defaults',()=>{
 assert.deepEqual(c.previewControlSpec({},plan('cocoa')).state,{stage:2});
 for(const stage of [0,1,2])assert.equal(c.previewControlSelection(plan('cocoa'),{stage,texture:'x.png'}).state.stage,stage);
 assert.deepEqual(c.previewControlSpec({},plan('chorus_flower')).state,{dead:false});
 assert.equal(c.previewControlSpec({},plan('chorus_plant')).schema.length,6);
 for(const model of ['azalea','potted_azalea'])assert.deepEqual(c.previewControlSpec({},plan(model)).state,{potted:false});
 assert.deepEqual(c.previewControlSpec({},plan('cave_vines')).state,{berries:false});assert.deepEqual(c.previewControlSpec({},plan('cave_vines_part')).state,{berries:true});
 const fields=c.previewFields({},plan());fields[0][1][0][1]='invalid';assert.equal(c.previewFields({},plan())[0][1][0][1],false);
});
