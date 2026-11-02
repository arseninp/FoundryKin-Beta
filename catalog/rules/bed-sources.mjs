/* Explicit bed source adapter. Entity sheets are owned resources, not shared dependencies or cube textures. */
import {BED_COLORS} from './icons.mjs';
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function bedSourcePlan(blocks,models,inventory,aliases) {
 if(![blocks,models,inventory,aliases].every(dictionary))throw new Error('Invalid bed source input');
 const expanded={...blocks},assignments={...models},rules={...aliases},sources=Object.create(null);
 const template=own(blocks,'bed')&&models.bed?.model==='bed';
 if(template) {
  for(const color of BED_COLORS) {
   const id=color+'_bed';
   if(own(blocks,id)&&models[id]?.model!=='bed')throw new Error('Conflicting bed source model: '+id);
   if(!own(blocks,id)){expanded[id]=blocks.bed;assignments[id]=structuredClone(models.bed);}
   sources[id]=color;
  }
  if(own(rules,'bed')&&rules.bed?.target!=='red_bed')throw new Error('Conflicting default bed source route');
  if(!own(rules,'bed'))rules.bed={target:'red_bed',reason:'default bed source uses the red bed presentation'};
  sources.bed='red';
 }
 for(const color of BED_COLORS) {
  const id=color+'_bed';
  if(own(blocks,id)&&models[id]?.model==='bed')sources[id]=color;
 }
 for(const color of Object.values(sources)) {
  const path='textures/entity/bed/'+(color==='light_gray'?'silver':color);
  if(!own(inventory,path))throw new Error('Missing bed source sheet: '+path);
 }
 return {blocks:expanded,models:assignments,aliases:rules,sources};
}
export function normalizeBedSource(id,color,definition,assignment,icons,inventory) {
 if(!BED_COLORS.includes(color)||(id==='bed'?color!=='red':id!==color+'_bed')||assignment?.model!=='bed'||!dictionary(definition)||!Array.isArray(icons)||!dictionary(inventory))throw new Error('Invalid bed source record');
 const sheet='textures/entity/bed/'+(color==='light_gray'?'silver':color),ownedIcons=[...new Set(icons)].sort();
 const paths=[...new Set([sheet,...ownedIcons])].sort();
 for(const path of paths) {
  if(typeof path!=='string'||!/^textures\/[A-Za-z0-9_./-]+$/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..')||!own(inventory,path))throw new Error('Missing or invalid bed resource: '+path);
 }
 const faces=()=>Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,[sheet]]));
 return {id,model:'bed',states:assignment.states===undefined?null:structuredClone(assignment.states),faces:faces(),carried:null,variants:faces(),carriedVariants:null,icons:ownedIcons,paths,bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'bed',color,definition:structuredClone(definition)}};
}
