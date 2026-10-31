/* Shared resources a model may bind without owning them. Source objects keep ownership and editing. */
import {resourceVariants} from '../resources.mjs';
import {pitcherPodResources} from './shared.mjs';
const own = (object, key) => Object.hasOwn(object, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ROLE = /^[a-z][a-z0-9_]*$/;
const TORCHES = Object.freeze({torch_on: 'textures/blocks/redstone_torch_on', torch_off: 'textures/blocks/redstone_torch_off'});
const BY_MODEL = Object.freeze({
  azalea: Object.freeze({pot: 'textures/blocks/flower_pot', soil: 'textures/blocks/dirt'}),
  piston: Object.freeze({head_back: 'textures/blocks/piston_top_normal'}),
  repeater: TORCHES,
  comparator: TORCHES,
  pitcher: pitcherPodResources
});
export function declaredDependencies(assignments) {
  if (!dictionary(assignments)) throw new Error('Invalid model assignments');
  const result = {};
  for (const [id, assignment] of Object.entries(assignments)) if (dictionary(assignment) && own(BY_MODEL, assignment.model)) result[id] = {...BY_MODEL[assignment.model]};
  return result;
}
export function attachDependencies(records, dependencies, inventory) {
  if (!dictionary(records) || !dictionary(dependencies) || !dictionary(inventory)) throw new Error('Invalid dependency input');
  const result = {...records};
  for (const [id, roles] of Object.entries(dependencies)) {
    if (!own(records, id)) throw new Error('Dependency owner is missing: ' + id);
    if (!dictionary(roles) || !Object.keys(roles).length) throw new Error('Invalid dependencies: ' + id);
    const declared = {};
    for (const [role, value] of Object.entries(roles)) {
      if (!ROLE.test(role)) throw new Error('Invalid dependency role: ' + id + ':' + role);
      const paths = resourceVariants(value);
      if (paths.length !== 1) throw new Error('Ambiguous dependency: ' + id + ':' + role);
      if (!own(inventory, paths[0])) throw new Error('Missing dependency resource: ' + paths[0]);
      declared[role] = [paths[0]];
    }
    result[id] = {...records[id], dependencies: declared};
  }
  return result;
}
