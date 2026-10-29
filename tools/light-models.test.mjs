import test from 'node:test';
import assert from 'node:assert/strict';
import {createLightModels} from '../models/lights.mjs';
function setup(id,state,slot='fire'){
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.coords=[];const xy=[[0,1],[1,1],[0,0],[1,0]];this.attributes={uv:{count:4,getX:i=>xy[i][0],getY:i=>xy[i][1],setXY:(i,u,v)=>{this.coords[i]=[u,v];}}};}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(x,y,z)=>{this.xyz=[x,y,z];}};this.rotation={set:(x,y,z)=>{this.angles=[x,y,z];}};}}};
 const env={faceMap:{up:'fire',down:'log',north:'lit'},mats:{fire:{id:'fire'},log:{id:'log'},lit:{id:'lit'}},hiddenMat:{},state,slot,group:{children:[],add(m){this.children.push(m);}}};
 return {env,build:()=>createLightModels(Three).find(m=>m.id===id).build(env)};
}
function snapshot(env){return env.group.children.map(m=>[m.material.id,m.geometry.w,m.geometry.h,m.xyz,m.angles,m.geometry.coords]);}
test('campfire power is independent of all selected texture slots',()=>{
 for(const lit of [false,true]){
  const shots=[];
  for(const slot of ['fire','log','lit']){const s=setup('campfire',{lit},slot);s.build();shots.push(snapshot(s.env));assert.equal(s.env.group.children.length,lit?30:28);}
  assert.deepEqual(shots[0],shots[1]);assert.deepEqual(shots[1],shots[2]);
 }
 const s=setup('campfire',{lit:false});s.build();assert.ok(s.env.group.children.every(m=>m.material.id==='log'));
});
test('campfire default is lit; invalid state values are rejected',()=>{
 const a=setup('campfire'),b=setup('campfire',{lit:true});a.build();b.build();assert.deepEqual(snapshot(a.env),snapshot(b.env));
 assert.throws(()=>setup('campfire',{lit:'on'}).build(),/must be boolean/);
});
test('lantern dimensions and handle planes are retained',()=>{
 const s=setup('lantern');s.build();const meshes=s.env.group.children;assert.equal(meshes.length,13);
 assert.equal(meshes[0].geometry.w,6/16);assert.equal(meshes[0].geometry.h,7/16);
 assert.deepEqual(meshes.slice(-2).map(m=>m.angles[1]),[Math.PI/4,-Math.PI/4]);
 assert.ok(meshes.slice(-2).every(m=>m.material.side===2));
});
test('chain alpha bounds select the occupied strip rather than the entire PNG',()=>{
 const s=setup('chain');const data=new Uint8Array(16*16*4);for(let y=0;y<16;y++)for(let x=6;x<9;x++)data[(y*16+x)*4+3]=255;
 for(const key of ['fire','lit'])s.env.mats[key].map={image:{width:16,height:16,data}};
 s.build();assert.equal(s.env.group.children.length,2);
 for(const m of s.env.group.children){assert.equal(m.geometry.w,3/16);assert.deepEqual(m.geometry.coords.map(uv=>uv[0]),[6/16,9/16,6/16,9/16]);}
});
test('ordinary torch retains six faces and cropped shaft UVs',()=>{
 const s=setup('torch');s.build();assert.equal(s.env.group.children.length,6);
 const side=s.env.group.children[0];assert.equal(side.geometry.w,2/16);assert.equal(side.geometry.h,10/16);
 assert.deepEqual(side.geometry.coords,[[7/16,10/16],[9/16,10/16],[7/16,0],[9/16,0]]);
});
test('missing material and missing Three dependency fail explicitly',()=>{
 const s=setup('lantern');delete s.env.mats.fire;assert.throws(()=>s.build(),/Missing light material/);
 assert.throws(()=>createLightModels({}),/require Three/);
});
