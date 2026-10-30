import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
const P='textures/blocks/';
// Contract fixtures, not a compiled real catalogue or a Three rendering test.
function fixture(id,sequence) {
 const icon='textures/items/fixture_'+id;
 const record={id,model:'stage_cross',paths:[...new Set(sequence),icon],icons:[icon],faces:{up:[sequence[0]]},variants:{up:[...sequence]},bindings:Object.fromEntries(sequence.map((path,index)=>['stage_'+index,[path]]))};
 if(id==='sweet_berry_bush')record.variants.up=[sequence[1]];
 return record;
}
function resolver(record) {
 const catalog={schema:1,records:{[record.id]:record},items:{},aliases:{},families:{},resources:{}};
 const registry={get(){return {scale:1,mode:'volume'};},build(model,environment){return {model,environment};}};
 return createPreviewResolver(catalog,registry);
}
const cases=[
 ['sweet_berry_bush',[0,1,2,3].map(i=>P+'sweet_berry_bush_stage'+i)],
 ['nether_wart',[0,1,1,2].map(i=>P+'nether_wart_stage_'+i)],
 ['torchflower_crop',[0,1].map(i=>P+'torchflower_crop_stage_'+i)]
];
test('stage_cross advertises every named stage, independent of unique images or variants.up length',()=>{
 for(const [id,sequence] of cases){const record=fixture(id,sequence);assert.equal(resolver(record)({id}).stages,sequence.length);}
});
test('editing every resource keeps stage metadata, explicit state and dispatched bindings unchanged',()=>{
 for(const [id,sequence] of cases) {
  const record=fixture(id,sequence),before=JSON.stringify(record),resolve=resolver(record);
  for(const slot of record.paths)for(let stage=0;stage<sequence.length;stage++) {
   const preview=resolve({id,slot,state:{stage}}),built=preview.build({});
   assert.equal(preview.stages,sequence.length);assert.equal(preview.slot,slot);assert.equal(preview.state.stage,stage);
   assert.equal(built.environment.bindings['stage_'+stage],sequence[stage]);assert.equal(built.environment.state.stage,stage);
  }
  assert.equal(JSON.stringify(record),before);
 }
});
test('gapped and non-canonical stage indices reject instead of advertising a false count',()=>{
 for(const mutate of [r=>{delete r.bindings.stage_1;},r=>{r.bindings.stage_01=r.bindings.stage_1;delete r.bindings.stage_1;}]) {
  const record=fixture(...cases[0]);mutate(record);
  assert.throws(()=>resolver(record)({id:record.id}),/Missing or non-contiguous staged cross bindings/);
 }
});
test('crop and turtle egg retain indexed counts and duplicate stages',()=>{
 const sequence=[0,1,1,2].map(i=>P+'fixture_stage_'+i);
 for(const model of ['crop','turtle_egg']) {
  const record=fixture('fixture_'+model,sequence);record.model=model;delete record.bindings;
  const preview=resolver(record)({id:record.id,state:{stage:2}});
  assert.equal(preview.stages,4);assert.equal(preview.bindings.stage,sequence[2]);
 }
});
test('ordinary cross still has no stage metadata merely because an input array has variants',()=>{
 const record=fixture(...cases[0]);record.model='cross';delete record.bindings;
 assert.equal(resolver(record)({id:record.id}).stages,0);
});
