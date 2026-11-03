/* Static banner reference: acacia-rs/acacia@750f657, entity/block_models.json,
   block_models.rs and bake.rs. Not a Mojang geometry export or Bedrock visual acceptance. */
import {composeShape,requireRoles} from './shapes.mjs';
const FACING=Object.freeze({north:0,east:-Math.PI/2,south:Math.PI,west:Math.PI/2}),SCALE=2/3;
export function createBannerModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Banner models require Three');
 function build(E) {
  if(!['standing_banner','wall_banner'].includes(E?.cur))throw new Error('Unknown banner object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid banner state');
  const mounting=state.mounting??(E.cur==='wall_banner'?'wall':'standing'),rotation=state.rotation??0,facing=state.facing??'north';
  if(!['standing','wall'].includes(mounting)||!Number.isInteger(rotation)||rotation<0||rotation>15||typeof facing!=='string'||!Object.hasOwn(FACING,facing))throw new Error('Invalid banner placement');
  const sheet=requireRoles(E,['sheet'],'banner').sheet;
  composeShape(Three,E,p=>{
   function box(q,origin,size,uv) {
    const [w,h,d]=size,[u,v]=uv;
    const rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
    q.prism(w*SCALE/16,h*SCALE/16,d*SCALE/16,(origin[0]+w/2)*SCALE/16,(origin[1]+h/2)*SCALE/16-.5,(origin[2]+d/2)*SCALE/16,sheet,rects,64);
   }
   function draw(q) {
    const wall=mounting==='wall';
    if(!wall)box(q,[-1,0,-1],[2,42,2],[44,0]);
    box(q,wall?[-10,18.5,9.5]:[-10,42,-1],[20,2,2],[0,42]);
    const pivot=wall?[0,20.5,10.5]:[0,44,0],origin=wall?[-10,-19.5,8.5]:[-10,4,-2];
    q.tilted([8+pivot[0]*SCALE,pivot[1]*SCALE,8+pivot[2]*SCALE],Math.PI/80,r=>box(r,origin,[20,40,1],[0,0]));
   }
   const angle=mounting==='standing'?rotation*Math.PI/8:FACING[facing];
   if(angle)p.turned(angle,draw);else draw(p);
  });
 }
 return [{id:'banner',scale:1.4,mode:'volume',build}];
}
