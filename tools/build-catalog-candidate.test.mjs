import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { snapshot, chunks, writeCandidate } from './build-catalog-candidate.mjs';
const commit = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
const ACTIVE = ['white_wool', 'camera', 'pale_moss_carpet', 'grass_block', 'iron_chain', 'sea_lantern', 'trip_wire'];
const TERRAIN = Object.fromEntries(['white', 'portal', 'moss', 'moss_side', 'grass_top', 'grass_side', 'chain1', 'chain2', 'sea_lantern', 'trip_wire'].map(x => [x, { textures: 'textures/blocks/' + x }]));
const PATHS = ['resource_pack/textures/blocks/wool_white.png', 'resource_pack/textures/blocks/portal.tga'];
function definitions() {
  return { wool: { textures: 'old' }, white_wool: { textures: 'white' }, camera: { textures: 'camera' }, end_gateway: { textures: 'portal' }, pale_moss_carpet: { textures: 'moss', carried_textures: 'moss_side' }, grass: { textures: { up: 'grass_top', side: 'grass_side' } }, chain: { textures: { up: 'chain1', side: 'chain2' } }, seaLantern: { textures: 'sea_lantern' }, tripWire: { textures: 'trip_wire' } };
}
function registry(ids = ACTIVE) { return { data_items: ids.map(id => ({ name: 'minecraft:' + id })) }; }
function fixture() { return snapshot(definitions(), registry(), { texture_data: TERRAIN }, PATHS, commit); }
test('admission is separate from auxiliary render resources', () => {
  const data = fixture();
  assert.equal(data.blocks.wool, undefined);
  assert.equal(data.blocks.camera, undefined);
  assert.equal(data.blocks.end_gateway, undefined);
  assert.ok(data.auxiliary.end_gateway);
  assert.ok(data.terrain.moss_side);
});
test('legacy ids feed only exact active aliases', () => {
  const data = fixture();
  assert.equal(data.blocks.grass_block.textures.up, 'grass_top');
  assert.equal(data.blocks.iron_chain.textures.side, 'chain2');
  assert.equal(data.blocks.sea_lantern.textures, 'sea_lantern');
  assert.equal(data.blocks.trip_wire.textures, 'trip_wire');
  for (const old of ['grass', 'chain', 'seaLantern', 'tripWire']) assert.equal(data.blocks[old], undefined);
  assert.deepEqual(data.report.legacyAliases.map(x => x.target), ['grass_block', 'iron_chain', 'sea_lantern', 'trip_wire']);
});
test('alias copies do not mutate input definitions', () => {
  const input = definitions(), before = JSON.stringify(input);
  const data = snapshot(input, registry(), { texture_data: TERRAIN }, PATHS, commit);
  data.blocks.grass_block.textures.up = 'changed';
  assert.equal(JSON.stringify(input), before);
});
test('missing alias source or inactive target fails closed', () => {
  const noSource = definitions(); delete noSource.grass;
  assert.throws(() => snapshot(noSource, registry(), { texture_data: TERRAIN }, PATHS, commit), /legacy resource alias source is missing/);
  assert.throws(() => snapshot(definitions(), registry(['white_wool']), { texture_data: TERRAIN }, PATHS, commit), /Alias target is absent/);
});
test('chunks obey byte limits and preserve all entries', () => {
  const input = { a: 'мох', b: 'шерсть', c: 'текстура' };
  const parts = chunks(input, 32);
  assert.deepEqual(Object.assign({}, ...parts), input);
  assert.ok(parts.every(part => Buffer.byteLength(JSON.stringify(part)) <= 32));
  assert.throws(() => chunks({ a: 'x'.repeat(50) }, 20));
});
test('writes review-only manifest with verifiable hashes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fk-candidate-'));
  try {
    await writeCandidate(directory, fixture());
    const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
    assert.equal(manifest.candidate, true);
    assert.equal(manifest.source.commit, commit);
    for (const file of manifest.files) {
      const text = await readFile(join(directory, file.name));
      assert.ok(text.length <= 25000);
      assert.equal(createHash('sha256').update(text).digest('hex'), file.sha256);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('rejects unrelated source revisions', () => {
  assert.throws(() => snapshot({}, {}, {}, [], '0'.repeat(40)));
});
