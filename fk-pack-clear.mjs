/* D02 clear preparation; shell wiring follows separately.
   commitData must publish live state only after a successful write. */
export function createPackClear(options){
 let pending=null;
 function current(operation){return pending===operation&&!operation.controller.signal.aborted&&options.current();}
 function sync(){options.changed?.(!!pending);}
 function leave(){const operation=pending;pending=null;operation?.controller.abort();sync();}
 async function clear(){
  if(pending||!options.current())return false;
  let operation;
  try{
   if(!options.confirm())return false;
   if(!options.current())return false;
   operation={controller:new AbortController()};pending=operation;sync();
   if(!current(operation))return false;
   const result=await options.commitData({active:null,packs:[]},{signal:operation.controller.signal});
   if(result===false)throw new Error('Pack deletion was not saved');
   if(!current(operation))return false;
   options.say('msg.packs_deleted');return true;
  }catch(error){
   if(operation?current(operation):options.current())options.say('msg.save_failed',{detail:error?.message||String(error)});
   return false;
  }finally{
   if(operation&&pending===operation){pending=null;sync();}
  }
 }
 return {clear,leave,busy:()=>!!pending};
}
