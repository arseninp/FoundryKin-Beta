import test from 'node:test';
import assert from 'node:assert/strict';
import {auditModelInputs,auditCatalog} from '../catalog/audit.mjs';
const P='textures/blocks/';
function fixture(){return {blocks:{stone:{textures:'stone'}},terrain:{stone:{textures:P+'stone'}},existing:{[P+'stone']:1}};}
test('assigned inputs use the real normalizer, accept both atlas forms and remain unchanged',()=>{
 const input=fixture(),plan={stone:{model:'cube'}},before=JSON.stringify({input,plan});
 const flat=auditModelInputs(input,plan),wrapped=auditModelInputs({...input,terrain:{texture_data:input.terrain}},plan);
 assert.equal(flat.status,'checked');assert.deepEqual(flat.counts,{total:1,checked:1,passed:1,failed:0});assert.deepEqual(flat.errors,[]);assert.deepEqual(wrapped,flat);
 assert.equal(JSON.stringify({input,plan}),before);
 assert.deepEqual(auditCatalog({blocks:input.blocks,terrain:{texture_data:input.terrain},existing:input.existing}).missingFiles,[]);
});
test('missing keys, files, named stage sequences and dependencies are reported together',()=>{
 const input=fixture();Object.assign(input.blocks,{bad_key:{textures:'absent'},bad_file:{textures:'missing_file'},bad_sequence:{textures:'empty'},unpowered_repeater:{textures:'stone'}});
 Object.assign(input.terrain,{missing_file:{textures:P+'absent'},empty:{textures:[]}});input.existing[P+'redstone_torch_on']=1;
 const plan={stone:{model:'cube'},bad_key:{model:'cube'},bad_file:{model:'cube'},bad_sequence:{model:'stage_cross'},unpowered_repeater:{model:'repeater'}},before=JSON.stringify({input,plan}),r=auditModelInputs(input,plan);
 assert.deepEqual(r.counts,{total:5,checked:5,passed:1,failed:4});
 assert.deepEqual(r.errors.map(e=>[e.id,e.phase]),[['bad_file','normalize'],['bad_key','normalize'],['bad_sequence','normalize'],['unpowered_repeater','dependencies']]);
 assert.match(r.errors[0].message,/Missing resource file/);assert.match(r.errors[1].message,/Unresolved texture key/);assert.match(r.errors[2].message,/staged cross sequence/);assert.match(r.errors[3].message,/Missing dependency resource/);
 assert.equal(JSON.stringify({input,plan}),before);
});
test('explicit shared resources use the existing dependency checks without deduplicating ambiguity',()=>{
 const input=fixture(),plan={stone:{model:'cube'}};input.dependencies={stone:{detail:[P+'shared',P+'shared']}};input.existing[P+'shared']=1;
 assert.match(auditModelInputs(input,plan).errors[0].message,/Ambiguous dependency/);
 input.dependencies.stone.detail=P+'shared';assert.equal(auditModelInputs(input,plan).counts.passed,1);
 delete input.existing[P+'shared'];assert.equal(auditModelInputs(input,plan).errors[0].phase,'dependencies');
});
test('absent data is explicitly not checked and malformed supplied inputs are rejected',()=>{
 const plan={stone:{model:'cube'}},r=auditModelInputs({blocks:{stone:{}}},plan);
 assert.equal(r.status,'not-checked');assert.deepEqual(r.counts,{total:1,checked:0,passed:0,failed:0});
 for(const change of [{existing:null},{terrain:{texture_data:null}},{dependencies:[]}])assert.throws(()=>auditModelInputs({...fixture(),...change},plan),/Invalid model audit/);
 const invalid=auditModelInputs(fixture(),{stone:{model:null},unknown:{model:'cube'}});assert.ok(invalid.errors.every(e=>e.phase==='assignment'));assert.equal(invalid.counts.failed,2);
});
