/* Pinned vanilla PNG/TGA transport. Catalog compilation and GPU ownership stay elsewhere. */
const PIN='46ba6ea985fb5a92d79a9419198f10dda14c199d';
const RAW='https://raw.githubusercontent.com/Mojang/bedrock-samples/'+PIN+'/resource_pack/';
const CDN='https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@'+PIN+'/resource_pack/';
function loadImage(url){
 return new Promise(resolve=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url;});
}
const MAX_TGA_PIXELS=16777216;
/* Strict TGA reader: any truncated, overflowing or unsupported file is rejected instead of being padded with zeros. */
export function decodeTga(buffer){
 const b=new Uint8Array(buffer);if(b.length<18)return null;
 const idLength=b[0],colorMap=b[1],type=b[2],width=b[12]|(b[13]<<8),height=b[14]|(b[15]<<8),bpp=b[16],descriptor=b[17];
 const gray=type===3||type===11,rle=type===10||type===11;
 if(colorMap!==0||!(gray||type===2||type===10)||!(gray?bpp===8:bpp===24||bpp===32)||!width||!height||width*height>MAX_TGA_PIXELS||(descriptor&192)!==0)return null;
 const bytes=bpp>>3,total=width*height,pixels=new Uint8Array(total*bytes);let offset=18+idLength;
 if(!rle){
  if(offset+total*bytes>b.length)return null;
  pixels.set(b.subarray(offset,offset+total*bytes));
 }else{
  let count=0;
  while(count<total){
   if(offset>=b.length)return null;
   const header=b[offset++],length=(header&127)+1,run=(header&128)!==0,need=run?bytes:length*bytes;
   if(count+length>total||offset+need>b.length)return null;
   if(run){for(let i=0;i<length;i++)pixels.set(b.subarray(offset,offset+bytes),(count+i)*bytes);}
   else pixels.set(b.subarray(offset,offset+need),count*bytes);
   offset+=need;count+=length;
  }
 }
 const data=new Uint8ClampedArray(total*4),top=(descriptor&32)!==0,right=(descriptor&16)!==0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const source=((top?y:height-1-y)*width+(right?width-1-x:x))*bytes,target=(y*width+x)*4;
  if(bpp===8){data[target]=data[target+1]=data[target+2]=pixels[source];data[target+3]=255;}
  else{data[target]=pixels[source+2];data[target+1]=pixels[source+1];data[target+2]=pixels[source];data[target+3]=bpp===32?pixels[source+3]:255;}
 }
 return {width,height,data};
}
function loadTga(url){
 return fetch(url).then(response=>{if(!response.ok)throw new Error('TGA request failed');return response.arrayBuffer();}).then(buffer=>{
  const decoded=decodeTga(buffer);if(!decoded)return null;
  const canvas=document.createElement('canvas');canvas.width=decoded.width;canvas.height=decoded.height;
  canvas.getContext('2d').putImageData(new ImageData(decoded.data,decoded.width,decoded.height),0,0);
  return new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=canvas.toDataURL('image/png');});
 }).catch(()=>null);
}
export function loadVanillaImage(path){
 return loadImage(RAW+path+'.png').then(image=>image||loadImage(CDN+path+'.png')).then(image=>image||loadTga(RAW+path+'.tga')).then(image=>image||loadTga(CDN+path+'.tga'));
}
