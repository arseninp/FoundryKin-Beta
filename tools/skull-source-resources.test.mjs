import test from 'node:test';
import assert from 'node:assert/strict';
import {attachSkullSource} from '../catalog/rules/skull-sources.mjs';
const SHEETS={skeleton_skull:'textures/entity/skeleton/skeleton',wither_skeleton_skull:'textures/entity/skeleton/wither_skeleton',creeper_head:'textures/entity/creeper/creeper',zombie_head:'textures/entity/zombie/zombie',piglin_head:'textures/entity/piglin/piglin',dragon_head:'textures/entity/dragon/dragon',player_head:'textures/entity/steve'};
const FALLBACK='textures/blocks/soul_sand',FACES=['up','down','north','south','east','west'];
function input(id,icons=[]){
 const faces=Object.fromEntries(FACES.map(face=>[face,[FALLBACK]]));
 return {id,model:'skull',states:null,faces,variants:structuredClone(faces),carried:structuredClone(faces),carriedVariants:structuredClone(faces),icons,paths:[FALLBACK,...icons]};
}
test('all seven heads own their entity sheet without terrain fallback faces or slots',()=>{
 for(const [id,sheet] of Object.entries(SHEETS)){
  const record=input(id),definition={textures:'skull',sound:'stone'},before=structuredClone({record,definition}),inventory={[sheet]:true,[FALLBACK]:true};
  const result=attachSkullSource(record,definition,inventory);
  assert.equal(result.id,id);assert.equal(result.model,'skull');
  assert.deepEqual(result.paths,[sheet]);assert.deepEqual(result.bindings,{sheet:[sheet]});
  assert.deepEqual(result.faces,{});assert.deepEqual(result.variants,{});
  assert.equal(result.carried,null);assert.equal(result.carriedVariants,null);
  assert.equal(result.paths.includes(FALLBACK),false);
  assert.deepEqual(result.source,{kind:'block-entity',template:'skull',variant:id,definition});
  assert.notEqual(result.source.definition,definition);
  assert.deepEqual({record,definition},before);
 }
});
test('declared item icons are retained while unrelated terrain ownership is unchanged',()=>{
 const id='piglin_head',sheet=SHEETS[id],icon='textures/items/piglin_head',record=input(id,[icon]),definition={textures:'skull'},sand={id:'soul_sand',model:'cube',paths:[FALLBACK]},before=structuredClone(sand);
 const inventory={[sheet]:true,[icon]:true,[FALLBACK]:true},saved=structuredClone(inventory),result=attachSkullSource(record,definition,inventory);
 assert.deepEqual(result.paths,[sheet,icon].sort());assert.deepEqual(result.icons,[icon]);
 assert.deepEqual(sand,before);assert.deepEqual(inventory,saved);
});
test('unknown heads, missing sheets and conflicting bindings are still rejected without input mutation',()=>{
 const id='piglin_head',record=input(id),before=structuredClone(record),definition={textures:'skull'};
 assert.throws(()=>attachSkullSource(record,definition,{}),/Missing skull source sheet/);
 assert.throws(()=>attachSkullSource(input('soul_sand'),definition,{}),/Unknown skull source ID/);
 assert.throws(()=>attachSkullSource({...record,bindings:{}},definition,{[SHEETS[id]]:true}),/Conflicting skull source bindings/);
 assert.deepEqual(record,before);
});
