/* Heads edit their entity sheets and declared icons; raw block definitions remain provenance only. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const SHEETS=Object.freeze({skeleton_skull:'textures/entity/skeleton/skeleton',wither_skeleton_skull:'textures/entity/skeleton/wither_skeleton',creeper_head:'textures/entity/creeper/creeper',zombie_head:'textures/entity/zombie/zombie',piglin_head:'textures/entity/piglin/piglin',dragon_head:'textures/entity/dragon/dragon',player_head:'textures/entity/steve'});
export function attachSkullSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='skull'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid skull source input');
 if(!own(SHEETS,record.id))throw new Error('Unknown skull source ID: '+record.id);
 const sheet=SHEETS[record.id];
 if(!own(inventory,sheet))throw new Error('Missing skull source sheet: '+sheet);
 if(own(record,'bindings'))throw new Error('Conflicting skull source bindings: '+record.id);
 return {...record,faces:{},variants:{},carried:null,carriedVariants:null,paths:[...new Set([sheet,...(record.icons??[])])].sort(),bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'skull',variant:record.id,definition:structuredClone(definition)}};
}
