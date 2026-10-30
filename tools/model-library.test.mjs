import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelLibrary, inspectModelCoverage, bindCatalogModels} from '../models/library.mjs';
function three() {
 return {DoubleSide:2, BoxGeometry:class {constructor(){this.attributes={position:{count:0},normal:{},uv:{}};}},PlaneGeometry:class{},Mesh:class {constructor(){this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};this.rotation={};}}};
}
test('single library registers all migrated builders exactly once and seals the registry',()=>{
 const library=createModelLibrary(three());
 assert.equal(library.ids().length,82);assert.ok(library.has('cube'));assert.ok(library.has('sulfur_spike'));
 for(const id of ['lantern','chain','torch','campfire','cross','sprite','rail','decal','pane','candle','brewing','anvil','beacon','pumpkin','door','amethyst','azalea','potted_azalea','bamboo','bamboo_fence','bamboo_gate','pale_moss_carpet','piston','redstone_torch','repeater','comparator','ladder','lectern','lever','shelf','flower','grass_path','enchanting_table','stonecutter','sea_pickle','crop','turtle_egg','vines','portal','end_portal_frame','tripwire','tripwire_hook','spore_blossom','flowerbed','sunflower','sniffer_egg','pitcher','redstone_wire','track','bars','lightning_rod','end_rod','heavy_core','hopper','grindstone','frame','cauldron','cocoa','daylight','flower_pot','decorated_pot','conduit','fire','big_dripleaf','small_dripleaf','sculk_sensor','sculk_shrieker','sculk_catalyst','cactus'])assert.ok(library.has(id));
 assert.equal(library.get('door').scale,1.4);assert.equal(library.get('bamboo').scale,1.8);assert.equal(library.get('piston').scale,1.4);assert.equal(library.get('flower').scale,1.4);assert.equal(library.get('vines').scale,1.4);assert.equal(library.get('sprite').mode,'sprite');
 assert.throws(()=>library.register([{id:'cube',build(){}}]),/sealed/);
 assert.throws(()=>library.build('unknown',{}),/Unknown/);
});
test('coverage returns every missing builder and invalid assignment, without inventing cubes',()=>{
 const records={stone:{model:'cube'},a:{model:'bed'},b:{model:'sign'},c:{model:'bed'},d:{},e:{model:null}};
 const before=JSON.stringify(records),report=inspectModelCoverage(records,createModelLibrary(three()));
 assert.equal(report.ready,false);assert.equal(report.total,6);
 assert.deepEqual(report.assigned,{cube:['stone']});assert.deepEqual(report.missing,{bed:['a','c'],sign:['b']});assert.deepEqual(report.invalid,['d','e']);
 assert.equal(JSON.stringify(records),before);
});
test('catalog binding validates complete coverage and dispatches to the migrated builder',()=>{
 const catalog={schema:1,records:{stone:{model:'cube'},slab:{model:'slab'}}};
 const {registry,coverage}=bindCatalogModels(catalog,three());assert.equal(coverage.ready,true);
 const group={children:[],add(mesh){this.children.push(mesh);}},faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,'stone']));
 registry.build(catalog.records.slab.model,{cur:'slab',faceMap,mats:{stone:{}},group});
 assert.equal(group.children.length,1);assert.equal(group.children[0].position.y,0);
});
test('incomplete catalog binding exposes the whole coverage report and does not mutate the catalog',()=>{
 const catalog={schema:1,records:{x:{model:'sign'},y:{model:'bed'},z:{}}},before=JSON.stringify(catalog);
 assert.throws(()=>bindCatalogModels(catalog,three()),error=>{
  assert.match(error.message,/sign: x/);assert.match(error.message,/bed: y/);assert.deepEqual(error.coverage.invalid,['z']);return true;
 });
 assert.equal(JSON.stringify(catalog),before);
});
test('bad catalog structures and missing Three dependencies fail explicitly',()=>{
 for(const catalog of [null,{}, {schema:2,records:{}},{schema:1,records:[]}])assert.throws(()=>bindCatalogModels(catalog,three()),/Invalid compiled/);
 assert.throws(()=>createModelLibrary({}),/require Three/);
 assert.throws(()=>inspectModelCoverage([],createModelLibrary(three())),/Invalid model coverage/);
});
