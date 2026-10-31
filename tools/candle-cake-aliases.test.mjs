import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {compileAliases} from '../catalog/identity.mjs';
import {duplicateRules} from '../catalog/rules/duplicates.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
const colors=['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'];
const variants=['candle_cake',...colors.map(color=>color+'_candle_cake')];
const read=name=>JSON.parse(readFileSync(new URL('../data/catalog-candidate/'+name,import.meta.url),'utf8'));
const blocks=Object.assign({},...Array.from({length:6},(_,i)=>read('blocks-'+String(i).padStart(3,'0')+'.json'))),terrain=read('terrain-000.json');
function selected(){return Object.fromEntries(['cake',...variants].map(id=>{assert.ok(Object.hasOwn(blocks,id),id);return [id,structuredClone(blocks[id])];}));}
function normalized(input){const plan=planModelAssignments(input);assert.deepEqual(plan.unresolved,[]);return Object.fromEntries(Object.entries(input).map(([id,definition])=>[id,normalizeBlock(id,definition,terrain,plan.assignments[id])]));}
test('seventeen pinned candle cakes become aliases of cake without losing indexed resources',()=>{
 const input=selected(),before=JSON.stringify(input),records=normalized(input),saved=JSON.stringify(records),identity=compileAliases(records,duplicateRules(input));
 assert.equal(Object.keys(records).length,18);assert.equal(Object.keys(identity.aliases).length,17);assert.deepEqual(identity.visible,['cake']);
 for(const id of variants){assert.equal(records[id].model,'cake');assert.equal(identity.aliases[id],'cake');assert.deepEqual(records[id].paths,records.cake.paths);assert.deepEqual(records[id].variants,records.cake.variants);}
 assert.equal(records.cake.paths.length,4);assert.equal(records.cake.variants.up.length,2);assert.equal(records.cake.variants.west.length,2);
 assert.equal(JSON.stringify(input),before);assert.equal(JSON.stringify(records),saved);
});
test('ordinary candles remain candles and unknown cake-like names are not admitted',()=>{
 const ids=['candle',...colors.map(color=>color+'_candle')],plan=planModelAssignments(Object.fromEntries(ids.map(id=>[id,{}])));
 assert.deepEqual(plan.unresolved,[]);assert.ok(Object.values(plan.assignments).every(row=>row.model==='candle'));assert.deepEqual(duplicateRules(Object.fromEntries(ids.map(id=>[id,{}]))),{});
 const unknown=['future_candle_cake','candle_cake_extra'];assert.deepEqual(planModelAssignments(Object.fromEntries(unknown.map(id=>[id,{}]))).unresolved,[...unknown].sort());
});
test('each candle cake refuses lossy merging of icons, model identity or variant order',()=>{
 for(const id of variants)for(const mutate of [r=>{r.icons=['textures/items/unique_fixture'];r.paths.push(r.icons[0]);},r=>{r.model='cross';},r=>{r.variants.west.reverse();}]) {
  const input=selected(),records=normalized(input);mutate(records[id]);assert.throws(()=>compileAliases(records,duplicateRules(input)),/Alias would lose model, state or resource/);
 }
});
test('missing cake and conflicting explicit duplicate targets fail explicitly',()=>{
 assert.throws(()=>duplicateRules({candle_cake:{}}),/Missing ordinary counterpart/);
 assert.throws(()=>duplicateRules({cake:{},candle_cake:{},other:{}},{candle_cake:{target:'other',reason:'conflict'}}),/Conflicting duplicate rule/);
});
