/* Open structures and cages use Java JSON geometry references with Bedrock-owned materials. */
import {composeShape,requireRoles} from './shapes.mjs';
function cuboid(p,a,b,faces,overrides={}) {
 const uv={north:[16-b[0],16-b[1],16-a[0],16-a[1]],south:[a[0],16-b[1],b[0],16-a[1]],east:[16-b[2],16-b[1],16-a[2],16-a[1]],west:[a[2],16-b[1],b[2],16-a[1]],up:[a[0],a[2],b[0],b[2]],down:[a[0],16-b[2],b[0],16-a[2]]};
 p.box(a,b,faces,{...uv,...overrides});
}
export function createStructureModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Structure models require Three');
 function composter(E) {
  const level=E?.state?.level===undefined?0:E.state.level;
  if(!Number.isInteger(level)||level<0||level>8)throw new Error('Invalid composter level');
  const f=requireRoles(E,['rim','bottom','side','compost','ready'],'composter'),wall={up:f.rim,north:f.side,south:f.side,east:f.side,west:f.side};
  composeShape(Three,E,p=>{
   cuboid(p,[0,0,0],[16,2,16],{up:f.bottom,down:f.bottom});
   cuboid(p,[0,0,0],[2,16,16],wall);
   cuboid(p,[14,0,0],[16,16,16],wall);
   cuboid(p,[2,0,0],[14,16,2],{up:f.rim,north:f.side,south:f.side});
   cuboid(p,[2,0,14],[14,16,16],{up:f.rim,north:f.side,south:f.side});
   if(level)cuboid(p,[2,0,2],[14,Math.min(1+2*level,15),14],{up:level===8?f.ready:f.compost});
  });
 }
 function scaffolding(E) {
  const bottom=E?.state?.bottom===undefined?false:E.state.bottom;
  if(typeof bottom!=='boolean')throw new Error('Invalid scaffolding bottom state');
  const f=requireRoles(E,['up','down','north'],'scaffolding'),side=f.north,foot=f.down;
  composeShape(Three,E,p=>{
   const platform=y=>cuboid(p,[0,y-.01,0],[16,y,16],{up:f.up,down:f.up},{down:[0,16,16,0]});
   const rim=y=>{
    cuboid(p,[2,y,0],[14,y+2,2],{north:side,south:side,down:foot},{north:[2,0,14,2],south:[2,2,14,4]});
    cuboid(p,[2,y,14],[14,y+2,16],{north:side,south:side,down:foot},{north:[14,0,2,2],south:[2,0,14,2]});
    cuboid(p,[14,y,2],[16,y+2,14],{east:side,west:side,down:foot},{east:[14,0,2,2],west:[14,2,2,4]});
    cuboid(p,[0,y,2],[2,y+2,14],{east:side,west:side,down:foot},{east:[2,0,14,2],west:[14,0,2,2]});
   };
   platform(16);
   for(const [x,z] of [[0,0],[0,14],[14,14],[14,0]])cuboid(p,[x,0,z],[x+2,16,z+2],{north:side,east:side,south:side,west:side,down:foot});
   rim(14);
   if(bottom){platform(2);rim(0);}
  });
 }
 function cage(E) {
  if(!E||!['mob_spawner','trial_spawner','vault'].includes(E.cur))throw new Error('Unknown cage object');
  const names=['up','down','north','south','east','west'],bindings=E.bindings??E.faceMap,variant=E.state?.variant===undefined?0:E.state.variant;
  const count=bindings?Object.keys(bindings).filter(role=>/^variant_\d+_up$/.test(role)).length:0;
  if(!count||!Number.isInteger(variant)||variant<0||variant>=count||!Array.from({length:count},(_,i)=>bindings['variant_'+i+'_up']).every(path=>typeof path==='string'&&path))throw new Error('Invalid cage variant');
  const roles=names.map(face=>'variant_'+variant+'_'+face),parts=requireRoles(E,roles,'cage'),faces=Object.fromEntries(names.map((face,index)=>[face,parts[roles[index]]])),f=faces;
  const floor=E.cur==='vault'?3:0,q=Math.PI/2,low=(.002-8)/16,high=(15.998-8)/16,width=15.996/16,height=(15.996-floor)/16,y=floor/32,side=[16,0,0,16-floor];
  composeShape(Three,E,p=>{
   cuboid(p,[0,0,0],[16,16,16],faces);
   p.face(f.north,width,height,0,y,low,0,0,side);
   p.face(f.south,width,height,0,y,high,0,Math.PI,side);
   p.face(f.east,width,height,high,y,0,0,-q,side);
   p.face(f.west,width,height,low,y,0,0,q,side);
   p.face(f.up,width,width,0,high,0,q,0,[0,16,16,0]);
   p.face(f.down,width,width,0,(floor+.002-8)/16,0,-q,0,floor?[16,16,0,0]:[0,16,16,0]);
  });
 }
 return [{id:'composter',scale:1,mode:'volume',build:composter},{id:'scaffolding',scale:1,mode:'volume',build:scaffolding},{id:'cage',scale:1,mode:'volume',build:cage}];
}
