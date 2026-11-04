/* Bell entity sheet and owned support resources; native PNGs, icons and carried paths remain intact. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function attachBellSource(record,definition,inventory) {
 if(!dictionary(record)||record.id!=='bell'||record.model!=='bell'||!Array.isArray(record.paths)||!dictionary(definition)||!dictionary(inventory))throw new Error('Invalid bell source input');
 if(own(record,'bindings'))throw new Error('Conflicting bell source bindings');
 const sheet='textures/entity/bell/bell',supports={beam:record.faces?.east,posts:record.faces?.west};
 if(!own(inventory,sheet))throw new Error('Missing bell source sheet: '+sheet);
 for(const [role,paths] of Object.entries(supports))if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!record.paths.includes(paths[0])||!own(inventory,paths[0]))throw new Error('Missing or unowned bell support: '+role);
 return {...record,paths:[...new Set([...record.paths,sheet])].sort(),bindings:{sheet:[sheet],beam:[supports.beam[0]],posts:[supports.posts[0]]},source:{kind:'block-entity',template:'bell',definition:structuredClone(definition)}};
}
