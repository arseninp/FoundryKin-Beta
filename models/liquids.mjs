/* Uniform-height water/lava editor samples, not a world fluid simulator.
   Height and side UV reference: acacia-rs/acacia@750f65749e88d5fd42f586b6a9dd9ac2ffbe08ed,
   blocks/fluid.rs and mesh/liquid/tesselate.rs (Java-look rules). No neighbour averaging,
   falling flow, biome tint, overlays or animation timing. Bedrock appearance still needs acceptance. */
import {composeShape,requireRoles} from './shapes.mjs';
const FACES=Object.freeze(['up','down','north','south','east','west']);
export function createLiquidModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Liquid models require Three');
 function liquid(ids,label) {
  return function build(E) {
   if(!ids.includes(E?.cur))throw new Error('Unknown '+label+' object');
   const state=E.state??{};
   if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid liquid state');
   const level=state.level??0;
   if(!Number.isInteger(level)||level<0||level>7)throw new Error('Invalid liquid preview level');
   const f=requireRoles(E,FACES,label),height=(8-level)/9,full=[0,0,16,16],side=[0,(1-height)*8,8,8];
   const faces=Object.fromEntries(FACES.map(face=>[face,f[face]]));
   composeShape(Three,E,p=>p.box([0,0,0],[16,height*16,16],faces,{up:full,down:full,north:side,south:side,east:side,west:side}));
  };
 }
 return [{id:'water',scale:1,mode:'volume',build:liquid(['water','flowing_water'],'water')},{id:'lava',scale:1,mode:'volume',emissiveRoles:[...FACES],build:liquid(['lava','flowing_lava'],'lava')}];
}
