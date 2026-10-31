/* Read-only by default; --out explicitly writes the requested report. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assembleChunks} from '../catalog/load.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {auditModelInputs} from '../catalog/audit.mjs';
import {createModelLibrary, inspectModelCoverage} from '../models/library.mjs';
const PIN = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
export {inspectModelCoverage as inspectCoverage};
export function createModelCoverageReport(input, registry) {
 const plan = planModelAssignments(input.blocks, input.models ?? {});
 const coverage = inspectModelCoverage(plan.assignments, registry);
 const missing = Object.values(coverage.missing).reduce((n, ids) => n + ids.length, 0);
 return {source: input.source, counts: {total: Object.keys(input.blocks).length, assigned: Object.keys(plan.assignments).length, unresolved: plan.unresolved.length, registered: coverage.total - coverage.invalid.length - missing, missingBuilders: missing}, unresolved: plan.unresolved, missingBuilders: coverage.missing, invalid: coverage.invalid, decisions: plan.decisions, inputValidation: auditModelInputs(input, plan.assignments)};
}
export function readCandidate(directory) {
 const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
 if (manifest.schema !== 1 || manifest.source?.commit !== PIN || !Array.isArray(manifest.files)) throw new Error('Unexpected candidate manifest');
 const seen = new Set();
 const parts = manifest.files.filter(file => file.name !== 'report.json').map(file => {
  if (typeof file.name !== 'string' || !/^(blocks|terrain|existing|auxiliary)-[0-9]+\.json$/.test(file.name) || seen.has(file.name)) throw new Error('Invalid candidate filename');
  seen.add(file.name);
  const text = readFileSync(join(directory, file.name), 'utf8');
  if (createHash('sha256').update(text).digest('hex') !== file.sha256) throw new Error('Candidate checksum mismatch: ' + file.name);
  return {name: file.name, value: JSON.parse(text)};
 });
 return assembleChunks(manifest, parts);
}
export async function main(args) {
 const options = new Map();
 for (let index = 0; index < args.length; index += 2) {
  const key = args[index], value = args[index + 1];
  if (!['--chunks', '--out'].includes(key) || options.has(key) || typeof value !== 'string' || !value || value.startsWith('--')) throw new Error('Use --chunks DIRECTORY [--out FILE]');
  options.set(key, value);
 }
 if (!options.has('--chunks')) throw new Error('Use --chunks DIRECTORY [--out FILE]');
 const Three = {DoubleSide: 2, BoxGeometry: class {}, PlaneGeometry: class {}, Mesh: class {}};
 const report = createModelCoverageReport(readCandidate(options.get('--chunks')), createModelLibrary(Three));
 const text = JSON.stringify(report, null, 1) + '\n';
 if (options.has('--out')) writeFileSync(options.get('--out'), text);
 else process.stdout.write(text);
 return report;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main(process.argv.slice(2)).catch(error => {console.error(error.message);process.exitCode = 1;});
