/* Named resources for utility models, independent of edited slots. */
import {chorusPlantResources} from './shared.mjs';
const FIXED_PRIMITIVES=Object.freeze({
 wooden_button:['button','planks_oak',6],wooden_pressure_plate:['plate','planks_oak',6],
 stone_button:['button','stone',7],stone_pressure_plate:['plate','stone',7],
 normal_stone_stairs:['stairs','stone',7],stone_brick_stairs:['stairs','stonebrick',4],
 prismarine_stairs:['stairs','prismarine_rough',3],
 sandstone_stairs:['stairs',{up:'sandstone_top',down:'sandstone_bottom',side:'sandstone_normal'},4],
 red_sandstone_stairs:['stairs',{up:'red_sandstone_top',down:'red_sandstone_bottom',side:'red_sandstone_normal'},4]
});
export function utilityBindings(record) {
 const single=(paths,label)=>{
  if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0]))throw new Error('Missing or ambiguous '+label);
  return [...paths];
 };
 const named=(paths,name)=>single([...new Set(paths??[])].filter(path=>typeof path==='string'&&path.split('/').pop()===name),name);
 if(Object.hasOwn(FIXED_PRIMITIVES,record.id)) {
  const [model,name,count]=FIXED_PRIMITIVES[record.id];
  if(record.model!==model)return null;
  const bindings={};
  for(const face of ['up','down','north','south','east','west']) {
   const paths=record.variants?.[face];
   if(!Array.isArray(paths)||paths.length!==count)throw new Error('Incomplete indexed primitive resources: '+record.id+': '+face);
   bindings[face]=named(paths,typeof name==='string'?name:(name[face]??name.side));
  }
  return bindings;
 }
 if(record.model==='emissive_cross') {
  const specs={open_eyeblossom:['eyeblossom_stem_blooming','eyeblossom_eyes_blooming'],firefly_bush:['firefly_bush','firefly_bush_firefly']};
  const names=Object.hasOwn(specs,record.id)?specs[record.id]:null;
  if(!names)throw new Error('Unknown emissive plant object');
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||paths.length!==2)throw new Error('Incomplete emissive plant resources');
  const plant=single([paths[0]],'emissive plant body'),glow=single([paths[1]],'emissive plant glow');
  if(plant[0].split('/').pop()!==names[0]||glow[0].split('/').pop()!==names[1])throw new Error('Unexpected emissive plant texture order');
  return {plant,glow};
 }
 if(record.model==='mangrove_propagule') {
  if(record.id!=='mangrove_propagule')throw new Error('Unknown mangrove propagule object');
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||paths.length!==2)throw new Error('Incomplete mangrove propagule resources');
  return {ground:single([paths[0]],'ground propagule'),hanging:single([paths[1]],'hanging propagule')};
 }
 if(record.model==='chorus_flower') {
  if(record.id!=='chorus_flower')throw new Error('Unknown chorus flower object');
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||paths.length!==2)throw new Error('Incomplete chorus flower resources');
  return {live:single([paths[0]],'chorus flower live'),dead:single([paths[1]],'chorus flower dead'),stem:[chorusPlantResources.stem]};
 }
 if(record.model==='cage') {
  const counts={mob_spawner:1,trial_spawner:12,vault:8},count=Object.hasOwn(counts,record.id)?counts[record.id]:0;
  if(!count)throw new Error('Unknown cage object');
  const bindings={};
  for(const face of ['up','down','north','south','east','west']) {
   const paths=record.variants?.[face];
   if(!Array.isArray(paths)||paths.length!==count)throw new Error('Incomplete cage variants: '+face);
   for(let variant=0;variant<count;variant++)bindings['variant_'+variant+'_'+face]=single([paths[variant]],'cage '+face+' variant '+variant);
  }
  return bindings;
 }
 if(record.model==='composter') {
  if(record.id!=='composter')throw new Error('Unknown composter object');
  const top=record.variants?.up,f=record.faces??{};
  if(!Array.isArray(top)||top.length!==3)throw new Error('Incomplete composter resources');
  return {rim:single([top[0]],'composter rim'),compost:single([top[1]],'composter compost'),ready:single([top[2]],'composter ready'),bottom:single(f.down,'composter bottom'),side:single(f.north,'composter side')};
 }
 if(record.model==='farmland') {
  if(record.id!=='farmland')throw new Error('Unknown farmland object');
  const top=record.variants?.up,f=record.faces??{};
  if(!Array.isArray(top)||top.length!==2)throw new Error('Incomplete farmland top variants');
  return {wet:single([top[0]],'farmland wet top'),dry:single([top[1]],'farmland dry top'),bottom:single(f.down,'farmland bottom'),side:single(f.north,'farmland side')};
 }
 if(record.model==='barrel') {
  if(record.id!=='barrel')throw new Error('Unknown barrel object');
  const top=record.variants?.north,f=record.faces??{};
  if(!Array.isArray(top)||top.length!==2)throw new Error('Incomplete barrel top variants');
  return {top_closed:single([top[0]],'barrel closed top'),top_open:single([top[1]],'barrel open top'),bottom:single(f.south,'barrel bottom'),side:single(f.up,'barrel side')};
 }
 if(record.model==='dried_ghast') {
  if(record.id!=='dried_ghast')throw new Error('Unknown dried ghast object');
  const bindings={},faces=['up','down','north','south','east','west','tent'];
  for(const face of faces) {
   const paths=face==='tent'?record.carriedVariants?.up:record.variants?.[face];
   if(!Array.isArray(paths)||paths.length!==4)throw new Error('Incomplete dried ghast stages: '+face);
   for(let stage=0;stage<4;stage++)bindings['stage_'+stage+'_'+face]=single([paths[stage]],'dried ghast '+face+' stage '+stage);
  }
  return bindings;
 }
 if(record.model==='pointed_dripstone') {
  if(record.id!=='pointed_dripstone')throw new Error('Unknown pointed dripstone object');
  return Object.fromEntries(['down','up'].flatMap(direction=>['base','middle','frustum','tip','tip_merge'].map(part=>[direction+'_'+part,named(record.paths,'pointed_dripstone_'+direction+'_'+(part==='tip_merge'?'merge':part))])));
 }
 if(record.model==='sculk_sensor') {
  if(!['sculk_sensor','calibrated_sculk_sensor'].includes(record.id))throw new Error('Unknown sensor object');
  const f=record.faces??{},c=record.carried??{},parts={top:single(f.up,'sensor top'),bottom:single(f.down,'sensor bottom'),side:single(f.north,'sensor side'),tendril_off:named(c.up,'sculk_sensor_tendril_inactive'),tendril_on:named(c.north,'sculk_sensor_tendril_active')};
  if(record.id==='calibrated_sculk_sensor'){parts.input=single(f.south,'sensor input');parts.amethyst=named(c.south,'calibrated_sculk_sensor_amethyst');}
  return parts;
 }
 if(record.model==='sculk_shrieker') {
  if(record.id!=='sculk_shrieker')throw new Error('Unknown shrieker object');
  const f=record.faces??{},inner=record.carried?.up;
  return {top:single(f.up,'shrieker top'),bottom:single(f.down,'shrieker bottom'),side:single(f.north,'shrieker side'),inner:named(inner,'sculk_shrieker_inner_top'),inner_summon:named(inner,'sculk_shrieker_can_summon_inner_top')};
 }
 if(record.model==='sculk_catalyst') {
  if(record.id!=='sculk_catalyst')throw new Error('Unknown catalyst object');
  const f=record.faces??{};
  return {bottom:single(f.down,'catalyst bottom'),top:named(f.up,'sculk_catalyst_top'),top_bloom:named(f.up,'sculk_catalyst_top_bloom'),side:named(f.north,'sculk_catalyst_side'),side_bloom:named(f.north,'sculk_catalyst_side_bloom')};
 }
 if(record.model==='decorated_pot') {
  if(record.id!=='decorated_pot')throw new Error('Unknown decorated pot object');
  const paths=[...new Set(Object.values(record.faces??{}).flat())];
  const find=part=>single(paths.filter(path=>typeof path==='string'&&path.split('/').pop()==='decorated_pot_'+part),'decorated pot '+part);
  return {side:find('side'),base:find('base')};
 }
 if(record.model==='cauldron') {
  if(!['cauldron','lava_cauldron'].includes(record.id))throw new Error('Unknown cauldron object');
  const f=record.faces??{},liquid=record.id==='lava_cauldron'?{lava:f.east}:{water:f.east,colored_water:f.west};
  return Object.fromEntries(Object.entries({rim:f.up,bottom:f.down,wall:f.north,floor:f.south,...liquid}).map(([role,paths])=>[role,single(paths,'cauldron '+role)]));
 }
 if(record.model==='cocoa') {
  if(record.id!=='cocoa')throw new Error('Unknown cocoa object');
  const paths=record.variants?.up;
  if(!Array.isArray(paths)||paths.length!==3)throw new Error('Incomplete cocoa stages');
  return Object.fromEntries(paths.map((path,i)=>['stage_'+i,single([path],'cocoa stage '+i)]));
 }
 if(record.model==='daylight') {
  if(!['daylight_detector','daylight_detector_inverted'].includes(record.id))throw new Error('Unknown daylight object');
  const paths=record.variants?.up,f=record.faces??{};
  if(!Array.isArray(paths)||paths.length!==2)throw new Error('Incomplete daylight modes');
  return {day:single([paths[0]],'daylight day'),inverted:single([paths[1]],'daylight inverted'),bottom:single(f.down,'daylight bottom'),side:single(f.north,'daylight side')};
 }
 return null;
}
