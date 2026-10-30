import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
function fixture(model) {
 const a='textures/blocks/stage_a', b='textures/blocks/stage_b', c='textures/blocks/stage_c';
 const sequence=[a,b,b,c], paths=[a,b,c];
 const record={id:'sample',model,paths,icons:[],faces:{up:paths},variants:{up:sequence}};
 const catalog={schema:1,records:{sample:record},items:{},aliases:{},families:{},resources:{}};
 const registry={get:()=>({scale:1,mode:'volume'}),build:(id,E)=>E};
 return {catalog,sequence,paths,resolve:createPreviewResolver(catalog,registry)};
}
for(const model of ['crop','turtle_egg']) {
 test(model+' preserves repeated stage indices independently of the edited slot',()=>{
  const s=fixture(model), before=JSON.stringify(s.catalog);
  for(let stage=0;stage<4;stage++) for(const slot of s.paths) {
   const p=s.resolve({id:'sample',slot,state:{stage}});
   assert.equal(p.stages,4);assert.equal(p.slot,slot);
   assert.deepEqual(p.bindings,{stage:s.sequence[stage]});
   assert.equal(p.build({}).bindings.stage,s.sequence[stage]);
  }
  assert.equal(JSON.stringify(s.catalog),before);
 });
 test(model+' validates against the original sequence length',()=>{
  const s=fixture(model);
  assert.equal(s.resolve({id:'sample'}).state.stage,0);
  for(const stage of [-1,4,1.5,'2']) assert.throws(()=>s.resolve({id:'sample',state:{stage}}),/Invalid .* stage/);
  delete s.catalog.records.sample.variants;
  assert.throws(()=>s.resolve({id:'sample'}),/Missing .* stages/);
 });
}
