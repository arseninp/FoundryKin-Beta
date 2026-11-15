import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompiledModelFixture} from './compiled-model-fixture.mjs';
let runtime;const full=()=>runtime??=createCompiledModelFixture();
test('all pumpkin resources belong to one explicit state card without deleting source records',()=>{
 const r=full(),ids=['pumpkin','carved_pumpkin','lit_pumpkin'],group=r.catalog.stateGroups.pumpkin;
 assert.ok(group);assert.equal(group.parameter,'variant');assert.deepEqual({...group.variants},{plain:'pumpkin',carved:'carved_pumpkin',lit:'lit_pumpkin'});
 for(const id of ids){assert.ok(r.catalog.records[id]);assert.equal(r.access.describe(id).card,'pumpkin');for(const path of r.catalog.records[id].paths)assert.ok(group.paths.includes(path));}
 assert.ok(r.catalog.cards.includes('pumpkin'));assert.ok(!r.catalog.cards.includes('carved_pumpkin'));assert.ok(!r.catalog.cards.includes('lit_pumpkin'));
});
test('a carved-only catalog preserves both source records rather than inventing an incomplete state group',()=>{
 const r=createCompiledModelFixture(['carved_pumpkin','lit_pumpkin']);assert.equal(r.catalog.stateGroups.pumpkin,undefined);
 for(const id of ['carved_pumpkin','lit_pumpkin']){const p=r.resolve({id});assert.equal(p.object.id,id);assert.ok(r.catalog.cards.includes(p.object.card));assert.ok(p.paths.length);assert.ok(r.render({id}).meshes.length);}
});
test('plain trapdoor uses the registered trapdoor model and declared family metadata',()=>{
 const r=full(),object=r.access.describe('trapdoor');assert.ok(object);assert.equal(r.catalog.records[object.id].model,'trapdoor');
 const plan=r.resolve({id:'trapdoor'});assert.equal(plan.model,'trapdoor');assert.ok(r.render({id:'trapdoor'}).meshes.length);
 if(Object.hasOwn(r.catalog.families,object.card))assert.equal(r.catalog.families[object.card][object.form],object.id);else assert.equal(object.form,'native');
 assert.notEqual(r.access.describe('stone').card,object.card);
});
test('sunflower has one registered geometry implementation',()=>{
 const r=full();assert.equal(r.registry.ids().filter(id=>id==='sunflower').length,1);assert.equal(r.catalog.records.sunflower.model,'sunflower');
 assert.throws(()=>r.registry.register([{id:'sunflower',build(){}}]),/sealed/);assert.ok(r.render({id:'sunflower'}).meshes.length>0);
});
