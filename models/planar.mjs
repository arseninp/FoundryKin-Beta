/* Explicit planar builders migrated from FKShapes. No texture-folder dispatch or global state. */
export function createPlanarModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Planar models require Three');
 function plane(env,id,w,h,x,y,z,rx,ry) {
  const material=env.mats[id];
  if (!material || material===env.hiddenMat) throw new Error('Missing planar material: '+id);
  material.side=Three.DoubleSide;material.needsUpdate=true;
  const mesh=new Three.Mesh(new Three.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);env.group.add(mesh);
 }
 function cross(env) {
  const id=env.faceMap.up;
  plane(env,id,Math.SQRT2,1,0,0,0,0,0);
  plane(env,id,Math.SQRT2,1,0,0,0,0,Math.PI/2);
 }
 function sprite(env) {plane(env,env.slot,1.1,1.1,0,0,0,0,0);}
 function rail(env) {plane(env,env.previewPath??env.faceMap.up,1,1,0,0,0,-Math.PI/2,0);}
 function decal(env) {plane(env,env.faceMap.south,1,1,0,0,-.49,0,0);}
 return [
  {id:'cross',scale:1,mode:'volume',build:cross},
  {id:'sprite',scale:1,mode:'sprite',build:sprite},
  {id:'rail',scale:1,mode:'volume',build:rail},
  {id:'decal',scale:1,mode:'volume',build:decal}
 ];
}
