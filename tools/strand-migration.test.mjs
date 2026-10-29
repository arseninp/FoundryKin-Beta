/* Independent transfer contract: no legacy source or hardcoded legacy-view callback. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelRegistry} from '../models/registry.mjs';
import {createStrandModels} from '../models/strands.mjs';
const parts = ['base', 'middle', 'frustum', 'tip', 'tip_merge'];
function setup() {
  const Three = {DoubleSide: 2, PlaneGeometry: class {constructor(w, h) {this.width = w;this.height = h;}}, Mesh: class {
    constructor(geometry, material) {this.geometry = geometry;this.material = material;this.rotation = {};this.position = {set: (...values) => {this.xyz = values;}};}
  }};
  const registry = createModelRegistry();registry.register(createStrandModels(Three));registry.seal();return registry;
}
function environment(id, selected) {
  const keys = id === 'pale_hanging_moss' ? ['middle', 'tip'] : ['down', 'up'].flatMap(d => parts.map(p => d + '_' + p));
  const faceMap = Object.fromEntries(keys.map(key => [key, 'textures/blocks/' + id + '_' + key]));
  return {slot: faceMap[selected ?? keys[0]], faceMap, mats: Object.fromEntries(Object.values(faceMap).map(path => [path, {path}])), hiddenMat: {}, group: {children: [], add(mesh) {this.children.push(mesh);}}};
}
function check(env, sections, width, height) {
  assert.equal(env.group.children.length, sections.length * 2);
  sections.forEach(([key, y], index) => {
    for (const side of [0, 1]) {
      const mesh = env.group.children[index * 2 + side];
      assert.equal(mesh.material.path, env.faceMap[key]);assert.equal(mesh.material, env.mats[env.faceMap[key]]);
      assert.equal(mesh.geometry.width, width);assert.equal(mesh.geometry.height, height);
      assert.deepEqual(mesh.xyz, [0, y, 0]);assert.equal(mesh.rotation.y, side === 0 ? 0 : Math.PI / 2);
      assert.equal(mesh.material.side, 2);assert.equal(mesh.material.needsUpdate, true);
    }
  });
}
test('moss keeps the full middle and lower tip for both selected resources', () => {
  const registry = setup();
  for (const slot of ['middle', 'tip']) {const env = environment('pale_hanging_moss', slot);registry.build('pale_hanging_moss', env);check(env, [['middle', .5], ['tip', -.5]], Math.SQRT2, 1);}
});
test('all ten sulfur selections have independent expected heights and materials', () => {
  const registry = setup();
  for (const direction of ['down', 'up']) for (const selected of parts) {
    const env = environment('sulfur_spike', direction + '_' + selected);registry.build('sulfur_spike', env);
    const heights = direction === 'up' ? [-.75, -.25, .25, .75] : [.75, .25, -.25, -.75];
    const keys = [direction + '_base', direction + '_middle', direction + '_frustum', direction + (selected === 'tip_merge' ? '_tip_merge' : '_tip')];
    check(env, keys.map((key, i) => [key, heights[i]]), Math.SQRT2 / 2, .5);
  }
});
test('view metadata is explicit and does not depend on the texture directory', () => {
  const registry = setup();assert.deepEqual(registry.ids(), ['pale_hanging_moss', 'sulfur_spike']);
  for (const id of registry.ids()) {assert.equal(registry.get(id).scale, 1.4);assert.equal(registry.get(id).mode, 'volume');}
});
test('missing and hidden materials are rejected; Three is an explicit dependency', () => {
  for (const hidden of [false, true]) {
    const env = environment('pale_hanging_moss');
    if (hidden) env.mats[env.faceMap.middle] = env.hiddenMat;else delete env.mats[env.faceMap.middle];
    assert.throws(() => setup().build('pale_hanging_moss', env), /Missing segmented material/);
  }
  assert.throws(() => createStrandModels({}), /require Three/);
});
