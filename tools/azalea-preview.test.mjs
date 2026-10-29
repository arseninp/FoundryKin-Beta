import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createAzaleaModels} from '../models/azalea.mjs';
const ids=['azalea','flowering_azalea'];
function setup(){
 const records={};
 for(const id of ids){const pot='potted_'+id+'_bush',keys={up:id+'_top',down:pot+'_top',north:id+'_side',side:id+'_side',east:'azalea_plant',south:pot+'_side',west:pot+'_plant'},atlas=Object.fromEntries(Object.values(keys).map(key=>[key,{textures:'textures/blocks/'+key}]));records[id]=normalizeBlock(id,{textures:keys},atlas,{model:'azalea'});}
 const catalog={schema:1,records,items:{},aliases:{old_flowering:'flowering_azalea'},families:{},resources:{}};
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(){const rows=[[0,1],[1,1],[0,0],[1,0]];this.attributes={uv:{count:4,getX:i=>rows[i][0],getY:i=>rows[i][1],setXY(i,u,v){rows[i]=[u,v];}}};}},Mesh:class{constructor(geometry,material){this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set(){}};}}};
 const model=createAzaleaModels(Three)[0],registry={get(id){assert.equal(id,'azalea');return model;},build(id,E){assert.equal(id,'azalea');return model.build(E);}};
 const env=()=>({mats:Object.fromEntries(Object.values(records).flatMap(r=>r.paths).map(path=>[path,{path}])),group:{children:[],add(m){this.children.push(m);}}});
 return {records,catalog,resolve:createPreviewResolver(catalog,registry),env};
}
test('both real-shaped definitions bind normal top, side and plant without using potted faces',()=>{
 const s=setup();for(const id of ids){const p=s.resolve({id}),E=s.env();p.build(E);assert.deepEqual(p.bindings,{top:'textures/blocks/'+id+'_top',side:'textures/blocks/'+id+'_side',plant:'textures/blocks/azalea_plant'});assert.equal(E.group.children.length,7);assert.ok(E.group.children.every(m=>!m.material.path.includes('potted_')));assert.equal(p.object.id,id);}
});
test('all six paths stay editable, including all three potted resources, for both objects',()=>{
 const s=setup();for(const id of ids){const r=s.records[id];assert.equal(r.paths.length,6);assert.equal(r.paths.filter(path=>path.includes('potted_')).length,3);let expected;
 for(const slot of r.paths){const p=s.resolve({id,slot}),E=s.env();p.build(E);assert.equal(p.slot,slot);assert.deepEqual(p.paths,r.paths);const paths=E.group.children.map(m=>m.material.path);expected??=paths;assert.deepEqual(paths,expected);assert.deepEqual(p.bindings,{top:'textures/blocks/'+id+'_top',side:'textures/blocks/'+id+'_side',plant:'textures/blocks/azalea_plant'});}}
});
test('saved IDs and aliases keep the correct flowering object and do not mutate the catalog',()=>{
 const s=setup(),before=JSON.stringify(s.catalog),p=s.resolve({id:'old_flowering'});p.build(s.env());assert.equal(p.object.id,'flowering_azalea');assert.equal(p.bindings.top,'textures/blocks/flowering_azalea_top');assert.equal(JSON.stringify(s.catalog),before);
});
test('missing, ambiguous and foreign part paths are rejected before building',()=>{
 for(const value of [[],['textures/blocks/azalea_plant','textures/blocks/azalea_top']]){const s=setup();s.records.azalea.faces.east=value;assert.throws(()=>s.resolve({id:'azalea'}),/azalea parts/);}
 const s=setup();s.records.azalea.faces.east=['textures/blocks/unrelated'];assert.throws(()=>s.resolve({id:'azalea'}),/outside the selected record/);
});
test('explicit named parts work, but unrelated choices cannot repurpose potted resources',()=>{
 const s=setup(),r=s.records.azalea;r.bindings={top:r.faces.up,side:r.faces.north,plant:r.faces.east};delete r.faces;
 const p=s.resolve({id:'azalea'}),E=s.env();p.build(E);assert.equal(E.group.children.length,7);
 assert.throws(()=>s.resolve({id:'azalea',faceChoices:{plant:'textures/blocks/potted_azalea_bush_plant'}}),/Explicit face variant/);
 r.bindings.extra=['textures/blocks/azalea_top'];assert.throws(()=>s.resolve({id:'azalea'}),/azalea parts/);
});
