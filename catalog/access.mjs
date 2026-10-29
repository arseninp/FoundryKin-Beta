/* Queries retain the source object, family form and explicit preview state. */
const own = (object, key) => Object.hasOwn(object, key);
function dictionary(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function createCatalogAccess(catalog) {
  if (!catalog || catalog.schema !== 1 || !['records', 'items', 'aliases', 'families', 'resources'].every(key => dictionary(catalog[key]))) throw new Error('Invalid compiled catalog');
  const routes = catalog.stateRoutes ?? {}, groups = catalog.stateGroups ?? {};
  if (!dictionary(routes) || !dictionary(groups)) throw new Error('Invalid state tables');
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
  for (const [id, route] of Object.entries(routes)) {
    if (!dictionary(route) || !own(catalog.records, id) || typeof route.card !== 'string' || !own(catalog.records, route.card) || !dictionary(route.state) || !own(groups, route.card)) throw new Error('Invalid state route: ' + id);
    const group = groups[route.card];
    if (!dictionary(group) || typeof group.parameter !== 'string' || !dictionary(group.variants) || !own(route.state, group.parameter) || Object.keys(route.state).length !== 1 || !own(group.variants, route.state[group.parameter]) || group.variants[route.state[group.parameter]] !== id) throw new Error('State route disagrees with group: ' + id);
  }
  for (const [card, group] of Object.entries(groups)) {
    if (!dictionary(group) || !dictionary(group.variants) || !own(group.variants, group.default) || !Object.values(group.variants).includes(card)) throw new Error('Invalid state group: ' + card);
    for (const id of Object.values(group.variants)) if (!own(routes, id) || routes[id].card !== card) throw new Error('Missing state route: ' + id);
  }
  function describe(id, kind = 'block') {
    if (kind !== 'block' && kind !== 'item') throw new Error('Invalid catalog category');
    if (kind === 'item') return typeof id === 'string' && own(catalog.items, id) ? {kind, id, card: id, form: null} : null;
    const target = canonical(id);
    if (!target) return null;
    const route = own(routes, target) ? routes[target] : null;
    const member = route ? route.card : target, owner = family.get(member);
    const result = {kind, id: target, card: owner?.card ?? member, form: owner?.form ?? 'native'};
    if (route) result.state = {...route.state};
    return result;
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
