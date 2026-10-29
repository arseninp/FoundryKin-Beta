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
