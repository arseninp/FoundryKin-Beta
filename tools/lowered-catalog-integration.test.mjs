import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
const P='textures/blocks/',read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const blocks={...read('blocks-001.json'),...read('blocks-002.json'),...read('blocks-004.json')},terrain={...read('terrain-001.json'),...read('terrain-004.json')};
function record(id){const plan=planModelAssignments({[id]:blocks[id]});assert.deepEqual(plan.unresolved,[]);return normalizeBlock(id,blocks[id],terrain,plan.assignments[id]);}
test('pinned farmland keeps indexed tops and declares four unambiguous owned roles',()=>{
 const before=JSON.stringify(blocks.farmland),r=record('farmland');assert.equal(r.model,'farmland');
 assert.deepEqual(r.bindings,{wet:[P+'farmland_wet'],dry:[P+'farmland_dry'],bottom:[P+'dirt'],side:[P+'dirt']});
 assert.deepEqual(r.variants.up,[P+'farmland_wet',P+'farmland_dry']);assert.deepEqual(r.paths,[P+'dirt',P+'farmland_dry',P+'farmland_wet']);
 assert.equal(JSON.stringify(blocks.farmland),before);
});
test('pinned snow layer keeps its single source texture and standard face bindings',()=>{
 const r=record('snow_layer');assert.equal(r.model,'snow_layer');assert.deepEqual(r.paths,[P+'snow']);
 for(const paths of Object.values(r.faces))assert.deepEqual(paths,[P+'snow']);
 assert.equal(planModelAssignments({snow:{}}).assignments.snow.model,'cube');
});
test('malformed or foreign farmland roles reject and future names are not guessed',()=>{
 for(const mutate of [r=>{r.variants.up.pop();},r=>{r.variants.up[0]=P+'foreign';},r=>{r.faces.north.push(P+'farmland_wet');},r=>{r.id='future_farmland';}]) {
  const r=structuredClone(record('farmland'));mutate(r);assert.throws(()=>utilityBindings(r),/Incomplete farmland|Missing or ambiguous farmland|Unknown farmland/);
 }
 assert.deepEqual(planModelAssignments({future_farmland:{},future_snow_layer:{}}).unresolved,['future_farmland','future_snow_layer']);
});
test('pinned grass path binds ordinary dirt while retaining both indexed bottom resources',()=>{
 const before=JSON.stringify({block:blocks.grass_path,dirt:terrain.dirt}),r=record('grass_path');
 assert.equal(r.model,'grass_path');
 assert.deepEqual(r.variants.down,[P+'dirt',P+'coarse_dirt']);assert.deepEqual(r.faces.down,r.variants.down);
 assert.ok(r.paths.includes(P+'dirt'));assert.ok(r.paths.includes(P+'coarse_dirt'));
 assert.deepEqual(r.bindings,{up:[P+'grass_path_top'],down:[P+'dirt'],north:[P+'grass_path_side'],south:[P+'grass_path_side'],east:[P+'grass_path_side'],west:[P+'grass_path_side']});
 const saved=JSON.stringify(r);assert.deepEqual(utilityBindings(r),r.bindings);assert.equal(JSON.stringify(r),saved);
 assert.equal(JSON.stringify({block:blocks.grass_path,dirt:terrain.dirt}),before);
});
test('grass path bottom selection is named rather than first-index fallback',()=>{
 const atlas={...terrain,dirt:{...terrain.dirt,textures:[...terrain.dirt.textures].reverse()}};
 const r=normalizeBlock('grass_path',blocks.grass_path,atlas,{model:'grass_path'});
 assert.deepEqual(r.variants.down,[P+'coarse_dirt',P+'dirt']);assert.deepEqual(r.bindings,record('grass_path').bindings);
 assert.deepEqual(terrain.dirt.textures,[P+'dirt',P+'coarse_dirt']);
});
test('grass path rejects missing or ambiguous resources without affecting other models',()=>{
 for(const mutate of [r=>{r.faces.down=[P+'coarse_dirt'];},r=>{r.paths=r.paths.filter(path=>path!==P+'dirt');},r=>{r.faces.up.push(P+'dirt');},r=>{r.id='future_grass_path';},r=>{r.paths.push(P+'other/dirt');r.faces.down.push(P+'other/dirt');}]) {
  const r=structuredClone(record('grass_path'));mutate(r);assert.throws(()=>utilityBindings(r),/Missing or ambiguous|Unknown grass path/);
 }
 const r=record('grass_path');assert.equal(utilityBindings({...r,model:'cube'}),null);
});
