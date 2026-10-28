/* Second batch of exact block models: pistons, crops, turtle egg, petals, tripwire, vines, portals. Load after fk-curation.js. */
(function(){
'use strict';
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,oldView=H.view,oldFlat=H.flat,Q=Math.PI/2;
var CROPS=['wheat','carrots','potatoes','beetroot'],PETALS=['pink_petals','wildflowers'];
var TALL=['weeping_vines','twisting_vines','piston','sticky_piston'];
function resign(cat){
 cat.sig={};cat.members={};cat.mother={};
 cat.ids.forEach(function(id){var sg=cat.b[id].join('|');cat.sig[id]=sg;(cat.members[sg]=cat.members[sg]||[]).push(id);cat.mother[id]=id});
}
function stageMap(paths){var fm={};paths.forEach(function(p,i){fm['s'+i]=p});return fm}
function pick(f,slot){var id=f.s0,i;for(i=0;i<12&&f['s'+i];i++)if(slot===f['s'+i])id=f['s'+i];return id}
C.index=function(c,existing){
 var cat=oldIndex(c,existing);
 var ok=function(p){return p&&(!existing||existing[p])};
 var uniq=function(a){var seen={};return a.filter(function(p){if(!p||seen[p]||!ok(p))return false;seen[p]=1;return true})};
 var extra=function(id){return uniq((c.extra&&c.extra[id])||[])};
 /* Pistons: the moving head is the main picture, the texture with the hole selects the extended piston. */
 [['piston','textures/blocks/piston_top_normal'],['sticky_piston','textures/blocks/piston_top_sticky']].forEach(function(pr){
  var b=cat.b[pr[0]];if(!b||!ok(pr[1]))return;
  var head=pr[1],inner=b[0],bottom=b[1],side=b[2];
  cat.sp[pr[0]]={kind:'details',list:uniq([head,inner,side,bottom]).map(function(p){return {id:p}}),fm:{up:head,down:bottom,north:side,south:side,east:side,west:side,inner:inner}};
  cat.b[pr[0]]=[head,bottom,side,side,side,side];
 });
 /* Crops with growth stages and the turtle egg: every stage is a texture slot. */
 CROPS.concat(['turtle_egg']).forEach(function(id){
  var b=cat.b[id],ps=extra(id);if(!b||ps.length<2)return;
  var fm=stageMap(ps);['up','down','north','south','east','west'].forEach(function(k){fm[k]=ps[0]});
  cat.sp[id]={kind:'details',list:ps.map(function(p){return {id:p}}),fm:fm};
 });
 /* Petals: the flower texture and the stem texture. */
 PETALS.forEach(function(id){
  var b=cat.b[id],ps=extra(id);if(!b||!ps.length)return;
  var fm=stageMap(ps);['up','down','north','south','east','west'].forEach(function(k){fm[k]=ps[0]});
  cat.sp[id]={kind:'details',list:ps.map(function(p){return {id:p}}),fm:fm};
 });
 /* Tripwire hook: the hook, the wood of the board and the string are three textures of one block. */
 var hk=cat.b.tripwire_hook;
 if(hk){
  var parts=uniq([hk[0],hk[1],hk[3]]);
  cat.sp.tripwire_hook={kind:'details',list:parts.map(function(p){return {id:p}}),fm:{up:hk[0],down:hk[1],north:hk[0],south:hk[3],east:hk[3],west:hk[3],hook:hk[0],wood:hk[1],string:hk[3]}};
 }
 resign(cat);
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
function tilted(E,a,b,F,R,pivot,angle){
 var g=new THREE.Group(),e=Object.create(E),px=(pivot[0]-8)/16,py=(pivot[1]-8)/16,pz=(pivot[2]-8)/16;
 e.group=g;box(e,a,b,F,R);
 g.children.forEach(function(m){m.position.x-=px;m.position.y-=py;m.position.z-=pz});
 g.position.set(px,py,pz);g.rotation.x=angle;E.group.add(g);
}
function cross(E,id,h,y){if(!id)return;face(E,id,Math.SQRT2,h,0,y,0,0,0,null,true);face(E,id,Math.SQRT2,h,0,y,0,0,Q,null,true)}
function six(id){return {up:id,down:id,north:id,south:id,east:id,west:id}}
/* Piston (Java piston models as geometry reference): the retracted piston shows the head texture on top. The slot with the hole texture shows the extended piston: a 12 px body, a 4 px arm and the 4 px head plate above it. */
function piston(E){
 var f=E.faceMap,s=f.north,full=[0,0,16,16];
 if(E.slot!==f.inner){box(E,[0,0,0],[16,16,16],{up:f.up,down:f.down,north:s,south:s,east:s,west:s},{up:full,down:full,north:full,south:full,east:full,west:full});return}
 var body=[0,4,16,16],plate=[0,0,16,4],arm=[6,0,10,4];
 box(E,[0,0,0],[16,12,16],{up:f.inner,down:f.down,north:s,south:s,east:s,west:s},{up:full,down:full,north:body,south:body,east:body,west:body});
 box(E,[6,12,6],[10,16,10],{north:s,south:s,east:s,west:s},{north:arm,south:arm,east:arm,west:arm});
 box(E,[0,16,0],[16,20,16],{up:f.up,north:s,south:s,east:s,west:s},{up:full,north:plate,south:plate,east:plate,west:plate});
}
/* Crop: four planes at 4 and 12 px (Java crop model); the selected slot is the growth stage. */
function crop(E){var id=pick(E.faceMap,E.slot);[-.25,.25].forEach(function(o){face(E,id,1,1,o,0,0,0,Q,null,true);face(E,id,1,1,0,0,o,0,0,null,true)})}
/* Turtle egg: one egg 4x7x4 (Java template_turtle_egg); the slots are the three cracking stages. */
function turtleEgg(E){var id=pick(E.faceMap,E.slot),s=[1,4,5,11],t=[0,0,4,4];box(E,[5,0,4],[9,7,8],six(id),{up:t,down:t,north:s,south:s,east:s,west:s})}
/* Pink petals and wildflowers: a flat sheet 3 px above the floor (Java flowerbed models). */
function petals(E){face(E,pick(E.faceMap,E.slot),1,1,0,(3-8)/16,0,-Q,0,null,true)}
/* Tripwire hook (Java tripwire_hook model): the board, the tilted arm and the hook piece. */
function tripwireHook(E){
 var f=E.faceMap,W=f.wood||f.down,K=f.hook||f.up;
 box(E,[6,1,14],[10,9,16],six(W),{down:[6,14,10,16],up:[6,0,10,2],north:[6,7,10,15],south:[6,7,10,15],west:[0,7,2,15],east:[14,7,16,15]});
 tilted(E,[7.4,5.2,10],[8.8,6.8,14],six(W),{down:[7,9,9,14],up:[7,2,9,7],north:[7,9,9,11],south:[7,9,9,11],west:[2,9,7,11],east:[9,9,14,11]},[8,6,14],Math.PI/4);
 tilted(E,[6.2,3.8,7.9],[9.8,4.6,11.5],six(K),{down:[5,3,11,9],up:[5,3,11,9],north:[5,3,11,4],south:[5,8,11,9],west:[5,8,11,9],east:[5,3,11,4]},[8,6,5.2],-Math.PI/4);
}
/* Tripwire: the string alone, a thin strip 1.5 px above the floor (Java tripwire models). */
function tripwire(E){face(E,E.faceMap.up,.5/16,1,0,(1.5-8)/16,0,-Q,0,[0,0,16,2,90],true)}
/* Weeping and twisting vines: two blocks, the head texture at the growing end and the body texture on the other. */
function vines(E){var f=E.faceMap,weeping=E.cur==='weeping_vines';cross(E,f.down,1,weeping?-.5:.5);cross(E,f.up,1,weeping?.5:-.5)}
/* Nether portal: one flat sheet through the middle of the block. */
function portal(E){face(E,E.faceMap.up,1,1,0,0,0,0,0,null,true)}
/* End portal: the Java model is a top surface 12 px above the floor. */
function endPortal(E){face(E,E.faceMap.up,1,1,0,(12-8)/16,0,-Q,0,null,true)}
var MODELS={piston:piston,sticky_piston:piston,wheat:crop,carrots:crop,potatoes:crop,beetroot:crop,turtle_egg:turtleEgg,pink_petals:petals,wildflowers:petals,tripwire_hook:tripwireHook,trip_wire:tripwire,weeping_vines:vines,twisting_vines:vines,portal:portal,end_portal:endPortal};
H.build=function(E){
 if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
 if(Object.prototype.hasOwnProperty.call(MODELS,E.cur))return MODELS[E.cur](E);
 return oldBuild(E);
};
H.view=function(id){return oldView(TALL.indexOf(id)>=0?'pointed_dripstone':id)};
H.flat=function(id,slot){return id==='end_portal'?false:(oldFlat?oldFlat(id,slot):false)};
})();
