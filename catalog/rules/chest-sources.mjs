/* Owned single/double chest sheets; source IDs, terrain resources and icons remain intact. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const SHEETS=Object.freeze({chest:'normal',trapped_chest:'trapped',ender_chest:'ender',...Object.fromEntries(['default','exposed','weathered','oxidized'].flatMap(stage=>{
 const id=(stage==='default'?'':stage+'_')+'copper_chest',sheet='copper_'+stage;
 return [[id,sheet],['waxed_'+id,sheet]];
}))});
export function attachChestSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='chest'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid chest source input');
 if(!own(SHEETS,record.id))throw new Error('Unknown chest source ID: '+record.id);
 const name=SHEETS[record.id],sheet='textures/entity/chest/'+name,bindings={sheet:[sheet]};
 if(record.id!=='ender_chest')bindings.double_sheet=['textures/entity/chest/'+(name==='normal'?'double_normal':name+'_double')];
 const paths=Object.values(bindings).flat();
 for(const path of paths)if(!own(inventory,path))throw new Error('Missing chest source sheet: '+path);
 if(own(record,'bindings'))throw new Error('Conflicting chest source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,...paths])].sort(),bindings,source:{kind:'block-entity',template:'chest',variant:record.id,definition:structuredClone(definition)}};
}
