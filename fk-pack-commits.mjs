/* The shell routes every pack write through this instance.
   Published live data is mutable; the writer snapshot remains private/frozen.
   publish must be a synchronous, non-throwing assignment. Never auto-rebase.
   reloadSaved is only for an explicitly confirmed recovery action. Callers must
   rebuild retries from the newly published data, not reuse an old candidate. */
export function createPackCommitter(writer,publish){
 if(!writer||typeof writer.read!=='function'||typeof writer.write!=='function'||typeof publish!=='function')throw new TypeError('Pack writer and publisher are required');
 const copy=value=>JSON.parse(JSON.stringify(value));
 let base=writer.read(),pending=false;
 const initial=copy(base.value);
 function reloadSaved({confirmed=false,active}={}){
  if(confirmed!==true)throw Object.assign(new Error('Reload requires explicit recovery confirmation'),{code:'PACK_RELOAD_CONFIRM_REQUIRED'});
  if(pending)throw Object.assign(new Error('A pack write is still pending'),{code:'PACK_WRITE_BUSY'});
  const saved=writer.read(),live=copy(saved.value);
  if(active!==undefined){
   if(active!==null&&(typeof active!=='string'||!live.packs.some(pack=>pack.id===active)))throw Object.assign(new Error('The draft pack no longer exists in saved data'),{code:'PACK_ACTIVE_REMOVED'});
   live.active=active;
  }
  base=saved;publish(live);return true;
 }
 async function commit(next,options={}){
  if(pending)throw Object.assign(new Error('Another pack write is still pending; retry after it finishes'),{code:'PACK_WRITE_BUSY'});
  pending=true;
  try{
   const saved=await writer.write(base,next,options);
   const live=copy(saved.value);
   base=saved;publish(live);return true;
  }finally{pending=false;}
 }
 return Object.freeze({initial,commit,reloadSaved,busy:()=>pending});
}
