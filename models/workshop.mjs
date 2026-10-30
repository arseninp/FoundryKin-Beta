/* Accepted FKDetails geometry: workshop models, cauldron, cocoa and daylight detectors. */
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
 function cauldron(E) {
  const content=E?.state?.content??'empty';
  if(!['empty','water','colored_water'].includes(content))throw new Error('Invalid cauldron content');
  const roles=['rim','bottom','wall','floor'];if(content!=='empty')roles.push(content);
  const f=requireRoles(E,roles,'cauldron');
  composeShape(Three,E,p=>{
   const box=(a,b,F)=>p.box(a,b,F,autoUV(a,b));
   const wall={north:f.wall,south:f.wall,east:f.wall,west:f.wall,up:f.rim,down:f.floor};
   for(const [a,b] of [[[0,3,0],[2,16,16]],[[14,3,0],[16,16,16]],[[2,3,0],[14,16,2]],[[2,3,14],[14,16,16]]])box(a,b,wall);
   box([2,3,2],[14,4,14],{up:f.floor,down:f.floor});
   const foot={north:f.wall,south:f.wall,east:f.wall,west:f.wall,down:f.bottom};
   for(const [a,b] of [[[0,0,0],[4,3,2]],[[0,0,2],[2,3,4]],[[12,0,0],[16,3,2]],[[14,0,2],[16,3,4]],[[0,0,14],[4,3,16]],[[0,0,12],[2,3,14]],[[12,0,14],[16,3,16]],[[14,0,12],[16,3,14]]])box(a,b,foot);
   if(content!=='empty')p.face(f[content],.75,.75,0,6/16,0,-Math.PI/2,0,[2,2,14,14],true);
  });
 }
 function cocoa(E) {
  const stage=E?.state?.stage??2;
  if(!Number.isInteger(stage)||stage<0||stage>2)throw new Error('Invalid cocoa stage');
  const id=requireRoles(E,['stage_'+stage],'cocoa')['stage_'+stage],w=4+2*stage,h=5+2*stage;
  const six={north:id,south:id,east:id,west:id,up:id,down:id},side=[15-w,4,15,4+h],top=[0,0,w-1,w-1];
  composeShape(Three,E,p=>{
   p.box([8-w/2,12-h,15-w],[8+w/2,12,15],six,{north:side,south:side,east:side,west:side,up:top,down:top});
   p.face(id,.25,.25,0,.375,.375,0,Math.PI/2,[16,0,12,4],true);
  });
 }
 function daylight(E) {
  const mode=E?.state?.mode??(E?.cur==='daylight_detector_inverted'?'inverted':'day');
  if(!['day','inverted'].includes(mode))throw new Error('Invalid daylight mode');
  const f=requireRoles(E,[mode,'bottom','side'],'daylight'),side=[0,10,16,16],top=[0,0,16,16];
  composeShape(Three,E,p=>p.box([0,0,0],[16,6,16],{up:f[mode],down:f.bottom,north:f.side,south:f.side,east:f.side,west:f.side},{up:top,down:top,north:side,south:side,east:side,west:side}));
 }
 return [{id:'hopper',scale:1,mode:'volume',build:hopper},{id:'grindstone',scale:1,mode:'volume',build:grindstone},{id:'frame',scale:1,mode:'volume',build:frame},{id:'cauldron',scale:1,mode:'volume',build:cauldron},{id:'cocoa',scale:1,mode:'volume',build:cocoa},{id:'daylight',scale:1,mode:'volume',build:daylight}];
}
