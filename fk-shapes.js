/* FKShapes: shared models for editor and Find. */
var FKShapes=(function(){
var PI4=Math.PI/4;
var GLZ={north:270,east:0,south:90,west:180,up:180,down:180};
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
  cake:{parts:[[.875,.5,.875,0,-.25,0]],shift:.25},
  anvil:{},bed:{},bell:{},dripleaf:{},
  trapdoor:{parts:[[1,.1875,1,0,-.40625,0]],shift:.4},
  door:{},plant:{},azalea:{},beacon:{},
  candle:{parts:[[.125,.375,.125,0,-.3125,0]],shift:0},
  carpet:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  rail:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  decal:{parts:[[1,1,.0625,0,0,-.46875]],shift:0}
};
/* Camera classes: the model is never refitted, the camera is chosen once from the object's height in blocks.
   1 = ordinary block, 2 = two blocks high or long (doors, beds, tall flowers, pots), 3 = three blocks, 4 = large mobs later. */
var VIEW_SCALE={1:1,2:1.4,3:1.8,4:2.3};
function viewClass(id){
  if(id==='bamboo')return 3;
  if(/(^|_)door$/.test(id)||/_bed$/.test(id)||/^(?:sunflower|lilac|rose_bush|peony|decorated_pot|pointed_dripstone|cave_vines)$/.test(id))return 2;
  return 1;
}
function view(id){return VIEW_SCALE[viewClass(id)]}
function icon(b,label,k){
 b.type='button';b.title=label;b.setAttribute('aria-label',label);
 var s='',p=SHAPES[k]&&SHAPES[k].parts;
 if(p){
  function v(x,y,z){return (12+(x-z)*9)+','+(12-y*12+(x+z)*4)}
  p.forEach(function(a){var l=a[3]-a[0]/2,r=l+a[0],t=a[4]+a[1]/2,d=t-a[1],f=a[5]+a[2]/2,h=f-a[2];s+='<path d="M'+v(l,t,f)+' '+v(r,t,f)+' '+v(r,t,h)+' '+v(l,t,h)+'Z M'+v(l,t,f)+' '+v(l,d,f)+' '+v(r,d,f)+' '+v(r,d,h)+' '+v(r,t,h)+' M'+v(r,t,f)+' '+v(r,d,f)+'"/>'});
 }else s=k==='door'?'<rect x="6" y="2" width="12" height="20"/><path d="M15 12h1"/>':k==='beacon'?'<rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10"/>':'<path d="M12 22V4m0 9L4 5m8 12 8-8"/>';
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">'+s+'</svg>';
}
function box(E,w,h,d,x,y,z,ids,ys,vs,rot){
  var g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  ys=ys||0;vs=vs||1;
  for(var i=0;i<p.count;i++){
    var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
    if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
    else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
    else if(vs!==1){var th=(Z-z+d/2)/d;u=X+.5;v=ny>0?1-.09375*th:.09375*th}
    else{u=X+.5;v=ny>0?.5-Z:Z+.5}
    if(rot){
      var a=(rot[nx>.5?'east':nx<-.5?'west':nz>.5?'south':nz<-.5?'north':ny>.5?'up':'down']||0)*Math.PI/180;
      if(a){var c=Math.cos(a),s=Math.sin(a),pu=u-.5,pv=v-.5;u=.5+pu*c-pv*s;v=.5+pu*s+pv*c}
    }
    uv.setXY(i,u,v);
  }
  var f=E.faceMap;
  ids=ids||[f.east,f.west,f.up,f.down,f.south,f.north];
  var m=new THREE.Mesh(g,ids.map(function(k){return k===null?E.hiddenMat:E.mats[k]}));
  m.position.set(x,y,z);return m;
}
function ubox(E,w,h,d,x,y,z,id,R,N,ids){
  var g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  N=N||64;
  for(var i=0;i<p.count;i++){
    var nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),lx=p.getX(i)/w+.5,ly=p.getY(i)/h+.5,lz=p.getZ(i)/d+.5,f,a,b;
    if(nx>.5){f='east';a=1-lz;b=ly}else if(nx<-.5){f='west';a=lz;b=ly}
    else if(nz>.5){f='south';a=lx;b=ly}else if(nz<-.5){f='north';a=1-lx;b=ly}
    else if(ny>.5){f='up';a=lx;b=1-lz}else{f='down';a=lx;b=lz}
    var r=R[f]||R.up,k=r[4]||0,s=k?1-b:a,t=k===1?1-a:k===2?a:1-b;
    uv.setXY(i,(r[0]+s*(r[2]-r[0]))/N,1-(r[1]+t*(r[3]-r[1]))/N);
  }
  var mat=ids?ids.map(function(k){return k===null?E.hiddenMat:E.mats[k]}):E.mats[id];
  var m=new THREE.Mesh(g,mat);m.position.set(x,y,z);return m;
}
function plane(E,id,w,h,x,y,z,rx,ry){
  var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),E.mats[id]);
  m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);return m;
}
/* Cross: two planes along the block axes, the same in the editor and in Find. Width w is the plane length, so w=sqrt(2) shows a square texture undistorted from the corner view. */
function cross(E,id,w,h,y,x,z){
  E.group.add(plane(E,id,w,h,x||0,y,z||0,0,0));E.group.add(plane(E,id,w,h,x||0,y,z||0,0,Math.PI/2));
}
function twoSided(E,id){var m=E.mats[id];if(m){m.side=THREE.DoubleSide;m.needsUpdate=true}}
function sprite(E){twoSided(E,E.slot);E.group.add(plane(E,E.slot,1.1,1.1,0,0,0,0,0))}
function leaves(E,id,w,h,y){
  E.group.add(plane(E,id,w,h,0,y,0,0,0));E.group.add(plane(E,id,w,h,0,y,0,0,Math.PI/2));
}
/* Bamboo: three full stem segments at true scale; the camera class (3) frames them, no model scaling. */
function bamboo(E){
  var f=E.faceMap,s=f.north;
  var R={north:[0,0,3,16],south:[0,0,3,16],east:[0,0,3,16],west:[0,0,3,16],up:[13,0,16,3],down:[13,4,16,7]};
  [-1,0,1].forEach(function(y){E.group.add(ubox(E,.1875,1,.1875,0,y,0,s,R,16))});
  leaves(E,f.east,.6,.5,-1.3);
  leaves(E,f.south,.9,1,0);
  leaves(E,f.up,.9,1,1);
}
function plant(E){
  var f=E.faceMap;
  if(E.cur==='bamboo')return bamboo(E);
  if(E.cur==='cave_vines'){cross(E,f.up,Math.SQRT2,1,.5);cross(E,f.down,Math.SQRT2,1,-.5);return}
  if(E.cur==='amethyst_cluster'){
    [[f.up,-1,-1],[f.g1,1,-1],[f.g2,-1,1],[f.g3,1,1]].forEach(function(a){if(a[0])cross(E,a[0],.7,.5,-.25,a[1]*.25,a[2]*.25)});return;
  }
  cross(E,f.up,Math.SQRT2,1,0);
}
/* Azalea: canopy top and four 11 px sides, open underside, internal diagonal plant.
   Vanilla template geometry is a reference; Bedrock texture paths come from faceMap.
   The internal planes end inside the canopy, independent of the generic plant cross. */
function azalea(E){
  var f=E.faceMap,side=[0,0,16,11],w=15.8*Math.SQRT2/16,h=15.9/16,y=(15.9/2-8)/16;
  patch(E,f.up,1,1,0,.5,0,-Math.PI/2,0);
  patch(E,f.north,1,11/16,0,5/32,-.5,0,Math.PI,side);
  patch(E,f.south,1,11/16,0,5/32,.5,0,0,side);
  patch(E,f.east,1,11/16,.5,5/32,0,0,Math.PI/2,side);
  patch(E,f.west,1,11/16,-.5,5/32,0,0,-Math.PI/2,side);
  patch(E,f.plant,w,h,0,y,0,0,PI4);
  patch(E,f.plant,w,h,0,y,0,0,-PI4);
}
function beacon(E){
  var f=E.faceMap,g=f.east,b=f.down,c=f.up;
  E.group.add(box(E,.75,.1875,.75,0,-.40625,0,[b,b,b,b,b,b]));
  E.group.add(box(E,.625,.625,.625,0,0,0,[c,c,c,c,c,c]));
  E.group.add(box(E,1,1,1,0,0,0,[g,g,g,g,g,g]));
}
function door(E){var D='__door';E.refreshDoor();E.group.add(box(E,1,2,.1875,0,0,-.40625,[D,D,D,D,D,D],-.5,.5))}
function pane(E){var f=E.faceMap,e=f.edge||f.east,g=f.south;E.group.add(box(E,1,1,.125,0,0,0,[e,e,e,e,g,g]))}
function anvil(E){
  var f=E.faceMap,b=f.down,t=(E.slot===f.g1||E.slot===f.g2)?E.slot:f.up,a=[b,b,b,b,b,b],G=E.group;
  G.add(box(E,.75,.25,.75,0,-.375,0,a));G.add(box(E,.5,.0625,.625,0,-.21875,0,a));
  G.add(box(E,.25,.3125,.5,0,-.03125,0,a));G.add(box(E,.625,.375,1,0,.3125,0,[b,b,t,b,b,b]));
}
function bedPiece(E,o,z,uv){
  var w=z[0],h=z[1],d=z[2],u=uv[0],v=uv[1];
  var R={up:[u+d,v+d,u+d+w,v+d+h],down:[u+2*d+w,v+d,u+2*d+2*w,v+d+h],east:[u+d+w,v+d,u+2*d+w,v+d+h,1],west:[u+d,v+d,u,v+d+h,2],north:[u+d+w,v+d,u+d,v],south:[u+d+2*w,v+d,u+d+w,v]};
  E.group.add(ubox(E,w/16,d/16,h/16,(o[0]+w/2-8)/16,.0625-(o[2]+d/2)/16,(o[1]+h/2-16)/16,E.faceMap.up,R));
}
function bed(E){
  bedPiece(E,[0,0,0],[16,32,6],[0,0]);
  bedPiece(E,[3,31,6],[10,1,3],[38,2]);bedPiece(E,[3,0,6],[10,1,3],[38,38]);
  bedPiece(E,[15,3,6],[1,26,3],[52,6]);bedPiece(E,[0,3,6],[1,26,3],[44,6]);
  bedPiece(E,[13,29,6],[3,3,3],[12,38]);bedPiece(E,[0,29,6],[3,3,3],[0,38]);
  bedPiece(E,[13,0,6],[3,3,3],[12,44]);bedPiece(E,[0,0,6],[3,3,3],[0,44]);
}
function boxUV(w,h,d,u,v){
  return {east:[u,v+d,u+d,v+d+h],north:[u+d,v+d,u+d+w,v+d+h],west:[u+d+w,v+d,u+2*d+w,v+d+h],south:[u+2*d+w,v+d,u+2*d+2*w,v+d+h],up:[u+d,v,u+d+w,v+d],down:[u+d+w,v,u+d+2*w,v+d]};
}
function bell(E){
  var f=E.faceMap,e=f.north,w=f.east,st=f.west,G=E.group;
  var R={up:[0,0,2,4],down:[0,0,2,4],north:[0,1,2,16],south:[0,1,2,16],east:[0,1,4,16],west:[0,1,4,16]};
  [-.4375,.4375].forEach(function(x){G.add(ubox(E,.125,1,.25,x,0,0,st,R,16))});
  G.add(ubox(E,.75,.125,.125,0,.375,0,w,{up:[2,3,14,5],north:[2,2,14,4],south:[2,3,14,5]},16));
  G.add(ubox(E,.375,.4375,.375,0,.09375,0,e,boxUV(6,7,6,0,0),32));
  G.add(ubox(E,.5,.125,.5,0,-.1875,0,e,boxUV(8,2,8,0,13),32));
}
function brewing(E){
  var f=E.faceMap,S=f.north,B=f.down,G=E.group;
  var rs={up:[7,7,9,9],down:[7,7,9,9],north:[7,2,9,16],south:[7,2,9,16],east:[7,2,9,16],west:[7,2,9,16]};
  G.add(ubox(E,.125,.875,.125,0,-.0625,0,S,rs,16));
  var pa={up:[9,5,15,11],down:[9,5,15,11],north:[9,14,15,16],south:[9,14,15,16],west:[5,14,11,16],east:[5,14,11,16]};
  var pb={up:[1,1,7,7],down:[1,1,7,7],north:[1,14,7,16],south:[1,14,7,16],west:[1,14,7,16],east:[1,14,7,16]};
  var pc={up:[1,9,7,15],down:[1,9,7,15],north:[1,14,7,16],south:[1,14,7,16],west:[9,14,15,16],east:[9,14,15,16]};
  G.add(ubox(E,.375,.125,.375,.25,-.4375,0,B,pa,16));
  G.add(ubox(E,.375,.125,.375,-.25,-.4375,-.25,B,pb,16));
  G.add(ubox(E,.375,.125,.375,-.25,-.4375,.25,B,pc,16));
  var sm=E.mats[S];
  if(!sm)return;
  twoSided(E,S);
  function arm(x,ang,mir){
    var pg=new THREE.PlaneGeometry(.5,1),uv=pg.attributes.uv;
    for(var j=0;j<uv.count;j++)uv.setXY(j,mir?1-.5*uv.getX(j):.5+.5*uv.getX(j),uv.getY(j));
    var m=new THREE.Mesh(pg,sm);m.position.set(x,0,0);
    var pv=new THREE.Group();pv.rotation.y=ang;pv.add(m);G.add(pv);
  }
  arm(.25,0,false);arm(-.275625,PI4,true);arm(-.275625,-PI4,true);
}
function patch(E,id,w,h,x,y,z,rx,ry,r){
  twoSided(E,id);
  var m=plane(E,id,w,h,x,y,z,rx,ry),uv=m.geometry.attributes.uv;
  m.rotation.order='YXZ';r=r||[0,0,16,16];
  for(var i=0;i<uv.count;i++){
    var u=uv.getX(i),v=uv.getY(i);uv.setXY(i,(r[0]+u*(r[2]-r[0]))/16,1-(r[1]+(1-v)*(r[3]-r[1]))/16);
  }
  E.group.add(m);return m;
}
/* Stem: two UV-cut planes along the block axes, the same in the editor and in Find. */
function stem(E,id,w,h,y,z,r){
  patch(E,id,w,h,0,y,z,0,0,r);patch(E,id,w,h,0,y,z,0,Math.PI/2,r);
}
function leaf(E){
  var f=E.faceMap;
  if(E.cur==='big_dripleaf'){
    stem(E,f.north,6*Math.SQRT2/16,15/16,-1/32,.25,[3,0,14,16]);
    patch(E,f.east,1,1,0,7/16,0,-Math.PI/2,0);
    patch(E,f.up,1,.25,0,5/16,-.5,0,0,[0,0,16,4]);
    patch(E,f.down,1,.25,-.5,5/16,0,0,Math.PI/2,[0,0,16,4]);
    patch(E,f.down,1,.25,.5,5/16,0,0,Math.PI/2,[0,0,16,4]);
  }else{
    stem(E,f.south,7/16,1,-.5,0,[4,0,12,16]);stem(E,f.north,7/16,14/16,7/16,0,[4,0,12,14]);
    [[11.5,19,11.5,0],[4.5,24,4.5,0],[4.5,28,11.5,Math.PI/2]].forEach(function(l){
      var x=(l[0]-8)/16,y=(l[1]-16)/16,z=(l[2]-8)/16;
      patch(E,f.up,7/16,7/16,x,y,z,-Math.PI/2,l[3],[0,0,8,8]);
      patch(E,f.down,7/16,1/16,x,y-1/32,z-7/32,0,0,[0,0,8,1]);patch(E,f.down,7/16,1/16,x,y-1/32,z+7/32,0,0,[0,0,8,1]);
      patch(E,f.down,7/16,1/16,x-7/32,y-1/32,z,0,Math.PI/2,[0,0,8,1]);patch(E,f.down,7/16,1/16,x+7/32,y-1/32,z,0,Math.PI/2,[0,0,8,1]);
    });
  }
}
function dripstone(E){
  var f=E.faceMap,tip=E.slot===f.west?f.west:f.north;
  [f.up,f.south,f.down,tip].forEach(function(id,i){twoSided(E,id);cross(E,id,Math.SQRT2*.5,.5,.75-i*.5,0,0)});
}
function flat(E){var f=E.faceMap,id=E.slot===f.up?f.up:f.down;twoSided(E,id);E.group.add(plane(E,id,1,1,0,0,0,-Math.PI/2,0))}
function decal(E){var id=E.faceMap.south;twoSided(E,id);E.group.add(plane(E,id,1,1,0,0,-.49,0,0))}
function candle(E){
  var f=E.faceMap,id=f.east,G=E.group,wm=E.mats[id];
  var R={north:[0,8,2,14],south:[0,8,2,14],east:[0,8,2,14],west:[0,8,2,14],up:[0,6,2,8],down:[0,14,2,16]};
  G.add(ubox(E,.125,.375,.125,0,-.3125,0,id,R,16));
  if(!wm)return;twoSided(E,id);
  [PI4,-PI4].forEach(function(ry){
    var pg=new THREE.PlaneGeometry(.0625,.0625),pu=pg.attributes.uv;
    for(var j=0;j<pu.count;j++)pu.setXY(j,pu.getX(j)/16,.625+pu.getY(j)/16);
    var pm=new THREE.Mesh(pg,wm);pm.position.set(0,-.09375,0);pm.rotation.y=ry;G.add(pm);
  });
}
function build(E){
  var s=E.shape,g=E.group;
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return sprite(E);
  if(E.cur==='pointed_dripstone')return dripstone(E);
  if(E.cur==='brewing_stand')return brewing(E);
  if(s==='azalea')return azalea(E);
  if(s==='plant')return plant(E);
  if(s==='beacon')return beacon(E);if(s==='door')return door(E);if(s==='pane')return pane(E);if(s==='anvil')return anvil(E);
  if(s==='bed')return bed(E);if(s==='bell')return bell(E);if(s==='dripleaf')return leaf(E);if(s==='rail')return flat(E);if(s==='decal')return decal(E);
  if(s==='candle')return candle(E);
  var d=E.SHAPES[s]||E.SHAPES.cube,rot=(s==='cube'&&/_glazed_terracotta$/.test(E.cur))?GLZ:null;
  d.parts.forEach(function(a){
    g.add(box.apply(null,[E].concat(a,[undefined,0,1,rot])));
  });
  if(d.shift)g.children.forEach(function(m){m.position.y+=d.shift});
}
return {build:build,SHAPES:SHAPES,icon:icon,view:view};
})();
