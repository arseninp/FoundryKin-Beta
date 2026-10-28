import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelRegistry} from '../models/registry.mjs';
test('explicit keys dispatch to exactly one builder', () => {
  const registry = createModelRegistry(), env = {group: {}}, calls = [];
  registry.register([{id: 'cube', build: e => {calls.push(e);return 'cube';}}, {id: 'stairs', build: () => 'stairs', scale: 1.4}]);
  assert.equal(registry.build('cube', env), 'cube');assert.equal(calls[0], env);
  assert.equal(registry.get('stairs').scale, 1.4);assert.deepEqual(registry.ids(), ['cube', 'stairs']);
});
test('a duplicate cannot override the accepted model', () => {
  const registry = createModelRegistry();registry.register([{id: 'cube', build: () => 'original'}]);
  assert.throws(() => registry.register([{id: 'cube', build: () => 'replacement'}]), /Duplicate/);
  assert.equal(registry.build('cube', {}), 'original');
});
test('batch registration is atomic', () => {
  const registry = createModelRegistry();registry.register([{id: 'cube', build() {}}]);
  assert.throws(() => registry.register([{id: 'stairs', build() {}}, {id: 'cube', build() {}}]));
  assert.equal(registry.has('stairs'), false);
  assert.throws(() => registry.register([{id: 'stairs', build() {}}, {id: 'bad', build: null}]));
  assert.equal(registry.has('stairs'), false);
});
test('unknown models and missing object assignments never fall back to a cube', () => {
  const registry = createModelRegistry();registry.register([{id: 'cube', build() {}}]);
  assert.throws(() => registry.build('unknown', {}), /Unknown/);
  assert.throws(() => registry.validate({stone: {model: 'unknown'}}), /Unknown/);
  assert.throws(() => registry.validate({stone: {}}), /Missing model/);
  registry.validate({stone: {model: 'cube'}});
});
test('sprite view policy is metadata, not a texture folder heuristic', () => {
  const registry = createModelRegistry();registry.register([{id: 'item-sprite', mode: 'sprite', build: e => e.path}]);
  assert.equal(registry.get('item-sprite').mode, 'sprite');
  assert.equal(registry.build('item-sprite', {path: 'textures/entity/shield'}), 'textures/entity/shield');
});
test('registration copies metadata and sealing prevents later changes', () => {
  const registry = createModelRegistry(), entry = {id: 'cube', scale: 1, build() {}};
  registry.register([entry]);entry.scale = 9;assert.equal(registry.get('cube').scale, 1);
  registry.seal();assert.throws(() => registry.register([{id: 'stairs', build() {}}]), /sealed/);
  assert.ok(Object.isFrozen(registry.get('cube')));assert.ok(Object.isFrozen(registry));
});
test('invalid view definitions, repeated keys and missing environments fail', () => {
  for (const entry of [{id: 'cube', scale: 0}, {id: 'cube', scale: Infinity}, {id: 'cube', mode: 'unknown'}, {id: '../cube'}]) {
    assert.throws(() => createModelRegistry().register([{build() {}, ...entry}]));
  }
  const registry = createModelRegistry();assert.throws(() => registry.register([{id: 'cube', build() {}}, {id: 'cube', build() {}}]));
  assert.deepEqual(registry.ids(), []);registry.register([{id: 'cube', build() {}}]);assert.throws(() => registry.build('cube', null));
});
