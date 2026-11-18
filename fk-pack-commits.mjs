/* D02 preparation: the shell must route every pack write through this instance.
   Published live data is mutable; the writer snapshot remains private/frozen.
   publish must be a synchronous, non-throwing assignment. Never auto-rebase. */
export function createPackCommitter(writer,publish){
 if(!writer||typeof writer.read!=='function'||typeof writer.write!=='function'||typeof publish!=='function')throw new TypeError('Pack writer and publisher are required');
 const copy=value=>JSON.parse(JSON.stringify(value));
 let base=writer.read(),pending=false;
 const initial=copy(base.value);
 async function commit(next,options={}){
  if(pending)throw Object.assign(new Error('Another pack write is still pending; retry after it finishes'),{code:'PACK_WRITE_BUSY'});
  pending=true;
  try{
   const saved=await writer.write(base,next,options);
   const live=copy(saved.value);
   base=saved;publish(live);return true;
  }finally{pending=false;}
 }
 return Object.freeze({initial,commit,busy:()=>pending});
}
