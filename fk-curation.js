/* Catalog curation and exact block models. Load after fk-strands.js. */
(function(){
'use strict';
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,oldView=H.view,Q=Math.PI/2;
var HIDDEN=['normal_stone_slab','normal_stone_stairs','petrified_oak_slab','stone_stairs','wooden_button','wooden_pressure_plate','end_stone_brick_slab','end_stone_brick_wall','heavy_weighted_pressure_plate','light_weighted_pressure_plate','prismarine_stairs'];
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
C.index=function(c,existing){
 var cat=oldIndex(c,existing),removed=0;
 Object.keys(cat.b).filter(isHidden).forEach(function(id){drop(cat,id);removed++});
 /* Redstone lamp: one block, off and on are two textures of it. */
 var off=cat.b.redstone_lamp,on=cat.b.lit_redstone_lamp;
 if(off&&on){
  cat.sp.redstone_lamp={kind:'details',list:[{id:off[0]},{id:on[0]}],fm:{up:off[0],down:off[1],north:off[2],south:off[3],east:off[4],west:on[0]}};
  cat.b.redstone_lamp=[off[0],off[1],off[2],off[3],off[4],on[0]];
  drop(cat,'lit_redstone_lamp');removed++;resign(cat);
 }
 /* Redstone wire: a flat sheet like the rails, texture slots for the cross and the line. */
 var rw=cat.b.redstone_wire;
 if(rw&&!cat.sp.redstone_wire){
  var list=[],seen={};
  [rw[0],rw[1]].forEach(function(p){if(!seen[p]){seen[p]=1;list.push({id:p,label:''})}});
  var tk=list.map(function(s){return s.id.split('/').pop().split('_')}),com=tk[0].filter(function(w){return tk.every(function(x){return x.indexOf(w)>=0})});
  list.forEach(function(s,i){var r=tk[i].filter(function(w){return com.indexOf(w)<0});s.label=(r.length?r:[tk[i][tk[i].length-1]]).join(' ')});
  cat.sp.redstone_wire={kind:'labels',list:list,fm:{up:rw[0],down:rw[1],north:rw[2],south:rw[3],east:rw[4],west:rw[5]}};
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
function cross(E,id,h,y,r){face(E,id,Math.SQRT2,h,0,y,0,0,0,r,true);face(E,id,Math.SQRT2,h,0,y,0,0,Q,r,true)}
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
/* Pitcher plant: two blocks high; the top plane sits 5 px lower than the block (Java pitcher_plant_top). */
function pitcherPlant(E){var f=E.faceMap;cross(E,f.down,1,-.5);cross(E,f.up,1,.1875)}
/* Pitcher crop: the pitcher body in the ground and the grown lower and upper planes (Java pitcher_crop models). */
function pitcherCrop(E){
 var f=E.faceMap,side=[3,10,13,16];
 box(E,[3,-1,3],[13,5,13],{up:f.up,down:f.down,north:f.north,south:f.north,east:f.north,west:f.north},{up:[3,3,13,13],down:[3,3,13,13],north:side,south:side,east:side,west:side});
 cross(E,f.south,1,-.5);cross(E,f.east,1,.1875);
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
var MODELS={grass_path:dirtPath,enchanting_table:enchantingTable,redstone_lamp:lamp,redstone_wire:wire,stonecutter_block:stonecutter,sniffer_egg:snifferEgg,sea_pickle:seaPickle,spore_blossom:sporeBlossom,pitcher_plant:pitcherPlant,pitcher_crop:pitcherCrop,sunflower:sunflower};
H.build=function(E){
 if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
 if(Object.prototype.hasOwnProperty.call(MODELS,E.cur))return MODELS[E.cur](E);
 return oldBuild(E);
};
H.view=function(id){return oldView(TALL.indexOf(id)>=0?'pointed_dripstone':id)};
})();
