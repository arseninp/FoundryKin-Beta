/* Explicit model assignments for special objects. Add new models here; unlisted objects stay unresolved rather than becoming cubes. */
export const SPECIAL_MODELS = Object.freeze({
  fence_gate: 'gate',
  ladder: 'ladder', lectern: 'lectern', lever: 'lever',
  hopper: 'hopper', grindstone: 'grindstone', frame: 'frame', glow_frame: 'frame',
  cauldron: 'cauldron', cocoa: 'cocoa', daylight_detector: 'daylight', daylight_detector_inverted: 'daylight',
  flower_pot: 'flower_pot', decorated_pot: 'decorated_pot', conduit: 'conduit',
  fire: 'fire', soul_fire: 'fire',
  big_dripleaf: 'big_dripleaf', small_dripleaf_block: 'small_dripleaf',
  sculk_sensor: 'sculk_sensor', calibrated_sculk_sensor: 'sculk_sensor', sculk_shrieker: 'sculk_shrieker', sculk_catalyst: 'sculk_catalyst', cactus: 'cactus',
  pointed_dripstone: 'pointed_dripstone', dried_ghast: 'dried_ghast', barrel: 'barrel',
  lilac: 'flower', rose_bush: 'flower', peony: 'flower',
  tall_grass: 'flower', large_fern: 'flower',
  nether_wart: 'stage_cross', torchflower_crop: 'stage_cross', sweet_berry_bush: 'stage_cross',
  bush: 'cross', cactus_flower: 'cross',
  sunflower: 'sunflower',
  spore_blossom: 'spore_blossom',
  pink_petals: 'flowerbed', wildflowers: 'flowerbed',
  golden_dandelion: 'cross', torchflower: 'cross', poplar_sapling: 'cross', deadbush: 'cross',
  short_dry_grass: 'cross', tall_dry_grass: 'cross', crimson_fungus: 'cross', warped_fungus: 'cross',
  fern: 'cross', short_grass: 'cross', reeds: 'cross', nether_sprouts: 'cross', hanging_roots: 'cross', web: 'cross',
  tube_coral: 'cross', brain_coral: 'cross', bubble_coral: 'cross', fire_coral: 'cross', horn_coral: 'cross',
  dead_tube_coral: 'cross', dead_brain_coral: 'cross', dead_bubble_coral: 'cross', dead_fire_coral: 'cross', dead_horn_coral: 'cross',
  iron_bars: 'bars', end_rod: 'end_rod', heavy_core: 'heavy_core',
  grass_path: 'grass_path', enchanting_table: 'enchanting_table', stonecutter_block: 'stonecutter', sea_pickle: 'sea_pickle',
  wheat: 'crop', carrots: 'crop', potatoes: 'crop', beetroot: 'crop', turtle_egg: 'turtle_egg',
  sniffer_egg: 'sniffer_egg',
  pitcher_crop: 'pitcher', pitcher_plant: 'pitcher',
  redstone_wire: 'redstone_wire',
  rail: 'track', golden_rail: 'track', detector_rail: 'track', activator_rail: 'track',
  weeping_vines: 'vines', twisting_vines: 'vines',
  portal: 'portal', end_portal_frame: 'end_portal_frame', trip_wire: 'tripwire', tripwire_hook: 'tripwire_hook'
});
export const SPECIAL_PATTERNS = Object.freeze([
  [/^(?:dead_)?(?:tube|brain|bubble|fire|horn)_coral_(?:wall_)?fan$/, 'cross'],
  [/_shelf$/, 'shelf'],
  [/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?copper_bars$/, 'bars'],
  [/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?lightning_rod$/, 'lightning_rod']
].map(pair => Object.freeze(pair)));
