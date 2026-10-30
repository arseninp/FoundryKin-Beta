/* Accepted FKSculk sensors, shrieker and inset cactus; catalyst uses explicit bloom materials. */
import {composeShape,requireRoles} from './shapes.mjs';
const Q=Math.PI/2,FULL=[0,0,16,16];
const six=(up,down,side)=>({north:side,south:side,east:side,west:side,up,down});
const rects=side=>({north:side,south:side,east:side,west:side,up:FULL,down:FULL});
function flag(E,key) {
 const value=E?.state?.[key]??false;
 if(typeof value!=='boolean')throw new Error('Invalid sculk state: '+key);return value;
}
export function createSculkModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Sculk models require Three');
 function sensor(E) {
  if(!['sculk_sensor','calibrated_sculk_sensor'].includes(E?.cur))throw new Error('Unknown sensor object');
  const active=flag(E,'active'),cal=E.cur==='calibrated_sculk_sensor',roles=['top','bottom','side',active?'tendril_on':'tendril_off'];
  if(cal)roles.push('input','amethyst');
  const f=requireRoles(E,roles,'sculk sensor'),t=f[active?'tendril_on':'tendril_off'];
  composeShape(Three,E,p=>{
   p.box([0,0,0],[16,8,16],{up:f.top,down:f.bottom,north:f.side,south:cal?f.input:f.side,east:f.side,west:f.side},rects([0,8,16,16]));
   for(const [x,z] of [[-5,-5],[5,-5],[5,5],[-5,5]])p.face(t,.5,.5,x/16,.25,z/16,0,Math.PI+(x*z>0?Math.PI/4:-Math.PI/4),x>0?[12,8,4,16]:[4,8,12,16],true);
   if(cal)for(const angle of [Math.PI/4,-Math.PI/4])p.face(f.amethyst,Math.SQRT2,.75,0,.375,0,0,angle,[0,4,16,16],true);
  });
 }
 function shrieker(E) {
  const summon=flag(E,'can_summon'),f=requireRoles(E,['top','bottom','side',summon?'inner_summon':'inner'],'sculk shrieker');
  composeShape(Three,E,p=>{
   p.box([0,0,0],[16,8,16],six(f[summon?'inner_summon':'inner'],f.bottom,f.side),rects([0,8,16,16]));
   const rim=[1,1,15,8];
   p.face(f.side,14/16,7/16,0,7/32,-7/16,0,Math.PI,rim,true);
   p.face(f.side,14/16,7/16,0,7/32,7/16,0,0,rim,true);
   p.face(f.side,14/16,7/16,7/16,7/32,0,0,Q,rim,true);
   p.face(f.side,14/16,7/16,-7/16,7/32,0,0,-Q,rim,true);
   p.face(f.top,14/16,14/16,0,7/16,0,-Q,0,[1,1,15,15],true);
  });
 }
 function catalyst(E) {
  const bloom=flag(E,'bloom'),f=requireRoles(E,['bottom',bloom?'top_bloom':'top',bloom?'side_bloom':'side'],'sculk catalyst');
  composeShape(Three,E,p=>p.box([0,0,0],[16,16,16],six(f[bloom?'top_bloom':'top'],f.bottom,f[bloom?'side_bloom':'side']),rects(FULL)));
 }
 function cactus(E) {
  const f=requireRoles(E,['up','down','north','south','east','west'],'cactus');
  composeShape(Three,E,p=>{
   p.face(f.up,1,1,0,.5,0,-Q,0);p.face(f.down,1,1,0,-.5,0,Q,0);
   p.face(f.north,1,1,0,0,-7/16,0,Math.PI);p.face(f.south,1,1,0,0,7/16,0,0);
   p.face(f.east,1,1,7/16,0,0,0,Q);p.face(f.west,1,1,-7/16,0,0,0,-Q);
  });
 }
 return [{id:'sculk_sensor',scale:1,mode:'volume',build:sensor},{id:'sculk_shrieker',scale:1,mode:'volume',build:shrieker},{id:'sculk_catalyst',scale:1,mode:'volume',build:catalyst},{id:'cactus',scale:1,mode:'volume',build:cactus}];
}
