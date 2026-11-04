/* Head cube/UV from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d:
   resource_pack/models/entity/{skeleton,wither_skeleton,creeper,zombie,ender_dragon,humanoid.custom}.geo.json.
   Detached floor head candidates; no entity body, charged layer, baby variant, wall mounting or animation.
   Player: 64x64 head UV [0,0] plus hat UV [32,0], inflate 0.5 px; other head layers stay unchanged.
   The four cube heads use doubled UV Y for 64x32 sheets; piglin uses 64x64 and dragon 256x256. */
import {composeShape,requireRoles} from './shapes.mjs';
import {buildPiglinHead} from './piglin-head.mjs';
import {buildDragonHead} from './dragon-head.mjs';
const IDS=new Set(['skeleton_skull','wither_skeleton_skull','creeper_head','zombie_head','piglin_head','dragon_head','player_head']);
const UV=Object.freeze({east:[24,16,16,32],west:[8,16,0,32],north:[16,16,8,32],south:[32,16,24,32],up:[8,16,16,0],down:[16,0,24,16]});
const PLAYER_UV=Object.freeze({east:[24,8,16,16],west:[8,8,0,16],north:[16,8,8,16],south:[32,8,24,16],up:[8,8,16,0],down:[16,0,24,8]});
const PLAYER_HAT_UV=Object.freeze(Object.fromEntries(Object.entries(PLAYER_UV).map(([face,r])=>[face,[r[0]+32,r[1],r[2]+32,r[3]]])));
export function createSkullModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Skull models require Three');
 function build(E) {
  if(!IDS.has(E?.cur))throw new Error('Unknown skull object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid skull state');
  const rotation=state.rotation??0,mounting=state.mounting??'standing';
  if(!Number.isInteger(rotation)||rotation<0||rotation>15)throw new Error('Invalid skull rotation');
  if(mounting!=='standing')throw new Error('Unsupported skull mounting');
  const sheet=requireRoles(E,['sheet'],'skull').sheet;
  if(E.cur==='piglin_head')return buildPiglinHead(Three,E,sheet,rotation);
  if(E.cur==='dragon_head')return buildDragonHead(Three,E,sheet,rotation);
  if(E.cur==='player_head') {
   composeShape(Three,E,p=>p.turned(-rotation*Math.PI/8,q=>{
    q.prism(.5,.5,.5,0,-.25,0,sheet,PLAYER_UV,64);
    q.prism(9/16,9/16,9/16,0,-.25,0,sheet,PLAYER_HAT_UV,64);
   }));
   return;
  }
  composeShape(Three,E,p=>p.turned(-rotation*Math.PI/8,q=>q.prism(.5,.5,.5,0,-.25,0,sheet,UV,64)));
 }
 return [{id:'skull',scale:1.4,mode:'volume',build}];
}
