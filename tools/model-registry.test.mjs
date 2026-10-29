import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelRegistry} from '../models/registry.mjs';
const entry = (id, extra = {}) => ({id, build: env => env, ...extra});
test('keys require actual strings, without coercion or inherited ids', () => {
  for (const id of [undefined, null, false, 12, {}, [], new String('cube'), {toString() {return 'cube';}}, Symbol('cube'), '', '../cube']) {
    const registry = createModelRegistry();
    assert.throws(() => registry.register([entry(id)]));
    assert.deepEqual(registry.ids(), []);
    assert.equal(registry.has(id), false);
  }
  const registry = createModelRegistry();
  assert.throws(() => registry.register([{build() {}}]));
  assert.throws(() => registry.register([Object.assign(Object.create({id: 'cube'}), {build() {}})]));
});
test('dispatch preserves the supplied environment and return value', () => {
  const registry = createModelRegistry(), env = {group: {}}, result = {};
  registry.register([entry('cube', {build: received => {assert.equal(received, env);return result;}})]);
  assert.equal(registry.build('cube', env), result);
  assert.deepEqual(registry.ids(), ['cube']);
});
test('all invalid batch forms, duplicate keys and descriptors are atomic', () => {
  const registry = createModelRegistry();registry.register([entry('cube')]);
  for (const batch of [null, {}, [entry('stairs'), entry('cube')], [entry('stairs'), entry('stairs')], [entry('stairs'), entry('bad', {build: null})], [entry('stairs'), null]]) {
    assert.throws(() => registry.register(batch));
    assert.deepEqual(registry.ids(), ['cube']);
  }
});
test('view fields have strict types and finite positive scales', () => {
  for (const scale of [null, '1', 0, -1, Infinity, NaN]) assert.throws(() => createModelRegistry().register([entry('cube', {scale})]));
  for (const mode of [null, 1, 'unknown']) assert.throws(() => createModelRegistry().register([entry('cube', {mode})]));
  const registry = createModelRegistry();registry.register([entry('cube'), entry('icon', {mode: 'sprite', scale: 1.4})]);
  assert.equal(registry.get('cube').scale, 1);assert.equal(registry.get('icon').mode, 'sprite');
});
test('invalid assignments and unknown models never become cubes', () => {
  const registry = createModelRegistry();registry.register([entry('cube')]);
  for (const records of [null, [], {stone: null}, {stone: {}}, {stone: {model: null}}, {stone: {model: 'missing'}}]) assert.throws(() => registry.validate(records));
  registry.validate({stone: {model: 'cube'}});
  assert.throws(() => registry.get('missing'));
  for (const env of [null, [], false]) assert.throws(() => registry.build('cube', env));
});
test('metadata is copied and frozen; sealing prevents every later registration', () => {
  const registry = createModelRegistry(), source = entry('cube');registry.register([source]);source.scale = 9;
  assert.equal(registry.get('cube').scale, 1);assert.ok(Object.isFrozen(registry.get('cube')));
  registry.seal();registry.seal();assert.throws(() => registry.register([]));assert.throws(() => registry.register([entry('stairs')]));
  const ids = registry.ids();ids.push('fake');assert.equal(registry.has('fake'), false);
});
