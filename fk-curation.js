/* Catalog curation and exact block models. Load after fk-strands.js. */
(function(){
'use strict';
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,oldView=H.view,Q=Math.PI/2;
var HIDDEN=['normal_stone_slab','normal_stone_stairs','petrified_oak_slab','stone_stairs','wooden_button','wooden_pressure_plate','end_stone_brick_slab','end_stone_brick_wall','heavy_weighted_pressure_plate','light_weighted_pressure_plate','prismarine_stairs','lit_redstone_ore','lit_deepslate_redstone_ore'];
var TALL=['pitcher_plant','pitcher_crop'];
/* Every coral wall fan repeats its coral fan (same texture), so the whole class is hidden. */
function isHidden(id){return HIDDEN.indexOf(id)>=0||/_coral_wall_fan$/.test(id)}
function drop(cat,id){
 var sg=cat.sig&&cat.sig[id];
 if(sg&&cat.members&&cat.members[sg]){cat.members[sg]=cat.members[sg].filter(function(x){return x!==id});if(!cat.members[sg].length)delete cat.members[sg]}
 delete cat.b[id];if(cat.sp)delete cat.sp[id];if(cat.cr)delete cat.cr[id];if(cat.sig)delete cat.sig[id];if(cat.mother)delete cat.mother[id];
 cat.ids=cat.ids.filter(function(x){return x!==id});
}
function resign(cat){
 cat.sig={};cat.members={};cat.mother={};
 cat.ids.forEach(function(id){var sg=cat.b[id].join('|');cat.sig[id]=sg;(cat.members[sg]=cat.members[sg]||[]).push(id);cat.mother[id]=id});
}
function named(paths,name){return paths.filter(function(p){return p.split('/').pop()===name})[0]}
C.index=function(c,existing){
 var cat=oldIndex(c,existing),removed=0;
 var icon=function(path){return path&&(!existing||existing[path])?path:null};
 Object.keys(cat.b).filter(isHidden).forEach(function(id){drop(cat,id);removed++});
 /* Redstone lamp: one block, off and on are two textures of it. */
 var off=cat.b.redstone_lamp,on=cat.b.lit_redstone_lamp;
 if(off&&on){
  cat.sp.redstone_lamp={kind:'details',list:[{id:off[0]},{id:on[0]}],fm:{up:off[0],down:off[1],north:off[2],south:off[3],east:off[4],west:on[0]}};
  cat.b.redstone_lamp=[off[0],off[1],off[2],off[3],off[4],on[0]];
  drop(cat,'lit_redstone_lamp');removed++;
 }
 /* Redstone torch: one block, the unlit torch is its second texture. */
 var tOn=cat.b.redstone_torch,tOff=cat.b.unlit_redstone_torch;
 if(tOn&&tOff){
  cat.sp.redstone_torch={kind:'lights',list:[{id:tOn[0],t:'torch'},{id:tOff[0],t:'unlit'}],fm:{up:tOn[0],down:tOn[1],north:tOn[2],south:tOn[3],east:tOn[4],west:tOff[0]}};
  cat.b.redstone_torch=[tOn[0],tOn[1],tOn[2],tOn[3],tOn[4],tOff[0]];
  drop(cat,'unlit_redstone_torch');removed++;
 }
 /* Pitcher plant: the crop and the grown plant are one flower. Its growth stages and the bud textures are texture slots of one block. */
 var pc=cat.b.pitcher_crop,pl=cat.b.pitcher_plant;
 if(pc&&pl){
  var paths=(c.extra&&c.extra.pitcher_crop)||[],fm={up:pl[0],down:pl[1],north:pc[2],south:pc[3],east:pc[4],west:pc[5],pt:pc[0],pb:pc[1],ps:pc[2]},list=[],seenP={};
  var add=function(p,key){if(!p||(existing&&!existing[p]))return;if(key)fm[key]=p;if(!seenP[p]){seenP[p]=1;list.push({id:p})}};
  add(named(paths,'pitcher_crop_bottom_stage_4')||pl[1],'b4');add(named(paths,'pitcher_crop_top_stage_4')||pl[0],'t4');
  add(named(paths,'pitcher_crop_bottom_stage_3'),'b3');add(named(paths,'pitcher_crop_top_stage_3'),'t3');
  add(named(paths,'pitcher_crop_bottom_stage_2'),'b2');add(named(paths,'pitcher_crop_bottom_stage_1'),'b1');
  add(pc[0]);add(pc[1]);add(pc[2]);
  var pod=icon('textures/items/pitcher_pod');if(pod){list.push({id:pod});fm.icon=pod}
  cat.sp.pitcher_plant={kind:'segmented',list:list,fm:fm};
  drop(cat,'pitcher_crop');removed++;
 }
 /* Jack o'lantern: the carved pumpkin with the lit face as its second texture. */
 var cp=cat.b.carved_pumpkin;
 if(cp&&cat.b.lit_pumpkin){
  var onFace=named((c.extra&&(c.extra.lit_pumpkin||c.extra.carved_pumpkin))||[],'pumpkin_face_on');
  if(onFace&&(!existing||existing[onFace])){
   cat.sp.carved_pumpkin={kind:'details',list:[{id:cp[3]},{id:onFace},{id:cp[0]},{id:cp[2]}],fm:{up:cp[0],down:cp[1],north:cp[2],south:cp[3],east:cp[4],west:cp[5],on:onFace}};
   drop(cat,'lit_pumpkin');removed++;
  }
 }
 /* Repeaters and comparators: one block each, the powered and unpowered tops are texture slots of a 2 px slab; the item picture is the last slot. */
 [['unpowered_repeater','powered_repeater','repeater'],['unpowered_comparator','powered_comparator','comparator']].forEach(function(pair){
  var a=cat.b[pair[0]];if(!a)return;
  var floor=a[1],tops=((c.extra&&c.extra[pair[0]])||[]).filter(function(p){return p!==floor&&(!existing||existing[p])});
  if(!tops.length)return;
  var fmS={up:tops[0],down:floor,north:floor,south:floor,east:floor,west:floor},lst=tops.map(function(p){return {id:p}});
  tops.forEach(function(p,i){fmS['t'+i]=p});lst.push({id:floor});
  var ic=icon('textures/items/'+pair[2]);if(ic){lst.push({id:ic});fmS.icon=ic}
  cat.sp[pair[0]]={kind:'details',list:lst,fm:fmS};
  cat.b[pair[0]]=[tops[0],floor,floor,floor,floor,floor];
  if(cat.b[pair[1]]){drop(cat,pair[1]);removed++}
 });
 resign(cat);
 /* Redstone wire: a flat sheet like the rails, texture slots for the cross and the line. */
 var rw=cat.b.redstone_wire;
 if(rw&&!cat.sp.redstone_wire){
  var wl=[],seen={};
  [rw[0],rw[1]].forEach(function(p){if(!seen[p]){seen[p]=1;wl.push({id:p,label:''})}});
  var tk=wl.map(function(s){return s.id.split('/').pop().split('_')}),com=tk[0].filter(function(w){return tk.every(function(x){return x.indexOf(w)>=0})});
  wl.forEach(function(s,i){var r=tk[i].filter(function(w){return com.indexOf(w)<0});s.label=(r.length?r:[tk[i][tk[i].length-1]]).join(' ')});
  cat.sp.redstone_wire={kind:'labels',list:wl,fm:{up:rw[0],down:rw[1],north:rw[2],south:rw[3],east:rw[4],west:rw[5]}};
 }
 cat.hidden=(cat.hidden||0)+removed;
 return cat;
};
function face(E,id,w,h,x,y,z,rx,ry,r,dbl){
 var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
 if(dbl){mat.side=THREE.DoubleSide;mat.needsUpdate=true}
 r=r||[0,0,16,16];var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,k=r[4]||0;
 for(var i=0;i<uv.count;i++){
  var a=uv.getX(i),b=1-uv.getY(i),s=a,t=b;
  if(k===90){s=b;t=1-a}else if(k===180){s=1-a;t=1-b}else if(k===270){s=1-b;t=a}
  uv.setXY(i,(r[0]+s*(r[2]-r[0]))/16,1-(r[1]+t*(r[3]-r[1]))/16);
 }
 var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function box(E,a,b,F,R){
 var w=(b[0]-a[0])/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])/16,x=(a[0]+b[0]-16)/32,y=(a[1]+b[1]-16)/32,z=(a[2]+b[2]-16)/32;
 var p={north:[w,h,x,y,(a[2]-8)/16,0,Math.PI],south:[w,h,x,y,(b[2]-8)/16,0,0],east:[d,h,(b[0]-8)/16,y,z,0,Q],west:[d,h,(a[0]-8)/16,y,z,0,-Q],up:[w,d,x,(b[1]-8)/16,z,-Q,0],down:[w,d,x,(a[1]-8)/16,z,Q,0]};
 Object.keys(F).forEach(function(k){face.apply(null,[E,F[k]].concat(p[k],[R[k]]))});
}
function cross(E,id,h,y,r){if(!id)return;face(E,id,Math.SQRT2,h,0,y,0,0,0,r,true);face(E,id,Math.SQRT2,h,0,y,0,0,Q,r,true)}
function sides(f,top,height){
 var F={up:f.up,down:f.down,north:f.north,south:f.south,east:f.east,west:f.west},cut=[0,16-height,16,16];
 return {F:F,R:{up:top,down:[0,0,16,16],north:cut,south:cut,east:cut,west:cut}};
}
function six(id){return {up:id,down:id,north:id,south:id,east:id,west:id}}
/* Dirt path: 15/16 high, the side image starts one pixel down (Java dirt_path model as geometry reference). */
function dirtPath(E){var s=sides(E.faceMap,[0,0,16,16],15);box(E,[0,0,0],[16,15,16],s.F,s.R)}
/* Enchanting table: 12/16 high (Java enchanting_table model as geometry reference). */
function enchantingTable(E){var s=sides(E.faceMap,[0,0,16,16],12);box(E,[0,0,0],[16,12,16],s.F,s.R)}
/* Redstone lamp: one cube; the second texture slot shows the lit state. */
function lamp(E){var f=E.faceMap,id=E.slot===f.west?f.west:f.up;box(E,[0,0,0],[16,16,16],six(id),{up:[0,0,16,16],down:[0,0,16,16],north:[0,0,16,16],south:[0,0,16,16],east:[0,0,16,16],west:[0,0,16,16]})}
/* Redstone torch: the same 2x10x2 post as the other torches; the second slot shows the unlit torch. */
function redstoneTorch(E){var f=E.faceMap,id=E.slot===f.west?f.west:f.up,s=[7,6,9,16];box(E,[7,0,7],[9,10,9],six(id),{north:s,south:s,east:s,west:s,up:[7,6,9,8],down:[7,13,9,15]})}
/* Redstone wire: a flat sheet on the floor, the same construction as the rails. */
function wire(E){var f=E.faceMap,id=E.slot===f.up?f.up:f.down;face(E,id,1,1,0,0,0,-Q,0,null,true)}
/* Stonecutter: Java model as geometry reference (16x9x16 base, 14x7 saw plane in the middle). */
function stonecutter(E){
 var f=E.faceMap,side=[0,7,16,16];
 box(E,[0,0,0],[16,9,16],{up:f.up,down:f.down,north:f.north,south:f.south,east:f.north,west:f.north},{up:[0,0,16,16],down:[0,0,16,16],north:side,south:side,east:side,west:side});
 face(E,f.east,14/16,7/16,0,(12.5-8)/16,0,0,Math.PI,[1,9,15,16]);
 face(E,f.east,14/16,7/16,0,(12.5-8)/16,0,0,0,[15,9,1,16]);
}
/* Sniffer egg: 14x16x12 box (Java sniffer_egg model as geometry reference). */
function snifferEgg(E){
 var f=E.faceMap;
 box(E,[1,0,2],[15,16,14],{up:f.up,down:f.down,north:f.north,south:f.south,east:f.east,west:f.west},{up:[0,0,14,12],down:[0,0,14,12],north:[0,0,14,16],south:[0,0,14,16],east:[0,0,12,16],west:[0,0,12,16]});
}
/* Sea pickle: one pickle, a 4x6x4 body and two leaf planes (Java sea_pickle model as geometry reference). */
function seaPickle(E){
 var id=E.faceMap.up;
 box(E,[6,0,6],[10,6,10],six(id),{down:[8,1,12,5],up:[4,1,8,5],north:[4,5,8,11],south:[0,5,4,11],west:[8,5,12,11],east:[12,5,16,11]});
 var s=Math.SQRT2/16,y=(6.95-8)/16;
 face(E,id,s,3.5/16,0,y,0,0,Math.PI/4,[1,0,3,5],true);
 face(E,id,s,3.5/16,0,y,0,0,-Math.PI/4,[13,0,15,5],true);
}
/* Spore blossom: base sheet at the ceiling and four petals that droop by 22.5 degrees (Java spore_blossom model). */
function sporeBlossom(E){
 var f=E.faceMap;
 face(E,f.up,14/16,14/16,0,(15.9-8)/16,0,-Q,0,[1,1,15,15],true);
 [0,Q,Math.PI,-Q].forEach(function(angle){
  var outer=new THREE.Group(),inner=new THREE.Group(),e=Object.create(E);
  e.group=inner;face(e,f.down,1,1,.5,-.01875,0,-Q,0,[0,0,16,16,90],true);
  inner.rotation.z=-Math.PI/8;outer.rotation.y=angle;outer.position.set(0,.5,0);outer.add(inner);E.group.add(outer);
 });
}
/* Pitcher plant, built from the Java pitcher_crop models in one frame: the lower block spans y -1..0, the upper block 0..1 (world units), so a pixel p of the lower block is at world -1+p/16.
   The pitcher body is 10x6x10 from pixel -1 to 5 of the lower block. Stages 1 and 2: one cross of planes from pixel 5 to 21, standing on top of the body. Stages 3 and 4: a cross from pixel 0 to 16 in the lower block (the body is inside its base, as in the model) and a second cross from 16 to 32 in the upper block. A bud texture (top, bottom, side) shows the body alone. */
function pitcherPlant(E){
 var f=E.faceMap,m=/_stage_(\d)$/.exec(E.slot||''),n=m?+m[1]:4,side=[3,10,13,16],pt=f.pt||f.up,pb=f.pb||f.down,ps=f.ps||f.north;
 box(E,[3,-9,3],[13,-3,13],{up:pt,down:pb,north:ps,south:ps,east:ps,west:ps},{up:[3,3,13,13],down:[3,3,13,13],north:side,south:side,east:side,west:side});
 if(E.slot===f.pt||E.slot===f.pb||E.slot===f.ps)return;
 cross(E,f['b'+n]||(n===4?f.down:null),1,n<=2?-.1875:-.5);
 if(n>=3)cross(E,f['t'+n]||(n===4?f.up:null),1,.5);
}
/* Jack o'lantern: a pumpkin cube; the second slot shows the lit face. */
function pumpkin(E){var f=E.faceMap,lit=E.slot===f.on?f.on:f.south,full=[0,0,16,16];box(E,[0,0,0],[16,16,16],{up:f.up,down:f.down,north:f.north,south:lit,east:f.east,west:f.west},{up:full,down:full,north:full,south:full,east:full,west:full})}
/* Repeater and comparator: a 2 px slab; the selected top texture shows the powered or unpowered state. */
function slab(E){
 var f=E.faceMap,id=f.up,i,full=[0,0,16,16],edge=[0,14,16,16];
 for(i=0;i<8&&f['t'+i];i++)if(E.slot===f['t'+i])id=f['t'+i];
 box(E,[0,0,0],[16,2,16],{up:id,down:f.down,north:f.down,south:f.down,east:f.down,west:f.down},{up:full,down:full,north:edge,south:edge,east:edge,west:edge});
}
/* Sunflower: the stem crosses stay on the block axes, the head plane is turned 45 degrees so it stands between them. */
function sunflower(E){
 var f=E.faceMap,s=1/Math.cos(Math.PI/8);
 cross(E,f.down,1,-.5);cross(E,f.up,.5,.25,[0,8,16,16]);
 var outer=new THREE.Group(),g=new THREE.Group(),e=Object.create(E);e.group=g;
 face(e,f.north,14/16,s,.1*s,-s/16,0,0,Q);
 face(e,f.south,14/16,s,.1*s,-s/16,0,0,-Q);
 g.position.set(0,.5,0);g.rotation.z=Math.PI/8;outer.rotation.y=-Math.PI/4;outer.add(g);E.group.add(outer);
}
var MODELS={grass_path:dirtPath,enchanting_table:enchantingTable,redstone_lamp:lamp,redstone_torch:redstoneTorch,redstone_wire:wire,stonecutter_block:stonecutter,sniffer_egg:snifferEgg,sea_pickle:seaPickle,spore_blossom:sporeBlossom,pitcher_plant:pitcherPlant,carved_pumpkin:pumpkin,unpowered_repeater:slab,unpowered_comparator:slab,sunflower:sunflower};
H.build=function(E){
 if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
 if(Object.prototype.hasOwnProperty.call(MODELS,E.cur))return MODELS[E.cur](E);
 return oldBuild(E);
};
H.view=function(id){return oldView(TALL.indexOf(id)>=0?'pointed_dripstone':id)};
})();
