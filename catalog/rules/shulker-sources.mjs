/* Owned shulker-box sheets; native PNGs, source IDs and icons remain intact. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const COLORS=new Set(['undyed','white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','silver','cyan','purple','blue','brown','green','red','black']);
export function attachShulkerSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='shulker_box'||typeof record.id!=='string'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid shulker source input');
 const match=/^([a-z_]+)_shulker_box$/.exec(record.id),color=match?.[1];
 if(!COLORS.has(color))throw new Error('Unknown shulker source ID: '+record.id);
 const sheet='textures/entity/shulker/shulker_'+(color==='light_gray'?'silver':color);
 if(!own(inventory,sheet))throw new Error('Missing shulker source sheet: '+sheet);
 if(own(record,'bindings'))throw new Error('Conflicting shulker source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,sheet])].sort(),bindings:{sheet:[sheet]},source:{kind:'block-entity',template:'shulker_box',color,definition:structuredClone(definition)}};
}
