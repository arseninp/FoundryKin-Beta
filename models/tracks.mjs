/* Four rail types reuse the accepted flat sheet. Curvature and power never depend on the edited PNG. */
import {composeShape,requireRoles} from './shapes.mjs';
const IDS=['rail','golden_rail','detector_rail','activator_rail'];
export function createTrackModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Track models require Three');
 function build(E) {
  if(!E||!IDS.includes(E.cur))throw new Error('Unknown rail object');
  const state=E.state??{},plain=E.cur==='rail';
  let alternate;
  if(plain) {
   const curved=state.curved??false;
   if(typeof curved!=='boolean')throw new Error('Invalid rail curve state');
   if(state.powered!==undefined)throw new Error('Ordinary rail has no power state');
   alternate=curved;
  } else {
   const powered=state.powered??'off';
   if(powered!=='off'&&powered!=='on')throw new Error('Invalid rail power state');
   if(state.curved!==undefined&&state.curved!==false)throw new Error('Powered rail type has no curve state');
   alternate=powered==='on';
  }
  const f=requireRoles(E,['up','down'],'rail'),path=alternate?f.up:f.down;
  composeShape(Three,E,p=>p.face(path,1,1,0,0,0,-Math.PI/2,0,null,true));
 }
 return [{id:'track',scale:1,mode:'volume',build}];
}
