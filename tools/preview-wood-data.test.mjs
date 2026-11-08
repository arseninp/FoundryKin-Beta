import test from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../preview-wood-data.mjs';
const rows=data.WOOD_REVIEW_BLOCKS;
const COPPER_IDS=`chiseled_copper copper_grate cut_copper cut_copper_slab double_cut_copper_slab cut_copper_stairs
exposed_copper exposed_chiseled_copper exposed_copper_grate exposed_cut_copper exposed_cut_copper_slab exposed_double_cut_copper_slab exposed_cut_copper_stairs
weathered_copper weathered_chiseled_copper weathered_copper_grate weathered_cut_copper weathered_cut_copper_slab weathered_double_cut_copper_slab weathered_cut_copper_stairs
oxidized_copper oxidized_chiseled_copper oxidized_copper_grate oxidized_cut_copper oxidized_cut_copper_slab oxidized_double_cut_copper_slab oxidized_cut_copper_stairs
waxed_copper waxed_chiseled_copper waxed_copper_grate waxed_cut_copper waxed_cut_copper_slab waxed_double_cut_copper_slab waxed_cut_copper_stairs
waxed_exposed_copper waxed_exposed_chiseled_copper waxed_exposed_copper_grate waxed_exposed_cut_copper waxed_exposed_cut_copper_slab waxed_exposed_double_cut_copper_slab waxed_exposed_cut_copper_stairs
waxed_weathered_copper waxed_weathered_chiseled_copper waxed_weathered_copper_grate waxed_weathered_cut_copper waxed_weathered_cut_copper_slab waxed_weathered_double_cut_copper_slab waxed_weathered_cut_copper_stairs
waxed_oxidized_copper waxed_oxidized_chiseled_copper waxed_oxidized_copper_grate waxed_oxidized_cut_copper waxed_oxidized_cut_copper_slab waxed_oxidized_double_cut_copper_slab waxed_oxidized_cut_copper_stairs`.split(/\s+/);
const CUBE_IDS='ancient_debris basalt blue_ice bone_block bookshelf cartography_table crafting_table crying_obsidian deepslate dried_kelp_block fletching_table glowstone hay_block honeycomb_block ice jukebox lodestone loom magma mud noteblock ochre_froglight packed_ice pearlescent_froglight polished_basalt potent_sulfur powder_snow purpur_pillar quartz_pillar reinforced_deepslate sculk sea_lantern smithing_table snow soul_sand soul_soil sponge target tnt verdant_froglight wet_sponge'.split(' ');
test('wood review data exports exactly 50 immutable distinct source records',()=>{
 assert.deepEqual(Object.keys(data),['WOOD_REVIEW_BLOCKS']);assert.equal(rows.length,50);assert.ok(Object.isFrozen(rows));
 assert.equal(new Set(rows.map(([id])=>id)).size,50);
 for(const row of rows){assert.ok(Object.isFrozen(row));assert.equal(row.length,3);assert.match(row[0],/^[a-z0-9_]+$/);assert.ok(typeof row[1]==='string'&&row[1].trim());assert.match(row[2],/[А-Яа-яЁё]/);}
});
test('wood review data matches the reviewed source IDs including stripped prefix order',()=>{
 const expected='acacia_log acacia_wood stripped_acacia_log stripped_acacia_wood birch_log birch_wood stripped_birch_log stripped_birch_wood cherry_log cherry_wood stripped_cherry_log stripped_cherry_wood dark_oak_log dark_oak_wood stripped_dark_oak_log stripped_dark_oak_wood jungle_log jungle_wood stripped_jungle_log stripped_jungle_wood mangrove_log mangrove_wood stripped_mangrove_log stripped_mangrove_wood oak_log oak_wood stripped_oak_log stripped_oak_wood pale_oak_log pale_oak_wood stripped_pale_oak_log stripped_pale_oak_wood poplar_log poplar_wood stripped_poplar_log stripped_poplar_wood spruce_log spruce_wood stripped_spruce_log stripped_spruce_wood crimson_stem crimson_hyphae stripped_crimson_stem stripped_crimson_hyphae warped_stem warped_hyphae stripped_warped_stem stripped_warped_hyphae bamboo_block stripped_bamboo_block'.split(' ');
 assert.equal(expected.length,50);assert.deepEqual(rows.map(([id])=>id),expected);
});
test('wood review labels preserve grammatical forms and special object names',()=>{
 const labels=Object.fromEntries(rows.map(([id,en,ru])=>[id,{en,ru}]));
 assert.equal(labels.oak_log.ru,'Бревно дуба');assert.equal(labels.stripped_dark_oak_wood.ru,'Обтёсанная древесина тёмного дуба');
 assert.equal(labels.stripped_oak_log.en,'Stripped oak log');assert.equal(labels.crimson_stem.ru,'Багровый стебель');
 assert.equal(labels.warped_hyphae.en,'Warped hyphae');assert.equal(labels.stripped_bamboo_block.ru,'Блок обтёсанного бамбука');
 for(const id of ['oak_stripped_log','crimson_log','warped_log','bamboo_log'])assert.ok(!Object.hasOwn(labels,id));
});
test('wood review records cannot be mutated through exported arrays',()=>{
 const before=JSON.stringify(rows);
 assert.throws(()=>rows.push(['other','Other','Другое']),TypeError);
 assert.throws(()=>{rows[0][0]='other';},TypeError);
 assert.equal(JSON.stringify(rows),before);
});
test('review entry point preserves ordered previous IDs and appends copper then 41 cubes exactly once',async()=>{
 const [{REVIEW_IDS},base,{STONE_REVIEW_BLOCKS},{LEAF_REVIEW_BLOCKS}]=await Promise.all([import('../preview.mjs'),import('../preview-config.mjs'),import('../preview-stone-data.mjs'),import('../preview-leaf-data.mjs')]);
 const previous=[...base.REVIEW_IDS,...STONE_REVIEW_BLOCKS.map(([id])=>id),...rows.map(([id])=>id),...LEAF_REVIEW_BLOCKS.map(([id])=>id)];
 assert.equal(previous.length,939);assert.equal(COPPER_IDS.length,55);assert.equal(new Set(COPPER_IDS).size,55);
 assert.deepEqual(REVIEW_IDS.slice(0,939),previous);assert.deepEqual(REVIEW_IDS.slice(939,994),COPPER_IDS);
 assert.equal(CUBE_IDS.length,41);assert.deepEqual(REVIEW_IDS.slice(994),CUBE_IDS);
 assert.equal(REVIEW_IDS.length,1035);assert.equal(new Set(REVIEW_IDS).size,1035);assert.ok(Object.isFrozen(REVIEW_IDS));
 assert.equal(REVIEW_IDS.filter(id=>id==='copper_block').length,1);assert.ok(!COPPER_IDS.some(id=>id.endsWith('copper_bulb')));
});
test('copper extension has pinned single-path resources, explicit assignments and ordinary waxed counterparts',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {planModelAssignments}=await import('../catalog/model-policy.mjs'),{duplicateRules}=await import('../catalog/rules/duplicates.mjs');
 const {createPrimitiveModels}=await import('../models/primitives.mjs'),{createThreeMock,meshesOf}=await import('./three-mock.mjs');
 const {REVIEW_IDS}=await import('../preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input);
 const blocks=Object.fromEntries(['copper_block',...COPPER_IDS].map(id=>{assert.ok(Object.hasOwn(input.blocks,id),id);return [id,input.blocks[id]];}));
 const plan=planModelAssignments(blocks),aliases=duplicateRules(blocks),Three=createThreeMock(),builders=new Map(createPrimitiveModels(Three).map(row=>[row.id,row]));
 assert.deepEqual(plan.unresolved,[]);
 for(const id of COPPER_IDS){
  const model=id.endsWith('_stairs')?'stairs':id.endsWith('_slab')&&!id.includes('double_')?'slab':'cube';
  assert.equal(plan.assignments[id].model,model,id);assert.ok(builders.has(model),id);
  const key=blocks[id].textures;assert.equal(typeof key,'string',id);
  const path=input.terrain[key]?.textures;assert.equal(typeof path,'string',id);assert.ok(Object.hasOwn(input.existing,path),path);
  const faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,path])),group=new Three.Group(),material={};
  builders.get(model).build({cur:id,faceMap,mats:{[path]:material},group});
  const meshes=meshesOf(group);assert.equal(meshes.length,model==='stairs'?2:1,id);
  assert.ok(meshes.every(mesh=>mesh.material.every(value=>value===material)),id);
  const empty=new Three.Group();assert.throws(()=>builders.get(model).build({cur:id,faceMap,mats:{},group:empty}),/Missing primitive material/);assert.equal(empty.children.length,0,id);
  if(id.startsWith('waxed_')){const raw=id.slice(6),target=raw==='copper'?'copper_block':raw;assert.equal(aliases[id].target,target,id);assert.ok(REVIEW_IDS.includes(target),target);assert.deepEqual(blocks[id].textures,blocks[target].textures,id);}
 }
 assert.equal(JSON.stringify(input),before);
});
test('41 cube sources normalize real pinned faces without ambiguous variants and build with existing geometry',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {planModelAssignments}=await import('../catalog/model-policy.mjs'),{normalizeBlock}=await import('../catalog/resources.mjs');
 const {createPrimitiveModels}=await import('../models/primitives.mjs'),{createThreeMock,meshesOf}=await import('./three-mock.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input);
 const blocks=Object.fromEntries(CUBE_IDS.map(id=>{assert.ok(Object.hasOwn(input.blocks,id),id);return [id,input.blocks[id]];})),plan=planModelAssignments(blocks);
 assert.deepEqual(plan.unresolved,[]);
 const Three=createThreeMock(),builder=createPrimitiveModels(Three).find(row=>row.id==='cube');
 for(const id of CUBE_IDS){
  assert.equal(plan.assignments[id].model,'cube',id);
  const record=normalizeBlock(id,blocks[id],input.terrain,{model:'cube',existing:input.existing});
  const faceMap={};for(const face of ['up','down','north','south','east','west']){assert.equal(record.faces[face].length,1,id+': '+face);faceMap[face]=record.faces[face][0];}
  for(const path of record.paths)assert.ok(Object.hasOwn(input.existing,path),path);
  const mats=Object.fromEntries(record.paths.map(path=>[path,{path}])),group=new Three.Group();builder.build({cur:id,faceMap,mats,group});
  const meshes=meshesOf(group);assert.equal(meshes.length,1,id);assert.deepEqual(meshes[0].geometry.size,[1,1,1],id);
  assert.deepEqual(meshes[0].material.map(material=>material.path),['east','west','up','down','south','north'].map(face=>faceMap[face]),id);
 }
 assert.equal(JSON.stringify(input),before);
});
