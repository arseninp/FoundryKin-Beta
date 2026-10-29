/* Closed door geometry with independent upper/lower materials; no merged canvas. */
export function createDoorModels(Three) {
 if(!Three||typeof Three.BoxGeometry!=='function'||typeof Three.Mesh!=='function')throw new Error('Door models require Three');
 function build(E){
  const bindings=E.bindings??E.faceMap;
  if(!bindings||typeof bindings.lower!=='string'||typeof bindings.upper!=='string')throw new Error('Missing door bindings');
  const materials=['lower','upper'].map(role=>{
   const mat=E.mats[bindings[role]];
   if(!mat||mat===E.hiddenMat)throw new Error('Missing door material: '+role);
   return mat;
  });
  const prepared=[],geometries=[];
  try{
   for(let half=0;half<2;half++){
    const y=half===0?-.5:.5,z=-.40625,d=.1875,g=new Three.BoxGeometry(1,1,d);
    geometries.push(g);
    if(!Array.isArray(g.groups)||g.groups.length!==6)throw new Error('Door requires six box face groups');
    const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){
     const X=p.getX(i),Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);
     let u,v;
     if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=p.getY(i)+.5;}
     else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=p.getY(i)+.5;}
     else{const depth=(p.getZ(i)+d/2)/d;u=X+.5;v=ny>0?1-d*depth:d*depth;}
     uv.setXY(i,u,v);
    }
    const interior=half===0?2:3;
    g.groups=g.groups.filter(group=>group.materialIndex!==interior);
    const mesh=new Three.Mesh(g,Array(6).fill(materials[half]));mesh.position.set(0,y,z);prepared.push(mesh);
   }
  }catch(error){for(const g of geometries)if(typeof g.dispose==='function')g.dispose();throw error;}
  for(const mesh of prepared)E.group.add(mesh);
 }
 return [{id:'door',scale:1.4,mode:'volume',build}];
}
