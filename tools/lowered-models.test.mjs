import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpecialModels} from '../models/specials.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const FACES=['up','down','north','south','east','west'];
function setup(id,state={},slot) {
 const Three=createThreeMock(),f=id==='farmland'?{wet:'textures/blocks/farmland_wet',dry:'textures/blocks/farmland_dry',bottom:'textures/blocks/dirt',side:'textures/blocks/dirt'}:Object.fromEntries(FACES.map(face=>[face,'textures/blocks/fixture_'+id]));
 const mats=Object.fromEntries([...new Set(Object.values(f))].map(path=>[path,{path}])),E={cur:id,slot:slot??Object.values(f)[0],state,bindings:f,mats,hiddenMat:{},group:new Three.Group()};
 const model=createSpecialModels(Three).find(row=>row.id===id);return {Three,E,f,model,build:()=>model.build(E)};
}
const snap=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,pos:[m.position.x,m.position.y,m.position.z],rot:[m.rotation.x,m.rotation.y,m.rotation.z],path:m.material.path}));
test('farmland is 15 pixels high, crops sides and chooses wet or dry only from preview state',()=>{
 for(const state of [{},{wet:true},{wet:false}]) {
  const s=setup('farmland',state);s.build();const m=meshesOf(s.E.group);assert.equal(m.length,6);
  assert.equal(m[0].position.y,7/16);assert.equal(m[1].position.y,-.5);assert.equal(m[0].material.path,state.wet===false?s.f.dry:s.f.wet);
  assert.equal(m[1].material.path,s.f.bottom);
  for(const mesh of m.slice(2)){assert.deepEqual(mesh.geometry.size,[1,15/16]);assert.equal(mesh.material.path,s.f.side);assert.deepEqual(mesh.geometry.rows,[[0,15/16],[1,15/16],[0,0],[1,0]]);}
 }
});
test('snow builds exactly one selected height from one to eight layers without stretching its sides',()=>{
 for(let layers=1;layers<=8;layers++) {
  const s=setup('snow_layer',{layers});s.build();const m=meshesOf(s.E.group);assert.equal(m.length,6);
  assert.equal(m[0].position.y,(layers*2-8)/16);assert.equal(m[1].position.y,-.5);
  assert.deepEqual(m[0].geometry.rows,[[0,1],[1,1],[0,0],[1,0]]);
  for(const mesh of m.slice(2)){assert.deepEqual(mesh.geometry.size,[1,layers/8]);assert.deepEqual(mesh.geometry.rows,[[0,layers/8],[1,layers/8],[0,0],[1,0]]);}
 }
 const s=setup('snow_layer');s.build();assert.equal(meshesOf(s.E.group)[0].position.y,-6/16);
});
test('editing another farmland PNG never changes state, geometry, bindings or materials',()=>{
 let expected;const sample=setup('farmland');
 for(const slot of Object.keys(sample.E.mats)) {
  const s=setup('farmland',{wet:false},slot),before=JSON.stringify({f:s.f,state:s.E.state,mats:s.E.mats});s.build();
  expected??=snap(s.E);assert.deepEqual(snap(s.E),expected);assert.equal(JSON.stringify({f:s.f,state:s.E.state,mats:s.E.mats}),before);
 }
});
test('malformed wet states and layer counts fail before allocating geometry',()=>{
 for(const wet of [null,0,1,'wet']){const s=setup('farmland',{wet});assert.throws(s.build,/Invalid farmland wet state/);assert.equal(s.Three.created.length,0);}
 for(const layers of [null,0,9,1.5,'2']){const s=setup('snow_layer',{layers});assert.throws(s.build,/Invalid snow layer count/);assert.equal(s.Three.created.length,0);}
});
test('missing materials and allocation failure leave no partial lowered model',()=>{
 const s=setup('farmland');delete s.E.mats[s.f.bottom];assert.throws(s.build,/Missing model material/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 const t=setup('snow_layer'),Base=t.Three.PlaneGeometry;t.Three.PlaneGeometry=class extends Base{constructor(...args){if(t.Three.created.length===2)throw new Error('allocation');super(...args);}};
 assert.throws(t.build,/allocation/);assert.equal(t.E.group.children.length,0);assert.ok(t.Three.created.every(g=>g.disposed));
});
test('existing dirt path and enchanting table retain their lowered dimensions',()=>{
 for(const [id,height] of [['grass_path',15],['enchanting_table',12]]){const s=setup(id);s.build();const m=meshesOf(s.E.group);assert.equal(m.length,6);assert.equal(m[0].position.y,(height-8)/16);for(const mesh of m.slice(2))assert.deepEqual(mesh.geometry.size,[1,height/16]);}
});
