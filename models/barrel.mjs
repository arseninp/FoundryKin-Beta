/* Accepted barrel presentation: top comes from the source north face, not the edited PNG. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createBarrelModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Barrel models require Three');
 function build(E) {
  const open=E?.state?.open??false;
  if(typeof open!=='boolean')throw new Error('Invalid barrel open state');
  const f=requireRoles(E,['bottom','side',open?'top_open':'top_closed'],'barrel'),full=[0,0,16,16];
  composeShape(Three,E,p=>p.box([0,0,0],[16,16,16],{up:f[open?'top_open':'top_closed'],down:f.bottom,north:f.side,south:f.side,east:f.side,west:f.side},{up:full,down:full,north:full,south:full,east:full,west:full}));
 }
 return [{id:'barrel',scale:1,mode:'volume',build}];
}
