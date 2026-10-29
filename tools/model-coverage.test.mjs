import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createModelCoverageReport,readCandidate} from './model-coverage.mjs';
function candidate(){
 const dir=mkdtempSync(join(tmpdir(),'fk-model-coverage-'));
 const docs=[['blocks-000.json',{stone:{textures:'stone'},oak_slab:{textures:'oak'},mystery:{textures:'x'},piston:{textures:'x'}}],['terrain-000.json',{stone:{textures:'textures/blocks/stone'},oak:{textures:'textures/blocks/oak'},x:{textures:'textures/blocks/x'}}],['existing-000.json',{'textures/blocks/stone':1}],['auxiliary-000.json',{}]];
 const files=docs.map(([name,value])=>{const text=JSON.stringify(value)+'\n';writeFileSync(join(dir,name),text);return {name,sha256:createHash('sha256').update(text).digest('hex')};});
 writeFileSync(join(dir,'manifest.json'),JSON.stringify({schema:1,source:{commit:'46ba6ea985fb5a92d79a9419198f10dda14c199d'},counts:{blocks:4,terrain:3,existing:1},files}));
 return dir;
}
test('coverage lists unresolved objects and named missing builders; never falls back',()=>{
 const dir=candidate();try{
  const input=readCandidate(dir),report=createModelCoverageReport(input,{has:id=>['cube','slab','stairs','gate','plate','cross'].includes(id)});
  assert.equal(report.counts.total,4);assert.equal(report.counts.assigned,3);assert.equal(report.counts.unresolved,1);
  assert.deepEqual(report.unresolved,['mystery']);assert.deepEqual(report.missingBuilders,{piston:['piston']});assert.deepEqual(report.invalid,[]);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('candidate checksum and pinned source are required',()=>{
 const dir=candidate();try{
  writeFileSync(join(dir,'blocks-000.json'),'{}\n');assert.throws(()=>readCandidate(dir),/checksum/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
