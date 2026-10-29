import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
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
