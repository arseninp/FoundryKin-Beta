import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { snapshot, chunks, writeCandidate } from './build-catalog-candidate.mjs';
const commit = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
function fixture() {
  return snapshot({ wool: { textures: 'old' }, white_wool: { textures: 'white' }, camera: { textures: 'camera' }, end_gateway: { textures: 'portal' }, pale_moss_carpet: { textures: 'moss', carried_textures: 'moss_side' } }, { data_items: ['white_wool', 'camera', 'pale_moss_carpet'].map(id => ({ name: 'minecraft:' + id })) }, { texture_data: { white: { textures: 'textures/blocks/wool_white' }, portal: { textures: 'textures/blocks/portal' }, moss: { textures: 'textures/blocks/moss' }, moss_side: { textures: 'textures/blocks/moss_side' } } }, ['resource_pack/textures/blocks/wool_white.png', 'resource_pack/textures/blocks/portal.tga'], commit);
}
test('admission is separate from auxiliary render resources', () => {
  const data = fixture();assert.equal(data.blocks.wool, undefined);assert.equal(data.blocks.camera, undefined);assert.equal(data.blocks.end_gateway, undefined);assert.ok(data.auxiliary.end_gateway);assert.ok(data.terrain.moss_side);assert.deepEqual(data.existing, ['textures/blocks/portal', 'textures/blocks/wool_white']);
});
test('chunks obey byte limits and preserve all entries', () => {
  const input = { a: 'мох', b: 'шерсть', c: 'текстура' };const parts = chunks(input, 32);assert.deepEqual(Object.assign({}, ...parts), input);assert.ok(parts.every(part => Buffer.byteLength(JSON.stringify(part)) <= 32));assert.throws(() => chunks({ a: 'x'.repeat(50) }, 20));
});
test('writes review-only manifest with verifiable hashes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fk-candidate-'));
  try {await writeCandidate(directory, fixture());const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));assert.equal(manifest.candidate, true);assert.equal(manifest.source.commit, commit);for (const file of manifest.files) {const text = await readFile(join(directory, file.name));assert.ok(text.length <= 25000);assert.equal(createHash('sha256').update(text).digest('hex'), file.sha256);}} finally {await rm(directory, { recursive: true, force: true });}
});
test('rejects unrelated source revisions', () => {
  assert.throws(() => snapshot({}, {}, {}, [], '0'.repeat(40)));
});
