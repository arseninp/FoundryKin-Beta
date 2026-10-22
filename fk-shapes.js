/* FKShapes: block shapes and Three.js model builders. Editor state arrives through env E; this file keeps no state. */
var FKShapes=(function(){
var PI4=Math.PI/4;
var SHAPES={
  cube:{parts:[[1,1,1,0,0,0]],shift:0},
  slab:{parts:[[1,.5,1,0,-.25,0]],shift:.25},
  stairs:{parts:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],shift:0},
  wall:{parts:[[.5,1,.5,0,0,0],[1,.875,.25,0,-.0625,0]],shift:0},
  fence:{parts:[[.25,1,.25,0,0,0],[1,.1875,.125,0,-.03125,0],[1,.1875,.125,0,.34375,0]],shift:0},
  gate:{parts:[[.125,.6875,.125,-.4375,.15625,0],[.125,.6875,.125,.4375,.15625,0],[.75,.1875,.125,0,-.03125,0],[.75,.1875,.125,0,.34375,0]],shift:0},
  button:{parts:[[.375,.125,.25,0,-.4375,0]],shift:.4},
  plate:{parts:[[.875,.0625,.875,0,-.46875,0]],shift:.45},
  pane:{parts:[[1,1,.125,0,0,0]],shift:0},
  trapdoor:{parts:[[1,.1875,1,0,-.40625,0]],shift:.4},
  door:{},
  plant:{},
  azalea:{},
  beacon:{},
  candle:{parts:[[.125,.375,.125,0,-.3125,0]],shift:0},
  carpet:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  rail:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  decal:{parts:[[1,1,.0625,0,0,-.46875]],shift:0}
};
function icon(b,label,k){
 b.type='button';b.title=label;b.setAttribute('aria-label',label);
 var s='',p=SHAPES[k]&&SHAPES[k].parts;
 if(p){
  function v(x,y,z){return (12+(x-z)*9)+','+(12-y*12+(x+z)*4)}
  p.forEach(function(a){var l=a[3]-a[0]/2,r=l+a[0],t=a[4]+a[1]/2,d=t-a[1],f=a[5]+a[2]/2,h=f-a[2];s+='<path d="M'+v(l,t,f)+' '+v(r,t,f)+' '+v(r,t,h)+' '+v(l,t,h)+'Z M'+v(l,t,f)+' '+v(l,d,f)+' '+v(r,d,f)+' '+v(r,d,h)+' '+v(r,t,h)+' M'+v(r,t,f)+' '+v(r,d,f)+'"/>'});
 }else s=k==='door'?'<rect x="6" y="2" width="12" height="20"/><path d="M15 12h1"/>':k==='beacon'?'<rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10"/>':'<path d="M12 22V4m0 9L4 5m8 12 8-8"/>';
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">'+s+'</svg>';
}
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
function cross(E,id,w,h,y,x,z){
  var k=E.iso?1/Math.SQRT2:1,a=E.iso?0:PI4,b=E.iso?Math.PI/2:-PI4;
  E.group.add(plane(E,id,w*k,h,x||0,y,z||0,0,a));E.group.add(plane(E,id,w*k,h,x||0,y,z||0,0,b));
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
  if(E.cur==='cave_vines'){cross(E,f.up,Math.SQRT2,1,.5);cross(E,f.down,Math.SQRT2,1,-.5);return}
  if(E.cur==='amethyst_cluster'){
    [[f.up,-1,-1],[f.g1,1,-1],[f.g2,-1,1],[f.g3,1,1]].forEach(function(a){if(a[0])cross(E,a[0],.7,.5,-.25,a[1]*.25,a[2]*.25)});
    return;
  }
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
function pane(E){
  var f=E.faceMap,e=f.edge||f.east,g=f.south;
  E.group.add(box(E,1,1,.125,0,0,0,[e,e,e,e,g,g]));
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
  if(s==='pane')return pane(E);
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
return {build:build,SHAPES:SHAPES,icon:icon};
})();
