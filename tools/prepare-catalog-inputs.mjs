/* Build-time admission boundary. This does not modify the running editor. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export function parseJsonc(text) {
  const clean = String(text).replace(/^\uFEFF/, '').replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (match, string) => string || '');
  return JSON.parse(clean.replace(/,(\s*[}\]])/g, '$1'));
}
export function admitBlocks(definitions, registry, policy, source) {
  if (!definitions || typeof definitions !== 'object' || Array.isArray(definitions)) throw new Error('Invalid resource definitions');
  if (!registry || !Array.isArray(registry.data_items) || !registry.data_items.length) throw new Error('Unknown or empty block registry schema');
  if (!source || !/^[0-9a-f]{40}$/.test(source.commit || '')) throw new Error('A resolved source commit is required');
  if (!policy || typeof policy.exclude !== 'object' || !policy.exclude || Array.isArray(policy.exclude)) throw new Error('Explicit scope policy is required');
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
    if (!entry || typeof entry !== 'object' || !entry.textures) continue;
    if (!active.has(id)) { rejected.push({ id, reason: 'not-in-release-registry' }); continue; }
    if (Object.hasOwn(excluded, id)) { rejected.push({ id, reason: excluded[id] }); continue; }
    blocks[id] = structuredClone(entry);
  }
  if (!Object.keys(blocks).length) throw new Error('Admission produced an empty catalog');
  const withoutResourceDefinition = [...active].filter(id => !Object.hasOwn(definitions, id) && !Object.hasOwn(excluded, id)).sort();
  return { schema: 1, source: { repository: 'Mojang/bedrock-samples', commit: source.commit }, blocks, report: { admitted: Object.keys(blocks).length, rejected, withoutResourceDefinition } };
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
  const result = admitBlocks(definitions, registry, policy, { commit });
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(resolve(outputPath), JSON.stringify(result, null, 2) + '\n');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
