/* FKShapes: Three.js model builders. Editor state arrives through env E; this file keeps no state. */
var FKShapes=(function(){
var PI4=Math.PI/4;
function box(E,w,h,d,x,y,z,ids,ys,vs){
  var g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  ys=ys||0;vs=vs||1;
  for(var i=0;i<p.count;i++){
    var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
    if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
    else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
    else if(vs!==1){var th=(Z-z+d/2)/d;u=X+.5;v=ny>0?1-.09375*th:.09375*th}
    else{u=X+.5;v=ny>0?.5-Z:Z+.5}
    uv.setXY(i,u,v);
  }
  var f=E.faceMap;
  ids=ids||[f.east,f.west,f.up,f.down,f.south,f.north];
  var m=new THREE.Mesh(g,ids.map(function(k){return k===null?E.hiddenMat:E.mats[k]}));
  m.position.set(x,y,z);return m;
}
function plane(E,id,w,h,x,y,z,rx,ry){
  var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),E.mats[id]);
  m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);return m;
}
function cross(E,id,w,h,y){
  E.group.add(plane(E,id,w,h,0,y,0,0,PI4));E.group.add(plane(E,id,w,h,0,y,0,0,-PI4));
}
function twoSided(E,id){var m=E.mats[id];if(m){m.side=THREE.DoubleSide;m.needsUpdate=true}}
function bamboo(E){
  var f=E.faceMap,s=f.north,st=box(E,.1875,1,.1875,0,0,0,[s,s,s,s,s,s]),uv=st.geometry.attributes.uv;
  for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.40625);
  uv.needsUpdate=true;E.group.add(st);
  cross(E,f.up,1.2,1,.3);cross(E,f.south,.9,.6,-.05);cross(E,f.east,.6,.5,-.35);
}
function plant(E){
  var f=E.faceMap,az=E.shape==='azalea';
  if(E.cur==='bamboo')return bamboo(E);
  cross(E,az?f.plant:f.up,Math.SQRT2,1,0);
  if(az){var s=f.north;E.group.add(box(E,1,1,1,0,0,0,[s,s,f.up,null,s,s]))}
}
function beacon(E){
  var f=E.faceMap,g=f.east,b=f.down,c=f.up;
  E.group.add(box(E,.75,.1875,.75,0,-.40625,0,[b,b,b,b,b,b]));
  E.group.add(box(E,.625,.625,.625,0,0,0,[c,c,c,c,c,c]));
  E.group.add(box(E,1,1,1,0,0,0,[g,g,g,g,g,g]));
}
function door(E){
  var D='__door';
  E.refreshDoor();
  E.group.add(box(E,1,2,.1875,0,0,-.40625,[D,D,D,D,D,D],-.5,.5));
}
function flat(E){
  var f=E.faceMap,id=E.slot===f.up?f.up:f.down;
  twoSided(E,id);E.group.add(plane(E,id,1,1,0,0,0,-Math.PI/2,0));
}
function decal(E){
  var id=E.faceMap.south;
  twoSided(E,id);E.group.add(plane(E,id,1,1,0,0,-.49,0,0));
}
function candle(E){
  var wid=E.faceMap.east,wm=E.mats[wid];
  if(!wm)return;
  twoSided(E,wid);
  [PI4,-PI4].forEach(function(ry){
    var pg=new THREE.PlaneGeometry(.125,.125),pu=pg.attributes.uv;
    for(var j=0;j<pu.count;j++)pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125);
    var pm=new THREE.Mesh(pg,wm);pm.position.y=-.0625;pm.rotation.y=ry;E.group.add(pm);
  });
}
function build(E){
  var s=E.shape,g=E.group;
  if(s==='plant'||s==='azalea')return plant(E);
  if(s==='beacon')return beacon(E);
  if(s==='door')return door(E);
  if(s==='rail')return flat(E);
  if(s==='decal')return decal(E);
  var d=E.SHAPES[s]||E.SHAPES.cube;
  d.parts.forEach(function(a){
    var bm=box.apply(null,[E].concat(a));
    if(s==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}
    g.add(bm);
  });
  if(s==='candle')candle(E);
  if(d.shift)g.children.forEach(function(m){m.position.y+=d.shift});
}
return {build:build};
})();
