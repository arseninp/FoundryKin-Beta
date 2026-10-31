import test from 'node:test';
import assert from 'node:assert/strict';
import {createStructureModels} from '../models/structures.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {composeShape} from '../models/shapes.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const IDS=['mob_spawner','trial_spawner','vault'],FACES=['up','down','north','south','east','west'];
function setup(id) {
 const Three=createThreeMock(),f=id==='mob_spawner'?Object.fromEntries(FACES.map(face=>[face,'textures/blocks/mob_spawner'])):{up:'top',down:'bottom',north:id==='vault'?'front':'side',south:'side',east:'side',west:'side'};
 const count=id==='mob_spawner'?1:id==='trial_spawner'?12:8,bindings=Object.fromEntries(Array.from({length:count},(_,variant)=>FACES.map(face=>['variant_'+variant+'_'+face,f[face]])).flat());
 const mats=Object.fromEntries(Object.values(f).map(path=>[path,{path}])),E={cur:id,faceMap:f,bindings,mats,hiddenMat:{},group:new Three.Group(),state:{}};
 const model=createStructureModels(Three).find(row=>row.id==='cage');return {Three,E,model,build:()=>model.build(E)};
}
function point(mesh,u,v) {
 let x=(u-.5)*mesh.geometry.size[0],y=(v-.5)*mesh.geometry.size[1],z=0;
 const ry=mesh.rotation.y,rx=mesh.rotation.x,tx=x*Math.cos(ry)+z*Math.sin(ry);z=-x*Math.sin(ry)+z*Math.cos(ry);x=tx;
 const ty=y*Math.cos(rx)-z*Math.sin(rx);z=y*Math.sin(rx)+z*Math.cos(rx);y=ty;
 return [x+mesh.position.x,y+mesh.position.y,z+mesh.position.z];
}
const round=value=>Math.round(value*1e9)/1e9;
function signature(mesh) {
 const vertices=[[0,1],[1,1],[0,0],[1,0]].map(([u,v],i)=>[...point(mesh,u,v),...mesh.geometry.rows[i]].map(round));
 return JSON.stringify([mesh.material.path,vertices.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))]);
}
function normal(mesh) {
 const a=point(mesh,0,1),b=point(mesh,0,0),c=point(mesh,1,1),u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
 return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
}
function reference(s) {
 const floor=s.E.cur==='vault'?3:0,full=[0,0,16,16],side=[16,0,0,16-floor],f=s.E.faceMap;
 const env={...s.E,group:new s.Three.Group()};
 // Literal element bounds and UV rectangles from cube_*_inner_faces and template_vault JSON.
 composeShape(s.Three,env,p=>{
  p.box([0,0,0],[16,16,16],f,Object.fromEntries(FACES.map(face=>[face,full])));
  p.box([15.998,floor+.002,.002],[.002,15.998,15.998],f,{north:side,south:side,east:side,west:side,up:[16,0,0,16],down:floor?full:[16,0,0,16]});
 });
 return meshesOf(env.group).map(signature).sort();
}
test('cages share one builder and retain explicit structural model registration',()=>{
 const s=setup('vault');assert.deepEqual(createStructureModels(s.Three).map(model=>model.id),['composter','scaffolding','cage']);assert.equal(s.model.scale,1);assert.equal(s.model.mode,'volume');
});
test('all three cages match reference positions and UVs without negative-size production geometry',()=>{
 for(const id of IDS){const s=setup(id),expected=reference(s);s.build();const meshes=meshesOf(s.E.group);assert.equal(meshes.length,12);assert.deepEqual(meshes.map(signature).sort(),expected);assert.ok(meshes.every(mesh=>mesh.geometry.size.every(size=>size>0)));}
});
test('outer faces face out and inner faces face into the cavity',()=>{
 for(const id of IDS) {
  const s=setup(id);s.build();const meshes=meshesOf(s.E.group),floor=id==='vault'?3:0;
  for(const [index,mesh] of meshes.entries()) {
   const n=normal(mesh),center=index<6?[0,0,0]:[0,floor/32,0],dot=n.reduce((value,component,i)=>value+component*([mesh.position.x,mesh.position.y,mesh.position.z][i]-center[i]),0);
   assert.ok(index<6?dot>0:dot<0,id+':'+index);
  }
 }
});
test('vault cavity has a three-pixel floor and thirteen-pixel inner walls',()=>{
 const s=setup('vault');s.build();const meshes=meshesOf(s.E.group),inner=meshes.slice(6);
 assert.equal(inner[5].position.y,(3.002-8)/16);assert.equal(inner[0].geometry.size[1],12.996/16);assert.equal(inner[4].position.y,(15.998-8)/16);
 assert.equal(meshes[0].material.path,'top');assert.equal(inner[0].material.path,'front');assert.equal(inner[5].material.path,'bottom');
});
test('editing slots never changes cage geometry or source material policy',()=>{
 for(const id of IDS) {
  const sample=setup(id);let expected;
  for(const slot of Object.keys(sample.E.mats)) {
   const s=setup(id),before=JSON.stringify(s.E.mats);s.E.slot=slot;s.build();const snapshot=meshesOf(s.E.group).map(signature).sort();expected??=snapshot;assert.deepEqual(snapshot,expected);assert.equal(JSON.stringify(s.E.mats),before);assert.ok(meshesOf(s.E.group).every(mesh=>mesh.material===s.E.mats[mesh.material.path]));
  }
 }
});
test('missing roles and unsupported object IDs fail before allocating geometry',()=>{
 for(const id of IDS){const s=setup(id);delete s.E.bindings.variant_0_north;assert.throws(s.build,/Missing cage binding: variant_0_north/);assert.equal(s.Three.created.length,0);}
 const s=setup('vault');s.E.cur='future_vault';assert.throws(s.build,/Unknown cage object/);assert.equal(s.Three.created.length,0);
});
test('missing materials and inner-shell allocation failure preserve the scene and free prepared geometry',()=>{
 for(const id of IDS) {
  const missing=setup(id),existing={};missing.E.group.add(existing);delete missing.E.mats[missing.E.faceMap.north];assert.throws(missing.build,/Missing model material/);assert.deepEqual(missing.E.group.children,[existing]);assert.ok(missing.Three.created.every(geometry=>geometry.disposed));
  const s=setup(id),Base=s.Three.PlaneGeometry,before=JSON.stringify(s.E.mats);s.E.group.add(existing);
  s.Three.PlaneGeometry=class extends Base{constructor(...args){if(s.Three.created.length===9)throw new Error('allocation');super(...args);}};
  assert.throws(s.build,/allocation/);assert.deepEqual(s.E.group.children,[existing]);assert.ok(s.Three.created.every(geometry=>geometry.disposed));assert.equal(JSON.stringify(s.E.mats),before);
 }
});

// Selected normalized sequences from terrain-004 at PIN 46ba6ea; repeats preserve native indices.
function nativeRecord(id) {
 const P='textures/blocks/',count=id==='mob_spawner'?1:id==='trial_spawner'?12:8,variants=Object.fromEntries(FACES.map(face=>[face,[]]));
 for(let variant=0;variant<count;variant++) {
  let row;
  if(id==='mob_spawner')row=Object.fromEntries(FACES.map(face=>[face,P+'mob_spawner']));
  else if(id==='trial_spawner') {
   const index=variant%6,suffix=variant>=6?'_ominous':'',top=['inactive','active','active','ejecting_reward','ejecting_reward','inactive'][index],side=['inactive','active','active','active','active','inactive'][index];
   row={up:P+'trial_spawner_top_'+top+suffix,down:P+'trial_spawner_bottom',north:P+'trial_spawner_side_'+side+suffix,south:P+'trial_spawner_side_'+side+suffix,east:P+'trial_spawner_side_'+side+suffix,west:P+'trial_spawner_side_'+side+suffix};
  } else {
   const index=variant%4,suffix=variant>=4?'_ominous':'',front=['off','on','ejecting','ejecting'][index],side=['off','on','on','on'][index];
   row={up:P+'vault_top'+(index===3?'_ejecting':'')+suffix,down:P+'vault_bottom'+suffix,north:P+'vault_front_'+front+suffix,south:P+'vault_side_'+side+suffix,east:P+'vault_side_'+side+suffix,west:P+'vault_side_'+side+suffix};
  }
  for(const face of FACES)variants[face].push(row[face]);
 }
 return {id,model:'cage',variants,paths:[...new Set(Object.values(variants).flat())].sort()};
}
test('one indexed variant selects all six owned cage materials without dropping repeated states',()=>{
 for(const id of IDS) {
  const record=nativeRecord(id),before=JSON.stringify(record),parts=utilityBindings(record),count=record.variants.up.length;
  assert.equal(Object.keys(parts).length,count*6);
  for(let variant=0;variant<count;variant++) {
   const Three=createThreeMock(),E={cur:id,state:{variant},bindings:Object.fromEntries(Object.entries(parts).map(([role,paths])=>[role,paths[0]])),mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
   createStructureModels(Three).find(model=>model.id==='cage').build(E);const meshes=meshesOf(E.group);assert.equal(meshes.length,12);
   assert.deepEqual(meshes.slice(0,6).map(mesh=>mesh.material.path),FACES.map(face=>record.variants[face][variant]));assert.equal(E.state.variant,variant);
  }
  assert.equal(JSON.stringify(record),before);
 }
 const trial=nativeRecord('trial_spawner');assert.equal(trial.variants.down.length,12);assert.equal(new Set(trial.variants.down).size,1);
 const vault=nativeRecord('vault');assert.equal(vault.variants.up.length,8);assert.equal(vault.variants.up[1],vault.variants.up[2]);assert.notEqual(vault.variants.up[2],vault.variants.up[3]);
});
test('native sequence validation and cage state bounds reject incomplete or foreign data',()=>{
 for(const id of IDS) {
  for(const change of [r=>r.variants.up.pop(),r=>{delete r.variants.up[0];},r=>{r.variants.up[0]='textures/blocks/foreign';},r=>{r.id='future_vault';}]) {
   const bad=nativeRecord(id);change(bad);assert.throws(()=>utilityBindings(bad),/Incomplete cage|Missing or ambiguous cage|Unknown cage/);
  }
  const record=nativeRecord(id),parts=utilityBindings(record);
  for(const variant of [-1,record.variants.up.length,.5,'0',null]) {
   const Three=createThreeMock(),E={cur:id,state:{variant},bindings:Object.fromEntries(Object.entries(parts).map(([role,paths])=>[role,paths[0]])),mats:{},hiddenMat:{},group:new Three.Group()};
   assert.throws(()=>createStructureModels(Three).find(model=>model.id==='cage').build(E),/Invalid cage variant/);assert.equal(Three.created.length,0);
  }
 }
});
