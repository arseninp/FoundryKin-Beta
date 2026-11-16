/* Pack form controller; the shell owns navigation and the saved root object. */
export function mountPackForm(document,options){
 const $=selector=>document.querySelector(selector);
 let draftIcon='',generation=0,pendingIcon=null;
 function cancelIcon(){
  generation++;
  const request=pendingIcon;pendingIcon=null;
  if(request&&request.readyState===1)request.abort();
 }
 function fill(){
  cancelIcon();
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
  const file=this.files[0];this.value='';if(!file)return;
  cancelIcon();const token=generation,isNew=options.isNew(),pack=options.active();
  function current(){return token===generation&&options.current()&&options.isNew()===isNew&&options.active()===pack;}
  const request=new FileReader();pendingIcon=request;
  request.onload=function(){if(!current())return;pendingIcon=null;draftIcon=request.result;$('#eIco').src=draftIcon;options.setDirty(true);};
  request.onerror=function(){if(!current())return;pendingIcon=null;options.say('msg.file_unreadable');};
  request.onabort=function(){if(current())pendingIcon=null;};
  try{request.readAsDataURL(file);}catch(error){if(current()){pendingIcon=null;options.say('msg.file_unreadable');}}
 };
 $('#eIcoX').onclick=function(){
  if(!draftIcon&&!pendingIcon)return;
  if(!confirm(options.t('confirm.remove_icon')))return;
  cancelIcon();draftIcon='';$('#eIco').src=options.icon;options.setDirty(true);
 };
 $('#eSave').onclick=function(){
  const raw=$('#eName').value.trim(),name=raw.replace(/[^A-Za-z0-9_\- ]/g,'')||(!raw?'my_pack':'');
  if(!name){options.say('msg.name_latin');return;}
  const isNew=options.isNew(),data=options.getData(),pack=isNew?{id:options.uuid(),name,desc:'',version:'1.0.0',game:'1.21.0',author:'',icon:'',textures:[]}:options.active();
  if(!pack)return;
  const previousActive=data.active,before={name:pack.name,author:pack.author,desc:pack.desc,version:pack.version,game:pack.game,icon:pack.icon};
  pack.name=name;pack.author=$('#eAuthor').value.trim();pack.desc=$('#eDesc').value.trim();
  pack.version=$('#eVer').value.trim()||'1.0.0';pack.game=$('#eGame').value.trim()||'1.21.0';pack.icon=draftIcon;
  if(isNew)data.packs.push(pack);
  data.active=pack.id;
  if(options.save()){options.saved();fill();options.say('msg.saved');}
  else{data.active=previousActive;if(isNew)data.packs.pop();else Object.assign(pack,before);}
 };
 $('#s-edit').inert=false;
 return {fill,leave:cancelIcon};
}
