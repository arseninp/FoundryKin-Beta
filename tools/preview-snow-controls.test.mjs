import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(model='snow_layer',state={})=>({model,object:{id:model,card:model,form:'native'},state});
test('snow exposes numeric layers 1..8, default 1 and EN/RU',()=>{
 const spec=c.previewControlSpec({},plan());assert.deepEqual(spec.state,{layers:1});
 assert.deepEqual(spec.schema,[{key:'layers',label:['Layers','Слои'],values:Array.from({length:8},(_,i)=>({value:i+1,label:[String(i+1),String(i+1)]}))}]);
 assert.deepEqual(c.previewControlSelection(plan(),{texture:'a.png'}).state,{layers:1});
});
test('all eight layer counts round trip independently from PNG',()=>{
 for(let layers=1;layers<=8;layers++)for(const texture of ['a.png','b.png']) {
  const p=plan('snow_layer',{layers:8}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSelection(p,{layers,texture,form:'native'}),{form:'native',slot:texture,state:{layers}});
  assert.deepEqual(c.previewControlSpec({},plan('snow_layer',{layers})).state,{layers});assert.equal(JSON.stringify(p),before);
 }
});
test('invalid snow counts fail in schemas and selections',()=>{
 for(const layers of [-1,0,9,1.5,'1',null,false,NaN,Infinity,[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan('snow_layer',{layers})),/Invalid snow control layers/);
  assert.throws(()=>c.previewControlSelection(plan(),{layers}),/Invalid snow control layers/);
 }
 assert.throws(()=>c.previewControlSpec({},plan('snow_layer',null)),/Invalid snow control state/);
});
test('farmland and previous controls retain defaults and typed values',()=>{
 assert.deepEqual(c.previewControlSpec({},plan('farmland')).state,{wet:true});
 for(const wet of [false,true])assert.equal(c.previewControlSelection(plan('farmland'),{wet,texture:'x.png'}).state.wet,wet);
 assert.deepEqual(c.previewControlSpec({},plan('cocoa')).state,{stage:2});
 assert.deepEqual(c.previewControlSpec({},plan('chorus_flower')).state,{dead:false});
 assert.equal(c.previewControlSpec({},plan('chorus_plant')).schema.length,6);
 for(const model of ['azalea','potted_azalea'])assert.deepEqual(c.previewControlSpec({},plan(model)).state,{potted:false});
 assert.deepEqual(c.previewControlSpec({},plan('cave_vines')).state,{berries:false});assert.deepEqual(c.previewControlSpec({},plan('cave_vines_part')).state,{berries:true});
 const fields=c.previewFields({},plan());fields[0][1][0][1]=0;assert.equal(c.previewFields({},plan())[0][1][0][1],1);
});
