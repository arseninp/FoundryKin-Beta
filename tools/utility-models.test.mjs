import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkshopModels} from '../models/workshop.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {compileStateGroups,powerRules} from '../catalog/states.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function record(id) {
 if(id==='cauldron') {
  const names={up:'cauldron_top',down:'cauldron_bottom',north:'cauldron_side',south:'cauldron_inner',east:'water_still_grey',west:'cauldron_water'};
  const faces=Object.fromEntries(Object.entries(names).map(([face,name])=>[face,[P+name]]));
  return {id,model:'cauldron',faces,paths:Object.values(faces).flat()};
 }
 if(id==='cocoa') {
  const paths=[0,1,2].map(n=>P+'cocoa_stage_'+n);
  return {id,model:'cocoa',variants:{up:paths},paths};
 }
 const top=[P+'daylight_detector_top',P+'daylight_detector_inverted_top'],side=P+'daylight_detector_side';
 return {id,model:'daylight',variants:{up:top},faces:{up:top,down:[side],north:[side]},paths:[...top,side]};
}
function setup(id,state={},slot) {
 const r=record(id),bindings=Object.fromEntries(Object.entries(utilityBindings(r)).map(([role,paths])=>[role,paths[0]]));
 const Three=createThreeMock(),model=createWorkshopModels(Three).find(m=>m.id===r.model);
 const E={cur:id,state,slot,bindings,mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {r,Three,model,E,build:()=>model.build(E)};
}
test('four explicit records reuse three new builders in the existing workshop factory',()=>{
 for(const [id,model] of Object.entries({cauldron:'cauldron',cocoa:'cocoa',daylight_detector:'daylight',daylight_detector_inverted:'daylight'}))assert.equal(SPECIAL_MODELS[id],model);
 assert.deepEqual(createWorkshopModels(createThreeMock()).map(m=>m.id),['hopper','grindstone','frame','cauldron','cocoa','daylight']);
 assert.equal(utilityBindings({model:'other'}),null);
});
test('cauldron preserves its hollow walls, floor, feet and optional liquid plane',()=>{
 for(const content of ['empty','water','colored_water']) {
  const s=setup('cauldron',{content});s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,content==='empty'?66:67);
  if(content!=='empty') {
   const liquid=m.at(-1);assert.equal(liquid.material.path,s.E.bindings[content]);assert.equal(liquid.position.y,6/16);
   assert.deepEqual(liquid.geometry.size,[.75,.75]);assert.equal(liquid.rotation.x,-Math.PI/2);assert.equal(liquid.material.side,2);
  }
  assert.ok(m.every(mesh=>mesh.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
 }
});
test('cocoa stages change dimensions and texture together; mature is the default',()=>{
 for(let stage=0;stage<3;stage++) {
  const s=setup('cocoa',{stage});s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,7);assert.ok(m.every(mesh=>mesh.material.path===P+'cocoa_stage_'+stage));
  assert.deepEqual(m[0].geometry.size,[(4+2*stage)/16,(5+2*stage)/16]);
 }
 const s=setup('cocoa');s.build();assert.equal(meshesOf(s.E.group)[0].material.path,P+'cocoa_stage_2');
});
test('daylight records share a card but retain both saved-ID mode routes',()=>{
 const records=Object.fromEntries(['daylight_detector','daylight_detector_inverted'].map(id=>[id,record(id)]));
 const before=JSON.stringify(records),s=compileStateGroups(records,powerRules(records));
 assert.deepEqual(s.cards,['daylight_detector']);
 assert.deepEqual(s.routes.daylight_detector.state,{mode:'day'});
 assert.deepEqual(s.routes.daylight_detector_inverted.state,{mode:'inverted'});
 assert.equal(JSON.stringify(records),before);
 assert.deepEqual(powerRules({daylight_detector:records.daylight_detector}),[]);
});
test('daylight modes preserve the six-pixel body and choose the corresponding top',()=>{
 for(const id of ['daylight_detector','daylight_detector_inverted'])for(const mode of [undefined,'day','inverted']) {
  const s=setup(id,mode===undefined?{}:{mode});s.build();const m=meshesOf(s.E.group),selected=mode??(id.endsWith('_inverted')?'inverted':'day');
  assert.equal(m.length,6);assert.equal(m.find(mesh=>mesh.rotation.x===-Math.PI/2).material.path,s.E.bindings[selected]);
  assert.deepEqual(m.find(mesh=>mesh.rotation.y===Math.PI).geometry.size,[1,6/16]);
 }
});
test('all three models ignore edited slots and leave bindings unchanged',()=>{
 for(const [id,state] of [['cauldron',{content:'water'}],['cocoa',{stage:1}],['daylight_detector',{mode:'inverted'}]]) {
  let expected;
  for(const slot of [...record(id).paths,'textures/items/unrelated']) {
   const s=setup(id,state,slot),before=JSON.stringify(s.E.bindings);s.build();
   const snapshot=meshesOf(s.E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,path:m.material.path,pos:m.position,rot:m.rotation}));
   const plain=JSON.parse(JSON.stringify(snapshot));expected??=plain;assert.deepEqual(plain,expected);assert.equal(JSON.stringify(s.E.bindings),before);
  }
 }
});
test('invalid states and missing materials never insert a partial scene',()=>{
 for(const [id,state] of [['cauldron',{content:'lava'}],['cocoa',{stage:3}],['cocoa',{stage:'1'}],['daylight_detector',{mode:true}]]) {
  const s=setup(id,state);assert.throws(s.build);assert.equal(s.E.group.children.length,0);
 }
 for(const [id,state,role] of [['cauldron',{content:'water'},'water'],['cocoa',{stage:1},'stage_1'],['daylight_detector',{mode:'inverted'},'inverted']]) {
  const s=setup(id,state);delete s.E.mats[s.E.bindings[role]];assert.throws(s.build,/Missing model material/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 }
});
test('bindings reject missing, foreign and ambiguous resources, retaining repeated stage indices',()=>{
 const cocoa=record('cocoa');cocoa.variants.up[1]=cocoa.variants.up[0];const b=utilityBindings(cocoa);assert.deepEqual(b.stage_0,b.stage_1);assert.equal(Object.keys(b).length,3);
 const bad=record('cocoa');bad.variants.up.pop();assert.throws(()=>utilityBindings(bad),/Incomplete cocoa/);
 const d=record('daylight_detector');d.paths=d.paths.filter(path=>!path.endsWith('inverted_top'));assert.throws(()=>utilityBindings(d),/Missing or ambiguous daylight inverted/);
 const c=record('cauldron');c.faces.east.push(c.faces.west[0]);assert.throws(()=>utilityBindings(c),/Missing or ambiguous cauldron water/);
});
