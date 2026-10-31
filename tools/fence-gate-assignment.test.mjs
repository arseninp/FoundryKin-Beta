import test from 'node:test';
import assert from 'node:assert/strict';
import {planModelAssignments} from '../catalog/model-policy.mjs';
test('canonical fence_gate explicitly reuses gate without mutating its block definition',()=>{
 const blocks={fence_gate:{sound:'wood',textures:'wood_oak'}},before=JSON.stringify(blocks);
 const plan=planModelAssignments(blocks);
 assert.equal(plan.assignments.fence_gate.model,'gate');assert.deepEqual(plan.unresolved,[]);
 assert.deepEqual(plan.decisions,[{id:'fence_gate',model:'gate',reason:'special-model'}]);
 assert.equal(JSON.stringify(blocks),before);
});
test('existing wood gates and the dedicated bamboo gate retain their assignments',()=>{
 const ids=["acacia_fence_gate","birch_fence_gate","cherry_fence_gate","crimson_fence_gate","dark_oak_fence_gate","jungle_fence_gate","mangrove_fence_gate","pale_oak_fence_gate","poplar_fence_gate","spruce_fence_gate","warped_fence_gate"];
 const blocks=Object.fromEntries([...ids,'bamboo_fence_gate'].map(id=>[id,{}]));
 const plan=planModelAssignments(blocks);assert.deepEqual(plan.unresolved,[]);
 for(const id of ids)assert.equal(plan.assignments[id].model,'gate',id);
 assert.equal(plan.assignments.bamboo_fence_gate.model,'bamboo_gate');
});
test('unrelated gate-like names are not admitted from their texture or partial name',()=>{
 const ids=['fence_gate_variant','future_gate_device'];
 const plan=planModelAssignments(Object.fromEntries(ids.map(id=>[id,{textures:'wood_oak'}])));
 assert.deepEqual(plan.unresolved,[...ids].sort());assert.deepEqual(Object.keys(plan.assignments),[]);
});
