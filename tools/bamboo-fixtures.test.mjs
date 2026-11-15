/* Real bamboo resources and rendering use the production pipeline, not legacy wrappers. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createModelLibrary} from '../models/library.mjs';
import {normalizeBlock,resolveTexture} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
test('bamboo fixtures use their own catalog material and bounded atlas UVs',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={},atlas={},existing={};
 for(const name of (await readdir(dir)).sort()){
  if(!/^(blocks|terrain|existing)-\d+\.json$/.test(name))continue;
  Object.assign(name.startsWith('blocks-')?blocks:name.startsWith('terrain-')?atlas:existing,JSON.parse(await readFile(new URL(name,dir),'utf8')));
 }
 for(const id of ['bamboo_fence','bamboo_fence_gate','bamboo_planks'])assert.ok(Object.hasOwn(blocks,id),id);
 const entries=[['bamboo_fence','bamboo_fence',26],['bamboo_fence_gate','bamboo_gate',38]];
 const records=Object.fromEntries(entries.map(([id,model])=>[id,normalizeBlock(id,blocks[id],atlas,{model,existing})]));
 const planks=normalizeBlock('bamboo_planks',blocks.bamboo_planks,atlas,{model:'cube',existing});
 const catalog={schema:1,records,items:{},aliases:{},families:{},resources:{}},Three=createThreeMock(),registry=createModelLibrary(Three);
 registry.validate(records);const resolve=createPreviewResolver(catalog,registry,Three),before=JSON.stringify(catalog);
 for(const [id,model,count] of entries){
  const record=records[id],expected=resolveTexture(blocks[id].textures,atlas);assert.equal(expected.length,1);
  assert.deepEqual(record.faces.up,expected);assert.ok(!planks.paths.includes(expected[0]),id+' must not use plank material');
  assert.ok(Object.hasOwn(existing,expected[0]),expected[0]);assert.equal(registry.get(model).id,model);
  for(const slot of record.paths){
   const plan=resolve({id,slot});assert.equal(plan.model,model);assert.equal(plan.slot,slot);assert.equal(plan.bindings.up,expected[0]);
   const material={},group=new Three.Group();plan.build({group,mats:{[expected[0]]:material}});
   const meshes=meshesOf(group);assert.equal(meshes.length,count,id);
   for(const mesh of meshes){
    assert.equal(mesh.material,material);assert.ok(mesh.geometry.size[0]>0&&mesh.geometry.size[1]>0);
    for(const uv of mesh.geometry.rows)for(const value of uv)assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
   }
  }
  const missing={...existing};delete missing[expected[0]];
  assert.throws(()=>normalizeBlock(id,blocks[id],atlas,{model,existing:missing}),/Missing resource file/);
 }
 const path=planks.paths[0],faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,path])),group=new Three.Group();
 registry.build('fence',{faceMap,bindings:faceMap,mats:{[path]:{}},hiddenMat:{},group});
 assert.ok(meshesOf(group).length>0,'the ordinary fence builder remains available');
 assert.throws(()=>registry.build('unknown',{}),/Unknown/);assert.equal(JSON.stringify(catalog),before);
});
