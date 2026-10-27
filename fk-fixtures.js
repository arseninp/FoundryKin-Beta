/* Ladder, lectern, lever, shelves, carpet families and complete two-block flowers. Load after fk-details.js. */
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
  var pm=cat.b.pale_moss_carpet;
  if(pm){
    var ex=(c.extra&&c.extra.pale_moss_carpet)||[],base=ex.filter(function(p){return /_side_base$/.test(p)})[0],tip=ex.filter(function(p){return /_side_tip$/.test(p)})[0];
    if(!base||!tip||!existing||!existing[base]||!existing[tip])throw new Error('Pale moss side resources are incomplete');
    var paths=[];pm.concat([base,tip]).forEach(function(p){if(paths.indexOf(p)<0)paths.push(p)});
    cat.sp.pale_moss_carpet={kind:'pale_moss',list:paths.map(function(p){return {id:p}}),fm:{up:pm[0],down:pm[1],north:pm[2],south:pm[3],east:pm[4],west:pm[5],sideBase:base,sideTip:tip}};
  }
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
/* Java template_shelf_body plus its unpowered inset; UVs are normalized to the full sheet.
   The local half-turn presents the opening to the common view, identically on both screens. */
function shelf(E){
  var id=E.faceMap.up,g=new THREE.Group(),e=Object.create(E);e.group=g;
  box(e,[0,0,13],[16,16,16],{east:id,south:id,west:id,up:id,down:id},{east:[8,0,9.5,8],south:[8,0,16,8],west:[14.5,0,16,8],up:[16,5,8,3.5],down:[16,6,8,4.5]});
  box(e,[0,0,11],[16,4,13],{north:id,east:id,west:id,up:id,down:id},{north:[0,6,8,8],east:[1.5,6,2.5,8],west:[5.5,6,6.5,8],up:[8,3.5,16,4.5],down:[16,4.5,8,3.5]});
  box(e,[0,12,11],[16,16,13],{north:id,east:id,west:id,up:id,down:id},{north:[0,0,8,2],east:[1.5,0,2.5,2],west:[5.5,0,6.5,2],up:[16,6,8,5],down:[8,5,16,6]});
  box(e,[0,4,13],[16,12,13],{north:id},{north:[0,2,8,6]});
  g.rotation.y=Math.PI;E.group.add(g);
}
var MOSS_DIRS=['north','south','east','west'];
function paleState(input){
 input=input||{};var upper=input.upper_block_bit===undefined?false:input.upper_block_bit,sides={};
 if(typeof upper!=='boolean')throw new Error('Invalid upper_block_bit');
 MOSS_DIRS.forEach(function(d){var v=input['pale_moss_carpet_side_'+d]||'none';if(['none','short','tall'].indexOf(v)<0)throw new Error('Invalid moss side');sides[d]=v});
 return {upper:upper,sides:sides};
}
H.paleMossState=paleState;
H.stateSchema=function(id){
 if(id!=='pale_moss_carpet')return null;
 var schema=[{key:'upper_block_bit',label:['Upper part','Верхняя часть'],values:[{value:false,label:['No','Нет']},{value:true,label:['Yes','Да']}]}];
 MOSS_DIRS.forEach(function(d,i){schema.push({key:'pale_moss_carpet_side_'+d,label:[['North','South','East','West'][i],['Север','Юг','Восток','Запад'][i]],values:[{value:'none',label:['None','Нет']},{value:'short',label:['Short','Короткая']},{value:'tall',label:['Tall','Высокая']}]})});return schema;
};
/* Full-height inset side planes; transparent pixels define the visible outline.
 Java mossy_carpet_side is a geometry reference, Bedrock uses base/tip images. */
function paleMoss(E){
 var s=paleState(E.state),f=E.faceMap;
 if(!s.upper){var F={up:f.up,down:f.down,north:f.north,south:f.south,east:f.east,west:f.west},R={up:[0,0,16,16],down:[0,0,16,16],north:[0,15,16,16],south:[0,15,16,16],east:[0,15,16,16],west:[0,15,16,16]};box(E,[0,0,0],[16,1,16],F,R)}
 MOSS_DIRS.forEach(function(d){
  var level=s.sides[d];if(level==='none')return;
  var id=s.upper||level==='short'?f.sideTip:f.sideBase;
  if(!id||!E.mats[id])throw new Error('Missing pale moss side material');
  var g=new THREE.Group(),e=Object.create(E);e.group=g;
  face(e,id,1,1,0,0,-7.9/16,0,Math.PI,[16,0,0,16]);
  face(e,id,1,1,0,0,-7.9/16,0,0,[0,0,16,16]);
  g.rotation.y={north:0,east:-Q,south:Math.PI,west:Q}[d];E.group.add(g);
 });
}
/* Custom atlas UVs: Java custom_fence_post, custom_fence_side_east/west and
 template_custom_fence_gate are geometry references. Bedrock paths remain catalog-owned. */
function bambooFence(E){
  var id=E.faceMap.up,F={north:id,south:id,east:id,west:id,up:id,down:id},side=[0,0,4,16];
  box(E,[6,0,6],[10,16,10],F,{north:side,south:side,east:side,west:side,up:[4,0,8,4],down:[4,0,8,4]});
  [6,12].forEach(function(y){
    box(E,[7,y,7],[16,y+3,9],{north:id,east:id,south:id,up:id,down:id},{north:[4,4,13,7],east:[13,4,15,7],south:[4,4,13,7],up:[13,7,15,16,270],down:[13,7,15,16,90]});
    box(E,[0,y,7],[9,y+3,9],{north:id,south:id,west:id,up:id,down:id},{north:[4,4,13,7],south:[4,4,13,7],west:[15,4,13,7],up:[13,7,15,16,270],down:[13,7,15,16,90]});
  });
}
function bambooGate(E){
  var id=E.faceMap.up,F={north:id,south:id,east:id,west:id,up:id,down:id},a=[14,2,16,13],b=[0,2,2,13];
  box(E,[0,5,7],[2,16,9],F,{north:a,east:a,south:a,west:a,up:[14,0,16,2],down:[16,13,14,15]});
  box(E,[14,5,7],[16,16,9],F,{north:b,east:b,south:b,west:b,up:[0,0,2,2],down:[2,13,0,15]});
  box(E,[6,6,7],[8,15,9],{north:id,south:id,west:id,up:id,down:id},{north:[8,3,10,12],south:[6,3,8,12],west:[8,3,10,12],up:[8,1,10,3],down:[8,14,10,12]});
  box(E,[8,6,7],[10,15,9],{north:id,east:id,south:id,up:id,down:id},{north:[6,3,8,12],east:[6,3,8,12],south:[8,3,10,12],up:[6,1,8,3],down:[6,14,8,12]});
  [6,12].forEach(function(y){
    box(E,[2,y,7],[6,y+3,9],{north:id,south:id,up:id,down:id},{north:[10,3,14,6],south:[10,9,14,12],up:[10,1,14,3],down:[10,14,14,12]});
    box(E,[10,y,7],[14,y+3,9],{north:id,south:id,up:id,down:id},{north:[2,3,6,6],south:[2,9,6,12],up:[2,1,6,3],down:[2,14,6,12]});
  });
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
/* Two planes along the block axes, the same in the editor and in Find (width sqrt(2) shows the square texture undistorted from the corner view). */
function cross(E,id,y,h,r){
  face(E,id,Math.SQRT2,h,0,y,0,0,0,r,true);
  face(E,id,Math.SQRT2,h,0,y,0,0,Q,r,true);
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
  if(E.cur==='bamboo_fence')return bambooFence(E);
  if(E.cur==='bamboo_fence_gate')return bambooGate(E);
  if(E.cur==='pale_moss_carpet')return paleMoss(E);
  if(/_shelf$/.test(E.cur))return shelf(E);
  if(E.cur==='ladder')return ladder(E);
  if(E.cur==='lectern')return lectern(E);
  if(E.cur==='lever')return lever(E);
  if(Object.prototype.hasOwnProperty.call(FLOWERS,E.cur))return flower(E);
  return build(E);
};
})();
