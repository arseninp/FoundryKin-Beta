/* Complete bed migrated from the accepted legacy model. One owned 64x64 sheet; no slot-driven geometry. */
const PIECES=[
 [[0,0,0],[16,32,6],[0,0]],
 [[3,31,6],[10,1,3],[38,2]],[[3,0,6],[10,1,3],[38,38]],
 [[15,3,6],[1,26,3],[52,6]],[[0,3,6],[1,26,3],[44,6]],
 [[13,29,6],[3,3,3],[12,38]],[[0,29,6],[3,3,3],[0,38]],
 [[13,0,6],[3,3,3],[12,44]],[[0,0,6],[3,3,3],[0,44]]
];
export function createBedModels(Three) {
 if(!Three||typeof Three.BoxGeometry!=='function'||typeof Three.Mesh!=='function')throw new Error('Bed models require Three');
 function build(E) {
  const bindings=E&&(E.bindings??E.faceMap),sheet=bindings?.sheet,material=E?.mats?.[sheet];
  if(typeof sheet!=='string'||!sheet||!material||material===E.hiddenMat)throw new Error('Missing bed sheet material');
  if(typeof Three.Group!=='function'||!E.group||typeof E.group.add!=='function')throw new Error('Missing bed environment');
  const root=new Three.Group(),geometries=[];
  try {
   for(const [offset,size,origin] of PIECES) {
    const [w,h,d]=size,[u,v]=origin;
    const R={up:[u+d,v+d,u+d+w,v+d+h],down:[u+2*d+w,v+d,u+2*d+2*w,v+d+h],east:[u+d+w,v+d,u+2*d+w,v+d+h,1],west:[u+d,v+d,u,v+d+h,2],north:[u+d+w,v+d,u+d,v],south:[u+d+2*w,v+d,u+d+w,v]};
    const geometry=new Three.BoxGeometry(w/16,d/16,h/16);geometries.push(geometry);
    const p=geometry.attributes?.position,n=geometry.attributes?.normal,uv=geometry.attributes?.uv;
    if(!p||!n||!uv||!Number.isInteger(p.count)||p.count<1||n.count!==p.count||uv.count!==p.count)throw new Error('Bed requires box position, normal and UV attributes');
    for(let i=0;i<p.count;i++) {
     const nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),lx=p.getX(i)/(w/16)+.5,ly=p.getY(i)/(d/16)+.5,lz=p.getZ(i)/(h/16)+.5;
     let face,a,b;
     if(nx>.5){face='east';a=1-lz;b=ly;}else if(nx<-.5){face='west';a=lz;b=ly;}
     else if(nz>.5){face='south';a=lx;b=ly;}else if(nz<-.5){face='north';a=1-lx;b=ly;}
     else if(ny>.5){face='up';a=lx;b=1-lz;}else{face='down';a=lx;b=lz;}
     const r=R[face],k=r[4]||0,s=k?1-b:a,t=k===1?1-a:k===2?a:1-b;
     uv.setXY(i,(r[0]+s*(r[2]-r[0]))/64,1-(r[1]+t*(r[3]-r[1]))/64);
    }
    const mesh=new Three.Mesh(geometry,material);
    mesh.position.set((offset[0]+w/2-8)/16,.0625-(offset[2]+d/2)/16,(offset[1]+h/2-16)/16);root.add(mesh);
   }
   E.group.add(root);
  }catch(error){
   const errors=[error];
   try{if(root.parent)root.parent.remove(root);}catch(cleanupError){errors.push(cleanupError);}
   for(const geometry of geometries)try{geometry.dispose();}catch(cleanupError){errors.push(cleanupError);}
   if(errors.length>1)throw new AggregateError(errors,'Bed build and cleanup failed');
   throw error;
  }
 }
 return [{id:'bed',scale:1.4,mode:'volume',build}];
}
