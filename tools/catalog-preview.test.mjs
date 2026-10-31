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

// Selected normalized resource sequences from the pinned terrain atlas, not a full catalog compilation.
const CUBE_CASES=[
 ...['bee_nest','beehive'].map(id=>[id,'honey',[false,true],{
  up:[id+'_top'],down:[id==='bee_nest'?'bee_nest_bottom':'beehive_top'],north:[id+'_side'],
  south:[id+'_front',id+'_front_honey'],east:[id+'_side'],west:[id+'_side']
 }]),
 ['crafter','mode',['idle','triggered','crafting'],{
  up:['crafter_top','crafter_top_triggered','crafter_top_crafting'],down:['crafter_bottom','crafter_bottom','crafter_bottom'],
  north:['crafter_north','crafter_north','crafter_north_crafting'],south:['crafter_south','crafter_south_triggered','crafter_south_triggered'],
  east:['crafter_east','crafter_east_triggered','crafter_east_crafting'],west:['crafter_west','crafter_west_triggered','crafter_west_crafting']
 }],
 ['chiseled_bookshelf','occupied',[false,true],{
  up:['chiseled_bookshelf_top'],down:['chiseled_bookshelf_top'],north:['chiseled_bookshelf_empty','chiseled_bookshelf_occupied'],
  south:['chiseled_bookshelf_side'],east:['chiseled_bookshelf_side'],west:['chiseled_bookshelf_side']
 }],
 ['creaking_heart','mode',['inactive','dormant','active'],Object.fromEntries(sides.map(face=>[face,['inactive','dormant','active'].map(mode=>'creaking_heart_'+(['up','down'].includes(face)?'top':'side')+'_'+mode)]))],
 ...['suspicious_sand','suspicious_gravel'].map(id=>[id,'brushing',[0,1,2,3],Object.fromEntries(sides.map(face=>[face,[0,1,2,3].map(index=>id+'_'+index)]))])
];
function cubeFixture() {
 const cat=fixture();
 for(const [id,,,names] of CUBE_CASES) {
  const variants=Object.fromEntries(Object.entries(names).map(([face,paths])=>[face,paths.map(path=>'textures/blocks/'+path)]));
  cat.records[id]={id,model:'cube',variants,faces:Object.fromEntries(Object.entries(variants).map(([face,paths])=>[face,[...new Set(paths)]])),icons:[],paths:[...new Set(Object.values(variants).flat())].sort()};
 }
 return cat;
}
test('crafter and suspicious blocks receive exact cube assignments without new geometry',()=>{
 for(const id of ['bee_nest','beehive','crafter','suspicious_sand','suspicious_gravel'])assert.equal(SPECIAL_MODELS[id],'cube');
 for(const id of ['future_crafter','future_suspicious_sand'])assert.equal(Object.hasOwn(SPECIAL_MODELS,id),false);
});
test('all declared cube states select synchronized face indices independently of edited PNGs',()=>{
 const cat=cubeFixture(),before=JSON.stringify(cat),resolve=createPreviewResolver(cat,registry());
 for(const [id,parameter,values] of CUBE_CASES)for(let index=0;index<values.length;index++)for(const slot of cat.records[id].paths) {
  const state={[parameter]:values[index]},p=resolve({id,slot,state});assert.equal(p.model,'cube');assert.equal(p.slot,slot);assert.equal(p.state[parameter],values[index]);
  for(const face of sides){const sequence=cat.records[id].variants[face];assert.equal(p.bindings[face],sequence[sequence.length===1?0:index]);}
  assert.deepEqual(p.paths,cat.records[id].paths);assert.deepEqual(p.shared,[]);assert.deepEqual(state,{[parameter]:values[index]});
 }
 assert.equal(JSON.stringify(cat),before);
});
test('repeated crafter resources retain three modes and heart top and sides change together',()=>{
 const cat=cubeFixture(),resolve=createPreviewResolver(cat,registry());
 assert.equal(cat.records.crafter.variants.down.length,3);assert.equal(new Set(cat.records.crafter.variants.down).size,1);
 const triggered=resolve({id:'crafter',state:{mode:'triggered'}}),crafting=resolve({id:'crafter',state:{mode:'crafting'}});
 assert.equal(triggered.bindings.south,crafting.bindings.south);assert.notEqual(triggered.bindings.up,crafting.bindings.up);
 for(const mode of ['inactive','dormant','active']) {
  const p=resolve({id:'creaking_heart',state:{mode}});assert.ok(p.bindings.up.endsWith('top_'+mode));assert.ok(p.bindings.north.endsWith('side_'+mode));
 }
});
test('cube defaults are explicit and invalid state values never pick a fallback image',()=>{
 const resolve=createPreviewResolver(cubeFixture(),registry());
 for(const [id,parameter,values] of CUBE_CASES) {
  assert.equal(resolve({id}).state[parameter],values[0]);
  const bad=parameter==='brushing'?[-1,4,1.5,'1',null]:typeof values[0]==='boolean'?[0,1,'true',null]:['unknown',0,true,null];
  for(const value of bad)assert.throws(()=>resolve({id,state:{[parameter]:value}}),/Invalid cube preview state/);
 }
});
test('incomplete, sparse, wrong-length or foreign cube sequences reject before registry build',()=>{
 for(const [id,,,names] of CUBE_CASES)for(const face of sides)for(const change of [paths=>paths.pop(),paths=>paths.push(paths[0]),paths=>{delete paths[0];},paths=>{paths[paths.length-1]='textures/blocks/foreign';}]) {
  const cat=cubeFixture();change(cat.records[id].variants[face]);let builds=0;const target=registry();target.build=()=>{builds++;};
  assert.throws(()=>createPreviewResolver(cat,target)({id}),/Missing or invalid cube variants/);assert.equal(builds,0);
 }
});
test('cube face overrides cannot contradict state and build calls retain isolated selected values',()=>{
 const cat=cubeFixture(),resolve=createPreviewResolver(cat,registry());
 for(const [id,parameter,values] of CUBE_CASES) {
  const index=values.length-1,p=resolve({id,state:{[parameter]:values[index]}}),expected={...p.bindings};
  const face=sides.find(face=>cat.records[id].variants[face].length>1&&cat.records[id].variants[face][0]!==expected[face]);
  assert.ok(face);assert.throws(()=>resolve({id,state:{[parameter]:values[index]},faceChoices:{[face]:cat.records[id].variants[face][0]}}),/Explicit face variant required/);
  p.state[parameter]='wrong';p.bindings[face]='wrong';
  const first=p.build({state:{[parameter]:'wrong'},faceMap:{}});assert.equal(first.id,'cube');assert.deepEqual(first.env.bindings,expected);assert.equal(first.env.state[parameter],values[index]);
  first.env.bindings[face]='wrong';first.env.state[parameter]='wrong';assert.deepEqual(p.build({}).env.bindings,expected);assert.equal(p.build({}).env.state[parameter],values[index]);
 }
});

test('cube state handling preserves distinct IDs and does not apply to undeclared cubes or models',()=>{
 const cat=cubeFixture(),resolve=createPreviewResolver(cat,registry());
 for(const [id] of CUBE_CASES)assert.equal(resolve({id}).object.card,id);
 assert.deepEqual(resolve({id:'stone'}).state,{});
 cat.records.future_beehive={...cat.records.beehive,id:'future_beehive'};
 assert.throws(()=>resolve({id:'future_beehive'}),/Explicit face variant required/);
 cat.records.beehive.model='custom_hive';assert.throws(()=>resolve({id:'beehive'}),/Unknown model/);
});
