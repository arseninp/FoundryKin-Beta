/* Pack-list presentation and action lifecycle; the shell owns data and persistence. */
const mounted=new WeakSet();
export function mountPackList(list,options){
 if(mounted.has(list))throw new Error('Pack list already mounted');
 mounted.add(list);
 const {getData,t,escape:esc}=options;
 let pending=null;
 function current(operation){return pending===operation&&!operation.controller.signal.aborted&&options.current();}
 function finish(operation){if(pending===operation){pending=null;list.inert=false;}}
 function leave(){const operation=pending;pending=null;list.inert=false;operation?.controller.abort();}
 function render(){
  leave();
  const data=getData();
  if(!data.packs.length)list.innerHTML='<p class="lbl">'+esc(t('packs.empty'))+'</p>';
  else list.innerHTML=data.packs.map(pack=>{
   const id=esc(pack.id);
   return '<div class="card"><div class="pk"><img src="'+esc(pack.icon||options.icon)+'" alt=""><div class="n"><b>'+esc(pack.name)+'</b><span class="lbl">'+esc(t('pack.card_sub',{version:pack.version,n:pack.textures.length}))+'</span></div></div>'+
    '<div class="acts"><button data-variant="accent" data-a="open" data-id="'+id+'">'+esc(t('act.textures'))+'</button><button data-a="exp" data-id="'+id+'">'+esc(t('act.export'))+'</button><button data-a="edit" data-id="'+id+'">'+esc(t('act.edit'))+'</button><button data-a="del" data-id="'+id+'">'+esc(t('act.delete'))+'</button></div></div>';
  }).join('');
  options.renderBackups?.();
 }
 list.addEventListener('click',async event=>{
  if(pending||!options.current())return;
  const node=event.target.closest('[data-a]');if(!node)return;
  const id=node.dataset.id,action=node.dataset.a,pack=getData().packs.find(pack=>pack.id===id);
  if(!pack||!['open','edit','exp','del'].includes(action))return;
  let operation,selected;
  try{
   if(action==='del'&&!options.confirmDelete(pack))return;
   operation={controller:new AbortController()};pending=operation;list.inert=true;
   const writeOptions={signal:operation.controller.signal};
   const result=action==='del'?options.deletePack(id,writeOptions):options.select(id,writeOptions);
   const accepted=result&&typeof result.then==='function'?await result:result;
   if(action==='del'?accepted!==true:accepted===false)throw new Error('Pack action was not saved');
   if(!current(operation))return;
   if(action!=='del'){selected=getData().packs.find(pack=>pack.id===id);if(!selected)return;}
  }catch(error){
   if(operation?current(operation):options.current())options.fail(error);
   operation?.controller.abort();return;
  }finally{if(operation)finish(operation);}
  if(action==='del')render();
  if(action==='open')options.open();
  if(action==='edit')options.edit();
  if(action==='exp')options.exportPack(selected);
 });
 return {render,leave,busy:()=>!!pending};
}
