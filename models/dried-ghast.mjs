/* Accepted FKDetails dried ghast: body opposite the tentacles; stage is independent of the edited PNG. */
import {composeShape,requireRoles} from './shapes.mjs';
const FACES=['up','down','north','south','east','west','tent'];
export function createDriedGhastModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Dried ghast models require Three');
 function build(E) {
  const stage=E?.state?.stage??0;
  if(!Number.isInteger(stage)||stage<0||stage>3)throw new Error('Invalid dried ghast stage');
  const roles=FACES.map(face=>'stage_'+stage+'_'+face),bindings=requireRoles(E,roles,'dried ghast'),f=Object.fromEntries(FACES.map((face,i)=>[face,bindings[roles[i]]]));
  const T=f.tent,six={north:T,south:T,east:T,west:T,up:T,down:T};
  composeShape(Three,E,p=>{
   p.box([3,0,3],[13,10,13],{north:f.south,east:f.west,south:f.north,west:f.east,up:f.up,down:f.down},{north:[0,0,10,10],east:[0,0,10,10],south:[0,0,10,10],west:[0,0,10,10],up:[0,0,10,10],down:[0,10,10,0]});
   p.box([0,0,5],[3,1,7],six,{north:[1,1.5,2.5,2],east:[0,1.5,1,2],south:[3.5,1.5,5,2],west:[2.5,1.5,3.5,2],up:[2.5,1.5,1.5,0,90],down:[2.5,1.5,3.5,0,90]});
   p.box([0,0,9],[3,1,11],six,{north:[1,3.5,2.5,4],east:[0,3.5,1,4],south:[3.5,3.5,5,4],west:[2.5,3.5,3.5,4],up:[2.5,3.5,1.5,2,90],down:[2.5,3.5,3.5,2,90]});
   p.box([13,0,5],[16,1,7],six,{north:[2.5,7.5,1,8],east:[3.5,7.5,2.5,8],south:[5,7.5,3.5,8],west:[1,7.5,0,8],up:[2.5,6,1.5,7.5,90],down:[2.5,6,3.5,7.5,90]});
   p.box([13,0,9],[16,1,11],six,{north:[2.5,5.5,1,6],east:[3.5,5.5,2.5,6],south:[5,5.5,3.5,6],west:[1,5.5,0,6],up:[2.5,4,1.5,5.5,90],down:[2.5,4,3.5,5.5,90]});
   p.box([9,0,13],[11,1,16],six,{north:[6,2.5,5,3],east:[7.5,2.5,6,3],south:[8.5,2.5,7.5,3],west:[10,2.5,8.5,3],up:[6,2.5,7.5,1.5,90],down:[7.5,1.5,9,2.5,270]});
   p.box([5,0,13],[7,1,16],six,{north:[6,1,5,1.5],east:[7.5,1,6,1.5],south:[8.5,1,7.5,1.5],west:[10,1,8.5,1.5],up:[6,1,7.5,0,90],down:[7.5,0,9,1,270]});
  });
 }
 return [{id:'dried_ghast',scale:1,mode:'volume',build}];
}
