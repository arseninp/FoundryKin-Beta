/* Named resources for utility models, independent of edited slots. */
export function utilityBindings(record) {
 const single=(paths,label)=>{
  if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0]))throw new Error('Missing or ambiguous '+label);
  return [...paths];
 };
 const named=(paths,name)=>single([...new Set(paths??[])].filter(path=>typeof path==='string'&&path.split('/').pop()===name),name);
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
  if(record.id!=='cauldron')throw new Error('Unknown cauldron object');
  const f=record.faces??{};
  return Object.fromEntries(Object.entries({rim:f.up,bottom:f.down,wall:f.north,floor:f.south,water:f.east,colored_water:f.west}).map(([role,paths])=>[role,single(paths,'cauldron '+role)]));
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
