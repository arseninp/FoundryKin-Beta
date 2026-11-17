/* CI-only one-pixel canvas path; no browser or image-decoding acceptance. */
import assert from 'node:assert/strict';
import {BANNER_COLORS} from '../catalog/banner-preview.mjs';
function pixelCanvas(rgba=[255,255,255,255]) {
 const pixels=new Uint8ClampedArray(rgba);
 return {width:1,height:1,getContext(kind) {
  assert.equal(kind,'2d');
  return {
   getImageData(x,y,w,h) {assert.deepEqual([x,y,w,h],[0,0,1,1]);return {data:new Uint8ClampedArray(pixels)};},
   createImageData(w,h) {assert.deepEqual([w,h],[1,1]);return {data:new Uint8ClampedArray(4)};},
   putImageData(image,x,y) {assert.deepEqual([x,y],[0,0]);assert.equal(image.data.length,4);pixels.set(image.data);}
  };
 }};
}
export function bannerCI(plan,group) {
 assert.equal(plan.model,'banner');
 assert.throws(()=>plan.instantiate({group},{}),/Banner composition requires instantiateCanvases/);
 const paths=plan.modelResourcePaths,canvases=Object.fromEntries(paths.map(path=>[path,pixelCanvas()]));
 const color=plan.banner.ominous?0xFFFFFF:BANNER_COLORS[plan.banner.layers.at(-1)?.color??plan.banner.color];
 assert.notEqual(color,undefined);
 const rgb=[color>>>16&255,color>>>8&255,color&255];
 const expected=value=>[...rgb.map(channel=>Math.floor(value*channel/255)),255];
 let instance;
 try {
  instance=plan.instantiateCanvases({group,makeCanvas:pixelCanvas},canvases);
  const owned=new Set(),disposals=new Map();
  instance.group.traverse(node=>{if(node.isMesh)for(const material of Array.isArray(node.material)?node.material:[node.material])owned.add(material.map);});
  assert.ok(owned.size>0);
  function check(pixels) {
   for(const texture of owned) {
    assert.equal(texture.isDataTexture,true);assert.equal(texture.image.width,1);assert.equal(texture.image.height,1);
    assert.deepEqual(Array.from(texture.image.data),pixels);assert.equal(texture.userData.semi,false);
   }
  }
  check(expected(255));
  for(const texture of owned) {disposals.set(texture,0);texture.addEventListener('dispose',()=>disposals.set(texture,disposals.get(texture)+1));}
  const next=Object.fromEntries(paths.map(path=>[path,pixelCanvas([128,128,128,255])]));
  instance.update(next);check(expected(128));
  instance.group.traverse(node=>{if(node.isMesh)for(const material of Array.isArray(node.material)?node.material:[node.material])assert.ok(owned.has(material.map));});
  const sourcesUnchanged=()=>{
   for(const source of Object.values(canvases))assert.deepEqual(Array.from(source.getContext('2d').getImageData(0,0,1,1).data),[255,255,255,255]);
   for(const source of Object.values(next))assert.deepEqual(Array.from(source.getContext('2d').getImageData(0,0,1,1).data),[128,128,128,255]);
  };
  sourcesUnchanged();
  return {...instance,dispose() {
   instance.dispose();instance.dispose();
   for(const count of disposals.values())assert.equal(count,1,'Banner-owned texture cleanup must be idempotent');
   sourcesUnchanged();
  }};
 } catch(error) {
  try{instance?.dispose();}catch(cleanupError){throw new AggregateError([error,cleanupError],'Banner CI and cleanup failed');}
  throw error;
 }
}
