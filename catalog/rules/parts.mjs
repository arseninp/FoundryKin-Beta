/* Named model parts are declared from owned resources, independently of edited slots. */
import {pitcherBindings} from './pitcher-parts.mjs';
import {utilityBindings} from './utility-parts.mjs';
export function modelPartBindings(record) {
 if(record.model==='stage_cross') {
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||!paths.length||paths.some(path=>typeof path!=='string'||!record.paths.includes(path)))throw new Error('Missing or invalid staged cross sequence');
  return Object.fromEntries(paths.map((path,index)=>['stage_'+index,[path]]));
 }
 if(record.model==='flower') {
  const parts={up:record.faces?.up,down:record.faces?.down};
  for(const [role,paths] of Object.entries(parts))if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0]))throw new Error('Missing or ambiguous tall plant half: '+role);
  return {up:[...parts.up],down:[...parts.down]};
 }
 const utility=utilityBindings(record);if(utility)return utility;
 if(record.model==='lightning_rod') {
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||paths.length!==2||paths.some(path=>typeof path!=='string'||!record.paths.includes(path)))throw new Error('Missing or invalid lightning rod variants');
  return {off:[paths[0]],on:[paths[1]]};
 }
 if(record.model==='pitcher')return pitcherBindings(record);
 if(record.model==='sniffer_egg') {
  if(record.id!=='sniffer_egg')throw new Error('Unknown sniffer egg object');
  const faces=['up','down','north','south','east','west'],variants=record.variants,count=variants?.up?.length;
  if(!Number.isInteger(count)||count<1)throw new Error('Missing sniffer egg stages');
  const bindings={};
  for(const face of faces) {
   const paths=variants[face];
   if(!Array.isArray(paths)||paths.length!==count)throw new Error('Mismatched sniffer egg stages: '+face);
   for(let stage=0;stage<count;stage++) {
    const path=paths[stage];
    if(typeof path!=='string'||!record.paths.includes(path))throw new Error('Invalid sniffer egg resource: '+face);
    bindings['stage_'+stage+'_'+face]=[path];
   }
  }
  return bindings;
 }
 if(record.model!=='flowerbed'&&record.model!=='sunflower')return null;
 const candidates=[...new Set(Object.values(record.faces??{}).flat())];
 if(record.model==='sunflower') {
  if(record.id!=='sunflower')throw new Error('Unknown sunflower object: '+record.id);
  const find=part=>{
   const paths=candidates.filter(path=>{const name=path.split('/').pop();return name==='sunflower_'+part||name==='double_plant_sunflower_'+part;});
   if(paths.length!==1)throw new Error('Missing or ambiguous sunflower part: '+part);return paths;
  };
  const up=record.faces?.up,down=record.faces?.down;
  if(!Array.isArray(up)||up.length!==1||!Array.isArray(down)||down.length!==1)throw new Error('Missing or ambiguous sunflower stem');
  return {up,down,front:find('front'),back:find('back')};
 }
 if(!['pink_petals','wildflowers'].includes(record.id))throw new Error('Unknown flowerbed object: '+record.id);
 const find=name=>{
  const paths=candidates.filter(path=>path.split('/').pop()===name);
  if(paths.length!==1)throw new Error('Missing or ambiguous flowerbed part: '+name);
  return paths;
 };
 return {flower:find(record.id),stem:find(record.id+'_stem')};
}
