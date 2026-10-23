/* Lanterns, chains, campfires and torches; static block previews, no entity skeletons. */
(function(){
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,Q=Math.PI/2;
function family(id){if(/(^|_)lantern$/.test(id)&&id!=='sea_lantern')return 'lantern';if(/(^|_)chain$/.test(id))return 'chain';if(id==='campfire'||id==='soul_campfire')return 'campfire';if(/^(torch|soul_torch|copper_torch|redstone_torch|unlit_redstone_torch)$/.test(id))return 'torch';return ''}
C.index=function(c,existing){
  var cat=oldIndex(c,existing);
  cat.ids.forEach(function(id){
    var k=family(id);if(!k)return;var b=cat.b[id],icon=cat.cr[id],fm={},list=[];
    if(k==='campfire'){
      list=[{id:b[0],t:'fire'},{id:b[1],t:'log'},{id:b[2],t:'log lit'}];
      fm={up:b[0],down:b[1],north:b[2],south:b[2],east:b[2],west:b[2]};
    }else{
      var ps=k==='chain'?[b[0],b[2]]:[b[0]],seen={};
      ps.forEach(function(p,i){if(!seen[p]){seen[p]=1;list.push({id:p,t:k==='chain'?'chain '+(i+1):k})}});
      fm={up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
      if(icon&&!seen[icon]&&ps.indexOf(icon)<0){list.push({id:icon,t:'icon'});fm.g3=icon}
    }
    cat.sp[id]={kind:'lights',list:list,fm:fm};delete cat.cr[id];
  });
  return cat;
};
function face(E,id,w,h,x,y,z,rx,ry,r,dbl){
  var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
  if(dbl){mat.side=THREE.DoubleSide;mat.needsUpdate=true}
  var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;r=r||[0,0,16,16];
  for(var i=0;i<uv.count;i++){
    var a=uv.getX(i),b=1-uv.getY(i),s=a,t=b;
    if(r[4]===90){s=b;t=1-a}else if(r[4]===180){s=1-a;t=1-b}else if(r[4]===270){s=1-b;t=a}
    uv.setXY(i,(r[0]+s*(r[2]-r[0]))/16,1-(r[1]+t*(r[3]-r[1]))/16);
  }
  var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function box(E,lo,hi,F){
  var w=(hi[0]-lo[0])/16,h=(hi[1]-lo[1])/16,d=(hi[2]-lo[2])/16,x=(lo[0]+hi[0]-16)/32,y=(lo[1]+hi[1]-16)/32,z=(lo[2]+hi[2]-16)/32;
  var p={north:[w,h,x,y,(lo[2]-8)/16,0,Math.PI],south:[w,h,x,y,(hi[2]-8)/16,0,0],east:[d,h,(hi[0]-8)/16,y,z,0,Q],west:[d,h,(lo[0]-8)/16,y,z,0,-Q],up:[w,d,x,(hi[1]-8)/16,z,-Q,0],down:[w,d,x,(lo[1]-8)/16,z,Q,0]};
  Object.keys(F).forEach(function(k){var f=F[k];face.apply(null,[E,f[0]].concat(p[k],[f.slice(1)]))});
}
function six(id,side,top,bottom){var s=[id].concat(side);return {north:s,south:s,east:s,west:s,up:[id].concat(top),down:[id].concat(bottom||top)}}
function lantern(E){
  var id=E.faceMap.up;
  box(E,[5,0,5],[11,7,11],six(id,[0,2,6,9],[0,9,6,15]));
  var cap=six(id,[1,0,5,2],[1,10,5,14]);delete cap.down;box(E,[6,7,6],[10,9,10],cap);
  face(E,id,3/16,2/16,0,2/16,0,0,Math.PI/4,[11,1,14,3],true);
  face(E,id,3/16,2/16,0,2/16,0,0,-Math.PI/4,[11,10,14,12],true);
}
function strip(E,id){
  var im=E.mats[id]&&E.mats[id].map&&E.mats[id].map.image;
  try{
    if(!im)return [0,0,3,16];
    var w=im.width,h=im.height,d=im.data||(im.getContext&&im.getContext('2d').getImageData(0,0,w,h).data);
    if(!d||!w||!h)return [0,0,3,16];
    var a=w,b=-1;
    for(var y=0;y<h;y++)for(var x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){a=Math.min(a,x);b=Math.max(b,x)}
    return b<a?[0,0,3,16]:[16*a/w,0,16*(b+1)/w,16];
  }catch(e){return [0,0,3,16]}
}
function chain(E){var f=E.faceMap;face(E,f.up,3/16,1,0,0,0,0,Math.PI/4,strip(E,f.up),true);face(E,f.north,3/16,1,0,0,0,0,-Math.PI/4,strip(E,f.north),true)}
function torch(E){var id=E.faceMap.up;box(E,[7,0,7],[9,10,9],six(id,[7,6,9,16],[7,6,9,8],[7,13,9,15]))}
function campfire(E){
  var f=E.faceMap,off=E.slot===f.down,L=f.down,T=off?L:f.north;
  function uv(id,a,rot){return [id].concat(a,rot?[rot]:[])}
  var end=uv(L,[0,4,4,8]),raw=uv(L,[0,0,16,4]),rawR=uv(L,[16,0,0,4]),long=uv(L,[0,0,16,4],90),top=uv(L,[0,0,16,4],180),lit=uv(T,[0,0,16,4]),litR=uv(T,[16,0,0,4]),under=uv(T,[0,4,16,8]);
  box(E,[1,0,0],[5,4,16],{north:end,south:end,east:uv(T,[0,1,16,5]),west:rawR,up:long,down:long});
  box(E,[11,0,0],[15,4,16],{north:end,south:end,east:raw,west:uv(T,[16,1,0,5]),up:long,down:long});
  box(E,[0,3,11],[16,7,15],{north:litR,south:lit,east:end,west:end,up:top,down:under});
  box(E,[0,3,1],[16,7,5],{north:lit,south:litR,east:end,west:end,up:top,down:under});
  box(E,[5,0,0],[11,1,16],{north:uv(L,[0,15,6,16]),south:uv(L,[10,15,16,16]),up:uv(T,[0,8,16,14],90),down:uv(L,[0,8,16,14],90)});
  if(!off){var w=.9*Math.SQRT2;face(E,f.up,w,1,0,1/16,0,0,Math.PI/4,[0,0,16,16],true);face(E,f.up,w,1,0,1/16,0,0,-Math.PI/4,[0,0,16,16],true)}
}
H.build=function(E){
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
  var k=family(E.cur);if(!k)return oldBuild(E);
  if(E.faceMap.g3&&E.slot===E.faceMap.g3){face(E,E.slot,1.1,1.1,0,0,0,0,0,[0,0,16,16],true);return}
  if(k==='lantern')return lantern(E);if(k==='chain')return chain(E);if(k==='torch')return torch(E);return campfire(E);
};
})();
