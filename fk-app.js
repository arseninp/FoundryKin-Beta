(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var am=/[?&]v=([\d.]+)/.exec(src),APP_V=am?am[1]:'?',V=window.FK_V||'?';
var KEY='fk070_packs',SKEY='fk070_settings',DEF_URL='index.html';
var $=function(s){return document.querySelector(s)};
function T(k,p){return FK.t(k,p)}
var unreadable=Object.create(null),packsReady=false;
function invalid(){throw new Error(T('msg.file_unreadable'))}
function load(k,d){
  try{var raw=localStorage.getItem(k);if(raw===null)return d;var v=JSON.parse(raw);if(!v||typeof v!=='object'||Array.isArray(v)||(k===SKEY&&['theme','url','lang'].some(function(n){return v[n]!=null&&typeof v[n]!=='string'})))invalid();return v}
  catch(e){unreadable[k]=true;return d}
}
function writable(k){if(unreadable[k]||(k===KEY&&!packsReady))invalid()}
function save(k,v){try{if(k!==SKEY)throw new Error('Pack writes must use commitData');writable(k);localStorage.setItem(k,JSON.stringify(v));return true}catch(e){say('msg.save_failed',{detail:e.message});return false}}
var data={active:null,packs:[]};
var settings=load(SKEY,{theme:'auto',url:DEF_URL});
if(!settings.url)settings.url=DEF_URL;if(!settings.theme)settings.theme='auto';
var backupHost=null,backups=null,packList=null,packTextures=null,editorSave=null,packImport=null,packClear=null,packMigration=null,packCommitter=null,packRecovery=null;
var stack=['home'],mt=null,editDirty=false,editNew=false,lastTitle='';
function say(key,p){showMessage(key?T(key,p):'')}
function showMessage(t){var m=$('#msg');m.textContent=t;m.style.display=t?'block':'none';clearTimeout(mt);if(t)mt=setTimeout(function(){m.style.display='none'},t.length>90?7000:3500)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function nice(id){var s=String(id||'').replace(/_/g,' ').trim();return s.charAt(0).toUpperCase()+s.slice(1)}
function byId(id){return data.packs.filter(function(p){return p.id===id})[0]||null}
function active(){return byId(data.active)}
function applyTheme(){var t=settings.theme;if(t==='auto')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}
function uuid(){
  if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16)});
}
function ver(s){var v=String(s||'').split('.').map(function(n){return parseInt(n,10)||0});while(v.length<3)v.push(0);return v.slice(0,3)}
var ICON='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#8a8f98"/><rect x="14" y="14" width="28" height="28" fill="#3f7d4e"/></svg>');
var LENS='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
function top(){return stack[stack.length-1]}
function hasFke(){return typeof FKE!=='undefined'}
function okState(){$('#ok').disabled=(hasFke()&&FKE.busy())||!!(editorSave&&editorSave.busy())}
function syncImport(){
  var busy=!!(packImport&&packImport.busy());
  $('#impF').disabled=!packImport||busy;$('#s-create').inert=busy;
}
function syncClear(){
  var busy=!!(packClear&&packClear.busy());
  $('#sClear').disabled=!packClear||busy;$('#s-settings').inert=busy;
}

/* header */
function head(name,pill){return '<span class="fkHead"><span class="fkTn">'+esc(name)+'</span>'+(pill?'<span class="fkTf">'+esc(pill)+'</span>':'')+'</span>'}
function screenTitle(name,p){
  if(name==='backup'&&backups)return esc(backups.title());
  if(name==='home')return head('FoundryKin',V);
  if(name==='pack')return p?head(p.name,T('pack.pill',{version:p.version,n:p.textures.length})):esc(T('nav.pack'));
  if(name==='add')return '<span class="fkFind">'+esc(T('ui.find'))+LENS+'</span>';
  return esc(T({create:'nav.create',settings:'nav.settings',edit:'nav.edit',diag:'nav.diag'}[name]));
}
function editTitle(){
  var oi=FKE.objInfo(),id=(oi&&oi.id)||FKE.current();
  return head(id?nice(id):T('title.editor'),FKE.busy()?T('title.loading'):((oi&&oi.file)||''));
}
function setTitle(h){if(h!==lastTitle){lastTitle=h;$('#title').innerHTML=h}}
/* the shell header is hidden on the Find screen from the moment the screen opens, not after the editor has finished loading */
function syncFind(){document.body.classList.toggle('findSearch',top()==='add'&&hasFke()&&FKE.getMode()==='search'&&!FKE.pendingEdit())}
function refreshTitle(){
  if(top()!=='add'||!hasFke()||FKE.getMode()!=='edit')return;
  okState();
  setTitle(editTitle());
}

/* navigation */
function render(){
  var name=top(),p=active();
  if(packRecovery)packRecovery.close();
  if(packForm&&name!=='edit')packForm.leave();
  if(packList&&name!=='create')packList.leave();
  if(packImport&&name!=='create')packImport.leave();
  if(packClear&&name!=='settings')packClear.leave();
  if(name!=='add')cancelPackMigration();
  if(packTextures&&name!=='pack')packTextures.leave();
  if(editorSave&&name!=='add')editorSave.leave();
  if(name!=='add'&&hasFke()&&FKE.cancelPendingEdit)FKE.cancelPendingEdit();
  if(backups&&name!=='create'&&name!=='backup')backups.leave();
  document.querySelectorAll('.screen').forEach(function(s){s.classList.toggle('on',s.id==='s-'+name)});
  lastTitle='';setTitle(screenTitle(name,p));
  $('#back').hidden=stack.length<=1;
  $('#ok').hidden=true;
  $('#bar').classList.toggle('on',name==='pack');
  if(name==='create')renderPacks();
  if(name==='pack')renderTex();
  if(name==='edit')fillEdit();
  if(name==='backup'&&backups)backups.renderScreen();
  if(name==='add')loadEditor();
  if(name==='settings')fillSettings();
  if(name==='diag')$('#dReport').textContent=report();
  syncFind();
  say(Object.keys(unreadable).length?'msg.file_unreadable':'');
}
function go(n){stack.push(n);render()}
$('#back').onclick=function(){
  if(top()==='backup'&&backups){if(backups.dirty()&&!confirm(T('confirm.leave_unsaved_pack')))return;backups.leave()}
  if(top()==='add'&&hasFke()){
    if(FKE.closeMenu())return;
    if(FKE.getMode()==='edit'){
      if(FKE.dirtyNow()&&!confirm(T('confirm.leave_unsaved_texture')))return;
      FKE.setMode('search');return;
    }
  }
  if(top()==='edit'&&editDirty){
    if(!confirm(T('confirm.leave_unsaved_pack')))return;
    editDirty=false;
  }
  if(top()==='edit')editNew=false;
  if(stack.length>1){stack.pop();render()}
};
window.addEventListener('beforeunload',function(e){
  if((hasFke()&&FKE.dirtyNow())||editDirty||(packForm&&packForm.busy())||(backups&&backups.dirty())||(packList&&packList.busy())||(packTextures&&packTextures.busy())||(editorSave&&editorSave.busy())||(packImport&&packImport.busy())||(packClear&&packClear.busy())||packMigration||(packCommitter&&packCommitter.busy())){e.preventDefault();e.returnValue=''}
});
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){go(b.dataset.go)}});
$('#addBtn').onclick=function(){if(!active()){say('msg.pick_pack_first');return}go('add')};

/* packs */
function renderPacks(){if(packList)packList.render()}
$('#packList').inert=true;
import('./fk-pack-list.mjs?v=0.9.16-d02-list').then(function(module){
  packList=module.mountPackList($('#packList'),{getData:function(){return data},t:T,escape:esc,icon:ICON,
    current:function(){return top()==='create'},renderBackups:function(){if(backups)backups.renderCards()},
    select:function(id,writeOptions){return commitData({...data,active:id},writeOptions)},
    open:function(){go('pack')},edit:function(){editNew=false;go('edit')},exportPack:exportPack,
    confirmDelete:function(p){return confirm(T('confirm.delete_pack',{name:p.name})+'\n'+(FK.lang()==='ru'?'Бэкап этого пака тоже будет удалён.':'This pack’s backup will also be deleted.'))},
    deletePack:function(id,writeOptions){if(!backupHost)throw new Error('Backups are not ready');return backupHost.deletePack(id,writeOptions)},
    fail:function(error){say('msg.save_failed',{detail:error&&error.message||String(error)})}});
  renderPacks();
}).catch(function(error){packList=null;$('#packList').inert=true;say('msg.save_failed',{detail:error&&error.message||String(error)})});
$('#cGo').onclick=function(){if(packImport&&packImport.busy())return;editNew=true;go('edit')};
function renderTex(){
  if(top()==='pack')setTitle(screenTitle('pack',active()));
  if(packTextures)packTextures.render();
}
$('#texList').inert=true;
import('./fk-pack-textures.mjs?v=0.9.16-d02-textures').then(function(module){
  packTextures=module.mountPackTextures($('#texList'),{getData:function(){return data},t:T,escape:esc,nice:nice,say:say,
    current:function(){return top()==='pack'},
    commitData:function(next,writeOptions){
      var result=commitData(next,writeOptions);
      function saved(value){
        if(value!==false&&!writeOptions.signal.aborted&&top()==='pack'&&data.active===next.active)setTitle(screenTitle('pack',active()));
        return value;
      }
      return result&&typeof result.then==='function'?Promise.resolve(result).then(saved):saved(result);
    },
    confirmDelete:function(texture){return confirm(T('confirm.delete_texture',{path:texture.path}))},
    confirmReplace:function(texture){return confirm(T('confirm.replace_texture',{path:texture.path}))},
    exportPNG:function(texture){download(dataBlob(texture.data),texture.path.split('/').pop()+'.png')},
    edit:function(texture){
      if(!hasFke()){say('msg.editor_missing');return}
      go('add');
      FKE.editTexture(texture.path,texture.data,{obj:texture.obj,onFail:function(code){say(code==='no_block'?'msg.no_block_for_file':'msg.catalog_not_loaded',{path:texture.path})}});
    }});
  renderTex();
}).catch(function(error){packTextures=null;$('#texList').inert=true;say('msg.save_failed',{detail:error&&error.message||String(error)})});

/* import / export */
function dataBlob(u){var a=u.split(','),bin=atob(a[1]),n=bin.length,u8=new Uint8Array(n);while(n--)u8[n]=bin.charCodeAt(n);return new Blob([u8],{type:'image/png'})}
function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000)}
function manifest(p,u1,u2){
  var v=ver(p.version),h={name:p.name,description:p.desc,uuid:u1||p.id,version:v,min_engine_version:ver(p.game)};
  var m={format_version:2,header:h,modules:[{type:'resources',uuid:u2||p.mod||p.id.split('').reverse().join(''),version:v}]};
  if(p.author)m.metadata={authors:[p.author]};
  return m;
}
function exportPack(p){
  if(typeof JSZip==='undefined'){say('msg.no_jszip');return}
  var name=p.name,z=new JSZip(),m=p.keep?manifest(p,p.id,p.mod):manifest(p,uuid(),uuid());
  z.file('manifest.json',JSON.stringify(m,null,2));
  if(p.icon)z.file('pack_icon.png',p.icon.split(',')[1],{base64:true});
  p.textures.forEach(function(t){z.file('textures/'+t.path+'.png',t.data.split(',')[1],{base64:true})});
  z.generateAsync({type:'blob'}).then(function(b){download(b,name+'.mcpack')},function(e){say('msg.zip_error',{detail:e.message})});
}
$('#impF').onchange=function(){
  var file=this.files[0];this.value='';if(!file)return;
  if(!packImport){say('msg.save_failed',{detail:'Pack import is not ready'});return}
  if((packList&&packList.busy())||(backups&&backups.dirty()))return;
  packImport.importFile(file);
};
syncImport();
import('./fk-pack-import.mjs?v=0.9.31-d02-import').then(function(module){
  packImport=module.createPackImport({getData:function(){return data},getZip:function(){return typeof JSZip==='undefined'?null:JSZip},uuid:uuid,commitData:commitData,say:say,
    current:function(){return top()==='create'},changed:syncImport,saved:function(){renderPacks()}});
  syncImport();
}).catch(function(error){packImport=null;syncImport();say('msg.save_failed',{detail:error&&error.message||String(error)})});

/* pack form */
var packForm=null;
$('#s-edit').inert=true;
function fillEdit(){if(packForm)packForm.fill()}
function savePackForm(writeOptions){
  if(!writeOptions||!writeOptions.candidate||!writeOptions.signal||typeof writeOptions.rollback!=='function')throw new Error('Pack form save is not ready');
  writeOptions.rollback();
  var result=commitData(writeOptions.candidate,{signal:writeOptions.signal});
  function acknowledged(value){return value!==false&&!writeOptions.signal.aborted}
  return result&&typeof result.then==='function'?Promise.resolve(result).then(acknowledged):acknowledged(result);
}
import('./fk-pack-form.mjs?v=0.9.32-i01-form').then(function(module){
  packForm=module.mountPackForm(document,{getData:function(){return data},active:active,isNew:function(){return editNew},saved:function(){editNew=false},setDirty:function(value){editDirty=value},current:function(){return top()==='edit'},save:savePackForm,uuid:uuid,manifest:manifest,icon:ICON,say:say,t:T});
  if(top()==='edit')packForm.fill();
}).catch(function(){say('msg.file_unreadable')});

/* editor screen */
function onMode(m){
  if(packRecovery)packRecovery.close();
  if(m!=='search')cancelPackMigration();
  if(m!=='edit'&&editorSave)editorSave.leave();
  syncFind();
  if(top()!=='add')return;
  var edit=m==='edit';
  $('#ok').hidden=!edit;
  $('#ok').disabled=!!(editorSave&&editorSave.busy());
  if(edit){lastTitle='';setTitle(editTitle())}
  else setTitle(screenTitle('add'));
}
function loadEditor(){
  cancelPackMigration();
  var err=$('#addErr');
  err.style.display='none';
  if(!hasFke()){err.innerHTML='<b>'+esc(T('editor.no_fke'))+'</b><br>'+esc(T('editor.no_fke_hint'));err.style.display='block';return}
  FKE.open($('#editor'),settings.url||DEF_URL,{
    onMode:onMode,
    onState:refreshTitle,
    onReady:syncFind,
    onError:function(code,url){
      err.innerHTML='<b>'+esc(T('editor.load_failed'))+'</b><br>'+esc(T('editor.not_editor',{url:url}))+'<br>'+esc(T('editor.load_hint'));
      err.style.display='block';
    }
  });
}
$('#ok').onclick=function(){if(!editorSave){say('msg.editor_not_ready');return}editorSave.save()};
function cancelPackMigration(){var request=packMigration;packMigration=null;if(request)request.controller.abort()}
async function migrate(c,writeOptions){
  if(!c||!c.catalog||c.catalog.schema===1)return true;
  if(packMigration)return false;
  var catalog=c.catalog,request={controller:new AbortController()},signal=writeOptions&&writeOptions.signal;
  packMigration=request;
  function abort(){request.controller.abort()}
  function current(){return packMigration===request&&!request.controller.signal.aborted&&top()==='add'&&hasFke()&&FKE.getMode()==='search'&&!document.hidden&&c.catalog===catalog}
  try{
    if(signal){signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort()}
    if(!current())return false;
    var module=await import('./fk-pack-migration.mjs?v=0.9.33-d02-migration');
    if(!current())return false;
    var next=module.preparePackMigration(data,catalog);
    if(!next)return true;
    if(!current())return false;
    var result=await commitData(next,{signal:request.controller.signal});
    if(result===false)throw new Error('Pack migration was not saved');
    return current();
  }catch(error){
    if(current())say('msg.save_failed',{detail:error&&error.message||String(error)});
    return false;
  }finally{
    if(signal)signal.removeEventListener('abort',abort);
    if(packMigration===request)packMigration=null;
  }
}
window.FKAPP={migrate:migrate};
window.addEventListener('pagehide',cancelPackMigration);

/* settings and diagnostics */
function fillSettings(){$('#sUrl').value=settings.url;$('#sTheme').value=settings.theme;$('#sLang').value=settings.lang||'auto'}
function fontsOf(d){
  try{
    var a=Array.from(d.fonts).filter(function(f){return f.family.indexOf('Montserrat')>=0}),n={};
    a.forEach(function(f){n[f.status]=(n[f.status]||0)+1});
    return 'Montserrat faces: '+a.length+' '+JSON.stringify(n)+', body: '+d.defaultView.getComputedStyle(d.body).fontFamily.split(',')[0];
  }catch(e){return 'n/a'}
}
function report(){
  var L=['FoundryKin diagnostics'],editorLog='not loaded';
  function clean(value,limit){try{var log=window.FKLog;return log&&log.text?log.text(value,limit):'[redaction unavailable]'}catch(e){return '[redaction unavailable]'}}
  function logText(value){return String(value||'not loaded').split('\n').slice(0,61).map(function(line){return clean(line,900)}).join('\n')}
  L.push('app.html: '+V);
  L.push('fk-app.js: '+APP_V);
  var cv='?';
  try{var lk=document.querySelector('link[rel=stylesheet]'),cm=/[?&]v=([\d.]+)/.exec(String(lk&&lk.href||''));if(cm)cv=cm[1]}catch(e){}
  L.push('fk-style.css: '+cv);
  L.push('language: '+FK.lang()+' (setting: '+FK.setting()+')');
  L.push('logs: memory only; no automatic upload; header rejection is not full PNG validation');
  if(hasFke())try{
    var i=FKE.info();
    L.push('fk-editor.js: '+clean(i.version,24)+', editor document: '+(i.ready?clean(i.editor,24):'not loaded'));
    L.push('editor mode: '+clean(i.mode,24)+', busy: '+(i.busy?'yes':'no')+', webgl: '+i.webgl+', frames: '+i.frames);
    L.push('catalog: '+clean(i.status||'-',40)+(i.source?' ('+clean(i.source,40)+')':'')+', blocks: '+i.count);
    L.push('fonts shell: '+clean(fontsOf(document),300));
    L.push('fonts editor: '+clean(FKE.doc()?fontsOf(FKE.doc()):'n/a',300));
    if(i.catalogError)L.push('catalog error: '+clean(i.catalogError.code,40)+': '+clean(i.catalogError.detail,240));
    if(i.errors.length)L.push('editor errors: '+i.errors.slice(-3).map(function(e){return clean(e.code,40)+(e.detail?': '+clean(e.detail,240):'')}).join(' | '));
    var d=i.diagnostics;
    L.push('saved header diagnostics: '+(d?clean(d.status,40):'unsupported'));
    if(d){
      if(d.status==='available'){
        var rows=d.rejected.slice(0,40);
        L.push('rejected saved textures: '+d.rejectedCount+'; showing '+rows.length);
        rows.forEach(function(row){L.push('  '+clean(row.path,160)+': '+clean(row.error,240))});
      }
      editorLog=d.log;
    }
  }catch(e){L.push('editor diagnostics: unavailable')}else L.push('fk-editor.js: NOT LOADED');
  var ls='readable (write not tested)';
  try{localStorage.getItem(KEY)}catch(e){ls='ERROR: '+clean(e.message,240)}
  var tex=0;data.packs.forEach(function(p){tex+=p.textures.length});
  var sz=0;try{sz=JSON.stringify(data).length}catch(e){}
  L.push('storage read: '+ls+'; packs: '+data.packs.length+', textures: '+tex+', data ~ '+Math.round(sz/1024)+' KB');
  L.push('editor address: '+clean(settings.url,200));
  L.push('page: '+clean(location.href,200));
  L.push('browser: '+clean(navigator.userAgent,140));
  L.push('time: '+new Date().toISOString());
  L.push('','Editor log (last 60 events):',logText(editorLog));
  try{L.push('','Shell log (last 60 events):',window.FKLog?logText(window.FKLog.dump(60)):'not loaded')}catch(e){L.push('shell log: unavailable')}
  var out=L.join('\n');return out.length>100000?out.slice(0,100000)+'\n[report truncated]':out;
}
$('#sDiag').onclick=function(){go('diag')};
$('#dRefresh').onclick=function(){$('#dReport').textContent=report()};
$('#dCopy').onclick=function(){
  var t=$('#dReport').textContent;
  function fallback(){
    var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
    try{say(document.execCommand('copy')?'msg.report_copied':'msg.copy_manual')}catch(e){say('msg.copy_manual')}
    ta.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){say('msg.report_copied')},fallback);
  }else fallback();
};
$('#sUrlSave').onclick=function(){var next={...settings,url:$('#sUrl').value.trim()||DEF_URL};if(!save(SKEY,next))return;settings=next;if(hasFke())FKE.reset();say('msg.address_saved')};
$('#sTheme').onchange=function(){var next={...settings,theme:this.value};if(!save(SKEY,next)){this.value=settings.theme;return}settings=next;applyTheme()};
function applyLang(){
  document.documentElement.lang=FK.lang();
  document.title='FoundryKin '+V;
  FK.apply(document);
  if(hasFke())FKE.reset();
  render();
}
$('#sLang').onchange=function(){var next={...settings,lang:this.value};if(!save(SKEY,next)){this.value=settings.lang||'auto';return}settings=next;FK.refresh();applyLang()};
$('#sExport').onclick=function(){if(!packsReady||unreadable[KEY]){say('msg.file_unreadable');return}download(new Blob([JSON.stringify(data)],{type:'application/json'}),'foundrykin-packs.json')};
$('#sClear').onclick=function(){
  if(!packClear){say('msg.save_failed',{detail:'Pack clearing is not ready'});return}
  return packClear.clear();
};
syncClear();
import('./fk-pack-clear.mjs?v=0.9.31-d02-clear').then(function(module){
  packClear=module.createPackClear({commitData:commitData,say:say,changed:syncClear,current:function(){return top()==='settings'},
    confirm:function(){return confirm(T('confirm.delete_all')+'\n'+(FK.lang()==='ru'?'Бэкапы паков тоже будут удалены.':'Pack backups will also be deleted.'))}});
  syncClear();
}).catch(function(error){packClear=null;syncClear();say('msg.save_failed',{detail:error&&error.message||String(error)})});

function commitData(next,writeOptions){
  writable(KEY);
  if(!packCommitter)throw new Error('Pack writer is not ready');
  return packCommitter.commit(next,writeOptions).catch(function(error){
    if(error&&error.code==='PACK_WRITE_CONFLICT'&&packRecovery)try{packRecovery.show(error)}catch(ignored){}
    throw error;
  });
}
import('./fk-pack-recovery-host.mjs?v=0.9.35-d02-host').then(function(module){
  packRecovery=module.createPackRecoveryHost({document:document,lang:function(){return FK.lang()},getData:function(){return data},getCommitter:function(){return packCommitter},notice:showMessage,
    getState:function(){return {screen:top(),isNew:editNew,editor:hasFke()?FKE:null,migration:!!packMigration,controllers:[packForm,packList,packTextures,packImport,packClear,backups]}},
    refresh:function(){if(top()==='create')renderPacks();else if(top()==='pack')renderTex();else if(top()==='backup'&&backups)backups.renderScreen()}});
}).catch(function(error){packRecovery=null;say('msg.save_failed',{detail:error&&error.message||String(error)})});
import('./fk-editor-save.mjs?v=0.9.17-d02-editor-save').then(function(module){
  editorSave=module.createEditorSave({getData:function(){return data},commitData:commitData,say:say,changed:okState,
    current:function(){return top()==='add'&&hasFke()&&FKE.getMode()==='edit'},
    editor:{captureSave:function(){return hasFke()?FKE.captureSave():null},isSaveCurrent:function(token){return hasFke()&&FKE.isSaveCurrent(token)},markSaved:function(token){return hasFke()&&FKE.markSaved(token)}}});
}).catch(function(error){editorSave=null;say('msg.save_failed',{detail:error&&error.message||String(error)})});
import('./fk-backup-host.mjs?v=0.9.16-d02-delete').then(function(module){
  backupHost=module.createPackBackupHost({document:document,lang:function(){return FK.lang()},getData:function(){return data},commitData:commitData,getPack:byId,
    isCurrent:function(id,mode){return (mode==='create'||data.active===id)&&top()===mode&&!document.hidden},openScreen:function(mode,id){if(byId(id))data.active=id;go(mode)},back:function(){stack.pop();render()},notice:showMessage,
    afterRestore:function(){if(hasFke())FKE.reset();renderPacks()}});
  backups=backupHost.ui;if(top()==='create')backups.renderCards();
}).catch(function(error){say('msg.save_failed',{detail:error.message})});

applyTheme();
document.documentElement.lang=FK.lang();
document.title='FoundryKin '+V;
FK.apply(document);
document.body.inert=true;
Promise.all([import('./fk-pack-writer.mjs?v=0.9.34-d02-writer'),import('./fk-pack-commits.mjs?v=0.9.35-d02-commits')]).then(function(modules){
  try{
    var locks;try{locks=navigator.locks}catch(ignored){}
    var writer=modules[0].createPackWriter({storage:localStorage,locks:locks,key:KEY});
    packCommitter=modules[1].createPackCommitter(writer,function(value){data=value});
    data=packCommitter.initial;
  }catch(error){unreadable[KEY]=true;data={active:null,packs:[]}}
  packsReady=true;render();document.body.inert=false;
}).catch(function(){unreadable[KEY]=true;render();document.body.inert=false;});
})();
