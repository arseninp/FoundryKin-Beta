/* Shell: Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d,
   resource_pack/models/entity/shulker.geo.json; the entity head is excluded.
   Static open pose is a Java block-renderer reference: Blackjack200/minecraft_client_1_20_1@c129e3e,
   ShulkerBoxRenderer.java. No mob wobble or playback; Bedrock visual acceptance is pending. */
import {composeShape,requireRoles} from './shapes.mjs';
const IDS=/^(?:undyed|white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|silver|cyan|purple|blue|brown|green|red|black)_shulker_box$/;
export function createShulkerBoxModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Shulker box models require Three');
 function build(E) {
  if(typeof E?.cur!=='string'||!IDS.test(E.cur))throw new Error('Unknown shulker box object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid shulker box state');
  const open=state.open??false;
  if(typeof open!=='boolean')throw new Error('Invalid shulker box open state');
  const sheet=requireRoles(E,['sheet'],'shulker box').sheet;
  composeShape(Three,E,p=>{
   function box(q,origin,size,uv) {
    const [w,h,d]=size,[u,v]=uv;
    const rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
    q.prism(w/16,h/16,d/16,(origin[0]+w/2)/16,(origin[1]+h/2)/16-.5,(origin[2]+d/2)/16,sheet,rects,64);
   }
   function lid(q) {box(q,[-8,open?12:4,-8],[16,12,16],[0,0]);}
   function draw(q) {
    /* Java renderer lifts 8 px and applies +270 degrees in its inverted Y/Z basis. */
    if(open)q.turned(-3*Math.PI/2,lid);else lid(q);
    box(q,[-8,0,-8],[16,8,16],[0,28]);
   }
   draw(p);
  });
 }
 return [{id:'shulker_box',scale:1,mode:'volume',build}];
}
