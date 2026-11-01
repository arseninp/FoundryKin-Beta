/* Java-reference propagule geometry with owned Bedrock textures; no slot-driven state. */
import {composeShape,requireRoles} from './shapes.mjs';
const Q=Math.PI/2,R=Math.PI/4;
const LEAVES=Object.freeze([
 {x:8,z:11.07193,axis:'x',angle:Math.PI/8,up:180,down:0},
 {x:11.07193,z:8,axis:'z',angle:-Math.PI/8,up:90,down:90},
 {x:8,z:4.92807,axis:'x',angle:-Math.PI/8,up:0,down:180},
 {x:4.92807,z:8,axis:'z',angle:Math.PI/8,up:270,down:270}
]);
export function createPropaguleModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Propagule models require Three');
 function crossed(p,path,width,height,y,uv) {
  for(const angle of [R,R+Math.PI,R+Q,R-Q])p.face(path,width,height,0,y,0,0,angle,uv);
 }
 function body(p,path,bottom,top,side,up,down) {
  const F=Object.fromEntries(['north','south','east','west','up','down'].map(face=>[face,path]));
  p.box([7,bottom,7],[9,top,9],F,{north:side,south:side,east:side,west:side,up,down});
 }
 function leaves(p,path) {
  for(const leaf of LEAVES) {
   const c=Math.cos(leaf.angle),s=Math.sin(leaf.angle);let x=leaf.x-8,y=13.61104-16,z=leaf.z-8;
   if(leaf.axis==='x')[y,z]=[y*c-z*s,y*s+z*c];else [x,y]=[x*c-y*s,x*s+y*c];
   const rx=leaf.axis==='x'?leaf.angle:0,ry=leaf.axis==='z'?leaf.angle:0;
   p.face(path,2/16,2/16,x/16,(y+8)/16,z/16,-Q+rx,-ry,[8,3,10,5,leaf.up]);
   p.face(path,2/16,2/16,x/16,(y+8)/16,z/16,Q+rx,ry,[6,3,8,5,leaf.down]);
  }
 }
 function build(E) {
  const state=E?.state??{},hanging=state.hanging===undefined?false:state.hanging,age=state.age===undefined?0:state.age;
  if(typeof hanging!=='boolean'||!Number.isInteger(age)||age<0||age>4)throw new Error('Invalid propagule preview state');
  const role=hanging?'hanging':'ground',f=requireRoles(E,[role],'propagule'),path=f[role];
  composeShape(Three,E,p=>{
   if(!hanging) {
    crossed(p,path,7*Math.SQRT2/16,6/16,4/16,[4,1,11,7]);
    crossed(p,path,2*Math.SQRT2/16,9/16,-3.5/16,[7,7,9,16]);return;
   }
   body(p,path,13,14,[0,2,2,3],[0,0,2,2],[0,3,2,5]);
   leaves(p,path);crossed(p,path,2/16,2/16,7/16,[0,0,2,2]);
   if(age>=1)body(p,path,10,13,[0,7,2,10],[0,5,2,7],age===1?[0,5,2,7]:[0,10,2,12]);
   if(age>=2) {
    const bottom=[7,3,0][age-2];
    crossed(p,path,2/16,(10-bottom)/16,((bottom+10)/2-8)/16,[3,bottom,5,10]);
   }
  });
 }
 return [{id:'mangrove_propagule',scale:1,mode:'volume',build}];
}
