/* Accepted FKCuration pitcher geometry. Stage and pod-only view are independent of the edited PNG. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createPitcherModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Pitcher models require Three');
 function build(E) {
  if(!E||!['pitcher_crop','pitcher_plant'].includes(E.cur))throw new Error('Unknown pitcher object');
  const stage=E.state?.stage??(E.cur==='pitcher_plant'?4:0),podOnly=E.state?.pod_only??false;
  if(!Number.isInteger(stage)||stage<0||stage>4||(E.cur==='pitcher_plant'&&stage!==4))throw new Error('Invalid pitcher stage');
  if(typeof podOnly!=='boolean')throw new Error('Invalid pitcher pod view');
  const roles=['pod_top','pod_bottom','pod_side'];
  if(!podOnly&&stage>0)roles.push('lower_'+stage);
  if(!podOnly&&stage>=3)roles.push('upper_'+stage);
  const f=requireRoles(E,roles,'pitcher'),side=[3,10,13,16];
  composeShape(Three,E,p=>{
   p.box([3,-9,3],[13,-3,13],{up:f.pod_top,down:f.pod_bottom,north:f.pod_side,south:f.pod_side,east:f.pod_side,west:f.pod_side},{up:[3,3,13,13],down:[3,3,13,13],north:side,south:side,east:side,west:side});
   if(podOnly||stage===0)return;
   const cross=(path,h,y)=>{p.face(path,Math.SQRT2,h,0,y,0,0,0,null,true);p.face(path,Math.SQRT2,h,0,y,0,0,Math.PI/2,null,true);};
   cross(f['lower_'+stage],1,stage<=2?-.1875:-.5);
   if(stage>=3)cross(f['upper_'+stage],1,.5);
  });
 }
 return [{id:'pitcher',scale:1.4,mode:'volume',build}];
}
