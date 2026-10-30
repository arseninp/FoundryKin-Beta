/* Accepted FKCuration redstone wire sheet. Pattern is explicit, never selected by the edited PNG. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createWireModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Wire models require Three');
 function build(E) {
  const pattern=E?.state?.pattern??'cross';
  if(pattern!=='cross'&&pattern!=='line')throw new Error('Invalid redstone wire pattern');
  const f=requireRoles(E,['up','down'],'redstone wire'),path=pattern==='cross'?f.up:f.down;
  composeShape(Three,E,p=>p.face(path,1,1,0,0,0,-Math.PI/2,0,null,true));
 }
 return [{id:'redstone_wire',scale:1,mode:'volume',build}];
}
