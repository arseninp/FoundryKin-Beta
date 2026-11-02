/* Pixel-exact canvas uploads. This batch owns GPU textures, never the input canvases. */
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function createModelTextures(Three,paths,canvases) {
 if(!Three||typeof Three.DataTexture!=='function'||Three.RGBAFormat===undefined||Three.NearestFilter===undefined)throw new Error('Model textures require Three');
 if(!Array.isArray(paths)||!paths.length||paths.some(path=>typeof path!=='string'||!path.startsWith('textures/'))||!dictionary(canvases))throw new Error('Invalid model texture input');
 const sources=[...new Set(paths)].map(path=>{
  const canvas=Object.hasOwn(canvases,path)?canvases[path]:null,w=canvas?.width,h=canvas?.height;
  if(!Number.isSafeInteger(w)||w<=0||!Number.isSafeInteger(h)||h<=0||!Number.isSafeInteger(w*h*4)||typeof canvas.getContext!=='function')throw new Error('Invalid model canvas: '+path);
  const context=canvas.getContext('2d');
  if(!context||typeof context.getImageData!=='function')throw new Error('Missing canvas pixels: '+path);
  const pixels=context.getImageData(0,0,w,h)?.data;
  if(!['[object Uint8Array]','[object Uint8ClampedArray]'].includes(Object.prototype.toString.call(pixels))||pixels.length!==w*h*4)throw new Error('Invalid canvas pixel data: '+path);
  const data=new Uint8Array(pixels.length),stride=w*4;let semi=false;
  for(let y=0;y<h;y++) {
   const row=pixels.subarray(y*stride,(y+1)*stride);data.set(row,(h-1-y)*stride);
   for(let x=3;x<stride;x+=4)if(row[x]>0&&row[x]<255)semi=true;
  }
  return {path,w,h,data,semi};
 });
 const textures=Object.create(null),owned=[];let disposed=false;
 function dispose() {
  if(disposed)return;disposed=true;
  const errors=[];for(const texture of owned)try{texture.dispose();}catch(error){errors.push(error);}
  if(errors.length)throw new AggregateError(errors,'Model texture cleanup failed');
 }
 try {
  for(const {path,w,h,data,semi} of sources) {
   const texture=new Three.DataTexture(data,w,h,Three.RGBAFormat);owned.push(texture);
   if(texture.isTexture!==true||typeof texture.dispose!=='function')throw new Error('Invalid model texture: '+path);
   texture.magFilter=texture.minFilter=Three.NearestFilter;texture.generateMipmaps=false;texture.flipY=false;
   texture.userData={...texture.userData,semi};texture.needsUpdate=true;textures[path]=texture;
  }
 }catch(error){
  try{dispose();}catch(cleanupError){throw new AggregateError([error,cleanupError],'Model texture creation and cleanup failed');}
  throw error;
 }
 return Object.freeze({textures:Object.freeze(textures),dispose});
}
