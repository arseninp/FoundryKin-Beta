/* Shell owns navigation/root. save({signal}) returns boolean or Promise<boolean>. */
export function mountPackForm(document,options){
 const $=selector=>document.querySelector(selector);
 let draftIcon='',generation=0,pendingIcon=null,pendingSave=null;
 function sync(){
  $('#s-edit').inert=!!pendingSave;$('#eSave').disabled=!!(pendingSave||pendingIcon);
 }
 function cancelIcon(){
  generation++;
  const request=pendingIcon;pendingIcon=null;
  if(request&&request.readyState===1)request.abort();
  sync();
 }
 function rollback(request){
  const {data,pack,isNew,before,after,previousActive}=request;
  if(options.getData()!==data)return;
  const index=data.packs.indexOf(pack);if(index<0)return;
  if(isNew)data.packs.splice(index,1);
  else for(const key of Object.keys(before))if(pack[key]===after[key])pack[key]=before[key];
  if(data.active===pack.id)data.active=previousActive;
 }
 function leave(){
  cancelIcon();
  const request=pendingSave;pendingSave=null;
  if(request){rollback(request);request.controller.abort();}
  sync();
 }
 function fill(){
  leave();
  const pack=options.isNew()?null:options.active();if(!options.isNew()&&!pack)return;
  const value=pack||{name:'',author:'',desc:'',version:'',game:'',icon:''};
  $('#eName').value=value.name;$('#eAuthor').value=value.author;$('#eDesc').value=value.desc;
  $('#eVer').value=value.version;$('#eGame').value=value.game;
  draftIcon=value.icon||'';$('#eIco').src=draftIcon||options.icon;
  $('#eJson').value=pack?JSON.stringify(options.manifest(pack),null,2):'';
  options.setDirty(false);
 }
 document.querySelectorAll('#s-edit input[type=text]').forEach(input=>input.addEventListener('input',()=>options.setDirty(true)));
 $('#eIcoF').onchange=function(){
  if(pendingSave)return;
  const file=this.files[0];this.value='';if(!file)return;
  cancelIcon();const token=generation,isNew=options.isNew(),pack=options.active();
  function current(){return token===generation&&options.current()&&options.isNew()===isNew&&options.active()===pack;}
  const request=new FileReader();pendingIcon=request;sync();
  function complete(){const valid=current();if(pendingIcon===request){pendingIcon=null;sync();}return valid;}
  request.onload=function(){if(!complete())return;draftIcon=request.result;$('#eIco').src=draftIcon;options.setDirty(true);};
  request.onerror=function(){if(complete())options.say('msg.file_unreadable');};
  request.onabort=complete;
  try{request.readAsDataURL(file);}catch(error){if(complete())options.say('msg.file_unreadable');}
 };
 $('#eIcoX').onclick=function(){
  if(pendingSave||(!draftIcon&&!pendingIcon))return;
  if(!confirm(options.t('confirm.remove_icon')))return;
  cancelIcon();draftIcon='';$('#eIco').src=options.icon;options.setDirty(true);
 };
 function finish(request,ok,error){
  if(pendingSave!==request)return;
  const current=request.token===generation&&options.current()&&options.isNew()===request.isNew&&options.active()?.id===request.pack.id;
  pendingSave=null;if(ok!==true)rollback(request);sync();
  if(!current)return;
  if(ok===true){options.saved();fill();options.say('msg.saved');}
  else if(error)options.say('msg.save_failed',error);
 }
 function failed(error){return {detail:error?.message||String(error)};}
 $('#eSave').onclick=function(){
  if(pendingSave||pendingIcon)return;
  const raw=$('#eName').value.trim(),name=raw.replace(/[^A-Za-z0-9_\- ]/g,'')||(!raw?'my_pack':'');
  if(!name){options.say('msg.name_latin');return;}
  const isNew=options.isNew(),data=options.getData(),pack=isNew?{id:options.uuid(),name,desc:'',version:'1.0.0',game:'1.21.0',author:'',icon:'',textures:[]}:options.active();
  if(!pack)return;
  const controller=new AbortController(),previousActive=data.active,before={name:pack.name,author:pack.author,desc:pack.desc,version:pack.version,game:pack.game,icon:pack.icon};
  pack.name=name;pack.author=$('#eAuthor').value.trim();pack.desc=$('#eDesc').value.trim();
  pack.version=$('#eVer').value.trim()||'1.0.0';pack.game=$('#eGame').value.trim()||'1.21.0';pack.icon=draftIcon;
  if(isNew)data.packs.push(pack);
  data.active=pack.id;
  const after=Object.fromEntries(Object.keys(before).map(key=>[key,pack[key]]));
  const request={data,pack,isNew,before,after,previousActive,token:generation,controller};
  pendingSave=request;
  let result;
  try{
   result=options.save({signal:request.controller.signal});
   if(result&&typeof result.then==='function'){sync();return Promise.resolve(result).then(ok=>finish(request,ok),error=>finish(request,false,failed(error)));}
  }catch(error){finish(request,false,failed(error));return;}
  finish(request,result);
 };
 sync();
 return {fill,leave,busy:()=>!!pendingSave};
}
