/* Unique resource paths and indexed variants are separate contracts. */
import {modelPartBindings} from './rules/parts.mjs';
const own = (value, key) => Object.hasOwn(value, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const faces = ['up', 'down', 'north', 'south', 'east', 'west'];
const DOORS = Object.freeze({wooden_door: 'wood', spruce_door: 'spruce', birch_door: 'birch', jungle_door: 'jungle', acacia_door: 'acacia', dark_oak_door: 'dark_oak', iron_door: 'iron'});
export function resourceVariants(value) {
  if (typeof value === 'string') {
    if (!/^textures\/[A-Za-z0-9_./-]+$/.test(value) || value.split('/').some(p => p === '..' || p === '.' || !p)) throw new Error('Invalid resource path: ' + value);
    return [value];
  }
  if (Array.isArray(value)) return value.flatMap(resourceVariants);
  if (value && typeof value === 'object' && own(value, 'path')) return resourceVariants(value.path);
  throw new Error('Unsupported texture resource');
}
export function resourcePaths(value) {
  return [...new Set(resourceVariants(value))];
}
export function resolveTexture(key, atlas) {
  if (typeof key !== 'string' || !own(atlas, key)) throw new Error('Unresolved texture key: ' + key);
  return resourcePaths(atlas[key].textures);
}
function blockTexture(id, key, atlas) {
  if (typeof key !== 'string' || !own(atlas, key)) throw new Error('Unresolved texture key: ' + key);
  const paths = resourceVariants(atlas[key].textures);
  if (key !== 'door_lower' && key !== 'door_upper') return paths;
  if (!own(DOORS, id)) throw new Error('Unassigned shared door atlas: ' + id);
  const half = key === 'door_lower' ? 'lower' : 'upper';
  const path = 'textures/blocks/door_' + DOORS[id] + '_' + half;
  if (!paths.includes(path)) throw new Error('Missing assigned door texture: ' + id + ': ' + path);
  return [path];
}
function resolveFaces(value, atlas, id) {
  if (typeof value === 'string') return Object.fromEntries(faces.map(face => [face, blockTexture(id, value, atlas)]));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid block texture definition');
  return Object.fromEntries(faces.map(face => {
    const key = value[face] ?? value.side;
    if (key === undefined) throw new Error('Missing block face: ' + face);
    return [face, blockTexture(id, key, atlas)];
  }));
}
function uniqueFaces(value) {
  return Object.fromEntries(Object.entries(value).map(([face, paths]) => [face, [...new Set(paths)]]));
}
export function normalizeBlock(id, definition, atlas, options = {}) {
  if (typeof id !== 'string' || !/^[a-z0-9_]+$/.test(id)) throw new Error('Invalid block id');
  const variants = resolveFaces(definition.textures, atlas, id);
  const carriedVariants = definition.carried_textures === undefined ? null : resolveFaces(definition.carried_textures, atlas, id);
  const modelFaces = uniqueFaces(variants), carriedFaces = carriedVariants === null ? null : uniqueFaces(carriedVariants);
  const icons = [...new Set((options.icons ?? []).flatMap(resourcePaths))].sort();
  const paths = [...new Set([...Object.values(modelFaces).flat(), ...Object.values(carriedFaces ?? {}).flat(), ...icons])].sort();
  if (options.existing) for (const path of paths) if (!own(options.existing, path)) throw new Error('Missing resource file: ' + path);
  const record = {id, model: options.model ?? null, states: options.states ?? null, faces: modelFaces, carried: carriedFaces, variants, carriedVariants, icons, paths};
  const bindings = modelPartBindings(record);
  return bindings ? {...record, bindings} : record;
}
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  return value;
}
export function resourceSignature(record) {
  if (!record.model) throw new Error('Model identity is required for deduplication');
  return JSON.stringify(ordered({model: record.model, states: record.states, faces: record.faces, carried: record.carried, variants: record.variants, carriedVariants: record.carriedVariants, icons: record.icons, bindings: record.bindings}));
}
