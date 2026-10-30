/* Explicit model assignments for special objects. Add new migrated models here; unknown objects stay unresolved instead of becoming cubes. */
export const SPECIAL_MODELS = Object.freeze({
  ladder: 'ladder', lectern: 'lectern', lever: 'lever',
  lilac: 'flower', rose_bush: 'flower', peony: 'flower'
});
export const SPECIAL_PATTERNS = Object.freeze([
  [/_shelf$/, 'shelf']
].map(pair => Object.freeze(pair)));
