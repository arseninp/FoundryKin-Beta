import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../fk-curation.js',import.meta.url),'utf8');
function setup(ids){
 const b=Object.fromEntries(ids.map(id=>[id,Array(6).fill('textures/blocks/'+id)]));let fallback=0;
 const ctx={FKCatalog:{index:()=>({b:{...b},sp:{},cr:{},ids:ids.slice(),sig:Object.fromEntries(ids.map(i=>[i,i])),members:Object.fromEntries(ids.map(i=>[i,[i]])),mother:Object.fromEntries(ids.map(i=>[i,i])),hidden:0})},FKShapes:{build(){fallback++}},
 THREE:{PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.uv=[[0,1],[1,1],[0,0],[1,0]];this.coords=[];const s=this;this.attributes={uv:{count:4,getX:i=>s.uv[i][0],getY:i=>s.uv[i][1],setXY:(i,u,v)=>{s.coords[i]=[u,v]}}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set:(x,y,z)=>{this.x=x;this.y=y;this.z=z}};this.rotation={set:()=>{}}}}}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,fallbacks:()=>fallback};
}
function render(ctx,cur){const ids=['up','down','north','south','east','west'],fm={},mats={};ids.forEach(k=>{fm[k]='t_'+k;mats['t_'+k]={}});const meshes=[];ctx.FKShapes.build({cur,slot:'t_up',faceMap:fm,mats,hiddenMat:{},group:{add:m=>meshes.push(m)}});return meshes}
test('leftover forms leave the catalog and keep other data consistent',()=>{
 const {ctx}=setup(['stone','horn_coral_fan','normal_stone_slab','normal_stone_stairs','petrified_oak_slab','bamboo_fence']);
 const cat=ctx.FKCatalog.index({}, {});
 for(const id of ['normal_stone_slab','normal_stone_stairs','petrified_oak_slab']){assert.ok(!cat.b[id]);assert.ok(!cat.ids.includes(id));assert.ok(!cat.sig[id]);assert.ok(!cat.mother[id])}
 assert.deepEqual(cat.ids,['stone','horn_coral_fan','bamboo_fence']);assert.equal(cat.hidden,3);
});
test('every coral wall fan is hidden while fans and corals stay',()=>{
 const wall=['horn','brain','bubble','fire','tube'].flatMap(k=>[k+'_coral_wall_fan','dead_'+k+'_coral_wall_fan']),keep=['horn_coral_fan','dead_tube_coral_fan','brain_coral','fire_coral_block'];
 const {ctx}=setup(wall.concat(keep)),cat=ctx.FKCatalog.index({},{});
 for(const id of wall){assert.ok(!cat.b[id]);assert.ok(!cat.ids.includes(id))}
 assert.deepEqual(cat.ids,keep);assert.equal(cat.hidden,10);
});
test('dirt path is 15 pixels high with the side image cut one pixel from the top',()=>{
 const {ctx}=setup(['grass_path']),meshes=render(ctx,'grass_path');assert.equal(meshes.length,6);
 const t=meshes.find(m=>Math.abs(m.y-(15-8)/16)<1e-9&&m.geometry.h===1);assert.ok(t);
 const side=meshes.filter(m=>Math.abs(m.geometry.h-15/16)<1e-9);assert.equal(side.length,4);
 for(const m of side){assert.ok(Math.abs(m.y-(-1/32))<1e-9);const v=m.geometry.coords.map(c=>(1-c[1])*16);assert.ok(Math.abs(Math.min(...v)-1)<1e-9);assert.ok(Math.abs(Math.max(...v)-16)<1e-9)}
});
test('enchanting table is 12 pixels high with a 12 pixel side region',()=>{
 const {ctx}=setup(['enchanting_table']),meshes=render(ctx,'enchanting_table');assert.equal(meshes.length,6);
 const side=meshes.filter(m=>Math.abs(m.geometry.h-12/16)<1e-9);assert.equal(side.length,4);
 for(const m of side){const v=m.geometry.coords.map(c=>(1-c[1])*16);assert.ok(Math.abs(Math.min(...v)-4)<1e-9);assert.ok(Math.abs(Math.max(...v)-16)<1e-9)}
 assert.ok(Math.abs(Math.max(...meshes.map(m=>m.y))-(12-8)/16)<1e-9);
});
test('other models and item sprites delegate unchanged',()=>{
 const {ctx,fallbacks}=setup(['stone']);ctx.FKShapes.build({cur:'stone'});ctx.FKShapes.build({cur:'grass_path',slot:'textures/items/x'});assert.equal(fallbacks(),2);
});
