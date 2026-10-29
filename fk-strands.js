/* Segmented plant/mineral previews, shared by the editor and Find. */
(function(){
'use strict';
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,oldView=H.view;
var IDS=['pale_hanging_moss','sulfur_spike'],PARTS=['base','middle','frustum','tip','tip_merge'];
function requirePath(paths,name,existing){
 var matches=paths.filter(function(p){return p.split('/').pop()===name});
 if(matches.length!==1||!existing||!existing[matches[0]])throw new Error('Missing segmented texture: '+name);
 return matches[0];
}
C.index=function(c,existing){
 var cat=oldIndex(c,existing);
 IDS.forEach(function(id){
  if(!cat.b[id])return;
  var paths=(c.extra&&c.extra[id])||[],b=cat.b[id],fm={up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]},list=[];
  function add(key,name){var p=requirePath(paths,name,existing);fm[key]=p;if(!list.some(function(s){return s.id===p}))list.push({id:p})}
  if(id==='pale_hanging_moss'){
   add('middle','pale_hanging_moss_middle');add('tip','pale_hanging_moss_tip');
  }else{
   ['down','up'].forEach(function(direction){PARTS.forEach(function(part){add(direction+'_'+part,'sulfur_spike_'+direction+'_'+part)})});
  }
  cat.sp[id]={kind:'segmented',list:list,fm:fm};
 });
 return cat;
};
function cross(E,id,width,height,y){
 var material=E.mats[id];if(!material||material===E.hiddenMat)throw new Error('Missing segmented material: '+id);
 material.side=THREE.DoubleSide;material.needsUpdate=true;
 [0,Math.PI/2].forEach(function(angle){var mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.position.set(0,y,0);mesh.rotation.y=angle;E.group.add(mesh)});
}
function hangingMoss(E){cross(E,E.faceMap.middle,Math.SQRT2,1,.5);cross(E,E.faceMap.tip,Math.SQRT2,1,-.5)}
function sulfur(E){
 var f=E.faceMap,up=PARTS.some(function(part){return E.slot===f['up_'+part]}),direction=up?'up':'down';
 var end=E.slot===f[direction+'_tip_merge']?'tip_merge':'tip';
 ['base','middle','frustum',end].forEach(function(part,i){cross(E,f[direction+'_'+part],Math.SQRT2*.5,.5,up?-.75+i*.5:.75-i*.5)});
}
H.build=function(E){
 if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
 if(E.cur==='pale_hanging_moss')return hangingMoss(E);
 if(E.cur==='sulfur_spike')return sulfur(E);
 return oldBuild(E);
};
H.view=function(id){return oldView(IDS.indexOf(id)>=0?'pointed_dripstone':id)};
})();
