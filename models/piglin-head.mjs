/* Detached adult head from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d
   resource_pack/models/entity/piglin.geo.json. Coordinates below subtract the head's Y=24.
   Cube inflate overrides bone inflate; head cubes use -0.02, ear bones use 0.
   Static geometry candidate, no body, baby variant, ear animation or wall mounting. */
import {composeShape} from './shapes.mjs';
export function buildPiglinHead(Three,E,sheet,rotation) {
 if(typeof Three.Group!=='function'||!E.group||typeof E.group.add!=='function')throw new Error('Missing piglin head environment');
 const root=new Three.Group();
 root.position.y=-.5;root.rotation.y=-rotation*Math.PI/8;
 function cube(target,origin,size,uv,inflate=0,pivot=[0,0,0]) {
  const [w,h,d]=size,[u,v]=uv;
  const rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
  composeShape(Three,{...E,group:target},p=>p.prism((w+2*inflate)/16,(h+2*inflate)/16,(d+2*inflate)/16,(origin[0]+w/2-pivot[0])/16,(origin[1]+h/2-pivot[1])/16,(origin[2]+d/2-pivot[2])/16,sheet,rects,64));
 }
 try {
  cube(root,[-5,0,-4],[10,8,8],[0,0],-.02);
  cube(root,[-2,0,-5],[4,4,1],[31,1],-.02);
  cube(root,[2,0,-5],[1,2,1],[2,4],-.02);
  cube(root,[-3,0,-5],[1,2,1],[2,0],-.02);
  for(const [pivot,angle,origin,uv] of [
   [[5,6,0],30,[4,1,-2],[51,6]],
   [[-5,6,0],-30,[-5,1,-2],[39,6]]
  ]) {
   const ear=new Three.Group();
   ear.position.set(pivot[0]/16,pivot[1]/16,pivot[2]/16);ear.rotation.z=angle*Math.PI/180;
   root.add(ear);cube(ear,origin,[1,5,4],uv,0,pivot);
  }
  E.group.add(root);
 }catch(error) {
  const errors=[error],geometries=new Set();
  try{if(root.parent)root.parent.remove(root);}catch(cleanup){errors.push(cleanup);}
  function visit(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])visit(child);}
  try{visit(root);}catch(cleanup){errors.push(cleanup);}
  for(const geometry of geometries)try{if(typeof geometry.dispose==='function')geometry.dispose();}catch(cleanup){errors.push(cleanup);}
  if(errors.length>1)throw new AggregateError(errors,'Piglin head build and cleanup failed');
  throw error;
 }
}
