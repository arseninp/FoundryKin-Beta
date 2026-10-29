import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrimitiveModels} from '../models/primitives.mjs';
function three() {
 return {BoxGeometry: class {
  constructor(w,h,d) {
   this.size=[w,h,d];this.coords=[];
   const rows=[];
   for(const [normal,axis] of [[[1,0,0],0],[[-1,0,0],0],[[0,1,0],1],[[0,-1,0],1],[[0,0,1],2],[[0,0,-1],2]]) {
    for(const a of [-1,1]) for(const b of [-1,1]) {
     const point=[0,0,0],other=[0,1,2].filter(i=>i!==axis);point[axis]=normal[axis]*[w,h,d][axis]/2;
     point[other[0]]=a*[w,h,d][other[0]]/2;point[other[1]]=b*[w,h,d][other[1]]/2;rows.push({point,normal});
    }
   }
   const attr=key=>({count:rows.length,getX:i=>rows[i][key][0],getY:i=>rows[i][key][1],getZ:i=>rows[i][key][2]});
   this.rows=rows;this.attributes={position:attr('point'),normal:attr('normal'),uv:{setXY:(i,u,v)=>{this.coords[i]=[u,v];}}};
  }
 },Mesh:class {constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};}}};
}
function setup(id,cur='stone') {
 const models=createPrimitiveModels(three());const model=models.find(row=>row.id===id);
 const faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,face]));
 const env={cur,faceMap,mats:Object.fromEntries(Object.values(faceMap).map(key=>[key,{key}])),group:{children:[],add(m){this.children.push(m);}}};
 return {model,env};
}
test('all eleven primitive registrations have explicit view metadata',()=>{
 const models=createPrimitiveModels(three());
 assert.deepEqual(models.map(row=>row.id),['cube','slab','stairs','wall','fence','gate','button','plate','cake','trapdoor','carpet']);
 assert.ok(models.every(row=>row.scale===1&&row.mode==='volume'));
});
test('primitive dimensions and accepted vertical shifts are retained',()=>{
 const expected={cube:[[1,1,1,0,0,0]],slab:[[1,.5,1,0,0,0]],stairs:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],carpet:[[1,.0625,1,0,-.01875,0]]};
 for(const [id,parts] of Object.entries(expected)) {
  const {model,env}=setup(id);model.build(env);assert.equal(env.group.children.length,parts.length);
  env.group.children.forEach((mesh,i)=>{const [w,h,d,x,y,z]=parts[i];assert.deepEqual(mesh.geometry.size,[w,h,d]);assert.equal(mesh.position.x,x);assert.ok(Math.abs(mesh.position.y-y)<1e-12);assert.equal(mesh.position.z,z);});
 }
 const counts={wall:2,fence:3,gate:4,button:1,plate:1,cake:1,trapdoor:1};
 for(const [id,count] of Object.entries(counts)){const {model,env}=setup(id);model.build(env);assert.equal(env.group.children.length,count);}
});
test('material order and world-coordinate UVs hold for every primitive vertex',()=>{
 for(const id of createPrimitiveModels(three()).map(row=>row.id)) {
  const {model,env}=setup(id);model.build(env);
  for(const mesh of env.group.children) {
   assert.deepEqual(mesh.material.map(m=>m.key),['east','west','up','down','south','north']);
   for(let i=0;i<mesh.geometry.rows.length;i++) {
    const {point:[x,y,z],normal:[nx,ny,nz]}=mesh.geometry.rows[i];
    const X=x+mesh.position.x,Y=y+mesh.position.y,Z=z+mesh.position.z;
    const shift={slab:.25,button:.4,plate:.45,cake:.25,trapdoor:.4,carpet:.45}[id]||0;
    const expected=nx?[(nx>0?.5-Z:Z+.5),Y-shift+.5]:nz?[(nz>0?X+.5:.5-X),Y-shift+.5]:[X+.5,ny>0?.5-Z:Z+.5];
    mesh.geometry.coords[i].forEach((v,k)=>assert.ok(Math.abs(v-expected[k])<1e-12,id));
   }
  }
 }
});
test('glazed cube UV rotations preserve all six accepted face angles',()=>{
 const {model,env}=setup('cube','white_glazed_terracotta');model.build(env);const mesh=env.group.children[0];
 const angles={east:0,west:180,up:180,down:180,south:90,north:270};
 mesh.geometry.rows.forEach(({point:[x,y,z],normal:[nx,ny,nz]},i)=>{
  const face=nx?(nx>0?'east':'west'):ny?(ny>0?'up':'down'):nz>0?'south':'north';
  const uv=nx?[nx>0?.5-z:z+.5,y+.5]:nz?[nz>0?x+.5:.5-x,y+.5]:[x+.5,ny>0?.5-z:z+.5];
  const a=angles[face]*Math.PI/180,u=uv[0]-.5,v=uv[1]-.5;
  const expected=[.5+u*Math.cos(a)-v*Math.sin(a),.5+u*Math.sin(a)+v*Math.cos(a)];
  mesh.geometry.coords[i].forEach((n,k)=>assert.ok(Math.abs(n-expected[k])<1e-12));
 });
});
test('a missing material fails before attaching geometry; no global dependency is required',()=>{
 assert.throws(()=>createPrimitiveModels({}),/require Three/);
 const {model,env}=setup('stairs');delete env.mats.west;
 assert.throws(()=>model.build(env),/Missing primitive material/);assert.equal(env.group.children.length,0);
});
