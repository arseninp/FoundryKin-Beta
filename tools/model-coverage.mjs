/* Read-only report of model-policy coverage for the pinned candidate chunks. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {assembleChunks} from '../catalog/load.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
function threeDescriptor() {
 return {DoubleSide:2, BoxGeometry:class{}, PlaneGeometry:class{}, Mesh:class{}};
}
export function inspectCoverage(records, registry) {
 const assigned=new Map(),missing=new Map(),invalid=[];
 for(const id of Object.keys(records).sort()){
  const record=records[id];
  if(!record||typeof record.model!=='string'||!/^[a-z][a-z0-9_-]*$/.test(record.model)){invalid.push(id);continue;}
  const target=registry.has(record.model)?assigned:missing;
  if(!target.has(record.model))target.set(record.model,[]);target.get(record.model).push(id);
 }
 const sorted=map=>Object.fromEntries([...map].sort(([a],[b])=>a.localeCompare(b)));
 return {total:Object.keys(records).length,ready:missing.size===0&&invalid.length===0,assigned:sorted(assigned),missing:sorted(missing),invalid};
}
export function createModelCoverageReport(input, registry) {
 const plan=planModelAssignments(input.blocks), assigned=inspectCoverage(plan.assignments,registry);
 const report={source:input.source,counts:{total:Object.keys(input.blocks).length,assigned:Object.keys(plan.assignments).length,unresolved:plan.unresolved.length,registered:assigned.total-assigned.invalid.length-Object.values(assigned.missing).reduce((n,ids)=>n+ids.length,0),missingBuilders:Object.values(assigned.missing).reduce((n,ids)=>n+ids.length,0)},unresolved:plan.unresolved,missingBuilders:assigned.missing,invalid:assigned.invalid,decisions:plan.decisions};
 return report;
}
export function readCandidate(directory) {
 const manifest=JSON.parse(readFileSync(join(directory,'manifest.json'),'utf8'));
 if(manifest.schema!==1||manifest.source?.commit!=='46ba6ea985fb5a92d79a9419198f10dda14c199d'||!Array.isArray(manifest.files))throw new Error('Unexpected candidate manifest');
 const parts=manifest.files.filter(file=>file.name!=='report.json').map(file=>{
  const text=readFileSync(join(directory,file.name),'utf8');
  if(createHash('sha256').update(text).digest('hex')!==file.sha256)throw new Error('Candidate checksum mismatch: '+file.name);
  return {name:file.name,value:JSON.parse(text)};
 });
 return assembleChunks(manifest,parts);
}
export async function main(args) {
 const option=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:null;};
 const dir=option('--chunks');if(!dir)throw new Error('Use --chunks data/catalog-candidate [--out report.json]');
 const input=readCandidate(dir),{createModelLibrary}=await import('../models/library.mjs'),report=createModelCoverageReport(input,createModelLibrary(threeDescriptor())),text=JSON.stringify(report,null,1)+'\n';
 if(option('--out'))writeFileSync(option('--out'),text);else process.stdout.write(text);
 return report;
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
