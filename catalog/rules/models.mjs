/* Explicit model assignments for special objects. Add new migrated models here; unknown objects stay unresolved instead of becoming cubes. */
export const SPECIAL_MODELS = Object.freeze({
  ladder: 'ladder', lectern: 'lectern', lever: 'lever',
  hopper: 'hopper', grindstone: 'grindstone', frame: 'frame', glow_frame: 'frame',
  cauldron: 'cauldron', cocoa: 'cocoa', daylight_detector: 'daylight', daylight_detector_inverted: 'daylight',
  flower_pot: 'flower_pot', decorated_pot: 'decorated_pot', conduit: 'conduit',
  fire: 'fire', soul_fire: 'fire',
  big_dripleaf: 'big_dripleaf', small_dripleaf_block: 'small_dripleaf',
  lilac: 'flower', rose_bush: 'flower', peony: 'flower',
  sunflower: 'sunflower',
  spore_blossom: 'spore_blossom',
  pink_petals: 'flowerbed', wildflowers: 'flowerbed',
  golden_dandelion: 'cross', torchflower: 'cross', poplar_sapling: 'cross', deadbush: 'cross',
  short_dry_grass: 'cross', tall_dry_grass: 'cross', crimson_fungus: 'cross', warped_fungus: 'cross',
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
  [/_shelf$/, 'shelf'],
  [/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?copper_bars$/, 'bars'],
  [/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?lightning_rod$/, 'lightning_rod']
].map(pair => Object.freeze(pair)));
