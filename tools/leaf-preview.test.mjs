import test from 'node:test';
import assert from 'node:assert/strict';
import {leafPreviewSelection,leafControlState,leafPreviewField,leafPreviewLabel} from '../catalog/leaf-preview.mjs';
const FACES=['up','down','north','south','east','west'];
const SOURCES={oak_leaves:'leaves_oak',spruce_leaves:'leaves_spruce',birch_leaves:'leaves_birch',jungle_leaves:'leaves_jungle',acacia_leaves:'leaves_acacia',dark_oak_leaves:'leaves_big_oak',cherry_leaves:'cherry_leaves',pale_oak_leaves:'pale_oak_leaves',mangrove_leaves:'mangrove_leaves',azalea_leaves:'azalea_leaves',azalea_leaves_flowered:'azalea_leaves_flowers',orange_poplar_leaves:'orange_poplar_leaves',red_poplar_leaves:'red_poplar_leaves',yellow_poplar_leaves:'yellow_poplar_leaves'};
function fixture(id) {
 const paths=['textures/blocks/'+SOURCES[id],'textures/blocks/'+SOURCES[id]+'_opaque'];
 return {id,model:'cube',variants:Object.fromEntries(FACES.map(face=>[face,[...paths]])),faces:Object.fromEntries(FACES.map(face=>[face,[...paths]])),paths:[...paths,'textures/blocks/carried_fixture']};
}
test('all 14 leaf records select both exact source textures synchronously and preserve metadata',()=>{
 assert.equal(Object.keys(SOURCES).length,14);
 for(const id of Object.keys(SOURCES))for(const [index,foliage]of ['cutout','opaque'].entries()) {
  const record=fixture(id),state={foliage},before=JSON.stringify({record,state}),result=leafPreviewSelection(record,state);
  assert.deepEqual(result.state,state);assert.notEqual(result.state,state);
  for(const face of FACES){assert.deepEqual(result.bindings[face],[record.variants[face][index]]);assert.notEqual(result.bindings[face],record.variants[face]);}
  assert.equal(JSON.stringify({record,state}),before);
  result.bindings.up[0]='changed';result.state.foliage='changed';assert.equal(JSON.stringify({record,state}),before);
  assert.equal(leafPreviewSelection(record).state.foliage,'cutout');
 }
});
test('invalid leaf states fail rather than silently selecting a texture',()=>{
 for(const foliage of [null,true,false,0,1,'unknown','',{},[]])assert.throws(()=>leafPreviewSelection(fixture('oak_leaves'),{foliage}),/Invalid leaf preview state/);
 for(const state of [null,[],true,'cutout'])assert.throws(()=>leafPreviewSelection(fixture('oak_leaves'),state),/Invalid leaf preview state/);
});
test('missing sparse reordered foreign and carried source variants fail on every face',()=>{
 for(const id of Object.keys(SOURCES))for(const face of FACES)for(const mutate of [r=>{r.variants[face].pop();},r=>{delete r.variants[face][1];},r=>{r.variants[face].reverse();},r=>{r.variants[face][1]=r.paths[2];},r=>{r.variants[face][0]='textures/blocks/foreign';},r=>{r.paths=r.paths.filter(path=>path!==r.variants[face][1]);}]) {
  const record=fixture(id);mutate(record);assert.throws(()=>leafPreviewSelection(record,{foliage:'cutout'}),/leaf variants/);
 }
 const record=fixture('oak_leaves');delete record.paths;assert.throws(()=>leafPreviewSelection(record),/leaf source resources/);
});
test('lookalike IDs and other models remain outside the leaf recipe',()=>{
 for(const record of [{...fixture('oak_leaves'),id:'future_oak_leaves'},{...fixture('oak_leaves'),model:'custom_leaves'},null])assert.equal(leafPreviewSelection(record),null);
 const plan={model:'sprite',object:{id:'oak_leaves'},state:{}};
 assert.equal(leafPreviewField(plan),null);assert.equal(leafPreviewLabel(plan,'foliage'),null);assert.equal(leafControlState(plan,{}),null);
});
test('leaf controls expose bilingual texture options and reject invalid values without mutation',()=>{
 for(const id of Object.keys(SOURCES)) {
  const plan={model:'cube',object:{id},state:{}},before=JSON.stringify(plan);
  assert.deepEqual(leafPreviewField(plan),['foliage',[['cutout','cutout'],['opaque','opaque']],'cutout']);
  assert.deepEqual(leafControlState(plan,{}),{foliage:'cutout'});assert.deepEqual(leafControlState(plan,{foliage:'opaque'}),{foliage:'opaque'});
  assert.deepEqual(leafPreviewLabel(plan,'foliage'),['Leaf texture','Текстура листвы']);
  assert.deepEqual(leafPreviewLabel(plan,'foliage_cutout'),['Cutout','С прозрачными участками']);
  assert.deepEqual(leafPreviewLabel(plan,'foliage_opaque'),['Opaque','Непрозрачная']);assert.equal(leafPreviewLabel(plan,'other'),null);
  const field=leafPreviewField(plan);field[1][0][0]='changed';assert.equal(leafPreviewField(plan)[1][0][0],'cutout');
  const label=leafPreviewLabel(plan,'foliage');label[0]='changed';assert.equal(leafPreviewLabel(plan,'foliage')[0],'Leaf texture');
  for(const foliage of [null,true,0,'bad']){assert.throws(()=>leafControlState(plan,{foliage}),/Invalid leaf preview state/);assert.throws(()=>leafPreviewField({...plan,state:{foliage}}),/Invalid leaf preview state/);}
  assert.equal(JSON.stringify(plan),before);
 }
});

// Normalized fixtures and a declared test icon; registry spy checks build arguments, not geometry or PNGs.
function resolverFixture() {
 const records=Object.fromEntries(Object.keys(SOURCES).map(id=>{
  const record=fixture(id);return [id,{...record,icons:[record.paths[2]]}];
 }));
 return {schema:1,records,items:{},aliases:{},families:{},resources:{}};
}
async function resolverIntegration(catalog=resolverFixture()) {
 const [{createPreviewResolver},{createPreviewControls}]=await Promise.all([import('../catalog/preview.mjs'),import('../preview-controls.mjs')]);
 const registry={
  get(id){assert.ok(['cube','sprite'].includes(id));return {scale:1,mode:id==='sprite'?'sprite':'volume'};},
  build(model,environment){return {model,environment};}
 };
 const controls=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
 return {catalog,resolve:createPreviewResolver(catalog,registry),controls};
}
test('leaf resolver integration round-trips picker state and edited PNG for every source ID',async()=>{
 const {catalog,resolve,controls}=await resolverIntegration(),before=JSON.stringify(catalog);
 for(const id of Object.keys(SOURCES)) {
  const initial=resolve({id});assert.equal(initial.state.foliage,'cutout');
  assert.deepEqual(controls.previewControlSpec(catalog,initial).schema[0].values.map(row=>row.value),['cutout','opaque']);
  for(const [index,foliage]of ['cutout','opaque'].entries())for(const slot of catalog.records[id].paths) {
   const values={foliage,texture:slot},saved=JSON.stringify(values),selection=controls.previewControlSelection(initial,values),plan=resolve({id,...selection});
   assert.equal(plan.slot,slot);assert.equal(plan.state.foliage,foliage);assert.equal(plan.model,'cube');
   for(const face of FACES)assert.equal(plan.bindings[face],catalog.records[id].variants[face][index]);
   assert.equal(controls.previewControlSpec(catalog,plan).state.foliage,foliage);assert.equal(JSON.stringify(values),saved);
  }
 }
 assert.equal(JSON.stringify(catalog),before);
});
test('leaf resolver integration captures selected bindings and state independently of later mutations',async()=>{
 const {catalog,resolve}=await resolverIntegration(),before=JSON.stringify(catalog);
 for(const id of Object.keys(SOURCES))for(const foliage of ['cutout','opaque']) {
  const slot=catalog.records[id].paths[2],plan=resolve({id,slot,state:{foliage}}),expected={...plan.bindings};
  plan.state.foliage='bad';plan.bindings.up='bad';
  const first=plan.build({state:{foliage:'bad'},bindings:{up:'bad'}});
  assert.equal(first.model,'cube');assert.equal(first.environment.cur,id);assert.equal(first.environment.slot,slot);
  assert.equal(first.environment.state.foliage,foliage);assert.deepEqual(first.environment.bindings,expected);
  first.environment.state.foliage='bad';first.environment.bindings.up='bad';
  const second=plan.build({});assert.equal(second.environment.state.foliage,foliage);assert.deepEqual(second.environment.bindings,expected);
 }
 assert.equal(JSON.stringify(catalog),before);
});
test('leaf resolver integration rejects contradictory faces and foreign slots without consuming leaf states in icons',async()=>{
 const {catalog,resolve,controls}=await resolverIntegration();
 for(const id of Object.keys(SOURCES)) {
  for(const foliage of [null,true,0,'bad'])assert.throws(()=>resolve({id,state:{foliage}}),/Invalid leaf preview state/);
  assert.throws(()=>resolve({id,state:{foliage:'opaque'},faceChoices:{up:catalog.records[id].variants.up[0]}}),/Explicit face variant required/);
  const selection=controls.previewControlSelection(resolve({id}),{foliage:'cutout',texture:'textures/blocks/foreign'});
  assert.throws(()=>resolve({id,...selection}),/Texture is outside/);
  const bad=structuredClone(catalog);bad.records[id].variants.up[1]=bad.records[id].paths[2];
  const next=await resolverIntegration(bad);assert.throws(()=>next.resolve({id}),/leaf variants/);
 }
 const icon=resolve({id:'oak_leaves',view:'sprite',slot:catalog.records.oak_leaves.icons[0],state:{foliage:'bad'}});
 assert.equal(icon.model,'sprite');assert.deepEqual(icon.bindings,{});assert.equal(controls.previewControlSpec(catalog,icon).schema,null);
 catalog.records.future_oak_leaves={...fixture('oak_leaves'),id:'future_oak_leaves'};
 assert.throws(()=>resolve({id:'future_oak_leaves'}),/Explicit face variant required/);
});
