/* Generate reviewable catalog inputs from a single checked-out Mojang commit. */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { admitBlocks, parseJsonc } from './prepare-catalog-inputs.mjs';
const COMMIT = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
const LIMIT = 22000;
const POLICY = { exclude: { camera: 'outside-current-editor-scope' } };
const AUXILIARY = ['end_gateway', 'lava_cauldron'];
function textureKeys(value, result) {
  if (typeof value === 'string') result.add(value);
  else if (Array.isArray(value)) value.forEach(v => textureKeys(v, result));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => textureKeys(v, result));
}
export function snapshot(definitions, registry, terrain, paths, commit) {
  if (commit !== COMMIT) throw new Error('Unexpected Mojang source commit');
  if (!terrain || !terrain.texture_data) throw new Error('Missing terrain texture data');
  const admitted = admitBlocks(definitions, registry, POLICY, { commit });
  const auxiliary = Object.fromEntries(AUXILIARY.filter(id => definitions[id]).map(id => [id, structuredClone(definitions[id])]));
  const keys = new Set();
  for (const entry of [...Object.values(admitted.blocks), ...Object.values(auxiliary)]) {
    textureKeys(entry.textures, keys);textureKeys(entry.carried_textures, keys);
  }
  const missingTerrainKeys = [...keys].filter(key => !Object.hasOwn(terrain.texture_data, key)).sort();
  const selectedTerrain = Object.fromEntries([...keys].sort().filter(key => Object.hasOwn(terrain.texture_data, key)).map(key => [key, terrain.texture_data[key]]));
  const existing = [...new Set(paths.filter(path => /^resource_pack\/textures\/.+\.(png|tga)$/.test(path)).map(path => path.slice(14, -4)))].sort();
  if (!existing.length) throw new Error('Empty resource file inventory');
  return {
    source: admitted.source,
    blocks: admitted.blocks,
    terrain: selectedTerrain,
    existing,
    auxiliary,
    report: { ...admitted.report, missingTerrainKeys, auxiliaryResources: Object.keys(auxiliary), excludedByPolicy: POLICY.exclude }
  };
}
export function chunks(object, limit = LIMIT) {
  const result = [];let current = {};
  for (const [key, value] of Object.entries(object)) {
    const next = { ...current, [key]: value };
    if (Buffer.byteLength(JSON.stringify(next)) > limit && Object.keys(current).length) { result.push(current);current = { [key]: value }; }
    else current = next;
    if (Buffer.byteLength(JSON.stringify(current)) > limit) throw new Error('One catalog entry exceeds chunk size');
  }
  if (Object.keys(current).length) result.push(current);
  return result;
}
export async function writeCandidate(directory, data) {
  const documents = [];
  function add(name, value) {
    const text = JSON.stringify(value) + '\n';
    if (Buffer.byteLength(text) > 25000) throw new Error('Generated file exceeds 25000 bytes: ' + name);
    documents.push({ name, text, sha256: createHash('sha256').update(text).digest('hex') });
  }
  for (const section of ['blocks', 'terrain', 'auxiliary', 'existing']) {
    const object = section === 'existing' ? Object.fromEntries(data.existing.map(path => [path, 1])) : data[section];
    chunks(object).forEach((chunk, i) => add(section + '-' + String(i).padStart(3, '0') + '.json', chunk));
  }
  add('report.json', data.report);
  add('manifest.json', { schema: 1, candidate: true, source: data.source, counts: { blocks: Object.keys(data.blocks).length, terrain: Object.keys(data.terrain).length, existing: data.existing.length }, files: documents.map(({ name, sha256 }) => ({ name, sha256 })) });
  await rm(directory, { recursive: true, force: true });await mkdir(directory, { recursive: true });
  for (const document of documents) await writeFile(resolve(directory, document.name), document.text);
}
export async function main(args) {
  if (args.length !== 2) throw new Error('Usage: node tools/build-catalog-candidate.mjs SOURCE_DIRECTORY OUTPUT_DIRECTORY');
  const [directory, output] = args;
  const commit = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const read = async path => parseJsonc(await readFile(resolve(directory, path), 'utf8'));
  const [definitions, registry, terrain] = await Promise.all([read('resource_pack/blocks.json'), read('metadata/vanilladata_modules/mojang-blocks.json'), read('resource_pack/textures/terrain_texture.json')]);
  const paths = execFileSync('git', ['-C', directory, 'ls-tree', '-r', '--name-only', 'HEAD'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim().split('\n');
  await writeCandidate(resolve(output), snapshot(definitions, registry, terrain, paths, commit));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message);process.exitCode = 1; });
