/* D02 foundation; not yet connected to the shell. All writers must share the lock. */
import {normalizePackData} from './fk-pack-data.mjs?v=0.9.28';
function failure(code,message){return Object.assign(new Error(message),{code});}
function freeze(value){
 const pending=[value];
 while(pending.length){
  const item=pending.pop();
  if(!item||typeof item!=='object'||Object.isFrozen(item))continue;
  for(const child of Object.values(item))if(child&&typeof child==='object')pending.push(child);
  Object.freeze(item);
 }
 return value;
}
function checkSignal(signal){
 if(signal?.aborted)throw signal.reason===undefined?Object.assign(new Error('Pack write cancelled'),{name:'AbortError'}):signal.reason;
}
export function createPackWriter({storage,locks,key='fk070_packs'}){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof key!=='string'||!key)throw new TypeError('Pack storage and key are required');
 const revisions=new WeakMap();
 function snapshot(raw,value){
  const result=Object.freeze({value:freeze(value)});revisions.set(result,raw);return result;
 }
 return Object.freeze({
  read(){
   const raw=storage.getItem(key);
   return snapshot(raw,normalizePackData(raw===null?{active:null,packs:[]}:JSON.parse(raw)));
  },
  async write(base,next,{signal}={}){
   if(!base||!revisions.has(base))throw failure('PACK_SNAPSHOT_INVALID','Snapshot belongs to another pack writer');
   if(!locks||typeof locks.request!=='function')throw failure('PACK_LOCKS_UNAVAILABLE','Safe pack writes require Web Locks');
   checkSignal(signal);
   const value=normalizePackData(JSON.parse(JSON.stringify(next))),raw=JSON.stringify(value),prepared=snapshot(raw,value),expected=revisions.get(base);
   return locks.request(key+':write',{mode:'exclusive',...(signal?{signal}:{})},()=>{
    checkSignal(signal);
    if(storage.getItem(key)!==expected)throw failure('PACK_WRITE_CONFLICT','Saved packs changed in another tab; local draft was not saved');
    storage.setItem(key,raw);return prepared;
   });
  }
 });
}
