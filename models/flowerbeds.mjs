/* Accepted FKBlocksB flowerbed layout: four flower quadrants and eight crossed stems. */
import {composeShape, requireRoles} from './shapes.mjs';
const BEDS=[[4,4,2.99,[0,0,8,8]],[4,12,1,[0,8,8,16]],[12,12,2,[8,8,16,16]],[12,4,2,[8,0,16,8]]];
const STEMS=[[4.49,1.52,2.99,4,7],[1.48,5.44,2.99,4,7],[6.43,6.51,2.99,4,7],[4.53,11.54,1,6,7],[11.99,13.97,2,5,7],[14.5,10.47,2,5,7],[9.48,9.48,2,5,7],[11.45,3.51,2,5,7]];
export function createFlowerbedModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Flowerbed models require Three');
 function build(E) {
  const f=requireRoles(E,['flower','stem'],'flowerbed');
  composeShape(Three,E,p=>{
   for(const b of BEDS)p.face(f.flower,.5,.5,(b[0]-8)/16,(b[2]-8)/16,(b[1]-8)/16,-Math.PI/2,0,b[3],true);
   for(const s of STEMS)for(const angle of [Math.PI/4,-Math.PI/4])p.face(f.stem,1/16,s[2]/16,(s[0]-8)/16,(s[2]/2-8)/16,(s[1]-8)/16,0,angle,[0,s[3],1,s[4]],true);
  });
 }
 return [{id:'flowerbed',scale:1,mode:'volume',build}];
}
