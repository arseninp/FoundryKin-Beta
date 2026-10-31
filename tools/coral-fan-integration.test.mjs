import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {compileAliases} from '../catalog/identity.mjs';
import {duplicateRules} from '../catalog/rules/duplicates.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const blocks=read('blocks-000.json'),terrain=read('terrain-000.json');
const ids=['brain_coral_fan','brain_coral_wall_fan','bubble_coral_fan','bubble_coral_wall_fan'];
function selected(){return Object.fromEntries(ids.map(id=>[id,structuredClone(blocks[id])]));}
function normalized(input){const plan=planModelAssignments(input);assert.deepEqual(plan.unresolved,[]);return Object.fromEntries(Object.entries(input).map(([id,definition])=>[id,normalizeBlock(id,definition,terrain,plan.assignments[id])]));}
test('pinned brain and bubble definitions normalize and collapse to ordinary fan entries',()=>{
 const input=selected(),before=JSON.stringify(input),records=normalized(input),identity=compileAliases(records,duplicateRules(input));
 assert.deepEqual(identity.visible,['brain_coral_fan','bubble_coral_fan']);
 for(const kind of ['brain','bubble']) {
  const fan=kind+'_coral_fan',wall=kind+'_coral_wall_fan';
  assert.equal(records[fan].model,'cross');assert.equal(records[wall].model,'cross');assert.equal(identity.aliases[wall],fan);
  assert.deepEqual(records[wall].paths,records[fan].paths);
 }
 assert.equal(JSON.stringify(input),before);
});
test('all ten fan pairs share the ordinary cross assignment; unrelated names stay unresolved',()=>{
 const ids=['','dead_'].flatMap(prefix=>['tube','brain','bubble','fire','horn'].flatMap(kind=>[prefix+kind+'_coral_fan',prefix+kind+'_coral_wall_fan']));
 const plan=planModelAssignments(Object.fromEntries(ids.map(id=>[id,{}])));assert.deepEqual(plan.unresolved,[]);assert.ok(Object.values(plan.assignments).every(row=>row.model==='cross'));
 assert.deepEqual(planModelAssignments({future_coral_fan:{},brain_coral_wall_fan_extra:{}}).unresolved,['brain_coral_wall_fan_extra','future_coral_fan']);
});
test('alias safety still rejects a unique wall resource, different model or changed indexed variants',()=>{
 for(const mutate of [r=>{r.icons=['textures/items/unique_fixture'];r.paths.push(r.icons[0]);},r=>{r.model='cube';},r=>{r.variants.up.push(r.variants.up[0]);}]) {
  const input=selected(),records=normalized(input);mutate(records.brain_coral_wall_fan);
  assert.throws(()=>compileAliases(records,duplicateRules(input)),/Alias would lose model, state or resource/);
 }
});
