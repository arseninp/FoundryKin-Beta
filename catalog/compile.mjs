/* Pure catalog assembly. No DOM, network, storage, or model registration side effects. */
import {normalizeBlock, resourcePaths} from './resources.mjs';
import {compileAliases} from './identity.mjs';
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
  const links = object(input.icons ?? {}, 'icon links');
  const items = Object.fromEntries(Object.keys(atlas).sort().map(id => {
    const paths = resourcePaths(atlas[id].textures);
    if (!paths.length) throw new Error('Empty item resource: ' + id);
    for (const path of paths) if (!own(inventory, path)) throw new Error('Missing item resource: ' + path);
    return [id, {id, kind: 'sprite', paths}];
  }));
  for (const id of Object.keys(links)) if (!own(blocks, id)) throw new Error('Icon owner is missing: ' + id);
  const records = Object.fromEntries(Object.keys(blocks).sort().map(id => {
    const assignment = models[id];
    if (!own(models, id) || !assignment || typeof assignment.model !== 'string' || !assignment.model.trim()) throw new Error('Missing model assignment: ' + id);
    const keys = links[id] ?? [];
    if (!Array.isArray(keys)) throw new Error('Invalid icon links: ' + id);
    const icons = keys.flatMap(key => {
      if (!own(items, key)) throw new Error('Unknown item icon: ' + key);
      return items[key].paths;
    });
    return [id, normalizeBlock(id, blocks[id], terrain, {model: assignment.model, states: assignment.states, icons, existing: inventory})];
  }));
  const identity = compileAliases(records, input.aliases ?? {});
  const families = {}, owners = new Map(), hidden = new Set(Object.keys(identity.aliases));
  for (const [base, forms] of Object.entries(input.families ?? {})) {
    object(forms, 'family forms');
    if (!own(records, base) || hidden.has(base)) throw new Error('Invalid family base: ' + base);
    const entries = {native: base};
    if (own(forms, 'native')) throw new Error('Reserved family form: native');
    for (const [form, id] of Object.entries(forms)) {
      if (!/^[a-z][a-z0-9_]*$/.test(form) || !own(records, id) || hidden.has(id) || id === base) throw new Error('Invalid family variant: ' + id);
      if (owners.has(id)) throw new Error('Variant belongs to multiple forms: ' + id);
      owners.set(id, base); entries[form] = id;
    }
    families[base] = entries;
  }
  for (const base of Object.keys(families)) if (owners.has(base)) throw new Error('Nested family base: ' + base);
  const cards = identity.visible.filter(id => !owners.has(id));
  const resources = new Map();
  function add(path, owner) {
    if (!resources.has(path)) resources.set(path, []);
    resources.get(path).push(owner);
  }
  for (const [id, record] of Object.entries(records)) for (const path of record.paths) add(path, {kind: 'block', id});
  for (const [id, item] of Object.entries(items)) for (const path of item.paths) add(path, {kind: 'item', id});
  const represented = new Set(cards);
  Object.values(families).forEach(forms => Object.values(forms).forEach(id => represented.add(id)));
  for (const [id, target] of Object.entries(identity.aliases)) {
    if (!represented.has(target)) throw new Error('Alias target is inaccessible: ' + id);
    represented.add(id);
  }
  if (represented.size !== Object.keys(records).length) throw new Error('Unreachable catalog record');
  return {schema: 1, records, items, cards, families, aliases: identity.aliases, decisions: identity.decisions, resources: Object.fromEntries([...resources].sort(([a], [b]) => a.localeCompare(b)))};
}
