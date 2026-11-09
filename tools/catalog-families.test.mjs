import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
import {materialFamilyRules} from '../catalog/rules/material-families.mjs';
import {compileCatalog} from '../catalog/compile.mjs';
import {compileModelCatalog} from '../models/library.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {compiledSearchIds,compiledFamilyPaths,compiledReopen} from '../catalog/editor-selection.mjs';
import {createThreeMock} from './three-mock.mjs';
test('groups wool and moss carpets without a per-color table',()=>{
 const data={white_wool:{textures:'white'},white_carpet:{textures:'white'},moss_block:{textures:'moss'},moss_carpet:{textures:'moss'}};
 const r=compileFamilies(data);assert.deepEqual(r.cards,['moss_block','white_wool']);assert.equal(r.owner.white_carpet,'white_wool');assert.equal(r.families.moss_block.variants[1].form,'carpet');
});
test('pale moss carried texture remains part of the carpet variant',()=>{
 const input={pale_moss_block:{textures:'pale'},pale_moss_carpet:{textures:'pale',carried_textures:'pale_side',sound:'moss_carpet'}};
 const r=compileFamilies(input),v=r.families.pale_moss_block.variants.find(v=>v.form==='carpet');
 assert.equal(r.cards.length,1);assert.deepEqual(v.resource,input.pale_moss_carpet);v.resource.carried_textures='changed';assert.equal(input.pale_moss_carpet.carried_textures,'pale_side');
});
test('same texture alone does not merge unrelated blocks',()=>{
 const r=compileFamilies({first:{textures:'same'},second:{textures:'same'}});assert.equal(r.cards.length,2);
});
test('ambiguous material parents are not silently chosen',()=>{
 const r=compileFamilies({oak:{textures:'oak'},oak_planks:{textures:'oak'},oak_slab:{textures:'oak'}});assert.equal(r.owner.oak_slab,'oak_slab');assert.equal(r.report.ambiguous.length,1);
});
test('different resources and orphan forms remain accessible',()=>{
 const r=compileFamilies({stone:{textures:'stone'},stone_slab:{textures:'different'},orphan_carpet:{textures:'orphan'}});assert.equal(r.cards.length,3);assert.equal(r.owner.stone_slab,'stone_slab');
});
test('actual pinned blocks retain every definition and group both moss carpets',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={};
 for(const n of (await readdir(dir)).filter(n=>/^blocks-\d+\.json$/.test(n)))Object.assign(blocks,JSON.parse(await readFile(new URL(n,dir),'utf8')));
 const before=JSON.stringify(blocks),r=compileFamilies(blocks);
 assert.equal(Object.keys(r.owner).length,Object.keys(blocks).length);
 for(const [id,entry] of Object.entries(blocks)){const v=r.families[r.owner[id]].variants.find(v=>v.id===id);assert.deepEqual(v.resource,entry,id)}
 assert.equal(r.owner.moss_carpet,'moss_block');assert.equal(r.owner.pale_moss_carpet,'pale_moss_block');
 assert.equal(r.families.pale_moss_block.variants.find(v=>v.id==='pale_moss_carpet').resource.carried_textures,'pale_moss_carpet_side');
 assert.equal(JSON.stringify(blocks),before);
});
test('production family rules preserve explicit additions and reject conflicting declarations',()=>{
 const blocks={stone:{textures:'stone'},stone_slab:{textures:'stone'}},terrain={texture_data:{stone:{textures:'textures/blocks/stone'}}},explicit={stone:{slab:'stone_slab',custom:'custom_source'}},before=JSON.stringify({blocks,terrain,explicit});
 const rules=materialFamilyRules(blocks,terrain,explicit);
 assert.equal(rules.stone.slab,'stone_slab');assert.equal(rules.stone.custom,'custom_source');
 assert.equal(JSON.stringify({blocks,terrain,explicit}),before);
 assert.throws(()=>materialFamilyRules(blocks,terrain,{stone:{slab:'other_source'}}),/Conflicting material family form/);
 for(const invalid of [null,[],false])assert.throws(()=>materialFamilyRules(blocks,terrain,invalid),/Invalid material family input/);
 assert.throws(()=>materialFamilyRules(blocks,terrain,{stone:null}),/Invalid family forms/);
});
test('production catalog exposes family cards, source search and exact reopen without legacy binding',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input);
 const {catalog}=compileModelCatalog(input,createThreeMock()),runtime={catalog,access:createCatalogAccess(catalog)};
 for(const [source,base,form] of [['acacia_button','acacia_planks','button'],['acacia_stairs','acacia_planks','stairs'],['moss_carpet','moss_block','carpet'],['pale_moss_carpet','pale_moss_block','carpet'],['smooth_stone_double_slab','smooth_stone','double_slab'],['petrified_oak_double_slab','petrified_oak_slab','double_slab'],['cave_vines_body_with_berries','cave_vines','body'],['cave_vines_head_with_berries','cave_vines','head']]) {
  assert.ok(catalog.cards.includes(base));assert.ok(!catalog.cards.includes(source));assert.ok(catalog.records[source]);
  assert.deepEqual(runtime.access.describe(source),{kind:'block',id:source,card:base,form});
  assert.deepEqual(compiledSearchIds(runtime,source),source==='moss_carpet'?['moss_block','pale_moss_block']:[base]);
  for(const path of catalog.records[source].paths) {
   assert.ok(compiledFamilyPaths(runtime,base).includes(path));
   const reopened=compiledReopen(runtime,path,source);assert.equal(reopened.status,'found');assert.equal(reopened.object.id,source);assert.equal(reopened.object.form,form);
   assert.ok(catalog.resources[path].some(owner=>owner.kind==='block'&&owner.id===source));
  }
 }
 assert.deepEqual(catalog.cards.filter(id=>id.startsWith('cave_vines')),['cave_vines']);
 assert.deepEqual(compiledSearchIds(runtime,'cave_vines'),['cave_vines']);
 assert.deepEqual(compiledFamilyPaths(runtime,'cave_vines'),catalog.records.cave_vines.paths);
 for(const [source,base] of [['acacia_double_slab','acacia_planks'],['andesite_double_slab','andesite'],['red_wool_double_slab','red_wool'],['double_cut_copper_slab','cut_copper'],['exposed_double_cut_copper_slab','exposed_cut_copper'],['waxed_double_cut_copper_slab','cut_copper']]) {
  assert.equal(catalog.aliases[source],base);assert.ok(!catalog.cards.includes(source));assert.ok(catalog.records[source]);
  assert.deepEqual(runtime.access.describe(source),{kind:'block',id:base,card:base,form:'native'});
  assert.ok(compiledSearchIds(runtime,source).includes(base));assert.ok(!compiledSearchIds(runtime,source).includes(source));assert.ok(!Object.hasOwn(catalog.families[base]??{},'double_slab'));
  for(const path of catalog.records[source].paths) {
   assert.ok(compiledFamilyPaths(runtime,base).includes(path));
   const reopened=compiledReopen(runtime,path,source);assert.equal(reopened.status,'found');assert.equal(reopened.object.id,base);
   assert.ok(catalog.resources[path].some(owner=>owner.kind==='block'&&owner.id===source));
  }
 }
 assert.equal(catalog.records.smooth_stone_double_slab.faces.north[0],'textures/blocks/stone_slab_side');
 assert.equal(catalog.records.acacia_button.model,'button');assert.equal(catalog.records.acacia_stairs.model,'stairs');
 assert.equal(JSON.stringify(input),before);
});
test('double slab names reuse ordinary material families without choosing ambiguous parents',()=>{
 for(const [base,single,double] of [['oak_planks','oak_slab','oak_double_slab'],['cut_copper','cut_copper_slab','double_cut_copper_slab'],['exposed_cut_copper','exposed_cut_copper_slab','exposed_double_cut_copper_slab']]) {
  const blocks=Object.fromEntries([base,single,double].map(id=>[id,{textures:'same'}])),r=compileFamilies(blocks);
  assert.equal(r.owner[double],base);assert.equal(r.families[base].variants.find(v=>v.id===double).form,'double_slab');
 }
 const ambiguous=compileFamilies({oak:{textures:'oak'},oak_planks:{textures:'oak'},oak_slab:{textures:'oak'},oak_double_slab:{textures:'oak'}});
 assert.equal(ambiguous.owner.oak_double_slab,'oak_double_slab');
 const orphan=compileFamilies({petrified_oak_slab:{textures:'oak'},petrified_oak_double_slab:{textures:'oak'}});
 assert.equal(orphan.owner.petrified_oak_double_slab,'petrified_oak_slab');
});
function doubleSlabInput(){
 const P='textures/blocks/',blocks={acacia_planks:{textures:'wood'},acacia_double_slab:{textures:'double'},stone:{textures:'stone'},infested_stone:{textures:'stone'},unrelated:{textures:'wood'}};
 const terrain={wood:{textures:P+'planks_acacia'},double:{textures:{path:P+'planks_acacia'}},stone:{textures:P+'stone'},other:{textures:P+'other'}};
 return {blocks,terrain,existing:{[P+'planks_acacia']:1,[P+'stone']:1,[P+'other']:1},models:Object.fromEntries(Object.keys(blocks).map(id=>[id,{model:'cube'}]))};
}
function compileDoubleSlabs(input){return compileCatalog({...input,families:materialFamilyRules(input.blocks,{texture_data:input.terrain})})}
test('equivalent doubles and infested aliases share the existing identity path without global PNG merging',()=>{
 const input=doubleSlabInput(),before=JSON.stringify(input),catalog=compileDoubleSlabs(input),access=createCatalogAccess(catalog);
 assert.equal(catalog.aliases.acacia_double_slab,'acacia_planks');assert.equal(catalog.aliases.infested_stone,'stone');
 assert.ok(catalog.cards.includes('unrelated'));assert.ok(catalog.records.acacia_double_slab);assert.ok(catalog.records.infested_stone);
 assert.ok(!Object.hasOwn(catalog.families,'acacia_planks'));
 assert.equal(access.describe('acacia_double_slab').id,'acacia_planks');assert.equal(JSON.stringify(input),before);
});
test('double slabs retain model, state, carried, icon, indexed and face differences as forms',()=>{
 const source='acacia_double_slab',P='textures/blocks/';
 const changes=[
  input=>{input.models[source].model='slab'},
  input=>{input.models[source].states={variant:'distinct'}},
  input=>{input.blocks[source].carried_textures='other'},
  input=>{input.items={icon:{textures:'textures/items/acacia'}};input.icons={[source]:['icon']};input.existing['textures/items/acacia']=1},
  input=>{input.terrain.double.textures=[P+'planks_acacia',P+'planks_acacia']},
  input=>{input.blocks.acacia_planks.textures={up:'wood',down:'other',side:'wood'};input.blocks[source].textures={up:'other',down:'wood',side:'wood'}}
 ];
 for(const change of changes){
  const input=doubleSlabInput();change(input);const before=JSON.stringify(input),catalog=compileDoubleSlabs(input),runtime={catalog,access:createCatalogAccess(catalog)};
  assert.ok(!Object.hasOwn(catalog.aliases,source));assert.ok(!catalog.cards.includes(source));assert.equal(catalog.families.acacia_planks.double_slab,source);
  assert.equal(runtime.access.describe(source).form,'double_slab');
  for(const path of catalog.records[source].paths){assert.ok(compiledFamilyPaths(runtime,'acacia_planks').includes(path));assert.equal(compiledReopen(runtime,path,source).object.id,source)}
  assert.equal(JSON.stringify(input),before);
 }
});
