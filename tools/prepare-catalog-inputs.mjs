/* Build-time admission boundary. Every registry ID receives an explicit resource status. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export function parseJsonc(text) {
  const clean = String(text).replace(/^\uFEFF/, '').replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (match, string) => string || '');
  return JSON.parse(clean.replace(/,(\s*[}\]])/g, '$1'));
}
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function usableTextures(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return dictionary(value) && Object.keys(value).length > 0 && Object.values(value).every(key => typeof key === 'string' && key.trim().length > 0);
}
export function admitBlocks(definitions, registry, policy, source) {
  if (!dictionary(definitions)) throw new Error('Invalid resource definitions');
  if (!registry || !Array.isArray(registry.data_items) || !registry.data_items.length) throw new Error('Unknown or empty block registry schema');
  if (!source || !/^[0-9a-f]{40}$/.test(source.commit || '')) throw new Error('A resolved source commit is required');
  if (!policy || !dictionary(policy.exclude)) throw new Error('Explicit scope policy is required');
  const active = new Set();
  for (const entry of registry.data_items) {
    if (!entry || typeof entry.name !== 'string' || !/^minecraft:[a-z0-9_]+$/.test(entry.name)) throw new Error('Invalid block registry identifier');
    const id = entry.name.slice(10);
    if (active.has(id)) throw new Error('Duplicate registry identifier: ' + id);
    active.add(id);
  }
  const rejected = [], blocks = {}, excluded = policy.exclude;
  for (const [id, reason] of Object.entries(excluded)) {
    if (!/^[a-z0-9_]+$/.test(id) || typeof reason !== 'string' || !reason.trim()) throw new Error('Invalid exclusion policy');
  }
  for (const id of Object.keys(definitions).sort()) {
    const entry = definitions[id];
    if (!active.has(id) && dictionary(entry) && entry.textures) rejected.push({id, reason: 'not-in-release-registry'});
  }
  const resourceStatus = [], withoutResourceDefinition = [], withoutTextures = [], invalidResourceDefinition = [];
  for (const id of [...active].sort()) {
    let status;
    if (Object.hasOwn(excluded, id)) {
      status = 'excluded';rejected.push({id, reason: excluded[id]});
    } else if (!Object.hasOwn(definitions, id)) {
      status = 'missing-definition';withoutResourceDefinition.push(id);
    } else if (!dictionary(definitions[id])) {
      status = 'invalid-definition';invalidResourceDefinition.push(id);
    } else if (!Object.hasOwn(definitions[id], 'textures')) {
      status = 'no-textures';withoutTextures.push(id);
    } else if (!usableTextures(definitions[id].textures)) {
      status = 'invalid-textures';invalidResourceDefinition.push(id);
    } else {
      status = 'admitted';blocks[id] = structuredClone(definitions[id]);
    }
    resourceStatus.push({id, status});
  }
  if (!Object.keys(blocks).length) throw new Error('Admission produced an empty catalog');
  const coverage = Object.fromEntries(['admitted', 'excluded', 'missing-definition', 'no-textures', 'invalid-definition', 'invalid-textures'].map(status => [status, resourceStatus.filter(row => row.status === status).length]));
  return {schema: 1, source: {repository: 'Mojang/bedrock-samples', commit: source.commit}, blocks,
    report: {admitted: Object.keys(blocks).length, rejected, withoutResourceDefinition, withoutTextures, invalidResourceDefinition, coverage}};
}
export async function main(args) {
  if (args.length !== 4) throw new Error('Usage: node tools/prepare-catalog-inputs.mjs SOURCE_DIRECTORY SOURCE_COMMIT POLICY_JSON OUTPUT_JSON');
  const [directory, commit, policyPath, outputPath] = args;
  const read = async path => parseJsonc(await readFile(path, 'utf8'));
  const [definitions, registry, policy] = await Promise.all([
    read(resolve(directory, 'resource_pack/blocks.json')),
    read(resolve(directory, 'metadata/vanilladata_modules/mojang-blocks.json')),
    read(resolve(policyPath))
  ]);
  const result = admitBlocks(definitions, registry, policy, {commit});
  await mkdir(dirname(resolve(outputPath)), {recursive: true});
  await writeFile(resolve(outputPath), JSON.stringify(result, null, 2) + '\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => {console.error(error.message);process.exitCode = 1;});
