import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto, createHash } from 'node:crypto';
const source = await readFile(new URL('../fk-catalog-data.js', import.meta.url), 'utf8');
const commit = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
function fixture() {
 const parts = {'blocks-000.json': {stone: {textures: 'stone'}}, 'terrain-000.json': {stone: {textures: 'textures/blocks/stone'}}, 'existing-000.json': {'textures/blocks/stone': 1}, 'auxiliary-000.json': {end_gateway: {textures: 'portal'}}, 'report.json': {admitted: 1}};
 const files = Object.fromEntries(Object.entries(parts).map(([k,v]) => [k, JSON.stringify(v)]));
 files['manifest.json'] = JSON.stringify({schema: 1, source: {commit}, counts: {blocks: 1, terrain: 1, existing: 1}, files: Object.entries(files).map(([name,t]) => ({name, sha256: createHash('sha256').update(t).digest('hex')}))});
 return files;
}
function loader(fetcher, crypto = webcrypto) {
 const window = {crypto, TextEncoder};
 vm.runInNewContext(source, {window, fetch: fetcher, Uint8Array});
 return window.FKCatalogData;
}
function response(text) {return {ok: true, text: async () => text}}
function fake(files) {return async url => {const name = url.split('/').pop(); if (!(name in files)) throw new Error('Missing fixture: ' + name); return response(files[name])}}
test('loads verified sections and shares one request promise', async () => {
 const files = fixture(); let calls = 0; const fetcher = fake(files);
 const api = loader(async u => {calls++; return fetcher(u)});
 const a = api.load(), b = api.load(); assert.equal(a,b);
 const d = await a; assert.ok(d.blocks.stone); assert.ok(d.auxiliary.end_gateway); assert.equal(calls, Object.keys(files).length);
});
test('rejects changed file contents and allows retry', async () => {
 const files = fixture(), original = files['blocks-000.json']; files['blocks-000.json'] = '{}';
 const api = loader(fake(files)); await assert.rejects(api.load(), /checksum mismatch/);
 files['blocks-000.json'] = original; assert.ok((await api.load()).blocks.stone);
});
test('rejects source mismatch before reading sections', async () => {
 const files = fixture(), m = JSON.parse(files['manifest.json']); m.source.commit = '0'.repeat(40); files['manifest.json'] = JSON.stringify(m);
 await assert.rejects(loader(fake(files)).load(), /Unsupported catalog manifest/);
});
test('rejects count mismatch', async () => {
 const files = fixture(), m = JSON.parse(files['manifest.json']); m.counts.blocks = 2; files['manifest.json'] = JSON.stringify(m);
 await assert.rejects(loader(fake(files)).load(), /counts do not match/);
});
test('rejects duplicate descriptors and path traversal', async () => {
 for (const invalid of ['duplicate', 'path']) {
  const files = fixture(), m = JSON.parse(files['manifest.json']);
  if (invalid === 'duplicate') m.files.push(m.files[0]); else m.files[0].name = '../blocks-000.json';
  files['manifest.json'] = JSON.stringify(m); await assert.rejects(loader(fake(files)).load(), /Invalid catalog file descriptor/);
 }
});
test('does not silently bypass checksum verification without crypto', async () => {
 await assert.rejects(loader(fake(fixture()), {}).load(), /requires Web Crypto/);
});
test('loads actual pinned repository catalog with all checks enabled', async () => {
 const base = new URL('../data/catalog-candidate/', import.meta.url);
 const api = loader(async url => response(await readFile(new URL(url.split('/').pop(), base), 'utf8')));
 const data = await api.load();
 assert.equal(data.source.commit, commit);
 for (const id of ['grass_block', 'iron_chain', 'sea_lantern', 'trip_wire', 'pale_moss_block', 'pale_moss_carpet']) assert.ok(data.blocks[id], id);
 for (const id of ['planks', 'wool', 'carpet', 'camera']) assert.equal(data.blocks[id], undefined, id);
});
