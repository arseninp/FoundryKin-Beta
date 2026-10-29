import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelLibrary, inspectModelCoverage, bindCatalogModels} from '../models/library.mjs';
function three() {
 return {DoubleSide:2, BoxGeometry:class {constructor(){this.attributes={position:{count:0},normal:{},uv:{}};}},PlaneGeometry:class{},Mesh:class {constructor(){this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};this.rotation={};}}};
}
test('single library registers all migrated builders exactly once and seals the registry',()=>{
 const library=createModelLibrary(three());
 assert.equal(library.ids().length,24);assert.ok(library.has('cube'));assert.ok(library.has('sulfur_spike'));
 for(const id of ['lantern','chain','torch','campfire','cross','sprite','rail','decal','pane','candle','brewing'])assert.ok(library.has(id));
 assert.equal(library.get('sprite').mode,'sprite');
 assert.throws(()=>library.register([{id:'cube',build(){}}]),/sealed/);
 assert.throws(()=>library.build('unknown',{}),/Unknown/);
});
test('coverage returns every missing builder and invalid assignment, without inventing cubes',()=>{
 const records={stone:{model:'cube'},a:{model:'piston'},b:{model:'door'},c:{model:'piston'},d:{},e:{model:null}};
 const before=JSON.stringify(records),report=inspectModelCoverage(records,createModelLibrary(three()));
 assert.equal(report.ready,false);assert.equal(report.total,6);
 assert.deepEqual(report.assigned,{cube:['stone']});assert.deepEqual(report.missing,{door:['b'],piston:['a','c']});assert.deepEqual(report.invalid,['d','e']);
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
 const catalog={schema:1,records:{x:{model:'door'},y:{model:'piston'},z:{}}},before=JSON.stringify(catalog);
 assert.throws(()=>bindCatalogModels(catalog,three()),error=>{
  assert.match(error.message,/door: x/);assert.match(error.message,/piston: y/);assert.deepEqual(error.coverage.invalid,['z']);return true;
 });
 assert.equal(JSON.stringify(catalog),before);
});
test('bad catalog structures and missing Three dependencies fail explicitly',()=>{
 for(const catalog of [null,{}, {schema:2,records:{}},{schema:1,records:[]}])assert.throws(()=>bindCatalogModels(catalog,three()),/Invalid compiled/);
 assert.throws(()=>createModelLibrary({}),/require Three/);
 assert.throws(()=>inspectModelCoverage([],createModelLibrary(three())),/Invalid model coverage/);
});
