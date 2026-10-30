/* Accepted FKDetails fire planes. Texture variant is independent of editing and animation frames. */
export function createFireModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Fire models require Three');
 function build(E) {
  const variant=E?.state?.variant??'primary';
  if(!['primary','alternate'].includes(variant))throw new Error('Invalid fire variant');
  const bindings=E&&(E.bindings??E.faceMap),role=variant==='primary'?'up':'down',path=bindings?.[role];
  if(typeof path!=='string'||!path)throw new Error('Missing fire binding: '+role);
  if(!E.mats||!E.group||typeof E.group.add!=='function'||typeof Three.Group!=='function')throw new Error('Missing fire environment');
  const mat=E.mats[path];if(!mat||mat===E.hiddenMat)throw new Error('Missing fire material: '+path);
  const geometries=[],parts=[],Q=Math.PI/2;
  function mesh() {
   const geometry=new Three.PlaneGeometry(1,1.4);geometries.push(geometry);return new Three.Mesh(geometry,mat);
  }
  try {
   for(const [x,z,ry,rx,rz] of [[0,.05,0,22.5,0],[0,-.05,0,-22.5,0],[.05,0,Q,0,-22.5],[-.05,0,Q,0,22.5]]) {
    const m=mesh(),pivot=new Three.Group();m.position.set(0,.7,0);m.rotation.set(0,ry,0);
    pivot.position.set(x,-.5,z);pivot.rotation.x=rx*Math.PI/180;pivot.rotation.z=rz*Math.PI/180;pivot.add(m);parts.push(pivot);
   }
   for(const [x,z,ry] of [[0,-.4994,0],[0,.4994,0],[.4994,0,Q],[-.4994,0,Q]]) {
    const m=mesh();m.position.set(x,.2,z);m.rotation.set(0,ry,0);parts.push(m);
   }
  } catch(error) {
   for(const geometry of geometries)if(typeof geometry.dispose==='function')geometry.dispose();throw error;
  }
  mat.side=Three.DoubleSide;mat.needsUpdate=true;
  for(const part of parts)E.group.add(part);
 }
 return [{id:'fire',scale:1,mode:'volume',build}];
}
