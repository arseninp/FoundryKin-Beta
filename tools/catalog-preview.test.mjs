import test from 'node:test';
import assert from 'node:assert/strict';
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
