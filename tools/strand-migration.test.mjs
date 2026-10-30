/* Independent geometry contract for explicit preview states. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createStrandModels} from '../models/strands.mjs';
function setup(id,state,slot) {
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.width=w;this.height=h;}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.rotation={};this.position={set:(...v)=>{this.xyz=v;}};}}};
 const keys=id==='pale_hanging_moss'?['middle','tip']:['down','up'].flatMap(d=>['base','middle','frustum','tip','tip_merge'].map(p=>d+'_'+p));
 const faceMap=Object.fromEntries(keys.map(k=>[k,k]));
 const env={slot,state,faceMap,mats:Object.fromEntries(keys.map(k=>[k,{path:k}])),hiddenMat:{},group:{children:[],add(mesh){this.children.push(mesh);}}};
 return {env,build:()=>createStrandModels(Three).find(m=>m.id===id).build(env)};
}
function snapshot(env){return env.group.children.map(m=>[m.material.path,m.geometry.width,m.geometry.height,m.xyz,m.rotation.y,m.material.side]);}
test('moss preserves both parts regardless of selected PNG',()=>{
 for(const slot of ['middle','tip']){const s=setup('pale_hanging_moss',{},slot);s.build();assert.equal(s.env.group.children.length,4);assert.deepEqual(s.env.group.children.map(m=>m.xyz[1]),[.5,.5,-.5,-.5]);assert.ok(s.env.group.children.every(m=>m.geometry.width===Math.SQRT2&&m.geometry.height===1));}
});
test('all four sulfur states keep their coordinates and ignore every texture slot',()=>{
 const keys=['down','up'].flatMap(d=>['base','middle','frustum','tip','tip_merge'].map(p=>d+'_'+p));
 for(const direction of ['down','up'])for(const merged of [false,true]){
  let expected;
  for(const slot of keys){const s=setup('sulfur_spike',{direction,merged},slot);s.build();const shot=snapshot(s.env);expected??=shot;assert.deepEqual(shot,expected);assert.equal(shot.length,8);}
  const ys=direction==='up'?[-.75,-.25,.25,.75]:[.75,.25,-.25,-.75];
  const parts=['base','middle','frustum',merged?'tip_merge':'tip'];
  expected.forEach((m,i)=>{assert.equal(m[0],direction+'_'+parts[Math.floor(i/2)]);assert.equal(m[1],Math.SQRT2/2);assert.equal(m[2],.5);assert.deepEqual(m[3],[0,ys[Math.floor(i/2)],0]);assert.equal(m[4],i%2?Math.PI/2:0);assert.equal(m[5],2);});
 }
});
test('invalid sulfur parameters and missing materials fail',()=>{
 for(const state of [{direction:'sideways'},{merged:'yes'}])assert.throws(()=>setup('sulfur_spike',state).build(),/Invalid sulfur/);
 const s=setup('pale_hanging_moss',{});delete s.env.mats.middle;assert.throws(()=>s.build(),/Missing segmented/);
 const hidden=setup('pale_hanging_moss',{});hidden.env.mats.middle=hidden.env.hiddenMat;assert.throws(()=>hidden.build(),/Missing segmented/);
 assert.throws(()=>createStrandModels({}),/require Three/);
});
test('view metadata stays explicit',()=>{
 const Three={Mesh:class{},PlaneGeometry:class{},DoubleSide:2},models=createStrandModels(Three);
 assert.deepEqual(models.map(m=>m.id),['pale_hanging_moss','sulfur_spike','pointed_dripstone']);assert.ok(models.every(m=>m.scale===1.4&&m.mode==='volume'));
});
