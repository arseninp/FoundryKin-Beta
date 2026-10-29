/* Diagnostic only: inspect one official release without changing the app catalog. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseJsonc } from './prepare-catalog-inputs.mjs';
const CHECK_IDS = ['planks', 'oak_planks', 'wool', 'white_wool', 'carpet', 'white_carpet', 'camera', 'bone_block', 'moss_block', 'moss_carpet', 'pale_moss_block', 'pale_moss_carpet'];
export function summarize(definitions, registry, terrain, commit) {
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error('Invalid source commit');
  const entries = Array.isArray(registry.data_items) ? registry.data_items : [];
  const supported = entries.length > 0 && entries.every(e => e && typeof e.name === 'string' && /^minecraft:[a-z0-9_]+$/.test(e.name));
  const byId = new Map(entries.filter(e => e && typeof e.name === 'string').map(e => [e.name.replace(/^minecraft:/, ''), e]));
  const textured = Object.keys(definitions).filter(id => definitions[id] && definitions[id].textures).sort();
  const resourceOnly = supported ? textured.filter(id => !byId.has(id)) : [];
  const checks = CHECK_IDS.map(id => {
    const definition = definitions[id] || null, textureKeys = new Set();
    if (definition) {
      const t = definition.textures;
      if (typeof t === 'string') textureKeys.add(t);
      else if (t && typeof t === 'object') Object.values(t).forEach(k => { if (typeof k === 'string') textureKeys.add(k); });
    }
    return { id, registry: byId.get(id) || null, resource: definition, terrain: Object.fromEntries([...textureKeys].sort().map(key => [key, terrain.texture_data?.[key] || null])) };
  });
  return {
    schema: 1,
    source: { repository: 'Mojang/bedrock-samples', release: 'v1.26.50.4', commit },
    registry: { topLevelKeys: Object.keys(registry).sort(), schemaSupported: supported, entryCount: entries.length, uniqueNames: byId.size, firstEntry: entries[0] || null },
    resources: { texturedCount: textured.length, resourceOnlyCount: supported ? resourceOnly.length : null, resourceOnlySample: resourceOnly.slice(0, 80) },
    checks
  };
}
export async function main(args) {
  if (args.length !== 2) throw new Error('Usage: node tools/audit-catalog-source.mjs SOURCE_DIRECTORY REPORT_JSON');
  const [directory, output] = args;
  const read = async path => parseJsonc(await readFile(resolve(directory, path), 'utf8'));
  const [definitions, registry, terrain] = await Promise.all([
    read('resource_pack/blocks.json'),
    read('metadata/vanilladata_modules/mojang-blocks.json'),
    read('resource_pack/textures/terrain_texture.json')
  ]);
  const commit = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const report = JSON.stringify(summarize(definitions, registry, terrain, commit), null, 2) + '\n';
  if (Buffer.byteLength(report, 'utf8') > 25000) throw new Error('Audit exceeds the repository file-size limit');
  await writeFile(resolve(output), report);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
