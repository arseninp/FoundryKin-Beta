/* Pure catalog assembly. No DOM, network, storage, or model registration side effects. */
import {normalizeBlock} from './resources.mjs';
import {compileAliases} from './identity.mjs';
import {indexItems, resolveIcons} from './items.mjs';
import {blockIconLinks} from './rules/icons.mjs';
import {duplicateRules} from './rules/duplicates.mjs';
import {powerRules, compileStateGroups} from './states.mjs';
const own = (object, key) => Object.hasOwn(object, key);
function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid ' + label);
  return value;
}
export function compileCatalog(input) {
  const blocks = object(input.blocks, 'blocks');
  const terrain = object(input.terrain, 'terrain atlas');
  const inventory = object(input.existing, 'resource inventory');
  const models = object(input.models, 'model assignments');
  const atlas = object(input.items ?? {}, 'item atlas');
  const explicitLinks = object(input.icons ?? {}, 'icon links');
  const defaults = input.items === undefined ? {} : blockIconLinks(blocks, atlas);
  const links = Object.fromEntries([...Object.entries(defaults), ...Object.entries(explicitLinks)]);
  const rules = duplicateRules(blocks, object(input.aliases ?? {}, 'duplicate rules'));
  const items = indexItems(atlas, inventory);
  for (const id of Object.keys(links)) if (!own(blocks, id)) throw new Error('Icon owner is missing: ' + id);
  const records = Object.fromEntries(Object.keys(blocks).sort().map(id => {
    const assignment = models[id];
    if (!own(models, id) || !assignment || typeof assignment.model !== 'string' || !assignment.model.trim()) throw new Error('Missing model assignment: ' + id);
    const iconOwner = own(rules, id) ? rules[id].target : id;
    const references = links[id] ?? links[iconOwner] ?? [];
    const icons = resolveIcons(items, references);
    return [id, normalizeBlock(id, blocks[id], terrain, {model: assignment.model, states: assignment.states, icons, existing: inventory})];
  }));
  const identity = compileAliases(records, rules);
  const stateRecords = Object.fromEntries(identity.visible.map(id => [id, records[id]]));
  const states = compileStateGroups(stateRecords, powerRules(stateRecords));
  const families = Object.create(null), owners = new Map();
  const canonical = id => {
    const target = own(identity.aliases, id) ? identity.aliases[id] : id;
    return own(states.routes, target) ? states.routes[target].card : target;
  };
  for (const [sourceBase, forms] of Object.entries(input.families ?? {})) {
    object(forms, 'family forms');
    if (!own(records, sourceBase)) throw new Error('Invalid family base: ' + sourceBase);
    const base = canonical(sourceBase);
    const entries = families[base] ?? {native: base};
    if (own(forms, 'native')) throw new Error('Reserved family form: native');
    for (const [form, sourceId] of Object.entries(forms)) {
      if (!/^[a-z][a-z0-9_]*$/.test(form) || !own(records, sourceId)) throw new Error('Invalid family variant: ' + sourceId);
      const id = canonical(sourceId);
      if (id === base) throw new Error('Family variant equals base: ' + id);
      if (own(entries, form)) {
        if (entries[form] !== id) throw new Error('Conflicting family form: ' + base + ':' + form);
        continue;
      }
      if (owners.has(id)) throw new Error('Variant belongs to multiple forms: ' + id);
      owners.set(id, base);entries[form] = id;
    }
    families[base] = entries;
  }
  for (const base of Object.keys(families)) if (owners.has(base)) throw new Error('Nested family base: ' + base);
  const cards = states.cards.filter(id => !owners.has(id));
  const resources = new Map();
  function add(path, owner) {
    if (!resources.has(path)) resources.set(path, []);
    resources.get(path).push(owner);
  }
  for (const [id, record] of Object.entries(records)) for (const path of record.paths) add(path, {kind: 'block', id});
  for (const [id, item] of Object.entries(items)) for (const path of item.paths) add(path, {kind: 'item', id});
  const represented = new Set(cards);
  Object.values(families).forEach(forms => Object.values(forms).forEach(id => represented.add(id)));
  for (const [id, route] of Object.entries(states.routes)) {
    if (!represented.has(route.card)) throw new Error('State card is inaccessible: ' + id);
    represented.add(id);
  }
  for (const [id, target] of Object.entries(identity.aliases)) {
    if (!represented.has(target)) throw new Error('Alias target is inaccessible: ' + id);
    represented.add(id);
  }
  if (represented.size !== Object.keys(records).length) throw new Error('Unreachable catalog record');
  return {schema: 1, records, items, cards, families, aliases: identity.aliases, decisions: identity.decisions, stateGroups: states.groups, stateRoutes: states.routes, resources: Object.fromEntries([...resources].sort(([a], [b]) => a.localeCompare(b)))};
}
