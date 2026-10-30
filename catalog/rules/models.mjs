/* Explicit model assignments for special objects. Add new migrated models here; unknown objects stay unresolved instead of becoming cubes. */
export const SPECIAL_MODELS = Object.freeze({
  ladder: 'ladder', lectern: 'lectern', lever: 'lever',
  lilac: 'flower', rose_bush: 'flower', peony: 'flower',
  sunflower: 'sunflower',
  spore_blossom: 'spore_blossom',
  pink_petals: 'flowerbed', wildflowers: 'flowerbed',
  grass_path: 'grass_path', enchanting_table: 'enchanting_table', stonecutter_block: 'stonecutter', sea_pickle: 'sea_pickle',
  wheat: 'crop', carrots: 'crop', potatoes: 'crop', beetroot: 'crop', turtle_egg: 'turtle_egg',
  weeping_vines: 'vines', twisting_vines: 'vines',
  portal: 'portal', end_portal_frame: 'end_portal_frame', trip_wire: 'tripwire', tripwire_hook: 'tripwire_hook'
});
export const SPECIAL_PATTERNS = Object.freeze([
  [/_shelf$/, 'shelf']
].map(pair => Object.freeze(pair)));
