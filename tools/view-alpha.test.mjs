import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
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
