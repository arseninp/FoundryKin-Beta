import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
test('runtime families preserve variant resources and specialized models',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={},terrain={texture_data:{}},existing={};
 for(const n of await readdir(dir)){
  if(!/^(blocks|terrain|existing)-\d+\.json$/.test(n))continue;
  Object.assign(n.startsWith('blocks-')?blocks:n.startsWith('terrain-')?terrain.texture_data:existing,JSON.parse(await readFile(new URL(n,dir),'utf8')));
 }
 const compiled=compileFamilies(blocks,terrain),plan=Object.fromEntries(Object.entries(compiled.families).map(([id,f])=>[id,f.variants.map(v=>({id:v.id,form:v.form}))]));
 const ctx={FKShapes:{build(){}}};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['fk-catalog.js','fk-sculk.js','fk-lights.js','fk-details.js','fk-fixtures.js'])vm.runInContext(await readFile(new URL('../'+name,import.meta.url),'utf8'),ctx);
 const raw=ctx.FKCatalog.build(blocks,terrain),cat=ctx.FKCatalog.bindFamilies(ctx.FKCatalog.index(raw,existing),plan);
 for(const [carpet,base] of [['white_carpet','white_wool'],['moss_carpet','moss_block'],['pale_moss_carpet','pale_moss_block']]){
  assert.equal(cat.familyOf[carpet],base);assert.equal(cat.formEntries[base].carpet,carpet);assert.ok(cat.b[carpet]);assert.ok(!cat.ids.includes(carpet));assert.ok(cat.ids.includes(base));
 }
 const carriedKey=blocks.pale_moss_carpet.carried_textures;
 let carried=terrain.texture_data[carriedKey].textures;
 if(Array.isArray(carried))carried=carried[0];
 if(carried&&typeof carried==='object')carried=carried.path;
 assert.equal(typeof carried,'string');
 assert.ok(existing[carried],'carried texture file must exist');
 assert.equal(cat.cr.pale_moss_carpet,carried,'family binding must preserve the resolved carried texture');
 assert.equal(cat.formEntries.oak_planks.stairs,'oak_stairs');assert.equal(cat.formEntries.white_wool.slab,'white_wool_slab');
 for(const id of ['bell','sunflower','lectern','oak_shelf'])if(blocks[id])assert.ok(cat.b[id],id);
 assert.ok(cat.sp.bell);assert.ok(cat.sp.sunflower);
 for(const id of Object.keys(cat.variantForm))assert.ok(cat.b[id],id);
});
