/* Detail block models. Load after fk-lights.js and before fk-core.js. */
(function(){
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,P='textures/blocks/',Q=Math.PI/2,BASE=P+'conduit_base';
function kind(id){if(id==='cauldron'||id==='lava_cauldron')return 'cauldron';if(id==='end_rod')return 'end';if(/(^|_)lightning_rod$/.test(id))return 'rod';if(id==='iron_bars'||/(^|_)copper_bars$/.test(id))return 'bars';return id==='cocoa'||id==='conduit'?id:''}
C.index=function(c,existing){
  var cat=oldIndex(c,existing);
  cat.ids.forEach(function(id){
    var b=cat.b[id],k=kind(id);if(!k)return;
    if(k==='cocoa'){
      var a=P+'cocoa_stage_0',m=P+'cocoa_stage_1',z=P+'cocoa_stage_2';
      cat.sp[id]={kind:'details',list:[{id:z,t:'stage 2'},{id:m,t:'stage 1'},{id:a,t:'stage 0'}],fm:{up:z,down:a,north:m,south:z,east:z,west:z}};
    }else if(k==='conduit'){
      cat.sp[id]={kind:'details',list:[{id:BASE,t:'base'}],fm:{up:BASE,down:BASE,north:BASE,south:BASE,east:BASE,west:BASE}};
    }else if(k==='cauldron'){
      var list=[],seen={},names=['rim','bottom','side','inside','liquid','water overlay'];
      b.forEach(function(p,i){if(!seen[p]){seen[p]=1;list.push({id:p,t:names[i]})}});
      cat.sp[id]={kind:'details',list:list,fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]}};
    }
  });return cat;
};
function face(E,id,w,h,x,y,z,rx,ry,r,dbl,N){
  var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
  if(dbl){mat.side=THREE.DoubleSide;mat.needsUpdate=true}
  N=N||16;r=r||[0,0,16,16];var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
  for(var i=0;i<uv.count;i++){var a=uv.getX(i),b=1-uv.getY(i),s=r[4]===90?b:a,t=r[4]===90?1-a:b;uv.setXY(i,(r[0]+s*(r[2]-r[0]))/N,1-(r[1]+t*(r[3]-r[1]))/N)}
  var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function autoUV(a,b){return {north:[16-b[0],16-b[1],16-a[0],16-a[1]],south:[a[0],16-b[1],b[0],16-a[1]],east:[16-b[2],16-b[1],16-a[2],16-a[1]],west:[a[2],16-b[1],b[2],16-a[1]],up:[a[0],a[2],b[0],b[2]],down:[a[0],16-b[2],b[0],16-a[2]]}}
function box(E,a,b,ids,R,N){
  R=R||autoUV(a,b);var w=(b[0]-a[0])/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])/16,x=(a[0]+b[0]-16)/32,y=(a[1]+b[1]-16)/32,z=(a[2]+b[2]-16)/32;
  var p={north:[w,h,x,y,(a[2]-8)/16,0,Math.PI],south:[w,h,x,y,(b[2]-8)/16,0,0],east:[d,h,(b[0]-8)/16,y,z,0,Q],west:[d,h,(a[0]-8)/16,y,z,0,-Q],up:[w,d,x,(b[1]-8)/16,z,-Q,0],down:[w,d,x,(a[1]-8)/16,z,Q,0]};
  Object.keys(ids).forEach(function(k){face.apply(null,[E,ids[k]].concat(p[k],[R[k],false,N]))});
}
function six(id){return {north:id,south:id,east:id,west:id,up:id,down:id}}
function rects(side,top,bottom){return {north:side,south:side,east:side,west:side,up:top,down:bottom||top}}
function cauldron(E){
  var f=E.faceMap,wall={north:f.north,south:f.north,east:f.north,west:f.north,up:f.up,down:f.south};
  [[[0,3,0],[2,16,16]],[[14,3,0],[16,16,16]],[[2,3,0],[14,16,2]],[[2,3,14],[14,16,16]]].forEach(function(p){box(E,p[0],p[1],wall)});
  box(E,[2,3,2],[14,4,14],{up:f.south,down:f.south});
  var foot={north:f.north,south:f.north,east:f.north,west:f.north,down:f.down};
  [[[0,0,0],[4,3,2]],[[0,0,2],[2,3,4]],[[12,0,0],[16,3,2]],[[14,0,2],[16,3,4]],[[0,0,14],[4,3,16]],[[0,0,12],[2,3,14]],[[12,0,14],[16,3,16]],[[14,0,12],[16,3,14]]].forEach(function(p){box(E,p[0],p[1],foot)});
  if(E.cur==='lava_cauldron'||E.slot===f.east||E.slot===f.west){var id=E.slot===f.west?f.west:f.east;face(E,id,.75,.75,0,6/16,0,-Q,0,[2,2,14,14],true)}
}
function end(E){
  var id=E.faceMap.up;
  box(E,[6,0,6],[10,1,10],six(id),rects([2,6,6,7],[2,2,6,6],[6,6,2,2]));
  var ids=six(id);delete ids.down;box(E,[7,1,7],[9,16,9],ids,rects([0,0,2,15],[2,0,4,2]));
}
function rod(E){
  var id=E.faceMap.up;
  box(E,[6,12,6],[10,16,10],six(id),rects([0,0,4,4],[4,4,0,0],[0,0,4,4]));
  var ids=six(id);delete ids.up;box(E,[7,0,7],[9,12,9],ids,rects([0,4,2,16],[0,4,2,6],[0,4,2,6]));
}
function bars(E){
  var f=E.faceMap,B=f.north,S=f.east;
  face(E,B,.125,1,0,0,0,0,0,[7,0,9,16],true);
  face(E,B,.125,1,0,0,0,0,Q,[7,0,9,16],true);
  face(E,B,.5,1,.25,0,0,0,0,[8,0,16,16],true);
  face(E,B,.5,1,-.25,0,0,0,0,[16,0,8,16],true);
  face(E,B,.5,1,0,0,-.25,0,Q,[8,0,16,16],true);
  face(E,B,.5,1,0,0,.25,0,Q,[16,0,8,16],true);
  face(E,S,.125,1,0,0,-.49994,0,0,[7,0,9,16],true);
  face(E,S,.125,1,0,0,.49994,0,0,[7,0,9,16],true);
  face(E,S,.125,1,.49994,0,0,0,Q,[7,0,9,16],true);
  face(E,S,.125,1,-.49994,0,0,0,Q,[7,0,9,16],true);
}
function cocoa(E){
  var f=E.faceMap,n=E.slot===f.down?0:E.slot===f.north?1:2,id=n===0?f.down:n===1?f.north:f.up,w=4+2*n,h=5+2*n;
  box(E,[8-w/2,12-h,15-w],[8+w/2,12,15],six(id),rects([n===0?11:n===1?9:8,4,n===2?16:15,9+2*n],[0,0,w,w]));
  face(E,id,.25,.25,0,.375,.375,0,Q,[16,0,12,4],true);
}
function conduit(E){
  var id=E.faceMap.up,R={east:[0,6,6,12],north:[6,6,12,12],west:[12,6,18,12],south:[18,6,24,12],up:[6,0,12,6],down:[12,0,18,6]};
  box(E,[5,5,5],[11,11,11],six(id),R,32);
}
H.build=function(E){
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
  var k=kind(E.cur);if(!k)return oldBuild(E);
  if(k==='cauldron')return cauldron(E);if(k==='end')return end(E);if(k==='rod')return rod(E);if(k==='bars')return bars(E);if(k==='cocoa')return cocoa(E);return conduit(E);
};
/* Preserve the native 2:1 atlas on both Add and PNG export; working canvas stays padded. */
function installExport(){
  var A=window.FKAPI;if(!A)return;
  function wrap(fn){return function(){
    var out=fn.apply(this,arguments);if(A.cur()!=='conduit'||!A.ctx.ready())return out;
    var file=out.filter(function(f){return f.path===BASE+'.png'})[0];if(!file)return out;
    var r=A.ctx.res(),c=document.createElement('canvas');c.width=r;c.height=Math.max(1,Math.round(r/2));
    c.getContext('2d').drawImage(A.ctx.g().canvas,0,0);file.data=c.toDataURL('image/png');
    var rec=A.grid().files[BASE];if(rec)rec.data=file.data;return out;
  }}
  A.files=wrap(A.files);A.ctx.files=wrap(A.ctx.files);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installExport);else installExport();
})();
