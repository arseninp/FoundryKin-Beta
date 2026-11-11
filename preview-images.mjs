/* Read-only texture sources and manual frame helpers. No playback or pack writes. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function activePack(storage) {
 const raw=storage.getItem('fk070_packs');if(!raw)throw new Error('No saved packs');
 const data=JSON.parse(raw),pack=data?.packs?.find(pack=>pack.id===data.active);
 if(!pack||!Array.isArray(pack.textures))throw new Error('No active pack');
 const textures=Object.create(null);
 for(const row of pack.textures) {
  if(!row.data)continue;
  if(typeof row.path!=='string'||typeof row.data!=='string'||!row.data.startsWith('data:image/png;base64,'))throw new Error('Invalid saved PNG');
  const path='textures/'+row.path.replace(/\.png$/i,'');
  if(own(textures,path)&&textures[path]!==row.data)throw new Error('Ambiguous saved texture: '+path);
  textures[path]=row.data;
 }
 return textures;
}
export function imageFrames(image) {
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width>16384||height>16384||width*height>16777216)throw new Error('Image exceeds review limits');
 return {width,height,count:height>width&&height%width===0?height/width:1};
}
export function frameCanvas(image,index,makeCanvas) {
 const {width,height,count}=imageFrames(image);
 if(!Number.isInteger(index)||index<0||index>=count)throw new Error('Invalid source frame');
 const canvas=makeCanvas();canvas.width=width;canvas.height=count>1?width:height;
 const context=canvas.getContext('2d');if(!context)throw new Error('Canvas 2D is unavailable');
 context.imageSmoothingEnabled=false;context.drawImage(image,0,count>1?index*width:0,width,canvas.height,0,0,width,canvas.height);
 return canvas;
}
export function createImageSource(loadVanilla,decodePNG,options={}) {
 if(typeof loadVanilla!=='function'||typeof decodePNG!=='function'||!dictionary(options))throw new Error('Invalid image source configuration');
 const timeoutMs=options.timeoutMs??20000,maxEntries=options.maxEntries??32,maxPixels=options.maxPixels??16777216;
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>2147483647||!Number.isSafeInteger(maxEntries)||maxEntries<1||!Number.isSafeInteger(maxPixels)||maxPixels<1)throw new Error('Invalid image source limits');
 // Optional observer receives metadata only; diagnostic failures never affect image loading.
 const diagnostic=options.onDiagnostic;
 function notify(level,message,details,error){try{if(typeof diagnostic==='function')diagnostic(level,message,details,error)}catch(ignored){}}
 const cache=new Map();let pixels=0;
 function remove(path) {
  const item=cache.get(path);if(!item)return;
  cache.delete(path);pixels-=item.pixels;
 }
 function trim() {
  while(cache.size>maxEntries||pixels>maxPixels)remove(cache.keys().next().value);
 }
 return function(path,overrides) {
  if(typeof path!=='string'||!path.startsWith('textures/')||path.split('/').some(part=>!part||part==='.'||part==='..'))return Promise.reject(new Error('Invalid resource path'));
  if(!dictionary(overrides))return Promise.reject(new Error('Invalid texture overrides'));
  const data=own(overrides,path)?overrides[path]:null,hit=cache.get(path);
  if(hit&&hit.data===data){cache.delete(path);cache.set(path,hit);return hit.promise;}
  remove(path);
  const started=Date.now(),source=data===null?'vanilla':'saved',stage=data===null?'fetch':'decode';
  function details(extra={}){return {path,source,stage,duration:Math.max(0,Date.now()-started),...extra};}
  notify('info','image load started',details());
  const item={data,promise:null,pixels:0};let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Image load timeout: '+path)),timeoutMs);});
  const operation=Promise.resolve().then(()=>data===null?loadVanilla(path):decodePNG(data));
  item.promise=Promise.race([operation,deadline]).then(image=>{
   if(!image)throw new Error('Missing texture: '+path);
   const dimensions=imageFrames(image);
   if(cache.get(path)===item){item.pixels=dimensions.width*dimensions.height;pixels+=item.pixels;trim();}
   notify('info','image load completed',details({stage:'ready',width:dimensions.width,height:dimensions.height}));
   return image;
  }).catch(error=>{if(cache.get(path)===item)remove(path);notify('error','image load failed',details(),error);throw error;}).finally(()=>clearTimeout(timer));
  cache.set(path,item);trim();return item.promise;
 };
}
