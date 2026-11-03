/* Single/double chest geometry reference: acacia-rs/acacia@750f657, entity/block_models.json and bake.rs.
   Static lid poses are preview candidates, not Mojang animation data or Bedrock PNG/UV acceptance. */
import {composeShape,requireRoles} from './shapes.mjs';
const FACING=Object.freeze({north:0,east:-Math.PI/2,south:Math.PI,west:Math.PI/2});
const COPPER=/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?copper_chest$/;
export function createChestModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Chest models require Three');
 function build(E) {
  if(!['chest','trapped_chest','ender_chest'].includes(E?.cur)&&!(typeof E?.cur==='string'&&COPPER.test(E.cur)))throw new Error('Unknown chest object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid chest state');
  const facing=state.facing??'north',double=state.double??false,open=state.open??false;
  if(typeof facing!=='string'||!Object.hasOwn(FACING,facing))throw new Error('Invalid chest facing');
  if(typeof double!=='boolean')throw new Error('Invalid chest double state');
  if(typeof open!=='boolean')throw new Error('Invalid chest open state');
  if(double&&E.cur==='ender_chest')throw new Error('Ender chest has no double form');
  const role=double?'double_sheet':'sheet',sheet=requireRoles(E,[role],'chest')[role],width=double?30:14,left=double?-15:-7,atlasWidth=double?128:64;
  composeShape(Three,E,p=>{
   function box(q,origin,size,uv) {
    const [w,h,d]=size,[u,v]=uv;
    /* Convert reference UV corners to the existing prism painter; double sheets are 128x64. */
    const raw={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
    const rects=Object.fromEntries(Object.entries(raw).map(([face,[u0,v0,u1,v1]])=>[face,[u0*64/atlasWidth,v0,u1*64/atlasWidth,v1]]));
    q.prism(w/16,h/16,d/16,(origin[0]+w/2)/16,(origin[1]+h/2)/16-.5,(origin[2]+d/2)/16,sheet,rects,64);
   }
   function lid(q) {
    box(q,[left,9,-7],[width,5,14],[0,0]);
    box(q,[-1,7,-8],[2,4,1],[0,0]);
   }
   function draw(q) {
    box(q,[left,0,-7],[width,10,14],[0,19]);
    /* Rear lid edge: x=0, y=9, z=7 in reference model units. */
    if(open)q.tilted([8,9,15],Math.PI/2,lid);else lid(q);
   }
   if(FACING[facing])p.turned(FACING[facing],draw);else draw(p);
  });
 }
 return [{id:'chest',scale:1,mode:'volume',build}];
}
