/* Accepted FKDetails geometry: downward hopper, floor-mounted grindstone and two frame variants. */
import {composeShape,requireRoles} from './shapes.mjs';
function autoUV(a,b) {
 return {north:[16-b[0],16-b[1],16-a[0],16-a[1]],south:[a[0],16-b[1],b[0],16-a[1]],east:[16-b[2],16-b[1],16-a[2],16-a[1]],west:[a[2],16-b[1],b[2],16-a[1]],up:[a[0],a[2],b[0],b[2]],down:[a[0],16-b[2],b[0],16-a[2]]};
}
export function createWorkshopModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Workshop models require Three');
 function hopper(E) {
  const f=requireRoles(E,['down','north','up'],'hopper'),I=f.down,O=f.north,T=f.up;
  composeShape(Three,E,p=>{
   const box=(a,b,F)=>p.box(a,b,F,autoUV(a,b));
   box([0,10,0],[16,11,16],{up:I,down:I,north:O,south:O,east:O,west:O});
   for(const [a,b] of [[[0,11,0],[2,16,16]],[[14,11,0],[16,16,16]]])box(a,b,{up:T,north:O,south:O,east:O,west:O});
   for(const [a,b] of [[[2,11,0],[14,16,2]],[[2,11,14],[14,16,16]]])box(a,b,{up:T,north:O,south:O});
   box([4,4,4],[12,10,12],{down:I,north:O,south:O,east:O,west:O});
   box([6,0,6],[10,4,10],{down:I,north:O,south:O,east:O,west:O});
  });
 }
 function grindstone(E) {
  const f=requireRoles(E,['down','north','up','east'],'grindstone'),L=f.down,P=f.north,R=f.up,S=f.east;
  composeShape(Three,E,p=>{
   p.box([12,0,6],[14,7,10],{north:L,east:L,south:L,west:L,down:L},{north:[2,9,4,16],east:[10,16,6,9],south:[12,9,14,16],west:[6,9,10,16],down:[12,6,14,10]});
   p.box([2,0,6],[4,7,10],{north:L,east:L,south:L,west:L,down:L},{north:[12,9,14,16],east:[10,16,6,9],south:[2,9,4,16],west:[6,9,10,16],down:[2,6,4,10]});
   p.box([12,7,5],[14,13,11],{north:P,east:P,south:P,up:P,down:P},{north:[6,0,8,6],east:[0,0,6,6],south:[6,0,8,6],up:[8,0,10,6],down:[8,0,10,6]});
   p.box([2,7,5],[4,13,11],{north:P,south:P,west:P,up:P,down:P},{north:[6,0,8,6],south:[6,0,8,6],west:[0,0,6,6],up:[8,0,10,6],down:[8,0,10,6]});
   p.box([4,4,2],[12,16,14],{north:R,east:S,south:R,west:S,up:R,down:R},{north:[0,0,8,12],east:[0,0,12,12],south:[0,0,8,12],west:[0,0,12,12],up:[0,0,8,12],down:[0,0,8,12]});
  });
 }
 function frame(E) {
  const id=requireRoles(E,['up'],'item frame').up,F={north:id,south:id,east:id,west:id,up:id,down:id};
  composeShape(Three,E,p=>p.box([0,0,7.5],[16,16,8.5],F,{north:[0,0,16,16],south:[0,0,16,16],up:[0,0,16,1],down:[0,15,16,16],east:[0,0,1,16],west:[15,0,16,16]}));
 }
 return [{id:'hopper',scale:1,mode:'volume',build:hopper},{id:'grindstone',scale:1,mode:'volume',build:grindstone},{id:'frame',scale:1,mode:'volume',build:frame}];
}
