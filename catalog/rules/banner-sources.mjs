/* Explicit banner resources from the pinned Bedrock inventory. Composition is a separate stage. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const DIR='textures/entity/banner/',BASE=DIR+'banner_base';
export const BANNER_PATTERNS=Object.freeze(['square_bottom_left','square_bottom_right','square_top_left','square_top_right','stripe_bottom','stripe_top','stripe_left','stripe_right','stripe_center','stripe_middle','stripe_downright','stripe_downleft','small_stripes','cross','straight_cross','triangle_bottom','triangle_top','triangles_bottom','triangles_top','diagonal_left','diagonal_up_right','diagonal_up_left','diagonal_right','circle','rhombus','half_vertical','half_horizontal','half_vertical_right','half_horizontal_bottom','border','curly_border','gradient','gradient_up','bricks','globe','creeper','skull','flower','mojang','piglin','flow','guster']);
export function attachBannerSource(record,definition,inventory) {
 if(!dictionary(record)||record.model!=='banner'||!['standing_banner','wall_banner'].includes(record.id)||!dictionary(definition)||!dictionary(inventory)||!Array.isArray(record.paths))throw new Error('Invalid banner source input');
 const patterns=Object.fromEntries(BANNER_PATTERNS.map(name=>[name,DIR+'banner_'+name]));
 const special={legacy:DIR+'banner',illager:DIR+'banner_illager',pattern_illager:DIR+'banner_pattern_illager'};
 const paths=[BASE,...Object.values(patterns),...Object.values(special)];
 for(const path of paths)if(!own(inventory,path))throw new Error('Missing banner source resource: '+path);
 if(own(record,'bindings'))throw new Error('Conflicting banner source bindings: '+record.id);
 return {...record,paths:[...new Set([...record.paths,...paths])].sort(),bindings:{sheet:[BASE]},source:{kind:'block-entity',template:'banner',base:BASE,patterns,special,definition:structuredClone(definition)}};
}
