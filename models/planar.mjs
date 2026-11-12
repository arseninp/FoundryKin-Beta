/* Explicit planar builders migrated from FKShapes. No texture-folder dispatch or global state. */
export function createPlanarModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Planar models require Three');
 function prepare(env,id,w,h,poses) {
  const material=env?.mats?.[id];
  if (typeof id!=='string'||!id||!material||material===env.hiddenMat) throw new Error('Missing planar material: '+id);
  if (!env.group||typeof env.group.add!=='function') throw new Error('Missing planar environment');
  const geometries=[],meshes=[];
  try {
   for(const [x,y,z,rx,ry] of poses) {
    const geometry=new Three.PlaneGeometry(w,h);geometries.push(geometry);
    const mesh=new Three.Mesh(geometry,material);
    mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);meshes.push(mesh);
   }
  } catch(error) {
   for(const geometry of geometries)if(typeof geometry.dispose==='function')geometry.dispose();throw error;
  }
  return {material,geometries,meshes};
 }
 function commit(env,batches) {
  for(const batch of batches) {
   batch.material.side=Three.DoubleSide;batch.material.needsUpdate=true;
   for(const mesh of batch.meshes)env.group.add(mesh);
  }
 }
 function planes(env,id,w,h,poses) {commit(env,[prepare(env,id,w,h,poses)]);}
 const CROSS_POSES=[[0,0,0,0,0],[0,0,0,0,Math.PI/2]];
 function crossPlanes(env,id) {planes(env,id,Math.SQRT2,1,CROSS_POSES);}
 function cross(env) {crossPlanes(env,env.faceMap.up);}
 function emissiveCross(env) {
  const bindings=env&&(env.bindings??env.faceMap);
  if(!bindings||typeof bindings.plant!=='string'||!bindings.plant||typeof bindings.glow!=='string'||!bindings.glow)throw new Error('Missing emissive cross bindings');
  const glow=env.mats?.[bindings.glow];
  if(!glow||glow===env.hiddenMat)throw new Error('Missing planar material: '+bindings.glow);
  // Renderer owns materials and their lifecycle. Never clone or brighten the plant material here.
  if(glow.isMeshBasicMaterial!==true)throw new Error('Emissive cross requires an unlit glow material');
  const batches=[];
  try {
   batches.push(prepare(env,bindings.plant,Math.SQRT2,1,CROSS_POSES));
   batches.push(prepare(env,bindings.glow,Math.SQRT2,1,CROSS_POSES));
   for(const mesh of batches[1].meshes)mesh.renderOrder=1;
  } catch(error) {
   for(const batch of batches)for(const geometry of batch.geometries)if(typeof geometry.dispose==='function')geometry.dispose();
   throw error;
  }
  commit(env,batches);
 }
 function stageCross(env) {
  const bindings=env&&(env.bindings??env.faceMap),stage=env?.state?.stage??0;
  if(!bindings)throw new Error('Missing staged cross bindings');
  const count=Object.keys(bindings).filter(role=>/^stage_\d+$/.test(role)).length;
  if(!count||!Array.from({length:count},(_,i)=>bindings['stage_'+i]).every(path=>typeof path==='string'&&path)||!Number.isInteger(stage)||stage<0||stage>=count)throw new Error('Invalid staged cross stage');
  crossPlanes(env,bindings['stage_'+stage]);
 }
 function sprite(env) {planes(env,env.slot,1.1,1.1,[[0,0,0,0,0]]);}
 function rail(env) {planes(env,env.previewPath??env.faceMap.up,1,1,[[0,0,0,-Math.PI/2,0]]);}
 function decal(env) {planes(env,env.faceMap.south,1,1,[[0,0,-.5,0,0]]);}
 return [
  {id:'cross',scale:1,mode:'volume',build:cross},
  {id:'sprite',scale:1,mode:'sprite',build:sprite},
  {id:'rail',scale:1,mode:'volume',build:rail},
  {id:'decal',scale:1,mode:'volume',build:decal},
  {id:'stage_cross',scale:1,mode:'volume',build:stageCross},
  {id:'emissive_cross',scale:1,mode:'volume',emissiveRoles:['glow'],build:emissiveCross}
 ];
}
