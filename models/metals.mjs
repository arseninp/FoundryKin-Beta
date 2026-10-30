/* Accepted FKDetails geometry for metal bars, lightning rods, end rods and the heavy core. */
import {composeShape,requireRoles} from './shapes.mjs';
const Q=Math.PI/2;
const six=id=>({north:id,south:id,east:id,west:id,up:id,down:id});
const rects=(side,top,bottom)=>({north:side,south:side,east:side,west:side,up:top,down:bottom??top});
export function createMetalModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Metal models require Three');
 function bars(E) {
  const f=requireRoles(E,['north','east'],'bars'),B=f.north,S=f.east;
  composeShape(Three,E,p=>{
   p.face(B,1,1,0,0,0,0,0,[0,0,16,16],true);
   p.face(S,.125,1,-.5,0,0,0,-Q,[7,0,9,16],true);
   p.face(S,.125,1,.5,0,0,0,Q,[7,0,9,16],true);
   p.face(S,1,.125,0,.49994,0,-Q,0,[7,0,9,16,90],true);
   p.face(S,1,.125,0,-.49994,0,Q,0,[7,0,9,16,90],true);
  });
 }
 function lightning(E) {
  const state=E?.state?.powered??'off';
  if(state!=='off'&&state!=='on')throw new Error('Invalid lightning rod power state');
  const f=requireRoles(E,['off','on'],'lightning rod'),id=f[state];
  composeShape(Three,E,p=>{
   p.box([6,12,6],[10,16,10],six(id),rects([0,0,4,4],[4,4,0,0],[0,0,4,4]));
   const faces=six(id);delete faces.up;
   p.box([7,0,7],[9,12,9],faces,rects([0,4,2,16],[0,4,2,6],[0,4,2,6]));
  });
 }
 function endRod(E) {
  const id=requireRoles(E,['up'],'end rod').up;
  composeShape(Three,E,p=>{
   p.box([6,0,6],[10,1,10],six(id),rects([2,6,6,7],[2,2,6,6],[6,6,2,2]));
   const faces=six(id);delete faces.down;
   p.box([7,1,7],[9,16,9],faces,rects([0,0,2,15],[2,0,4,2]));
  });
 }
 function core(E) {
  const id=requireRoles(E,['up'],'heavy core').up;
  composeShape(Three,E,p=>p.box([4,0,4],[12,8,12],six(id),rects([0,8,8,16],[0,0,8,8],[8,0,16,8])));
 }
 return [{id:'bars',scale:1,mode:'volume',build:bars},{id:'lightning_rod',scale:1,mode:'volume',build:lightning},{id:'end_rod',scale:1,mode:'volume',build:endRod},{id:'heavy_core',scale:1,mode:'volume',build:core}];
}
