import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createPreviewControls} from '../preview-controls.mjs';
const body='textures/entity/sample_body',head='textures/entity/sample_head',alt='textures/entity/sample_head_alt';
function fixture(kind='block'){
 const record={id:'sample',model:'assembled',paths:[body,head,alt],icons:[],bindings:{body:[body],head:[head,alt]}};
 const catalog={schema:1,records:kind==='block'?{sample:record}:{},items:kind==='item'?{sample:record}:{},aliases:{},families:{},resources:{}};
 const calls=[];
 const registry={get(id){if(!['assembled','sprite'].includes(id))throw new Error('Unknown model');return {scale:1,mode:id==='sprite'?'sprite':'volume'};},build(id,env){calls.push({id,env});return env;}};
 return {record,catalog,calls,resolve:createPreviewResolver(catalog,registry)};
}
test('arbitrary parts use the existing model dispatch without six cube faces',()=>{
 const s=fixture(),p=s.resolve({id:'sample',faceChoices:{head:alt}}),env=p.build({});
 assert.equal(p.model,'assembled');assert.deepEqual(env.bindings,{body,head:alt});
 assert.deepEqual(env.faceMap,env.bindings);assert.equal(s.calls.length,1);
});
test('item model view requires a declared model and bindings; sprite remains the default',()=>{
 const s=fixture('item');assert.equal(s.resolve({id:'sample',kind:'item'}).model,'sprite');
 assert.equal(s.resolve({id:'sample',kind:'item',view:'model',faceChoices:{head}}).model,'assembled');
 delete s.record.model;assert.throws(()=>s.resolve({id:'sample',kind:'item',view:'model'}),/not assigned/);
 const t=fixture('item');delete t.record.bindings;
 assert.throws(()=>t.resolve({id:'sample',kind:'item',view:'model'}),/not assigned/);
});
test('every named binding must reference declared resources, including unselected alternatives',()=>{
 const s=fixture();s.record.bindings.head.push('textures/entity/unrelated');
 assert.throws(()=>s.resolve({id:'sample',faceChoices:{head}}),/outside the selected record/);
 for(const bindings of [{},[],{body:[]},{'bad/role':[body]},null]){
  const t=fixture();t.record.bindings=bindings;assert.throws(()=>t.resolve({id:'sample'}));
 }
});
test('multiple variants require explicit selection and never follow the edited PNG',()=>{
 const s=fixture();assert.throws(()=>s.resolve({id:'sample',slot:alt}),/Explicit face variant/);
 const a=s.resolve({id:'sample',slot:body,faceChoices:{head}}),b=s.resolve({id:'sample',slot:alt,faceChoices:{head}});
 assert.deepEqual(a.bindings,b.bindings);
 assert.throws(()=>s.resolve({id:'sample',faceChoices:{unknown:body}}),/Unknown face choice/);
});
test('public selection objects and previous builds cannot change subsequent dispatch',()=>{
 const s=fixture(),before=JSON.stringify(s.catalog),p=s.resolve({id:'sample',state:{enabled:true},faceChoices:{head}});
 p.faceMap.head=alt;p.bindings.body=alt;p.state.enabled=false;
 const first=p.build({bindings:{body:'wrong'},faceMap:{head:'wrong'},state:{enabled:false}});
 assert.equal(first.bindings.head,head);assert.equal(first.bindings.body,body);assert.equal(first.state.enabled,true);
 first.bindings.head=alt;first.faceMap.body=alt;first.state.enabled=false;
 const next=p.build({});assert.deepEqual(next.bindings,{body,head});assert.equal(next.state.enabled,true);
 assert.equal(JSON.stringify(s.catalog),before);
});
test('ordinary face-based blocks remain compatible',()=>{
 const s=fixture();delete s.record.bindings;s.record.faces={up:[body],south:[head]};
 const p=s.resolve({id:'sample'});assert.deepEqual(p.build({}).faceMap,{up:body,south:head});
});
const fireLabels={en:{variant:'Variant',texture:'Texture'},ru:{variant:'Вариант',texture:'Текстура'}};
function firePlan(id,state={}) {
 const paths=['textures/blocks/'+id+'_0','textures/blocks/'+id+'_1'];
 return {object:{id,card:id},model:'fire',forms:null,state,paths,slot:paths[0],bindings:{up:paths[0],down:paths[1]}};
}
test('both fires expose one shared variant field with primary default and bilingual labels',()=>{
 const controls=createPreviewControls(fireLabels);
 for(const id of ['fire','soul_fire']) {
  const plan=firePlan(id),before=JSON.stringify(plan),spec=controls.previewControlSpec({},plan);
  assert.deepEqual(spec.schema,[{key:'variant',label:['Variant','Вариант'],values:[{value:'primary',label:['A','A']},{value:'alternate',label:['B','B']}]}]);
  assert.deepEqual(spec.state,{variant:'primary'});assert.equal(JSON.stringify(plan),before);
  spec.schema[0].values[0].value='changed';assert.equal(controls.previewControlSpec({},plan).schema[0].values[0].value,'primary');
 }
});
test('fire picker keeps PNG selection independent from the primary or alternate model variant',()=>{
 const controls=createPreviewControls(fireLabels);
 for(const id of ['fire','soul_fire'])for(const variant of ['primary','alternate']) {
  const plan=firePlan(id,{variant}),before=JSON.stringify(plan),spec=controls.previewControlSpec({},plan);
  assert.equal(spec.state.variant,variant);
  assert.deepEqual(controls.previewTextureField(plan).values.map(option=>option.value),plan.paths);
  for(const texture of plan.paths) {
   const selection=controls.previewControlSelection(plan,{...spec.state,texture});
   assert.equal(selection.slot,texture);assert.deepEqual(selection.state,{variant});assert.equal(selection.form,undefined);
   assert.equal(JSON.stringify(plan),before);
  }
 }
});
function fireResolverFixture(id) {
 const plan=firePlan(id),faces=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,[plan.paths[face==='down'?1:0]]]));
 const record={id,model:'fire',paths:plan.paths,icons:[],faces};
 const catalog={schema:1,records:{[id]:record},items:{},aliases:{},families:{},resources:{}},calls=[];
 const registry={get(model){assert.equal(model,'fire');return {scale:1,mode:'volume'};},build(model,env){calls.push({model,env});return env;}};
 return {catalog,calls,resolve:createPreviewResolver(catalog,registry)};
}
test('fire resolver normalizes primary once and preserves explicit variants independently of PNG',()=>{
 for(const id of ['fire','soul_fire']) {
  const s=fireResolverFixture(id),before=JSON.stringify(s.catalog),state={},plain=s.resolve({id,state});
  assert.deepEqual(plain.state,{variant:'primary'});assert.deepEqual(state,{});
  assert.deepEqual(plain.build({}).state,{variant:'primary'});
  for(const variant of ['primary','alternate'])for(const slot of plain.paths) {
   const request={id,slot,state:{variant}},saved=JSON.stringify(request),plan=s.resolve(request);
   assert.deepEqual(plan.state,{variant});assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings,plain.bindings);
   assert.deepEqual(plan.build({}).state,{variant});assert.equal(JSON.stringify(request),saved);
  }
  assert.equal(JSON.stringify(s.catalog),before);
 }
});
test('fire resolver rejects invalid variants before dispatching any geometry',()=>{
 for(const id of ['fire','soul_fire']) {
  const s=fireResolverFixture(id),before=JSON.stringify(s.catalog);
  for(const variant of [null,'A','B','bad',false,true,0,1,{},[]])assert.throws(()=>s.resolve({id,state:{variant}}),/Invalid fire preview variant/);
  assert.equal(s.calls.length,0);assert.equal(JSON.stringify(s.catalog),before);
 }
});
test('both campfires share boolean burning controls independent of the edited PNG',()=>{
 const labels={en:{campfire_lit:'Burning',campfire_lit_off:'Unlit',campfire_lit_on:'Lit',texture:'Texture'},ru:{campfire_lit:'Горение',campfire_lit_off:'Не горит',campfire_lit_on:'Горит',texture:'Текстура'}},controls=createPreviewControls(labels);
 for(const id of ['campfire','soul_campfire']) {
  const paths=['textures/blocks/'+id,'textures/blocks/campfire_log','textures/blocks/'+id+'_log_lit'];
  const plain={object:{id,card:id},model:'campfire',forms:null,state:{},paths,slot:paths[0]},before=JSON.stringify(plain);
  const initial=controls.previewControlSpec({},plain);
  assert.deepEqual(initial.state,{lit:true});
  assert.deepEqual(initial.schema,[{key:'lit',label:['Burning','Горение'],values:[{value:false,label:['Unlit','Не горит']},{value:true,label:['Lit','Горит']}]}]);
  assert.deepEqual(controls.previewTextureField(plain).values.map(option=>option.value),paths);
  for(const lit of [false,true])for(const texture of paths) {
   const plan={...plain,state:{lit}},spec=controls.previewControlSpec({},plan);
   assert.deepEqual(spec.state,{lit});
   const selection=controls.previewControlSelection(plan,{...spec.state,texture});
   assert.equal(selection.slot,texture);assert.deepEqual(selection.state,{lit});assert.equal(selection.form,undefined);
   assert.equal(JSON.stringify(plain),before);
  }
  initial.schema[0].values[0].value='changed';
  assert.equal(controls.previewControlSpec({},plain).schema[0].values[0].value,false);
 }
});
