import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createModelTextures} from '../models/textures.mjs';
import {withPreparedPreview} from '../catalog/prepared-preview.mjs';
const source=readFileSync(new URL('../fk-view.js',import.meta.url),'utf8');
function setup(){
 class DataTexture{constructor(data,w,h,format){this.image={data,width:w,height:h};this.format=format;}}
 class Material{constructor(options){Object.assign(this,{opacity:1,depthWrite:true,depthTest:true},options);}}
 const THREE={DataTexture,MeshLambertMaterial:Material,RGBAFormat:1,NearestFilter:2,FrontSide:0,DoubleSide:2};
 const ctx={THREE,Uint8Array};vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.FKView;
}
function canvas(alphas,width=alphas.length){
 const data=Uint8Array.from(alphas.flatMap((a,i)=>[i+10,i+20,i+30,a]));
 return {width,height:alphas.length/width,data,getContext(){return {getImageData:()=>({data})};}};
}
test('every fractional alpha value is detected, including the previously excluded extremes',()=>{
 const V=setup();for(let alpha=1;alpha<255;alpha++)assert.equal(V.texture(canvas([alpha])).userData.semi,true,String(alpha));
 for(const alpha of [0,255])assert.equal(V.texture(canvas([alpha])).userData.semi,false);
});
test('fractional textures blend without alpha cutoff or depth writes and retain opacity',()=>{
 const V=setup(),mat=V.material(true),tx=V.texture(canvas([1,127,254]));V.mapMaterial(mat,tx);
 assert.equal(mat.transparent,true);assert.equal(mat.alphaTest,0);assert.equal(mat.depthWrite,false);assert.equal(mat.depthTest,true);assert.equal(mat.opacity,1);assert.equal(mat.side,2);assert.equal(mat.map,tx);
});
test('opaque and binary-cutout textures keep depth writes and use cutoff without blending',()=>{
 const V=setup();for(const alphas of [[255],[0],[0,255]]){
  const mat=V.material(false);V.mapMaterial(mat,V.texture(canvas(alphas)));
  assert.equal(mat.transparent,false);assert.equal(mat.alphaTest,.05);assert.equal(mat.depthWrite,true);assert.equal(mat.opacity,1);assert.equal(mat.side,0);
 }
});
test('mapping refreshed textures updates material policy in both directions',()=>{
 const V=setup(),mat=V.material(false);for(const alphas of [[255],[248],[0,255],[8]]){
  const tx=V.texture(canvas(alphas));V.mapMaterial(mat,tx);const semi=alphas.some(a=>a>0&&a<255);
  assert.equal(mat.map,tx);assert.equal(mat.transparent,semi);assert.equal(mat.depthWrite,!semi);assert.equal(mat.alphaTest,semi?0:.05);assert.equal(mat.needsUpdate,true);
 }
});
test('RGBA bytes are preserved with only the existing vertical flip; source pixels are untouched',()=>{
 const V=setup(),c=canvas([0,1,254,255],2),before=Array.from(c.data),tx=V.texture(c);
 assert.deepEqual(Array.from(tx.image.data),[...before.slice(8),...before.slice(0,8)]);assert.deepEqual(Array.from(c.data),before);
 assert.equal(tx.image.width,2);assert.equal(tx.image.height,2);assert.equal(tx.generateMipmaps,false);
});
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
