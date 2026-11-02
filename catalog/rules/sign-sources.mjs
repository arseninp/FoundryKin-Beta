/* Owned entity sheets for sign models; native terrain resources and source IDs stay intact. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const SHEETS=Object.freeze({oak:'sign',spruce:'sign_spruce',birch:'sign_birch',jungle:'sign_jungle',acacia:'sign_acacia',dark_oak:'sign_darkoak',crimson:'sign_crimson',warped:'sign_warped',mangrove:'mangrove_sign',cherry:'cherry_sign',bamboo:'bamboo_sign',pale_oak:'pale_oak_sign',poplar:'poplar_sign'});
export function attachSignSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='sign'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid sign source input');
 const match=/^(?:(.+)_)?(standing|wall|hanging)_sign$/.exec(record.id);
 if(!match)throw new Error('Unknown sign source ID: '+record.id);
 const wood=(match[1]??'oak').replace(/^darkoak$/,'dark_oak'),placement=match[2];
 if(!own(SHEETS,wood))throw new Error('Unknown sign wood: '+wood);
 const sheet='textures/entity/'+(placement==='hanging'?wood+'_hanging_sign':SHEETS[wood]);
 if(!own(inventory,sheet))throw new Error('Missing sign source sheet: '+sheet);
 if(own(record,'bindings'))throw new Error('Conflicting sign source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,sheet])].sort(),bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'sign',wood,placement,definition:structuredClone(definition)}};
}
