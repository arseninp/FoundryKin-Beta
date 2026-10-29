import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createModelCoverageReport, readCandidate, main} from './model-coverage.mjs';
import {compileModelCatalog, inspectModelCoverage} from '../models/library.mjs';
import {inspectCoverage} from './model-coverage.mjs';
const PIN='46ba6ea985fb5a92d79a9419198f10dda14c199d';
function fixture() {
 const dir=mkdtempSync(join(tmpdir(),'fk-coverage-'));
 const docs=[['blocks-000.json',{stone:{textures:'stone'}}],['terrain-000.json',{stone:{textures:'textures/blocks/stone'}}],['existing-000.json',{'textures/blocks/stone':1}],['auxiliary-000.json',{}]];
 const files=docs.map(([name,value])=>{const text=JSON.stringify(value)+'\n';writeFileSync(join(dir,name),text);return {name,sha256:createHash('sha256').update(text).digest('hex')};});
 writeFileSync(join(dir,'manifest.json'),JSON.stringify({schema:1,source:{commit:PIN},counts:{blocks:1,terrain:1,existing:1},files}));
 return dir;
}
const Three={DoubleSide:2,BoxGeometry:class{},PlaneGeometry:class{},Mesh:class{}};
test('coverage uses the library function and honours explicit model assignments',()=>{
 assert.equal(inspectCoverage,inspectModelCoverage);
 const input={blocks:{mystery:{textures:'stone'}},models:{mystery:{model:'cube'}}};
 const report=createModelCoverageReport(input,{has:id=>id==='cube'});
 assert.equal(report.counts.registered,1);assert.deepEqual(report.unresolved,[]);
});
test('wrong source commit is rejected independently of valid file checksums',()=>{
 const dir=fixture();try {
  const path=join(dir,'manifest.json'),manifest=JSON.parse(readFileSync(path,'utf8'));
  manifest.source.commit='0'.repeat(40);writeFileSync(path,JSON.stringify(manifest));
  assert.throws(()=>readCandidate(dir),/Unexpected candidate manifest/);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('changed data, unsafe filenames and duplicate parts are rejected',()=>{
 for(const mode of ['checksum','path','duplicate']) {
  const dir=fixture();try {
   const path=join(dir,'manifest.json'),manifest=JSON.parse(readFileSync(path,'utf8'));
   if(mode==='checksum')writeFileSync(join(dir,'blocks-000.json'),'{}');
   if(mode==='path')manifest.files[0].name='../blocks-000.json';
   if(mode==='duplicate')manifest.files.push(manifest.files[0]);
   writeFileSync(path,JSON.stringify(manifest));assert.throws(()=>readCandidate(dir));
  } finally {rmSync(dir,{recursive:true,force:true});}
 }
});
test('loaded candidate and raw-shaped item atlas pass the actual compiler boundary',()=>{
 const dir=fixture();try {
  const input=readCandidate(dir),before=JSON.stringify(input);
  const result=compileModelCatalog({...input,items:{texture_data:{}}},Three);
  assert.deepEqual(result.catalog.cards,['stone']);assert.equal(result.coverage.ready,true);
  assert.equal(JSON.stringify(input),before);
  const flat=compileModelCatalog({...input,terrain:input.terrain.texture_data},Three);
  assert.deepEqual(flat.catalog,result.catalog);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
test('complete CLI main loads real model registrations and writes the requested report',async()=>{
 const dir=fixture();try {
  const out=join(dir,'coverage.json');const report=await main(['--chunks',dir,'--out',out]);
  assert.equal(report.counts.registered,1);assert.deepEqual(JSON.parse(readFileSync(out,'utf8')),report);
  await assert.rejects(main(['--chunks',dir,'--out']),/Use --chunks/);
  await assert.rejects(main(['--chunks',dir,'--chunks',dir]),/Use --chunks/);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
