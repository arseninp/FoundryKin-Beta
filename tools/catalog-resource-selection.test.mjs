import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock, resolveTexture, resourceSignature} from '../catalog/resources.mjs';
import {compileCatalog} from '../catalog/compile.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {compiledSelection, compiledFamilyPaths, compiledReopen} from '../catalog/editor-selection.mjs';
const doors = {wooden_door: 'wood', spruce_door: 'spruce', birch_door: 'birch', jungle_door: 'jungle', acacia_door: 'acacia', dark_oak_door: 'dark_oak', iron_door: 'iron'};
const path = (wood, half) => 'textures/blocks/door_' + wood + '_' + half;
function atlas() {
 return Object.fromEntries(['lower', 'upper'].map(half => ['door_' + half, {textures: Object.values(doors).map(wood => path(wood, half))}]));
}
const definition = {textures: {up: 'door_lower', down: 'door_lower', side: 'door_upper'}};
test('each shared-atlas door gets only its own two halves', () => {
 for (const [id, wood] of Object.entries(doors)) {
  const record = normalizeBlock(id, definition, atlas(), {model: 'door'});
  assert.deepEqual(record.paths, [path(wood, 'lower'), path(wood, 'upper')].sort());
  assert.deepEqual(record.faces.up, [path(wood, 'lower')]);
  assert.deepEqual(record.faces.north, [path(wood, 'upper')]);
 }
});
test('atlas order and repeated entries cannot change the selected wood', () => {
 const input = atlas();
 for (const row of Object.values(input)) row.textures = [row.textures[0], ...row.textures.reverse()];
 assert.deepEqual(normalizeBlock('iron_door', definition, input).paths, [path('iron', 'lower'), path('iron', 'upper')]);
 assert.equal(resolveTexture('door_lower', input).length, 7);
});
test('unknown shared-atlas owners and missing assigned images fail explicitly', () => {
 assert.throws(() => normalizeBlock('mystery_door', definition, atlas()), /Unassigned/);
 const input = atlas();input.door_lower.textures = [path('wood', 'lower')];
 assert.throws(() => normalizeBlock('iron_door', definition, input), /Missing assigned/);
});
test('independent door keys and ordinary state arrays retain all alternatives', () => {
 const input = {copper_door: {textures: ['textures/blocks/copper_a', 'textures/blocks/copper_b']}, candle: {textures: ['textures/blocks/candle', 'textures/blocks/candle_lit']}};
 for (const id of ['copper_door', 'candle']) assert.deepEqual(normalizeBlock(id, {textures: id}, input).paths, input[id].textures);
});
test('carried face maps are preserved and invalid ID types never coerce', () => {
 const input = {stone: {textures: 'textures/blocks/stone'}, carried: {textures: ['textures/blocks/a', 'textures/blocks/b']}};
 const record = normalizeBlock('stone', {textures: 'stone', carried_textures: {side: 'carried', up: 'stone', down: 'stone'}}, input);
 assert.equal(record.paths.length, 3);assert.equal(record.carried.north.length, 2);
 for (const id of [null, undefined, 12, {toString: () => 'stone'}]) assert.throws(() => normalizeBlock(id, {textures: 'stone'}, input), /Invalid block id/);
});
test('normalization does not mutate source arrays or definitions', () => {
 const input = atlas(), before = JSON.stringify({input, definition});
 normalizeBlock('birch_door', definition, input).faces.up.push('textures/blocks/fake');
 assert.equal(JSON.stringify({input, definition}), before);
});

const COLOR='textures/blocks/polished_cinnabar', MAP=COLOR+'_mers';
const MATERIAL_ROLE='metalness_emissive_roughness_subsurface';
function materialAtlas() {return {cinnabar:{textures:COLOR},stone:{textures:'textures/blocks/stone'}};}
function materialInventory() {return {[COLOR]:1,[MAP]:1,'textures/blocks/stone':1};}
test('declared material maps belong to every matching block form without becoming faces or icons',()=>{
 for(const [id,model] of [['polished_cinnabar','cube'],['polished_cinnabar_slab','slab'],['polished_cinnabar_stairs','stairs'],['polished_cinnabar_wall','wall'],['polished_cinnabar_double_slab','cube']]) {
  const record=normalizeBlock(id,{textures:'cinnabar'},materialAtlas(),{model,existing:materialInventory()});
  assert.deepEqual(record.paths,[COLOR,MAP]);
  assert.deepEqual(record.textureSets,{[COLOR]:{[MATERIAL_ROLE]:MAP}});
  assert.deepEqual(record.icons,[]);assert.equal(record.model,model);
  for(const face of Object.keys(record.faces)){assert.deepEqual(record.faces[face],[COLOR]);assert.deepEqual(record.variants[face],[COLOR]);}
 }
});
test('material maps follow exact declared color resources, not object names, suffixes or icon roles',()=>{
 const input={...materialAtlas(),similar:{textures:COLOR+'_other'}},inventory={...materialInventory(),[COLOR+'_other']:1};
 const unrelated=normalizeBlock('polished_cinnabar',{textures:'stone'},input,{model:'cube',icons:[COLOR],existing:inventory});
 assert.equal(Object.hasOwn(unrelated,'textureSets'),false);assert.equal(unrelated.paths.includes(MAP),false);
 assert.equal(Object.hasOwn(normalizeBlock('other',{textures:'similar'},input,{model:'cube',existing:inventory}),'textureSets'),false);
 const carried=normalizeBlock('other',{textures:'stone',carried_textures:'cinnabar'},input,{model:'cube',existing:inventory});
 assert.deepEqual(carried.textureSets,{[COLOR]:{[MATERIAL_ROLE]:MAP}});assert.deepEqual(carried.carried.up,[COLOR]);
 const repeated=normalizeBlock('other',{textures:'repeat'},{repeat:{textures:[COLOR,COLOR]}},{model:'cube',existing:inventory});
 assert.deepEqual(repeated.variants.up,[COLOR,COLOR]);assert.deepEqual(repeated.paths,[COLOR,MAP]);
});
test('missing declared material files fail and texture-set objects are not shared or source-mutating',()=>{
 const input=materialAtlas(),definition={textures:'cinnabar'},existing=materialInventory(),before=JSON.stringify({input,definition,existing});
 assert.throws(()=>normalizeBlock('polished_cinnabar',definition,input,{model:'cube',existing:{[COLOR]:1}}),/Missing resource file: textures\/blocks\/polished_cinnabar_mers/);
 const first=normalizeBlock('a',definition,input,{model:'cube',existing});
 first.textureSets[COLOR][MATERIAL_ROLE]='textures/blocks/changed';first.paths.push('textures/blocks/changed');
 const second=normalizeBlock('b',definition,input,{model:'cube',existing});
 assert.deepEqual(second.textureSets,{[COLOR]:{[MATERIAL_ROLE]:MAP}});assert.deepEqual(second.paths,[COLOR,MAP]);
 assert.equal(JSON.stringify({input,definition,existing}),before);
});
test('editor equivalence includes material-map roles as well as unchanged model resources',()=>{
 const record=normalizeBlock('polished_cinnabar',{textures:'cinnabar'},materialAtlas(),{model:'cube'}),signature=resourceSignature(record);
 const different=structuredClone(record);different.textureSets[COLOR]={normal:MAP};
 assert.notEqual(resourceSignature(different),signature);
 const equivalent=structuredClone(record);equivalent.id='polished_cinnabar_double_slab';
 assert.equal(resourceSignature(equivalent),signature);
});
function materialRuntime() {
 const id='polished_cinnabar',slab=id+'_slab',double=id+'_double_slab';
 const catalog=compileCatalog({blocks:{[id]:{textures:'cinnabar'},[slab]:{textures:'cinnabar'},[double]:{textures:'cinnabar'}},terrain:materialAtlas(),existing:materialInventory(),models:{[id]:{model:'cube'},[slab]:{model:'slab'},[double]:{model:'cube'}},families:{[id]:{slab,double_slab:double}}});
 const registry={get(model){if(!['cube','slab','sprite'].includes(model))throw new Error('Unknown model');return {scale:1,mode:model==='sprite'?'sprite':'volume'};},build(model,environment){return {model,environment};}};
 return {catalog,access:createCatalogAccess(catalog),resolve:createPreviewResolver(catalog,registry)};
}
test('material-map selection and reopen use existing families, aliases and reverse indexing without changing the model',()=>{
 const runtime=materialRuntime(),id='polished_cinnabar',double=id+'_double_slab',before=JSON.stringify(runtime.catalog);
 assert.deepEqual(runtime.catalog.cards,[id]);assert.equal(runtime.catalog.aliases[double],id);
 for(const source of [id,id+'_slab',double]) {
  assert.deepEqual(compiledFamilyPaths(runtime,source),[COLOR,MAP]);
  const selected=compiledSelection(runtime,{id:source,slot:MAP});
  assert.equal(selected.plan.slot,MAP);assert.notEqual(selected.plan.model,'sprite');
  assert.deepEqual(selected.plan.modelResourcePaths,[COLOR]);assert.deepEqual(selected.editable,[COLOR,MAP]);assert.deepEqual(selected.borrowed,[]);
  assert.deepEqual(Object.values(selected.plan.bindings),Array(6).fill(COLOR));
  const reopened=compiledReopen(runtime,MAP,source);assert.equal(reopened.status,'found');assert.equal(reopened.object.card,id);
 }
 assert.equal(runtime.catalog.resources[MAP].length,3);
 assert.throws(()=>runtime.resolve({id,slot:MAP,view:'sprite'}),/declared icon role/);
 assert.equal(JSON.stringify(runtime.catalog),before);
});
