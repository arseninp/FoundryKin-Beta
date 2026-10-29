import test from 'node:test';
import assert from 'node:assert/strict';
import {powerRules,compileStateGroups} from '../catalog/states.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createAmethystModels} from '../models/amethyst.mjs';
const stages={small:'small_amethyst_bud',medium:'medium_amethyst_bud',large:'large_amethyst_bud',cluster:'amethyst_cluster'};
function setup(){
 const records=Object.fromEntries(Object.values(stages).map(id=>{const path='textures/blocks/'+id;return [id,{id,model:'amethyst',paths:[path],icons:[],faces:Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,[path]]))}];}));
 const states=compileStateGroups(records,powerRules(records));
 const catalog={schema:1,records,items:{},aliases:{old_bud:'small_amethyst_bud'},families:{},resources:{},stateGroups:states.groups,stateRoutes:states.routes};
 const Three={DoubleSide:2,PlaneGeometry:class{},Mesh:class{constructor(geometry,material){this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set(){}};}}};
 const model=createAmethystModels(Three)[0],registry={get(id){assert.equal(id,'amethyst');return model;},build(id,E){assert.equal(id,'amethyst');return model.build(E);}};
 const env=()=>({mats:Object.fromEntries(Object.values(records).flatMap(r=>r.paths).map(path=>[path,{path}])),group:{children:[],add(m){this.children.push(m);}}});
 return {records,states,catalog,resolve:createPreviewResolver(catalog,registry),env};
}
test('four records become one card while preserving all original IDs and PNG paths',()=>{
 const s=setup(),g=s.states.groups.amethyst_cluster;assert.deepEqual(s.states.cards,['amethyst_cluster']);assert.deepEqual({...g.variants},stages);assert.equal(g.parameter,'growth');assert.equal(g.default,'cluster');assert.equal(Object.keys(s.records).length,4);assert.equal(g.paths.length,4);
});
test('all sixteen growth and editing-slot combinations reach the actual centered builder',()=>{
 const s=setup();for(const [growth,id] of Object.entries(stages))for(const other of Object.values(stages)){
  const slot='textures/blocks/'+other,p=s.resolve({id:'amethyst_cluster',state:{growth},slot}),E=s.env();p.build(E);
  assert.equal(p.object.id,id);assert.equal(p.object.card,'amethyst_cluster');assert.equal(p.state.growth,growth);assert.equal(p.slot,slot);assert.equal(E.group.children.length,2);assert.ok(E.group.children.every(m=>m.material.path==='textures/blocks/'+id));assert.deepEqual(E.group.children.map(m=>m.xyz),[[0,0,0],[0,0,0]]);
 }
});
test('saved stage IDs and aliases retain their selected stage',()=>{
 const s=setup();for(const [growth,id] of Object.entries(stages)){const p=s.resolve({id});assert.equal(p.state.growth,growth);assert.equal(p.faceMap.up,'textures/blocks/'+id);}
 assert.equal(s.resolve({id:'old_bud'}).state.growth,'small');
});
test('invalid growth and a wrong model cannot silently produce a different object',()=>{
 const s=setup();assert.throws(()=>s.resolve({id:'amethyst_cluster',state:{growth:'unknown'}}),/Invalid preview state/);
 s.records.small_amethyst_bud.model='cube';assert.throws(()=>compileStateGroups(s.records,powerRules(s.records)),/model mismatch/);
});
test('an incomplete source group stays explicit rather than dropping missing stages',()=>{
 const s=setup();delete s.records.medium_amethyst_bud;const plan=compileStateGroups(s.records,powerRules(s.records));assert.equal(Object.keys(plan.groups).length,0);assert.equal(plan.cards.length,3);
});
test('state compilation, selection and building do not mutate the source catalog',()=>{
 const s=setup(),before=JSON.stringify(s.catalog),p=s.resolve({id:'amethyst_cluster',state:{growth:'large'},slot:'textures/blocks/small_amethyst_bud'});p.build(s.env());assert.equal(JSON.stringify(s.catalog),before);
});
