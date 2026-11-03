/* Conduit resources present in the pinned Bedrock inventory at
   Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d.
   The terrain atlas declares only the inactive base; active geometry is a separate step. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export const CONDUIT_RESOURCES=Object.freeze({base:'textures/blocks/conduit_base',cage:'textures/blocks/conduit_cage',eye_closed:'textures/blocks/conduit_closed',eye_open:'textures/blocks/conduit_open',wind_horizontal:'textures/blocks/conduit_wind_horizontal',wind_vertical:'textures/blocks/conduit_wind_vertical'});
export function attachConduitSource(record,definition,inventory) {
 if(!dictionary(record)||record.id!=='conduit'||record.model!=='conduit'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths)||record.paths.some(path=>typeof path!=='string'))throw new Error('Invalid conduit source input');
 if(own(record,'bindings')||own(record,'conduitParts')||own(record,'source'))throw new Error('Conflicting conduit source');
 const base=CONDUIT_RESOURCES.base,up=record.faces?.up;
 if(!Array.isArray(up)||up.length!==1||up[0]!==base||!record.paths.includes(base))throw new Error('Missing or ambiguous conduit base');
 for(const path of Object.values(CONDUIT_RESOURCES))if(!own(inventory,path))throw new Error('Missing conduit source texture: '+path);
 return {...record,paths:[...new Set([...record.paths,...Object.values(CONDUIT_RESOURCES)])].sort(),bindings:{up:[base]},conduitParts:{...CONDUIT_RESOURCES},source:{kind:'block-entity',template:'conduit',variant:record.id,definition:structuredClone(definition)}};
}
