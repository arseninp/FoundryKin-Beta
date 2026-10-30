import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
const IDS=['lilac','rose_bush','peony','tall_grass','large_fern'];
function setup(id) {
 const up='textures/blocks/fixture_'+id+'_top',down='textures/blocks/fixture_'+id+'_bottom';
 const front='textures/blocks/double_plant_sunflower_front',back='textures/blocks/double_plant_sunflower_back';
 const carried='textures/blocks/fixture_'+id+'_carried',icon='textures/items/fixture_'+id;
 const atlas={top:{textures:up},bottom:{textures:down},additional:{textures:[front,back]},carried:{textures:carried}};
 const definition={textures:{up:'top',down:'bottom',side:'additional'},carried_textures:'carried'};
 const inventory=Object.fromEntries([up,down,front,back,carried,icon].map(path=>[path,1]));
 const r=normalizeBlock(id,definition,atlas,{model:SPECIAL_MODELS[id],icons:[icon],existing:inventory});
 const catalog={schema:1,records:{[id]:r},items:{},aliases:{},families:{},resources:{}};
 const registry={get:model=>{assert.equal(model,'flower');return {scale:1.4,mode:'volume'};},build:(model,E)=>({model,bindings:E.bindings,slot:E.slot})};
 return {up,down,front,back,carried,icon,atlas,definition,r,catalog,resolve:createPreviewResolver(catalog,registry)};
}
for(const id of IDS)test(id+' resolves both halves without irrelevant side choices and keeps every resource editable',()=>{
 const s=setup(id),before=JSON.stringify(s.r);
 assert.equal(s.r.paths.length,6);assert.deepEqual(s.r.bindings,{up:[s.up],down:[s.down]});
 assert.deepEqual(s.r.faces.north,[s.front,s.back]);
 for(const slot of s.r.paths) {
  const p=s.resolve({id,slot});assert.equal(p.model,'flower');assert.equal(p.scale,1.4);assert.equal(p.slot,slot);
  assert.deepEqual(p.bindings,{up:s.up,down:s.down});assert.deepEqual(p.paths,s.r.paths);
  assert.deepEqual(p.build({}),{model:'flower',bindings:{up:s.up,down:s.down},slot});
 }
 assert.equal(JSON.stringify(s.r),before);
});
test('the old faces-only contract reproduces the explicit side variant failure rather than silently picking a path',()=>{
 const s=setup('rose_bush');delete s.r.bindings;assert.throws(()=>s.resolve({id:'rose_bush'}),/Explicit face variant required/);
});
test('missing, ambiguous and foreign halves are rejected instead of making an incomplete plant',()=>{
 const s=setup('large_fern');
 for(const change of [r=>{delete r.faces.down;},r=>{r.faces.up=[s.up,s.front];},r=>{r.paths=r.paths.filter(path=>path!==s.down);}]) {
  const r=structuredClone(s.r);change(r);assert.throws(()=>modelPartBindings(r),/Missing or ambiguous tall plant half/);
 }
});
test('indexed side resources remain intact even though only the two halves bind to geometry',()=>{
 const s=setup('tall_grass');s.atlas.additional.textures.push(s.back);
 const r=normalizeBlock('tall_grass',s.definition,s.atlas,{model:'flower'});
 assert.deepEqual(r.variants.north,[s.front,s.back,s.back]);assert.deepEqual(r.faces.north,[s.front,s.back]);
 assert.deepEqual(r.bindings,{up:[s.up],down:[s.down]});assert.ok(r.paths.includes(s.carried));
});
