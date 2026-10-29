/* Geometry reference: Java template_potted_azalea_bush.json, blob d3ce7c09fc34fe2212a741ebf3a2a5e3a720e405.
   Bedrock resource paths are injected. Bedrock PNG/visual acceptance is still required. */
const ELEMENTS=[
 [[5,0,5],[6,6,11],{down:['pot',5,5,6,11],up:['pot',5,5,6,11],north:['pot',10,10,11,16],south:['pot',5,10,6,16],west:['pot',5,10,11,16],east:['pot',5,10,11,16]}],
 [[10,0,5],[11,6,11],{down:['pot',10,5,11,11],up:['pot',10,5,11,11],north:['pot',5,10,6,16],south:['pot',10,10,11,16],west:['pot',5,10,11,16],east:['pot',5,10,11,16]}],
 [[6,0,5],[10,6,6],{down:['pot',6,10,10,11],up:['pot',6,5,10,6],north:['pot',6,10,10,16],south:['pot',6,10,10,16]}],
 [[6,0,10],[10,6,11],{down:['pot',6,5,10,6],up:['pot',6,10,10,11],north:['pot',6,10,10,16],south:['pot',6,10,10,16]}],
 [[6,0,6],[10,4,10],{down:['pot',6,12,10,16],up:['soil',6,6,10,10]}],
 [[4,15.9,4],[12,16,12],{down:['top',4,12,12,4],up:['top',4,4,12,12]}],
 [[4,8,4],[12,16,4],{north:['side',4,5,12,13],south:['side',12,5,4,13]}],
 [[4,8,12],[12,16,12],{north:['side',12,5,4,13],south:['side',4,5,12,13]}],
 [[4,8,4],[4,16,12],{west:['side',4,5,12,13],east:['side',12,5,4,13]}],
 [[12,8,4],[12,16,12],{west:['side',12,5,4,13],east:['side',4,5,12,13]}],
 [[2.6,4,8],[13.4,16,8],{north:['plant',0,4,16,16],south:['plant',0,4,16,16]},true],
 [[8,4,2.6],[8,16,13.4],{west:['plant',0,4,16,16],east:['plant',0,4,16,16]},true]
];
export function createPottedAzaleaModels(Three){
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function')throw new Error('Potted azalea models require Three');
 function build(E){
  if(!E||!['azalea','flowering_azalea'].includes(E.cur))throw new Error('Unknown potted azalea object');
  if(typeof Three.Group!=='function'||Three.FrontSide===undefined)throw new Error('Potted azalea requires Group and FrontSide');
  if(!E.bindings||!E.mats||!E.group||typeof E.group.add!=='function')throw new Error('Missing potted azalea environment');
  const materials=Object.fromEntries(['pot','soil','top','side','plant'].map(role=>{
   const path=E.bindings[role],mat=E.mats[path];
   if(typeof path!=='string'||!path||!mat||mat===E.hiddenMat)throw new Error('Missing potted azalea material: '+role);
   return [role,mat];
  }));
  const parts=[],geometries=[],Q=Math.PI/2;
  try{
   for(const [a,b,faces,diagonal] of ELEMENTS){
    const scale=diagonal?Math.SQRT2:1,w=(b[0]-a[0])*scale/16,h=(b[1]-a[1])/16,d=(b[2]-a[2])*scale/16;
    const group=new Three.Group();group.position.set((a[0]+b[0]-16)*scale/32,(a[1]+b[1]-16)/32,(a[2]+b[2]-16)*scale/32);group.rotation.y=diagonal?Math.PI/4:0;
    const placements={north:[w,h,0,0,-d/2,0,Math.PI],south:[w,h,0,0,d/2,0,0],east:[d,h,w/2,0,0,0,Q],west:[d,h,-w/2,0,0,0,-Q],up:[w,d,0,h/2,0,-Q,0],down:[w,d,0,-h/2,0,Q,0]};
    for(const [face,[role,u0,v0,u1,v1]] of Object.entries(faces)){
     const [fw,fh,x,y,z,rx,ry]=placements[face];
     const geometry=new Three.PlaneGeometry(fw,fh);geometries.push(geometry);const uv=geometry.attributes.uv;
     for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,(u0+u*(u1-u0))/16,1-(v0+(1-v)*(v1-v0))/16);}
     const mesh=new Three.Mesh(geometry,materials[role]);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);group.add(mesh);
    }
    parts.push(group);
   }
  }catch(error){for(const g of geometries)if(typeof g.dispose==='function')g.dispose();throw error;}
  for(const mat of Object.values(materials)){mat.side=Three.FrontSide;mat.needsUpdate=true;}
  for(const group of parts)E.group.add(group);
 }
 return [{id:'potted_azalea',scale:1,mode:'volume',build}];
}
