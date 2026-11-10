import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCatalog} from '../catalog/compile.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {BANNER_PATTERNS,attachBannerSource} from '../catalog/rules/banner-sources.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {compiledSelection,compiledSearchIds,compiledReopen} from '../catalog/editor-selection.mjs';
function fixture() {
  const stone = 'textures/blocks/stone', icon = 'textures/items/stone', shield = 'textures/entity/shield';
  return {blocks: {stone: {textures: 'stone'}, waxed_stone: {textures: 'stone'}, stone_slab: {textures: 'stone'}}, terrain: {stone: {textures: stone}}, existing: {[stone]: 1, [icon]: 1, [shield]: 1}, models: {stone: {model: 'cube'}, waxed_stone: {model: 'cube'}, stone_slab: {model: 'slab'}}, items: {stone_icon: {textures: icon}, shield: {textures: {path: shield}}}, icons: {stone: ['stone_icon'], waxed_stone: ['stone_icon']}, aliases: {waxed_stone: {target: 'stone', reason: 'shared editor resources'}}, families: {stone: {slab: 'stone_slab'}}};
}
test('one assembly retains alias ids, family variants and explicit sprite resources', () => {
  const cat = compileCatalog(fixture());
  assert.deepEqual(cat.cards, ['stone']);
  assert.equal(cat.aliases.waxed_stone, 'stone');
  assert.equal(cat.families.stone.slab, 'stone_slab');
  assert.deepEqual(cat.items.shield.paths, ['textures/entity/shield']);
  assert.equal(cat.items.shield.kind, 'sprite');
  assert.equal(cat.resources['textures/blocks/stone'].length, 3);
  assert.ok(cat.resources['textures/items/stone'].some(owner => owner.kind === 'item'));
});
test('special resources survive without a replacement slot list', () => {
  const data = fixture();data.terrain.carried = {textures: ['textures/blocks/c1', 'textures/blocks/c2']};
  for (const path of data.terrain.carried.textures) data.existing[path] = 1;
  for (const id of ['stone', 'waxed_stone']) data.blocks[id].carried_textures = {side: 'carried', up: 'stone', down: 'stone'};
  const cat = compileCatalog(data);
  assert.ok(cat.records.stone.paths.includes('textures/blocks/c2'));
  assert.ok(cat.records.stone.icons.includes('textures/items/stone'));
});
test('missing model, image, item key and icon owner fail explicitly', () => {
  for (const mutate of [d => delete d.models.stone, d => delete d.existing['textures/items/stone'], d => d.icons.stone.push('absent'), d => d.icons.absent = ['stone_icon']]) {
    const data = fixture();mutate(data);assert.throws(() => compileCatalog(data));
  }
});
test('a shared PNG does not merge a slab into a cube', () => {
  const data = fixture();data.aliases.stone_slab = {target: 'stone', reason: 'unsafe proposal'};
  assert.throws(() => compileCatalog(data), /Alias would lose/);
});
test('duplicate and nested family membership are rejected', () => {
  for (const mutate of [d => d.families.stone.other = 'stone_slab', d => d.families.stone_slab = {}, d => d.families.stone.native = 'stone']) {
    const data = fixture();mutate(data);assert.throws(() => compileCatalog(data));
  }
});
test('missing and alias family endpoints are rejected', () => {
  for (const id of ['absent', 'waxed_stone']) {
    const data = fixture();data.families.stone.slab = id;assert.throws(() => compileCatalog(data));
  }
});
test('source inputs are unchanged, and every block resource is reverse indexed', () => {
  const data = fixture(), before = JSON.stringify(data), cat = compileCatalog(data);
  assert.equal(JSON.stringify(data), before);
  for (const record of Object.values(cat.records)) for (const path of record.paths) assert.ok(cat.resources[path].some(owner => owner.kind === 'block' && owner.id === record.id));
});

const BANNER_DIR='textures/entity/banner/',BANNER_BASE=BANNER_DIR+'banner_base';
const BANNER_WOODS=['oak','spruce','birch','jungle','acacia','big_oak'].map(wood=>'textures/blocks/planks_'+wood);
function bannerFixture() {
 const paths=[...BANNER_WOODS,BANNER_BASE,...BANNER_PATTERNS.map(name=>BANNER_DIR+'banner_'+name),...['banner','banner_illager','banner_pattern_illager'].map(name=>BANNER_DIR+name)];
 return {blocks:{standing_banner:{textures:'planks',sound:'wood'},wall_banner:{textures:'planks',sound:'wood'},oak_planks:{textures:'oak'}},terrain:{planks:{textures:[...BANNER_WOODS]},oak:{textures:BANNER_WOODS[0]}},existing:Object.fromEntries(paths.map(path=>[path,1])),models:{standing_banner:{model:'banner'},wall_banner:{model:'banner'},oak_planks:{model:'cube'}}};
}
function bannerRuntime(catalog) {
 const registry={get(model){if(!['banner','cube','sprite'].includes(model))throw new Error('Unknown model');return {scale:1,mode:model==='sprite'?'sprite':'volume'};},build(model,environment){return {model,environment};}};
 return {catalog,access:createCatalogAccess(catalog),resolve:createPreviewResolver(catalog,registry)};
}
test('banner placements are one family without fallback plank ownership or lost source IDs',()=>{
 const input=bannerFixture(),before=JSON.stringify(input),catalog=compileCatalog(input),runtime=bannerRuntime(catalog);
 assert.deepEqual(catalog.cards,['oak_planks','standing_banner']);
 assert.deepEqual(catalog.families.standing_banner,{native:'standing_banner',wall:'wall_banner'});
 assert.equal(Object.keys(catalog.records).length,3);assert.equal(Object.hasOwn(catalog.aliases,'wall_banner'),false);
 assert.deepEqual(compiledSearchIds(runtime,'wall_banner'),['standing_banner']);
 assert.deepEqual(catalog.resources[BANNER_WOODS[0]],[{kind:'block',id:'oak_planks'}]);
 for(const path of BANNER_WOODS.slice(1))assert.equal(Object.hasOwn(catalog.resources,path),false);
 for(const id of ['standing_banner','wall_banner']){
  const record=catalog.records[id];assert.equal(record.model,'banner');
  assert.deepEqual(record.source.definition,input.blocks[id]);
  assert.equal(record.source.placement,id==='wall_banner'?'wall':'standing');
  assert.equal(Object.keys(record.source.patterns).length,42);
  assert.equal(record.paths.length,46);assert.deepEqual(record.bindings,{sheet:[BANNER_BASE]});
  for(const face of ['up','down','north','south','east','west']){assert.deepEqual(record.faces[face],[BANNER_BASE]);assert.deepEqual(record.variants[face],[BANNER_BASE]);}
  for(const path of record.paths){
   assert.ok(!BANNER_WOODS.includes(path));
   assert.ok(catalog.resources[path].some(owner=>owner.kind==='block'&&owner.id===id));
   const found=compiledReopen(runtime,path,id);assert.equal(found.status,'found');assert.equal(found.object.id,id);assert.equal(found.object.card,'standing_banner');
  }
 }
 assert.equal(JSON.stringify(input),before);
});
test('banner form and edited pattern stay independent through the existing resolver',()=>{
 const runtime=bannerRuntime(compileCatalog(bannerFixture())),pattern=BANNER_DIR+'banner_creeper';
 for(const form of ['native','wall']){
  const selected=compiledSelection(runtime,{id:'standing_banner',form,slot:pattern});
  assert.equal(selected.plan.object.form,form);assert.equal(selected.plan.object.id,form==='wall'?'wall_banner':'standing_banner');
  assert.equal(selected.plan.slot,pattern);assert.deepEqual(selected.plan.modelResourcePaths,[BANNER_BASE]);
  assert.deepEqual(selected.plan.state.patterns,[]);assert.equal(selected.plan.state.color,'white');
  assert.deepEqual(selected.borrowed,[]);assert.deepEqual(selected.editable,[BANNER_BASE,pattern]);
  assert.equal(selected.plan.build({}).environment.cur,selected.plan.object.id);
 }
 const wall=runtime.access.describe('wall_banner');assert.equal(wall.form,'wall');assert.equal(wall.card,'standing_banner');
});
test('banner source replacement preserves declared icons and carried resources without mutating inputs',()=>{
 const input=bannerFixture(),icon='textures/items/banner_test',carried='textures/items/banner_carried_test';
 input.existing[icon]=1;input.existing[carried]=1;input.terrain.carried={textures:carried};
 const definition={textures:'planks',carried_textures:'carried'},record=normalizeBlock('standing_banner',definition,input.terrain,{model:'banner',icons:[icon],existing:input.existing});
 const before=JSON.stringify({record,definition,input}),attached=attachBannerSource(record,definition,input.existing);
 assert.deepEqual(attached.icons,[icon]);assert.deepEqual(attached.carried,record.carried);assert.deepEqual(attached.carriedVariants,record.carriedVariants);
 assert.ok(attached.paths.includes(icon));assert.ok(attached.paths.includes(carried));assert.ok(attached.paths.every(path=>!BANNER_WOODS.includes(path)));
 assert.equal(JSON.stringify({record,definition,input}),before);
 attached.source.definition.textures='changed';assert.equal(definition.textures,'planks');
});
test('incomplete banner resources still fail and a lone placement remains accessible',()=>{
 for(const path of [BANNER_BASE,BANNER_DIR+'banner_creeper',BANNER_DIR+'banner_illager']){
  const input=bannerFixture();delete input.existing[path];assert.throws(()=>compileCatalog(input),/Missing banner source resource/);
 }
 for(const missing of ['standing_banner','wall_banner']){
  const input=bannerFixture();delete input.blocks[missing];delete input.models[missing];
  const catalog=compileCatalog(input),remaining=missing==='standing_banner'?'wall_banner':'standing_banner';
  assert.ok(catalog.cards.includes(remaining));assert.equal(Object.hasOwn(catalog.families,'standing_banner'),false);
 }
});
