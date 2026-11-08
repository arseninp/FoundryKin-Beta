import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
import {materialFamilyRules} from '../catalog/rules/material-families.mjs';
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
 for(const [source,base,form] of [['acacia_button','acacia_planks','button'],['acacia_stairs','acacia_planks','stairs'],['moss_carpet','moss_block','carpet'],['pale_moss_carpet','pale_moss_block','carpet']]) {
  assert.ok(catalog.cards.includes(base));assert.ok(!catalog.cards.includes(source));assert.ok(catalog.records[source]);
  assert.deepEqual(runtime.access.describe(source),{kind:'block',id:source,card:base,form});
  assert.deepEqual(compiledSearchIds(runtime,source),[base]);
  for(const path of catalog.records[source].paths) {
   assert.ok(compiledFamilyPaths(runtime,base).includes(path));
   const reopened=compiledReopen(runtime,path,source);assert.equal(reopened.status,'found');assert.equal(reopened.object.id,source);assert.equal(reopened.object.form,form);
   assert.ok(catalog.resources[path].some(owner=>owner.kind==='block'&&owner.id===source));
  }
 }
 assert.ok(catalog.cards.includes('acacia_double_slab'));
 assert.equal(catalog.records.acacia_button.model,'button');assert.equal(catalog.records.acacia_stairs.model,'stairs');
 assert.equal(JSON.stringify(input),before);
});
