/* Ladder, lectern, lever and complete two-block flowers. Load after fk-details.js. */
(function(){
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var index=C.index,build=H.build,P='textures/blocks/',Q=Math.PI/2;
var FLOWERS={sunflower:'sunflower',lilac:'syringa',rose_bush:'rose',peony:'paeonia'};
function flowerPath(id,part,existing){
  var a=P+'double_plant_'+FLOWERS[id]+'_'+part,b=P+id+'_'+part;
  return existing&&!existing[a]&&existing[b]?b:a;
}
C.index=function(c,existing){
  var data={b:Object.assign({},c.b),p:Object.assign({},c.p),cr:Object.assign({},c.cr)};
  Object.keys(FLOWERS).forEach(function(id){
    if(!data.b[id]&&!data.b.double_plant)return;
    var up=flowerPath(id,'top',existing),down=flowerPath(id,'bottom',existing);
    var front=id==='sunflower'?flowerPath(id,'front',existing):down,back=id==='sunflower'?flowerPath(id,'back',existing):down;
    data.b[id]=[up,down,front,back,down,down];
    delete data.p[id];delete data.cr[id];
  });
  var cat=index(data,existing);
  Object.keys(FLOWERS).forEach(function(id){
    var b=cat.b[id];if(!b)return;
    var list=[],seen={};
    [b[1],b[0],b[2],b[3]].forEach(function(p){if(!seen[p]){seen[p]=1;list.push({id:p})}});
    cat.sp[id]={kind:'fixtures',list:list,fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]}};
    delete cat.cr[id];
  });
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
  Object.keys(F).forEach(function(k){face.apply(null,[E,F[k]].concat(p[k],[R[k],false]))});
}
function tiltedBox(E,a,b,F,R,p,angle){
  var g=new THREE.Group(),e=Object.create(E),x=(p[0]-8)/16,y=(p[1]-8)/16,z=(p[2]-8)/16;
  e.group=g;box(e,a,b,F,R);
  g.children.forEach(function(m){m.position.x-=x;m.position.y-=y;m.position.z-=z});
  g.position.set(x,y,z);g.rotation.x=angle;E.group.add(g);
}
function ladder(E){face(E,E.faceMap.up,1,1,0,0,7/16,0,0,null,true)}
function lectern(E){
  var f=E.faceMap,B=f.east,S=f.south,F=f.north,D=f.down,T=f.up;
  box(E,[0,0,0],[16,2,16],{north:B,east:B,south:B,west:B,up:B,down:D},{north:[0,14,16,16],east:[0,6,16,8],south:[0,6,16,8],west:[0,6,16,8],up:[0,0,16,16,180],down:[0,0,16,16]});
  box(E,[4,2,4],[12,15,12],{north:F,east:S,south:F,west:S},{north:[0,0,8,13],east:[2,16,15,8,90],south:[8,3,16,16],west:[2,8,15,16,90]});
  tiltedBox(E,[.0125,12,3],[15.9875,16,16],{north:S,east:S,south:S,west:S,up:T,down:D},{north:[0,0,16,4],east:[0,4,13,8],south:[0,4,16,8],west:[0,4,13,8],up:[0,1,16,14,180],down:[0,0,16,13]},[8,8,8],-Math.PI/8);
}
function lever(E){
  var f=E.faceMap,B=f.east,L=f.up;
  box(E,[5,-.02,4],[11,2.98,12],{north:B,south:B,east:B,west:B,up:B,down:B},{north:[5,0,11,3],south:[5,0,11,3],east:[4,0,12,3],west:[4,0,12,3],up:[5,4,11,12],down:[5,4,11,12]});
  tiltedBox(E,[7,1,7],[9,11,9],{north:L,south:L,east:L,west:L,up:L},{north:[7,6,9,16],south:[7,6,9,16],east:[7,6,9,16],west:[7,6,9,16],up:[7,6,9,8]},[8,1,8],-Math.PI/4);
}
function cross(E,id,y,h,r){
  face(E,id,Math.SQRT2,h,0,y,0,0,Math.PI/4,r,true);
  face(E,id,Math.SQRT2,h,0,y,0,0,-Math.PI/4,r,true);
}
/* Height belongs to the whole plant, never just its selected texture or its card. */
function flower(E){
  var f=E.faceMap;
  cross(E,f.down,-.5,1);
  if(E.cur!=='sunflower'){cross(E,f.up,.5,1);return}
  cross(E,f.up,.25,.5,[0,8,16,16]);
  var g=new THREE.Group(),e=Object.create(E),s=1/Math.cos(Math.PI/8);e.group=g;
  face(e,f.north,14/16,s,.1*s,-s/16,0,0,Q);
  face(e,f.south,14/16,s,.1*s,-s/16,0,0,-Q);
  g.position.set(0,.5,0);g.rotation.z=Math.PI/8;E.group.add(g);
}
H.build=function(E){
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return build(E);
  if(E.cur==='ladder')return ladder(E);
  if(E.cur==='lectern')return lectern(E);
  if(E.cur==='lever')return lever(E);
  if(Object.prototype.hasOwnProperty.call(FLOWERS,E.cur))return flower(E);
  return build(E);
};
})();
