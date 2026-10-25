/* Detail block models. Load after fk-lights.js and before fk-core.js. */
(function(){
var C=window.FKCatalog,H=window.FKShapes;if(!C||!H)return;
var oldIndex=C.index,oldBuild=H.build,P='textures/blocks/',Q=Math.PI/2,BASE=P+'conduit_base';
function kind(id){if(id==='cauldron'||id==='lava_cauldron')return 'cauldron';if(id==='end_rod')return 'end';if(/(^|_)lightning_rod$/.test(id))return 'rod';if(id==='iron_bars'||/(^|_)copper_bars$/.test(id))return 'bars';if(id==='daylight_detector')return 'daylight';if(id==='grindstone'||id==='flower_pot'||id==='decorated_pot'||id==='end_portal'||id==='end_gateway'||id==='dried_ghast'||id==='fire'||id==='soul_fire'||id==='frame'||id==='glow_frame'||id==='hopper'||id==='heavy_core')return id;return id==='cocoa'||id==='conduit'?id:''}
/* Flat sprite mode: shown face-on, no idle rotation and no dragging. Used for End blocks (drawn by the engine) and item icons. */
H.flat=function(id,slot){return id==='end_portal'||id==='end_gateway'||(typeof slot==='string'&&slot.indexOf('textures/items/')===0)};
C.index=function(c,existing){
  var cat=oldIndex(c,existing);
  cat.ids.forEach(function(id){
    var b=cat.b[id],k=kind(id);if(!k)return;
    if(k==='cocoa'){
      var a=P+'cocoa_stage_0',m=P+'cocoa_stage_1',z=P+'cocoa_stage_2';
      cat.sp[id]={kind:'details',list:[{id:z},{id:m},{id:a}],fm:{up:z,down:a,north:m,south:z,east:z,west:z}};
    }else if(k==='conduit'){
      cat.sp[id]={kind:'details',list:[{id:BASE}],fm:{up:BASE,down:BASE,north:BASE,south:BASE,east:BASE,west:BASE}};
    }else if(k==='cauldron'){
      var list=[],seen={};
      b.forEach(function(p){if(!seen[p]){seen[p]=1;list.push({id:p})}});
      cat.sp[id]={kind:'details',list:list,fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]}};
    }else if(k==='decorated_pot'){
      var sd=b[2],bs=P+'decorated_pot_base';
      cat.sp[id]={kind:'details',list:[{id:sd},{id:bs}],fm:{up:bs,down:bs,north:sd,south:sd,east:sd,west:sd}};
    }else if(k==='dried_ghast'){
      var tn=(cat.cr&&cat.cr[id])||P+'dried_ghast_tentacles',gl=[],gs={};
      b.concat([tn]).forEach(function(p){if(!gs[p]){gs[p]=1;gl.push({id:p})}});
      cat.sp[id]={kind:'details',list:gl,fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5],tent:tn}};
    }
  });
  var d=cat.b.daylight_detector,inv=cat.b.daylight_detector_inverted;
  if(d){
    var top=d[0],side=d[2],night=inv&&inv[0]!==top?inv[0]:P+'daylight_detector_inverted_top';
    cat.sp.daylight_detector={kind:'details',list:[{id:top},{id:night},{id:side}],fm:{up:top,down:side,north:side,south:side,east:side,west:night}};
    cat.b.daylight_detector=[top,side,side,side,side,night];
    delete cat.b.daylight_detector_inverted;delete cat.sp.daylight_detector_inverted;
    delete cat.cr.daylight_detector;delete cat.cr.daylight_detector_inverted;
    cat.ids=cat.ids.filter(function(id){return id!=='daylight_detector_inverted'});
    cat.sig={};cat.members={};cat.mother={};
    cat.ids.forEach(function(id){var sg=cat.b[id].join('|');cat.sig[id]=sg;(cat.members[sg]=cat.members[sg]||[]).push(id);cat.mother[id]=id});
    cat.mother.daylight_detector_inverted='daylight_detector';
    if(inv)cat.hidden=(cat.hidden||0)+1;
  }
  return cat;
};
function planeMesh(mat,w,h,r){
  r=r||[0,0,16,16];var g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,k=r[4];
  for(var i=0;i<uv.count;i++){var a=uv.getX(i),b=1-uv.getY(i),s=k===90?b:k===270?1-b:a,t=k===90?1-a:k===270?a:b;uv.setXY(i,(r[0]+s*(r[2]-r[0]))/16,1-(r[1]+t*(r[3]-r[1]))/16)}
  return new THREE.Mesh(g,mat);
}
function face(E,id,w,h,x,y,z,rx,ry,r,dbl){
  var mat=E.mats[id];if(!mat||mat===E.hiddenMat)return;
  if(dbl){mat.side=THREE.DoubleSide;mat.needsUpdate=true}
  var m=planeMesh(mat,w,h,r);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
}
function autoUV(a,b){return {north:[16-b[0],16-b[1],16-a[0],16-a[1]],south:[a[0],16-b[1],b[0],16-a[1]],east:[16-b[2],16-b[1],16-a[2],16-a[1]],west:[a[2],16-b[1],b[2],16-a[1]],up:[a[0],a[2],b[0],b[2]],down:[a[0],16-b[2],b[0],16-a[2]]}}
function box(E,a,b,ids,R){
  R=R||autoUV(a,b);var w=(b[0]-a[0])/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])/16,x=(a[0]+b[0]-16)/32,y=(a[1]+b[1]-16)/32,z=(a[2]+b[2]-16)/32;
  var p={north:[w,h,x,y,(a[2]-8)/16,0,Math.PI],south:[w,h,x,y,(b[2]-8)/16,0,0],east:[d,h,(b[0]-8)/16,y,z,0,Q],west:[d,h,(a[0]-8)/16,y,z,0,-Q],up:[w,d,x,(b[1]-8)/16,z,-Q,0],down:[w,d,x,(a[1]-8)/16,z,Q,0]};
  Object.keys(ids).forEach(function(k){face.apply(null,[E,ids[k]].concat(p[k],[R[k],false]))});
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
  face(E,B,1,1,0,0,0,0,0,[0,0,16,16],true);
  face(E,S,.125,1,-.5,0,0,0,-Q,[7,0,9,16],true);
  face(E,S,.125,1,.5,0,0,0,Q,[7,0,9,16],true);
  face(E,S,1,.125,0,.49994,0,-Q,0,[7,0,9,16,90],true);
  face(E,S,1,.125,0,-.49994,0,Q,0,[7,0,9,16,90],true);
}
function cocoa(E){
  var f=E.faceMap,n=E.slot===f.down?0:E.slot===f.north?1:2,id=n===0?f.down:n===1?f.north:f.up,w=4+2*n,h=5+2*n;
  box(E,[8-w/2,12-h,15-w],[8+w/2,12,15],six(id),rects([15-w,4,15,4+h],[0,0,w-1,w-1]));
  face(E,id,.25,.25,0,.375,.375,0,Q,[16,0,12,4],true);
}
function conduit(E){
  var id=E.faceMap.up,R={east:[0,4,4,8],north:[4,4,8,8],west:[8,4,12,8],south:[12,4,16,8],up:[4,0,8,4],down:[8,0,12,4]};
  box(E,[5,5,5],[11,11,11],six(id),R);
}
function daylight(E){
  var f=E.faceMap,top=E.slot===f.west?f.west:f.up;
  box(E,[0,0,0],[16,6,16],{up:top,down:f.down,north:f.north,south:f.north,east:f.north,west:f.north},rects([0,10,16,16],[0,0,16,16],[0,0,16,16]));
}
/* Grindstone: Java block model used as a geometry reference (legs, pivots, wheel). Bedrock faces: up=round, down=leg, north=pivot, east/south/west=side. */
function grindstone(E){
  var f=E.faceMap,L=f.down,Pv=f.north,Rd=f.up,Sd=f.east;
  box(E,[12,0,6],[14,7,10],{north:L,east:L,south:L,west:L,down:L},{north:[2,9,4,16],east:[10,16,6,9],south:[12,9,14,16],west:[6,9,10,16],down:[12,6,14,10]});
  box(E,[2,0,6],[4,7,10],{north:L,east:L,south:L,west:L,down:L},{north:[12,9,14,16],east:[10,16,6,9],south:[2,9,4,16],west:[6,9,10,16],down:[2,6,4,10]});
  box(E,[12,7,5],[14,13,11],{north:Pv,east:Pv,south:Pv,up:Pv,down:Pv},{north:[6,0,8,6],east:[0,0,6,6],south:[6,0,8,6],up:[8,0,10,6],down:[8,0,10,6]});
  box(E,[2,7,5],[4,13,11],{north:Pv,south:Pv,west:Pv,up:Pv,down:Pv},{north:[6,0,8,6],south:[6,0,8,6],west:[0,0,6,6],up:[8,0,10,6],down:[8,0,10,6]});
  box(E,[4,4,2],[12,16,14],{north:Rd,east:Sd,south:Rd,west:Sd,up:Rd,down:Rd},{north:[0,0,8,12],east:[0,0,12,12],south:[0,0,8,12],west:[0,0,12,12],up:[0,0,8,12],down:[0,0,8,12]});
}
/* Empty flower pot: four 1 px walls 6 px high and a 4 px base. The soil top reuses the pot texture as a stand-in. */
function flowerPot(E){
  var id=E.faceMap.up;
  box(E,[5,0,5],[6,6,11],six(id),{down:[5,5,6,11],up:[5,5,6,11],north:[10,10,11,16],south:[5,10,6,16],west:[5,10,11,16],east:[5,10,11,16]});
  box(E,[10,0,5],[11,6,11],six(id),{down:[10,5,11,11],up:[10,5,11,11],north:[5,10,6,16],south:[10,10,11,16],west:[5,10,11,16],east:[5,10,11,16]});
  box(E,[6,0,5],[10,6,6],{north:id,south:id,up:id,down:id},{down:[6,10,10,11],up:[6,5,10,6],north:[6,10,10,16],south:[6,10,10,16]});
  box(E,[6,0,10],[10,6,11],{north:id,south:id,up:id,down:id},{down:[6,5,10,6],up:[6,10,10,11],north:[6,10,10,16],south:[6,10,10,16]});
  box(E,[6,0,6],[10,4,10],{up:id,down:id},{down:[6,12,10,16],up:[6,6,10,10]});
}
/* Decorated pot: sides use decorated_pot_side (columns 1..15). decorated_pot_base is a 32x32 sheet (Java layout, rects below are in 1/16 of the sheet): neck top/bottom and sides at the top, the narrow lip below them, then body top and bottom. */
function decoratedPot(E){
  var f=E.faceMap,S=f.north,B=f.up,SR=[1,0,15,16];
  box(E,[1,0,1],[15,16,15],{north:S,south:S,east:S,west:S,up:B,down:B},{north:SR,south:SR,east:SR,west:SR,up:[0,6.5,7,13.5],down:[7,6.5,14,13.5]});
  box(E,[5,16,5],[11,17,11],six(B),{east:[0,5.5,3,6],north:[3,5.5,6,6],west:[6,5.5,9,6],south:[9,5.5,12,6],up:[3,2.5,6,5.5],down:[6,2.5,9,5.5]});
  box(E,[4,17,4],[12,20,12],six(B),{east:[0,4,4,5.5],north:[4,4,8,5.5],west:[8,4,12,5.5],south:[12,4,16,5.5],up:[4,0,8,4],down:[8,0,12,4]});
}
/* Dried ghast: Java block model (10x10x10 body and six 1 px tentacles) used as a geometry reference. The Bedrock face textures sit on the opposite sides from the Java ones, so the body textures are turned half a circle: the face is opposite the tentacles. Bedrock faces: up=top, down=bottom, north=back, south=front, east=left, west=right, tent=tentacles. */
function driedGhast(E){
  var f=E.faceMap,T=f.tent;
  box(E,[3,0,3],[13,10,13],{north:f.south,east:f.west,south:f.north,west:f.east,up:f.up,down:f.down},{north:[0,0,10,10],east:[0,0,10,10],south:[0,0,10,10],west:[0,0,10,10],up:[0,0,10,10],down:[0,10,10,0]});
  box(E,[0,0,5],[3,1,7],six(T),{north:[1,1.5,2.5,2],east:[0,1.5,1,2],south:[3.5,1.5,5,2],west:[2.5,1.5,3.5,2],up:[2.5,1.5,1.5,0,90],down:[2.5,1.5,3.5,0,90]});
  box(E,[0,0,9],[3,1,11],six(T),{north:[1,3.5,2.5,4],east:[0,3.5,1,4],south:[3.5,3.5,5,4],west:[2.5,3.5,3.5,4],up:[2.5,3.5,1.5,2,90],down:[2.5,3.5,3.5,2,90]});
  box(E,[13,0,5],[16,1,7],six(T),{north:[2.5,7.5,1,8],east:[3.5,7.5,2.5,8],south:[5,7.5,3.5,8],west:[1,7.5,0,8],up:[2.5,6,1.5,7.5,90],down:[2.5,6,3.5,7.5,90]});
  box(E,[13,0,9],[16,1,11],six(T),{north:[2.5,5.5,1,6],east:[3.5,5.5,2.5,6],south:[5,5.5,3.5,6],west:[1,5.5,0,6],up:[2.5,4,1.5,5.5,90],down:[2.5,4,3.5,5.5,90]});
  box(E,[9,0,13],[11,1,16],six(T),{north:[6,2.5,5,3],east:[7.5,2.5,6,3],south:[8.5,2.5,7.5,3],west:[10,2.5,8.5,3],up:[6,2.5,7.5,1.5,90],down:[7.5,1.5,9,2.5,270]});
  box(E,[5,0,13],[7,1,16],six(T),{north:[6,1,5,1.5],east:[7.5,1,6,1.5],south:[8.5,1,7.5,1.5],west:[10,1,8.5,1.5],up:[6,1,7.5,0,90],down:[7.5,0,9,1,270]});
}
/* Fire and soul fire: four inner planes and four perimeter planes, all starting at the block floor. No roof planes. */
function fire(E){
  var f=E.faceMap,id=E.slot===f.down?f.down:f.up,mat=E.mats[id],G=E.group;
  if(!mat||mat===E.hiddenMat)return;
  mat.side=THREE.DoubleSide;mat.needsUpdate=true;
  [[0,.05,0,22.5,0],[0,-.05,0,-22.5,0],[.05,0,Q,0,-22.5],[-.05,0,Q,0,22.5]].forEach(function(p){
    var m=planeMesh(mat,1,1.4),pv=new THREE.Group();
    m.position.set(0,.7,0);m.rotation.set(0,p[2],0);
    pv.position.set(p[0],-.5,p[1]);pv.rotation.x=p[3]*Math.PI/180;pv.rotation.z=p[4]*Math.PI/180;
    pv.add(m);G.add(pv);
  });
  [[0,-.4994,0],[0,.4994,0],[.4994,0,Q],[-.4994,0,Q]].forEach(function(p){
    var m=planeMesh(mat,1,1.4);m.position.set(p[0],.2,p[1]);m.rotation.set(0,p[2],0);G.add(m);
  });
}
/* Hopper pointing down: open rim, inside floor, lower body and outlet. */
function hopper(E){
  var f=E.faceMap,I=f.down,O=f.north,T=f.up;
  box(E,[0,10,0],[16,11,16],{up:I,down:I,north:O,south:O,east:O,west:O});
  [[[0,11,0],[2,16,16]],[[14,11,0],[16,16,16]]].forEach(function(p){box(E,p[0],p[1],{up:T,north:O,south:O,east:O,west:O})});
  [[[2,11,0],[14,16,2]],[[2,11,14],[14,16,16]]].forEach(function(p){box(E,p[0],p[1],{up:T,north:O,south:O})});
  box(E,[4,4,4],[12,10,12],{down:I,north:O,south:O,east:O,west:O});
  box(E,[6,0,6],[10,4,10],{down:I,north:O,south:O,east:O,west:O});
}
function heavyCore(E){
  var id=E.faceMap.up;
  box(E,[4,0,4],[12,8,12],six(id),rects([0,8,8,16],[0,0,8,8],[8,0,16,8]));
}
/* Item frame and glow item frame: one 16x16x1 panel centred in the block that uses the whole 16x16 texture. */
function itemFrame(E){
  var id=E.faceMap.up;
  box(E,[0,0,7.5],[16,16,8.5],six(id),{north:[0,0,16,16],south:[0,0,16,16],up:[0,0,16,1],down:[0,15,16,16],east:[0,0,1,16],west:[15,0,16,16]});
}
/* End portal and End gateway are drawn by the game engine, so the editor shows the texture as one flat sprite. */
function endSprite(E){face(E,E.faceMap.up,1.1,1.1,0,0,0,0,0,[0,0,16,16],true)}
H.build=function(E){
  if(typeof E.slot==='string'&&E.slot.indexOf('textures/items/')===0)return oldBuild(E);
  var k=kind(E.cur);if(!k)return oldBuild(E);
  if(k==='cauldron')return cauldron(E);if(k==='end')return end(E);if(k==='rod')return rod(E);if(k==='bars')return bars(E);if(k==='cocoa')return cocoa(E);if(k==='daylight')return daylight(E);
  if(k==='grindstone')return grindstone(E);if(k==='flower_pot')return flowerPot(E);if(k==='decorated_pot')return decoratedPot(E);if(k==='end_portal'||k==='end_gateway')return endSprite(E);
  if(k==='dried_ghast')return driedGhast(E);if(k==='fire'||k==='soul_fire')return fire(E);if(k==='frame'||k==='glow_frame')return itemFrame(E);
  if(k==='hopper')return hopper(E);if(k==='heavy_core')return heavyCore(E);
  return conduit(E);
};
})();
