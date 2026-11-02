/* Sign geometry reference: acacia-rs/acacia@750f657, entity/block_models.json and bake.rs.
   This is a Bedrock-reference candidate, not a Mojang geometry export or visual acceptance. */
const FACING={south:0,west:Math.PI/2,north:Math.PI,east:3*Math.PI/2};
export function createSignModels(Three) {
 if(!Three||typeof Three.BoxGeometry!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.Mesh!=='function'||Three.DoubleSide===undefined)throw new Error('Sign models require Three');
 function build(E) {
  const sheet=(E?.bindings??E?.faceMap)?.sheet,material=E?.mats?.[sheet],state=E?.state??{};
  if(typeof sheet!=='string'||!sheet||!material||material===E.hiddenMat)throw new Error('Missing sign sheet material');
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid sign state');
  const id=E.cur,hanging=typeof id==='string'&&/(^|_)hanging_sign$/.test(id),wall=typeof id==='string'&&/(^|_)wall_sign$/.test(id);
  if(!hanging&&!wall&&!(typeof id==='string'&&/(^|_)standing_sign$/.test(id)))throw new Error('Unknown sign object');
  const mounting=state.mounting??(hanging?'ceiling':wall?'wall':'standing'),rotation=state.rotation??0,facing=state.facing??'south';
  if(!(hanging?['ceiling','attached','wall']:['standing','wall']).includes(mounting)||!Number.isInteger(rotation)||rotation<0||rotation>15||!Object.hasOwn(FACING,facing))throw new Error('Invalid sign placement');
  if(typeof Three.Group!=='function'||!E.group||typeof E.group.add!=='function')throw new Error('Missing sign environment');
  const root=new Three.Group(),geometries=[],oldSide=material.side;let changedSide=false;
  function box(origin,size,uv,scale) {
   const [w,h,d]=size,[u,v]=uv;
   const rects={east:[u+d+w,v+d,d,h],west:[u,v+d,d,h],up:[u+d,v,w,d],down:[u+d+w,v,w,d],south:[u+2*d+w,v+d,w,h],north:[u+d,v+d,w,h]};
   const geometry=new Three.BoxGeometry(w*scale/16,h*scale/16,d*scale/16);geometries.push(geometry);
   const p=geometry.attributes?.position,n=geometry.attributes?.normal,tex=geometry.attributes?.uv;
   if(!p||!n||!tex||!Number.isInteger(p.count)||p.count<1||n.count!==p.count||tex.count!==p.count)throw new Error('Sign requires box position, normal and UV attributes');
   for(let i=0;i<p.count;i++) {
    const x=p.getX(i)/(w*scale/16)+.5,y=p.getY(i)/(h*scale/16)+.5,z=p.getZ(i)/(d*scale/16)+.5;
    const nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);let face,a,b;
    if(nx>.5){face='east';a=z;b=1-y;}else if(nx<-.5){face='west';a=1-z;b=1-y;}
    else if(nz>.5){face='south';a=1-x;b=1-y;}else if(nz<-.5){face='north';a=x;b=1-y;}
    else{face=ny>.5?'up':'down';a=x;b=1-z;}
    const r=rects[face];tex.setXY(i,(r[0]+a*r[2])/64,1-(r[1]+b*r[3])/32);
   }
   const mesh=new Three.Mesh(geometry,material);mesh.position.set((origin[0]+w/2)*scale/16,(origin[1]+h/2)*scale/16-.5,(origin[2]+d/2)*scale/16);root.add(mesh);
  }
  function plane(x,y,w,h,uv,angle) {
   const geometry=new Three.PlaneGeometry(w/16,h/16);geometries.push(geometry);
   const tex=geometry.attributes?.uv;
   if(!tex||!Number.isInteger(tex.count)||tex.count<1)throw new Error('Sign requires plane UV attributes');
   for(let i=0;i<tex.count;i++){const u=tex.getX(i),v=tex.getY(i);tex.setXY(i,(uv[0]+u*uv[2])/64,1-(uv[1]+(1-v)*uv[3])/32);}
   const mesh=new Three.Mesh(geometry,material);mesh.position.set(x/16,y/16-.5,0);mesh.rotation.y=angle;root.add(mesh);
  }
  try {
   if(!hanging) {
    box(mounting==='wall'?[-12,6.5,9.5]:[-12,14,-1],[24,12,2],[0,0],2/3);
    if(mounting==='standing')box([-1,0,-1],[2,14,2],[0,14],2/3);
   }else{
    box([-7,0,-1],[14,10,2],[0,12],1);
    if(mounting==='attached')plane(0,13,12,6,[14,6,12,6],0);
    else {
     if(mounting==='wall')box([-8,14,-2],[16,2,4],[0,0],1);
     for(const x of [-5,5]){plane(x,13,3,6,[0,6,3,6],Math.PI/4);plane(x,13,3,6,[6,6,3,6],-Math.PI/4);}
    }
   }
   root.rotation.y=mounting==='standing'||mounting==='attached'?rotation*Math.PI/8:FACING[facing];
   if(hanging){changedSide=true;material.side=Three.DoubleSide;material.needsUpdate=true;}
   E.group.add(root);
  }catch(error){
   const errors=[error];
   try{if(root.parent)root.parent.remove(root);}catch(cleanupError){errors.push(cleanupError);}
   if(changedSide)try{material.side=oldSide;material.needsUpdate=true;}catch(cleanupError){errors.push(cleanupError);}
   for(const geometry of geometries)try{geometry.dispose();}catch(cleanupError){errors.push(cleanupError);}
   if(errors.length>1)throw new AggregateError(errors,'Sign build and cleanup failed');
   throw error;
  }
 }
 return [{id:'sign',scale:1,mode:'volume',build}];
}
