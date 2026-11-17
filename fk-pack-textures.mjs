/* Saved-texture presentation and action lifecycle; the shell owns commits and editor state. */
const mounted=new WeakSet();
export function mountPackTextures(list,options){
 if(mounted.has(list))throw new Error('Pack textures already mounted');
 mounted.add(list);
 const {getData,t,escape:esc}=options;
 let pending=null;
 function active(root){return root.packs.find(pack=>pack.id===root.active);}
 function current(operation){return pending===operation&&!operation.controller.signal.aborted&&options.current()&&getData().active===operation.id;}
 function finish(operation){if(pending===operation){pending=null;list.inert=false;}}
 function leave(){const operation=pending;pending=null;list.inert=false;operation?.controller.abort();}
 function begin(id){const operation={id,controller:new AbortController()};pending=operation;list.inert=true;return operation;}
 function context(index){const root=getData(),pack=active(root),texture=pack?.textures[index];return texture?{root,pack,texture,path:texture.path,data:texture.data}:null;}
 function unchanged(value,operation){return current(operation)&&getData()===value.root&&active(value.root)===value.pack&&value.pack.textures.includes(value.texture)&&value.texture.path===value.path&&value.texture.data===value.data;}
 function commit(value,textures,operation){return options.commitData({...value.root,packs:value.root.packs.map(pack=>pack===value.pack?{...pack,textures}:pack)},{signal:operation.controller.signal});}
 function fail(error,key){options.say(key,{detail:error&&error.message||String(error)});}
 function groups(pack){
  const result=[],index=new Map();
  for(const [textureIndex,texture] of pack.textures.entries()){
   const key=texture.obj?'o:'+texture.obj:'f:'+texture.path;
   if(!index.has(key)){index.set(key,result.length);result.push({obj:texture.obj||null,all:texture.all||null,items:[]});}
   const group=result[index.get(key)];if(!group.all&&texture.all)group.all=texture.all;
   group.items.push({texture,index:textureIndex});
  }
  return result;
 }
 function render(){
  leave();const pack=active(getData());
  if(!pack){list.innerHTML='';return;}
  if(!pack.textures.length){list.innerHTML='<p class="lbl">'+esc(t('tex.empty'))+'</p>';return;}
  list.innerHTML=groups(pack).map(group=>{
   let shown=group.items[0];
   if(group.all){for(const path of group.all){const item=group.items.find(item=>'textures/'+item.texture.path===path);if(item){shown=item;break;}}}
   const title=group.obj?options.nice(group.obj):group.items[0].texture.path;
   let sub='';
   if(group.obj&&group.all){const have=new Set(group.items.map(item=>'textures/'+item.texture.path));const count=group.all.filter(path=>have.has(path)).length;sub='<span class="lbl">'+esc(t('tex.edited_of',{n:count,total:group.all.length}))+'</span>';}
   const rows=group.items.map(item=>{
    const i=item.index;
    return '<div class="row"><span class="lbl" style="flex:1 1 100%;margin:0;word-break:break-all">'+esc(item.texture.path)+'</span>'+
     '<button class="btn" data-a="edit" data-i="'+i+'">'+esc(t('act.edit'))+'</button><label class="btn" for="rep'+i+'">'+esc(t('ui.replace'))+'</label><input type="file" id="rep'+i+'" accept="image/png" data-a="rep" data-i="'+i+'"><button class="btn" data-a="png" data-i="'+i+'">'+esc(t('act.export_png'))+'</button><button class="btn" data-a="del" data-i="'+i+'">'+esc(t('act.delete'))+'</button></div>';
   }).join('');
   return '<div class="tcard"><div class="tx"><img src="'+esc(shown.texture.data)+'" alt=""><div><b>'+esc(title)+'</b><br>'+sub+'</div></div>'+rows+'</div>';
  }).join('');
 }
 function read(file,operation){
  return new Promise((resolve,reject)=>{
   const reader=options.makeReader?options.makeReader():new FileReader(),signal=operation.controller.signal;
   let settled=false;
   function settle(ok,value){if(settled)return;settled=true;reader.onload=reader.onerror=reader.onabort=null;signal.removeEventListener('abort',cancel);if(ok)resolve(value);else reject(value);}
   function cancel(){settle(false,signal.reason);try{if(reader.readyState===1)reader.abort();}catch(error){}}
   reader.onload=()=>settle(true,reader.result);
   reader.onerror=()=>settle(false,new Error('Texture file could not be read'));
   reader.onabort=()=>settle(false,new Error('Texture file reading was cancelled'));
   signal.addEventListener('abort',cancel,{once:true});
   if(signal.aborted){cancel();return;}
   try{reader.readAsDataURL(file);}catch(error){settle(false,error);}
  });
 }
 list.addEventListener('click',async event=>{
  if(pending||!options.current())return;
  const button=event.target.closest('button');if(!button)return;
  const value=context(+button.dataset.i);if(!value)return;
  const action=button.dataset.a;
  if(action==='png'){options.exportPNG(value.texture);return;}
  if(action==='edit'){options.edit(value.texture);return;}
  if(action!=='del')return;
  let operation;
  try{
   if(!options.confirmDelete(value.texture))return;
   operation=begin(value.pack.id);if(!unchanged(value,operation))return;
   const result=commit(value,value.pack.textures.filter(texture=>texture!==value.texture),operation);
   if((result&&typeof result.then==='function'?await result:result)===false)throw new Error('Texture deletion was not saved');
   if(!current(operation))return;
  }catch(error){if(operation?current(operation):options.current())fail(error,'msg.save_failed');operation?.controller.abort();return;}
  finally{if(operation)finish(operation);}
  render();
 });
 list.addEventListener('change',async event=>{
  const input=event.target;if(input.dataset.a!=='rep'||!input.files?.[0])return;
  const file=input.files[0];input.value='';
  if(pending||!options.current())return;
  const value=context(+input.dataset.i);if(!value)return;
  let operation,reading=true;
  try{
   if(!options.confirmReplace(value.texture))return;
   operation=begin(value.pack.id);if(!unchanged(value,operation))return;
   const data=await read(file,operation);if(!unchanged(value,operation))return;
   reading=false;
   const textures=value.pack.textures.map(texture=>texture===value.texture?{...texture,data}:texture);
   const result=commit(value,textures,operation);
   if((result&&typeof result.then==='function'?await result:result)===false)throw new Error('Texture replacement was not saved');
   if(!current(operation))return;
  }catch(error){if(operation?current(operation):options.current())fail(error,reading?'msg.file_unreadable':'msg.save_failed');operation?.controller.abort();return;}
  finally{if(operation)finish(operation);}
  render();options.say('msg.texture_replaced');
 });
 return {render,leave,busy:()=>!!pending};
}
