/* Recovery host guards. No automatic save, rebase, form refill or editor reset. */
import {mountPackRecovery} from './fk-pack-recovery.mjs?v=0.9.35-d02-recovery';
export function createPackRecoveryHost(options){
 const document=options.document;
 let editor=null,token=null,committer=null,blocked=false;
 function key(state){return JSON.stringify([state.screen,options.getData().active,state.isNew,state.editor?.getMode(),state.editor?.current()]);}
 function context(){
  const state=options.getState();
  if(options.getCommitter()!==committer)return 'changed-storage';
  if(token&&(state.editor!==editor||!editor.isSaveCurrent(token)))return 'changed-draft';
  return key(state);
 }
 function canReload(){
  const state=options.getState(),current=options.getCommitter();
  if(blocked||document.hidden||!current||typeof current.reloadSaved!=='function'||current.busy()||state.migration)return false;
  if((state.controllers||[]).some(controller=>controller&&typeof controller.busy==='function'&&controller.busy()))return false;
  if(state.screen==='edit'&&document.getElementById('eSave')?.disabled)return false;
  if(state.screen==='add'&&state.editor&&(state.editor.busy()||state.editor.pendingEdit()))return false;
  return true;
 }
 const ui=mountPackRecovery(document,{lang:options.lang,context,getActive:()=>options.getData().active,canReload,
  reloadSaved(writeOptions){
   if(!canReload())throw Object.assign(new Error('Recovery is blocked by a pending operation'),{code:'PACK_WRITE_BUSY'});
   return options.getCommitter().reloadSaved(writeOptions);
  },afterReload:options.refresh,notice:options.notice});
 function show(error){
  if(error?.code!=='PACK_WRITE_CONFLICT')return false;
  if(document.getElementById('fkPackRecovery')?.open)return ui.show(error);
  const state=options.getState();editor=state.editor;token=null;blocked=false;committer=options.getCommitter();
  if(state.screen==='add'&&editor?.getMode()==='edit'){
   try{token=editor.captureSave()?.token||null;blocked=!token;}catch(error){blocked=true;}
  }
  return ui.show(error);
 }
 function close(){if(ui.busy())return;ui.close();editor=token=committer=null;blocked=false;}
 return {show,close,busy:ui.busy};
}
