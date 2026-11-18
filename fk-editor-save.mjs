/* Prepared D02 controller; not connected to the shell yet.
   editor.captureSave() returns {token,files,object}; isSaveCurrent(token)
   and markSaved(token) must reject superseded drafts. commitData returns
   boolean/void or a Promise of either, throwing/rejecting on failure. */
export function createEditorSave(options){
 const {getData,editor,commitData}=options;
 let pending=null;
 function current(operation){
  return pending===operation&&!operation.controller.signal.aborted&&options.current()&&getData().active===operation.id&&editor.isSaveCurrent(operation.token);
 }
 function sync(){options.changed?.(!!pending);}
 function leave(){
  const operation=pending;pending=null;
  operation?.controller.abort();sync();
 }
 async function save(){
  if(pending||!options.current())return false;
  let operation;
  try{
   const root=getData(),pack=root.packs.find(value=>value.id===root.active);
   if(!pack){options.say('msg.no_active_pack');return false;}
   const captured=editor.captureSave();
   if(!captured){options.say('msg.editor_not_ready');return false;}
   if(!captured.files.length){options.say('msg.edit_texture_first');return false;}
   const textures=pack.textures.slice();
   for(const file of captured.files){
    const path=file.path.replace(/^textures\//,'').replace(/\.png$/,'');
    for(let index=textures.length-1;index>=0;index--)if(textures[index].path===path)textures.splice(index,1);
    const record={path,data:file.data};
    if(captured.object?.id){record.obj=captured.object.id;record.all=captured.object.paths.slice();}
    textures.push(record);
   }
   const candidate={...root,packs:root.packs.map(value=>value===pack?{...pack,textures}:value)};
   operation={id:pack.id,token:captured.token,controller:new AbortController()};
   pending=operation;sync();
   if(!current(operation)||getData()!==root)return false;
   const result=await commitData(candidate,{signal:operation.controller.signal});
   if(result===false)throw new Error('Editor textures were not saved');
   if(!current(operation))return false;
   if(editor.markSaved(operation.token)!==true)return false;
   options.say('msg.added',{name:pack.name,n:captured.files.length});
   return true;
  }catch(error){
   if(operation?current(operation):options.current())options.say('msg.save_failed',{detail:error?.message||String(error)});
   return false;
  }finally{
   if(operation&&pending===operation){pending=null;sync();}
  }
 }
 return {save,leave,busy:()=>!!pending};
}
