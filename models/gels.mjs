/* Two-volume slime and honey previews; PNG alpha belongs to the shared material policy. */
import {composeShape,requireRoles} from './shapes.mjs';
const FACES=['up','down','north','south','east','west'],FULL=[0,0,16,16];
const all=value=>Object.fromEntries(FACES.map(face=>[face,value]));
export function createGelModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Gel models require Three');
 function layered(id,roles,low,high,inside,shell) {
  return {id,scale:1,mode:'volume',build(E) {
   const f=requireRoles(E,roles,id),inner=inside(f),outer=all(f[shell]),cut=all([low,low,high,high]);
   composeShape(Three,E,p=>{
    p.box([low,low,low],[high,high,high],inner,cut);
    p.box([0,0,0],[16,16,16],outer,all(FULL));
   });
  }};
 }
 return [
  layered('slime',['up'],3,13,f=>all(f.up),'up'),
  layered('honey_block',['up','down','north'],1,15,f=>({up:f.up,down:f.down,north:f.north,south:f.north,east:f.north,west:f.north}),'down')
 ];
}
