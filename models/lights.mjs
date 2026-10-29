/* Light geometry migrated from fk-lights.js. Catalog ownership and icon dispatch stay outside builders. */
export function createLightModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Light models require Three');
 const Q=Math.PI/2;
 function face(E,id,w,h,x,y,z,rx,ry,r,dbl) {
  const mat=E.mats[id];if(!mat||mat===E.hiddenMat)throw new Error('Missing light material: '+id);
  if(dbl){mat.side=Three.DoubleSide;mat.needsUpdate=true;}
  const g=new Three.PlaneGeometry(w,h),uv=g.attributes.uv;r=r||[0,0,16,16];
  for(let i=0;i<uv.count;i++){
   const a=uv.getX(i),b=1-uv.getY(i);let s=a,t=b;
   if(r[4]===90){s=b;t=1-a;}else if(r[4]===180){s=1-a;t=1-b;}else if(r[4]===270){s=1-b;t=a;}
   uv.setXY(i,(r[0]+s*(r[2]-r[0]))/16,1-(r[1]+t*(r[3]-r[1]))/16);
  }
  const m=new Three.Mesh(g,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);E.group.add(m);
 }
 function box(E,lo,hi,F) {
  const w=(hi[0]-lo[0])/16,h=(hi[1]-lo[1])/16,d=(hi[2]-lo[2])/16,x=(lo[0]+hi[0]-16)/32,y=(lo[1]+hi[1]-16)/32,z=(lo[2]+hi[2]-16)/32;
  const p={north:[w,h,x,y,(lo[2]-8)/16,0,Math.PI],south:[w,h,x,y,(hi[2]-8)/16,0,0],east:[d,h,(hi[0]-8)/16,y,z,0,Q],west:[d,h,(lo[0]-8)/16,y,z,0,-Q],up:[w,d,x,(hi[1]-8)/16,z,-Q,0],down:[w,d,x,(lo[1]-8)/16,z,Q,0]};
  for(const [key,f] of Object.entries(F))face(E,f[0],...p[key],f.slice(1));
 }
 function six(id,side,top,bottom){const s=[id,...side];return {north:s,south:s,east:s,west:s,up:[id,...top],down:[id,...(bottom||top)]};}
 function lantern(E){
  const id=E.faceMap.up;
  box(E,[5,0,5],[11,7,11],six(id,[0,2,6,9],[0,9,6,15]));
  const cap=six(id,[1,0,5,2],[1,10,5,14]);delete cap.down;box(E,[6,7,6],[10,9,10],cap);
  face(E,id,3/16,2/16,0,2/16,0,0,Math.PI/4,[11,1,14,3],true);
  face(E,id,3/16,2/16,0,2/16,0,0,-Math.PI/4,[11,10,14,12],true);
 }
 function strip(E,id){
  const im=E.mats[id]?.map?.image;
  try{
   if(!im)return [0,0,3,16];
   const w=im.width,h=im.height,d=im.data||(im.getContext&&im.getContext('2d').getImageData(0,0,w,h).data);
   if(!d||!w||!h)return [0,0,3,16];
   let a=w,b=-1;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){a=Math.min(a,x);b=Math.max(b,x);}
   return b<a?[0,0,3,16]:[16*a/w,0,16*(b+1)/w,16];
  }catch{return [0,0,3,16];}
 }
 function chain(E){const f=E.faceMap;face(E,f.up,3/16,1,0,0,0,0,Math.PI/4,strip(E,f.up),true);face(E,f.north,3/16,1,0,0,0,0,-Math.PI/4,strip(E,f.north),true);}
 function torch(E){const id=E.faceMap.up;box(E,[7,0,7],[9,10,9],six(id,[7,6,9,16],[7,6,9,8],[7,13,9,15]));}
 function campfire(E){
  if(E.state?.lit!==undefined&&typeof E.state.lit!=='boolean')throw new Error('Campfire lit state must be boolean');
  const f=E.faceMap,off=E.state?.lit===false,L=f.down,T=off?L:f.north;
  const uv=(id,a,rot)=>[id,...a,...(rot?[rot]:[])];
  const end=uv(L,[0,4,4,8]),raw=uv(L,[0,0,16,4]),rawR=uv(L,[16,0,0,4]),long=uv(L,[0,0,16,4],90),top=uv(L,[0,0,16,4],180),lit=uv(T,[0,0,16,4]),litR=uv(T,[16,0,0,4]),under=uv(T,[0,4,16,8]);
  box(E,[1,0,0],[5,4,16],{north:end,south:end,east:uv(T,[0,1,16,5]),west:rawR,up:long,down:long});
  box(E,[11,0,0],[15,4,16],{north:end,south:end,east:raw,west:uv(T,[16,1,0,5]),up:long,down:long});
  box(E,[0,3,11],[16,7,15],{north:litR,south:lit,east:end,west:end,up:top,down:under});
  box(E,[0,3,1],[16,7,5],{north:lit,south:litR,east:end,west:end,up:top,down:under});
  box(E,[5,0,0],[11,1,16],{north:uv(L,[0,15,6,16]),south:uv(L,[10,15,16,16]),up:uv(T,[0,8,16,14],90),down:uv(L,[0,8,16,14],90)});
  if(!off){const w=.9*Math.SQRT2;face(E,f.up,w,1,0,1/16,0,0,Math.PI/4,[0,0,16,16],true);face(E,f.up,w,1,0,1/16,0,0,-Math.PI/4,[0,0,16,16],true);}
 }
 return [{id:'lantern',scale:1,mode:'volume',build:lantern},{id:'chain',scale:1,mode:'volume',build:chain},{id:'torch',scale:1,mode:'volume',build:torch},{id:'campfire',scale:1,mode:'volume',build:campfire}];
}
