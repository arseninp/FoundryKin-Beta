import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
test('known primitive forms have deterministic assignments without a generic fallback',()=>{
 const result=planModelAssignments({oak_planks:{},oak_stairs:{},oak_fence_gate:{},stone_pressure_plate:{},mystery:{}});
 assert.equal(result.assignments.oak_planks.model,'cube');assert.equal(result.assignments.oak_stairs.model,'stairs');assert.equal(result.assignments.oak_fence_gate.model,'gate');assert.equal(result.assignments.stone_pressure_plate.model,'plate');
 assert.deepEqual(result.unresolved,['mystery']);
});
test('special models take priority over primitive suffixes',()=>{
 const result=planModelAssignments({bamboo_fence:{},bamboo_fence_gate:{},pale_moss_carpet:{},sea_lantern:{},redstone_torch:{}});
 for(const [id,model]of Object.entries({bamboo_fence:'bamboo_fence',bamboo_fence_gate:'bamboo_gate',pale_moss_carpet:'pale_moss_carpet',sea_lantern:'cube',redstone_torch:'redstone_torch'}))assert.equal(result.assignments[id].model,model);
});
test('double slabs are full blocks, and state pairs share the same assigned model',()=>{
 const result=planModelAssignments({oak_double_slab:{},waxed_double_cut_copper_slab:{},furnace:{},lit_furnace:{},infested_stone:{}});
 assert.ok(Object.values(result.assignments).every(a=>a.model==='cube'));assert.deepEqual(result.unresolved,[]);
});
test('unsupported builders are assigned by identity rather than being silently replaced',()=>{
 const result=planModelAssignments({azalea:{},bamboo:{},amethyst_cluster:{},wooden_door:{},white_bed:{}});
 assert.deepEqual(Object.values(result.assignments).map(a=>a.model),['amethyst','azalea','bamboo','bed','door']);
});
test('explicit overrides are validated, cloned, and preserve original input',()=>{
 const blocks={custom:{}},overrides={custom:{model:'cross',states:{stage:1}}},before=JSON.stringify({blocks,overrides});
 const plan=planModelAssignments(blocks,overrides);plan.assignments.custom.states.stage=3;assert.equal(JSON.stringify({blocks,overrides}),before);
 assert.throws(()=>planModelAssignments(blocks,{absent:{model:'cube'}}),/Unknown model override/);
 for(const value of [null,{}, {model:12}])assert.throws(()=>planModelAssignments(blocks,{custom:value}),/Invalid model override/);
});
const objects=ids=>Object.fromEntries(ids.map(id=>[id,{}]));
test('all colours of glass and powder are cubes while glass panes keep their shape',()=>{
 const colors=['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'];
 const ids=colors.flatMap(c=>[c+'_stained_glass',c+'_stained_glass_pane',c+'_concrete_powder']);
 const plan=planModelAssignments(objects(ids));assert.deepEqual(plan.unresolved,[]);
 for(const id of ids)assert.equal(plan.assignments[id].model,id.endsWith('_pane')?'pane':'cube',id);
});
test('solid copper classes remain cubes while bars keep a dedicated model and chests or statues remain unresolved',()=>{
 const ids=[];
 for(const prefix of ['','exposed_','weathered_','oxidized_'])for(const material of ['copper','cut_copper','chiseled_copper','copper_grate','copper_bulb']){
  const id=prefix+material;ids.push(id,'waxed_'+id);
 }
 ids.push('copper_block');const plan=planModelAssignments(objects(ids));assert.deepEqual(plan.unresolved,[]);
 assert.ok(Object.values(plan.assignments).every(a=>a.model==='cube'));
 const special=['copper_bars','copper_chest','copper_golem_statue','oxidized_copper_bars','waxed_weathered_copper_chest'];
 const separate=planModelAssignments(objects(special));
 assert.deepEqual(separate.unresolved,['copper_chest','copper_golem_statue','waxed_weathered_copper_chest']);
 assert.equal(separate.assignments.copper_bars.model,'bars');assert.equal(separate.assignments.oxidized_copper_bars.model,'bars');
});
test('leaf, nether wood and solid coral classes do not absorb plant stems or coral fans',()=>{
 const ids=['oak_leaves','azalea_leaves','azalea_leaves_flowered','orange_poplar_leaves'];
 for(const wood of ['crimson','warped'])for(const part of ['stem','hyphae'])ids.push(wood+'_'+part,'stripped_'+wood+'_'+part);
 for(const coral of ['tube','brain','bubble','fire','horn'])ids.push(coral+'_coral_block','dead_'+coral+'_coral_block');
 const plan=planModelAssignments(objects(ids));assert.deepEqual(plan.unresolved,[]);assert.ok(Object.values(plan.assignments).every(a=>a.model==='cube'));
 const special=['pumpkin_stem','melon_stem','chorus_plant'];
 for(const id of ['brain_coral_fan','dead_brain_coral_wall_fan'])assert.equal(planModelAssignments(objects([id])).assignments[id].model,'cross');
 assert.deepEqual(planModelAssignments(objects(special)).unresolved,[...special].sort());
});
test('explicit solid materials are admitted without a blanket block or PNG rule',()=>{
 const ids=['granite','andesite','deepslate','chiseled_stone_bricks','raw_iron_block','crafting_table','moss_block','quartz_pillar','sculk','sponge','wet_sponge','grass_block'];
 const plan=planModelAssignments(objects(ids));assert.deepEqual(plan.unresolved,[]);assert.ok(Object.values(plan.assignments).every(a=>a.model==='cube'));
 const special=['future_cactus','chest','mystery_block','unknown_device'];
 const blocks=Object.fromEntries(special.map(id=>[id,{textures:'stone'}]));assert.deepEqual(planModelAssignments(blocks).unresolved,[...special].sort());
 assert.deepEqual(planModelAssignments(blocks).assignments,Object.create(null));
});
