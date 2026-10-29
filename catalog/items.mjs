/* Item variants share the same index-preserving parser as block resources. */
import {resourceVariants} from './resources.mjs';
const own = (object, key) => Object.hasOwn(object, key);
export function indexItems(atlas, inventory) {
  return Object.fromEntries(Object.keys(atlas).sort().map(id => {
    const alternatives = resourceVariants(atlas[id].textures);
    const paths = [...new Set(alternatives)];
    if (!paths.length) throw new Error('Empty item resource: ' + id);
    for (const path of paths) if (!own(inventory, path)) throw new Error('Missing item resource: ' + path);
    return [id, {id, kind: 'sprite', paths, variants: alternatives}];
  }));
}
export function resolveIcons(items, references) {
  if (!Array.isArray(references)) throw new Error('Icon references must be an array');
  const paths = references.flatMap(reference => {
    const key = typeof reference === 'string' ? reference : reference?.item;
    if (typeof key !== 'string' || !own(items, key)) throw new Error('Unknown item icon: ' + key);
    if (typeof reference === 'string') return items[key].paths;
    if (!reference || Array.isArray(reference) || !Object.hasOwn(reference, 'variant') || Object.keys(reference).some(k => k !== 'item' && k !== 'variant')) throw new Error('Invalid item variant reference');
    const index = reference.variant;
    if (!Number.isInteger(index) || index < 0 || index >= items[key].variants.length) throw new Error('Invalid item variant: ' + key);
    return [items[key].variants[index]];
  });
  return [...new Set(paths)];
}
