/* Head cube/UV from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d:
   resource_pack/models/entity/{skeleton,wither_skeleton,creeper,zombie}.geo.json.
   Detached floor head candidates; no entity body, hidden hat, charged layer, baby variant, wall mounting or animation.
   UV Y is doubled to express a 64x32 sheet through the existing square-64 painter. */
import {composeShape,requireRoles} from './shapes.mjs';
const IDS=new Set(['skeleton_skull','wither_skeleton_skull','creeper_head','zombie_head']);
const UV=Object.freeze({east:[24,16,16,32],west:[8,16,0,32],north:[16,16,8,32],south:[32,16,24,32],up:[8,16,16,0],down:[16,0,24,16]});
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
  composeShape(Three,E,p=>p.turned(-rotation*Math.PI/8,q=>q.prism(.5,.5,.5,0,-.25,0,sheet,UV,64)));
 }
 return [{id:'skull',scale:1.4,mode:'volume',build}];
}
