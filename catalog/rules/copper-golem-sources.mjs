/* Statue base sheets reuse pinned entity resources; no copied PNG or entity-only layers. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function attachCopperGolemSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='copper_golem_statue'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid copper golem statue source input');
 const match=/^(waxed_)?(?:(exposed|weathered|oxidized)_)?copper_golem_statue$/.exec(record.id);
 if(!match)throw new Error('Unknown copper golem statue source ID: '+record.id);
 const oxidation=match[2]??'unoxidized',sheet='textures/entity/copper_golem/copper_golem'+(oxidation==='unoxidized'?'':'_'+oxidation);
 if(!own(inventory,sheet))throw new Error('Missing copper golem statue source sheet: '+sheet);
 if(own(record,'bindings'))throw new Error('Conflicting copper golem statue source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,sheet])].sort(),bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'copper_golem_statue',oxidation,waxed:Boolean(match[1]),definition:structuredClone(definition)}};
}
