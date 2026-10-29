/* Conservative presentation policy. Unknown objects remain unresolved; there is no default cube. */
const own = (o,k) => Object.hasOwn(o,k);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const CUBES = new Set(['stone','cobblestone','bedrock','dirt','sand','gravel','glass','obsidian','netherrack','end_stone','clay','ice','packed_ice','blue_ice','magma','furnace','lit_furnace','blast_furnace','lit_blast_furnace','smoker','lit_smoker','redstone_lamp','lit_redstone_lamp','sea_lantern']);
const CROSS = new Set(['bamboo_sapling','oak_sapling','spruce_sapling','birch_sapling','jungle_sapling','acacia_sapling','dark_oak_sapling','cherry_sapling','pale_oak_sapling','dandelion','poppy','blue_orchid','allium','azure_bluet','red_tulip','orange_tulip','white_tulip','pink_tulip','oxeye_daisy','cornflower','lily_of_the_valley','wither_rose','brown_mushroom','red_mushroom']);
const EXACT = {
 brewing_stand:'brewing',
 pale_hanging_moss:'pale_hanging_moss',sulfur_spike:'sulfur_spike',bamboo:'bamboo',azalea:'azalea',flowering_azalea:'azalea',
 bamboo_fence:'bamboo_fence',bamboo_fence_gate:'bamboo_gate',pale_moss_carpet:'pale_moss_carpet',
 redstone_torch:'redstone_torch',unlit_redstone_torch:'redstone_torch',piston:'piston',sticky_piston:'piston',
 unpowered_repeater:'repeater',powered_repeater:'repeater',unpowered_comparator:'comparator',powered_comparator:'comparator',
 campfire:'campfire',soul_campfire:'campfire',torch:'torch',soul_torch:'torch',copper_torch:'torch',
 pumpkin:'pumpkin',carved_pumpkin:'pumpkin',lit_pumpkin:'pumpkin',amethyst_cluster:'amethyst',small_amethyst_bud:'amethyst',medium_amethyst_bud:'amethyst',large_amethyst_bud:'amethyst',
 vine:'decal',glow_lichen:'decal',sculk_vein:'decal',resin_clump:'decal',waterlily:'rail',leaf_litter:'rail',frog_spawn:'rail',
 end_portal:'sprite',end_gateway:'sprite',cake:'cake',trapdoor:'trapdoor'
};
function classify(id) {
 if (own(EXACT,id)) return {model:EXACT[id],reason:'explicit-model'};
 if (CUBES.has(id)) return {model:'cube',reason:'explicit-cube'};
 if (CROSS.has(id)) return {model:'cross',reason:'explicit-cross'};
 if (/(^|_)lantern$/.test(id)) return {model:'lantern',reason:'lantern-family'};
 if (/(^|_)chain$/.test(id)) return {model:'chain',reason:'chain-family'};
 if (/_door$/.test(id)) return {model:'door',reason:'door-family'};
 if (/(^|_)candle$/.test(id)) return {model:'candle',reason:'candle-family'};
 if (/^(?:.+_)?(?:standing|wall|hanging)_sign$/.test(id)) return {model:'sign',reason:'sign-family'};
 if (/_bed$/.test(id)) return {model:'bed',reason:'bed-family'};
 if (/(^|_)double_/.test(id)&&/_slab$/.test(id)) return {model:'cube',reason:'double-slab'};
 const form=/_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane|carpet|trapdoor)$/.exec(id);
 if(form) return {model:({fence_gate:'gate',pressure_plate:'plate'})[form[1]]??form[1],reason:'form-suffix'};
 if(/_(planks|wool|concrete|terracotta|ore|log|wood)$/.test(id)) return {model:'cube',reason:'material-class'};
 return null;
}
export function planModelAssignments(blocks, overrides={}) {
 if(!dictionary(blocks)||!dictionary(overrides))throw new Error('Invalid model policy input');
 for(const id of Object.keys(overrides))if(!own(blocks,id))throw new Error('Unknown model override owner: '+id);
 const assignments=Object.create(null),decisions=[],unresolved=[];
 for(const id of Object.keys(blocks).sort()) {
  const base=id.replace(/^waxed_/,'').replace(/^infested_/,'');
  const rule=classify(id)??(base!==id?classify(base==='copper'?'copper_block':base):null);
  if(own(overrides,id)) {
   const value=overrides[id];
   if(!dictionary(value)||typeof value.model!=='string'||!/^[a-z][a-z0-9_-]*$/.test(value.model))throw new Error('Invalid model override: '+id);
   assignments[id]=structuredClone(value);decisions.push({id,model:value.model,reason:'explicit-override'});
  } else if(rule) {assignments[id]={model:rule.model};decisions.push({id,...rule});}
  else unresolved.push(id);
 }
 return {assignments,decisions,unresolved};
}
