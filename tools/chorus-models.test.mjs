import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlantModels} from '../models/plants.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {declaredDependencies,attachDependencies} from '../catalog/rules/dependencies.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const DIRS=['north','south','east','west','up','down'];
function setup(id,state={},slot) {
 const Three=createThreeMock(),bindings=id==='chorus_plant'?{up:'stem'}:{live:'live',dead:'dead',stem:'stem'},mats=Object.fromEntries(Object.values(bindings).map(path=>[path,{path}]));
 const E={cur:id,state,slot:slot??Object.values(bindings)[0],bindings,mats,hiddenMat:{},group:new Three.Group()},model=createPlantModels(Three).find(model=>model.id===id);return {Three,E,model,build:()=>model.build(E)};
}
const snapshot=E=>meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,position:[m.position.x,m.position.y,m.position.z],rotation:[m.rotation.x,m.rotation.y,m.rotation.z],path:m.material.path}));
function point(m,u,v) {
 let x=(u-.5)*m.geometry.size[0],y=(v-.5)*m.geometry.size[1],z=0;
 const ry=m.rotation.y,rx=m.rotation.x,tx=x*Math.cos(ry)+z*Math.sin(ry);z=-x*Math.sin(ry)+z*Math.cos(ry);x=tx;
 const ty=y*Math.cos(rx)-z*Math.sin(rx);z=y*Math.sin(rx)+z*Math.cos(rx);y=ty;return [x+m.position.x,y+m.position.y,z+m.position.z];
}
function worldUV(m,x,y,z) {
 if(m.rotation.y===Math.PI)return [.5-x,y+.5];
 if(m.rotation.y===Math.PI/2)return [.5-z,y+.5];
 if(m.rotation.y===-Math.PI/2)return [z+.5,y+.5];
 if(m.rotation.x===-Math.PI/2)return [x+.5,.5-z];
 if(m.rotation.x===Math.PI/2)return [x+.5,z+.5];
 return [x+.5,y+.5];
}
test('chorus builders extend rather than replace the accepted plant registry',()=>{
 assert.deepEqual(createPlantModels(createThreeMock()).map(model=>model.id),['flower','spore_blossom','sunflower','chorus_plant','chorus_flower']);
 for(const id of ['chorus_plant','chorus_flower']){const s=setup(id);assert.equal(s.model.scale,1);assert.equal(s.model.mode,'volume');}
});
test('all sixty-four connection masks preserve the core and expose exactly the requested arms',()=>{
 for(let mask=0;mask<64;mask++) {
  const state=Object.fromEntries(DIRS.map((direction,i)=>[direction,Boolean(mask&(1<<i))])),s=setup('chorus_plant',state);s.build();const meshes=meshesOf(s.E.group),count=Object.values(state).filter(Boolean).length;
  assert.equal(meshes.length,6+4*count);assert.ok(meshes.every(m=>m.material===s.E.mats.stem&&m.geometry.size.every(size=>size>0)));
  const bounds=meshes.flatMap(m=>[[0,1],[1,1],[0,0],[1,0]].map(([u,v])=>point(m,u,v)));
  for(const [direction,axis,sign] of [['north',2,-1],['south',2,1],['east',0,1],['west',0,-1],['up',1,1],['down',1,-1]])assert.ok(Math.abs(Math.max(...bounds.map(p=>p[axis]*sign))-(state[direction]?.5:.25))<1e-9);
 }
});
test('connected plant UVs remain locked to the block axes for every connection combination',()=>{
 for(let mask=0;mask<64;mask++) {
  const s=setup('chorus_plant',Object.fromEntries(DIRS.map((direction,i)=>[direction,Boolean(mask&(1<<i))])));s.build();
  for(const m of meshesOf(s.E.group))for(const [i,[u,v]] of [[0,1],[1,1],[0,0],[1,0]].entries()) {
   const expected=worldUV(m,...point(m,u,v));assert.ok(m.geometry.rows[i].every((value,axis)=>Math.abs(value-expected[axis])<1e-9));
  }
 }
});
test('chorus flower uses six reference elements and changes only five bloom surfaces when dead',()=>{
 const live=setup('chorus_flower'),dead=setup('chorus_flower',{dead:true});live.build();dead.build();
 const a=meshesOf(live.E.group),b=meshesOf(dead.E.group);assert.equal(a.length,31);assert.equal(b.length,31);assert.equal(a.filter(m=>m.material.path==='live').length,5);assert.equal(a.filter(m=>m.material.path==='stem').length,26);
 assert.deepEqual(snapshot(live.E).map(({path,...shape})=>shape),snapshot(dead.E).map(({path,...shape})=>shape));
 assert.ok(b.every((m,i)=>m.material.path===(a[i].material.path==='live'?'dead':'stem')));assert.ok(a.every(m=>m.geometry.rows.every(row=>row.every(value=>value>=0&&value<=1))));
 const top=a.find(m=>m.material.path==='live'&&m.rotation.x===-Math.PI/2);assert.deepEqual(top.geometry.size,[12/16,12/16]);assert.equal(top.position.y,.5);
});
test('editing slots cannot choose geometry, dead state or connection flags',()=>{
 for(const [id,state,slots] of [['chorus_plant',{north:true,up:true},['stem','unrelated']],['chorus_flower',{dead:true},['live','dead','stem']]]) {
  let expected;for(const slot of slots){const s=setup(id,{...state},slot),before=JSON.stringify({state:s.E.state,bindings:s.E.bindings,mats:s.E.mats});s.build();expected??=snapshot(s.E);assert.deepEqual(snapshot(s.E),expected);assert.equal(JSON.stringify({state:s.E.state,bindings:s.E.bindings,mats:s.E.mats}),before);}
 }
});
test('invalid states and missing bindings fail before allocating geometry',()=>{
 for(const direction of DIRS)for(const value of [null,0,1,'true']){const s=setup('chorus_plant',{[direction]:value});assert.throws(s.build,/Invalid chorus connection/);assert.equal(s.Three.created.length,0);}
 for(const dead of [null,0,1,'dead']){const s=setup('chorus_flower',{dead});assert.throws(s.build,/Invalid chorus flower dead state/);assert.equal(s.Three.created.length,0);}
 for(const id of ['chorus_plant','chorus_flower']){const s=setup(id);delete s.E.bindings[Object.keys(s.E.bindings)[0]];assert.throws(s.build,/Missing chorus/);assert.equal(s.Three.created.length,0);}
});
test('missing shared stem material and allocation failure cannot leave a partial object',()=>{
 for(const id of ['chorus_plant','chorus_flower']) {
  const s=setup(id),existing={};s.E.group.add(existing);delete s.E.mats.stem;assert.throws(s.build,/Missing model material/);assert.deepEqual(s.E.group.children,[existing]);assert.ok(s.Three.created.every(g=>g.disposed));
  const t=setup(id),Base=t.Three.PlaneGeometry,before=JSON.stringify(t.E.mats);t.E.group.add(existing);
  t.Three.PlaneGeometry=class extends Base{constructor(...args){if(t.Three.created.length===3)throw new Error('allocation');super(...args);}};
  assert.throws(t.build,/allocation/);assert.deepEqual(t.E.group.children,[existing]);assert.ok(t.Three.created.every(g=>g.disposed));assert.equal(JSON.stringify(t.E.mats),before);
 }
});
const P='textures/blocks/';
function record(){return {id:'chorus_flower',model:'chorus_flower',variants:{up:[P+'chorus_flower',P+'chorus_flower_dead']},paths:[P+'chorus_flower',P+'chorus_flower_dead']};}
test('chorus flower keeps both owned textures and explicitly binds the shared stem without transferring ownership',()=>{
 const r=record(),before=JSON.stringify(r),parts=utilityBindings(r);
 assert.deepEqual(parts,{live:[P+'chorus_flower'],dead:[P+'chorus_flower_dead'],stem:[P+'chorus_plant']});assert.equal(r.paths.includes(P+'chorus_plant'),false);assert.equal(JSON.stringify(r),before);
});
test('incomplete, sparse, foreign or incorrectly owned chorus flower parts fail explicitly',()=>{
 for(const change of [r=>r.variants.up.pop(),r=>{delete r.variants.up[1];},r=>{r.variants.up[1]=P+'foreign';},r=>{r.id='future_chorus_flower';}]){const r=record();change(r);assert.throws(()=>utilityBindings(r),/Incomplete chorus flower|Missing or ambiguous chorus flower|Unknown chorus flower/);}
});
// Synthetic input fixtures exercise the real normalizer and dependency attachment, not the full pinned catalog.
function normalizedFlower() {
 const atlas={flower:{textures:[P+'chorus_flower',P+'chorus_flower_dead']}};
 return normalizeBlock('chorus_flower',{textures:'flower'},atlas,{model:'chorus_flower'});
}
test('normalization and declared dependencies preserve owned paths while authorizing the shared stem',()=>{
 const r=normalizedFlower(),before=JSON.stringify(r),assignments={chorus_flower:{model:'chorus_flower'},chorus_plant:{model:'chorus_plant'}};
 const dependencies=declaredDependencies(assignments);assert.deepEqual(dependencies,{chorus_flower:{stem:P+'chorus_plant'}});
 const attached=attachDependencies({chorus_flower:r},dependencies,{[P+'chorus_plant']:true}).chorus_flower;
 assert.deepEqual(attached.dependencies,{stem:[P+'chorus_plant']});assert.deepEqual(attached.paths,r.paths);assert.equal(attached.paths.includes(P+'chorus_plant'),false);assert.equal(JSON.stringify(r),before);
 for(const dead of [false,true])for(const slot of attached.paths) {
  const Three=createThreeMock(),bindings=Object.fromEntries(Object.entries(attached.bindings).map(([role,paths])=>[role,paths[0]]));
  const E={cur:'chorus_flower',slot,state:{dead},bindings,mats:Object.fromEntries([...attached.paths,...attached.dependencies.stem].map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
  createPlantModels(Three).find(m=>m.id==='chorus_flower').build(E);
  const meshes=meshesOf(E.group);assert.equal(meshes.length,31);assert.equal(meshes.filter(m=>m.material.path===P+(dead?'chorus_flower_dead':'chorus_flower')).length,5);assert.equal(meshes.filter(m=>m.material.path===P+'chorus_plant').length,26);
 }
});
test('missing shared inventory rejects without mutating normalized records or declarations',()=>{
 const records={chorus_flower:normalizedFlower()},dependencies=declaredDependencies({chorus_flower:{model:'chorus_flower'}}),before=JSON.stringify({records,dependencies});
 assert.throws(()=>attachDependencies(records,dependencies,{}),/Missing dependency resource: textures\/blocks\/chorus_plant/);
 assert.equal(JSON.stringify({records,dependencies}),before);
});
test('chorus dependency declaration leaves existing shared-model contracts intact',()=>{
 const assignments={azalea:{model:'azalea'},piston:{model:'piston'},unpowered_repeater:{model:'repeater'},pitcher_plant:{model:'pitcher'},chorus_flower:{model:'chorus_flower'}};
 const actual=declaredDependencies(assignments);assert.deepEqual(actual.piston,{head_back:P+'piston_top_normal'});assert.deepEqual(actual.azalea,{pot:P+'flower_pot',soil:P+'dirt'});assert.deepEqual(actual.unpowered_repeater,{torch_on:P+'redstone_torch_on',torch_off:P+'redstone_torch_off'});assert.deepEqual(actual.pitcher_plant,{pod_top:P+'pitcher_crop_top',pod_bottom:P+'pitcher_crop_bottom',pod_side:P+'pitcher_crop_side'});
 actual.chorus_flower.stem='wrong';assert.equal(declaredDependencies(assignments).chorus_flower.stem,P+'chorus_plant');
});
