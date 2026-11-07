import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(id='bee_nest',state={},model='cube')=>({model,object:{id,card:id,form:'native'},state});
test('both hives expose typed honey defaults and EN/RU',()=>{
 for(const id of ['bee_nest','beehive']) {
  const p=plan(id),spec=c.previewControlSpec({},p);
  assert.deepEqual(spec.state,{honey:false});
  assert.deepEqual(spec.schema,[{key:'honey',label:['Honey','Мёд'],values:[{value:false,label:['Without honey','Без мёда']},{value:true,label:['With honey','С мёдом']}]}]);
  assert.deepEqual(c.previewControlSelection(p,{texture:'a.png'}).state,{honey:false});
 }
});
test('honey reverses independently from PNG without plan mutation',()=>{
 for(const id of ['bee_nest','beehive'])for(const honey of [false,true])for(const texture of ['a.png','b.png']) {
  const p=plan(id,{honey:!honey}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSelection(p,{honey,texture,form:'native'}),{form:'native',slot:texture,state:{honey}});
  assert.deepEqual(c.previewControlSpec({},plan(id,{honey})).state,{honey});assert.equal(JSON.stringify(p),before);
 }
});
test('invalid hive booleans fail in schemas and selections',()=>{
 for(const id of ['bee_nest','beehive'])for(const honey of [null,0,1,'true',[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan(id,{honey})),/Invalid hive control honey/);
  assert.throws(()=>c.previewControlSelection(plan(id),{honey}),/Invalid hive control honey/);
 }
 assert.throws(()=>c.previewControlSpec({},plan('beehive',null)),/Invalid hive control state/);
});
test('honey controls do not leak to other cubes or mismatched models',()=>{
 for(const id of ['stone','red_mushroom_block','crafter'])assert.equal((c.previewControlSpec({},plan(id)).schema??[]).some(field=>field.key==='honey'),false);
 assert.equal(c.previewControlSpec({},plan('bee_nest',{},'cross')).schema,null);
 const fields=c.previewFields({},plan());fields[0][1][0][1]='invalid';assert.equal(c.previewFields({},plan())[0][1][0][1],false);
});
test('earlier controls retain their defaults and stages',()=>{
 for(const [model,state] of [['snow_layer',{layers:1}],['farmland',{wet:true}],['cocoa',{stage:2}],['chorus_flower',{dead:false}],['azalea',{potted:false}],['potted_azalea',{potted:false}],['cave_vines',{berries:false}],['cave_vines_part',{berries:true}]])assert.deepEqual(c.previewControlSpec({},plan(model,{},model)).state,state);
 assert.equal(c.previewControlSpec({},plan('chorus_plant',{},'chorus_plant')).schema.length,6);
 for(const model of ['crop','stage_cross'])assert.deepEqual(c.previewControlSpec({},{...plan(model,{},model),stages:4}).schema[0].values.map(v=>v.value),[0,1,2,3]);
});
