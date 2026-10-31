import test from 'node:test';
import assert from 'node:assert/strict';
import {createStemModels} from '../models/stems.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const TURN={west:0,north:-Math.PI/2,east:Math.PI,south:Math.PI/2};
function setup(state={},slot='free') {
 const Three=createThreeMock(),E={state,slot,bindings:{stem:'free',upperstem:'connected'},mats:{free:{path:'free',side:0,opacity:.8},connected:{path:'connected',side:0,opacity:.6}},hiddenMat:{},group:new Three.Group()},model=createStemModels(Three)[0];
 return {Three,E,model,build:()=>model.build(E)};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
const snapshot=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,p:[m.position.x,m.position.y,m.position.z],ry:m.rotation.y,path:m.material.path}));
test('eight stages preserve the reference origin, rescaled crossing planes and mirrored face UVs',()=>{
 for(let stage=0;stage<8;stage++) {
  const s=setup({stage}),h=2*(stage+1);s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,4);
  for(const [i,m] of meshes.entries()) {
   assert.deepEqual(m.geometry.size,[Math.SQRT2,h/16]);assert.equal(m.position.y,(h/2-9)/16);near(m.position.y-h/32,-9/16);
   assert.deepEqual(m.geometry.rows,i%2?[[1,1],[0,1],[1,1-h/16],[0,1-h/16]]:[[0,1],[1,1],[0,1-h/16],[1,1-h/16]]);
  }
  assert.deepEqual(meshes.map(m=>m.rotation.y),[5*Math.PI/4,Math.PI/4,-Math.PI/4,3*Math.PI/4]);
 }
 const s=setup();assert.equal(s.model.id,'stem');assert.equal(s.model.scale,1);assert.equal(s.model.mode,'volume');assert.throws(()=>createStemModels({}),/require Three/);
});
test('attached stems keep a fixed base and source connector UVs in all four cardinal directions',()=>{
 for(const [facing,angle] of Object.entries(TURN))for(let stage=0;stage<8;stage++) {
  const s=setup({stage,attached:true,facing});s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,6);assert.equal(s.E.group.children[0].rotation.y,angle);
  assert.ok(meshes.slice(0,4).every(m=>m.geometry.size[1]===.5&&m.position.y===-5/16&&m.material===s.E.mats.free));
  const a=meshes[4],b=meshes[5];assert.deepEqual(b.geometry.size,[9/16,1]);assert.equal(b.position.x,-7/32);assert.equal(b.position.y,0);assert.equal(b.material,s.E.mats.connected);
  assert.deepEqual(a.geometry.rows,[[9/16,1],[0,1],[9/16,0],[0,0]]);assert.deepEqual(b.geometry.rows,[[0,1],[9/16,1],[0,0],[9/16,0]]);
  const axis=['west','east'].includes(facing)?0:1,sign=['west','north'].includes(facing)?-1:1;
  const values=[-.5,1/16].map(x=>[x*Math.cos(angle),-x*Math.sin(angle)][axis]*sign);near(Math.max(...values),.5);near(Math.min(...values),-1/16);
 }
});
test('edit slots leave geometry, state and source material policy unchanged',()=>{
 for(const state of [{stage:0},{stage:7},{stage:7,attached:true,facing:'north'}]) {
  let expected;
  for(const slot of ['free','connected','unrelated_icon']) {
   const s=setup({...state},slot),before=JSON.stringify({state:s.E.state,bindings:s.E.bindings,mats:s.E.mats});s.build();expected??=snapshot(s.E);assert.deepEqual(snapshot(s.E),expected);assert.equal(JSON.stringify({state:s.E.state,bindings:s.E.bindings,mats:s.E.mats}),before);
   const meshes=meshesOf(s.E.group);for(let i=0;i<meshes.length;i+=2){near(Math.cos(meshes[i].rotation.y-meshes[i+1].rotation.y),-1);assert.equal(meshes[i].material,meshes[i+1].material);}
  }
 }
});
test('invalid states and missing selected roles reject before allocating geometry',()=>{
 for(const [key,values,pattern] of [['stage',[-1,8,.5,'1',null],/Invalid stem stage/],['attached',[0,1,'true',null],/Invalid stem attached state/],['facing',['up','bad',null,1],/Invalid stem facing/]])for(const value of values){const s=setup({[key]:value});assert.throws(s.build,pattern);assert.equal(s.Three.created.length,0);}
 for(const role of ['stem','upperstem']){const s=setup({attached:true});delete s.E.bindings[role];assert.throws(s.build,/Missing stem binding/);assert.equal(s.Three.created.length,0);}
 const s=setup();delete s.E.bindings.upperstem;s.build();assert.equal(meshesOf(s.E.group).length,4);
});
test('missing materials and geometry or mesh allocation failures preserve the scene and free prepared geometry',()=>{
 for(const hidden of [false,true]) {
  const s=setup({attached:true}),existing={};s.E.group.add(existing);if(hidden)s.E.mats.connected=s.E.hiddenMat;else delete s.E.mats.connected;
  assert.throws(s.build,/Missing model material: connected/);assert.deepEqual(s.E.group.children,[existing]);assert.ok(s.Three.created.every(g=>g.disposed));
 }
 for(const attached of [false,true])for(const failMesh of [false,true]) {
  const s=setup({stage:7,attached}),existing={},before=JSON.stringify(s.E.mats);s.E.group.add(existing);
  if(failMesh){const Base=s.Three.Mesh;s.Three.Mesh=class extends Base{constructor(...args){if(s.Three.created.length===3)throw new Error('mesh failure');super(...args);}};}
  else{const Base=s.Three.PlaneGeometry;s.Three.PlaneGeometry=class extends Base{constructor(...args){if(s.Three.created.length===2)throw new Error('geometry failure');super(...args);}};}
  assert.throws(s.build,/failure/);assert.deepEqual(s.E.group.children,[existing]);assert.ok(s.Three.created.every(g=>g.disposed));assert.equal(JSON.stringify(s.E.mats),before);
 }
});
