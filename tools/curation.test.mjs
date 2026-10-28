import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../fk-curation.js',import.meta.url),'utf8');
const KEYS=['up','down','north','south','east','west'];
function setup(ids,extraB){
 const b=Object.fromEntries(ids.map(id=>[id,Array(6).fill('textures/blocks/'+id)]));Object.assign(b,extraB||{});let fallback=0;
 class G{constructor(){this.children=[];this.position={set:()=>{}};this.rotation={x:0,y:0,z:0}}add(c){this.children.push(c)}}
 const ctx={FKCatalog:{index:()=>({b:{...b},sp:{},cr:{},ids:Object.keys(b),sig:{},members:{},mother:{},hidden:0})},FKShapes:{build(){fallback++},view:id=>id==='pointed_dripstone'?1.4:1},
 THREE:{DoubleSide:2,Group:G,PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.uv=[[0,1],[1,1],[0,0],[1,0]];this.coords=[];const s=this;this.attributes={uv:{count:4,getX:i=>s.uv[i][0],getY:i=>s.uv[i][1],setXY:(i,u,v)=>{s.coords[i]=[u,v]}}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set:(x,y,z)=>{this.x=x;this.y=y;this.z=z}};this.rotation={x:0,y:0,set:(x,y)=>{this.rotation.x=x;this.rotation.y=y}}}}}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,fallbacks:()=>fallback};
}
function render(ctx,cur,fm,slot){const mats={};Object.values(fm).forEach(p=>{mats[p]={path:p}});const root=new ctx.THREE.Group();ctx.FKShapes.build({cur,slot:slot||fm.up,faceMap:fm,mats,hiddenMat:{},group:root});return root}
function flat(root){const out=[];(function walk(n){n.children.forEach(c=>{if(c.children)walk(c);else out.push(c)})})(root);return out}
const fmOf=id=>Object.fromEntries(KEYS.map(k=>[k,'t_'+id+'_'+k]));
const P='textures/blocks/';
test('leftover forms, duplicate lit ores and all coral wall fans leave the catalog',()=>{
 const wall=['horn','brain','bubble','fire','tube'].flatMap(k=>[k+'_coral_wall_fan','dead_'+k+'_coral_wall_fan']),keep=['stone','horn_coral_fan','bamboo_fence','dead_tube_coral_fan','redstone_ore','deepslate_redstone_ore'];
 const {ctx}=setup(wall.concat(['normal_stone_slab','petrified_oak_slab','lit_redstone_ore','lit_deepslate_redstone_ore']).concat(keep)),cat=ctx.FKCatalog.index({},{});
 assert.deepEqual(cat.ids.slice().sort(),keep.slice().sort());assert.equal(cat.hidden,14);
});
test('redstone lamp and redstone torch are one block with two textures',()=>{
 const {ctx}=setup(['redstone_lamp','lit_redstone_lamp','redstone_torch','unlit_redstone_torch']),cat=ctx.FKCatalog.index({},{});
 assert.deepEqual(cat.ids.slice().sort(),['redstone_lamp','redstone_torch']);
 let fm=cat.sp.redstone_lamp.fm;assert.notEqual(flat(render(ctx,'redstone_lamp',fm,fm.west))[0].material.path,flat(render(ctx,'redstone_lamp',fm,fm.up))[0].material.path);
 fm=cat.sp.redstone_torch.fm;const lit=flat(render(ctx,'redstone_torch',fm,fm.up)),unlit=flat(render(ctx,'redstone_torch',fm,fm.west));
 assert.equal(lit.length,6);assert.ok(lit.every(m=>m.material.path===P+'redstone_torch'));assert.ok(unlit.every(m=>m.material.path===P+'unlit_redstone_torch'));
});
test('pitcher crop: mature stage by default, stage slots, bud slots show only the pitcher body, no overlap',()=>{
 const extra=['bottom_stage_1','bottom_stage_2','bottom_stage_3','bottom_stage_4','top_stage_3','top_stage_4'].map(n=>P+'pitcher_crop_'+n),all=extra.concat([P+'pitcher_crop_top',P+'pitcher_crop_bottom',P+'pitcher_crop_side']);
 const b={pitcher_crop:[P+'pitcher_crop_top',P+'pitcher_crop_bottom',P+'pitcher_crop_side',extra[0],extra[4],extra[4]]},existing=Object.fromEntries(all.map(p=>[p,1]));
 const {ctx}=setup([],b),cat=ctx.FKCatalog.index({extra:{pitcher_crop:extra}},existing),sp=cat.sp.pitcher_crop;
 assert.equal(sp.list.length,9);assert.equal(sp.list[0].id,P+'pitcher_crop_bottom_stage_4');assert.equal(sp.fm.up,P+'pitcher_crop_bottom_stage_4');
 const full=flat(render(ctx,'pitcher_crop',sp.fm,sp.fm.up));assert.equal(full.length,4);
 assert.deepEqual(Array.from(full,m=>m.y),[-.5,-.5,.5,.5]);
 assert.deepEqual(Array.from(full,m=>m.material.path).filter((p,i)=>i%2===0),[P+'pitcher_crop_bottom_stage_4',P+'pitcher_crop_top_stage_4']);
 const bud=flat(render(ctx,'pitcher_crop',sp.fm,P+'pitcher_crop_side'));assert.equal(bud.length,6);assert.ok(bud.every(m=>m.material.path.indexOf('stage')<0));
 const s1=flat(render(ctx,'pitcher_crop',sp.fm,P+'pitcher_crop_bottom_stage_1'));assert.equal(s1.length,8);
 const s3=flat(render(ctx,'pitcher_crop',sp.fm,P+'pitcher_crop_top_stage_3')),p3=Array.from(s3,m=>m.material.path);
 assert.equal(s3.length,4);assert.ok(p3.includes(P+'pitcher_crop_bottom_stage_3')&&p3.includes(P+'pitcher_crop_top_stage_3'));
});
test('pitcher plant planes do not overlap',()=>{
 const {ctx}=setup(['pitcher_plant']),pl=flat(render(ctx,'pitcher_plant',fmOf('p')));assert.deepEqual(Array.from(pl,x=>x.y),[-.5,-.5,.5,.5]);
 assert.equal(ctx.FKShapes.view('pitcher_plant'),1.4);assert.equal(ctx.FKShapes.view('pitcher_crop'),1.4);assert.equal(ctx.FKShapes.view('stone'),1);
});
test('jack o\'lantern is merged into the carved pumpkin with the lit face as a slot',()=>{
 const extra=[P+'pumpkin_face_off',P+'pumpkin_face_on',P+'pumpkin_side',P+'pumpkin_top'],existing=Object.fromEntries(extra.map(p=>[p,1]));
 const b={carved_pumpkin:[P+'pumpkin_top',P+'pumpkin_top',P+'pumpkin_side',P+'pumpkin_face_off',P+'pumpkin_side',P+'pumpkin_side'],lit_pumpkin:[P+'pumpkin_top',P+'pumpkin_top',P+'pumpkin_side',P+'pumpkin_face_off',P+'pumpkin_side',P+'pumpkin_side']};
 const {ctx}=setup([],b),cat=ctx.FKCatalog.index({extra:{lit_pumpkin:extra,carved_pumpkin:extra}},existing);
 assert.deepEqual(cat.ids,['carved_pumpkin']);const sp=cat.sp.carved_pumpkin;assert.equal(sp.list.length,4);assert.equal(sp.fm.on,P+'pumpkin_face_on');
 const off=flat(render(ctx,'carved_pumpkin',sp.fm,sp.fm.south)),on=flat(render(ctx,'carved_pumpkin',sp.fm,sp.fm.on));
 assert.equal(off.length,6);assert.ok(off.some(m=>m.material.path===P+'pumpkin_face_off'));assert.ok(!off.some(m=>m.material.path===P+'pumpkin_face_on'));
 assert.ok(on.some(m=>m.material.path===P+'pumpkin_face_on'));assert.ok(!on.some(m=>m.material.path===P+'pumpkin_face_off'));
});
test('repeaters and comparators are merged into 2 px slabs with state textures',()=>{
 const floor=P+'stone_slab_top',rep=[floor,P+'repeater_off',P+'repeater_on'],cmp=[P+'comparator_stone_slab',P+'comparator_off',P+'comparator_on',P+'comparator_subtract_on'];
 const all=rep.concat(cmp),existing=Object.fromEntries(all.map(p=>[p,1]));
 const mk=(f,u)=>[u,f,f,f,f,f];
 const b={unpowered_repeater:mk(floor,P+'repeater_off'),powered_repeater:mk(floor,P+'repeater_off'),unpowered_comparator:mk(cmp[0],P+'comparator_off'),powered_comparator:mk(cmp[0],P+'comparator_off')};
 const {ctx}=setup([],b),cat=ctx.FKCatalog.index({extra:{unpowered_repeater:rep,powered_repeater:rep,unpowered_comparator:cmp,powered_comparator:cmp}},existing);
 assert.deepEqual(cat.ids.slice().sort(),['unpowered_comparator','unpowered_repeater']);
 const r=cat.sp.unpowered_repeater;assert.deepEqual(Array.from(r.list,s=>s.id),[P+'repeater_off',P+'repeater_on',floor]);
 const on=flat(render(ctx,'unpowered_repeater',r.fm,P+'repeater_on')),off=flat(render(ctx,'unpowered_repeater',r.fm,P+'repeater_off'));
 assert.equal(on.length,6);assert.ok(on.some(m=>m.material.path===P+'repeater_on'));assert.ok(off.some(m=>m.material.path===P+'repeater_off'));
 assert.ok(on.filter(m=>Math.abs(m.geometry.h-2/16)<1e-9).length===4);
 assert.equal(cat.sp.unpowered_comparator.list.length,4);
});
test('redstone wire gets rail-style slots and renders as one flat sheet',()=>{
 const {ctx}=setup(['redstone_wire']),cat=ctx.FKCatalog.index({},{});assert.equal(cat.sp.redstone_wire.kind,'labels');
 const fm={up:P+'cross',down:P+'line',north:P+'line',south:P+'line',east:P+'line',west:P+'line'};
 for(const slot of [fm.up,fm.down]){const m=flat(render(ctx,'redstone_wire',fm,slot));assert.equal(m.length,1);assert.equal(m[0].y,0)}
});
test('dirt path 15 px, enchanting table 12 px',()=>{
 const {ctx}=setup(['grass_path','enchanting_table']);
 for(const [id,h] of [['grass_path',15],['enchanting_table',12]]){
  const m=flat(render(ctx,id,fmOf(id))),sidesM=m.filter(x=>Math.abs(x.geometry.h-h/16)<1e-9);assert.equal(m.length,6);assert.equal(sidesM.length,4);
  for(const s of sidesM){const v=s.geometry.coords.map(c=>(1-c[1])*16);assert.ok(Math.abs(Math.min(...v)-(16-h))<1e-9);assert.ok(Math.abs(Math.max(...v)-16)<1e-9)}
 }
});
test('stonecutter, sniffer egg, sea pickle, spore blossom',()=>{
 const {ctx}=setup(['stonecutter_block','sniffer_egg','sea_pickle','spore_blossom']);
 const sc=flat(render(ctx,'stonecutter_block',fmOf('s')));assert.equal(sc.length,8);assert.equal(sc.filter(x=>Math.abs(x.geometry.w-14/16)<1e-9&&Math.abs(x.geometry.h-7/16)<1e-9).length,2);
 const egg=flat(render(ctx,'sniffer_egg',fmOf('e')));assert.equal(egg.length,6);assert.ok(egg.some(x=>Math.abs(x.geometry.w-14/16)<1e-9&&Math.abs(x.geometry.h-1)<1e-9));
 assert.equal(flat(render(ctx,'sea_pickle',fmOf('p'))).length,8);
 const root=render(ctx,'spore_blossom',fmOf('b')),groups=root.children.filter(c=>c.children);assert.equal(groups.length,4);assert.equal(root.children.length,5);
});
test('sunflower head is turned 45 degrees between the stem planes',()=>{
 const {ctx}=setup(['sunflower']),root=render(ctx,'sunflower',fmOf('s')),outer=root.children.find(c=>c.children);
 assert.ok(Math.abs(outer.rotation.y+Math.PI/4)<1e-9);
 const stems=root.children.filter(c=>!c.children).map(m=>m.rotation.y);assert.ok(stems.includes(0)&&stems.some(a=>Math.abs(a-Math.PI/2)<1e-9));
});
test('other models and item sprites delegate unchanged',()=>{
 const {ctx,fallbacks}=setup(['stone']);ctx.FKShapes.build({cur:'stone'});ctx.FKShapes.build({cur:'sunflower',slot:'textures/items/x'});assert.equal(fallbacks(),2);
});
