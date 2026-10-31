import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
const P='textures/blocks/',FACES=['up','down','north','south','east','west'];
// Selected terrain-002 sequences at PIN 46ba6ea: 0=inside, 1=cap, 2=stem. Indices and repeats are unchanged.
const CAP={up:'0111111111000012',down:'0000000000000012',north:'0111000000200012',south:'0000000111200012',east:'0001001001200012',west:'0100100100200012'};
const IDS=['brown_mushroom_block','red_mushroom_block','mushroom_stem'];
function fixture() {
 const definitions={},atlas={};
 for(const [id,color] of [['brown_mushroom_block','brown'],['red_mushroom_block','red'],['mushroom_stem','stem']]) {
  const textures={},palette=[P+'mushroom_block_inside',P+'mushroom_block_skin_'+color,P+'mushroom_block_skin_stem'];
  for(const face of FACES) {
   const key='mushroom_'+color+'_'+(face==='up'?'top':face==='down'?'bottom':face);textures[face]=key;
   const code=color==='stem'?(['up','down'].includes(face)?'2222222222022222':'2'):CAP[face];
   const paths=[...code].map(index=>palette[Number(index)]);atlas[key]={textures:paths.length===1?paths[0]:paths};
  }
  definitions[id]={sound:'wood',textures};
 }
 const records=Object.fromEntries(IDS.map(id=>[id,normalizeBlock(id,definitions[id],atlas,{model:'cube'})]));
 const catalog={schema:1,records,items:{},aliases:{},families:{},resources:{}};
 const registry={get(id){assert.equal(id,'cube');return {scale:1,mode:'volume'};},build(id,E){return {id,E};}};
 return {definitions,atlas,catalog,resolve:createPreviewResolver(catalog,registry),registry};
}
test('normalization preserves sixteen indexed variants despite only two or three unique resources',()=>{
 const s=fixture();
 for(const id of IDS)for(const face of FACES) {
  const paths=s.catalog.records[id].variants[face],expected=id==='mushroom_stem'&&!['up','down'].includes(face)?1:16;
  assert.equal(paths.length,expected);assert.ok(s.catalog.records[id].faces[face].length<=3);
 }
 assert.equal(s.catalog.records.brown_mushroom_block.paths.length,3);assert.equal(s.catalog.records.mushroom_stem.paths.length,2);
});
test('one explicit variant chooses the same source index for all six faces and never follows the edited PNG',()=>{
 const s=fixture(),before=JSON.stringify(s.catalog);
 for(const id of IDS)for(let variant=0;variant<16;variant++)for(const slot of s.catalog.records[id].paths) {
  const p=s.resolve({id,slot,state:{variant}});assert.equal(p.model,'cube');assert.equal(p.state.variant,variant);assert.equal(p.slot,slot);assert.deepEqual(p.paths,s.catalog.records[id].paths);
  for(const face of FACES){const sequence=s.catalog.records[id].variants[face];assert.equal(p.bindings[face],sequence[sequence.length===1?0:variant]);}
  assert.deepEqual(p.shared,[]);
 }
 assert.equal(JSON.stringify(s.catalog),before);
});
test('representative defaults do not reorder indices: cap fourteen, stem ten; repeated variants remain addressable',()=>{
 const s=fixture();
 for(const [id,color] of [['brown_mushroom_block','brown'],['red_mushroom_block','red']]) {
  const p=s.resolve({id});assert.equal(p.state.variant,14);assert.ok(Object.values(p.bindings).every(path=>path===P+'mushroom_block_skin_'+color));
  assert.deepEqual(s.resolve({id,state:{variant:0}}).bindings,s.resolve({id,state:{variant:11}}).bindings);assert.equal(s.resolve({id,state:{variant:11}}).state.variant,11);
 }
 const stem=s.resolve({id:'mushroom_stem'});assert.equal(stem.state.variant,10);assert.equal(stem.bindings.up,P+'mushroom_block_inside');assert.equal(stem.bindings.down,P+'mushroom_block_inside');
 for(const face of ['north','south','east','west'])assert.equal(stem.bindings[face],P+'mushroom_block_skin_stem');
});
test('invalid variants and contradictory face choices reject without choosing a fallback',()=>{
 const s=fixture();
 for(const id of IDS)for(const variant of [-1,16,1.5,'14',null,true])assert.throws(()=>s.resolve({id,state:{variant}}),/Invalid cube preview state/);
 assert.throws(()=>s.resolve({id:'red_mushroom_block',state:{variant:14},faceChoices:{up:P+'mushroom_block_inside'}}),/Explicit face variant required/);
 const record=structuredClone(s.catalog.records.red_mushroom_block);record.id='future_mushroom_block';s.catalog.records[record.id]=record;
 assert.throws(()=>s.resolve({id:record.id}),/Explicit face variant required/);
});
test('missing, sparse, wrong-length and foreign variants fail even when the bad index is not selected',()=>{
 for(const id of IDS)for(const change of [r=>r.variants.up.pop(),r=>{delete r.variants.up[0];},r=>{r.variants.up[0]=P+'foreign';},r=>{delete r.variants.down;}]) {
  const s=fixture();change(s.catalog.records[id]);assert.throws(()=>s.resolve({id,state:{variant:14}}),/Missing or invalid cube variants/);
 }
});
test('public results and prior builds cannot change saved model state or resource choices',()=>{
 const s=fixture(),before=JSON.stringify(s.catalog),request={id:'red_mushroom_block',state:{variant:14}},p=s.resolve(request),expected={...p.bindings};
 p.state.variant=0;p.bindings.up='wrong';const first=p.build({state:{variant:0},bindings:{up:'wrong'}});assert.equal(first.id,'cube');assert.equal(first.E.state.variant,14);assert.deepEqual(first.E.bindings,expected);
 first.E.state.variant=0;first.E.bindings.up='wrong';assert.equal(p.build({}).E.state.variant,14);assert.deepEqual(p.build({}).E.bindings,expected);assert.deepEqual(request.state,{variant:14});assert.equal(JSON.stringify(s.catalog),before);
});
