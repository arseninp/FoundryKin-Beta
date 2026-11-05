/* Exact owned resource roles for the pinned aquatic definitions. */
const SPECS=Object.freeze({
 kelp:{body_a:['north','kelp_a'],body_b:['south','kelp_b'],body_c:['up','kelp_c'],body_d:['down','kelp_d'],head:['east','kelp_top'],head_bulb:['west','kelp_top_bulb']},
 seagrass:{short:['up','seagrass'],lower_a:['down','seagrass_doubletall_bottom_a'],upper_a:['north','seagrass_doubletall_top_a'],lower_b:['south','seagrass_doubletall_bottom_b'],upper_b:['west','seagrass_doubletall_top_b']}
});
function bubbleBindings(record) {
 if(record.id!=='bubble_column')throw new Error('Unknown bubble column object');
 const result={};
 for(const [part,face,count] of [['up_top','up',4],['down_top','down',4],['outer','north',8],['inner','south',2]]) {
  const paths=record.variants?.[face];
  if(!Array.isArray(paths)||paths.length!==count)throw new Error('Incomplete bubble column variants: '+part);
  for(let index=0;index<count;index++) {
   const suffix=String.fromCharCode(97+index),path=paths[index];
   if(typeof path!=='string'||path!=='textures/blocks/bubble_column_'+part+'_'+suffix||!record.paths.includes(path))throw new Error('Invalid or unowned bubble column resource: '+part+'_'+suffix);
   result[part+'_'+suffix]=[path];
  }
 }
 return result;
}
export function aquaticBindings(record) {
 if(record.model==='bubble_column')return bubbleBindings(record);
 if(!Object.hasOwn(SPECS,record.model))return null;
 if(record.id!==record.model)throw new Error('Unknown aquatic plant object');
 const result={};
 for(const [role,[face,name]] of Object.entries(SPECS[record.model])) {
  const paths=record.faces?.[face];
  if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0])||paths[0].split('/').pop()!==name)throw new Error('Missing or ambiguous aquatic plant role: '+role);
  result[role]=[paths[0]];
 }
 return result;
}
