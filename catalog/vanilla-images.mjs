/* Pinned vanilla PNG/TGA transport. Catalog compilation and GPU ownership stay elsewhere. */
const PIN='46ba6ea985fb5a92d79a9419198f10dda14c199d';
const RAW='https://raw.githubusercontent.com/Mojang/bedrock-samples/'+PIN+'/resource_pack/';
const CDN='https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@'+PIN+'/resource_pack/';
function loadImage(url){
 return new Promise(resolve=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url;});
}
function decodeTga(buffer){
 const b=new Uint8Array(buffer),idLength=b[0],colorMap=b[1],type=b[2],width=b[12]|(b[13]<<8),height=b[14]|(b[15]<<8),bpp=b[16],descriptor=b[17];
 if(colorMap!==0||![2,10,3,11].includes(type)||![24,32,8].includes(bpp)||!width||!height)return null;
 const bytes=bpp>>3,pixels=new Uint8Array(width*height*bytes);let offset=18+idLength,count=0;
 if(type===2||type===3)pixels.set(b.subarray(offset,offset+width*height*bytes));
 else while(count<width*height&&offset<b.length){
  const header=b[offset++],length=(header&127)+1;
  if(header&128){for(let i=0;i<length&&count<width*height;i++){for(let k=0;k<bytes;k++)pixels[count*bytes+k]=b[offset+k];count++;}offset+=bytes;}
  else for(let i=0;i<length&&count<width*height;i++){for(let k=0;k<bytes;k++)pixels[count*bytes+k]=b[offset++];count++;}
 }
 const data=new Uint8ClampedArray(width*height*4),top=(descriptor&32)!==0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const source=((top?y:height-1-y)*width+x)*bytes,target=(y*width+x)*4;
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
