/* Resource normalization shared by catalog compilation and validation. */
const own = (value, key) => Object.hasOwn(value, key);
const faces = ['up', 'down', 'north', 'south', 'east', 'west'];
export function resourcePaths(value) {
  if (typeof value === 'string') {
    if (!/^textures\/[A-Za-z0-9_./-]+$/.test(value) || value.split('/').some(p => p === '..' || p === '.' || !p)) throw new Error('Invalid resource path: ' + value);
    return [value];
  }
  if (Array.isArray(value)) return [...new Set(value.flatMap(resourcePaths))];
  if (value && typeof value === 'object' && own(value, 'path')) return resourcePaths(value.path);
  throw new Error('Unsupported texture resource');
}
export function resolveTexture(key, atlas) {
  if (typeof key !== 'string' || !own(atlas, key)) throw new Error('Unresolved texture key: ' + key);
  return resourcePaths(atlas[key].textures);
}
function resolveFaces(value, atlas) {
  if (typeof value === 'string') return Object.fromEntries(faces.map(face => [face, resolveTexture(value, atlas)]));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid block texture definition');
  return Object.fromEntries(faces.map(face => {
    const key = value[face] ?? value.side;
    if (key === undefined) throw new Error('Missing block face: ' + face);
    return [face, resolveTexture(key, atlas)];
  }));
}
export function normalizeBlock(id, definition, atlas, options = {}) {
  if (!/^[a-z0-9_]+$/.test(id)) throw new Error('Invalid block id: ' + id);
  const modelFaces = resolveFaces(definition.textures, atlas);
  const carriedFaces = definition.carried_textures === undefined ? null : resolveFaces(definition.carried_textures, atlas);
  const icons = [...new Set((options.icons ?? []).flatMap(resourcePaths))].sort();
  const paths = [...new Set([...Object.values(modelFaces).flat(), ...Object.values(carriedFaces ?? {}).flat(), ...icons])].sort();
  if (options.existing) for (const path of paths) if (!own(options.existing, path)) throw new Error('Missing resource file: ' + path);
  return {id, model: options.model ?? null, states: options.states ?? null, faces: modelFaces, carried: carriedFaces, icons, paths};
}
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  return value;
}
export function resourceSignature(record) {
  if (!record.model) throw new Error('Model identity is required for deduplication');
  return JSON.stringify(ordered({model: record.model, states: record.states, faces: record.faces, carried: record.carried, icons: record.icons}));
}
