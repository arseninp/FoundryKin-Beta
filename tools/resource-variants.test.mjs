import test from 'node:test';
import assert from 'node:assert/strict';
import {resourceVariants, resourcePaths, normalizeBlock, resourceSignature} from '../catalog/resources.mjs';
import {indexItems, resolveIcons} from '../catalog/items.mjs';
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
