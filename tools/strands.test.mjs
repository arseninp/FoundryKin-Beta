import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../fk-strands.js',import.meta.url),'utf8');
const parts=['base','middle','frustum','tip','tip_merge'],prefix='textures/blocks/';
function setup(){
 const extra={pale_hanging_moss:['middle','tip'].map(p=>prefix+'pale_hanging_moss_'+p),sulfur_spike:['down','up'].flatMap(d=>parts.map(p=>prefix+'sulfur_spike_'+d+'_'+p))};
 const raw={b:{pale_hanging_moss:Array(6).fill(extra.pale_hanging_moss[0]),sulfur_spike:Array(6).fill(extra.sulfur_spike[0])},extra};
 const existing=Object.fromEntries(Object.values(extra).flat().map(p=>[p,1]));let fallbacks=0;
 const ctx={FKCatalog:{index:c=>({b:c.b,sp:{},cr:{},ids:Object.keys(c.b)})},FKShapes:{build(){fallbacks++},view:id=>id==='pointed_dripstone'?1.4:1},THREE:{DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set:(x,y,z)=>{this.x=x;this.y=y;this.z=z}};this.rotation={}}}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);const cat=ctx.FKCatalog.index(raw,existing);
 function render(id,slot){const list=cat.sp[id].list,mats=Object.fromEntries(list.map(s=>[s.id,{path:s.id}])),meshes=[];ctx.FKShapes.build({cur:id,slot:slot||list[0].id,faceMap:cat.sp[id].fm,mats,group:{add:m=>meshes.push(m)}});return meshes}
 return {ctx,cat,raw,existing,render,fallbacks:()=>fallbacks};
}
test('all original paths remain selectable: two moss and ten spike textures',()=>{
 const {cat,raw}=setup();assert.equal(cat.sp.pale_hanging_moss.list.length,2);assert.equal(cat.sp.sulfur_spike.list.length,10);
 for(const id of Object.keys(raw.extra))assert.deepEqual(Array.from(cat.sp[id].list,s=>s.id).sort(),raw.extra[id].slice().sort());
});
test('hanging moss is a continuous middle and tip cross, not a cube',()=>{
 const {render}=setup(),meshes=render('pale_hanging_moss');assert.equal(meshes.length,4);
 assert.deepEqual(meshes.map(m=>m.y),[.5,.5,-.5,-.5]);
 for(const m of meshes){assert.equal(m.geometry.w,Math.SQRT2);assert.equal(m.geometry.h,1);assert.equal(m.material.side,2)}
});
test('all ten spike selections preserve orientation and merged-tip choice',()=>{
 const {cat,render}=setup();
 for(const {id:slot} of cat.sp.sulfur_spike.list){
  const meshes=render('sulfur_spike',slot),up=slot.includes('_up_'),direction=up?'up':'down',end=slot.endsWith('_tip_merge')?'tip_merge':'tip';assert.equal(meshes.length,8);
  const order=['base','middle','frustum',end];
  meshes.forEach((m,i)=>{const k=Math.floor(i/2);assert.equal(m.material.path,prefix+'sulfur_spike_'+direction+'_'+order[k]);assert.equal(m.y,up?-.75+k*.5:.75-k*.5);assert.equal(m.geometry.h,.5);assert.equal(m.geometry.w,Math.SQRT2*.5);assert.equal(m.rotation.y,i%2?Math.PI/2:0)});
 }
});
test('pointed dripstone and other models still delegate unchanged',()=>{
 const {ctx,fallbacks}=setup();ctx.FKShapes.build({cur:'pointed_dripstone'});ctx.FKShapes.build({cur:'bamboo_fence'});assert.equal(fallbacks(),2);assert.equal(ctx.FKShapes.view('pointed_dripstone'),1.4);assert.equal(ctx.FKShapes.view('sulfur_spike'),1.4);assert.equal(ctx.FKShapes.view('pale_hanging_moss'),1.4);assert.equal(ctx.FKShapes.view('stone'),1);
});
test('missing texture inventory fails rather than inventing a PNG path',()=>{
 const {ctx,raw,existing}=setup();delete existing[prefix+'pale_hanging_moss_tip'];assert.throws(()=>ctx.FKCatalog.index(raw,existing),/Missing segmented texture/);
});
