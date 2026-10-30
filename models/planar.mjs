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
 function stageCross(env) {
  const bindings=env&&(env.bindings??env.faceMap),stage=env?.state?.stage??0;
  if(!bindings)throw new Error('Missing staged cross bindings');
  const count=Object.keys(bindings).filter(role=>/^stage_\d+$/.test(role)).length;
  if(!count||!Array.from({length:count},(_,i)=>bindings['stage_'+i]).every(path=>typeof path==='string'&&path)||!Number.isInteger(stage)||stage<0||stage>=count)throw new Error('Invalid staged cross stage');
  const id=bindings['stage_'+stage],material=env.mats?.[id];
  if(!material||material===env.hiddenMat)throw new Error('Missing planar material: '+id);
  if(!env.group||typeof env.group.add!=='function')throw new Error('Missing staged cross environment');
  const geometries=[],meshes=[];
  try {
   for(const angle of [0,Math.PI/2]) {
    const g=new Three.PlaneGeometry(Math.SQRT2,1);geometries.push(g);
    const mesh=new Three.Mesh(g,material);mesh.position.set(0,0,0);mesh.rotation.set(0,angle,0);meshes.push(mesh);
   }
  } catch(error) {
   for(const g of geometries)if(typeof g.dispose==='function')g.dispose();throw error;
  }
  material.side=Three.DoubleSide;material.needsUpdate=true;
  for(const mesh of meshes)env.group.add(mesh);
 }
 function sprite(env) {plane(env,env.slot,1.1,1.1,0,0,0,0,0);}
 function rail(env) {plane(env,env.previewPath??env.faceMap.up,1,1,0,0,0,-Math.PI/2,0);}
 function decal(env) {plane(env,env.faceMap.south,1,1,0,0,-.49,0,0);}
 return [
  {id:'cross',scale:1,mode:'volume',build:cross},
  {id:'sprite',scale:1,mode:'sprite',build:sprite},
  {id:'rail',scale:1,mode:'volume',build:rail},
  {id:'decal',scale:1,mode:'volume',build:decal},
  {id:'stage_cross',scale:1,mode:'volume',build:stageCross}
 ];
}
