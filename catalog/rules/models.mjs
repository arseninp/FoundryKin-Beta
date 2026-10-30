/* Explicit model assignments for special objects. Add new migrated models here; unknown objects stay unresolved instead of becoming cubes. */
export const SPECIAL_MODELS = Object.freeze({
  ladder: 'ladder', lectern: 'lectern', lever: 'lever',
  lilac: 'flower', rose_bush: 'flower', peony: 'flower',
  grass_path: 'grass_path', enchanting_table: 'enchanting_table', stonecutter_block: 'stonecutter', sea_pickle: 'sea_pickle'
});
export const SPECIAL_PATTERNS = Object.freeze([
  [/_shelf$/, 'shelf']
].map(pair => Object.freeze(pair)));
