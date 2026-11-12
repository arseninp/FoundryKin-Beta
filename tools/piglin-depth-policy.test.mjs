import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createModelMaterials} from '../models/materials.mjs';
const sheet='textures/entity/piglin/piglin';
class Material{constructor(options){Object.assign(this,options);this.disposals=0;}dispose(){this.disposals++;}}
class Lambert extends Material{isMeshLambertMaterial=true;}
class Basic extends Material{isMeshBasicMaterial=true;}
const Three={MeshLambertMaterial:Lambert,MeshBasicMaterial:Basic,FrontSide:0};
const texture=semi=>({isTexture:true,userData:{semi},dispose(){throw new Error('Borrowed texture disposed');}});
async function requestFor(plan,catalog={records:{}}){
 const source=await readFile(new URL('../catalog/prepared-preview.mjs',import.meta.url),'utf8'),start=source.indexOf('const dictionary='),end=source.indexOf('\nfunction release(',start);
 assert.ok(start>=0&&end>start,'Prepared material policy boundary changed');
 const context={plan,catalog,registry:{get(){return {mode:'volume'};}}};
 vm.runInNewContext(source.slice(start,end)+'\nresult=materialRequest(catalog,registry,plan);',context,{timeout:1000});
 return context.result;
}
function plan(id='piglin_head',model='skull',mode='volume'){return {object:{id},model,mode,slot:sheet,bindings:{sheet}};}
test('piglin depth trial changes only depth writes and retains borrowed texture and alpha policy',async()=>{
 const input=plan(),before=JSON.stringify(input),request=await requestFor(input),map=texture(true),batch=createModelMaterials(Three,request.descriptor,request.bindings,{[sheet]:map}),mat=batch.mats[sheet];
 assert.equal(request.descriptor.depthWrite,true);assert.equal(mat.depthWrite,true);assert.equal(mat.transparent,true);assert.equal(mat.alphaTest,0);assert.equal(mat.side,0);assert.equal(mat.depthTest,true);assert.equal(mat.map,map);assert.equal(mat.isMeshLambertMaterial,true);
 assert.equal(JSON.stringify(input),before);assert.equal(map.userData.semi,true);batch.dispose();assert.equal(mat.disposals,1);
});
test('glass, other heads, bed, piglin icon and unrelated piglin model keep the default policy',async()=>{
 for(const input of [plan('glass','cube'),plan('player_head'),plan('dragon_head'),plan('zombie_head'),plan('black_bed','bed'),plan('piglin_head','skull','sprite'),plan('piglin_head','cube')]){
  const request=await requestFor(input);assert.equal(Object.hasOwn(request.descriptor,'depthWrite'),false);
  const map=texture(true),batch=createModelMaterials(Three,request.descriptor,request.bindings,{[sheet]:map});
  assert.equal(batch.mats[sheet].depthWrite,false);assert.equal(batch.mats[sheet].transparent,true);assert.equal(batch.mats[sheet].alphaTest,0);batch.dispose();
 }
});
test('multipart previews do not inherit the single-head depth override',async()=>{
 const input={...plan(),parts:{head:{object:{id:'piglin_head'},bindings:{sheet}}}},catalog={records:{piglin_head:{model:'skull'}}};
 const request=await requestFor(input,catalog);assert.equal(Object.hasOwn(request.descriptor,'depthWrite'),false);
});
test('piglin depth writes survive opaque and semi-transparent texture updates',()=>{
 const descriptor={mode:'volume',depthWrite:true},first=texture(true),second=texture(false),third=texture(true),batch=createModelMaterials(Three,descriptor,{sheet},{[sheet]:first}),mat=batch.mats[sheet];
 descriptor.depthWrite=false;
 for(const map of [second,third]){batch.update({[sheet]:map});assert.equal(mat.depthWrite,true);assert.equal(mat.transparent,map.userData.semi);assert.equal(mat.alphaTest,map.userData.semi?0:.05);assert.equal(mat.map,map);assert.equal(map.userData.semi,map===third);}
 batch.dispose();batch.dispose();assert.equal(mat.disposals,1);
});
test('default depth policy still follows texture alpha classification during updates',()=>{
 const first=texture(true),second=texture(false),batch=createModelMaterials(Three,{mode:'volume'},{sheet},{[sheet]:first}),mat=batch.mats[sheet];
 assert.equal(mat.depthWrite,false);batch.update({[sheet]:second});assert.equal(mat.depthWrite,true);batch.update({[sheet]:first});assert.equal(mat.depthWrite,false);batch.dispose();
});
test('invalid depth overrides fail before allocating materials',()=>{
 for(const value of [null,undefined,0,1,'true',{},[]])assert.throws(()=>createModelMaterials(Three,{mode:'volume',depthWrite:value},{sheet},{[sheet]:texture(true)}),/Invalid model depth-write policy/);
});
