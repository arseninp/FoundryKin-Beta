/* Pure loading helpers shared by the audit tool and the future catalog build. No network, DOM or storage access. */
const own = (object, key) => Object.hasOwn(object, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function parseLooseJson(text) {
  const clean = String(text).replace(/^\uFEFF/, '');
  try { return JSON.parse(clean); } catch {}
  const stripped = clean.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (all, quoted) => quoted ?? ' ').replace(/("(?:\\.|[^"\\])*")|,(\s*[}\]])/g, (all, quoted, close) => quoted ?? close);
  return JSON.parse(stripped);
}
/* Only these auxiliary definitions are admitted as catalog block sources. */
export function admitAuxiliaryBlocks(blocks, auxiliary = {}) {
  if (!dictionary(blocks) || !dictionary(auxiliary)) throw new Error('Invalid auxiliary block sources');
  const admitted = {...blocks};
  for (const [id, definition] of Object.entries(auxiliary)) {
    if (!['end_gateway', 'lava_cauldron'].includes(id)) throw new Error('Unassigned auxiliary block source: ' + id);
    if (!dictionary(definition)) throw new Error('Invalid auxiliary block definition: ' + id);
    if (own(blocks, id)) throw new Error('Conflicting auxiliary block source: ' + id);
    admitted[id] = structuredClone(definition);
  }
  return admitted;
}
/* Mirrors the pinned chunk layout: blocks, terrain (texture_data), existing and auxiliary sections of manifest files. */
export function assembleChunks(manifest, parts) {
  if (!dictionary(manifest) || manifest.schema !== 1 || !dictionary(manifest.counts) || !Array.isArray(parts)) throw new Error('Unsupported catalog manifest');
  const data = {blocks: {}, terrain: {texture_data: {}}, existing: {}, auxiliary: {}, source: manifest.source};
  for (const part of parts) {
    const section = String(part.name).split('-')[0];
    const target = section === 'terrain' ? data.terrain.texture_data : own(data, section) && section !== 'source' ? data[section] : null;
    if (!target) continue;
    if (!dictionary(part.value)) throw new Error('Invalid catalog section: ' + part.name);
    for (const [key, value] of Object.entries(part.value)) {
      if (own(target, key)) throw new Error('Duplicate catalog key: ' + key);
      target[key] = value;
    }
  }
  const counts = {blocks: Object.keys(data.blocks).length, terrain: Object.keys(data.terrain.texture_data).length, existing: Object.keys(data.existing).length};
  for (const name of Object.keys(counts)) if (counts[name] !== manifest.counts[name]) throw new Error('Catalog count mismatch: ' + name);
  data.blocks = admitAuxiliaryBlocks(data.blocks, data.auxiliary);
  return data;
}
/* Unpacked Mojang files: blocks.json, terrain_texture.json and optionally flipbook_textures.json. */
export function fromRawFiles({blocks, terrain, flipbook}) {
  if (!dictionary(blocks) || !dictionary(terrain) || !dictionary(terrain.texture_data)) throw new Error('Invalid raw resource files');
  const entries = Object.fromEntries(Object.entries(blocks).filter(([, value]) => dictionary(value)));
  return {blocks: entries, terrain, existing: null, flipbook: Array.isArray(flipbook) ? flipbook : []};
}
