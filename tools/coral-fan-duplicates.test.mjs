import test from 'node:test';
import assert from 'node:assert/strict';
import {duplicateRules} from '../catalog/rules/duplicates.mjs';
const pairs=['','dead_'].flatMap(prefix=>['tube','brain','bubble','fire','horn'].map(kind=>[prefix+kind+'_coral_wall_fan',prefix+kind+'_coral_fan']));
const objects=ids=>Object.fromEntries(ids.map(id=>[id,{}]));
test('all ten approved wall fans route to ordinary fans without altering input',()=>{
 const blocks=objects(pairs.flat()),before=JSON.stringify(blocks),rules=duplicateRules(blocks);
 assert.equal(Object.keys(rules).length,10);
 for(const [wall,fan] of pairs){assert.equal(rules[wall].target,fan);assert.ok(rules[wall].reason);assert.equal(Object.hasOwn(rules,fan),false);}
 assert.equal(JSON.stringify(blocks),before);
});
test('missing ordinary fan is an explicit error, not a dangling hidden record',()=>{
 for(const [wall] of pairs)assert.throws(()=>duplicateRules(objects([wall])),/Missing ordinary counterpart/);
});
test('ordinary coral plants and unapproved names are not merged from shared textures',()=>{
 const ids=['brain_coral','dead_brain_coral','future_coral_wall_fan','brain_coral_wall_fan_extra','brain_coral_fan'];
 const blocks=Object.fromEntries(ids.map(id=>[id,{textures:'same_fixture'}]));
 assert.deepEqual(duplicateRules(blocks),{});
});
test('explicit rules cannot redirect an approved wall fan to another ordinary fan',()=>{
 const [wall,fan]=pairs[0],other='brain_coral_fan',blocks=objects([wall,fan,other]);
 assert.throws(()=>duplicateRules(blocks,{[wall]:{target:other,reason:'conflict'}}),/Conflicting duplicate rule/);
 assert.equal(duplicateRules(blocks,{[wall]:{target:fan,reason:'explicit equivalent'}})[wall].target,fan);
});
test('waxed, infested and cycle checks remain unchanged',()=>{
 const blocks=objects(['stone','infested_stone','copper_block','waxed_copper']);
 const rules=duplicateRules(blocks);assert.equal(rules.infested_stone.target,'stone');assert.equal(rules.waxed_copper.target,'copper_block');
 assert.throws(()=>duplicateRules(objects(['a','b']),{a:{target:'b',reason:'a'},b:{target:'a',reason:'b'}}),/Duplicate rule cycle/);
});
