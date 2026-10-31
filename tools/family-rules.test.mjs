import test from 'node:test';
import assert from 'node:assert/strict';
import {familyRules} from '../catalog/rules/forms.mjs';
// Minimal record fixtures exercise the pure policy, not full compilation or rendering.
function records() {
 return {
  bamboo:{model:'bamboo'},bamboo_sapling:{model:'cross'},
  torchflower:{model:'cross',paths:['textures/blocks/torchflower']},
  torchflower_crop:{model:'stage_cross',bindings:{stage_0:['textures/blocks/torchflower_crop_stage_0'],stage_1:['textures/blocks/torchflower_crop_stage_1']}}
 };
}
test('approved bamboo and torchflower forms are declared without changing source records or crop stages',()=>{
 const input=records(),before=JSON.stringify(input),result=familyRules(input);
 assert.equal(Object.getPrototypeOf(result),null);assert.deepEqual(Object.keys(result).sort(),['bamboo','torchflower']);
 assert.deepEqual(result.bamboo,{shoot:'bamboo_sapling'});assert.deepEqual(result.torchflower,{crop:'torchflower_crop'});
 assert.equal(input.torchflower.model,'cross');assert.equal(input.torchflower_crop.model,'stage_cross');assert.equal(Object.keys(input.torchflower_crop.bindings).length,2);assert.equal(JSON.stringify(input),before);
});
test('a default family is emitted only when both exact source IDs are present',()=>{
 for(const missing of Object.keys(records())) {
  const input=records();delete input[missing];const result=familyRules(input),family=missing.startsWith('bamboo')?'bamboo':'torchflower',other=family==='bamboo'?'torchflower':'bamboo';
  assert.equal(Object.hasOwn(result,family),false);assert.ok(Object.hasOwn(result,other));
 }
 assert.deepEqual(Object.keys(familyRules({})),[]);
});
test('frozen source metadata stays unchanged and returned rules cannot modify approved declarations',()=>{
 const input=records();Object.freeze(input.torchflower_crop.bindings.stage_0);Object.freeze(input.torchflower_crop.bindings.stage_1);Object.freeze(input.torchflower_crop.bindings);Object.freeze(input.torchflower_crop);Object.freeze(input);
 const before=JSON.stringify(input),first=familyRules(input);first.torchflower.crop='wrong';first.bamboo.shoot='wrong';
 assert.equal(familyRules(input).torchflower.crop,'torchflower_crop');assert.equal(familyRules(input).bamboo.shoot,'bamboo_sapling');assert.equal(JSON.stringify(input),before);
});
test('explicit identical rules and extra forms are copied while defaults remain present',()=>{
 const input=records(),explicit={torchflower:{crop:'torchflower_crop',custom:'custom_flower'},bamboo:{shoot:'bamboo_sapling'}},before=JSON.stringify(explicit),result=familyRules(input,explicit);
 assert.equal(result.torchflower.crop,'torchflower_crop');assert.equal(result.torchflower.custom,'custom_flower');assert.equal(result.bamboo.shoot,'bamboo_sapling');
 result.torchflower.custom='changed';assert.equal(JSON.stringify(explicit),before);
});
test('conflicting defaults and malformed policy input fail explicitly',()=>{
 const input=records();
 assert.throws(()=>familyRules(input,{torchflower:{crop:'torchflower'}}),/Conflicting family form: torchflower:crop/);
 assert.throws(()=>familyRules(input,{bamboo:{shoot:'torchflower_crop'}}),/Conflicting family form: bamboo:shoot/);
 for(const bad of [null,[],false,'bad']){assert.throws(()=>familyRules(bad),/Invalid family rule input/);assert.throws(()=>familyRules(input,bad),/Invalid family rule input/);assert.throws(()=>familyRules(input,{torchflower:bad}),/Invalid family forms/);}
});
test('shared PNGs and lookalike names never authorize a guessed family',()=>{
 const input=records();input.future_torchflower_crop=input.torchflower_crop;input.future_bamboo_sapling=input.bamboo_sapling;delete input.torchflower_crop;delete input.bamboo_sapling;
 input.torchflower.paths=['textures/blocks/shared'];input.future_torchflower_crop.paths=['textures/blocks/shared'];
 assert.deepEqual(Object.keys(familyRules(input)),[]);
});
