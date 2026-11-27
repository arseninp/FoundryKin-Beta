import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeTga} from '../catalog/vanilla-images.mjs';
const LIMIT=16777216;
function header({type,bpp,width,height,descriptor=0,id=0,colorMap=0}){
 const h=Buffer.alloc(18);h[0]=id;h[1]=colorMap;h[2]=type;h.writeUInt16LE(width,12);h.writeUInt16LE(height,14);h[16]=bpp;h[17]=descriptor;return h;
}
function pixelsOf(width,height,stride,seed){
 const out=[];for(let i=0;i<width*height;i++){const p=[];for(let k=0;k<stride;k++)p.push((seed+i*37+k*11+(i%3===0?0:i*5))&255);out.push(p);}return out;
}
function rlePayload(list){
 const parts=[];let i=0;
 while(i<list.length){
  let run=1;while(i+run<list.length&&run<128&&Buffer.compare(Buffer.from(list[i+run]),Buffer.from(list[i]))===0)run++;
  if(run>1){parts.push(Buffer.from([128|(run-1)]),Buffer.from(list[i]));i+=run;continue;}
  let raw=1;while(i+raw<list.length&&raw<128&&Buffer.compare(Buffer.from(list[i+raw]),Buffer.from(list[i+raw-1]))!==0)raw++;
  parts.push(Buffer.from([raw-1]),...list.slice(i,i+raw).map(p=>Buffer.from(p)));i+=raw;
 }
 return Buffer.concat(parts);
}
function build(options){
 const {type,bpp,width,height,id=0}=options,stride=bpp/8,list=options.list||pixelsOf(width,height,stride,options.seed||3);
 const body=type===10||type===11?rlePayload(list):Buffer.concat(list.map(p=>Buffer.from(p)));
 return {file:Buffer.concat([header(options),Buffer.alloc(id,7),body]),list,body};
}
function reference({type,bpp,width,height,descriptor=0},list){
 const gray=type===3||type===11,out=Buffer.alloc(width*height*4);
 list.forEach((p,index)=>{
  const row=Math.floor(index/width),column=index%width,y=descriptor&32?row:height-1-row,x=descriptor&16?width-1-column:column;
  const value=gray?[p[0],p[0],p[0],255]:[p[2],p[1],p[0],bpp===32?p[3]:255];out.set(value,(y*width+x)*4);
 });
 return out;
}
const decode=file=>decodeTga(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength));
const kinds=[[2,24],[2,32],[10,24],[10,32],[3,8],[11,8]];
test('valid files match an independent reference for every type, depth, origin and size',()=>{
 for(const [type,bpp] of kinds)for(const descriptor of [0,32,16,48,8])for(const [width,height] of [[1,1],[3,2],[5,4],[7,1],[1,6]])for(const id of [0,5]){
  const options={type,bpp,width,height,descriptor,id,seed:width*13+height},{file,list}=build(options),decoded=decode(file);
  assert.ok(decoded,[type,bpp,descriptor,width,height,id].join());
  assert.equal(decoded.width,width);assert.equal(decoded.height,height);
  assert.ok(Buffer.from(decoded.data).equals(reference(options,list)),[type,bpp,descriptor,width,height,id].join());
 }
});
test('run-length packets may cross scanlines and long runs split at 128 pixels',()=>{
 const width=20,height=14,list=Array.from({length:width*height},(_,i)=>i<200?[9,8,7,255]:[i&255,1,2,3]),options={type:10,bpp:32,width,height,descriptor:32},{file}=build({...options,list});
 assert.ok(Buffer.from(decode(file).data).equals(reference(options,list)));
});
test('files with an unsupported header are rejected',()=>{
 const good=build({type:2,bpp:24,width:2,height:2}).file;
 assert.ok(decode(good));
 assert.equal(decode(good.subarray(0,17)),null);assert.equal(decode(Buffer.alloc(0)),null);
 for(const [name,patch] of [['color map',{colorMap:1}],['type 1',{type:1}],['type 9',{type:9}],['16 bit',{bpp:16}],['gray 24',{type:3,bpp:24}],['gray 32 rle',{type:11,bpp:32}],['colour 8',{type:2,bpp:8}],['colour 8 rle',{type:10,bpp:8}],['zero width',{width:0}],['zero height',{height:0}],['interleave 64',{descriptor:64}],['interleave 128',{descriptor:128}]]){
  const file=Buffer.concat([header({type:2,bpp:24,width:2,height:2,...patch}),good.subarray(18)]);
  assert.equal(decode(file),null,name);
 }
});
test('dimensions above the pixel limit are rejected before any pixel buffer is allocated',()=>{
 for(const [width,height] of [[4097,4097],[65535,65535],[65535,1000],[1,0]]){
  const file=Buffer.concat([header({type:2,bpp:32,width,height}),Buffer.alloc(16)]);
  assert.equal(decode(file),null,width+'x'+height);
 }
 assert.ok(4096*4096===LIMIT);
 const rle=Buffer.concat([header({type:11,bpp:8,width:4096,height:4096}),Buffer.concat(Array.from({length:LIMIT/128},()=>Buffer.from([255,9])))]);
 const decoded=decode(rle);assert.equal(decoded.width,4096);assert.equal(decoded.data[0],9);assert.equal(decoded.data.length,LIMIT*4);
});
test('truncated raw data is rejected, not padded with zeros',()=>{
 for(const [type,bpp] of [[2,24],[2,32],[3,8]]){
  const {file}=build({type,bpp,width:3,height:3});
  assert.ok(decode(file));assert.equal(decode(file.subarray(0,file.length-1)),null);assert.equal(decode(file.subarray(0,18)),null);
  const withId=build({type,bpp,width:3,height:3,id:4}).file;assert.equal(decode(withId.subarray(0,19)),null);
 }
});
test('truncated or overflowing run-length data is rejected',()=>{
 const options={type:10,bpp:24,width:4,height:4},{file,body}=build({...options,list:pixelsOf(4,4,3,1)});
 assert.ok(decode(file));
 assert.equal(decode(file.subarray(0,file.length-1)),null);
 assert.equal(decode(file.subarray(0,18)),null);
 assert.equal(decode(file.subarray(0,19)),null);
 const run=Buffer.concat([header(options),Buffer.from([128|3,1,2,3])]);assert.equal(decode(run),null);
 const rawPacket=Buffer.concat([header(options),Buffer.from([7]),Buffer.alloc(8*3,4),Buffer.from([7]),Buffer.alloc(3,4)]);assert.equal(decode(rawPacket),null);
 const overflowRun=Buffer.concat([header(options),Buffer.from([128|31,1,2,3])]);assert.equal(decode(overflowRun),null);
 const overflowRaw=Buffer.concat([header(options),Buffer.from([20]),Buffer.alloc(21*3,5)]);assert.equal(decode(overflowRaw),null);
 const exact=Buffer.concat([header(options),Buffer.from([128|15,1,2,3])]);assert.ok(decode(exact));
 assert.ok(body.length>0);
});
test('right-to-left origin mirrors columns and top origin keeps rows',()=>{
 const list=[[1,0,0],[2,0,0],[3,0,0],[4,0,0],[5,0,0],[6,0,0]];
 const read=descriptor=>{const d=decode(build({type:2,bpp:24,width:3,height:2,descriptor,list}).file);return [0,1,2,3,4,5].map(i=>d.data[i*4+2]);};
 assert.deepEqual(read(32),[1,2,3,4,5,6]);
 assert.deepEqual(read(0),[4,5,6,1,2,3]);
 assert.deepEqual(read(48),[3,2,1,6,5,4]);
 assert.deepEqual(read(16),[6,5,4,3,2,1]);
});
