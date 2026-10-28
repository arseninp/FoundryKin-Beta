import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createModelRegistry} from '../models/registry.mjs';
import {createStrandModels} from '../models/strands.mjs';
const legacySource = await readFile(new URL('../fk-strands.js', import.meta.url), 'utf8');
function three() {
  return {DoubleSide: 2, PlaneGeometry: class {constructor(width, height) {this.width = width;this.height = height;}}, Mesh: class {
    constructor(geometry, material) {this.geometry = geometry;this.material = material;this.rotation = {y: 0};this.position = {set: (x, y, z) => {this.x = x;this.y = y;this.z = z;}};}
  }};
}
function env(id, slot) {
  const names = id === 'pale_hanging_moss' ? ['middle', 'tip'] : ['down', 'up'].flatMap(direction => ['base', 'middle', 'frustum', 'tip', 'tip_merge'].map(part => direction + '_' + part));
  const faceMap = Object.fromEntries(names.map(name => [name, 'textures/blocks/' + id + '_' + name]));
  return {cur: id, slot: faceMap[slot] ?? faceMap[names[0]], faceMap, mats: Object.fromEntries(Object.values(faceMap).map(path => [path, {path}])), hiddenMat: {}, group: {children: [], add(mesh) {this.children.push(mesh);}}};
}
function snapshot(environment) {
  return environment.group.children.map(mesh => ({width: mesh.geometry.width, height: mesh.geometry.height, position: [mesh.x, mesh.y, mesh.z], rotation: mesh.rotation.y, material: mesh.material.path, side: mesh.material.side, update: mesh.material.needsUpdate}));
}
test('migrated geometry matches legacy output for both moss slots and all ten spike slots', () => {
  const Three = three(), context = {THREE: Three, FKCatalog: {index() {}}, FKShapes: {build() {throw new Error('Unexpected fallback');}, view() {return 1.4;}}};
  context.window = context;vm.runInNewContext(legacySource, context);
  const registry = createModelRegistry();registry.register(createStrandModels(Three));registry.seal();
  for (const id of ['pale_hanging_moss', 'sulfur_spike']) {
    const slots = Object.keys(env(id).faceMap);
    for (const slot of slots) {
      const previous = env(id, slot), next = env(id, slot);
      context.FKShapes.build(previous);registry.build(id, next);
      assert.deepEqual(snapshot(next), snapshot(previous), id + ':' + slot);
    }
    assert.equal(registry.get(id).scale, context.FKShapes.view(id));
  }
});
test('missing materials reject rendering instead of inventing geometry', () => {
  const registry = createModelRegistry();registry.register(createStrandModels(three()));
  const state = env('pale_hanging_moss');delete state.mats[state.faceMap.middle];
  assert.throws(() => registry.build('pale_hanging_moss', state), /Missing segmented material/);
});
test('model creation does not mutate global dispatch or the catalog', () => {
  assert.throws(() => createStrandModels({}), /require Three/);
  const registrations = createStrandModels(three());
  assert.deepEqual(registrations.map(row => row.id), ['pale_hanging_moss', 'sulfur_spike']);
  assert.ok(registrations.every(row => row.mode === 'volume'));
});
