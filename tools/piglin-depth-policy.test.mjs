import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createModelMaterials} from '../models/materials.mjs';
import {createModelRegistry} from '../models/registry.mjs';
const sheet='textures/entity/piglin/piglin',other='textures/blocks/glass';
const rigid=['skull','copper_golem_statue','bed','chest','shulker_box','door','sign','banner'];
let allocations=0;
class Material{constructor(options){Object.assign(this,options);this.disposals=0;allocations++;}dispose(){this.disposals++;}}
class Lambert extends Material{isMeshLambertMaterial=true;}
class Basic extends Material{isMeshBasicMaterial=true;}
const Three={MeshLambertMaterial:Lambert,MeshBasicMaterial:Basic,FrontSide:0};
const texture=semi=>({isTexture:true,userData:{semi},dispose(){throw new Error('Borrowed texture disposed');}});
const registry=createModelRegistry();
registry.register([...rigid,'cube','water','lava','fire','slime','honey_block'].map(id=>({id,mode:'volume',build(){}})));
registry.register([{id:'sprite',mode:'sprite',build(){}}]);registry.seal();
async function requestFor(plan,catalog={records:{}}){
 const source=await readFile(new URL('../catalog/prepared-preview.mjs',import.meta.url),'utf8'),start=source.indexOf('const dictionary='),end=source.indexOf('\nfunction release(',start);
 assert.ok(start>=0&&end>start,'Prepared material policy boundary changed');
 const context={plan,catalog,registry};
 vm.runInNewContext(source.slice(start,end)+'\nresult=materialRequest(catalog,registry,plan);',context,{timeout:1000});
 return context.result;
}
function plan(id='piglin_head',model='skull',mode='volume'){return {object:{id},model,mode,slot:sheet,bindings:{sheet}};}
function batchFor(request,lookup){return createModelMaterials(Three,request.descriptor,request.bindings,lookup);}
test('registered rigid volume classes write depth without changing alpha, maps or lighting',async()=>{
 for(const input of [...rigid.map(model=>plan('arbitrary_source',model)),...['piglin_head','player_head','dragon_head','zombie_head','skeleton_skull','wither_skeleton_skull','creeper_head'].map(id=>plan(id))]){
  const before=JSON.stringify(input),request=await requestFor(input),map=texture(true),batch=batchFor(request,{[sheet]:map}),mat=batch.mats[sheet];
  assert.equal(mat.depthWrite,true);assert.equal(mat.transparent,true);assert.equal(mat.alphaTest,0);assert.equal(mat.side,0);assert.equal(mat.depthTest,true);assert.equal(mat.map,map);assert.equal(mat.isMeshLambertMaterial,true);
  assert.equal(JSON.stringify(input),before);batch.dispose();assert.equal(mat.disposals,1);
 }
});
test('glass, liquids, fire, gel volumes and sprite views keep their existing depth policy',async()=>{
 for(const input of [...['cube','water','lava','fire','slime','honey_block'].map(model=>plan('unchanged',model)),plan('piglin_head','skull','sprite'),plan('piglin_head','sprite','sprite')]){
  const request=await requestFor(input),map=texture(true),batch=batchFor(request,{[sheet]:map});assert.equal(batch.mats[sheet].depthWrite,false);assert.equal(batch.mats[sheet].transparent,true);assert.equal(batch.mats[sheet].alphaTest,0);batch.dispose();
 }
});
test('multipart previews preserve each part policy rather than applying a global override',async()=>{
 const input={...plan(),parts:{head:{object:{id:'head'},bindings:{sheet}},glass:{object:{id:'glass'},bindings:{glass:other}}}},catalog={records:{head:{model:'skull'},glass:{model:'cube'}}},request=await requestFor(input,catalog),batch=batchFor(request,{[sheet]:texture(true),[other]:texture(true)});
 assert.equal(batch.mats[sheet].depthWrite,true);assert.equal(batch.mats[other].depthWrite,false);batch.dispose();
});
test('shared texture paths reuse compatible materials and reject conflicting depth policies before allocation',async()=>{
 for(const second of ['bed','cube']){
  const input={...plan(),parts:{a:{object:{id:'a'},bindings:{sheet}},b:{object:{id:'b'},bindings:{sheet}}}},request=await requestFor(input,{records:{a:{model:'skull'},b:{model:second}}}),before=allocations;
  if(second==='cube'){assert.throws(()=>batchFor(request,{[sheet]:texture(true)}),/conflicting depth-write roles/);assert.equal(allocations,before);}
  else{const batch=batchFor(request,{[sheet]:texture(true)});assert.equal(Object.keys(batch.mats).length,1);assert.equal(allocations,before+1);batch.dispose();}
 }
});
test('role depth writes survive opaque and semi-transparent updates and descriptor mutation',()=>{
 const descriptor={mode:'volume',depthWriteRoles:{sheet:true}},batch=createModelMaterials(Three,descriptor,{sheet},{[sheet]:texture(true)}),mat=batch.mats[sheet];descriptor.depthWriteRoles.sheet=false;
 for(const semi of [false,true]){const map=texture(semi);batch.update({[sheet]:map});assert.equal(mat.depthWrite,true);assert.equal(mat.transparent,semi);assert.equal(mat.alphaTest,semi?0:.05);assert.equal(mat.map,map);}
 batch.dispose();batch.dispose();assert.equal(mat.disposals,1);
});
test('default depth follows alpha while explicit global and role overrides remain supported',()=>{
 for(const override of [undefined,false,true]){
  const descriptor={mode:'volume',...(override===undefined?{}:{depthWrite:override})},batch=createModelMaterials(Three,descriptor,{sheet},{[sheet]:texture(true)}),mat=batch.mats[sheet];
  for(const semi of [false,true]){batch.update({[sheet]:texture(semi)});assert.equal(mat.depthWrite,override??!semi);}
  batch.dispose();
 }
});
test('invalid global and per-role overrides fail before allocating materials',()=>{
 const before=allocations;
 for(const value of [null,undefined,0,1,'true',{},[]])assert.throws(()=>createModelMaterials(Three,{mode:'volume',depthWrite:value},{sheet},{[sheet]:texture(true)}),/Invalid model depth-write policy/);
 for(const value of [null,undefined,0,[],{missing:true},{sheet:'true'}])assert.throws(()=>createModelMaterials(Three,{mode:'volume',depthWriteRoles:value},{sheet},{[sheet]:texture(true)}),/Invalid model role depth-write policy/);
 assert.equal(allocations,before);
});
test('registry validates explicit policies atomically and retains explicit opt-outs',()=>{
 const r=createModelRegistry();r.register([{id:'bed',depthWrite:false,build(){}}]);assert.equal(r.get('bed').depthWrite,false);assert.equal(Object.isFrozen(r.get('bed')),true);
 assert.throws(()=>r.register([{id:'fresh',build(){}},{id:'invalid',depthWrite:'true',build(){}}]),/Invalid model depth-write policy/);assert.equal(r.has('fresh'),false);assert.equal(r.has('invalid'),false);
});
