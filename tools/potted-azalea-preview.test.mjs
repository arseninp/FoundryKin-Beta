import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {attachDependencies, declaredDependencies} from '../catalog/rules/dependencies.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createAzaleaModels} from '../models/azalea.mjs';
import {createPottedAzaleaModels} from '../models/potted-azalea.mjs';
const ids=['azalea','flowering_azalea'],POT='textures/blocks/flower_pot',SOIL='textures/blocks/dirt',P='textures/blocks/';
function three(){
 class Group{constructor(){this.children=[];this.rotation={set:(...v)=>{this.angles=v;}};this.position={set:(...v)=>{this.xyz=v;}};}add(m){this.children.push(m);}}
 class PlaneGeometry{constructor(w,h){this.size=[w,h];const rows=[[0,1],[1,1],[0,0],[1,0]];this.attributes={uv:{count:4,getX:i=>rows[i][0],getY:i=>rows[i][1],setXY(i,u,v){rows[i]=[u,v];}}};}dispose(){this.disposed=true;}}
 class Mesh extends Group{constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
 return {Group,PlaneGeometry,Mesh,DoubleSide:2,FrontSide:0};
}
function setup(){
 const records={};
 for(const id of ids){const pot='potted_'+id+'_bush',keys={up:id+'_top',down:pot+'_top',north:id+'_side',side:id+'_side',east:'azalea_plant',south:pot+'_side',west:pot+'_plant'},atlas=Object.fromEntries(Object.values(keys).map(key=>[key,{textures:P+key}]));records[id]=normalizeBlock(id,{textures:keys},atlas,{model:'azalea'});}
 const inventory=Object.fromEntries([...Object.values(records).flatMap(r=>r.paths),POT,SOIL].map(path=>[path,1]));
 const assignments=Object.fromEntries(ids.map(id=>[id,{model:'azalea'}]));
 const compiled=attachDependencies(records,declaredDependencies(assignments),inventory);
 const catalog={schema:1,records:compiled,items:{},aliases:{},families:{},resources:{}};
 const Three=three(),models=Object.fromEntries([...createAzaleaModels(Three),...createPottedAzaleaModels(Three)].map(m=>[m.id,m]));
 const registry={get(id){if(!models[id])throw new Error('Unknown model key');return models[id];},build(id,E){return this.get(id).build(E);}};
 const env=()=>({mats:Object.fromEntries([...Object.values(compiled).flatMap(r=>r.paths),POT,SOIL].map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()});
 return {records,compiled,inventory,catalog,resolve:createPreviewResolver(catalog,registry),env};
}
const potted=id=>({pot:POT,soil:SOIL,top:P+'potted_'+id+'_bush_top',side:P+'potted_'+id+'_bush_side',plant:P+'potted_'+id+'_bush_plant'});
test('dependencies are declared for azalea models only and never touch owned paths',()=>{
 assert.deepEqual(declaredDependencies({stone:{model:'cube'},azalea:{model:'azalea'}}),{azalea:{pot:POT,soil:SOIL}});
 const s=setup();for(const id of ids){assert.deepEqual(s.compiled[id].dependencies,{pot:[POT],soil:[SOIL]});assert.equal(s.compiled[id].paths.length,6);assert.ok(!s.compiled[id].paths.includes(POT));assert.equal(s.records[id].dependencies,undefined);}
});
test('missing resources, owners and malformed declarations are rejected before compilation continues',()=>{
 const s=setup(),inventory={...s.inventory};delete inventory[SOIL];
 assert.throws(()=>attachDependencies(s.records,{azalea:{pot:POT,soil:SOIL}},inventory),/Missing dependency resource/);
 assert.throws(()=>attachDependencies(s.records,{absent:{pot:POT}},s.inventory),/Dependency owner is missing/);
 assert.throws(()=>attachDependencies(s.records,{azalea:{}},s.inventory),/Invalid dependencies/);
 assert.throws(()=>attachDependencies(s.records,{azalea:{Pot:POT}},s.inventory),/Invalid dependency role/);
 assert.throws(()=>attachDependencies(s.records,{azalea:{pot:[POT,SOIL]}},s.inventory),/Ambiguous dependency/);
 assert.throws(()=>attachDependencies(s.records,{azalea:{pot:'blocks/flower_pot'}},s.inventory),/Invalid resource path/);
});
test('default azalea preview stays unpotted and needs no shared resources',()=>{
 const s=setup();for(const id of ids){const p=s.resolve({id}),E=s.env();p.build(E);assert.equal(p.model,'azalea');assert.deepEqual(p.shared,[]);assert.equal(p.state.potted,false);assert.equal(E.group.children.length,7);assert.ok(E.group.children.every(m=>!m.material.path.includes('potted_')));}
});
test('potted form binds potted faces and declared pot and soil without changing ownership',()=>{
 const s=setup(),before=JSON.stringify(s.catalog);
 for(const id of ids){const p=s.resolve({id,state:{potted:true}}),E=s.env();p.build(E);
  assert.equal(p.model,'potted_azalea');assert.deepEqual(p.bindings,potted(id));assert.deepEqual(p.shared,[POT,SOIL]);assert.equal(p.object.id,id);
  assert.equal(E.group.children.length,12);const stack=E.group.children[4].children;assert.equal(stack[0].material.path,POT);assert.equal(stack[1].material.path,SOIL);
  assert.deepEqual(p.paths,s.compiled[id].paths);}
 assert.equal(JSON.stringify(s.catalog),before);
});
test('editing any owned slot keeps the potted model and bindings, while shared resources are not editable',()=>{
 const s=setup();for(const id of ids){let expected;
  for(const slot of s.compiled[id].paths){const p=s.resolve({id,slot,state:{potted:true}}),E=s.env();p.build(E);assert.equal(p.slot,slot);assert.equal(p.model,'potted_azalea');assert.deepEqual(p.bindings,potted(id));const seen=E.group.children.flatMap(g=>g.children.map(m=>m.material.path));expected??=seen;assert.deepEqual(seen,expected);}
  for(const shared of [POT,SOIL])assert.throws(()=>s.resolve({id,slot:shared,state:{potted:true}}),/outside the selected object/);}
});
test('missing dependencies, parts and invalid state fail before any model is built',()=>{
 let s=setup();delete s.catalog.records.azalea.dependencies;assert.throws(()=>s.resolve({id:'azalea',state:{potted:true}}),/Missing potted azalea dependencies/);
 s=setup();s.catalog.records.azalea.faces.west=[];assert.throws(()=>s.resolve({id:'azalea',state:{potted:true}}),/Missing or ambiguous potted azalea parts/);
 s=setup();assert.throws(()=>s.resolve({id:'azalea',state:{potted:'yes'}}),/Invalid azalea preview state/);
 s=setup();assert.throws(()=>s.resolve({id:'azalea',state:{potted:true},faceChoices:{pot:P+'unrelated'}}),/Explicit face variant/);
 s=setup();assert.throws(()=>s.resolve({id:'azalea',state:{potted:true},faceChoices:{extra:POT}}),/Unknown face choice/);
});
test('only declared dependency roles are bound, and foreign paths are still rejected',()=>{
 const s=setup();s.catalog.records.azalea.dependencies={pot:[POT],soil:[SOIL],extra:[SOIL]};
 const p=s.resolve({id:'azalea',state:{potted:true}});assert.deepEqual(Object.keys(p.bindings).sort(),['plant','pot','side','soil','top']);assert.deepEqual(p.shared,[POT,SOIL]);
 s.catalog.records.azalea.faces.west=[SOIL];assert.throws(()=>s.resolve({id:'azalea',state:{potted:true}}),/outside the selected record: plant/);
});
