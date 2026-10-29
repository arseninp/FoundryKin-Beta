import test from 'node:test';
import assert from 'node:assert/strict';
import {createAmethystModels} from '../models/amethyst.mjs';
const ids=['small_amethyst_bud','medium_amethyst_bud','large_amethyst_bud','amethyst_cluster'];
function three(){return {DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.size=[w,h];this.uv=[[0,1],[1,1],[0,0],[1,0]];}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set:(...v)=>{this.angles=v;}};}}};}
function setup(id,slot=id){const paths=ids.map(id=>'textures/blocks/'+id),faceMap={up:'textures/blocks/'+id},environment={cur:id,slot:'textures/blocks/'+slot,faceMap,mats:Object.fromEntries(paths.map(path=>[path,{path}])),hiddenMat:{},group:{children:[],add(mesh){this.children.push(mesh);}}};return {environment,build:()=>createAmethystModels(three())[0].build(environment)};}
function snapshot(E){return E.group.children.map(m=>({path:m.material.path,size:m.geometry.size,uv:m.geometry.uv,position:m.xyz,rotation:m.angles}));}
test('each stage is one centered cross, not four offset specimens',()=>{
 for(const id of ids){const s=setup(id);s.build();const meshes=s.environment.group.children;assert.equal(meshes.length,2);assert.deepEqual(meshes.map(m=>m.xyz),[[0,0,0],[0,0,0]]);assert.deepEqual(meshes.map(m=>m.angles),[[0,0,0],[0,Math.PI/2,0]]);assert.ok(meshes.every(m=>m.material.path==='textures/blocks/'+id));}
});
test('editing any of the four PNGs never chooses a different stage',()=>{
 for(const id of ids){let expected;for(const slot of ids){const s=setup(id,slot);s.build();const shot=snapshot(s.environment);expected??=shot;assert.deepEqual(shot,expected);}}
});
test('full PNG UVs and shared cross dimensions are preserved without stage-specific stretching',()=>{
 for(const id of ids){const s=setup(id);s.build();for(const m of s.environment.group.children){assert.deepEqual(m.geometry.size,[Math.SQRT2,1]);assert.deepEqual(m.geometry.uv,[[0,1],[1,1],[0,0],[1,0]]);assert.equal(m.material.side,2);assert.equal(m.material.needsUpdate,true);}}
});
test('explicit crystal bindings are used without changing the input face map or existing children',()=>{
 const s=setup('amethyst_cluster'),E=s.environment,before=JSON.stringify(E.faceMap),path='textures/custom/crystal';E.bindings={crystal:path};E.mats[path]={path};const existing={position:{y:9}};E.group.children.push(existing);s.build();assert.equal(E.group.children[0],existing);assert.equal(existing.position.y,9);assert.ok(E.group.children.slice(1).every(m=>m.material.path===path));assert.equal(JSON.stringify(E.faceMap),before);
});
test('invalid stages, missing or hidden materials and invalid Three fail explicitly',()=>{
 for(const id of ['unknown','amethyst_block',null]){const s=setup(id);assert.throws(s.build,/Unknown amethyst stage/);assert.equal(s.environment.group.children.length,0);}
 const missing=setup('amethyst_cluster');delete missing.environment.faceMap.up;assert.throws(missing.build,/Missing amethyst crystal binding/);
 for(const hidden of [false,true]){const s=setup('small_amethyst_bud'),E=s.environment;if(hidden)E.mats[E.faceMap.up]=E.hiddenMat;else delete E.mats[E.faceMap.up];assert.throws(s.build,/Missing planar material/);assert.equal(E.group.children.length,0);}
 assert.throws(()=>createAmethystModels({}),/require Three/);
});
test('registration metadata declares a single unscaled volume model',()=>{
 const models=createAmethystModels(three());assert.equal(models.length,1);assert.equal(models[0].id,'amethyst');assert.equal(models[0].scale,1);assert.equal(models[0].mode,'volume');
});
