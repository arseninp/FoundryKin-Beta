import test from 'node:test';
import assert from 'node:assert/strict';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
const sides=['up','down','north','south','east','west'];
function fixture(){
 const make=path=>({model:'cube',paths:[path,'shared','icon'],icons:['icon'],faces:Object.fromEntries(sides.map(face=>[face,[path]]))});
 return {schema:1,records:{furnace:make('off'),lit_furnace:make('on'),stone:make('stone')},items:{clock:{paths:['textures/items/clock']}},aliases:{old_lit:'lit_furnace'},families:{},resources:{},stateGroups:{furnace:{parameter:'powered',default:'off',variants:{off:'furnace',on:'lit_furnace'},paths:['off','on','shared','icon']}},stateRoutes:{furnace:{card:'furnace',state:{powered:'off'}},lit_furnace:{card:'furnace',state:{powered:'on'}}}};
}
function registry(){return {get(id){if(!['cube','sprite'].includes(id))throw new Error('Unknown model');return {scale:1,mode:id==='sprite'?'sprite':'volume'};},build(id,env){return {id,env};}};}
test('saved IDs and aliases preserve state and dispatch through the registry',()=>{
 const resolve=createPreviewResolver(fixture(),registry()),p=resolve({id:'old_lit',slot:'on'});
 assert.equal(p.object.card,'furnace');assert.equal(p.state.powered,'on');assert.equal(p.faceMap.up,'on');
 const result=p.build({cur:'wrong',slot:'wrong',state:{powered:'off'},group:{}});
 assert.equal(result.id,'cube');assert.equal(result.env.cur,'lit_furnace');assert.equal(result.env.slot,'on');assert.equal(result.env.state.powered,'on');
});
test('editing a PNG from the other state never changes model state',()=>{
 const resolve=createPreviewResolver(fixture(),registry());
 const a=resolve({id:'furnace',slot:'off',state:{powered:'on'}}),b=resolve({id:'furnace',slot:'off',state:{powered:'off'}});
 assert.equal(a.slot,b.slot);assert.equal(a.faceMap.up,'on');assert.equal(b.faceMap.up,'off');
});
test('invalid states, unrelated resources and unknown models are rejected',()=>{
 const cat=fixture(),resolve=createPreviewResolver(cat,registry());
 assert.throws(()=>resolve({id:'furnace',state:{powered:'maybe'}}),/Invalid preview state/);
 assert.throws(()=>resolve({id:'furnace',slot:'stone'}),/outside/);
 cat.records.stone.model='unknown';assert.throws(()=>resolve({id:'stone'}),/Unknown model/);
});
test('array variants require an explicit face selection rather than first-element fallback',()=>{
 const cat=fixture();cat.records.stone.faces.up=['stone','shared'];const resolve=createPreviewResolver(cat,registry());
 assert.throws(()=>resolve({id:'stone'}),/Explicit face variant required/);
 assert.equal(resolve({id:'stone',faceChoices:{up:'shared'}}).faceMap.up,'shared');
 assert.throws(()=>resolve({id:'stone',faceChoices:{up:'on'}}),/Explicit face variant required/);
});
test('icon view requires a declared role; items use sprite mode independently of their path',()=>{
 const resolve=createPreviewResolver(fixture(),registry());
 const icon=resolve({id:'furnace',slot:'icon',view:'sprite'});assert.equal(icon.model,'sprite');assert.equal(icon.mode,'sprite');
 assert.throws(()=>resolve({id:'furnace',slot:'off',view:'sprite'}),/declared icon role/);
 const item=resolve({id:'clock',kind:'item'});assert.equal(item.model,'sprite');assert.equal(item.slot,'textures/items/clock');
});
test('selection and building do not mutate the catalog or expose shared state objects',()=>{
 const cat=fixture(),before=JSON.stringify(cat),resolve=createPreviewResolver(cat,registry());
 const p=resolve({id:'furnace',state:{powered:'on'}});p.build({}).env.state.powered='off';
 assert.equal(resolve({id:'furnace',state:{powered:'on'}}).state.powered,'on');assert.equal(JSON.stringify(cat),before);
});

// Normalized preview fixtures reflect blocks-000 and terrain-000 at PIN 46ba6ea; this is not a full-input compile test.
const HIVES=['bee_nest','beehive'];
function hiveFixture() {
 const cat=fixture(),P='textures/blocks/';
 for(const id of HIVES) {
  const names={up:[id+'_top'],down:[id==='bee_nest'?'bee_nest_bottom':'beehive_top'],north:[id+'_side'],south:[id+'_front',id+'_front_honey'],east:[id+'_side'],west:[id+'_side']};
  const faces=Object.fromEntries(Object.entries(names).map(([face,paths])=>[face,paths.map(path=>P+path)]));
  cat.records[id]={id,model:SPECIAL_MODELS[id],faces,variants:structuredClone(faces),icons:[],paths:[...new Set(Object.values(faces).flat())].sort()};
 }
 return cat;
}
test('hives have exact cube assignments and remain distinct objects',()=>{
 for(const id of HIVES)assert.equal(SPECIAL_MODELS[id],'cube');
 const resolve=createPreviewResolver(hiveFixture(),registry());
 assert.equal(resolve({id:'bee_nest'}).object.card,'bee_nest');assert.equal(resolve({id:'beehive'}).object.card,'beehive');
 assert.equal(Object.hasOwn(SPECIAL_MODELS,'future_beehive'),false);
});
test('hive honey state selects only the front, independently of every edited resource',()=>{
 const cat=hiveFixture(),before=JSON.stringify(cat),resolve=createPreviewResolver(cat,registry());
 for(const id of HIVES)for(const honey of [undefined,false,true])for(const slot of cat.records[id].paths) {
  const state=honey===undefined?{}:{honey},stateBefore=JSON.stringify(state),p=resolve({id,slot,state});
  assert.equal(p.model,'cube');assert.equal(p.state.honey,honey===true);assert.equal(p.slot,slot);assert.deepEqual(p.paths,cat.records[id].paths);assert.deepEqual(p.shared,[]);
  for(const face of sides)assert.equal(p.faceMap[face],face==='south'?cat.records[id].variants.south[honey===true?1:0]:cat.records[id].faces[face][0]);
  assert.equal(JSON.stringify(state),stateBefore);
 }
 assert.equal(JSON.stringify(cat),before);
});
test('hive build forwards isolated honey state and chosen materials to the existing cube',()=>{
 const resolve=createPreviewResolver(hiveFixture(),registry());
 for(const id of HIVES) {
  const p=resolve({id,state:{honey:true}}),expected=p.faceMap.south;p.state.honey=false;p.faceMap.south='wrong';
  const first=p.build({state:{honey:false},faceMap:{south:'wrong'},cur:'wrong'});
  assert.equal(first.id,'cube');assert.equal(first.env.cur,id);assert.equal(first.env.state.honey,true);assert.equal(first.env.faceMap.south,expected);
  first.env.state.honey=false;first.env.bindings.south='wrong';
  const second=p.build({});assert.equal(second.env.state.honey,true);assert.equal(second.env.bindings.south,expected);
 }
});
test('invalid hive states, unrelated resources and face overrides cannot bypass honey selection',()=>{
 const cat=hiveFixture(),resolve=createPreviewResolver(cat,registry());
 for(const id of HIVES) {
  for(const honey of [null,0,1,'true',[],{}])assert.throws(()=>resolve({id,state:{honey}}),/Invalid hive honey state/);
  assert.throws(()=>resolve({id,slot:'textures/blocks/foreign'}),/outside/);
  assert.throws(()=>resolve({id,state:{honey:false},faceChoices:{south:cat.records[id].variants.south[1]}}),/Explicit face variant required/);
 }
});
test('incomplete or foreign hive front variants are rejected even when the bad variant is not selected',()=>{
 for(const id of HIVES)for(const change of [r=>{delete r.variants.south;},r=>{r.variants.south.pop();},r=>{r.variants.south.push(r.variants.south[0]);},r=>{delete r.variants.south[1];},r=>{r.variants.south[1]='textures/blocks/foreign';}]) {
  const cat=hiveFixture();change(cat.records[id]);
  assert.throws(()=>createPreviewResolver(cat,registry())({id,state:{honey:false}}),/Missing or invalid hive front variants/);
 }
});
test('hive selection does not add honey defaults or first-variant fallback to other cubes',()=>{
 const cat=hiveFixture(),resolve=createPreviewResolver(cat,registry());
 assert.deepEqual(resolve({id:'stone'}).state,{});
 cat.records.future_beehive={...cat.records.beehive,id:'future_beehive'};
 assert.throws(()=>resolve({id:'future_beehive'}),/Explicit face variant required/);
 cat.records.beehive.model='custom_hive';
 assert.throws(()=>resolve({id:'beehive'}),/Unknown model/);
});
