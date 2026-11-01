import test from 'node:test';
import assert from 'node:assert/strict';
import {createFruitStemPreview} from '../catalog/fruit-stem-preview.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
// Recording preview plans test composition only, not the real resolver, builders or WebGL.
function fixture(id='pumpkin',facing='west') {
 const Three=createThreeMock(),calls=[],state={attached:true,stage:7,facing},mat={opacity:.6,side:0},env={group:new Three.Group(),mats:{owned:mat},slot:'outside'},geometry=[];
 function plan(id,model,state={}) {
  const slot=id+'_png',snapshot={...state};
  return {object:{kind:'block',id},model,mode:'volume',scale:1,state,slot,paths:[slot],shared:[],
   build(E){const g=new Three.PlaneGeometry(1,1);geometry.push(g);g.rows[0]=[.25,.75];E.group.add(new Three.Mesh(g,mat));calls.push({id,slot,state:{...snapshot},environment:E,group:E.group});}
  };
 }
 const fruit=plan(id,id==='melon_block'?'cube':'pumpkin'),stem=plan(id==='melon_block'?'melon_stem':'pumpkin_stem','stem',state);
 return {Three,calls,env,fruit,stem,mat,geometry,compose:(s=stem)=>createFruitStemPreview(Three,fruit,s)};
}
test('fruit alone keeps the native scale and delegates one unchanged preview',()=>{
 for(const id of ['pumpkin','carved_pumpkin','lit_pumpkin','melon_block']) {
  const s=fixture(id),preview=s.compose(null);preview.build(s.env);
  assert.equal(preview.scale,1);assert.equal(preview.mode,'volume');assert.ok(Object.isFrozen(preview));assert.equal(s.calls.length,1);assert.equal(s.calls[0].id,id);
  const mesh=meshesOf(s.env.group)[0];assert.equal(mesh.material,s.mat);assert.deepEqual(mesh.geometry.rows[0],[.25,.75]);assert.equal(s.env.group.children[0].children.length,1);
 }
});
test('with stem retains the fruit origin and places only its own stem one block away',()=>{
 const offsets={west:[1,0,0],east:[-1,0,0],north:[0,0,1],south:[0,0,-1]};
 for(const id of ['pumpkin','carved_pumpkin','lit_pumpkin','melon_block'])for(const [facing,offset] of Object.entries(offsets)) {
  const s=fixture(id,facing),preview=s.compose();preview.build(s.env);const root=s.env.group.children[0];
  assert.equal(root.children.length,2);assert.deepEqual([root.children[0].position.x,root.children[0].position.y,root.children[0].position.z],[0,0,0]);
  const p=root.children[1].position;assert.deepEqual([p.x,p.y,p.z],offset);assert.equal(preview.scale,1.4);assert.equal(s.calls[1].id,id==='melon_block'?'melon_stem':'pumpkin_stem');assert.equal(s.calls[1].state.facing,facing);
 }
});
test('composition does not rewrite slots, paths, state, UV or material policy',()=>{
 const s=fixture(),before=JSON.stringify({fruit:s.fruit,stem:s.stem,mat:s.mat});
 for(const slot of ['fruit_png','stem_png','icon_png']){s.env.slot=slot;s.compose().build(s.env);}
 assert.equal(JSON.stringify({fruit:s.fruit,stem:s.stem,mat:s.mat}),before);
 for(const mesh of meshesOf(s.env.group)){assert.equal(mesh.material,s.mat);assert.deepEqual(mesh.geometry.rows[0],[.25,.75]);}
 for(const c of s.calls){assert.equal(c.environment.mats,s.env.mats);assert.notEqual(c.group,s.env.group);}
 assert.deepEqual(s.calls.map(c=>c.slot),Array(3).fill(['pumpkin_png','pumpkin_stem_png']).flat());
});
test('invalid fruit, model, category and cross-fruit pairing reject without building',()=>{
 for(const mutate of [s=>s.fruit.object.id='stone',s=>s.fruit.model='cube',s=>s.fruit.object.kind='item',s=>s.fruit.mode='sprite',s=>s.fruit.scale=NaN,s=>s.stem.object.id='melon_stem',s=>s.stem.model='cube',s=>s.stem.build=null]) {
  const s=fixture();mutate(s);assert.throws(()=>s.compose(),/Invalid fruit|Mismatched fruit/);assert.equal(s.Three.created.length,0);
 }
 assert.throws(()=>createFruitStemPreview({},{}),/Three.Group/);
});
test('composition requires an attached stem and a supported explicit direction',()=>{
 for(const change of [{attached:false},{attached:1},{facing:'up'},{facing:null}]){const s=fixture();Object.assign(s.stem.state,change);assert.throws(()=>s.compose(),/attached directed stem/);assert.equal(s.Three.created.length,0);}
});
test('a prepared preview snapshots direction and creates fresh groups on each build',()=>{
 const s=fixture(),preview=s.compose();s.stem.state.facing='east';preview.build(s.env);preview.build(s.env);
 assert.notEqual(s.env.group.children[0],s.env.group.children[1]);assert.equal(s.env.group.children[0].children[1].position.x,1);assert.equal(s.env.group.children[1].children[1].position.x,1);
 const t=fixture();t.fruit.scale=2;assert.equal(t.compose().scale,2);
});
test('a child failure preserves the destination and disposes only prepared attached geometry',()=>{
 for(const failed of ['fruit','stem']) {
  const s=fixture(),existingGeometry=new s.Three.PlaneGeometry(2,2),existing=new s.Three.Mesh(existingGeometry,s.mat);s.env.group.add(existing);
  const plan=s[failed],build=plan.build;plan.build=function(E){build.call(this,E);throw new Error('child failure');};
  const preview=s.compose();assert.throws(()=>preview.build(s.env),/child failure/);assert.deepEqual(s.env.group.children,[existing]);assert.equal(existingGeometry.disposed,undefined);assert.ok(s.geometry.length>0);assert.ok(s.geometry.every(g=>g.disposed));assert.deepEqual(s.mat,{opacity:.6,side:0});
 }
});
test('missing destination is rejected before calling either child',()=>{
 const s=fixture(),preview=s.compose();for(const env of [null,{}, {group:{}}])assert.throws(()=>preview.build(env),/composition environment/);assert.equal(s.calls.length,0);assert.equal(s.Three.created.length,0);
});
