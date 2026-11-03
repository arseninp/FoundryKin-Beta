/* Closed shulker-box shell from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d,
   resource_pack/models/entity/shulker.geo.json. The entity head is deliberately excluded. */
import {composeShape,requireRoles} from './shapes.mjs';
const IDS=/^(?:undyed|white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|silver|cyan|purple|blue|brown|green|red|black)_shulker_box$/;
const FACINGS=Object.freeze(['up','down','north','south','east','west']);
export function createShulkerBoxModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Shulker box models require Three');
 function build(E) {
  if(typeof E?.cur!=='string'||!IDS.test(E.cur))throw new Error('Unknown shulker box object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid shulker box state');
  const facing=state.facing??'up';
  if(!FACINGS.includes(facing))throw new Error('Invalid shulker box facing');
  if((state.open??false)!==false)throw new Error('Only closed shulker box preview is supported');
  const sheet=requireRoles(E,['sheet'],'shulker box').sheet;
  composeShape(Three,E,p=>{
   function draw(q) {
    for(const [origin,size,uv] of [[[-8,4,-8],[16,12,16],[0,0]],[[-8,0,-8],[16,8,16],[0,28]]]) {
     const [w,h,d]=size,[u,v]=uv;
     const rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
     q.prism(w/16,h/16,d/16,(origin[0]+w/2)/16,(origin[1]+h/2)/16-.5,(origin[2]+d/2)/16,sheet,rects,64);
    }
   }
   if(facing==='up')draw(p);
   else if(facing==='down')p.tilted([8,8,8],Math.PI,draw);
   else if(facing==='north')p.tilted([8,8,8],-Math.PI/2,draw);
   else if(facing==='south')p.tilted([8,8,8],Math.PI/2,draw);
   else p.turned(facing==='east'?Math.PI/2:-Math.PI/2,q=>q.tilted([8,8,8],Math.PI/2,draw));
  });
 }
 return [{id:'shulker_box',scale:1,mode:'volume',build}];
}
