import test from 'node:test';
import assert from 'node:assert/strict';
import {LEAF_REVIEW_BLOCKS} from '../preview-leaf-data.mjs';
import {createPreviewControls} from '../preview-controls.mjs';
const TEXT={en:{texture:'Texture'},ru:{texture:'Текстура'}},controls=createPreviewControls(TEXT),catalog={};
const IDS=LEAF_REVIEW_BLOCKS.map(([id])=>id);
function plan(id,state={}){const paths=['textures/blocks/cutout_fixture','textures/blocks/opaque_fixture','textures/blocks/carried_fixture'];return {model:'cube',object:{id,card:id},state,paths,slot:paths[0],forms:null};}
test('leaf review data declares exactly 14 immutable distinct source IDs with EN/RU labels',()=>{
 assert.equal(LEAF_REVIEW_BLOCKS.length,14);assert.ok(Object.isFrozen(LEAF_REVIEW_BLOCKS));
 assert.equal(new Set(IDS).size,14);
 for(const row of LEAF_REVIEW_BLOCKS){assert.ok(Object.isFrozen(row));assert.equal(row.length,3);assert.match(row[0],/^[a-z0-9_]+$/);assert.ok(row[1].trim());assert.match(row[2],/[А-Яа-яЁё]/);}
});
test('leaf review data retains legacy and colored source identities',()=>{
 const expected='oak_leaves spruce_leaves birch_leaves jungle_leaves acacia_leaves dark_oak_leaves cherry_leaves pale_oak_leaves mangrove_leaves azalea_leaves azalea_leaves_flowered orange_poplar_leaves red_poplar_leaves yellow_poplar_leaves'.split(' ');
 assert.deepEqual(IDS,expected);for(const id of ['big_oak_leaves','flowering_azalea_leaves','poplar_leaves'])assert.ok(!IDS.includes(id));
});
test('leaf picker exposes two bilingual options and normalizes defaults for 14 IDs',()=>{
 for(const id of IDS){const p=plan(id),before=JSON.stringify(p),spec=controls.previewControlSpec(catalog,p);assert.equal(spec.schema.length,1);assert.deepEqual(spec.schema[0],{key:'foliage',label:['Leaf texture','Текстура листвы'],values:[{value:'cutout',label:['Cutout','С прозрачными участками']},{value:'opaque',label:['Opaque','Непрозрачная']}]});assert.deepEqual(spec.state,{foliage:'cutout'});assert.equal(JSON.stringify(p),before);}
});
test('leaf style and edited PNG round-trip independently without mutating plans or values',()=>{
 for(const id of IDS)for(const foliage of ['cutout','opaque']){const p=plan(id,{foliage});for(const texture of p.paths){const values={foliage,texture},before=JSON.stringify({p,values}),selected=controls.previewControlSelection(p,values);assert.deepEqual(selected,{form:undefined,slot:texture,state:{foliage}});assert.equal(JSON.stringify({p,values}),before);assert.deepEqual(controls.previewTextureField(p).values.map(row=>row.value),p.paths);}}
});
test('invalid leaf values fail through both schema and picker selection',()=>{
 for(const id of IDS)for(const foliage of [null,true,false,0,1,'bad',{},[]]){assert.throws(()=>controls.previewControlSpec(catalog,plan(id,{foliage})),/Invalid leaf preview state/);assert.throws(()=>controls.previewControlSelection(plan(id),{foliage,texture:'textures/blocks/cutout_fixture'}),/Invalid leaf preview state/);}
});
test('leaf controls do not leak into ordinary cubes or icon views',()=>{
 for(const p of [plan('stone'),{...plan('oak_leaves'),model:'sprite'}])assert.deepEqual(controls.previewControlSpec(catalog,p),{schema:null,state:{}});
});
test('per-model text overrides remain supported for leaf field and options',()=>{
 const custom=createPreviewControls({en:{cube_foliage:'Custom leaf'},ru:{cube_foliage_opaque:'Своя непрозрачная'}}),spec=custom.previewControlSpec(catalog,plan('oak_leaves'));
 assert.deepEqual(spec.schema[0].label,['Custom leaf','Текстура листвы']);assert.deepEqual(spec.schema[0].values[1].label,['Opaque','Своя непрозрачная']);
});
