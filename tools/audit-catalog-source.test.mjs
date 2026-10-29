import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from './audit-catalog-source.mjs';
const commit = '0123456789012345678901234567890123456789';
test('reports real registry membership and keeps all selected atlas variants', () => {
  const blocks = { planks: { textures: 'planks' }, oak_planks: { textures: 'oak' } };
  const registry = { data_items: [{ name: 'minecraft:oak_planks' }] };
  const terrain = { texture_data: { planks: { textures: ['oak', 'spruce'] } } };
  const report = summarize(blocks, registry, terrain, commit);
  assert.equal(report.registry.schemaSupported, true);
  assert.deepEqual(report.resources.resourceOnlySample, ['planks']);
  assert.deepEqual(report.checks.find(e => e.id === 'planks').terrain.planks.textures, ['oak', 'spruce']);
  assert.equal(report.checks.find(e => e.id === 'camera').registry, null);
});
test('unknown registry schema is reported rather than treated as an empty active set', () => {
  const report = summarize({ planks: { textures: 'planks' } }, {}, {}, commit);
  assert.equal(report.registry.schemaSupported, false);
  assert.equal(report.resources.resourceOnlyCount, null);
});
test('source commit must be resolved', () => {
  assert.throws(() => summarize({}, {}, {}, 'main'));
});
