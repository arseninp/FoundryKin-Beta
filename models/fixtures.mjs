/* Accepted fixture geometry; no catalog mutation or editing-slot dispatch. */
export function createFixtureModels(Three) {
 if (!Three || typeof Three.BoxGeometry !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.Mesh !== 'function' || Three.DoubleSide === undefined) throw new Error('Fixture models require Three');
 function material(E,id) {
  const mat=E.mats[id];if(!mat||mat===E.hiddenMat)throw new Error('Missing fixture material: '+id);return mat;
 }
 function double(E,id){const mat=material(E,id);mat.side=Three.DoubleSide;mat.needsUpdate=true;return mat;}
 function box(E,w,h,d,x,y,z,ids){
  const g=new Three.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);
   let u,v;
   if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=Y+.5;}
   else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=Y+.5;}
   else{u=X+.5;v=ny>0?.5-Z:Z+.5;}
   uv.setXY(i,u,v);
  }
  const mesh=new Three.Mesh(g,ids.map(id=>material(E,id)));mesh.position.set(x,y,z);E.group.add(mesh);
 }
 function ubox(E,w,h,d,x,y,z,id,R){
  const g=new Three.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   const nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),lx=p.getX(i)/w+.5,ly=p.getY(i)/h+.5,lz=p.getZ(i)/d+.5;
   let f,a,b;
   if(nx>.5){f='east';a=1-lz;b=ly;}else if(nx<-.5){f='west';a=lz;b=ly;}
   else if(nz>.5){f='south';a=lx;b=ly;}else if(nz<-.5){f='north';a=1-lx;b=ly;}
   else if(ny>.5){f='up';a=lx;b=1-lz;}else{f='down';a=lx;b=lz;}
   const r=R[f]||R.up,k=r[4]||0,s=k?1-b:a,t=k===1?1-a:k===2?a:1-b;
   uv.setXY(i,(r[0]+s*(r[2]-r[0]))/16,1-(r[1]+t*(r[3]-r[1]))/16);
  }
  const mesh=new Three.Mesh(g,material(E,id));mesh.position.set(x,y,z);E.group.add(mesh);
 }
 function pane(E){const f=E.faceMap,e=f.edge||f.east,g=f.south;box(E,1,1,.125,0,0,0,[e,e,e,e,g,g]);}
 function candle(E){
  const id=E.faceMap.east,R={north:[0,8,2,14],south:[0,8,2,14],east:[0,8,2,14],west:[0,8,2,14],up:[0,6,2,8],down:[0,14,2,16]};
  ubox(E,.125,.375,.125,0,-.3125,0,id,R);
  const mat=double(E,id);
  for(const angle of [Math.PI/4,-Math.PI/4]){
   const g=new Three.PlaneGeometry(.0625,.0625),uv=g.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/16,.625+uv.getY(i)/16);
   const mesh=new Three.Mesh(g,mat);mesh.position.set(0,-.09375,0);mesh.rotation.y=angle;E.group.add(mesh);
  }
 }
 function brewing(E){
  if(typeof Three.Group!=='function')throw new Error('Brewing model requires Three.Group');
  const f=E.faceMap,S=f.north,B=f.down;
  ubox(E,.125,.875,.125,0,-.0625,0,S,{up:[7,7,9,9],down:[7,7,9,9],north:[7,2,9,16],south:[7,2,9,16],east:[7,2,9,16],west:[7,2,9,16]});
  ubox(E,.375,.125,.375,.25,-.4375,0,B,{up:[9,5,15,11],down:[9,5,15,11],north:[9,14,15,16],south:[9,14,15,16],west:[5,14,11,16],east:[5,14,11,16]});
  ubox(E,.375,.125,.375,-.25,-.4375,-.25,B,{up:[1,1,7,7],down:[1,1,7,7],north:[1,14,7,16],south:[1,14,7,16],west:[1,14,7,16],east:[1,14,7,16]});
  ubox(E,.375,.125,.375,-.25,-.4375,.25,B,{up:[1,9,7,15],down:[1,9,7,15],north:[1,14,7,16],south:[1,14,7,16],west:[9,14,15,16],east:[9,14,15,16]});
  const mat=double(E,S);
  for(const [x,angle,mirror] of [[.25,0,false],[-.275625,Math.PI/4,true],[-.275625,-Math.PI/4,true]]){
   const g=new Three.PlaneGeometry(.5,1),uv=g.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,mirror?1-.5*uv.getX(i):.5+.5*uv.getX(i),uv.getY(i));
   const mesh=new Three.Mesh(g,mat);mesh.position.set(x,0,0);const pivot=new Three.Group();pivot.rotation.y=angle;pivot.add(mesh);E.group.add(pivot);
  }
 }
 return [{id:'pane',scale:1,mode:'volume',build:pane},{id:'candle',scale:1,mode:'volume',build:candle},{id:'brewing',scale:1,mode:'volume',build:brewing}];
}
