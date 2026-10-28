/* Catalog curation and two exact block models. Load after fk-strands.js. */
(function(){
'use strict';
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,Q=Math.PI/2;
var HIDDEN=['horn_coral_wall_fan','normal_stone_slab','normal_stone_stairs','petrified_oak_slab','stone_stairs','wooden_button','wooden_pressure_plate','end_stone_brick_slab','end_stone_brick_wall','heavy_weighted_pressure_plate','light_weighted_pressure_plate','prismarine_stairs'];
C.index=function(c,existing){
 var cat=oldIndex(c,existing),removed=0;
 HIDDEN.forEach(function(id){
  if(!cat.b[id])return;
  var sg=cat.sig&&cat.sig[id];
  if(sg&&cat.members&&cat.members[sg]){cat.members[sg]=cat.members[sg].filter(function(x){return x!==id});if(!cat.members[sg].length)delete cat.members[sg]}
  delete cat.b[id];if(cat.sp)delete cat.sp[id];if(cat.cr)delete cat.cr[id];if(cat.sig)delete cat.sig[id];if(cat.mother)delete cat.mother[id];
  cat.ids=cat.ids.filter(function(x){return x!==id});removed++;
 });
 cat.hidden=(cat.hidden||0)+removed;
 return cat;
};
function face(E,id,w,h,x,y,z,rx,ry,r){
 var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
 var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
 for(var i=0;i<uv.count;i++){var a=uv.getX(i),b=1-uv.getY(i);uv.setXY(i,(r[0]+a*(r[2]-r[0]))/16,1-(r[1]+b*(r[3]-r[1]))/16)}
 var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function box(E,a,b,F,R){
 var w=(b[0]-a[0])/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])/16,x=(a[0]+b[0]-16)/32,y=(a[1]+b[1]-16)/32,z=(a[2]+b[2]-16)/32;
 var p={north:[w,h,x,y,(a[2]-8)/16,0,Math.PI],south:[w,h,x,y,(b[2]-8)/16,0,0],east:[d,h,(b[0]-8)/16,y,z,0,Q],west:[d,h,(a[0]-8)/16,y,z,0,-Q],up:[w,d,x,(b[1]-8)/16,z,-Q,0],down:[w,d,x,(a[1]-8)/16,z,Q,0]};
 Object.keys(F).forEach(function(k){face.apply(null,[E,F[k]].concat(p[k],[R[k]]))});
}
function sides(f,top,height){
 var F={up:f.up,down:f.down,north:f.north,south:f.south,east:f.east,west:f.west},cut=[0,16-height,16,16];
 return {F:F,R:{up:top,down:[0,0,16,16],north:cut,south:cut,east:cut,west:cut}};
}
/* Dirt path: 15/16 high, the side image starts one pixel down (Java dirt_path model as geometry reference). */
function dirtPath(E){var s=sides(E.faceMap,[0,0,16,16],15);box(E,[0,0,0],[16,15,16],s.F,s.R)}
/* Enchanting table: 12/16 high (Java enchanting_table model as geometry reference). */
function enchantingTable(E){var s=sides(E.faceMap,[0,0,16,16],12);box(E,[0,0,0],[16,12,16],s.F,s.R)}
H.build=function(E){
 if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
 if(E.cur==='grass_path')return dirtPath(E);
 if(E.cur==='enchanting_table')return enchantingTable(E);
 return oldBuild(E);
};
H.hiddenIds=HIDDEN.slice();
})();
