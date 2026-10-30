/* Named resources for utility models, independent of edited slots. */
export function utilityBindings(record) {
 const single=(paths,label)=>{
  if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0]))throw new Error('Missing or ambiguous '+label);
  return [...paths];
 };
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
