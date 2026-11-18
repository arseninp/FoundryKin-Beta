/* Explicit conflict recovery UI only. The host owns draft identity and reload.
   afterReload must not refill forms or reset editor canvases/history. */
const TEXT={
 en:{title:'Saved packs changed',body:'Another tab changed the saved packs. This draft was not saved. Nothing will be overwritten automatically.',keep:'Keep draft',reload:'Read current saved packs',confirm:'Read the current saved packs while keeping this draft open? Nothing will be saved automatically. Check the draft before saving again: its fields or edited card textures may replace changes from the other tab.',busy:'An operation is still pending. Wait for it to finish.',changed:'The screen or draft target changed. Close this message and try again.',removed:'The draft pack was deleted from saved data. Reload was refused; the draft was left open.',failed:'Could not read the saved packs. No storage write was performed.',viewFailed:'Saved packs reloaded, but the view could not be updated. The draft was not saved automatically.',done:'Saved packs reloaded. The draft was not saved automatically. Review it before saving again.',unsupported:'Saved packs changed in another tab. The draft was not saved. Automatic reload is disabled.'},
 ru:{title:'Сохранённые паки изменились',body:'Другая вкладка изменила сохранённые паки. Этот черновик не сохранён. Автоматически ничего не перезаписывается.',keep:'Оставить черновик',reload:'Прочитать актуальные паки',confirm:'Прочитать актуальные сохранённые паки, оставив этот черновик открытым? Автоматического сохранения не будет. Перед повторным сохранением проверьте черновик: его поля или текстуры редактируемой карточки могут заменить изменения другой вкладки.',busy:'Операция ещё выполняется. Дождитесь её завершения.',changed:'Экран или пак черновика изменился. Закройте сообщение и повторите действие.',removed:'Пак черновика удалён из сохранённых данных. Перечитывание отклонено, черновик оставлен открытым.',failed:'Не удалось прочитать сохранённые паки. Запись в хранилище не выполнялась.',viewFailed:'Сохранённые паки перечитаны, но обновить отображение не удалось. Черновик не сохранялся автоматически.',done:'Сохранённые паки перечитаны. Черновик не сохранён автоматически. Проверьте его перед повторным сохранением.',unsupported:'Сохранённые паки изменились в другой вкладке. Черновик не сохранён. Автоматическое перечитывание отключено.'}
};
export function mountPackRecovery(document,options){
 if(document.getElementById('fkPackRecovery'))throw new Error('Pack recovery already mounted');
 let context=null,active=null,recovering=false;
 const t=key=>TEXT[options.lang()==='ru'?'ru':'en'][key];
 function el(tag,id,cls){const node=document.createElement(tag);node.id=id;if(cls)node.className=cls;return node;}
 const dialog=el('dialog','fkPackRecovery','tcard fkRecovery'),title=el('h2','fkPackRecoveryTitle'),body=el('p','fkPackRecoveryBody','lbl'),error=el('p','fkPackRecoveryError','lbl'),row=el('div','fkPackRecoveryActions','row'),keep=el('button','fkPackRecoveryKeep','btn'),reload=el('button','fkPackRecoveryReload','btn');
 dialog.setAttribute('aria-labelledby',title.id);dialog.setAttribute('aria-describedby',body.id);error.setAttribute('role','status');
 keep.type=reload.type='button';keep.autofocus=true;row.appendChild(keep);row.appendChild(reload);
 for(const node of [title,body,error,row])dialog.appendChild(node);document.body.appendChild(dialog);
 function close(){if(recovering)return;if(dialog.open)dialog.close();context=null;}
 keep.onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 reload.onclick=function(){
  if(recovering||!dialog.open)return false;
  error.textContent='';
  try{
   if(options.context()!==context){error.textContent=t('changed');return false;}
   if(!options.canReload()){error.textContent=t('busy');return false;}
   recovering=true;keep.disabled=reload.disabled=true;
   const ask=options.confirmAction||confirm;if(!ask(t('confirm')))return false;
   if(options.context()!==context){error.textContent=t('changed');return false;}
   if(!options.canReload()){error.textContent=t('busy');return false;}
   if(options.reloadSaved({confirmed:true,active})!==true)throw new Error('Recovery was not accepted');
   dialog.close();context=null;
   try{options.afterReload();}catch(error){options.notice(t('viewFailed'));return true;}
   options.notice(t('done'));return true;
  }catch(failure){
   error.textContent=t(failure?.code==='PACK_ACTIVE_REMOVED'?'removed':failure?.code==='PACK_WRITE_BUSY'?'busy':'failed');return false;
  }finally{recovering=false;keep.disabled=reload.disabled=false;}
 };
 function show(failure){
  if(failure?.code!=='PACK_WRITE_CONFLICT')return false;
  if(dialog.open)return true;
  title.textContent=t('title');body.textContent=t('body');error.textContent='';keep.textContent=t('keep');reload.textContent=t('reload');
  if(typeof dialog.showModal!=='function'){options.notice(t('unsupported'));return false;}
  context=options.context();active=options.getActive();
  try{dialog.showModal();return true;}catch(error){context=null;options.notice(t('unsupported'));return false;}
 }
 return {show,close,busy:()=>recovering};
}
