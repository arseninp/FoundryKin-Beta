/* Pure loading helpers shared by the audit tool and the future catalog build. No network, DOM or storage access. */
const own = (object, key) => Object.hasOwn(object, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function parseLooseJson(text) {
  const clean = String(text).replace(/^\uFEFF/, '');
  try { return JSON.parse(clean); } catch {}
  const stripped = clean.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (all, quoted) => quoted ?? '').replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(stripped);
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
  return data;
}
/* Unpacked Mojang files: blocks.json, terrain_texture.json and optionally flipbook_textures.json. */
export function fromRawFiles({blocks, terrain, flipbook}) {
  if (!dictionary(blocks) || !dictionary(terrain) || !dictionary(terrain.texture_data)) throw new Error('Invalid raw resource files');
  const entries = Object.fromEntries(Object.entries(blocks).filter(([, value]) => dictionary(value)));
  return {blocks: entries, terrain, existing: null, flipbook: Array.isArray(flipbook) ? flipbook : []};
}
