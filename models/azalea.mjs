/* Accepted unpotted azalea geometry. Texture roles are supplied by the catalog adapter. */
export function createAzaleaModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Azalea models require Three');
 function build(E){
  if(!E||!['azalea','flowering_azalea'].includes(E.cur))throw new Error('Unknown azalea object');
  const roles=['top','side','plant'],bindings=E.bindings;
  if(!bindings||!E.mats)throw new Error('Missing azalea bindings');
  const materials=Object.fromEntries(roles.map(role=>{
   const path=bindings[role],material=E.mats[path];
   if(typeof path!=='string'||!path||!material||material===E.hiddenMat)throw new Error('Missing azalea material: '+role);
   return [role,material];
  }));
  const w=15.8*Math.SQRT2/16,h=15.9/16,y=(15.9/2-8)/16;
  const parts=[
   ['top',1,1,0,.5,0,-Math.PI/2,0,16],
   ['side',1,11/16,0,5/32,-.5,0,Math.PI,11],
   ['side',1,11/16,0,5/32,.5,0,0,11],
   ['side',1,11/16,.5,5/32,0,0,Math.PI/2,11],
   ['side',1,11/16,-.5,5/32,0,0,-Math.PI/2,11],
   ['plant',w,h,0,y,0,0,Math.PI/4,16],
   ['plant',w,h,0,y,0,0,-Math.PI/4,16]
  ];
  const meshes=[],geometries=[];
  try{
   for(const [role,width,height,x,cy,z,rx,ry,crop] of parts){
    const geometry=new Three.PlaneGeometry(width,height);geometries.push(geometry);
    const uv=geometry.attributes.uv;
    for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,u,1-(1-v)*crop/16);}
    const mesh=new Three.Mesh(geometry,materials[role]);mesh.position.set(x,cy,z);mesh.rotation.set(rx,ry,0);mesh.rotation.order='YXZ';meshes.push(mesh);
   }
  }catch(error){for(const geometry of geometries)if(typeof geometry.dispose==='function')geometry.dispose();throw error;}
  for(const material of Object.values(materials)){material.side=Three.DoubleSide;material.needsUpdate=true;}
  for(const mesh of meshes)E.group.add(mesh);
 }
 return [{id:'azalea',scale:1,mode:'volume',build}];
}
