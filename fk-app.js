(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var am=/[?&]v=([\d.]+)/.exec(src),APP_V=am?am[1]:'?',V=window.FK_V||'?';
var KEY='fk070_packs',SKEY='fk070_settings',DEF_URL='index.html',MAXB=4000000;
var $=function(s){return document.querySelector(s)};
function T(k,p){return FK.t(k,p)}
function load(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){say('msg.save_failed',{detail:e.message});return false}}
var data=load(KEY,{active:null,packs:[]});
var settings=load(SKEY,{theme:'auto',url:DEF_URL});
if(!settings.url)settings.url=DEF_URL;
data.packs.forEach(function(p){delete p.fresh;p.author=p.author||'';p.game=p.game||'1.21.0';p.icon=p.icon||'';p.desc=p.desc||'';p.version=p.version||'1.0.0';p.textures=p.textures||[]});
var stack=['home'],mt=null,editDirty=false,editNew=false,draftIcon='',lastTitle='';
function say(key,p){var m=$('#msg'),t=key?T(key,p):'';m.textContent=t;m.style.display=t?'block':'none';clearTimeout(mt);if(t)mt=setTimeout(function(){m.style.display='none'},t.length>90?7000:3500)}
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

/* header */
function head(name,pill){return '<span class="fkHead"><span class="fkTn">'+esc(name)+'</span>'+(pill?'<span class="fkTf">'+esc(pill)+'</span>':'')+'</span>'}
function screenTitle(name,p){
  if(name==='home')return head('FoundryKin','v'+V);
  if(name==='pack')return p?head(p.name,T('pack.pill',{version:p.version,n:p.textures.length})):esc(T('nav.pack'));
  if(name==='add')return '<span class="fkFind">'+esc(T('ui.find'))+LENS+'</span>';
  return esc(T({create:'nav.create',settings:'nav.settings',edit:'nav.edit',diag:'nav.diag'}[name]));
}
function editTitle(){
  var oi=FKE.objInfo(),id=(oi&&oi.id)||FKE.current();
  return head(id?nice(id):T('title.editor'),FKE.busy()?T('title.loading'):((oi&&oi.file)||''));
}
function setTitle(h){if(h!==lastTitle){lastTitle=h;$('#title').innerHTML=h}}
function headerY(){
  var s=document.querySelector('.screen.on'),y=0;
  if(s)y=(s.id==='s-add'&&hasFke())?FKE.scrollY():s.scrollTop;
  document.documentElement.style.setProperty('--fkHeaderY',Math.max(8,24-y)+'px');
}
function syncFind(){document.body.classList.toggle('findSearch',top()==='add'&&hasFke()&&FKE.ready()&&FKE.getMode()==='search')}
function refreshTitle(){
  if(top()!=='add'||!hasFke()||FKE.getMode()!=='edit')return;
  $('#ok').disabled=FKE.busy();
  setTitle(editTitle());
}

/* navigation */
function render(){
  var name=top(),p=active();
  document.querySelectorAll('.screen').forEach(function(s){s.classList.toggle('on',s.id==='s-'+name)});
  lastTitle='';setTitle(screenTitle(name,p));
  $('#back').hidden=stack.length<=1;
  $('#ok').hidden=true;
  $('#bar').classList.toggle('on',name==='pack');
  if(name==='create')renderPacks();
  if(name==='pack')renderTex();
  if(name==='edit')fillEdit();
  if(name==='add')loadEditor();
  if(name==='settings')fillSettings();
  if(name==='diag')$('#dReport').textContent=report();
  syncFind();headerY();
  say('');
}
function go(n){stack.push(n);render()}
$('#back').onclick=function(){
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
  if((hasFke()&&FKE.dirtyNow())||editDirty){e.preventDefault();e.returnValue=''}
});
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){go(b.dataset.go)}});
$('#addBtn').onclick=function(){if(!active()){say('msg.pick_pack_first');return}go('add')};
$('#screens').addEventListener('scroll',function(e){if(e.target.classList&&e.target.classList.contains('on'))headerY()},true);

/* packs */
function renderPacks(){
  var box=$('#packList');
  if(!data.packs.length){box.innerHTML='<p class="lbl">'+esc(T('packs.empty'))+'</p>';return}
  box.innerHTML=data.packs.map(function(p){
    return '<div class="card"><div class="pk" data-a="open" data-id="'+p.id+'"><img src="'+(p.icon||ICON)+'" alt=""><div class="n"><b>'+esc(p.name)+'</b><span class="lbl">'+esc(T('pack.card_sub',{version:p.version,n:p.textures.length}))+'</span></div></div>'+
      '<div class="acts"><button data-a="exp" data-id="'+p.id+'">'+esc(T('act.export'))+'</button><button data-a="edit" data-id="'+p.id+'">'+esc(T('act.edit'))+'</button><button data-a="del" data-id="'+p.id+'">'+esc(T('act.delete'))+'</button></div></div>';
  }).join('');
}
$('#packList').addEventListener('click',function(e){
  var el=e.target.closest('[data-a]');if(!el)return;
  var id=el.dataset.id,a=el.dataset.a,p=byId(id);if(!p)return;
  data.active=id;save(KEY,data);
  if(a==='open')go('pack');
  if(a==='edit'){editNew=false;go('edit')}
  if(a==='exp')exportPack(p);
  if(a==='del'){if(confirm(T('confirm.delete_pack',{name:p.name}))){data.packs=data.packs.filter(function(x){return x.id!==id});data.active=null;save(KEY,data);renderPacks()}}
});
$('#cGo').onclick=function(){editNew=true;go('edit')};
function groupsOf(p){
  var gs=[],idx={};
  p.textures.forEach(function(t,i){
    var k=t.obj?'o:'+t.obj:'f:'+t.path;
    if(!(k in idx)){idx[k]=gs.length;gs.push({obj:t.obj||null,all:t.all||null,items:[]})}
    var g=gs[idx[k]];if(!g.all&&t.all)g.all=t.all;
    g.items.push({t:t,i:i});
  });
  return gs;
}
function pickShown(g){
  if(g.all)for(var a=0;a<g.all.length;a++){
    for(var j=0;j<g.items.length;j++){if('textures/'+g.items[j].t.path===g.all[a])return g.items[j]}
  }
  return g.items[0];
}
function renderTex(){
  var p=active(),box=$('#texList');
  if(!p){box.innerHTML='';return}
  var gs=groupsOf(p);
  if(top()==='pack')setTitle(screenTitle('pack',p));
  if(!p.textures.length){box.innerHTML='<p class="lbl">'+esc(T('tex.empty'))+'</p>';return}
  box.innerHTML=gs.map(function(g){
    var shown=pickShown(g),title=g.obj?nice(g.obj):g.items[0].t.path;
    var sub='';
    if(g.obj&&g.all){
      var have={};g.items.forEach(function(x){have['textures/'+x.t.path]=1});
      var n=g.all.filter(function(a){return have[a]}).length;
      sub='<span class="lbl">'+esc(T('tex.edited_of',{n:n,total:g.all.length}))+'</span>';
    }
    var rows=g.items.map(function(x){
      var i=x.i;
      return '<div class="row"><span class="lbl" style="flex:1 1 100%;margin:0;word-break:break-all">'+esc(x.t.path)+'</span>'+
        '<button class="btn" data-a="edit" data-i="'+i+'">'+esc(T('act.edit'))+'</button><label class="btn" for="rep'+i+'">'+esc(T('ui.replace'))+'</label><input type="file" id="rep'+i+'" accept="image/png" data-a="rep" data-i="'+i+'"><button class="btn" data-a="png" data-i="'+i+'">'+esc(T('act.export_png'))+'</button><button class="btn" data-a="del" data-i="'+i+'">'+esc(T('act.delete'))+'</button></div>';
    }).join('');
    return '<div class="tcard"><div class="tx"><img src="'+shown.t.data+'" alt=""><div><b>'+esc(title)+'</b><br>'+sub+'</div></div>'+rows+'</div>';
  }).join('');
}
$('#texList').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var p=active(),i=+b.dataset.i;if(!p||!p.textures[i])return;
  var t=p.textures[i];
  if(b.dataset.a==='del'){
    if(!confirm(T('confirm.delete_texture',{path:t.path})))return;
    p.textures.splice(i,1);save(KEY,data);renderTex();
  }
  if(b.dataset.a==='png')download(dataBlob(t.data),t.path.split('/').pop()+'.png');
  if(b.dataset.a==='edit'){
    if(!hasFke()){say('msg.editor_missing');return}
    go('add');
    FKE.editTexture(t.path,t.data,{obj:t.obj,onFail:function(code){say(code==='no_block'?'msg.no_block_for_file':'msg.catalog_not_loaded',{path:t.path})}});
  }
});
$('#texList').addEventListener('change',function(e){
  var inp=e.target;if(inp.dataset.a!=='rep'||!inp.files[0])return;
  var p=active(),i=+inp.dataset.i;if(!p||!p.textures[i])return;
  if(!confirm(T('confirm.replace_texture',{path:p.textures[i].path}))){inp.value='';return}
  var r=new FileReader();
  r.onload=function(){p.textures[i].data=r.result;save(KEY,data);renderTex();say('msg.texture_replaced')};
  r.readAsDataURL(inp.files[0]);
});

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
  var z=new JSZip(),m=p.keep?manifest(p,p.id,p.mod):manifest(p,uuid(),uuid());
  z.file('manifest.json',JSON.stringify(m,null,2));
  if(p.icon)z.file('pack_icon.png',p.icon.split(',')[1],{base64:true});
  p.textures.forEach(function(t){z.file('textures/'+t.path+'.png',t.data.split(',')[1],{base64:true})});
  z.generateAsync({type:'blob'}).then(function(b){download(b,p.name+'.mcpack');say('msg.exported',{name:p.name})},function(e){say('msg.zip_error',{detail:e.message})});
}
$('#impF').onchange=function(){
  var f=this.files[0];this.value='';if(!f)return;
  if(typeof JSZip==='undefined'){say('msg.no_jszip');return}
  JSZip.loadAsync(f).then(function(z){
    var mp=Object.keys(z.files).filter(function(n){return /(^|\/)manifest\.json$/i.test(n)&&!z.files[n].dir}).sort(function(a,b){return a.length-b.length})[0];
    if(!mp){say('msg.no_manifest');return}
    var prefix=mp.slice(0,mp.length-'manifest.json'.length);
    return z.file(mp).async('string').then(function(txt){
      var m;try{m=JSON.parse(txt.replace(/^\uFEFF/,''))}catch(e){say('msg.bad_manifest');return}
      var h=m.header||{},mods=m.modules||[];
      var names=Object.keys(z.files).filter(function(n){return n.indexOf(prefix+'textures/')===0&&/\.png$/i.test(n)&&!z.files[n].dir});
      var texs=[],total=0,i=0;
      function next(){
        if(i>=names.length)return Promise.resolve();
        var n=names[i++];
        return z.file(n).async('base64').then(function(b){
          total+=b.length;
          if(total>MAXB)throw new Error('big');
          texs.push({path:n.slice((prefix+'textures/').length).replace(/\.png$/i,''),data:'data:image/png;base64,'+b});
          return next();
        });
      }
      return next().then(function(){
        var icoF=z.file(prefix+'pack_icon.png');
        return (icoF?icoF.async('base64'):Promise.resolve('')).then(function(ib){
          var used=0;try{used=JSON.stringify(data).length}catch(e){}
          if(used+total*1.4>5000000){say('msg.no_space',{mb:Math.round(total/1e5)/10});return}
          var nm=String(h.name||f.name.replace(/\.[^.]+$/,'')).replace(/[^A-Za-z0-9_\- ]/g,'').trim()||'imported_pack';
          var okId=typeof h.uuid==='string'&&/^[0-9a-f-]{36}$/i.test(h.uuid)&&!byId(h.uuid);
          var p={id:okId?h.uuid:uuid(),keep:okId,mod:(mods[0]&&typeof mods[0].uuid==='string')?mods[0].uuid:'',name:nm,desc:String(h.description||''),version:Array.isArray(h.version)?h.version.join('.'):'1.0.0',game:Array.isArray(h.min_engine_version)?h.min_engine_version.join('.'):'1.21.0',author:(m.metadata&&m.metadata.authors&&m.metadata.authors[0])||'',icon:ib?'data:image/png;base64,'+ib:'',textures:texs};
          data.packs.push(p);data.active=p.id;
          if(save(KEY,data)){renderPacks();say('msg.imported',{name:p.name,n:texs.length})}
          else{data.packs.pop()}
        });
      });
    });
  }).catch(function(e){if(e&&e.message==='big')say('msg.too_big');else say('msg.archive_unreadable',{detail:(e&&e.message)||e})});
};

/* pack form */
function fillEdit(){
  var p=editNew?null:active();if(!editNew&&!p)return;
  var s=p||{name:'',author:'',desc:'',version:'',game:'',icon:''};
  $('#eName').value=s.name;$('#eAuthor').value=s.author;$('#eDesc').value=s.desc;$('#eVer').value=s.version;$('#eGame').value=s.game;
  draftIcon=s.icon||'';$('#eIco').src=draftIcon||ICON;
  $('#eJson').value=p?JSON.stringify(manifest(p),null,2):'';
  editDirty=false;
}
document.querySelectorAll('#s-edit input[type=text]').forEach(function(i){i.addEventListener('input',function(){editDirty=true})});
$('#eIcoF').onchange=function(){
  var f=this.files[0];this.value='';if(!f)return;
  var r=new FileReader();
  r.onload=function(){draftIcon=r.result;$('#eIco').src=draftIcon;editDirty=true};
  r.readAsDataURL(f);
};
$('#eIcoX').onclick=function(){if(!draftIcon)return;if(!confirm(T('confirm.remove_icon')))return;draftIcon='';$('#eIco').src=ICON;editDirty=true};
$('#eSave').onclick=function(){
  var raw=$('#eName').value.trim(),n=raw.replace(/[^A-Za-z0-9_\- ]/g,'');
  if(raw&&!n){say('msg.name_latin');return}
  if(!n)n='my_pack';
  var isNew=editNew,p=isNew?{id:uuid(),name:n,desc:'',version:'1.0.0',game:'1.21.0',author:'',icon:'',textures:[]}:active();
  if(!p)return;
  p.name=n;p.author=$('#eAuthor').value.trim();p.desc=$('#eDesc').value.trim();
  p.version=$('#eVer').value.trim()||'1.0.0';p.game=$('#eGame').value.trim()||'1.21.0';p.icon=draftIcon;
  if(isNew)data.packs.push(p);
  data.active=p.id;
  if(save(KEY,data)){editNew=false;fillEdit();say('msg.saved')}
  else if(isNew){data.packs.pop()}
};

/* editor screen */
function onMode(m){
  syncFind();
  if(top()!=='add')return;
  var edit=m==='edit';
  $('#ok').hidden=!edit;
  $('#ok').disabled=false;
  if(edit){lastTitle='';setTitle(editTitle())}
  else setTitle(screenTitle('add'));
  headerY();
}
function loadEditor(){
  var err=$('#addErr');
  err.style.display='none';
  if(!hasFke()){err.innerHTML='<b>'+esc(T('editor.no_fke'))+'</b><br>'+esc(T('editor.no_fke_hint'));err.style.display='block';return}
  FKE.open($('#editor'),settings.url||DEF_URL,{
    onMode:onMode,
    onState:refreshTitle,
    onScroll:headerY,
    onReady:function(){syncFind();headerY()},
    onError:function(code,url){
      err.innerHTML='<b>'+esc(T('editor.load_failed'))+'</b><br>'+esc(T('editor.not_editor',{url:url}))+'<br>'+esc(T('editor.load_hint'));
      err.style.display='block';
    }
  });
}
$('#ok').onclick=function(){
  var p=active();if(!p){say('msg.no_active_pack');return}
  var fs=hasFke()?FKE.files():null;
  if(!fs){say('msg.editor_not_ready');return}
  if(!fs.length){say('msg.edit_texture_first');return}
  var oi=FKE.objInfo();
  fs.forEach(function(x){
    var path=x.path.replace(/^textures\//,'').replace(/\.png$/,'');
    p.textures=p.textures.filter(function(t){return t.path!==path});
    var rec={path:path,data:x.data};
    if(oi&&oi.id){rec.obj=oi.id;rec.all=oi.paths}
    p.textures.push(rec);
  });
  if(save(KEY,data)){FKE.markSaved();say('msg.added',{name:p.name,n:fs.length})}
};
function migrate(c){
  if(!c||!c.catalog)return;
  var cat=c.catalog,map=null,changed=false;
  function pathsOf(id){
    return (cat.sp&&cat.sp[id])?cat.sp[id].list.map(function(s){return s.id}):cat.b[id].filter(function(x,i,a){return a.indexOf(x)===i});
  }
  function build(){
    map={};
    cat.ids.forEach(function(id){
      var ps=pathsOf(id);
      ps.forEach(function(pth){if(!map[pth])map[pth]={id:id,all:ps}});
    });
  }
  data.packs.forEach(function(p){
    p.textures.forEach(function(t){
      if(t.obj)return;
      if(!map)build();
      var m=map['textures/'+t.path];
      if(!m){var base=t.path.split('/').pop();if(cat.b[base])m={id:base,all:pathsOf(base)}}
      if(m){t.obj=m.id;t.all=m.all;changed=true}
    });
    var before=p.textures.length;
    p.textures=p.textures.filter(function(t){
      if(!t.obj||!t.all||t.all.indexOf('textures/'+t.path)>=0)return true;
      return !p.textures.some(function(o){return o!==t&&o.obj===t.obj&&o.all&&o.all.indexOf('textures/'+o.path)>=0&&o.data===t.data});
    });
    if(p.textures.length!==before)changed=true;
  });
  if(changed){save(KEY,data);if(top()==='pack')renderTex()}
}
window.FKAPP={migrate:migrate};

/* settings and diagnostics */
function fillSettings(){$('#sUrl').value=settings.url;$('#sTheme').value=settings.theme;$('#sLang').value=settings.lang||'auto'}
function report(){
  var L=['FoundryKin diagnostics'];
  L.push('app.html: v'+V);
  L.push('fk-app.js: v'+APP_V);
  var cv='?';
  try{var lk=document.querySelector('link[rel=stylesheet]'),cm=/[?&]v=([\d.]+)/.exec(String(lk&&lk.href||''));if(cm)cv=cm[1]}catch(e){}
  L.push('fk-style.css: v'+cv);
  L.push('language: '+FK.lang()+' (setting: '+FK.setting()+')');
  if(hasFke()){
    var i=FKE.info();
    L.push('fk-editor.js: v'+i.version+', editor document: '+(i.ready?'v'+i.editor:'not loaded'));
    L.push('editor mode: '+i.mode+', busy: '+(i.busy?'yes':'no')+', webgl: '+i.webgl+', frames: '+i.frames);
    L.push('catalog: '+(i.status||'-')+(i.source?' ('+i.source+')':'')+', blocks: '+i.count);
    if(i.errors.length)L.push('editor errors: '+i.errors.map(function(e){return e.code+(e.detail?': '+e.detail:'')}).join(' | '));
  }else L.push('fk-editor.js: NOT LOADED');
  var ls='ok';
  try{localStorage.setItem('fk_t','1');localStorage.removeItem('fk_t')}catch(e){ls='ERROR: '+e.message}
  var tex=0;data.packs.forEach(function(p){tex+=p.textures.length});
  var sz=0;try{sz=JSON.stringify(data).length}catch(e){}
  L.push('storage: '+ls+'; packs: '+data.packs.length+', textures: '+tex+', data ~ '+Math.round(sz/1024)+' KB');
  L.push('editor address: '+settings.url);
  L.push('page: '+location.href);
  L.push('browser: '+String(navigator.userAgent).slice(0,140));
  L.push('time: '+new Date().toISOString());
  return L.join('\n');
}
$('#sDiag').onclick=function(){go('diag')};
$('#dRefresh').onclick=function(){$('#dReport').textContent=report()};
$('#dCopy').onclick=function(){
  var t=$('#dReport').textContent;
  function fallback(){
    var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');say('msg.report_copied')}catch(e){say('msg.copy_manual')}
    ta.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){say('msg.report_copied')},fallback);
  }else fallback();
};
$('#sUrlSave').onclick=function(){settings.url=$('#sUrl').value.trim()||DEF_URL;save(SKEY,settings);if(hasFke())FKE.reset();say('msg.address_saved')};
$('#sTheme').onchange=function(){settings.theme=this.value;save(SKEY,settings);applyTheme()};
function applyLang(){
  document.documentElement.lang=FK.lang();
  document.title='FoundryKin v'+V;
  FK.apply(document);
  if(hasFke())FKE.reset();
  render();
}
$('#sLang').onchange=function(){settings.lang=this.value;save(SKEY,settings);FK.refresh();applyLang()};
$('#sExport').onclick=function(){download(new Blob([JSON.stringify(data)],{type:'application/json'}),'foundrykin-packs.json')};
$('#sClear').onclick=function(){if(confirm(T('confirm.delete_all'))){data={active:null,packs:[]};save(KEY,data);say('msg.packs_deleted')}};

applyTheme();
document.documentElement.lang=FK.lang();
document.title='FoundryKin v'+V;
FK.apply(document);
render();
})();
