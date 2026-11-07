import test from 'node:test';
import assert from 'node:assert/strict';
import {resourceVariants, resourcePaths, normalizeBlock, resourceSignature} from '../catalog/resources.mjs';
import {indexItems, resolveIcons} from '../catalog/items.mjs';
import {aquaticBindings} from '../catalog/rules/aquatic-parts.mjs';
const a='textures/blocks/a', b='textures/blocks/b';
test('repeated alternatives keep every original index while file paths remain unique',()=>{
 const value=[a,a,{path:b}];
 assert.deepEqual(resourceVariants(value),[a,a,b]);assert.deepEqual(resourcePaths(value),[a,b]);
 const record=normalizeBlock('crop',{textures:'crop'},{crop:{textures:value}},{model:'cross'});
 assert.deepEqual(record.variants.up,[a,a,b]);assert.deepEqual(record.faces.up,[a,b]);assert.deepEqual(record.paths,[a,b]);
});
test('face variants and carried variants retain independent sequences without source mutation',()=>{
 const atlas={top:{textures:[a,b,b]},side:{textures:[b,a,a]},icon:{textures:[a,a,b]}},before=JSON.stringify(atlas);
 const record=normalizeBlock('crop',{textures:{up:'top',down:'top',side:'side'},carried_textures:'icon'},atlas);
 assert.deepEqual(record.variants.up,[a,b,b]);assert.deepEqual(record.variants.north,[b,a,a]);assert.deepEqual(record.carriedVariants.up,[a,a,b]);
 record.variants.up.push(a);assert.deepEqual(record.variants.down,[a,b,b]);assert.deepEqual(record.faces.up,[a,b]);assert.equal(JSON.stringify(atlas),before);
});
test('duplicate safety checks distinguish equal PNG sets with different variant sequences',()=>{
 const atlas={first:{textures:[a,a,b]},second:{textures:[a,b]}},opts={model:'cross'};
 const x=normalizeBlock('x',{textures:'first'},atlas,opts),y=normalizeBlock('y',{textures:'second'},atlas,opts);
 assert.deepEqual(x.paths,y.paths);assert.notEqual(resourceSignature(x),resourceSignature(y));
});
test('block and item parsers agree, including nested path-object alternatives',()=>{
 const value={path:[a,a,{path:b}]},atlas={crop:{textures:value}},items=indexItems(atlas,{[a]:1,[b]:1});
 const block=normalizeBlock('crop',{textures:'crop'},atlas);
 assert.deepEqual(items.crop.variants,block.variants.up);
 assert.deepEqual(resolveIcons(items,[{item:'crop',variant:2}]),[b]);
});
test('door assignments select their own halves without retaining other woods',()=>{
 const atlas={door_lower:{textures:['textures/blocks/door_wood_lower','textures/blocks/door_iron_lower']},door_upper:{textures:['textures/blocks/door_wood_upper','textures/blocks/door_iron_upper']}};
 const r=normalizeBlock('iron_door',{textures:{up:'door_lower',down:'door_lower',side:'door_upper'}},atlas);
 assert.deepEqual(r.variants.up,['textures/blocks/door_iron_lower']);assert.equal(r.paths.length,2);
});
test('unsafe paths and unsupported variant structures still fail closed',()=>{
 for(const value of ['textures/../secret',null,{},[a,{weight:1}]])assert.throws(()=>resourceVariants(value));
});
function bubbleFixture() {
 const definition={isotropic:false,textures:{up:'bubble_column_up_top',down:'bubble_column_down_top',north:'bubble_column_outer',south:'bubble_column_mid',east:'pumpkin_side',west:'pumpkin_side'}},atlas={},expected={};
 for(const [part,key,count] of [['up_top','bubble_column_up_top',4],['down_top','bubble_column_down_top',4],['outer','bubble_column_outer',8],['inner','bubble_column_mid',2]]) {
  const paths=Array.from({length:count},(_,index)=>'textures/blocks/bubble_column_'+part+'_'+String.fromCharCode(97+index));
  atlas[key]={textures:paths};
  for(const [index,path] of paths.entries())expected[part+'_'+String.fromCharCode(97+index)]=[path];
 }
 atlas.pumpkin_side={textures:'textures/blocks/pumpkin_side'};
 const existing=Object.fromEntries(Object.values(atlas).flatMap(row=>resourcePaths(row.textures)).map(path=>[path,1]));
 return {definition,atlas,existing,expected};
}
test('bubble column normalization declares 18 owned roles without losing source variants',()=>{
 const f=bubbleFixture(),before=JSON.stringify(f),record=normalizeBlock('bubble_column',f.definition,f.atlas,{model:'bubble_column',existing:f.existing});
 assert.deepEqual(record.bindings,f.expected);assert.equal(Object.keys(record.bindings).length,18);assert.equal(record.paths.length,19);
 assert.deepEqual(record.variants.up,f.atlas.bubble_column_up_top.textures);assert.deepEqual(record.variants.down,f.atlas.bubble_column_down_top.textures);
 assert.deepEqual(record.variants.north,f.atlas.bubble_column_outer.textures);assert.deepEqual(record.variants.south,f.atlas.bubble_column_mid.textures);
 assert.deepEqual(record.faces.east,['textures/blocks/pumpkin_side']);assert.deepEqual(record.faces.west,record.faces.east);
 assert.ok(!Object.values(record.bindings).flat().includes('textures/blocks/pumpkin_side'));assert.equal(JSON.stringify(f),before);
 const saved=JSON.stringify(record.variants);record.bindings.outer_a[0]='textures/blocks/changed';assert.equal(JSON.stringify(record.variants),saved);
 assert.deepEqual(aquaticBindings(record),f.expected);
});
test('bubble column roles reject wrong identities, reordered, missing and unowned resources',()=>{
 for(const mutate of [record=>{record.id='other';},record=>{record.variants.north.pop();},record=>{record.variants.up.reverse();},record=>{delete record.variants.south[0];},record=>{record.variants.north[0]='textures/blocks/pumpkin_side';},record=>{record.paths=record.paths.filter(path=>path!==record.variants.down[0]);}]) {
  const f=bubbleFixture(),record=normalizeBlock('bubble_column',f.definition,f.atlas,{model:'bubble_column',existing:f.existing});
  mutate(record);assert.throws(()=>aquaticBindings(record),/bubble column/);
 }
 const f=bubbleFixture();delete f.existing[f.atlas.bubble_column_outer.textures[0]];
 assert.throws(()=>normalizeBlock('bubble_column',f.definition,f.atlas,{model:'bubble_column',existing:f.existing}),/Missing resource file/);
});
test('bubble column resources do not implicitly assign a model or rewrite atlas metadata',()=>{
 const f=bubbleFixture();f.atlas.bubble_column_outer.textures=f.atlas.bubble_column_outer.textures.map(path=>({path}));
 const before=JSON.stringify(f),record=normalizeBlock('bubble_column',f.definition,f.atlas,{existing:f.existing});
 assert.equal(record.model,null);assert.ok(!Object.hasOwn(record,'bindings'));assert.equal(aquaticBindings(record),null);
 assert.equal(record.variants.north.length,8);assert.equal(JSON.stringify(f),before);
});
test('bubble column sprite retains all owned roles and original variants',()=>{
 const f=bubbleFixture(),before=JSON.stringify(f),record=normalizeBlock('bubble_column',f.definition,f.atlas,{model:'sprite',existing:f.existing});
 assert.equal(record.model,'sprite');assert.deepEqual(record.bindings,f.expected);assert.equal(record.paths.length,19);
 for(const [face,key] of [['up','bubble_column_up_top'],['down','bubble_column_down_top'],['north','bubble_column_outer'],['south','bubble_column_mid']])assert.deepEqual(record.variants[face],f.atlas[key].textures);
 assert.equal(JSON.stringify(f),before);
});
test('indexed oak and stone primitives bind named materials without losing alternatives',()=>{
 const faces=['up','down','north','south','east','west'],wood=['planks_oak','planks_spruce','planks_birch','planks_jungle','planks_acacia','planks_big_oak'],stone=['stone','stone_granite','stone_granite_smooth','stone_diorite','stone_diorite_smooth','stone_andesite','stone_andesite_smooth'];
 for(const [id,model,names] of [['wooden_button','button',wood],['wooden_pressure_plate','plate',wood],['stone_button','button',stone],['stone_pressure_plate','plate',stone]]) {
  const paths=names.map(name=>'textures/blocks/'+name),definition={textures:'shared'},atlas={shared:{textures:paths}},existing=Object.fromEntries(paths.map(path=>[path,1])),before=JSON.stringify({definition,atlas,existing});
  const record=normalizeBlock(id,definition,atlas,{model,existing});
  assert.deepEqual(record.paths,[...paths].sort());
  for(const face of faces){assert.deepEqual(record.variants[face],paths);assert.deepEqual(record.faces[face],paths);assert.deepEqual(record.bindings[face],[paths[0]]);}
  const saved=JSON.stringify(record.variants);record.bindings.up[0]=paths[1];assert.equal(JSON.stringify(record.variants),saved);
  assert.equal(JSON.stringify({definition,atlas,existing}),before);
  assert.throws(()=>normalizeBlock(id,definition,{shared:{textures:paths.slice(1)}},{model,existing}),/Incomplete indexed primitive/);
  assert.throws(()=>normalizeBlock(id,definition,{shared:{textures:[paths[1],...paths.slice(1)]}},{model,existing}),/Missing or ambiguous/);
  const absent={...existing};delete absent[paths[0]];assert.throws(()=>normalizeBlock(id,definition,atlas,{model,existing:absent}),/Missing resource file/);
  assert.ok(!Object.hasOwn(normalizeBlock(id,definition,atlas,{model:'cube',existing}),'bindings'));
 }
});
