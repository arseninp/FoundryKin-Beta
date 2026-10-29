/* State groups preserve distinct records and every resource. Prefixes alone never authorize a merge. */
const own = (o, k) => Object.hasOwn(o, k);
const KEY = /^[a-z][a-z0-9_]*$/;
export const POWER_GROUPS = Object.freeze([
  ['furnace', 'lit_furnace'], ['blast_furnace', 'lit_blast_furnace'],
  ['smoker', 'lit_smoker'], ['redstone_lamp', 'lit_redstone_lamp'],
  ['unlit_redstone_torch', 'redstone_torch'],
  ['unpowered_repeater', 'powered_repeater'], ['unpowered_comparator', 'powered_comparator']
].map(pair => Object.freeze(pair)));
export function powerRules(records) {
  return POWER_GROUPS.filter(pair => pair.every(id => own(records, id))).map(([off, on]) => ({
    card: off === 'unlit_redstone_torch' ? on : off,
    parameter: 'powered', default: 'off', variants: {off, on}
  }));
}
export function compileStateGroups(records, rules) {
  if (!Array.isArray(rules)) throw new Error('State rules must be an array');
  const groups = Object.create(null), routes = Object.create(null), claimed = new Set();
  for (const rule of rules) {
    if (!rule || typeof rule.card !== 'string' || typeof rule.parameter !== 'string' || !KEY.test(rule.parameter) || !rule.variants || Array.isArray(rule.variants)) throw new Error('Invalid state rule');
    const entries = Object.entries(rule.variants);
    if (entries.length < 2 || !own(rule.variants, rule.default)) throw new Error('Invalid state default');
    if (own(groups, rule.card) || !entries.some(([, id]) => id === rule.card)) throw new Error('Invalid state card: ' + rule.card);
    const first = records[rule.card];
    if (!first || typeof first.model !== 'string' || !first.model) throw new Error('Missing state model: ' + rule.card);
    const paths = new Set(), variants = Object.create(null);
    for (const [value, id] of entries) {
      if (!KEY.test(value) || typeof id !== 'string' || !own(records, id) || claimed.has(id)) throw new Error('Invalid or repeated state member: ' + id);
      const record = records[id];
      if (record.model !== first.model) throw new Error('State model mismatch: ' + id);
      if (!Array.isArray(record.paths) || !record.paths.length || record.paths.some(p => typeof p !== 'string')) throw new Error('Invalid state resources: ' + id);
      claimed.add(id);record.paths.forEach(path => paths.add(path));
      variants[value] = id;
      routes[id] = {card: rule.card, state: {[rule.parameter]: value}};
    }
    groups[rule.card] = {parameter: rule.parameter, default: rule.default, variants, paths: [...paths].sort()};
  }
  return {groups, routes, cards: Object.keys(records).filter(id => !claimed.has(id) || own(groups, id)).sort()};
}
