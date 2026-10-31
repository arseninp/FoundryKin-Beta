import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCatalog} from '../catalog/compile.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {familyRules} from '../catalog/rules/forms.mjs';
const P='textures/blocks/',ICON='textures/items/bamboo';
// Selected bamboo definitions and scalar atlas entries from blocks-000/terrain-000 at PIN 46ba6ea.
function fixture() {
 const blocks={
  bamboo:{carried_textures:'bamboo_carried',sound:'bamboo',textures:{down:'bamboo_sapling',east:'bamboo_singleleaf',north:'bamboo_stem',south:'bamboo_small_leaf',up:'bamboo_leaf',west:'bamboo_stem'}},
  bamboo_sapling:{carried_textures:'bamboo_carried',sound:'bamboo_sapling',textures:'bamboo_sapling'}
 };
 const terrain=Object.fromEntries(['bamboo_sapling','bamboo_singleleaf','bamboo_stem','bamboo_small_leaf','bamboo_leaf'].map(key=>[key,{textures:P+key}]));terrain.bamboo_carried={textures:ICON};
 return {blocks,terrain,existing:Object.fromEntries(Object.values(terrain).map(row=>[row.textures,true])),models:{bamboo:{model:'bamboo'},bamboo_sapling:{model:'cross'}}};
}
test('adult bamboo and its shoot compile into one card without merging their source records or models',()=>{
 const input=fixture(),before=JSON.stringify(input),cat=compileCatalog(input);
 assert.deepEqual(cat.cards,['bamboo']);assert.deepEqual(cat.families.bamboo,{native:'bamboo',shoot:'bamboo_sapling'});assert.equal(Object.keys(cat.records).length,2);assert.deepEqual(cat.aliases,{});
 assert.equal(cat.records.bamboo.model,'bamboo');assert.equal(cat.records.bamboo_sapling.model,'cross');assert.notDeepEqual(cat.records.bamboo.faces,cat.records.bamboo_sapling.faces);
 assert.deepEqual(cat.records.bamboo_sapling.paths,[P+'bamboo_sapling',ICON]);assert.ok(cat.records.bamboo.paths.includes(P+'bamboo_stem'));assert.ok(cat.records.bamboo.paths.includes(ICON));assert.equal(JSON.stringify(input),before);
});
test('saved shoot IDs and ambiguous shared PNGs preserve the selected source and family form',()=>{
 const cat=compileCatalog(fixture()),access=createCatalogAccess(cat);
 assert.deepEqual(access.describe('bamboo'),{kind:'block',id:'bamboo',card:'bamboo',form:'native'});
 assert.deepEqual(access.describe('bamboo_sapling'),{kind:'block',id:'bamboo_sapling',card:'bamboo',form:'shoot'});
 for(const path of [P+'bamboo_sapling',ICON]) {
  assert.equal(access.locate(path).status,'ambiguous');assert.equal(access.locate(path,{preferredId:'bamboo_sapling'}).object.id,'bamboo_sapling');assert.equal(access.locate(path,{preferredId:'bamboo_sapling'}).object.form,'shoot');assert.equal(access.locate(path,{preferredId:'bamboo'}).object.id,'bamboo');
 }
 assert.equal(access.locate(P+'bamboo_stem').object.id,'bamboo');assert.equal(Object.keys(cat.stateGroups).length,0);
});
test('partial input and lookalike IDs never produce a guessed or dangling default family',()=>{
 for(const absent of ['bamboo','bamboo_sapling']) {
  const input=fixture();delete input.blocks[absent];delete input.models[absent];const cat=compileCatalog(input);assert.deepEqual(Object.keys(cat.families),[]);assert.deepEqual(cat.cards,Object.keys(input.blocks));
 }
 const input=fixture();input.blocks.future_bamboo_sapling=input.blocks.bamboo_sapling;input.models.future_bamboo_sapling=input.models.bamboo_sapling;delete input.blocks.bamboo_sapling;delete input.models.bamboo_sapling;
 const cat=compileCatalog(input);assert.deepEqual(Object.keys(cat.families),[]);assert.deepEqual(cat.cards,['bamboo','future_bamboo_sapling']);
});
test('an identical explicit rule is compatible, copied, and safe with frozen caller data',()=>{
 const input=fixture();input.families=Object.freeze({bamboo:Object.freeze({shoot:'bamboo_sapling'})});const before=JSON.stringify(input);
 const cat=compileCatalog(input);assert.deepEqual(cat.families.bamboo,{native:'bamboo',shoot:'bamboo_sapling'});assert.equal(JSON.stringify(input),before);
 const rules=familyRules(cat.records,input.families);rules.bamboo.shoot='changed';assert.equal(input.families.bamboo.shoot,'bamboo_sapling');assert.equal(familyRules(cat.records).bamboo.shoot,'bamboo_sapling');
});
test('conflicts, reserved forms and multiple ownership still reject instead of hiding a source ID',()=>{
 const conflict=fixture();conflict.families={bamboo:{shoot:'bamboo'}};assert.throws(()=>compileCatalog(conflict),/Conflicting family form/);
 const reserved=fixture();reserved.families={bamboo:{native:'bamboo'}};assert.throws(()=>compileCatalog(reserved),/Reserved family form/);
 const multiple=fixture();multiple.blocks.stone={textures:'bamboo_stem'};multiple.models.stone={model:'cube'};multiple.families={stone:{shoot:'bamboo_sapling'}};assert.throws(()=>compileCatalog(multiple),/Variant belongs to multiple forms/);
 for(const families of [[],false,'bad']){const input=fixture();input.families=families;assert.throws(()=>compileCatalog(input),/Invalid family rules/);}
 assert.throws(()=>familyRules({}, {bamboo:[]}),/Invalid family forms/);assert.throws(()=>familyRules(null),/Invalid family rule input/);
});
