import {pitcherPodResources} from './shared.mjs';
export function pitcherBindings(record) {
 if(!['pitcher_crop','pitcher_plant'].includes(record.id))throw new Error('Unknown pitcher object: '+record.id);
 const faces=record.faces??{},single=(paths,label)=>{
  if(!Array.isArray(paths)||paths.length!==1)throw new Error('Missing or ambiguous pitcher '+label);return paths;
 };
 const bindings={};
 if(record.id==='pitcher_plant') {
  for(const [role,path] of Object.entries(pitcherPodResources))bindings[role]=[path];
  bindings.lower_4=single(faces.down,'lower part');bindings.upper_4=single(faces.up,'upper part');
 } else {
  bindings.pod_top=single(faces.up,'pod top');bindings.pod_bottom=single(faces.down,'pod bottom');bindings.pod_side=single(faces.north,'pod side');
  const lower=record.variants?.south,upper=record.variants?.east;
  if(!Array.isArray(lower)||lower.length!==4||!Array.isArray(upper)||upper.length!==2)throw new Error('Incomplete pitcher growth sequence');
  for(let i=0;i<4;i++)bindings['lower_'+(i+1)]=[lower[i]];
  for(let i=0;i<2;i++)bindings['upper_'+(i+3)]=[upper[i]];
 }
 return bindings;
}
