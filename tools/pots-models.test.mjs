import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpecialModels} from '../models/specials.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function setup(id,slot) {
 const Three=createThreeMock(),descriptor=createSpecialModels(Three).find(m=>m.id===id);
 const roles=id==='decorated_pot'?{side:P+'decorated_pot_side',base:P+'decorated_pot_base'}:{up:P+(id==='conduit'?'conduit_base':id)};
 const E={cur:id,slot,bindings:roles,mats:Object.fromEntries(Object.values(roles).map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {Three,descriptor,E,build:()=>descriptor.build(E)};
}
test('pots and conduit extend the existing special model factory with explicit assignments',()=>{
 const ids=createSpecialModels(createThreeMock()).map(m=>m.id);
 assert.deepEqual(ids,['grass_path','enchanting_table','stonecutter','sea_pickle','flower_pot','decorated_pot','conduit','fire']);
 for(const id of ['flower_pot','decorated_pot','conduit'])assert.equal(SPECIAL_MODELS[id],id);
});
test('empty flower pot keeps four walls and its raised inner base using the original pot sheet',()=>{
 const s=setup('flower_pot');s.build();const meshes=meshesOf(s.E.group);
 assert.equal(meshes.length,22);assert.ok(meshes.every(m=>m.material.path===P+'flower_pot'));
 assert.equal(Math.max(...meshes.map(m=>m.position.y)),(6-8)/16);
 const inner=meshes.find(m=>m.rotation.x===-Math.PI/2&&m.position.y===(4-8)/16);
 assert.ok(inner);assert.deepEqual(inner.geometry.size,[4/16,4/16]);
});
test('decorated pot retains the body, narrow lip and upper neck with separate atlas materials',()=>{
 const s=setup('decorated_pot');s.build();const meshes=meshesOf(s.E.group);
 assert.equal(meshes.length,18);assert.equal(meshes.filter(m=>m.material.path===P+'decorated_pot_side').length,4);
 assert.equal(meshes.filter(m=>m.material.path===P+'decorated_pot_base').length,14);
 assert.equal(Math.max(...meshes.map(m=>m.position.y)),(20-8)/16);
 assert.ok(meshes.every(m=>m.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
 const top=meshes.find(m=>m.rotation.x===-Math.PI/2&&m.position.y===(20-8)/16);
 assert.deepEqual(top.geometry.rows,[[.25,1],[.5,1],[.25,.75],[.5,.75]]);
});
test('conduit preserves the centered six-pixel cube and its six distinct atlas regions',()=>{
 const s=setup('conduit');s.build();const meshes=meshesOf(s.E.group);
 assert.equal(meshes.length,6);assert.ok(meshes.every(m=>m.material.path===P+'conduit_base'));
 assert.ok(meshes.every(m=>m.geometry.size.every(v=>v===6/16)));
 assert.equal(new Set(meshes.map(m=>JSON.stringify(m.geometry.rows))).size,6);
 assert.deepEqual(meshes.map(m=>[m.position.x,m.position.y,m.position.z]),[[0,0,-3/16],[0,0,3/16],[3/16,0,0],[-3/16,0,0],[0,3/16,0],[0,-3/16,0]]);
});
test('decorated pot bindings use owned block materials, not a selected icon or atlas order',()=>{
 const side=P+'decorated_pot_side',base=P+'decorated_pot_base',icon='textures/items/decorated_pot_side';
 const r={id:'decorated_pot',model:'decorated_pot',paths:[side,base,icon],faces:{up:[base,side],north:[side,base]}};
 const before=JSON.stringify(r);assert.deepEqual(utilityBindings(r),{side:[side],base:[base]});assert.equal(JSON.stringify(r),before);
 const missing=structuredClone(r);missing.faces={up:[side]};assert.throws(()=>utilityBindings(missing),/Missing or ambiguous decorated pot base/);
 const foreign=structuredClone(r);foreign.paths=[side,icon];assert.throws(()=>utilityBindings(foreign),/Missing or ambiguous decorated pot base/);
 const ambiguous=structuredClone(r);const duplicate='textures/other/decorated_pot_base';ambiguous.paths.push(duplicate);ambiguous.faces.up.push(duplicate);assert.throws(()=>utilityBindings(ambiguous),/Missing or ambiguous decorated pot base/);
});
test('editing any slot leaves all geometry and materials unchanged; missing materials reject partial scenes',()=>{
 for(const id of ['flower_pot','decorated_pot','conduit']) {
  let expected;
  for(const slot of [P+'flower_pot',P+'decorated_pot_side',P+'decorated_pot_base','textures/items/unrelated']) {
   const s=setup(id,slot);s.build();
   const snapshot=meshesOf(s.E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,path:m.material.path,pos:[m.position.x,m.position.y,m.position.z],rot:[m.rotation.x,m.rotation.y,m.rotation.z]}));
   expected??=snapshot;assert.deepEqual(snapshot,expected);
  }
  const s=setup(id);delete s.E.mats[Object.values(s.E.bindings).at(-1)];assert.throws(s.build,/Missing model material/);
  assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 }
});
