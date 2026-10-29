/* One centered amethyst stage. Full PNG UVs preserve its authored alpha silhouette. */
import {createPlanarModels} from './planar.mjs';
const IDS=new Set(['small_amethyst_bud','medium_amethyst_bud','large_amethyst_bud','amethyst_cluster']);
export function createAmethystModels(Three) {
 const cross=createPlanarModels(Three).find(model=>model.id==='cross');
 return [{id:'amethyst',scale:1,mode:'volume',build(environment){
  if(!environment||!IDS.has(environment.cur))throw new Error('Unknown amethyst stage');
  const path=environment.bindings&&Object.hasOwn(environment.bindings,'crystal')?environment.bindings.crystal:environment.faceMap?.up;
  if(typeof path!=='string'||!path)throw new Error('Missing amethyst crystal binding');
  return cross.build({...environment,faceMap:{up:path}});
 }}];
}
