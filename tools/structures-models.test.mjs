import test from 'node:test';
import assert from 'node:assert/strict';
import {createStructureModels} from '../models/structures.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/';
function composterRecord() {
 const top=[P+'composter_top',P+'compost',P+'compost_ready'];
 return {id:'composter',model:'composter',variants:{up:top},faces:{up:top,down:[P+'composter_bottom'],north:[P+'composter_side']},paths:[...top,P+'composter_bottom',P+'composter_side']};
}
function setup(id,state={},slot) {
 const Three=createThreeMock(),bindings=id==='composter'?Object.fromEntries(Object.entries(utilityBindings(composterRecord())).map(([role,paths])=>[role,paths[0]])):{up:P+'scaffolding_top',down:P+'scaffolding_bottom',north:P+'scaffolding_side'};
 const mats=Object.fromEntries([...new Set(Object.values(bindings))].map(path=>[path,{path}])),E={cur:id,state,slot:slot??Object.values(bindings)[0],bindings,mats,hiddenMat:{},group:new Three.Group()};
 const model=createStructureModels(Three).find(row=>row.id===id);return {Three,E,model,build:()=>model.build(E)};
}
const snapshot=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,position:[m.position.x,m.position.y,m.position.z],rotation:[m.rotation.x,m.rotation.y,m.rotation.z],path:m.material.path}));
test('composter resources retain rim, compost, ready, bottom and sides as separate owned bindings',()=>{
 const record=composterRecord(),before=JSON.stringify(record),parts=utilityBindings(record);
 assert.deepEqual(parts,{rim:[P+'composter_top'],compost:[P+'compost'],ready:[P+'compost_ready'],bottom:[P+'composter_bottom'],side:[P+'composter_side']});assert.equal(JSON.stringify(record),before);
 for(const change of [r=>r.variants.up.pop(),r=>{r.variants.up[2]=P+'foreign';},r=>{r.id='future_composter';}]){const bad=structuredClone(record);change(bad);assert.throws(()=>utilityBindings(bad),/Incomplete composter|Missing or ambiguous composter|Unknown composter/);}
});
test('empty composter has an internal floor, four two-pixel walls and no full top lid',()=>{
 const s=setup('composter');s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,18);
 assert.deepEqual(meshes[0].geometry.size,[1,1]);assert.equal(meshes[0].position.y,-6/16);assert.equal(meshes[1].position.y,-.5);
 const rims=meshes.filter(m=>m.material.path===P+'composter_top');assert.equal(rims.length,4);assert.ok(rims.every(m=>m.position.y===.5));assert.deepEqual(rims.map(m=>m.geometry.size),[[2/16,1],[2/16,1],[12/16,2/16],[12/16,2/16]]);
});
test('composter levels one through seven raise compost and level eight selects ready without moving the body',()=>{
 const base=setup('composter');base.build();const empty=snapshot(base.E);
 for(let level=1;level<=8;level++) {
  const s=setup('composter',{level});s.build();const meshes=meshesOf(s.E.group),surface=meshes.at(-1);
  assert.equal(meshes.length,19);assert.deepEqual(snapshot(s.E).slice(0,18),empty);
  assert.deepEqual(surface.geometry.size,[12/16,12/16]);assert.equal(surface.position.y,(Math.min(1+2*level,15)-8)/16);
  assert.equal(surface.material.path,P+(level===8?'compost_ready':'compost'));assert.deepEqual(surface.geometry.rows,[[2/16,14/16],[14/16,14/16],[2/16,2/16],[14/16,2/16]]);
 }
});
test('scaffolding uses four posts, open frame and two-sided top surfaces; bottom state adds only its platform and frame',()=>{
 const a=setup('scaffolding'),b=setup('scaffolding',{bottom:true});a.build();b.build();const ma=meshesOf(a.E.group),mb=meshesOf(b.E.group);
 assert.equal(ma.length,34);assert.equal(mb.length,48);assert.deepEqual(snapshot(b.E).slice(0,34),snapshot(a.E));
 assert.equal(ma[0].position.y,.5);assert.equal(ma[1].position.y,(15.99-8)/16);assert.deepEqual(ma[1].geometry.rows,[[0,0],[1,0],[0,1],[1,1]]);
 assert.equal(mb[34].position.y,-6/16);assert.equal(mb[35].position.y,(1.99-8)/16);
 assert.equal(ma.filter(m=>m.material.path===P+'scaffolding_bottom').length,8);
 assert.ok(ma.slice(2).every(m=>m.geometry.size[0]!==1||m.geometry.size[1]!==1));
});
test('all edit slots leave geometry, selected state, material references and PNG policy unchanged',()=>{
 for(const [id,state] of [['composter',{level:8}],['scaffolding',{bottom:true}]]) {
  const sample=setup(id,state);let expected;
  for(const slot of Object.keys(sample.E.mats)) {
   const s=setup(id,{...state},slot),before=JSON.stringify({mats:s.E.mats,state:s.E.state,bindings:s.E.bindings});s.build();expected??=snapshot(s.E);assert.deepEqual(snapshot(s.E),expected);assert.equal(JSON.stringify({mats:s.E.mats,state:s.E.state,bindings:s.E.bindings}),before);
   assert.ok(meshesOf(s.E.group).every(m=>m.material===s.E.mats[m.material.path]));
  }
 }
});
test('invalid states and missing roles reject before geometry allocation',()=>{
 for(const level of [-1,9,1.5,'1',null]){const s=setup('composter',{level});assert.throws(s.build,/Invalid composter level/);assert.equal(s.Three.created.length,0);}
 for(const bottom of [0,1,'true',null]){const s=setup('scaffolding',{bottom});assert.throws(s.build,/Invalid scaffolding bottom state/);assert.equal(s.Three.created.length,0);}
 for(const id of ['composter','scaffolding']){const s=setup(id);delete s.E.bindings[Object.keys(s.E.bindings)[0]];assert.throws(s.build,/Missing .* binding/);assert.equal(s.Three.created.length,0);}
 assert.throws(()=>createStructureModels({}),/Structure models require Three/);
});
test('missing selected materials and allocation failures dispose geometry without changing the existing scene',()=>{
 for(const id of ['composter','scaffolding']) {
  const missing=setup(id),existing={position:{y:9}};missing.E.group.add(existing);delete missing.E.mats[Object.values(missing.E.bindings)[0]];
  assert.throws(missing.build,/Missing model material/);assert.deepEqual(missing.E.group.children,[existing]);assert.ok(missing.Three.created.every(g=>g.disposed));
  const s=setup(id),Base=s.Three.PlaneGeometry,before=JSON.stringify(s.E.mats);s.E.group.add(existing);
  s.Three.PlaneGeometry=class extends Base{constructor(...args){if(s.Three.created.length===7)throw new Error('allocation');super(...args);}};
  assert.throws(s.build,/allocation/);assert.deepEqual(s.E.group.children,[existing]);assert.ok(s.Three.created.every(g=>g.disposed));assert.equal(JSON.stringify(s.E.mats),before);
 }
});
