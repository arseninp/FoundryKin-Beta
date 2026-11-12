/* Simplified Java template_azalea.json layout, reference blob 2c22ef84132bbe54a10ef3d18395f1fc0257b78f.
   Canopy uses single double-sided planes; plant planes keep full dimensions without micro-insets.
   This is not an exact Java geometry copy or verified Bedrock geometry. Bedrock texture roles are injected. */
import {composeShape} from './shapes.mjs';
export function createAzaleaModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Azalea models require Three');
 function build(E){
  if(!E||!['azalea','flowering_azalea'].includes(E.cur))throw new Error('Unknown azalea object');
  const bindings=E.bindings;
  if(!bindings||!E.mats)throw new Error('Missing azalea bindings');
  for(const role of ['top','side','plant']){
   const path=bindings[role],material=E.mats[path];
   if(typeof path!=='string'||!path||!material||material===E.hiddenMat)throw new Error('Missing azalea material: '+role);
  }
  composeShape(Three,E,p=>{
   p.face(bindings.top,1,1,0,.5,0,-Math.PI/2,0,[0,0,16,16],true);
   for(const [x,z,angle] of [[0,-.5,Math.PI],[0,.5,0],[.5,0,Math.PI/2],[-.5,0,-Math.PI/2]]){
    p.face(bindings.side,1,11/16,x,5/32,z,0,angle,[0,0,16,11],true);
   }
   for(const angle of [Math.PI/4,-Math.PI/4])p.face(bindings.plant,Math.SQRT2,1,0,0,0,0,angle,[0,0,16,16],true);
  });
 }
 return [{id:'azalea',scale:1,mode:'volume',build}];
}
