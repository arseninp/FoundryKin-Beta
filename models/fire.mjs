/* Static fire specimen: explicit planes, full-sheet UV and independent texture variants.
   Layout remains a review candidate, not proof of Bedrock placement or animation timing. */
const PARTS=Object.freeze([
 ['inner',0,.05,0,Math.PI/8,0],['inner',0,-.05,0,-Math.PI/8,0],
 ['inner',.05,0,Math.PI/2,0,-Math.PI/8],['inner',-.05,0,Math.PI/2,0,Math.PI/8],
 ['edge',0,-.4994,0,0,0],['edge',0,.4994,0,0,0],
 ['edge',.4994,0,Math.PI/2,0,0],['edge',-.4994,0,Math.PI/2,0,0]
].map(part=>Object.freeze(part)));
const ROLES=Object.freeze({primary:'up',alternate:'down'});
export function createFireModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Fire models require Three');
 function build(E) {
  if(!['fire','soul_fire'].includes(E?.cur))throw new Error('Unknown fire object');
  const state=E.state??{},variant=state.variant===undefined?'primary':state.variant;
  if(typeof state!=='object'||Array.isArray(state)||typeof variant!=='string'||!Object.hasOwn(ROLES,variant))throw new Error('Invalid fire variant');
  const bindings=E.bindings??E.faceMap,role=ROLES[variant],path=bindings?.[role];
  if(typeof path!=='string'||!path)throw new Error('Missing fire binding: '+role);
  if(!E.mats||!E.group||typeof E.group.add!=='function'||typeof Three.Group!=='function')throw new Error('Missing fire environment');
  const mat=Object.hasOwn(E.mats,path)?E.mats[path]:null;
  if(!mat||mat===E.hiddenMat)throw new Error('Missing fire material: '+path);
  const geometries=[],parts=[];
  try {
   for(const [kind,x,z,yaw,leanX,leanZ] of PARTS) {
    const geometry=new Three.PlaneGeometry(1,1.4);geometries.push(geometry);
    const mesh=new Three.Mesh(geometry,mat);mesh.rotation.set(0,yaw,0);
    if(kind==='inner') {
     const pivot=new Three.Group();mesh.position.set(0,.7,0);
     pivot.position.set(x,-.5,z);pivot.rotation.set(leanX,0,leanZ);pivot.add(mesh);parts.push(pivot);
    } else {mesh.position.set(x,.2,z);parts.push(mesh);}
   }
  } catch(error) {
   const errors=[error];
   for(const geometry of geometries)try{geometry.dispose();}catch(cleanup){errors.push(cleanup);}
   if(errors.length>1)throw new AggregateError(errors,'Fire geometry preparation failed');
   throw error;
  }
  mat.side=Three.DoubleSide;mat.needsUpdate=true;
  for(const part of parts)E.group.add(part);
 }
 return [{id:'fire',scale:1,mode:'volume',emissiveRoles:['up','down','north','south','east','west'],build}];
}
