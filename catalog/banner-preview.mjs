/* Banner preview composition reference: acacia-rs/acacia@750f657, banner.rs and entity/mod.rs.
   Native Bedrock pattern names are used. Source canvases and alpha are never overwritten. */
import {BANNER_PATTERNS} from './rules/banner-sources.mjs';
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export const BANNER_COLORS=Object.freeze({white:0xF9FFFE,orange:0xF9801D,magenta:0xC74EBD,light_blue:0x3AB3DA,yellow:0xFED83D,lime:0x80C71F,pink:0xF38BAA,gray:0x474F52,light_gray:0x9D9D97,cyan:0x169C9C,purple:0x8932B8,blue:0x3C44AA,brown:0x835432,green:0x5E7C16,red:0xB02E26,black:0x1D1D21});
function rgb(name) {
 if(typeof name!=='string'||!own(BANNER_COLORS,name))throw new Error('Invalid banner color');
 const value=BANNER_COLORS[name];return [value>>>16&255,value>>>8&255,value&255];
}
export function prepareBannerPlan(record,plan) {
 if(!dictionary(plan))throw new Error('Invalid banner preview plan');
 if(plan.model!=='banner')return plan;
 const source=record?.source,state=plan.state;
 if(record?.model!=='banner'||source?.template!=='banner'||!Array.isArray(record.paths)||!dictionary(source.patterns)||!dictionary(state)||!dictionary(plan.bindings)||plan.parts!==undefined||plan.bindings.sheet!==source.base||!record.paths.includes(source.base)||Object.keys(plan.bindings).length!==1)throw new Error('Missing banner source contract');
 const color=state.color??'white',requested=state.patterns??[];rgb(color);
 if(!Array.isArray(requested)||requested.length>16)throw new Error('Invalid banner pattern layers');
 const bindings={...plan.bindings};
 const layers=Array.from(requested).map((layer,index)=>{
  if(!dictionary(layer)||typeof layer.pattern!=='string'||!BANNER_PATTERNS.includes(layer.pattern)||!own(source.patterns,layer.pattern))throw new Error('Invalid banner pattern');
  rgb(layer.color);const path=source.patterns[layer.pattern];
  if(path!=='textures/entity/banner/banner_'+layer.pattern||!record.paths.includes(path))throw new Error('Banner pattern is outside the source');
  bindings['pattern_'+index]=path;
  return Object.freeze({pattern:layer.pattern,color:layer.color,path});
 });
 const banner=Object.freeze({base:source.base,color,layers:Object.freeze(layers)});
 return {...plan,bindings,state:{...state,color,patterns:layers.map(({pattern,color})=>({pattern,color}))},banner};
}
function image(value) {
 const w=value?.width,h=value?.height,data=value?.data;
 if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||w!==h||w*h>16777216||!['[object Uint8Array]','[object Uint8ClampedArray]'].includes(Object.prototype.toString.call(data))||data.length!==w*h*4)throw new Error('Invalid square banner image');
 return {width:w,height:h,data};
}
export function composeBannerPixels(base,layers,color='white') {
 const original=image(base),dye=rgb(color);
 if(!Array.isArray(layers)||layers.length>16)throw new Error('Invalid banner pixel layers');
 const selected=Array.from(layers).map(layer=>({image:image(layer?.image),dye:rgb(layer?.color)}));
 const {width:w,height:h}=original,data=new Uint8ClampedArray(original.data),right=Math.ceil(w*42/64),bottom=Math.ceil(h*41/64);
 for(let y=0;y<bottom;y++)for(let x=0;x<right;x++) {
  const i=(y*w+x)*4;
  for(let c=0;c<3;c++)data[i+c]=Math.floor(data[i+c]*dye[c]/255);
  if(data[i+3]===0)continue;
  for(const layer of selected) {
   const part=layer.image,j=(Math.floor(y*part.height/h)*part.width+Math.floor(x*part.width/w))*4,alpha=part.data[j+3];
   if(!alpha)continue;
   for(let c=0;c<3;c++) {
    const over=Math.floor(part.data[j+c]*layer.dye[c]/255);
    data[i+c]=Math.floor((over*alpha+data[i+c]*(255-alpha)+127)/255);
   }
  }
 }
 return {width:w,height:h,data};
}
export function composeBannerCanvases(spec,canvases,makeCanvas) {
 if(!dictionary(spec)||!Array.isArray(spec.layers)||!dictionary(canvases)||typeof makeCanvas!=='function')throw new Error('Invalid banner canvas input');
 function read(path) {
  const canvas=own(canvases,path)?canvases[path]:null;
  if(!canvas||typeof canvas.getContext!=='function')throw new Error('Missing banner canvas: '+path);
  const w=canvas.width,h=canvas.height;
  if(!Number.isSafeInteger(w)||w<1||w!==h||w*h>16777216)throw new Error('Invalid banner canvas dimensions');
  const context=canvas.getContext('2d');
  if(!context||typeof context.getImageData!=='function')throw new Error('Missing banner pixels');
  return image({width:w,height:h,data:context.getImageData(0,0,w,h)?.data});
 }
 const pixels=composeBannerPixels(read(spec.base),spec.layers.map(layer=>({image:read(layer.path),color:layer.color})),spec.color),output=makeCanvas();
 if(!output||Object.values(canvases).includes(output)||typeof output.getContext!=='function')throw new Error('Banner output must be a new canvas');
 output.width=pixels.width;output.height=pixels.height;
 const context=output.getContext('2d');
 if(!context||typeof context.createImageData!=='function'||typeof context.putImageData!=='function')throw new Error('Missing banner output context');
 const result=context.createImageData(pixels.width,pixels.height);
 if(!result?.data||result.data.length!==pixels.data.length||typeof result.data.set!=='function')throw new Error('Invalid banner output pixels');
 result.data.set(pixels.data);context.putImageData(result,0,0);
 return {...canvases,[spec.base]:output};
}
