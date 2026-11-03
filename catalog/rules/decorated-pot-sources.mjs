/* Bedrock decorated pot textures from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d
   resource_pack/entity/decorated_pot.entity.json. Patterns are complete side textures, not sherd item icons. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const NAMES=Object.freeze(['angler','archer','arms_up','blade','brewer','burn','danger','explorer','friend','heart','heartbreak','howl','miner','mourner','plenty','prize','sheaf','shelter','skull','snort','flow','guster','scrape']);
export const DECORATED_POT_TEXTURES=Object.freeze({brick:'textures/blocks/decorated_pot_side',...Object.fromEntries(NAMES.map(name=>[name+'_pottery_sherd','textures/blocks/'+name+'_pottery_pattern']))});
const BASE='textures/blocks/decorated_pot_base';
export function attachDecoratedPotSource(record,definition,inventory) {
 if(!dictionary(record)||record.id!=='decorated_pot'||record.model!=='decorated_pot'||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths)||record.paths.some(path=>typeof path!=='string'))throw new Error('Invalid decorated pot source input');
 if(own(record,'potteryPatterns')||own(record,'source'))throw new Error('Conflicting decorated pot source');
 const bindings=record.bindings;
 if(!dictionary(bindings)||Object.keys(bindings).length!==2||!Array.isArray(bindings.base)||bindings.base.length!==1||bindings.base[0]!==BASE||!Array.isArray(bindings.side)||bindings.side.length!==1||bindings.side[0]!==DECORATED_POT_TEXTURES.brick)throw new Error('Invalid decorated pot base bindings');
 for(const path of [BASE,DECORATED_POT_TEXTURES.brick])if(!record.paths.includes(path))throw new Error('Missing decorated pot owned resource: '+path);
 for(const path of [BASE,...Object.values(DECORATED_POT_TEXTURES)])if(!own(inventory,path))throw new Error('Missing decorated pot source texture: '+path);
 return {...record,paths:[...new Set([...record.paths,...Object.values(DECORATED_POT_TEXTURES)])].sort(),potteryPatterns:{...DECORATED_POT_TEXTURES},source:{kind:'block-entity',template:'decorated_pot',variant:record.id,definition:structuredClone(definition)}};
}
