import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createModelTextures} from '../models/textures.mjs';
import {createModelMaterials} from '../models/materials.mjs';
import {withPreparedPreview} from '../catalog/prepared-preview.mjs';
const source=readFileSync(new URL('../fk-view.js',import.meta.url),'utf8');
function canvas(alphas,width=alphas.length){
 const data=Uint8Array.from(alphas.flatMap((a,i)=>[i+10,i+20,i+30,a]));
 return {width,height:alphas.length/width,data,getContext(){return {getImageData:()=>({data})};}};
}
function productionThree() {
 const textures=[],materials=[];
 class DataTexture {
  constructor(data,width,height){this.image={data,width,height};this.isTexture=true;this.userData={};this.uploads=0;this.disposals=0;textures.push(this);}
  set needsUpdate(value){if(value)this.uploads++;}
  dispose(){this.disposals++;}
 }
 class Material {
  constructor(options){Object.assign(this,options);this.updates=0;this.disposals=0;materials.push(this);}
  set needsUpdate(value){if(value)this.updates++;}
  dispose(){this.disposals++;}
 }
 class Lambert extends Material {constructor(options){super(options);this.isMeshLambertMaterial=true;}}
 class Basic extends Material {constructor(options){super(options);this.isMeshBasicMaterial=true;}}
 class Group {
  constructor(){this.children=[];}
  add(node){this.children.push(node);node.parent=this;}
  remove(node){this.children=this.children.filter(child=>child!==node);node.parent=null;}
 }
 return {DataTexture,MeshLambertMaterial:Lambert,MeshBasicMaterial:Basic,Group,RGBAFormat:1,NearestFilter:2,FrontSide:0,textures,materials};
}
const path='textures/blocks/a';
function textureFor(Three,alphas,width) {
 const lookup={[path]:canvas(alphas,width)},batch=createModelTextures(Three,[path],lookup);
 return {lookup,batch,texture:batch.textures[path]};
}
function materialsFor(Three,texture){return createModelMaterials(Three,{mode:'volume'},{face:path},{[path]:texture});}
test('every fractional alpha value is detected, including the extremes next to 0 and 255',()=>{
 const Three=productionThree();
 for(let alpha=1;alpha<255;alpha++)assert.equal(textureFor(Three,[alpha]).texture.userData.semi,true,String(alpha));
 for(const alpha of [0,255])assert.equal(textureFor(Three,[alpha]).texture.userData.semi,false,String(alpha));
});
test('fractional textures blend without alpha cutoff or depth writes',()=>{
 const Three=productionThree(),{texture}=textureFor(Three,[1,127,254]),material=materialsFor(Three,texture).mats[path];
 assert.equal(material.transparent,true);assert.equal(material.alphaTest,0);assert.equal(material.depthWrite,false);assert.equal(material.depthTest,true);assert.equal(material.side,0);assert.equal(material.map,texture);
});
test('opaque and binary-cutout textures keep depth writes and use cutoff without blending',()=>{
 const Three=productionThree();
 for(const alphas of [[255],[0],[0,255]]) {
  const {texture}=textureFor(Three,alphas),material=materialsFor(Three,texture).mats[path];
  assert.equal(material.transparent,false);assert.equal(material.alphaTest,.05);assert.equal(material.depthWrite,true);assert.equal(material.depthTest,true);assert.equal(material.side,0);assert.equal(material.map,texture);
 }
});
test('refreshing a texture updates the material policy in both directions and recompiles only when it changes',()=>{
 const Three=productionThree(),{lookup,batch,texture}=textureFor(Three,[255]),set=materialsFor(Three,texture),material=set.mats[path];
 for(const alpha of [248,0,8,255,1,254,0]) {
  lookup[path].data[3]=alpha;assert.equal(batch.update(lookup),true);set.update(batch.textures);
  const semi=alpha>0&&alpha<255;
  assert.equal(batch.textures[path],texture);assert.equal(material.map,texture);
  assert.equal(material.transparent,semi);assert.equal(material.depthWrite,!semi);assert.equal(material.alphaTest,semi?0:.05);
 }
 assert.equal(material.updates,6);assert.equal(Three.textures.length,1);
});
test('RGBA bytes keep only the vertical flip and source pixels are never changed',()=>{
 const Three=productionThree(),source=canvas([0,1,254,255],2),before=Array.from(source.data),lookup={[path]:source};
 const batch=createModelTextures(Three,[path],lookup),texture=batch.textures[path];
 assert.deepEqual(Array.from(texture.image.data),[...before.slice(8),...before.slice(0,8)]);assert.deepEqual(Array.from(source.data),before);
 assert.equal(texture.image.width,2);assert.equal(texture.image.height,2);assert.equal(texture.generateMipmaps,false);assert.equal(texture.flipY,false);assert.equal(texture.magFilter,2);assert.equal(texture.minFilter,2);
 assert.equal(batch.update(lookup),true);assert.deepEqual(Array.from(source.data),before);
});
test('production texture batch reuses identities and uploads only changed pixels',()=>{
 const Three=productionThree(),a='textures/blocks/a',b='textures/blocks/b',lookup={[a]:canvas([0,255,1,254],2),[b]:canvas([255])},before=Array.from(lookup[a].data);
 const batch=createModelTextures(Three,[a,b],lookup),first=batch.textures[a],second=batch.textures[b];
 assert.deepEqual(Array.from(first.image.data),[...before.slice(8),...before.slice(0,8)]);
 assert.equal(batch.update(lookup),true);assert.equal(first.uploads,1);assert.equal(second.uploads,1);
 lookup[a].data[0]=77;assert.equal(batch.update(lookup),true);
 assert.equal(batch.textures[a],first);assert.equal(batch.textures[b],second);assert.equal(Three.textures.length,2);
 assert.equal(first.image.data[8],77);assert.equal(first.uploads,2);assert.equal(second.uploads,1);
 const pixels=Array.from(first.image.data),uploads=first.uploads;
 assert.throws(()=>batch.update({[a]:canvas([255]),[b]:{width:1,height:1}}),/Invalid model canvas/);
 assert.deepEqual(Array.from(first.image.data),pixels);assert.equal(first.uploads,uploads);
 assert.equal(batch.update({...lookup,[a]:canvas([255])}),false);assert.deepEqual(Array.from(first.image.data),pixels);
 batch.dispose();batch.dispose();assert.ok(Three.textures.every(texture=>texture.disposals===1));assert.throws(()=>batch.update(lookup),/disposed/);
});
test('prepared canvas updates preserve geometry, alpha transitions and resize cleanup',()=>{
 const Three=productionThree(),path='textures/blocks/stone',lookup={[path]:canvas([255])};let builds=0,geometryDisposals=0;
 const selected={object:{id:'stone'},model:'cube',mode:'volume',bindings:{up:path},build({group}){builds++;group.add({geometry:{dispose(){geometryDisposals++;}},children:[]});}};
 const resolve=withPreparedPreview({records:{}},{get:()=>({mode:'volume'})},Three,()=>selected);
 const instance=resolve({}).instantiateCanvases({group:new Three.Group()},lookup),material=Three.materials[0],original=Three.textures[0];
 instance.update(lookup);assert.equal(material.updates,0);assert.equal(original.uploads,1);assert.equal(builds,1);
 for(const alpha of [127,255]) {
  lookup[path].data[3]=alpha;instance.update(lookup);
  assert.equal(material.map,original);assert.equal(material.transparent,alpha!==255);assert.equal(material.depthWrite,alpha===255);assert.equal(material.alphaTest,alpha===255?.05:0);
 }
 assert.equal(material.updates,2);assert.equal(Three.textures.length,1);assert.equal(geometryDisposals,0);
 lookup[path].data[0]=88;instance.update(lookup);assert.equal(material.updates,2);assert.equal(original.uploads,4);
 instance.update({[path]:canvas([255,255])});assert.equal(Three.textures.length,2);assert.equal(original.disposals,1);assert.equal(material.map,Three.textures[1]);assert.equal(builds,1);
 instance.dispose();instance.dispose();assert.equal(geometryDisposals,1);assert.equal(material.disposals,1);assert.ok(Three.textures.every(texture=>texture.disposals===1));
 assert.throws(()=>instance.update(lookup),/disposed/);
});
test('FKView exposes only the compiled-model API',()=>{
 const context={THREE:{}};vm.createContext(context);vm.runInContext(source,context);
 assert.deepEqual(Object.keys(context.FKView).sort(),['build','capture','clear','createStage','mount','render','setCopies','update']);
});
