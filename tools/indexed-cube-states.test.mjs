import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
const P='textures/blocks/',FACES=['up','down','north','south','east','west'],MODES=['off','lit','powered','lit_powered'];
const PREFIXES=['','exposed_','weathered_','oxidized_'];
// Normalized fixtures retain selected terrain-000/001/003/004 sequences at PIN 46ba6ea.
// Waxed records deliberately reuse ordinary textures; compilation/alias equivalence is not performed here.
const CASES=PREFIXES.flatMap(prefix=>{
 const base=prefix+'copper_bulb',paths=[base,base+'_lit',base+'_powered',base+'_lit_powered'].map(name=>P+name);
 return [base,'waxed_'+base].map(id=>[id,'mode',MODES,Object.fromEntries(FACES.map(face=>[face,[...paths]]))]);
});
CASES.push(['frosted_ice','stage',[0,1,2,3],Object.fromEntries(FACES.map(face=>[face,[0,1,2,3].map(stage=>P+'frosted_ice_'+stage)]))]);
CASES.push(['respawn_anchor','charges',[0,1,2,3,4],{
 up:[P+'respawn_anchor_top_off',...Array(4).fill(P+'respawn_anchor_top')],down:Array(5).fill(P+'respawn_anchor_bottom'),
 ...Object.fromEntries(['north','south','east','west'].map(face=>[face,[0,1,2,3,4].map(n=>P+'respawn_anchor_side'+n)]))
}]);
function fixture() {
 const records=Object.fromEntries(CASES.map(([id,,,variants])=>[id,{id,model:'cube',variants:structuredClone(variants),faces:Object.fromEntries(Object.entries(variants).map(([face,paths])=>[face,[...new Set(paths)]])),paths:[...new Set(Object.values(variants).flat())].sort(),icons:[]}]));
 return {schema:1,records,items:{},aliases:{},families:{},resources:{}};
}
function registry(){return {get(id){assert.ok(['cube','sprite'].includes(id));return {scale:1,mode:id==='cube'?'volume':'sprite'};},build(id,E){return {id,E};}};}
test('all ten declared records select synchronized indices for every state and edited PNG',()=>{
 const cat=fixture(),before=JSON.stringify(cat),resolve=createPreviewResolver(cat,registry());assert.equal(CASES.length,10);
 for(const [id,parameter,values] of CASES)for(const [index,value] of values.entries())for(const slot of cat.records[id].paths) {
  const state={[parameter]:value},p=resolve({id,slot,state});assert.equal(p.model,'cube');assert.equal(p.slot,slot);assert.equal(p.state[parameter],value);
  for(const face of FACES)assert.equal(p.bindings[face],cat.records[id].variants[face][index]);
  assert.deepEqual(p.paths,cat.records[id].paths);assert.deepEqual(p.shared,[]);assert.deepEqual(state,{[parameter]:value});
 }
 assert.equal(JSON.stringify(cat),before);
});
test('bulb modes keep light and power distinct for all oxidation classes and saved waxed aliases',()=>{
 const cat=fixture(),direct=createPreviewResolver(cat,registry());
 for(const prefix of PREFIXES) {
  const id=prefix+'copper_bulb',waxed='waxed_'+id;
  for(const mode of MODES) {
   const expected=P+id+(mode==='off'?'':'_'+mode),p=direct({id,state:{mode}}),q=direct({id:waxed,state:{mode}});
   assert.ok(Object.values(p.bindings).every(path=>path===expected));assert.deepEqual(q.bindings,p.bindings);assert.equal(q.object.id,waxed);
  }
  cat.aliases[waxed]=id;
 }
 const resolve=createPreviewResolver(cat,registry());
 for(const prefix of PREFIXES)for(const mode of MODES) {
  const id=prefix+'copper_bulb',p=resolve({id:'waxed_'+id,state:{mode}});assert.equal(p.object.id,id);assert.equal(p.object.card,id);assert.deepEqual(p.bindings,resolve({id,state:{mode}}).bindings);
 }
});
test('anchor charges preserve repeated bottom and active top indices; ice exposes all four crack stages',()=>{
 const cat=fixture(),resolve=createPreviewResolver(cat,registry()),anchor=cat.records.respawn_anchor;
 assert.equal(anchor.variants.down.length,5);assert.equal(new Set(anchor.variants.down).size,1);assert.equal(new Set(anchor.variants.up).size,2);
 for(let charges=0;charges<=4;charges++) {
  const p=resolve({id:'respawn_anchor',state:{charges}});assert.equal(p.bindings.up,P+(charges?'respawn_anchor_top':'respawn_anchor_top_off'));assert.equal(p.bindings.down,P+'respawn_anchor_bottom');
  for(const face of ['north','south','east','west'])assert.equal(p.bindings[face],P+'respawn_anchor_side'+charges);
 }
 for(let stage=0;stage<4;stage++)assert.ok(Object.values(resolve({id:'frosted_ice',state:{stage}}).bindings).every(path=>path===P+'frosted_ice_'+stage));
});
test('defaults are explicit and invalid state values are rejected rather than choosing the first image',()=>{
 const resolve=createPreviewResolver(fixture(),registry());
 for(const [id,parameter,values] of CASES) {
  assert.equal(resolve({id}).state[parameter],values[0]);
  const bad=parameter==='mode'?['unknown',0,true,null]:[-1,values.length,.5,'1',true,null];
  for(const value of bad)assert.throws(()=>resolve({id,state:{[parameter]:value}}),/Invalid cube preview state/);
 }
});
test('missing, sparse, foreign and wrong-length sequences fail even at an unselected index',()=>{
 for(const [id] of CASES)for(const face of FACES)for(const change of [a=>a.pop(),a=>a.push(a[0]),a=>{delete a[0];},a=>{a[0]=P+'foreign';}]) {
  const cat=fixture();change(cat.records[id].variants[face]);let built=0;const target=registry();target.build=()=>{built++;};
  const [,,values]=CASES.find(row=>row[0]===id),parameter=CASES.find(row=>row[0]===id)[1];
  assert.throws(()=>createPreviewResolver(cat,target)({id,state:{[parameter]:values.at(-1)}}),/Missing or invalid cube variants/);assert.equal(built,0);
 }
});
test('face overrides cannot contradict a selected indexed state',()=>{
 const cat=fixture(),resolve=createPreviewResolver(cat,registry());
 for(const [id,parameter,values] of CASES) {
  const value=values.at(-1),p=resolve({id,state:{[parameter]:value}}),face=FACES.find(face=>cat.records[id].variants[face][0]!==p.bindings[face]);assert.ok(face);
  assert.throws(()=>resolve({id,state:{[parameter]:value},faceChoices:{[face]:cat.records[id].variants[face][0]}}),/Explicit face variant required/);
  assert.deepEqual(resolve({id,state:{[parameter]:value},faceChoices:{[face]:p.bindings[face]}}).bindings,p.bindings);
 }
});
test('returned state and earlier builds cannot alter later selected values or catalog data',()=>{
 const cat=fixture(),before=JSON.stringify(cat),resolve=createPreviewResolver(cat,registry());
 for(const [id,parameter,values] of CASES) {
  const value=values.at(-1),p=resolve({id,state:{[parameter]:value}}),expected={...p.bindings};p.state[parameter]='wrong';p.bindings.up='wrong';
  const a=p.build({state:{[parameter]:'wrong'},bindings:{up:'wrong'}});assert.equal(a.id,'cube');assert.equal(a.E.cur,id);assert.equal(a.E.state[parameter],value);assert.deepEqual(a.E.bindings,expected);
  a.E.state[parameter]='wrong';a.E.bindings.up='wrong';const b=p.build({});assert.equal(b.E.state[parameter],value);assert.deepEqual(b.E.bindings,expected);
 }
 assert.equal(JSON.stringify(cat),before);
});
test('lookalike names remain unresolved at preview selection and icon view does not consume cube recipes',()=>{
 const cat=fixture();
 for(const id of ['future_copper_bulb','extra_frosted_ice','respawn_anchor_extra'])cat.records[id]={...structuredClone(cat.records.copper_bulb),id};
 const resolve=createPreviewResolver(cat,registry());
 for(const id of ['future_copper_bulb','extra_frosted_ice','respawn_anchor_extra'])assert.throws(()=>resolve({id}),/Explicit face variant required/);
 cat.records.copper_bulb.model='custom_bulb';assert.throws(()=>resolve({id:'copper_bulb'}));
 cat.records.copper_bulb.model='cube';cat.records.copper_bulb.paths.push('textures/items/test_icon');cat.records.copper_bulb.icons.push('textures/items/test_icon');
 const sprite=resolve({id:'copper_bulb',view:'sprite',slot:'textures/items/test_icon'});assert.equal(sprite.model,'sprite');assert.deepEqual(sprite.bindings,{});
});
test('existing hive, crafter and mushroom defaults retain their previous indexed contracts',()=>{
 const cat=fixture(),make=(id,variants)=>{cat.records[id]={id,model:'cube',variants,faces:Object.fromEntries(Object.entries(variants).map(([face,paths])=>[face,[...new Set(paths)]])),paths:[...new Set(Object.values(variants).flat())],icons:[]};};
 make('beehive',Object.fromEntries(FACES.map(face=>[face,face==='south'?[P+'front',P+'honey']:[P+'side']])));
 make('crafter',Object.fromEntries(FACES.map(face=>[face,Array(3).fill(P+'crafter_'+face)])));
 make('red_mushroom_block',Object.fromEntries(FACES.map(face=>[face,Array(16).fill(P+'cap')])));
 const resolve=createPreviewResolver(cat,registry());assert.equal(resolve({id:'beehive'}).state.honey,false);assert.equal(resolve({id:'beehive',state:{honey:true}}).bindings.south,P+'honey');assert.equal(resolve({id:'crafter'}).state.mode,'idle');assert.equal(resolve({id:'crafter',state:{mode:'crafting'}}).state.mode,'crafting');assert.equal(resolve({id:'red_mushroom_block'}).state.variant,14);
});
