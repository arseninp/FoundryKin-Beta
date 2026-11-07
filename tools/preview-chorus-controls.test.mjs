import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}}),dirs=['north','south','east','west','up','down'];
const plan=(model,state={})=>({model,object:{id:model,card:model,form:'native'},state});
test('chorus schemas expose typed defaults and bilingual labels',()=>{
 const p=c.previewControlSpec({},plan('chorus_plant'));
 assert.deepEqual(p.schema.map(item=>item.key),dirs);assert.deepEqual(p.state,Object.fromEntries(dirs.map(key=>[key,false])));
 assert.deepEqual(p.schema[0].label,['North connection','Соединение: север']);
 for(const item of p.schema)assert.deepEqual(item.values,[{value:false,label:['Disconnected','Нет']},{value:true,label:['Connected','Есть']}]);
 const f=c.previewControlSpec({},plan('chorus_flower'));assert.deepEqual(f.state,{dead:false});
 assert.deepEqual(f.schema[0].values,[{value:false,label:['Living','Живой']},{value:true,label:['Dead','Мёртвый']}]);
});
test('all 64 connections and both flower states round trip independently from PNG',()=>{
 for(let mask=0;mask<64;mask++) {
  const state=Object.fromEntries(dirs.map((key,i)=>[key,Boolean(mask&(1<<i))])),p=plan('chorus_plant',state),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSpec({},p).state,state);
  for(const texture of ['a.png','b.png']) {const result=c.previewControlSelection(p,{...state,texture,form:'native'});assert.deepEqual(result.state,state);assert.equal(result.slot,texture);assert.equal(result.form,'native');}
  assert.equal(JSON.stringify(p),before);
 }
 for(const dead of [false,true])assert.deepEqual(c.previewControlSelection(plan('chorus_flower',{dead:!dead}),{dead,texture:'other.png'}).state,{dead});
});
test('invalid chorus booleans fail at both entry points',()=>{
 for(const [model,keys] of [['chorus_plant',dirs],['chorus_flower',['dead']]])for(const key of keys)for(const value of [null,0,1,'true',[],{}]) {
  assert.throws(()=>c.previewControlSpec({},plan(model,{[key]:value})),/Invalid chorus/);assert.throws(()=>c.previewControlSelection(plan(model),{[key]:value}),/Invalid chorus/);
 }
});
test('defaults and field isolation preserve berries, pitcher, moss and earlier controls',()=>{
 const p=plan('chorus_plant'),fields=c.previewFields({},p);fields[0][1][0][1]='changed';assert.equal(c.previewFields({},p)[0][1][0][1],false);
 assert.deepEqual(c.previewControlSelection(plan('chorus_flower'),{texture:'a.png'}).state,{dead:false});
 assert.deepEqual(c.previewControlSpec({},plan('cave_vines')).state,{berries:false});assert.deepEqual(c.previewControlSpec({},plan('cave_vines_part')).state,{berries:true});
 assert.deepEqual(c.previewControlSpec({},{...plan('pitcher',{stage:4}),object:{id:'pitcher_plant',card:'pitcher_plant',form:'native'}}).state,{stage:4,pod_only:false});
});
