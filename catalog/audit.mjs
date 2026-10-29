/* Read-only audit of catalog inputs: where texture alternatives, states and files are lost before compilation. */
const FACES = ['up', 'down', 'north', 'south', 'east', 'west'];
const own = (object, key) => Object.hasOwn(object, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const STATE_PREFIXES = ['lit_', 'unlit_', 'powered_', 'unpowered_', 'active_', 'inactive_'];
export function atlasPaths(entry) {
  const out = [];
  (function walk(value) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (dictionary(value) && own(value, 'path')) walk(value.path);
  })(entry?.textures);
  return [...new Set(out)];
}
export function faceKeys(definition) {
  const t = definition.textures;
  if (t === undefined) return null;
  if (typeof t === 'string') return Object.fromEntries(FACES.map(face => [face, t]));
  if (!dictionary(t)) return null;
  const any = t.side ?? t.up ?? t.down ?? t.north ?? t.south ?? t.east ?? t.west;
  return Object.fromEntries(FACES.map(face => [face, t[face] ?? t.side ?? any]));
}
function carriedKeys(definition) {
  const c = definition.carried_textures;
  if (typeof c === 'string') return [c];
  return dictionary(c) ? Object.values(c).filter(value => typeof value === 'string') : [];
}
export function classifyVariant(path) {
  const name = path.split('/').pop();
  if (/_(?:lit|on|powered|active|triggered|crafting|open|honey|occupied|berries|dormant|blooming|dry|ready|inverted)(?:_|$)|_lit_powered$/.test(name) || /^candle.*_lit$/.test(name)) return 'state';
  if (/stage_?\d|_state_\d|_\d$|_[b-h]$/.test(name)) return 'stage';
  if (/opaque|carried/.test(name)) return 'render';
  if (/^door_|_door_/.test(name)) return 'door';
  return 'other';
}
function keyCounts(keys) {
  const counts = new Map();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}
/* A state pair differs by at most one texture key on each side, whichever face carries it. */
export function comparePair(a, b) {
  const ca = keyCounts(Object.values(a)), cb = keyCounts(Object.values(b));
  const left = [...ca].filter(([key, n]) => n > (cb.get(key) ?? 0)).map(([key]) => key).sort();
  const right = [...cb].filter(([key, n]) => n > (ca.get(key) ?? 0)).map(([key]) => key).sort();
  const same = left.length === 0 && right.length === 0;
  return {verified: left.length <= 1 && right.length <= 1, identical: same, swap: same ? null : [left[0] ?? null, right[0] ?? null]};
}
export function auditCatalog({blocks, terrain, existing = null, flipbook = []}) {
  const atlas = terrain.texture_data, report = {technical: [], unresolved: [], incomplete: []};
  const used = new Set(), reach = new Set(), lost = {}, classOf = new Map(), keyUsers = {}, faces = {};
  for (const id of Object.keys(blocks).sort()) {
    const keys = faceKeys(blocks[id]);
    if (!keys) { report.technical.push({id, reason: 'no-textures'}); continue; }
    if (Object.values(keys).some(key => key === undefined)) { report.incomplete.push(id); continue; }
    faces[id] = keys;
    const all = new Set(Object.values(keys).concat(carriedKeys(blocks[id])));
    const first = new Set(), every = new Set();
    for (const key of all) {
      used.add(key);
      if (!own(atlas, key)) { report.unresolved.push({id, key}); continue; }
      const paths = atlasPaths(atlas[key]);
      paths.forEach(path => reach.add(path));
      if (paths.length) first.add(paths[0]);
      paths.forEach(path => every.add(path));
      if (paths.length > 1) (keyUsers[key] ??= []).push(id);
    }
    const extra = [...every].filter(path => !first.has(path)).sort();
    if (extra.length) { lost[id] = extra; for (const path of extra) classOf.set(path, classifyVariant(path)); }
  }
  const orphanKeys = Object.keys(atlas).filter(key => !used.has(key)).sort();
  const atlasAll = new Set(Object.keys(atlas).flatMap(key => atlasPaths(atlas[key])));
  const orphanPaths = [...atlasAll].filter(path => !reach.has(path)).sort();
  const pairs = [];
  for (const id of Object.keys(faces).sort()) for (const prefix of STATE_PREFIXES) {
    if (!id.startsWith(prefix)) continue;
    const base = id.slice(prefix.length);
    if (own(faces, base)) pairs.push({state: id, base, ...comparePair(faces[base], faces[id])});
  }
  const alternativeClasses = {};
  for (const kind of classOf.values()) alternativeClasses[kind] = (alternativeClasses[kind] ?? 0) + 1;
  const animated = new Set(flipbook.map(row => row.flipbook_texture));
  const animatedBlocks = Object.keys(faces).filter(id => Object.values(faces[id]).some(key => own(atlas, key) && atlasPaths(atlas[key]).some(path => animated.has(path)))).sort();
  const sharedArrays = Object.entries(keyUsers).filter(([, users]) => users.length > 1).map(([key, users]) => ({key, paths: atlasPaths(atlas[key]).length, users: users.slice().sort()})).sort((x, y) => y.users.length - x.users.length || x.key.localeCompare(y.key));
  const missingFiles = existing ? [...reach].filter(path => !own(existing, path)).sort() : null;
  return {
    counts: {blocks: Object.keys(blocks).length, atlasKeys: Object.keys(atlas).length, atlasPaths: atlasAll.size, blocksWithAlternatives: Object.keys(lost).length, alternativePaths: classOf.size},
    technical: report.technical, unresolved: report.unresolved, incomplete: report.incomplete,
    alternatives: lost, alternativeClasses, orphanKeys, orphanPaths, statePairs: pairs, sharedArrayKeys: sharedArrays, animatedBlocks, missingFiles
  };
}
