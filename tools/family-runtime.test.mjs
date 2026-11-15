import test from 'node:test';
import assert from 'node:assert/strict';
import {resourcePaths} from '../catalog/resources.mjs';
import {createCompiledModelFixture} from './compiled-model-fixture.mjs';
test('runtime families preserve variant resources and specialized models',()=>{
 const r=createCompiledModelFixture(),{catalog,access,input}=r;
 for(const [carpet,base] of [['white_carpet','white_wool'],['moss_carpet','moss_block'],['pale_moss_carpet','pale_moss_block']]){
  const object=access.describe(carpet);assert.ok(object,carpet);assert.equal(object.card,base);assert.equal(object.form,'carpet');
  assert.equal(catalog.families[base].carpet,object.id);assert.ok(catalog.records[object.id]);assert.ok(!catalog.cards.includes(carpet));assert.ok(catalog.cards.includes(base));
 }
 const atlas=input.terrain.texture_data??input.terrain,key=input.blocks.pale_moss_carpet.carried_textures;
 assert.equal(typeof key,'string');const carried=resourcePaths(atlas[key].textures),record=catalog.records[access.describe('pale_moss_carpet').id];
 for(const path of carried){assert.ok(Object.hasOwn(input.existing,path));assert.ok(record.paths.includes(path));assert.ok(Object.values(record.carried).flat().includes(path));}
 assert.equal(catalog.families.oak_planks.stairs,'oak_stairs');assert.equal(catalog.families.white_wool.slab,'white_wool_slab');
 for(const id of ['bell','sunflower','lectern','oak_shelf']){assert.ok(Object.hasOwn(input.blocks,id));const object=access.describe(id);assert.ok(object);const built=r.render({id});assert.ok(built.meshes.length>0,id);assert.equal(built.plan.object.id,object.id);}
 assert.equal(catalog.records.bell.model,'bell');assert.equal(catalog.records.sunflower.model,'sunflower');
 for(const [base,forms] of Object.entries(catalog.families))for(const [form,id] of Object.entries(forms)){assert.ok(catalog.records[id],base+':'+form);const object=access.describe(base,'block',form);assert.ok(object);assert.equal(object.card,base);assert.equal(object.form,form);}
});
