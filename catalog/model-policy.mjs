/* Explicit presentation policy. Unknown objects never receive a fallback cube. */
const own = (o,k) => Object.hasOwn(o,k);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const CUBES = new Set([
 'stone','cobblestone','bedrock','dirt','sand','gravel','glass','obsidian','netherrack','end_stone','clay','ice','packed_ice','blue_ice','magma',
 'furnace','lit_furnace','blast_furnace','lit_blast_furnace','smoker','lit_smoker','redstone_lamp','lit_redstone_lamp','sea_lantern',
 'amethyst_block','ancient_debris','andesite','azalea_leaves_flowered','bamboo_block','bamboo_mosaic','basalt','blackstone','bone_block','bookshelf','brick_block',
 'brown_mushroom_block','budding_amethyst','calcite','cartography_table','chain_command_block','chiseled_bookshelf','chiseled_cinnabar','chiseled_deepslate',
 'chiseled_nether_bricks','chiseled_polished_blackstone','chiseled_quartz_block','chiseled_red_sandstone','chiseled_resin_bricks','chiseled_sandstone',
 'chiseled_stone_bricks','chiseled_sulfur','chiseled_tuff','chiseled_tuff_bricks','cinnabar','cinnabar_bricks','coal_block','coarse_dirt','cobbled_deepslate',
 'command_block','cracked_deepslate_bricks','cracked_deepslate_tiles','cracked_nether_bricks','cracked_polished_blackstone_bricks','cracked_stone_bricks',
 'crafting_table','creaking_heart','crimson_nylium','crying_obsidian','cut_red_sandstone','cut_sandstone','dark_prismarine','deepslate','deepslate_bricks','deepslate_tiles',
 'diamond_block','diorite','dirt_with_roots','dispenser','dried_kelp_block','dripstone_block','dropper','emerald_block','end_bricks','fletching_table','frosted_ice',
 'gilded_blackstone','glowstone','gold_block','granite','grass_block','hardened_clay','hay_block','honeycomb_block','iron_block','jigsaw','jukebox','lapis_block',
 'lodestone','loom','mangrove_roots','melon_block','mob_spawner','moss_block','mossy_cobblestone','mossy_stone_bricks','mud','mud_bricks','muddy_mangrove_roots',
 'mushroom_stem','mycelium','nether_brick','nether_wart_block','netherite_block','noteblock','observer','ochre_froglight','packed_mud','pale_moss_block',
 'pearlescent_froglight','podzol','polished_andesite','polished_basalt','polished_blackstone','polished_blackstone_bricks','polished_cinnabar','polished_deepslate',
 'polished_diorite','polished_granite','polished_sulfur','polished_tuff','potent_sulfur','powder_snow','prismarine','prismarine_bricks','purpur_block','purpur_pillar',
 'quartz_block','quartz_bricks','quartz_pillar','raw_copper_block','raw_gold_block','raw_iron_block','red_nether_brick','red_sand','red_sandstone','redstone_block',
 'reinforced_deepslate','repeating_command_block','resin_block','resin_bricks','respawn_anchor','sandstone','sculk','shroomlight','slime','smithing_table',
 'smooth_basalt','smooth_quartz','smooth_red_sandstone','smooth_sandstone','smooth_stone','snow','soul_sand','soul_soil','sponge','stone_bricks','structure_block',
 'stripped_bamboo_block','sulfur','sulfur_bricks','target','tinted_glass','tnt','tuff','tuff_bricks','verdant_froglight','warped_nylium','warped_wart_block','wet_sponge'
]);
const CROSS = new Set(['bamboo_sapling','oak_sapling','spruce_sapling','birch_sapling','jungle_sapling','acacia_sapling','dark_oak_sapling','cherry_sapling','pale_oak_sapling','dandelion','poppy','blue_orchid','allium','azure_bluet','red_tulip','orange_tulip','white_tulip','pink_tulip','oxeye_daisy','cornflower','lily_of_the_valley','wither_rose','brown_mushroom','red_mushroom']);
const EXACT = {
 brewing_stand:'brewing',beacon:'beacon',anvil:'anvil',chipped_anvil:'anvil',damaged_anvil:'anvil',
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
 if(/_(planks|wool|concrete|terracotta|ore|log|wood|leaves|stained_glass|concrete_powder)$/.test(id)) return {model:'cube',reason:'material-class'};
 if(/^(?:stripped_)?(?:crimson|warped)_(?:stem|hyphae)$/.test(id)) return {model:'cube',reason:'nether-wood-material'};
 if(/^(?:dead_)?(?:tube|brain|bubble|fire|horn)_coral_block$/.test(id)) return {model:'cube',reason:'coral-solid-material'};
 if(/^(?:(?:exposed|weathered|oxidized)_)?(?:copper|copper_block|cut_copper|chiseled_copper|copper_grate|copper_bulb)$/.test(id)) return {model:'cube',reason:'copper-solid-material'};
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
