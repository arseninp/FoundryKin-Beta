/* Head/jaw subset of Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d
   resource_pack/models/entity/ender_dragon.geo.json. Uses the shared 256x256 sheet directly.
   Reference head pivot becomes the local origin; native dimensions are retained in 1/16 units.
   Static closed-jaw candidate only. No body, animation, entity importer or new texture is included.
   Bedrock block placement/scale and actual PNG/WebGL appearance still require acceptance. */
import {composeShape} from './shapes.mjs';
const HEAD_PIVOT=[0,24,0],JAW_PIVOT=[0,20,-8];
const HEAD=[
 [[-6,20,-24],[12,5,16],[176,44]],
 [[-8,16,-10],[16,16,16],[112,30]],
 [[-5,32,-4],[2,4,6],[0,0],true],
 [[-5,25,-22],[2,2,4],[112,0],true],
 [[3,32,-4],[2,4,6],[0,0]],
 [[3,25,-22],[2,2,4],[112,0]]
];
const JAW=[[-6,16,-24],[12,4,16],[176,65]];
export function buildDragonHead(Three,E,sheet,rotation=0) {
 if(!Three||typeof Three.Group!=='function'||!E?.group||typeof E.group.add!=='function')throw new Error('Missing dragon head environment');
 if(!Number.isInteger(rotation)||rotation<0||rotation>15)throw new Error('Invalid dragon head rotation');
 const root=new Three.Group();root.name='head';root.rotation.y=-rotation*Math.PI/8;
 function cube(target,[origin,size,uv,mirror=false],pivot) {
  const [w,h,d]=size,[u,v]=uv;
  let rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
  if(mirror) {
   const reflected={...rects,east:rects.west,west:rects.east};
   rects=Object.fromEntries(Object.entries(reflected).map(([face,r])=>[face,[r[2],r[1],r[0],r[3]]]));
  }
  composeShape(Three,{...E,group:target},p=>p.prism(w/16,h/16,d/16,(origin[0]+w/2-pivot[0])/16,(origin[1]+h/2-pivot[1])/16,(origin[2]+d/2-pivot[2])/16,sheet,rects,256));
 }
 try {
  for(const data of HEAD)cube(root,data,HEAD_PIVOT);
  const jaw=new Three.Group();jaw.name='jaw';
  jaw.position.set((JAW_PIVOT[0]-HEAD_PIVOT[0])/16,(JAW_PIVOT[1]-HEAD_PIVOT[1])/16,(JAW_PIVOT[2]-HEAD_PIVOT[2])/16);
  root.add(jaw);cube(jaw,JAW,JAW_PIVOT);E.group.add(root);
 }catch(error) {
  const errors=[error],geometries=new Set();
  try{if(root.parent)root.parent.remove(root);}catch(cleanup){errors.push(cleanup);}
  function visit(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])visit(child);}
  try{visit(root);}catch(cleanup){errors.push(cleanup);}
  for(const geometry of geometries)try{if(typeof geometry.dispose==='function')geometry.dispose();}catch(cleanup){errors.push(cleanup);}
  if(errors.length>1)throw new AggregateError(errors,'Dragon head build and cleanup failed');
  throw error;
 }
}
