/* Model registration, coverage and the compiler admission boundary. */
import {createModelRegistry} from './registry.mjs';
import {createPrimitiveModels} from './primitives.mjs';
import {createGelModels} from './gels.mjs';
import {createStrandModels} from './strands.mjs';
import {createLightModels} from './lights.mjs';
import {createPlanarModels} from './planar.mjs';
import {createFixtureModels} from './fixtures.mjs';
import {createDoorModels} from './doors.mjs';
import {createAmethystModels} from './amethyst.mjs';
import {createAzaleaModels} from './azalea.mjs';
import {createPottedAzaleaModels} from './potted-azalea.mjs';
import {createBambooModels} from './bamboo.mjs';
import {createMossModels} from './moss.mjs';
import {createRedstoneModels} from './redstone.mjs';
import {createFittingModels} from './fittings.mjs';
import {createPlantModels} from './plants.mjs';
import {createSpecialModels} from './specials.mjs';
import {createGrowthModels} from './growth.mjs';
import {createMechanismModels} from './mechanisms.mjs';
import {createFlowerbedModels} from './flowerbeds.mjs';
import {createPitcherModels} from './pitcher.mjs';
import {createWireModels} from './wires.mjs';
import {createTrackModels} from './tracks.mjs';
import {createMetalModels} from './metals.mjs';
import {createWorkshopModels} from './workshop.mjs';
import {createDripleafModels} from './dripleaf.mjs';
import {createSculkModels} from './sculk.mjs';
import {createDriedGhastModels} from './dried-ghast.mjs';
import {createBarrelModels} from './barrel.mjs';
import {createStructureModels} from './structures.mjs';
import {compileCatalog} from '../catalog/compile.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {declaredDependencies} from '../catalog/rules/dependencies.mjs';
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function createModelLibrary(Three) {
 const registry = createModelRegistry();
 registry.register([...createPrimitiveModels(Three), ...createGelModels(Three), ...createStrandModels(Three), ...createLightModels(Three), ...createPlanarModels(Three), ...createFixtureModels(Three), ...createDoorModels(Three), ...createAmethystModels(Three), ...createAzaleaModels(Three), ...createPottedAzaleaModels(Three), ...createBambooModels(Three), ...createMossModels(Three), ...createRedstoneModels(Three), ...createFittingModels(Three), ...createPlantModels(Three), ...createSpecialModels(Three), ...createGrowthModels(Three), ...createMechanismModels(Three), ...createFlowerbedModels(Three), ...createPitcherModels(Three), ...createWireModels(Three), ...createTrackModels(Three), ...createMetalModels(Three), ...createWorkshopModels(Three), ...createDripleafModels(Three), ...createSculkModels(Three), ...createDriedGhastModels(Three), ...createBarrelModels(Three), ...createStructureModels(Three)]);
 registry.seal();
 return registry;
}
export function inspectModelCoverage(records, registry) {
 if (!dictionary(records) || !registry || typeof registry.has !== 'function') throw new Error('Invalid model coverage input');
 const assigned = new Map(), missing = new Map(), invalid = [];
 for (const id of Object.keys(records).sort()) {
  const record = records[id];
  if (!dictionary(record) || !Object.hasOwn(record, 'model') || typeof record.model !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(record.model)) {invalid.push(id);continue;}
  const target = registry.has(record.model) ? assigned : missing;
  if (!target.has(record.model)) target.set(record.model, []);
  target.get(record.model).push(id);
 }
 const sorted = map => Object.fromEntries([...map].sort(([a],[b]) => a.localeCompare(b)));
 return {total: Object.keys(records).length, ready: missing.size === 0 && invalid.length === 0, assigned: sorted(assigned), missing: sorted(missing), invalid};
}
export function bindCatalogModels(catalog, Three) {
 if (!catalog || catalog.schema !== 1 || !dictionary(catalog.records)) throw new Error('Invalid compiled catalog');
 const registry = createModelLibrary(Three), coverage = inspectModelCoverage(catalog.records, registry);
 if (!coverage.ready) {
  const details = Object.entries(coverage.missing).map(([model, ids]) => model + ': ' + ids.join(', '));
  if (coverage.invalid.length) details.push('invalid assignments: ' + coverage.invalid.join(', '));
  const error = new Error('Catalog model coverage incomplete; ' + details.join('; '));
  error.coverage = coverage;throw error;
 }
 registry.validate(catalog.records);
 return Object.freeze({registry, coverage});
}
export function compileModelCatalog(input, Three) {
 if (!dictionary(input) || !dictionary(input.blocks)) throw new Error('Invalid catalog input');
 const registry = createModelLibrary(Three), plan = planModelAssignments(input.blocks, input.models ?? {});
 const known = inspectModelCoverage(plan.assignments, registry);
 const coverage = {...known, total: Object.keys(input.blocks).length, unresolved: plan.unresolved, ready: known.ready && plan.unresolved.length === 0};
 if (!coverage.ready) {
  const error = new Error('Model plan is incomplete: ' + plan.unresolved.length + ' unresolved objects, ' + Object.keys(known.missing).length + ' missing builders');
  error.coverage = coverage;throw error;
 }
 const unwrap = (atlas, label) => {
  if (!dictionary(atlas)) throw new Error('Invalid ' + label + ' atlas');
  if (!Object.hasOwn(atlas, 'texture_data')) return atlas;
  if (!dictionary(atlas.texture_data)) throw new Error('Invalid ' + label + ' texture_data');
  return atlas.texture_data;
 };
 const prepared = {...input, models: plan.assignments, dependencies: input.dependencies ?? declaredDependencies(plan.assignments), terrain: unwrap(input.terrain, 'terrain')};
 if (input.items !== undefined) prepared.items = unwrap(input.items, 'item');
 const catalog = compileCatalog(prepared);
 registry.validate(catalog.records);
 return Object.freeze({catalog, registry, coverage});
}
