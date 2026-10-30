/* Accepted FKShapes dripleaves. Preserve YXZ plane rotation order and independent editing slots. */
import {composeShape,requireRoles} from './shapes.mjs';
const Q=Math.PI/2;
export function createDripleafModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Dripleaf models require Three');
 function build(E,large) {
  const f=requireRoles(E,large?['north','east','up','down']:['south','north','up','down'],'dripleaf');
  if(typeof Three.Group!=='function'||!E.group||typeof E.group.add!=='function')throw new Error('Missing dripleaf environment');
  const group=new Three.Group();
  composeShape(Three,{...E,group},p=>{
   const face=(...args)=>p.face(...args),stem=(id,w,h,y,z,r)=>{
    face(id,w,h,0,y,z,0,0,r,true);face(id,w,h,0,y,z,0,Q,r,true);
   };
   if(large) {
    stem(f.north,6*Math.SQRT2/16,15/16,-1/32,.25,[3,0,14,16]);
    face(f.east,1,1,0,7/16,0,-Q,0,null,true);
    face(f.up,1,.25,0,5/16,-.5,0,0,[0,0,16,4],true);
    face(f.down,1,.25,-.5,5/16,0,0,Q,[0,0,16,4],true);
    face(f.down,1,.25,.5,5/16,0,0,Q,[0,0,16,4],true);
   } else {
    stem(f.south,7/16,1,-.5,0,[4,0,12,16]);stem(f.north,7/16,14/16,7/16,0,[4,0,12,14]);
    for(const [px,py,pz,angle] of [[11.5,19,11.5,0],[4.5,24,4.5,0],[4.5,28,11.5,Q]]) {
     const x=(px-8)/16,y=(py-16)/16,z=(pz-8)/16;
     face(f.up,7/16,7/16,x,y,z,-Q,angle,[0,0,8,8],true);
     face(f.down,7/16,1/16,x,y-1/32,z-7/32,0,0,[0,0,8,1],true);
     face(f.down,7/16,1/16,x,y-1/32,z+7/32,0,0,[0,0,8,1],true);
     face(f.down,7/16,1/16,x-7/32,y-1/32,z,0,Q,[0,0,8,1],true);
     face(f.down,7/16,1/16,x+7/32,y-1/32,z,0,Q,[0,0,8,1],true);
    }
   }
  });
  for(const mesh of group.children)mesh.rotation.order='YXZ';
  for(const mesh of [...group.children])E.group.add(mesh);
 }
 return [{id:'big_dripleaf',scale:1,mode:'volume',build:E=>build(E,true)},{id:'small_dripleaf',scale:1,mode:'volume',build:E=>build(E,false)}];
}
