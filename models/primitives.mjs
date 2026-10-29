/* Accepted geometry and UVs; all materials are resolved before attaching meshes. */
const PARTS = {
 cube: {parts: [[1,1,1,0,0,0]], shift: 0},
 slab: {parts: [[1,.5,1,0,-.25,0]], shift: .25},
 stairs: {parts: [[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]], shift: 0},
 wall: {parts: [[.5,1,.5,0,0,0],[1,.875,.25,0,-.0625,0]], shift: 0},
 fence: {parts: [[.25,1,.25,0,0,0],[1,.1875,.125,0,-.03125,0],[1,.1875,.125,0,.34375,0]], shift: 0},
 gate: {parts: [[.125,.6875,.125,-.4375,.15625,0],[.125,.6875,.125,.4375,.15625,0],[.75,.1875,.125,0,-.03125,0],[.75,.1875,.125,0,.34375,0]], shift: 0},
 button: {parts: [[.375,.125,.25,0,-.4375,0]], shift: .4},
 plate: {parts: [[.875,.0625,.875,0,-.46875,0]], shift: .45},
 cake: {parts: [[.875,.5,.875,0,-.25,0]], shift: .25},
 trapdoor: {parts: [[1,.1875,1,0,-.40625,0]], shift: .4},
 carpet: {parts: [[1,.0625,1,0,-.46875,0]], shift: .45}
};
const GLAZED = {north:270, east:0, south:90, west:180, up:180, down:180};
export function createPrimitiveModels(Three) {
 if (!Three || typeof Three.BoxGeometry !== 'function' || typeof Three.Mesh !== 'function') throw new Error('Primitive models require Three');
 function buildPart(env, part, rotation, ids) {
  const [w,h,d,x,y,z] = part;
  const f = env.faceMap;ids=ids??[f.east,f.west,f.up,f.down,f.south,f.north];
  const materials = ids.map(id => {
   if (id === null && env.hiddenMat) return env.hiddenMat;
   if (!env.mats[id]) throw new Error('Missing primitive material: ' + id);
   return env.mats[id];
  });
  const geometry = new Three.BoxGeometry(w,h,d), p = geometry.attributes.position, n = geometry.attributes.normal, uv = geometry.attributes.uv;
  for (let i=0;i<p.count;i++) {
   const X=p.getX(i)+x, Y=p.getY(i)+y, Z=p.getZ(i)+z;
   const nx=n.getX(i), ny=n.getY(i), nz=n.getZ(i);
   let u,v;
   if (Math.abs(nx)>.5) {u=nx>0?.5-Z:Z+.5;v=Y+.5;}
   else if (Math.abs(nz)>.5) {u=nz>0?X+.5:.5-X;v=Y+.5;}
   else {u=X+.5;v=ny>0?.5-Z:Z+.5;}
   if (rotation) {
    const face=nx>.5?'east':nx<-.5?'west':nz>.5?'south':nz<-.5?'north':ny>.5?'up':'down';
    const angle=(rotation[face]||0)*Math.PI/180;
    if (angle) {const c=Math.cos(angle),s=Math.sin(angle),pu=u-.5,pv=v-.5;u=.5+pu*c-pv*s;v=.5+pu*s+pv*c;}
   }
   uv.setXY(i,u,v);
  }
  const mesh = new Three.Mesh(geometry, materials);mesh.position.set(x,y,z);return mesh;
 }
 const models=Object.entries(PARTS).map(([id, spec]) => ({id, scale:1, mode:'volume', build(env) {
  const rotation=id==='cube' && /_glazed_terracotta$/.test(env.cur) ? GLAZED : null;
  const prepared=spec.parts.map(part => buildPart(env,part,rotation));
  for (const mesh of prepared) {mesh.position.y+=spec.shift;env.group.add(mesh);}
 }}));
 function solid(id,parts,materials){return {id,scale:1,mode:'volume',build(env){
  const prepared=parts.map((part,index)=>buildPart(env,part,null,materials(env.faceMap,index)));
  for(const mesh of prepared)env.group.add(mesh);
 }};}
 models.push(solid('anvil',[[.75,.25,.75,0,-.375,0],[.5,.0625,.625,0,-.21875,0],[.25,.3125,.5,0,-.03125,0],[.625,.375,1,0,.3125,0]],(f,i)=>i===3?[f.down,f.down,f.up,f.down,f.down,f.down]:Array(6).fill(f.down)));
 models.push(solid('beacon',[[.75,.1875,.75,0,-.40625,0],[.625,.625,.625,0,0,0],[1,1,1,0,0,0]],(f,i)=>Array(6).fill([f.down,f.up,f.east][i])));
 models.push(solid('pumpkin',[[1,1,1,0,0,0]],f=>[f.east,f.west,f.up,f.down,f.south,f.north]));
 return models;
}
