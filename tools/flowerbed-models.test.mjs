import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createFlowerbedModels} from '../models/flowerbeds.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(id) {
 const flower='textures/blocks/'+id,stem=flower+'_stem',icon='textures/items/'+id;
 const record=normalizeBlock(id,{textures:'bed'},{bed:{textures:[flower,stem]}},{model:'flowerbed',icons:[icon]});
 const Three=createThreeMock(),model=createFlowerbedModels(Three)[0];
 const catalog={schema:1,records:{[id]:record},items:{},aliases:{},families:{},resources:{}};
 const registry={get:key=>{assert.equal(key,'flowerbed');return model;},build:(key,E)=>model.build(E)};
 return {flower,stem,icon,record,Three,model,resolve:createPreviewResolver(catalog,registry),env:()=>({mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()})};
}
for(const id of ['pink_petals','wildflowers']) {
 test(id+' binds flower and stem without using the icon or edited slot',()=>{
  const s=setup(id),before=JSON.stringify(s.record);
  assert.deepEqual(s.record.bindings,{flower:[s.flower],stem:[s.stem]});
  for(const slot of s.record.paths) {
   const p=s.resolve({id,slot}),E=s.env();p.build(E);const meshes=meshesOf(E.group);
   assert.equal(meshes.length,20);assert.equal(meshes.filter(m=>m.material.path===s.flower).length,4);assert.equal(meshes.filter(m=>m.material.path===s.stem).length,16);
   assert.equal(E.mats[s.flower].side,2);assert.equal(E.mats[s.stem].side,2);assert.ok(meshes.every(m=>m.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
   assert.equal(p.model,'flowerbed');assert.equal(p.scale,1);
  }
  assert.equal(JSON.stringify(s.record),before);
 });
 test(id+' rejects absent stem instead of showing an incomplete flowerbed',()=>{
  const flower='textures/blocks/'+id;
  assert.throws(()=>normalizeBlock(id,{textures:'bed'},{bed:{textures:flower}},{model:'flowerbed'}),/Missing or ambiguous flowerbed part/);
  const s=setup(id),E=s.env();delete E.mats[s.stem];
  assert.throws(()=>s.resolve({id}).build(E),/Missing model material/);assert.equal(E.group.children.length,0);
 });
}
