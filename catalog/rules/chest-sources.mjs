/* Owned single-chest sheets; source IDs, terrain resources and icons remain intact. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const SHEETS=Object.freeze({chest:'normal',trapped_chest:'trapped',ender_chest:'ender',...Object.fromEntries(['default','exposed','weathered','oxidized'].flatMap(stage=>{
 const id=(stage==='default'?'':stage+'_')+'copper_chest',sheet='copper_'+stage;
 return [[id,sheet],['waxed_'+id,sheet]];
}))});
export function attachChestSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='chest'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid chest source input');
 if(!own(SHEETS,record.id))throw new Error('Unknown chest source ID: '+record.id);
 const sheet='textures/entity/chest/'+SHEETS[record.id];
 if(!own(inventory,sheet))throw new Error('Missing chest source sheet: '+sheet);
 if(own(record,'bindings'))throw new Error('Conflicting chest source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,sheet])].sort(),bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'chest',variant:record.id,definition:structuredClone(definition)}};
}
