/* Queries for compiled catalogs. Never guess an object from the first shared PNG. */
const own = (object, key) => Object.hasOwn(object, key);
function dictionary(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function createCatalogAccess(catalog) {
  if (!catalog || catalog.schema !== 1 || !['records', 'items', 'aliases', 'families', 'resources'].every(key => dictionary(catalog[key]))) throw new Error('Invalid compiled catalog');
  const family = new Map();
  for (const [base, forms] of Object.entries(catalog.families)) {
    if (!dictionary(forms) || forms.native !== base) throw new Error('Invalid family: ' + base);
    for (const [form, id] of Object.entries(forms)) {
      if (!own(catalog.records, id) || family.has(id)) throw new Error('Invalid family member: ' + id);
      family.set(id, {card: base, form});
    }
  }
  function canonical(id) {
    if (typeof id !== 'string') return null;
    const seen = new Set();
    while (own(catalog.aliases, id)) {
      if (seen.has(id)) throw new Error('Alias cycle: ' + id);
      seen.add(id);id = catalog.aliases[id];
      if (typeof id !== 'string') throw new Error('Invalid alias target');
    }
    return own(catalog.records, id) ? id : null;
  }
  for (const id of Object.keys(catalog.aliases)) if (!canonical(id)) throw new Error('Missing alias target: ' + id);
  function describe(id, kind = 'block') {
    if (kind !== 'block' && kind !== 'item') throw new Error('Invalid catalog category');
    if (kind === 'item') return typeof id === 'string' && own(catalog.items, id) ? {kind, id, card: id, form: null} : null;
    const target = canonical(id);
    if (!target) return null;
    const owner = family.get(target);
    return {kind, id: target, card: owner?.card ?? target, form: owner?.form ?? 'native'};
  }
  function locate(path, options = {}) {
    const kind = options.kind ?? 'block';
    if (kind !== 'block' && kind !== 'item') throw new Error('Invalid catalog category');
    if (typeof path !== 'string' || !path.startsWith('textures/')) throw new Error('Expected full catalog resource path');
    const rows = own(catalog.resources, path) ? catalog.resources[path] : [];
    if (!Array.isArray(rows)) throw new Error('Invalid reverse resource index');
    const found = new Map();
    for (const row of rows) {
      if (row.kind !== kind) continue;
      const object = describe(row.id, kind);
      if (!object) throw new Error('Resource owner is missing: ' + row.id);
      const record = kind === 'block' ? catalog.records[object.id] : catalog.items[object.id];
      if (!Array.isArray(record.paths) || !record.paths.includes(path)) throw new Error('Resource index disagrees with owner: ' + row.id);
      found.set(object.id, object);
    }
    const candidates = [...found.values()].sort((a, b) => a.id.localeCompare(b.id));
    const preferred = options.preferredId === undefined ? null : describe(options.preferredId, kind);
    if (preferred) {
      const exact = found.get(preferred.id);
      if (exact) return {status: 'found', object: exact};
      const relatives = candidates.filter(row => row.card === preferred.card);
      if (relatives.length === 1) return {status: 'found', object: relatives[0]};
      return {status: relatives.length ? 'ambiguous' : 'mismatch', candidates: relatives.length ? relatives : candidates};
    }
    if (candidates.length === 1) return {status: 'found', object: candidates[0]};
    return {status: candidates.length ? 'ambiguous' : 'missing', candidates};
  }
  return Object.freeze({describe, locate});
}
