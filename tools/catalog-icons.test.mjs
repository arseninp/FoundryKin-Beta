import test from 'node:test';
import assert from 'node:assert/strict';
import {indexItems, resolveIcons} from '../catalog/items.mjs';
import {blockIconLinks} from '../catalog/rules/icons.mjs';
import {compiledSelection} from '../catalog/editor-selection.mjs';
const P = 'textures/items/';
function index(atlas) {
  function paths(v) {return typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(paths) : paths(v.path);}
  const inventory = Object.fromEntries(Object.values(atlas).flatMap(row => paths(row.textures)).map(path => [path, 1]));
  return indexItems(atlas, inventory);
}
test('atlas alternatives retain original indices while resource paths are unique', () => {
  const items = index({map: {textures: [P + 'a', P + 'a', {path: P + 'b'}]}});
  assert.deepEqual(items.map.paths, [P + 'a', P + 'b']);
  assert.deepEqual(items.map.variants, [P + 'a', P + 'a', P + 'b']);
  assert.deepEqual(resolveIcons(items, [{item: 'map', variant: 2}]), [P + 'b']);
});
test('bed links select a single color, including the silver naming convention', () => {
  const atlas = {bed: {textures: Array.from({length: 16}, (_, i) => P + 'bed_' + (i === 8 ? 'silver' : i))}};
  const links = blockIconLinks({white_bed: {}, light_gray_bed: {}, black_bed: {}}, atlas), items = index(atlas);
  assert.deepEqual(resolveIcons(items, links.light_gray_bed), [P + 'bed_silver']);
  assert.deepEqual(resolveIcons(items, links.black_bed), [P + 'bed_15']);
});
test('door and sign key exceptions are declared once; waxed links inherit later', () => {
  const atlas = Object.fromEntries(['copper_door', 'sign_darkoak_hanging', 'crimson_sign_item', 'comparator'].map(key => [key, {textures: P + key}]));
  const links = blockIconLinks({copper_door: {}, waxed_copper_door: {}, dark_oak_hanging_sign: {}, crimson_standing_sign: {}, unpowered_comparator: {}}, atlas);
  assert.deepEqual(links.dark_oak_hanging_sign, ['sign_darkoak_hanging']);
  assert.deepEqual(links.crimson_standing_sign, ['crimson_sign_item']);assert.equal(links.waxed_copper_door, undefined);
});
test('sprite resources outside the items directory are supported', () => {
  const items = index({shield: {textures: 'textures/entity/shield'}});
  assert.deepEqual(resolveIcons(items, ['shield']), ['textures/entity/shield']);assert.equal(items.shield.kind, 'sprite');
});
test('unknown links, missing images and invalid indices fail instead of disappearing', () => {
  assert.throws(() => blockIconLinks({cake: {}}, {}), /Missing item-atlas link/);
  assert.throws(() => indexItems({cake: {textures: P + 'cake'}}, {}), /Missing item resource/);
  const items = index({cake: {textures: P + 'cake'}});
  for (const refs of [['unknown'], [{item: 'cake', variant: -1}], [{item: 'cake', variant: 1}], [{item: 'cake', variant: '0'}], [{item: 'cake'}]]) assert.throws(() => resolveIcons(items, refs));
});
function editorRuntime(){
 const lower='textures/blocks/door_lower',icon='textures/entity/door_icon',upper='textures/items/model_surface',stateIcon='textures/items/lit_icon';
 const records={door:{paths:[lower,icon,upper],icons:[icon]},wall:{paths:[lower],icons:[]},lit_wall:{paths:[lower,stateIcon],icons:[stateIcon]},door_alias:{paths:[lower,icon,upper],icons:[icon]}};
 const catalog={records,families:{door:{native:'door',wall:'wall'}},stateRoutes:{wall:{card:'wall'},lit_wall:{card:'wall'}},stateGroups:{wall:{variants:{off:'wall',on:'lit_wall'}}}};
 const access={describe(id){if(!records[id])return null;const target=id==='door_alias'?'door':id;return {kind:'block',id:target,card:'door',form:target==='door'?'native':'wall'}}};
 const requests=[],runtime={catalog,access,resolve(request){
  requests.push({...request});
  const id=request.form==='wall'?(request.state?.powered==='on'?'lit_wall':'wall'):request.id,object=access.describe(id);
  const slot=request.slot??lower,sprite=request.view==='sprite';
  return {object,slot,mode:sprite?'sprite':'volume',modelResourcePaths:sprite?[slot]:[lower]};
 }};
 return {runtime,requests,lower,icon,upper,stateIcon};
}
test('editor icon intent follows declared roles, including family states and aliases',()=>{
 const f=editorRuntime();
 for(const request of [{id:'door',slot:f.icon},{id:'door_alias',slot:f.icon},{id:'door',form:'wall',state:{powered:'on'},slot:f.stateIcon}]){
  const before=JSON.stringify(request),selected=compiledSelection(f.runtime,request);
  assert.equal(f.requests.at(-1).view,'sprite');assert.equal(selected.plan.mode,'sprite');
  assert.deepEqual(selected.required,[request.slot]);assert.deepEqual(selected.editable,[request.slot]);assert.deepEqual(selected.borrowed,[]);
  assert.equal(JSON.stringify(request),before);
  if(request.id==='door_alias')assert.equal(selected.sourceId,'door_alias');
 }
});
test('editor selection returns to the model and never guesses icon roles from directories',()=>{
 const f=editorRuntime();compiledSelection(f.runtime,{id:'door',slot:f.icon});
 for(const request of [{id:'door'},{id:'door',slot:f.lower},{id:'door',slot:f.upper}]){
  const selected=compiledSelection(f.runtime,request);assert.equal(f.requests.at(-1).view,undefined);assert.equal(selected.plan.mode,'volume');
 }
 const request={id:'door',slot:f.icon,view:'model'},selected=compiledSelection(f.runtime,request);
 assert.equal(f.requests.at(-1).view,'model');assert.deepEqual(selected.required,[f.lower,f.icon]);
 assert.throws(()=>compiledSelection(f.runtime,{id:'door',slot:'textures/items/unowned'}),/outside the selected editor family/);
 assert.throws(()=>compiledSelection(f.runtime,{id:'missing',slot:f.icon}),/Unknown editor object/);
});
