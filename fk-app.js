(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var am=/[?&]v=([\d.]+)/.exec(src),APP_V=am?am[1]:'?',V=window.FK_V||'?';
var KEY='fk070_packs',SKEY='fk070_settings',DEF_URL='index.html',MAXB=4000000;
var $=function(s){return document.querySelector(s)};
function load(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){say('Не удалось сохранить: '+e.message);return false}}
var data=load(KEY,{active:null,packs:[]});
var settings=load(SKEY,{theme:'auto',url:DEF_URL});
if(!settings.url)settings.url=DEF_URL;
data.packs.forEach(function(p){p.author=p.author||'';p.game=p.game||'1.21.0';p.icon=p.icon||'';p.desc=p.desc||'';p.version=p.version||'1.0.0';p.textures=p.textures||[]});
var stack=['home'],mt=null,editDirty=false,titleT=null,lastTitle='';
document.title='FoundryKin v'+V;
function say(t){var m=$('#msg');m.textContent=t||'';m.style.display=t?'block':'none';clearTimeout(mt);if(t)mt=setTimeout(function(){m.style.display='none'},t.length>90?7000:3500)}
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
var TITLES={home:'FoundryKin<small>v'+V+'</small>',create:'Create',settings:'Настройки',add:'Add texture',edit:'Редактирование',diag:'Диагностика'};
function top(){return stack[stack.length-1]}
function hasFke(){return typeof FKE!=='undefined'}
function render(){
  var name=top(),p=active();
  document.querySelectorAll('.screen').forEach(function(s){s.classList.toggle('on',s.id==='s-'+name)});
  $('#title').innerHTML=name==='pack'?esc(p?p.name:'Пак'):TITLES[name];
  $('#title').style.whiteSpace='nowrap';
  $('#back').style.display=stack.length>1?'inline-flex':'none';
  $('#ok').style.display='none';
  $('#bar').classList.toggle('on',name==='pack');
  if(name!=='add'&&titleT){clearInterval(titleT);titleT=null}
  if(name==='create')renderPacks();
  if(name==='pack')renderTex();
  if(name==='edit')fillEdit();
  if(name==='add')loadEditor();
  if(name==='settings')$('#sUrl').value=settings.url;
  if(name==='diag')$('#dReport').textContent=report();
  say('');
}
function go(n){stack.push(n);render()}
$('#back').onclick=function(){
  if(top()==='add'&&hasFke()&&FKE.getMode()==='edit'){
    if(FKE.dirtyNow()&&!confirm('Текстура изменена, но не сохранена в пак. Выйти и потерять прогресс?'))return;
    FKE.setMode('search');return;
  }
  if(top()==='edit'&&editDirty){
    if(!confirm('Изменения в данных пака не сохранены. Выйти и потерять их?'))return;
    editDirty=false;
  }
  if(stack.length>1){stack.pop();render()}
};
window.addEventListener('beforeunload',function(e){
  if((hasFke()&&FKE.dirtyNow())||editDirty){e.preventDefault();e.returnValue=''}
});
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){go(b.dataset.go)}});
$('#addBtn').onclick=function(){if(!active()){say('Сначала выбери пак.');return}go('add')};
function renderPacks(){
  var box=$('#packList');
  if(!data.packs.length){box.innerHTML='<p class="lbl">Паков пока нет. Создай первый ниже или импортируй .mcpack.</p>';return}
  box.innerHTML=data.packs.map(function(p){
    return '<div class="card"><div class="pk" data-a="open" data-id="'+p.id+'"><img src="'+(p.icon||ICON)+'" alt=""><div class="n"><b>'+esc(p.name)+'</b><span class="lbl">v'+esc(p.version)+' · текстур: '+p.textures.length+'</span></div></div>'+
      '<div class="acts"><button data-a="exp" data-id="'+p.id+'">Экспорт</button><button data-a="mc" data-id="'+p.id+'">В Minecraft</button><button data-a="edit" data-id="'+p.id+'">Править .json</button><button data-a="del" data-id="'+p.id+'">Удалить</button></div></div>';
  }).join('');
}
$('#packList').addEventListener('click',function(e){
  var el=e.target.closest('[data-a]');if(!el)return;
  var id=el.dataset.id,a=el.dataset.a,p=byId(id);if(!p)return;
  data.active=id;save(KEY,data);
  if(a==='open')go('pack');
  if(a==='edit')go('edit');
  if(a==='exp')exportPack(p,false);
  if(a==='mc')exportPack(p,true);
  if(a==='del'){if(confirm('Удалить пак «'+p.name+'» вместе со всеми текстурами в нём?')){data.packs=data.packs.filter(function(x){return x.id!==id});data.active=null;save(KEY,data);renderPacks()}}
});
$('#cGo').onclick=function(){
  var name=$('#cName').value.trim().replace(/[^A-Za-z0-9_\- ]/g,'');
  if(!name){say('Введи название латиницей.');return}
  var p={id:uuid(),name:name,desc:'',version:'1.0.0',game:'1.21.0',author:'',icon:'',textures:[]};
  data.packs.push(p);data.active=p.id;
  if(save(KEY,data))go('pack');
};
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
  $('#pInfo').textContent='v'+p.version+' · изменённых текстур: '+p.textures.length;
  if(!p.textures.length){box.innerHTML='<p class="lbl">Пока пусто. Нажми «+ Add texture», найди блок, измени текстуру и нажми «✓ В пак».</p>';return}
  box.innerHTML=gs.map(function(g){
    var shown=pickShown(g),title=g.obj?nice(g.obj):g.items[0].t.path;
    var sub='';
    if(g.obj&&g.all){
      var have={};g.items.forEach(function(x){have['textures/'+x.t.path]=1});
      var n=g.all.filter(function(a){return have[a]}).length;
      sub='<span class="lbl">'+n+' из '+g.all.length+' отредактировано</span>';
    }
    var rows=g.items.map(function(x){
      var i=x.i;
      return '<div class="row"><span class="lbl" style="flex:1 1 100%;margin:0;word-break:break-all">'+esc(x.t.path)+'</span>'+
        '<button class="btn" data-a="edit" data-i="'+i+'">Изменить</button><label class="btn" for="rep'+i+'">Заменить</label><input type="file" id="rep'+i+'" accept="image/png" data-a="rep" data-i="'+i+'"><button class="btn" data-a="png" data-i="'+i+'">Экспорт PNG</button><button class="btn" data-a="del" data-i="'+i+'">Удалить</button></div>';
    }).join('');
    return '<div class="tcard"><div class="tx"><img src="'+shown.t.data+'" alt=""><div><b>'+esc(title)+'</b><br>'+sub+'</div></div>'+rows+'</div>';
  }).join('');
}
$('#texList').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var p=active(),i=+b.dataset.i;if(!p||!p.textures[i])return;
  var t=p.textures[i];
  if(b.dataset.a==='del'){
    if(!confirm('Удалить текстуру «'+t.path+'» из пака?'))return;
    p.textures.splice(i,1);save(KEY,data);renderTex();
  }
  if(b.dataset.a==='png')download(dataBlob(t.data),t.path.split('/').pop()+'.png');
  if(b.dataset.a==='edit'){
    if(!hasFke()){say('Редактор не загрузился.');return}
    go('add');
    FKE.editTexture(t.path,t.data,{onFail:say});
  }
});
$('#texList').addEventListener('change',function(e){
  var inp=e.target;if(inp.dataset.a!=='rep'||!inp.files[0])return;
  var p=active(),i=+inp.dataset.i;if(!p||!p.textures[i])return;
  if(!confirm('Заменить текстуру «'+p.textures[i].path+'» выбранным файлом?')){inp.value='';return}
  var r=new FileReader();
  r.onload=function(){p.textures[i].data=r.result;save(KEY,data);renderTex();say('Текстура заменена.')};
  r.readAsDataURL(inp.files[0]);
});
function dataBlob(u){var a=u.split(','),bin=atob(a[1]),n=bin.length,u8=new Uint8Array(n);while(n--)u8[n]=bin.charCodeAt(n);return new Blob([u8],{type:'image/png'})}
function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000)}
function manifest(p,u1,u2){
  var v=ver(p.version),h={name:p.name,description:p.desc,uuid:u1||p.id,version:v,min_engine_version:ver(p.game)};
  var m={format_version:2,header:h,modules:[{type:'resources',uuid:u2||p.mod||p.id.split('').reverse().join(''),version:v}]};
  if(p.author)m.metadata={authors:[p.author]};
  return m;
}
function buildPack(p){
  var z=new JSZip(),m=p.keep?manifest(p,p.id,p.mod):manifest(p,uuid(),uuid());
  z.file('manifest.json',JSON.stringify(m,null,2));
  if(p.icon)z.file('pack_icon.png',p.icon.split(',')[1],{base64:true});
  p.textures.forEach(function(t){z.file('textures/'+t.path+'.png',t.data.split(',')[1],{base64:true})});
  return z.generateAsync({type:'blob'});
}
function exportPack(p,share){
  if(typeof JSZip==='undefined'){say('JSZip недоступен офлайн.');return}
  buildPack(p).then(function(b){
    var fn=p.name+'.mcpack';
    if(share&&typeof File!=='undefined'&&navigator.canShare&&navigator.share){
      var f=new File([b],fn,{type:'application/octet-stream'});
      if(navigator.canShare({files:[f]})){
        navigator.share({files:[f],title:p.name}).catch(function(e){if(e&&e.name==='AbortError')return;download(b,fn);say('Меню приложений не сработало: файл скачан, открой его, и Minecraft предложит импорт.')});
        return;
      }
    }
    download(b,fn);
    say(share?'В этом браузере меню приложений недоступно: файл скачан, открой его, и Minecraft предложит импорт.':'Скачан '+fn);
  },function(e){say('Ошибка архива: '+e.message)});
}
$('#impF').onchange=function(){
  var f=this.files[0];this.value='';if(!f)return;
  if(typeof JSZip==='undefined'){say('JSZip недоступен офлайн.');return}
  JSZip.loadAsync(f).then(function(z){
    var mp=Object.keys(z.files).filter(function(n){return /(^|\/)manifest\.json$/i.test(n)&&!z.files[n].dir}).sort(function(a,b){return a.length-b.length})[0];
    if(!mp){say('В архиве нет manifest.json.');return}
    var prefix=mp.slice(0,mp.length-'manifest.json'.length);
    return z.file(mp).async('string').then(function(txt){
      var m;try{m=JSON.parse(txt.replace(/^\uFEFF/,''))}catch(e){say('manifest.json не читается.');return}
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
          if(used+total*1.4>5000000){say('Не хватает места в браузере: нужно примерно '+Math.round(total/1e5)/10+' МБ. Удали ненужные паки и повтори.');return}
          var nm=String(h.name||f.name.replace(/\.[^.]+$/,'')).replace(/[^A-Za-z0-9_\- ]/g,'').trim()||'imported_pack';
          var okId=typeof h.uuid==='string'&&/^[0-9a-f-]{36}$/i.test(h.uuid)&&!byId(h.uuid);
          var p={id:okId?h.uuid:uuid(),keep:okId,mod:(mods[0]&&typeof mods[0].uuid==='string')?mods[0].uuid:'',name:nm,desc:String(h.description||''),version:Array.isArray(h.version)?h.version.join('.'):'1.0.0',game:Array.isArray(h.min_engine_version)?h.min_engine_version.join('.'):'1.21.0',author:(m.metadata&&m.metadata.authors&&m.metadata.authors[0])||'',icon:ib?'data:image/png;base64,'+ib:'',textures:texs};
          data.packs.push(p);data.active=p.id;
          if(save(KEY,data)){renderPacks();say('Импортирован пак «'+p.name+'», текстур: '+texs.length+'. Объекты сгруппируются после открытия Add texture.')}
          else{data.packs.pop()}
        });
      });
    });
  }).catch(function(e){say(e&&e.message==='big'?'Пак слишком большой для хранилища браузера. Пока поддерживаются паки примерно до 2–3 МБ.':'Не удалось прочитать архив: '+(e&&e.message||e))});
};
function fillEdit(){
  var p=active();if(!p)return;
  $('#eName').value=p.name;$('#eAuthor').value=p.author;$('#eDesc').value=p.desc;$('#eVer').value=p.version;$('#eGame').value=p.game;
  $('#eIco').src=p.icon||ICON;
  $('#eJson').value=JSON.stringify(manifest(p),null,2);
  editDirty=false;
}
document.querySelectorAll('#s-edit input[type=text]').forEach(function(i){i.addEventListener('input',function(){editDirty=true})});
$('#eIcoF').onchange=function(){
  var p=active(),f=this.files[0];if(!p||!f)return;
  var r=new FileReader();
  r.onload=function(){p.icon=r.result;$('#eIco').src=p.icon;save(KEY,data);$('#eJson').value=JSON.stringify(manifest(p),null,2)};
  r.readAsDataURL(f);
};
$('#eIcoX').onclick=function(){var p=active();if(!p)return;if(!confirm('Убрать иконку пака?'))return;p.icon='';$('#eIco').src=ICON;save(KEY,data)};
$('#eSave').onclick=function(){
  var p=active();if(!p)return;
  var n=$('#eName').value.trim().replace(/[^A-Za-z0-9_\- ]/g,'');
  if(!n){say('Название: только латиница.');return}
  p.name=n;p.author=$('#eAuthor').value.trim();p.desc=$('#eDesc').value.trim();
  p.version=$('#eVer').value.trim()||'1.0.0';p.game=$('#eGame').value.trim()||'1.21.0';
  if(save(KEY,data)){editDirty=false;$('#eJson').value=JSON.stringify(manifest(p),null,2);say('Сохранено.')}
};
function editTitle(){
  var c=FKE.current(),oi=FKE.objInfo?FKE.objInfo():null;
  if(FKE.busy())return '<div>'+esc(c&&c!=='custom'?nice(c):'Редактор')+':</div><small style="display:block;margin:0">загрузка…</small>';
  var nm=oi&&oi.id?nice(oi.id):(c&&c!=='custom'?nice(c):'Редактор');
  return '<div>'+esc(nm)+':</div>'+(oi&&oi.file?'<small style="display:block;margin:0">'+esc(oi.file)+'</small>':'');
}
function refreshTitle(){
  if(top()!=='add'||!hasFke()||FKE.getMode()!=='edit'){if(titleT){clearInterval(titleT);titleT=null}return}
  $('#ok').disabled=FKE.busy();
  var h=editTitle();
  if(h!==lastTitle){lastTitle=h;$('#title').innerHTML=h}
}
function onMode(m){
  if(top()!=='add')return;
  var edit=m==='edit';
  $('#ok').style.display=edit?'inline-flex':'none';
  if(edit){
    $('#title').style.whiteSpace='nowrap';
    lastTitle='';refreshTitle();
    if(!titleT)titleT=setInterval(refreshTitle,500);
  }else{
    if(titleT){clearInterval(titleT);titleT=null}
    $('#ok').disabled=false;
    $('#title').innerHTML='Add texture';
  }
}
function loadEditor(){
  var err=$('#addErr');
  err.style.display='none';
  if(!hasFke()){err.innerHTML='<b>Не загрузился fk-editor.js</b><br>Файл должен лежать рядом с app.html.';err.style.display='block';return}
  FKE.open($('#editor'),settings.url||DEF_URL,{
    onMode:onMode,
    onWarn:say,
    onError:function(why){
      err.innerHTML='<b>Редактор не загрузился</b><br>'+esc(why)+'<br>Открой Настройки → «Адрес редактора» и укажи рабочий адрес index.html. Файлы app.html и index.html должны лежать на одном сайте.';
      err.style.display='block';
    }
  });
}
$('#sUrlSave').onclick=function(){settings.url=$('#sUrl').value.trim()||DEF_URL;save(SKEY,settings);if(hasFke())FKE.reset();say('Адрес сохранён.')};
$('#ok').onclick=function(){
  var p=active();if(!p){say('Нет активного пака.');return}
  var fs=hasFke()?FKE.files():null;
  if(!fs){say('Редактор ещё не готов.');return}
  if(!fs.length){say('Сначала измени текстуру блока.');return}
  var oi=FKE.objInfo?FKE.objInfo():null;
  fs.forEach(function(x){
    var path=x.path.replace(/^textures\//,'').replace(/\.png$/,'');
    p.textures=p.textures.filter(function(t){return t.path!==path});
    var rec={path:path,data:x.data};
    if(oi&&oi.id){rec.obj=oi.id;rec.all=oi.paths}
    p.textures.push(rec);
  });
  if(save(KEY,data)){FKE.markSaved();say('В пак «'+p.name+'» добавлено текстур: '+fs.length)}
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
function report(){
  var L=['FoundryKin — диагностика'];
  L.push('app.html: v'+V);
  L.push('fk-app.js: v'+APP_V);
  var cv='?';
  try{var lk=document.querySelector('link[rel=stylesheet]'),cm=/[?&]v=([\d.]+)/.exec(String(lk&&lk.href||''));if(cm)cv=cm[1]}catch(e){}
  L.push('fk-style.css: v'+cv);
  if(hasFke()){
    var i=FKE.info();
    L.push('fk-editor.js: v'+i.version);
    L.push('index.html: '+(i.indexLen?i.indexLen+' симв. (ожидалось '+i.expectedLen+')'+(i.indexLen===i.expectedLen?'':'  !! изменён'):'ещё не загружался'));
    L.push('правки редактора: '+(i.indexLen?'применено '+i.applied+' из '+i.total+(i.failed.length?', не применились: '+i.failed.join(' | '):''):'ещё не проверялись (открой Add texture)'));
    L.push('редактор готов: '+(i.ready?'да':'нет')+', режим: '+i.mode+', загрузка блока: '+(i.busy?'идёт':'нет'));
    L.push('каталог: '+i.catalog);
  }else L.push('fk-editor.js: НЕ ЗАГРУЖЕН');
  var ls='ok';
  try{localStorage.setItem('fk_t','1');localStorage.removeItem('fk_t')}catch(e){ls='ОШИБКА: '+e.message}
  var tex=0;data.packs.forEach(function(p){tex+=p.textures.length});
  var sz=0;try{sz=JSON.stringify(data).length}catch(e){}
  L.push('память браузера: '+ls+'; паков: '+data.packs.length+', текстур: '+tex+', данные ≈ '+Math.round(sz/1024)+' КБ');
  L.push('меню приложений (Web Share с файлами): '+((navigator.canShare&&navigator.share)?'есть':'нет'));
  L.push('адрес редактора: '+settings.url);
  L.push('страница: '+location.href);
  L.push('браузер: '+String(navigator.userAgent).slice(0,140));
  L.push('время: '+new Date().toISOString());
  return L.join('\n');
}
$('#sDiag').onclick=function(){go('diag')};
$('#dRefresh').onclick=function(){$('#dReport').textContent=report()};
$('#dCopy').onclick=function(){
  var t=$('#dReport').textContent;
  function fallback(){
    var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');say('Отчёт скопирован.')}catch(e){say('Выдели текст отчёта и скопируй вручную.')}
    ta.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(function(){say('Отчёт скопирован.')},fallback);
  }else fallback();
};
$('#sTheme').value=settings.theme;
$('#sTheme').onchange=function(){settings.theme=this.value;save(SKEY,settings);applyTheme()};
$('#sExport').onclick=function(){download(new Blob([JSON.stringify(data)],{type:'application/json'}),'foundrykin-packs.json')};
$('#sClear').onclick=function(){if(confirm('Удалить все паки со всеми текстурами? Это нельзя отменить.')){data={active:null,packs:[]};save(KEY,data);say('Паки удалены.')}};
applyTheme();render();
})();
