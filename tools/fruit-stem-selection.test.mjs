import test from 'node:test';
import assert from 'node:assert/strict';
import {familyRules} from '../catalog/rules/forms.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
// Normalized catalog fixtures and recording registry: real access/resolver/composition, not compile/builders/WebGL.
const P='textures/blocks/',FACES=['up','down','north','south','east','west'];
class Group {
 constructor(){this.children=[];this.position={x:0,y:0,z:0,set:(x,y,z)=>Object.assign(this.position,{x,y,z})};}
 add(child){this.children.push(child);}
}
const Three={Group};
function fixture() {
 const records={},calls=[],resources={};
 function add(id,model,names) {
  const paths=names.map(name=>P+name),faces=Object.fromEntries(FACES.map(face=>[face,[paths[0]]]));
  records[id]={id,model,paths,faces,icons:[]};
  for(const path of paths)(resources[path]??=[]).push({kind:'block',id});
 }
 for(const [id,front] of [['pumpkin','pumpkin_side'],['carved_pumpkin','pumpkin_face_off'],['lit_pumpkin','pumpkin_face_on']]) {
  add(id,'pumpkin',['pumpkin_top','pumpkin_side',front]);records[id].paths=[...new Set(records[id].paths)];records[id].faces.south=[P+front];
 }
 add('melon_block','cube',['melon_top','melon_side']);
 for(const id of ['pumpkin_stem','melon_stem']){add(id,'stem',[id+'_disconnected',id+'_connected']);records[id].bindings={stem:[records[id].paths[0]],upperstem:[records[id].paths[1]]};}
 add('stone','cube',['stone']);
 const variants={plain:'pumpkin',carved:'carved_pumpkin',lit:'lit_pumpkin'},stateRoutes=Object.fromEntries(Object.entries(variants).map(([variant,id])=>[id,{card:'pumpkin',state:{variant}}]));
 const catalog={schema:1,records,items:{},aliases:{old_pumpkin:'pumpkin'},families:{pumpkin:{native:'pumpkin',stem:'pumpkin_stem'},melon_block:{native:'melon_block',stem:'melon_stem'}},resources,stateRoutes,stateGroups:{pumpkin:{parameter:'variant',default:'plain',variants,paths:[...new Set(Object.values(variants).flatMap(id=>records[id].paths))]}}};
 const registry={get(id){return {scale:1,mode:id==='sprite'?'sprite':'volume'};},build(model,E){calls.push({model,id:E.cur,state:{...E.state},bindings:{...E.bindings},slot:E.slot,group:E.group});}};
 return {catalog,calls,registry,resolve:createPreviewResolver(catalog,registry,Three)};
}
test('exact fruit/stem family rules preserve source metadata and apply only to complete pairs',()=>{
 const records=fixture().catalog.records,before=JSON.stringify(records),rules=familyRules(records);
 assert.deepEqual(rules.pumpkin,{stem:'pumpkin_stem'});assert.deepEqual(rules.melon_block,{stem:'melon_stem'});assert.equal(JSON.stringify(records),before);
 for(const [base,id] of [['pumpkin','pumpkin_stem'],['melon_block','melon_stem']]){const partial={...records};delete partial[id];assert.equal(Object.hasOwn(familyRules(partial),base),false);assert.throws(()=>familyRules(records,{[base]:{stem:'stone'}}),/Conflicting family form/);}
});
test('access retains stem source IDs and locates them inside the matching fruit card',()=>{
 const s=fixture(),access=createCatalogAccess(s.catalog);
 for(const [id,card] of [['pumpkin_stem','pumpkin'],['melon_stem','melon_block']]) {
  assert.deepEqual(access.describe(id),{kind:'block',id,card,form:'stem'});
  const found=access.locate(s.catalog.records[id].paths[1],{preferredId:card});assert.equal(found.status,'found');assert.equal(found.object.id,id);
 }
});
test('fruit preview defaults to no stem and editing a stem PNG never enables it',()=>{
 for(const id of ['pumpkin','melon_block']) {
  const s=fixture(),stemId=id==='pumpkin'?'pumpkin_stem':'melon_stem',slot=s.catalog.records[stemId].paths[1],before=JSON.stringify(s.catalog);
  const plan=s.resolve({id,slot});assert.equal(plan.state.stem,false);assert.equal(plan.slot,slot);assert.equal(plan.parts.stem,undefined);plan.build({group:new Group()});assert.equal(s.calls.length,1);assert.equal(s.calls[0].id,id);assert.equal(JSON.stringify(s.catalog),before);
 }
});
test('explicit stem view composes correct model resources and offset in four directions',()=>{
 for(const id of ['pumpkin','melon_block'])for(const [facing,offset] of Object.entries({west:[1,0,0],east:[-1,0,0],north:[0,0,1],south:[0,0,-1]})) {
  const s=fixture(),stemId=id==='pumpkin'?'pumpkin_stem':'melon_stem',plan=s.resolve({id,state:{stem:true,facing,stage:5}}),group=new Group();plan.build({group});
  assert.deepEqual(s.calls.map(c=>c.id),[id,stemId]);assert.equal(s.calls[1].state.attached,true);assert.equal(s.calls[1].state.stage,5);assert.equal(plan.stages,8);assert.equal(plan.parts.stem.bindings.upperstem,s.catalog.records[stemId].paths[1]);
  const p=group.children[0].children[1].position;assert.deepEqual([p.x,p.y,p.z],offset);
 }
});
test('all pumpkin variants survive the toggle including when opening a saved stem ID',()=>{
 for(const [variant,id] of Object.entries({plain:'pumpkin',carved:'carved_pumpkin',lit:'lit_pumpkin'}))for(const stem of [false,true]) {
  const s=fixture(),plan=s.resolve({id:'pumpkin_stem',state:{stem,variant}});assert.equal(plan.object.id,'pumpkin_stem');assert.equal(plan.parts.fruit.object.id,id);assert.equal(plan.state.variant,variant);assert.equal(plan.state.stem,stem);plan.build({group:new Group()});assert.equal(s.calls[0].id,id);assert.equal(s.calls.length,stem?2:1);
 }
 const s=fixture(),saved=s.resolve({id:'melon_stem'});assert.equal(saved.state.stem,true);assert.equal(saved.object.card,'melon_block');
});
test('family paths include all owned PNGs without ownership transfer or foreign edit slots',()=>{
 const s=fixture(),before=JSON.stringify(s.catalog),plan=s.resolve({id:'pumpkin',state:{stem:true}});
 for(const path of [...s.catalog.stateGroups.pumpkin.paths,...s.catalog.records.pumpkin_stem.paths])assert.ok(plan.paths.includes(path));
 assert.deepEqual(plan.shared,[]);assert.equal(JSON.stringify(s.catalog),before);assert.throws(()=>s.resolve({id:'pumpkin',slot:P+'stone'}),/outside the selected fruit family/);
});
test('invalid toggle, growth, attachment, direction and missing Three fail explicitly',()=>{
 const s=fixture();for(const stem of [1,'true',null])assert.throws(()=>s.resolve({id:'pumpkin',state:{stem}}),/Invalid fruit stem/);
 for(const stage of [-1,8,.5,null])assert.throws(()=>s.resolve({id:'pumpkin',state:{stem:true,stage}}),/Invalid stem stage/);
 assert.throws(()=>s.resolve({id:'pumpkin',state:{stem:true,attached:false}}),/attached stem/);
 assert.throws(()=>s.resolve({id:'pumpkin',state:{stem:true,facing:'up'}}),/attached directed stem/);
 assert.throws(()=>createPreviewResolver(s.catalog,s.registry)({id:'pumpkin',state:{stem:true}}),/Three.Group/);assert.equal(s.calls.length,0);
});
test('unrelated records and catalogs without the approved pair keep the original resolver',()=>{
 const s=fixture();assert.equal(s.resolve({id:'stone'}).parts,undefined);
 delete s.catalog.families.pumpkin;const resolve=createPreviewResolver(s.catalog,s.registry);assert.equal(resolve({id:'pumpkin'}).parts,undefined);assert.equal(resolve({id:'pumpkin_stem'}).model,'stem');
});
test('sprite requests retain declared icon checks rather than becoming composed models',()=>{
 const s=fixture(),record=s.catalog.records.melon_block;record.icons=[record.paths[0]];
 const plan=s.resolve({id:'melon_block',view:'sprite',slot:record.paths[0],state:{stem:true}});assert.equal(plan.model,'sprite');assert.equal(plan.parts,undefined);
 assert.throws(()=>s.resolve({id:'pumpkin',view:'sprite'}),/declared icon/);
});
test('returned state and bindings cannot mutate prepared build selections or source records',()=>{
 const s=fixture(),request={id:'pumpkin',state:{stem:true,facing:'north'}},before=JSON.stringify(request),plan=s.resolve(request);
 plan.state.facing='south';plan.parts.stem.bindings.stem='foreign';plan.build({group:new Group()});assert.equal(s.calls[1].state.facing,'north');assert.notEqual(s.calls[1].bindings.stem,'foreign');assert.equal(JSON.stringify(request),before);
});
