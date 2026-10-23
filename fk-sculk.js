/* Sculk block models and cactus faces; loaded after FKCatalog/FKShapes and before FKAPI. */
(function(){
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var index=C.index,build=H.build,P='textures/blocks/',Q=Math.PI/2;
C.index=function(c,existing){
  var cat=index(c,existing);
  ['sculk_sensor','calibrated_sculk_sensor'].forEach(function(id){
    var b=cat.b[id];if(!b)return;
    var cal=id==='calibrated_sculk_sensor',a=P+'sculk_sensor_tendril_inactive',on=P+'sculk_sensor_tendril_active',am=P+'calibrated_sculk_sensor_amethyst';
    var list=[{id:b[0],t:'top'},{id:b[1],t:'bottom'},{id:b[2],t:'side'},{id:a,t:'tendril inactive'},{id:on,t:'tendril active'}];
    if(cal){list.push({id:b[3],t:'input side'});list.push({id:am,t:'amethyst'})}
    cat.sp[id]={kind:'sculk',list:list,fm:{up:b[0],down:b[1],north:b[2],south:cal?b[3]:b[2],east:a,west:cal?am:a,g1:a,g2:on,g3:cal?am:null}};
    delete cat.cr[id];
  });
  var b=cat.b.sculk_shrieker;
  if(b){
    var inner=cat.cr.sculk_shrieker||P+'sculk_shrieker_inner_top';
    cat.sp.sculk_shrieker={kind:'sculk',list:[{id:b[0],t:'top'},{id:b[1],t:'bottom'},{id:b[2],t:'side'},{id:inner,t:'inner top'}],fm:{up:b[0],down:b[1],north:b[2],south:b[2],east:inner,west:inner}};
    delete cat.cr.sculk_shrieker;
  }
  return cat;
};
function surface(E,id,w,h,x,y,z,rx,ry,r,dbl){
  var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
  if(dbl){mat.side=THREE.DoubleSide;mat.needsUpdate=true}
  var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;r=r||[0,0,16,16];
  for(var i=0;i<uv.count;i++){var u=uv.getX(i),v=uv.getY(i);uv.setXY(i,(r[0]+u*(r[2]-r[0]))/16,1-(r[1]+(1-v)*(r[3]-r[1]))/16)}
  var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function cube(E,lo,hi,R,ids,dbl){
  var w=hi[0]-lo[0],h=hi[1]-lo[1],d=hi[2]-lo[2],x=(hi[0]+lo[0])/2,y=(hi[1]+lo[1])/2,z=(hi[2]+lo[2])/2;
  if(ids.north)surface(E,ids.north,w,h,x,y,lo[2],0,Math.PI,R.north,dbl);
  if(ids.south)surface(E,ids.south,w,h,x,y,hi[2],0,0,R.south,dbl);
  if(ids.east)surface(E,ids.east,d,h,hi[0],y,z,0,Q,R.east,dbl);
  if(ids.west)surface(E,ids.west,d,h,lo[0],y,z,0,-Q,R.west,dbl);
  if(ids.up)surface(E,ids.up,w,d,x,hi[1],z,-Q,0,R.up,dbl);
  if(ids.down)surface(E,ids.down,w,d,x,lo[1],z,Q,0,R.down,dbl);
}
function sensor(E){
  var f=E.faceMap,cal=E.cur==='calibrated_sculk_sensor',side=[0,8,16,16];
  cube(E,[-.5,-.5,-.5],[.5,0,.5],{north:side,south:side,east:side,west:side},{up:f.up,down:f.down,north:f.north,south:f.south,east:f.north,west:f.north});
  var t=E.slot===f.g2?f.g2:f.east;
  [[-5,-5],[5,-5],[5,5],[-5,5]].forEach(function(a){
    var r=a[0]>0?[12,8,4,16]:[4,8,12,16];
    surface(E,t,.5,.5,a[0]/16,.25,a[1]/16,0,Math.PI+(a[0]*a[1]>0?Math.PI/4:-Math.PI/4),r,true);
  });
  if(cal){
    surface(E,f.west,Math.SQRT2,.75,0,.375,0,0,Math.PI/4,[0,4,16,16],true);
    surface(E,f.west,Math.SQRT2,.75,0,.375,0,0,-Math.PI/4,[0,4,16,16],true);
  }
}
function shrieker(E){
  var f=E.faceMap,side=[0,8,16,16],rim=[1,1,15,8];
  cube(E,[-.5,-.5,-.5],[.5,0,.5],{north:side,south:side,east:side,west:side},{up:f.east,down:f.down,north:f.north,south:f.north,east:f.north,west:f.north});
  cube(E,[-7/16,0,-7/16],[7/16,7/16,7/16],{up:[1,1,15,15],north:rim,south:rim,east:rim,west:rim},{up:f.up,north:f.north,south:f.north,east:f.north,west:f.north},true);
}
function cactus(E){
  var f=E.faceMap;
  surface(E,f.up,1,1,0,.5,0,-Q,0);
  surface(E,f.down,1,1,0,-.5,0,Q,0);
  surface(E,f.north,1,1,0,0,-7/16,0,Math.PI);
  surface(E,f.south,1,1,0,0,7/16,0,0);
  surface(E,f.east,1,1,7/16,0,0,0,Q);
  surface(E,f.west,1,1,-7/16,0,0,0,-Q);
}
H.build=function(E){
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return build(E);
  if(E.cur==='sculk_sensor'||E.cur==='calibrated_sculk_sensor')return sensor(E);
  if(E.cur==='sculk_shrieker')return shrieker(E);
  if(E.cur==='cactus')return cactus(E);
  return build(E);
};
})();
