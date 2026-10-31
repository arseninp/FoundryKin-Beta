import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock,resourceVariants} from '../catalog/resources.mjs';
import {powerRules,compileStateGroups} from '../catalog/states.mjs';
const P='textures/blocks/',BASES=['furnace','blast_furnace','smoker'],FACES=['up','down','north','south','east','west'];
// Selected definitions from blocks-000/002/004 and terrain-000/001/003 at PIN 46ba6ea.
function inputs() {
 const blocks={},atlas={};
 for(const base of BASES) {
  const bottom=base==='smoker'?'smoker_bottom':base+'_top',top=base+'_top',side=base+'_side',off=base+'_front_off',on=base+'_front_on';
  blocks[base]={sound:'stone',textures:{down:bottom,east:side,north:side,south:off,up:top,west:side}};
  blocks['lit_'+base]={sound:'stone',textures:{down:bottom,east:on,north:side,south:side,up:top,west:side}};
  for(const key of new Set([bottom,top,side]))atlas[key]={textures:[P+key,P+key]};
  atlas[off]={textures:P+off};atlas[on]={textures:P+on};
 }
 return {blocks,atlas};
}
function records(input=inputs()) {return Object.fromEntries(Object.entries(input.blocks).map(([id,def])=>[id,normalizeBlock(id,def,input.atlas,{model:'cube'})]));}
test('all three lit source fronts are normalized onto the same south face as their unlit counterpart',()=>{
 const input=inputs(),before=JSON.stringify(input),r=records(input);
 for(const base of BASES) {
  assert.equal(input.blocks['lit_'+base].textures.east,base+'_front_on');
  assert.deepEqual(r[base].faces.south,[P+base+'_front_off']);assert.deepEqual(r['lit_'+base].faces.south,[P+base+'_front_on']);
  assert.deepEqual(r['lit_'+base].faces.east,[P+base+'_side']);
  for(const face of FACES.filter(face=>face!=='south'))assert.deepEqual(r[base].variants[face],r['lit_'+base].variants[face]);
 }
 assert.equal(JSON.stringify(input),before);
});
test('normalization retains every PNG and repeated native index while changing only east/south orientation',()=>{
 const input=inputs(),r=records(input);
 for(const [id,def] of Object.entries(input.blocks)) {
  const original=Object.fromEntries(FACES.map(face=>[face,resourceVariants(input.atlas[def.textures[face]].textures)]));
  assert.deepEqual(r[id].paths,[...new Set(Object.values(original).flat())].sort());
  for(const face of ['up','down','north','west'])assert.deepEqual(r[id].variants[face],original[face]);
  assert.equal(r[id].variants.up.length,2);assert.equal(r[id].faces.up.length,1);
  assert.deepEqual(r[id].variants.east,id.startsWith('lit_')?original.south:original.east);
  assert.deepEqual(r[id].variants.south,id.startsWith('lit_')?original.east:original.south);
 }
});
test('power groups retain both source IDs, correct state routes, and the full union of resources',()=>{
 const r=records(),before=JSON.stringify(r),result=compileStateGroups(r,powerRules(r));assert.deepEqual(result.cards,[...BASES].sort());assert.equal(Object.keys(result.routes).length,6);
 for(const base of BASES) {
  assert.equal(Object.getPrototypeOf(result.groups[base].variants),null);assert.deepEqual({...result.groups[base].variants},{off:base,on:'lit_'+base});assert.equal(result.groups[base].default,'off');
  assert.deepEqual(result.routes[base],{card:base,state:{powered:'off'}});assert.deepEqual(result.routes['lit_'+base],{card:base,state:{powered:'on'}});
  assert.deepEqual(result.groups[base].paths,[...new Set([...r[base].paths,...r['lit_'+base].paths])].sort());
  for(const value of ['off','on'])assert.equal(r[result.groups[base].variants[value]].faces.south[0],P+base+'_front_'+value);
 }
 assert.equal(JSON.stringify(r),before);
});
test('already canonical definitions are not rotated a second time and source objects may be frozen',()=>{
 const input=inputs();
 for(const base of BASES) {
  const def=structuredClone(input.blocks['lit_'+base]);[def.textures.east,def.textures.south]=[def.textures.south,def.textures.east];Object.freeze(def.textures);Object.freeze(def);
  const canonical=normalizeBlock('lit_'+base,def,input.atlas,{model:'cube'});
  assert.deepEqual(canonical,records(input)['lit_'+base]);
 }
});
test('lookalike IDs and custom texture layouts never trigger the pinned orientation rule',()=>{
 const input=inputs();
 for(const base of BASES) {
  const source=input.blocks['lit_'+base],id='future_lit_'+base,r=normalizeBlock(id,source,input.atlas,{model:'cube'});
  assert.deepEqual(r.faces.east,[P+base+'_front_on']);assert.deepEqual(r.faces.south,[P+base+'_side']);
  const def=structuredClone(source);def.textures.south=base+'_front_off';
  const custom=normalizeBlock('lit_'+base,def,input.atlas,{model:'cube'});assert.deepEqual(custom.faces.east,[P+base+'_front_on']);assert.deepEqual(custom.faces.south,[P+base+'_front_off']);
  const uniform=normalizeBlock('lit_'+base,{textures:base+'_side'},input.atlas,{model:'cube'});assert.ok(Object.values(uniform.faces).every(paths=>paths.length===1&&paths[0]===P+base+'_side'));
 }
});
test('synthetic carried resources and icon roles remain owned without changing the input definition',()=>{
 const input=inputs();input.atlas.icon={textures:'textures/items/furnace_icon'};
 for(const base of BASES) {
  const def={...input.blocks['lit_'+base],carried_textures:'icon'},before=JSON.stringify(def),icon='textures/items/furnace_icon';
  const r=normalizeBlock('lit_'+base,def,input.atlas,{model:'cube',icons:[icon]});
  assert.deepEqual(r.icons,[icon]);assert.ok(r.paths.includes(icon));assert.ok(Object.values(r.carried).every(paths=>paths.length===1&&paths[0]===icon));assert.deepEqual(r.faces.south,[P+base+'_front_on']);assert.equal(JSON.stringify(def),before);
 }
});
test('missing atlas keys and inventory resources still fail explicitly after orientation normalization',()=>{
 for(const base of BASES) {
  const input=inputs(),id='lit_'+base,def=input.blocks[id],atlas=structuredClone(input.atlas);delete atlas[base+'_front_on'];
  assert.throws(()=>normalizeBlock(id,def,atlas,{model:'cube'}),/Unresolved texture key/);
  const inventory=Object.fromEntries(Object.values(input.atlas).flatMap(row=>resourceVariants(row.textures)).map(path=>[path,true]));delete inventory[P+base+'_front_on'];
  const before=JSON.stringify(input);assert.throws(()=>normalizeBlock(id,def,input.atlas,{model:'cube',existing:inventory}),/Missing resource file/);assert.equal(JSON.stringify(input),before);
 }
});
