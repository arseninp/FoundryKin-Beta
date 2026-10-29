/* Read-only report: node tools/catalog-audit.mjs --chunks data/catalog-candidate | --raw <folder> [--out file] */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {assembleChunks, fromRawFiles, parseLooseJson} from '../catalog/load.mjs';
import {auditCatalog} from '../catalog/audit.mjs';
const args = process.argv.slice(2), option = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
let input;
if (option('--chunks')) {
  const dir = option('--chunks'), manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  const parts = manifest.files.filter(file => file.name !== 'report.json').map(file => {
    const text = readFileSync(join(dir, file.name), 'utf8');
    if (createHash('sha256').update(text).digest('hex') !== file.sha256) throw new Error('Checksum mismatch: ' + file.name);
    return {name: file.name, value: JSON.parse(text)};
  });
  input = assembleChunks(manifest, parts);
} else if (option('--raw')) {
  const dir = option('--raw'), read = name => parseLooseJson(readFileSync(join(dir, name), 'utf8'));
  let flipbook = [];
  try { flipbook = read('flipbook_textures.json'); } catch {}
  input = fromRawFiles({blocks: read('blocks.json'), terrain: read('terrain_texture.json'), flipbook});
} else throw new Error('Use --chunks <folder> or --raw <folder>');
const text = JSON.stringify(auditCatalog(input), null, 1);
if (option('--out')) writeFileSync(option('--out'), text + '\n'); else process.stdout.write(text + '\n');
