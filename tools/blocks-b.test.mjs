import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../fk-blocks-b.js',import.meta.url),'utf8');
const KEYS=['up','down','north','south','east','west'],P='textures/blocks/';
function setup(b,extra,existingList){
 let fallback=0;
 class G{constructor(){this.children=[];this.position={set:()=>{}};this.rotation={x:0,y:0,z:0}}add(c){this.children.push(c)}}
 const ctx={FKCatalog:{index:()=>({b:{...b},sp:{},cr:{},ids:Object.keys(b),sig:{},members:{},mother:{},hidden:0})},FKShapes:{build(){fallback++},view:id=>id==='pointed_dripstone'?1.4:1,flat:id=>id==='end_portal'||id==='end_gateway'},
 THREE:{DoubleSide:2,Group:G,PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.uv=[[0,1],[1,1],[0,0],[1,0]];this.coords=[];const s=this;this.attributes={uv:{count:4,getX:i=>s.uv[i][0],getY:i=>s.uv[i][1],setXY:(i,u,v)=>{s.coords[i]=[u,v]}}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set:(x,y,z)=>{this.x=x;this.y=y;this.z=z}};this.rotation={x:0,y:0,set:(x,y)=>{this.rotation.x=x;this.rotation.y=y}}}}}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
 const existing=existingList?Object.fromEntries(existingList.map(p=>[p,1])):undefined;
 return {ctx,cat:ctx.FKCatalog.index({extra},existing),fallbacks:()=>fallback};
}
function render(ctx,cur,fm,slot){const mats={};Object.values(fm).forEach(p=>{mats[p]={path:p}});const root=new ctx.THREE.Group();ctx.FKShapes.build({cur,slot:slot||fm.up,faceMap:fm,mats,hiddenMat:{},group:root});return root}
function flat(root){const out=[];(function walk(n){n.children.forEach(c=>{if(c.children)walk(c);else out.push(c)})})(root);return out}
const six=p=>[p,p,p,p,p,p];
test('pistons: head is the main picture, the hole texture selects the extended piston',()=>{
 const inner=P+'piston_inner',bottom=P+'piston_bottom',side=P+'piston_side',head=P+'piston_top_normal',sticky=P+'piston_top_sticky';
 const {ctx,cat}=setup({piston:[inner,bottom,side,side,side,side],sticky_piston:[inner,bottom,side,side,side,side]},{},[inner,bottom,side,head,sticky]);
 assert.equal(cat.sp.piston.list[0].id,head);assert.equal(cat.sp.sticky_piston.list[0].id,sticky);assert.equal(cat.sp.piston.list.length,4);
 const fm=cat.sp.piston.fm,closed=flat(render(ctx,'piston',fm,head)),open=flat(render(ctx,'piston',fm,inner));
 assert.equal(closed.length,6);assert.ok(closed.some(m=>m.material.path===head));assert.ok(!closed.some(m=>m.material.path===inner));
 assert.equal(open.length,15);assert.ok(open.some(m=>m.material.path===inner)&&open.some(m=>m.material.path===head));
 assert.ok(Math.max(...open.map(m=>m.y+m.geometry.h/2))>.5);
 assert.equal(setup({piston:[inner,bottom,side,side,side,side]},{},[inner,bottom,side]).cat.sp.piston,undefined);
});
test('wheat, carrots, potatoes, beetroot and turtle egg get a slot per stage',()=>{
 const st=n=>Array.from({length:n},(_,i)=>P+'s'+i),b={wheat:six(st(8)[0]),carrots:six(st(4)[0]),turtle_egg:six(st(3)[0])};
 const {ctx,cat}=setup(b,{wheat:st(8),carrots:st(4),turtle_egg:st(3)},st(8));
 assert.equal(cat.sp.wheat.list.length,8);assert.equal(cat.sp.carrots.list.length,4);assert.equal(cat.sp.turtle_egg.list.length,3);
 const w=flat(render(ctx,'wheat',cat.sp.wheat.fm,P+'s5'));assert.equal(w.length,4);assert.ok(w.every(m=>m.material.path===P+'s5'));
 assert.deepEqual(Array.from(w,m=>Math.abs(m.x||0)+Math.abs(m.z||0)),[.25,.25,.25,.25]);
 const egg=flat(render(ctx,'turtle_egg',cat.sp.turtle_egg.fm,P+'s2'));assert.equal(egg.length,6);assert.ok(egg.some(m=>Math.abs(m.geometry.w-4/16)<1e-9&&Math.abs(m.geometry.h-7/16)<1e-9));
 assert.ok(egg.every(m=>m.material.path===P+'s2'));
});
test('pink petals and wildflowers are a flat sheet 3 px above the floor',()=>{
 const {ctx,cat}=setup({pink_petals:six(P+'pp'),wildflowers:six(P+'wf')},{pink_petals:[P+'pp',P+'pp_stem'],wildflowers:[P+'wf',P+'wf_stem']},[P+'pp',P+'pp_stem',P+'wf',P+'wf_stem']);
 assert.equal(cat.sp.pink_petals.list.length,2);const m=flat(render(ctx,'wildflowers',cat.sp.wildflowers.fm,P+'wf_stem'));
 assert.equal(m.length,1);assert.equal(m[0].material.path,P+'wf_stem');assert.ok(Math.abs(m[0].y-(3-8)/16)<1e-9);
});
test('tripwire hook has the board, the arm and the hook; tripwire is a thin strip',()=>{
 const src=P+'trip_wire_source',base=P+'planks_oak',str=P+'trip_wire';
 const {ctx,cat}=setup({tripwire_hook:[src,base,src,str,str,str],trip_wire:six(str)},{},[src,base,str]);
 assert.equal(cat.sp.tripwire_hook.list.length,3);
 const root=render(ctx,'tripwire_hook',cat.sp.tripwire_hook.fm),groups=root.children.filter(c=>c.children),direct=root.children.filter(c=>!c.children);
 assert.equal(direct.length,6);assert.equal(groups.length,2);assert.deepEqual(Array.from(groups,g=>g.rotation.x),[Math.PI/4,-Math.PI/4]);
 assert.ok(direct.every(m=>m.material.path===base));assert.ok(groups[1].children.every(m=>m.material.path===src));
 const w=flat(render(ctx,'trip_wire',{up:str,down:str,north:str,south:str,east:str,west:str}));assert.equal(w.length,1);
 assert.ok(Math.abs(w[0].geometry.w-.5/16)<1e-9&&w[0].geometry.h===1&&Math.abs(w[0].y-(1.5-8)/16)<1e-9);
});
test('weeping and twisting vines are two blocks with the head at the growing end',()=>{
 const {ctx}=setup({},{}),fm={up:P+'base',down:P+'head',north:P+'base',south:P+'base',east:P+'base',west:P+'base'};
 const wp=flat(render(ctx,'weeping_vines',fm)),tw=flat(render(ctx,'twisting_vines',fm));
 assert.equal(wp.length,4);assert.deepEqual(Array.from(wp,m=>[m.y,m.material.path]).filter((_,i)=>i%2===0),[[-.5,P+'head'],[.5,P+'base']]);
 assert.deepEqual(Array.from(tw,m=>[m.y,m.material.path]).filter((_,i)=>i%2===0),[[.5,P+'head'],[-.5,P+'base']]);
 assert.equal(ctx.FKShapes.view('weeping_vines'),1.4);assert.equal(ctx.FKShapes.view('stone'),1);
});
test('nether portal is one flat sheet, end portal a top surface at 12 px and not a sprite',()=>{
 const {ctx}=setup({},{}),fm={up:P+'p',down:P+'p',north:P+'p',south:P+'p',east:P+'p',west:P+'p'};
 const p=flat(render(ctx,'portal',fm));assert.equal(p.length,1);assert.equal(p[0].y,0);
 const e=flat(render(ctx,'end_portal',fm));assert.equal(e.length,1);assert.ok(Math.abs(e[0].y-.25)<1e-9);
 assert.equal(ctx.FKShapes.flat('end_portal'),false);assert.equal(ctx.FKShapes.flat('end_gateway'),true);
});
test('other models and item sprites delegate unchanged',()=>{
 const {ctx,fallbacks}=setup({},{});ctx.FKShapes.build({cur:'stone'});ctx.FKShapes.build({cur:'wheat',slot:'textures/items/x'});assert.equal(fallbacks(),2);
});
