var PATCHES=[["else{u=X+.5;v=ny>0?.5-Z:Z+.5}", "else if(vs!==1){var th=(Z-z+d/2)/d;u=X+.5;v=ny>0?1-.09375*th:.09375*th}\n    else{u=X+.5;v=ny>0?.5-Z:Z+.5}"], ["if(isDoorBlock(m))return ['door','dooropen'];", "if(isDoorBlock(m))return ['door'];"], ["if(/_trapdoor$/.test(m))return ['trapdoor','trapdooropen'];", "if(/_trapdoor$/.test(m))return ['trapdoor'];"], ["  var f=document.createElement('button');f.textContent='✎ свободный режим';f.onclick=selectCustom;box.insertBefore(f,box.firstChild);\n", ""], ["function syncSame(){$('#sameLabel').style.display=cur==='custom'?'flex':'none';$('#same').checked=customSame}", "function syncSame(){$('#same').checked=customSame}"], ["<label class=\"chk\" id=\"sameLabel\">", "<label class=\"chk\" id=\"sameLabel\" style=\"display:none\">"], ["if(cur==='custom'){n.disabled=false;n.value=customName}else{n.disabled=true;n.value=cur}", "if(cur==='custom'){n.disabled=true;n.value='';n.placeholder='выбери блок'}else{n.disabled=true;n.value=cur}"], ["Имя блока (в свободном режиме вводится вручную, для блока из игры подставляется само)", "Имя блока (подставляется из выбранного блока)"], ["Пока работает свободный режим.", "Выбери блок из списка, когда он загрузится."], [" либо работай в свободном режиме.", "."], ["  e.preventDefault();ed.setPointerCapture(e.pointerId);\n", "  if(cur==='custom'){say('Сначала выбери блок из списка.');return}\n  e.preventDefault();ed.setPointerCapture(e.pointerId);\n"], ["img.onload=function(){if(!cv[slot])return;pushUndo();", "img.onload=function(){if(!cv[slot]||cur==='custom')return;pushUndo();"], ["$('#clr').onclick=function(){if(!cv[slot])return;", "$('#clr').onclick=function(){if(!cv[slot]||cur==='custom')return;"], ["    var f=files[fk(s.id)];if(!f)return;\n    var p=cur==='custom'?customPath(s.id):s.id;", "    if(cur==='custom')return;\n    var f=files[fk(s.id)];if(!f)return;\n    var p=s.id;"], ["if(k.indexOf('custom/')===0){var id=k.slice(7);if(customSame&&id!=='side')return;p=customPath(id)}\n    else p=k;", "if(k.indexOf('custom/')===0)return;\n    p=k;"], ["Нечего экспортировать: нарисуй хотя бы одну текстуру.", "Нечего экспортировать: выбери блок и измени его текстуру."], ["dirty[k]=true;delete ph[slot];", "dirty[k]=true;delete ph[slot];if(window.FKAPI)window.FKAPI.edits++;"], ["  $('#info').textContent='Загружаю оригинальные текстуры…';", "  if(window.FKAPI)window.FKAPI.loading();\n  $('#info').textContent='Загружаю оригинальные текстуры…';"], ["applyEntry(entryFor(so.list),function(){build();syncName();showInfo(id,m,note,mo);renderList();scheduleSave()});", "applyEntry(entryFor(so.list),function(){build();syncName();showInfo(id,m,note,mo);renderList();scheduleSave();if(window.FKAPI)window.FKAPI.loaded(m)});"], ["resetHist();rebuildTextures();drawEd();scheduleSave();\n}\nfunction setResUi", "resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[fk(s.id)]=true});if(window.FKAPI)window.FKAPI.edits++;scheduleSave();renderList();\n}\nfunction setResUi"], ["/* ---------- старт ---------- */", "window.FKAPI={edits:0,busy:false,want:null,block:'',onchange:null,files:function(){return curFiles().filter(function(f){return dirty[f.path.replace(/\\.png$/,'')]})},cur:function(){return cur},loading:function(){this.busy=true;if(this.onchange)this.onchange()},loaded:function(m){this.busy=false;this.block=m;var w=this.want;this.want=null;if(w&&cv[w])setSlot(w);if(this.onchange)this.onchange()},openTexture:function(path,data,res){var key='textures/'+path;if(!catalog)return null;var hit=null;for(var i=0;i<catalog.ids.length&&!hit;i++){if(pathsFor(catalog.ids[i]).indexOf(key)>=0)hit=catalog.ids[i]}if(!hit)return false;files[key]={res:res||16,data:data};dirty[key]=true;this.want=key;selectBlock(hit);return hit}};\n/* ---------- старт ---------- */"], ["v0.6.4", "v0.6.5"], ["return !q||id.indexOf(q)>=0}).slice(0,60);", "return !q||id.indexOf(q)>=0}).slice(0,300);"]];
function applyPatches(h){
  var failed=[];
  PATCHES.forEach(function(p){
    if(h.indexOf(p[0])<0){failed.push(p[0].slice(0,40));return}
    h=h.split(p[0]).join(p[1]);
  });
  return {html:h,failed:failed};
}
var FKE=(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?',EXPECTED_LEN=47239;
var frame=null,mode='search',onMode=null,loaded=null,wantEdit=false,base=0,pending=false,pendingName='',lastLen=0,lastFailed=[];
function doc(){try{return (frame&&frame.contentDocument)||null}catch(e){return null}}
function api(){try{var d=doc();return (d&&d.defaultView&&d.defaultView.FKAPI)||null}catch(e){return null}}
function note(){if(onMode)onMode(mode)}
function busy(){var a=api();return pending||!!(a&&a.busy)}
function setMode(m){
  if(m==='edit'&&mode!=='edit'){var a0=api();base=a0?(a0.edits||0):0}
  mode=m;
  var d=doc();
  if(d&&d.body){
    d.body.classList.toggle('fk-search',m==='search');
    d.body.classList.toggle('fk-edit',m==='edit');
    try{d.defaultView.scrollTo(0,0)}catch(e){}
  }
  note();
}
var CSS='main>h1{display:none}'+
'body.fk-search main>*:not(.fk-search-part):not(#fkInfo){display:none!important}'+
'body.fk-edit .fk-search-part{display:none!important}'+
'body.fk-edit .fk-h-search,body.fk-search .fk-h-edit{display:none!important}'+
'.fk-hide{display:none!important}'+
'.fk-search-part .list{max-height:60vh}'+
'#fkInfo{margin-top:20px;border-top:1px solid var(--line);padding-top:10px}'+
'#fkInfo summary{cursor:pointer;font-weight:600;min-height:40px;display:flex;align-items:center}'+
'#fkInfo .lbl{margin:8px 0}';
function tidy(d){
  try{
    if(!d||d.__fkTidy||!d.querySelector('#ed'))return false;
    var m=d.querySelector('main');if(!m)return false;
    d.__fkTidy=true;
    var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
    var q=d.querySelector('#q'),sec=q&&q.closest('.sec');
    if(sec)sec.classList.add('fk-search-part');
    var box=d.createElement('details');box.id='fkInfo';box.open=true;
    var sm=d.createElement('summary');sm.textContent='Справка и каталог';box.appendChild(sm);
    var rules=[['Блок из игры','fk-h-search'],['Загруженный PNG','fk-h-edit'],['Имя блока','fk-h-edit']];
    Array.prototype.slice.call(d.querySelectorAll('p.lbl')).forEach(function(p){
      var t=p.textContent.trim();
      rules.forEach(function(r){if(t.indexOf(r[0])===0){p.classList.add(r[1]);box.appendChild(p)}});
    });
    var dbg=d.querySelector('#dbg');if(dbg){dbg.classList.add('fk-h-edit');box.appendChild(dbg)}
    var info=d.querySelector('#info');if(info)box.appendChild(info);
    var cf=d.querySelector('label[for="catfile"]'),row=cf&&cf.parentNode;
    if(row){row.classList.add('fk-h-search');box.appendChild(row)}
    m.appendChild(box);
    var nm=d.querySelector('#name');if(nm)nm.setAttribute('aria-label','Имя блока');
    var a=d.defaultView&&d.defaultView.FKAPI;
    if(a)a.onchange=function(){if(!a.busy)pending=false;note()};
    var list=d.querySelector('#list');
    if(list)list.addEventListener('click',function(e){
      var b=e.target.closest('button');
      if(!b)return;
      pendingName=String(b.textContent||'').replace(/\s*●\s*$/,'').trim();
      pending=true;
      setMode('edit');
      setTimeout(function(){if(pending&&!(a&&a.busy)){pending=false;note()}},1500);
    },true);
    var tm=setInterval(function(){
      try{
        if(doc()!==d){clearInterval(tm);return}
        if(row&&info)row.classList.toggle('fk-hide',!/^Каталог (не загрузился|пустой)/.test(info.textContent));
      }catch(e){clearInterval(tm)}
    },1000);
    return true;
  }catch(e){return false}
}
function open(f,url,cb){
  cb=cb||{};frame=f;onMode=cb.onMode||null;
  var d0=doc();
  if(loaded===url&&d0&&d0.__fkTidy){setMode('search');return}
  loaded=url;
  f.onload=function(){
    var why='',d=null;
    try{d=f.contentDocument;if(!d||!d.querySelector('#ed'))why='страница по адресу «'+url+'» открылась, но это не редактор (возможно, 404 или другой файл).'}
    catch(e){why='браузер не даёт прочитать «'+url+'» (другой домен).'}
    if(why){loaded=null;if(cb.onError)cb.onError(why);return}
    tidy(d);setMode(wantEdit?'edit':'search');
  };
  fetch(url).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(h){
    lastLen=h.length;
    var res=applyPatches(h),b=new URL(url,location.href).href;
    lastFailed=res.failed;
    if(cb.onWarn){
      if(res.failed.length)cb.onWarn('Часть правок редактора не применилась: '+res.failed.length);
      else if(lastLen!==EXPECTED_LEN)cb.onWarn('index.html отличается от ожидаемого. Если что-то работает не так, открой Настройки → Диагностика.');
    }
    f.srcdoc=res.html.replace(/<head>/i,'<head><base href="'+b+'">');
  }).catch(function(){f.src=url});
}
function editTexture(path,data,cb){
  cb=cb||{};wantEdit=true;
  function start(res){
    var tries=0;
    (function poll(){
      var a=api(),r=(a&&a.openTexture)?a.openTexture(path,data,res):null;
      if(r){wantEdit=false;pendingName=String(r);setMode('edit');if(cb.onDone)cb.onDone(r);return}
      if(r===false||++tries>40){
        wantEdit=false;setMode('search');
        if(cb.onFail)cb.onFail(r===false?'Не нашёл блок для файла '+path:'Каталог блоков не загрузился');
        return;
      }
      setTimeout(poll,500);
    })();
  }
  var img=new Image();
  img.onload=function(){start(img.width===32?32:16)};
  img.onerror=function(){start(16)};
  img.src=data;
}
function info(){
  var d=doc(),inf=null;
  try{inf=d&&d.querySelector('#info')}catch(e){}
  return {
    version:VERSION,indexLen:lastLen,expectedLen:EXPECTED_LEN,
    total:PATCHES.length,failed:lastFailed.slice(),applied:PATCHES.length-lastFailed.length,
    mode:mode,busy:busy(),ready:!!(d&&d.__fkTidy),
    catalog:inf?String(inf.textContent).slice(0,160):'(редактор не загружен)'
  };
}
return {
  version:VERSION,
  open:open,setMode:setMode,editTexture:editTexture,info:info,
  getMode:function(){return mode},
  reset:function(){loaded=null},
  busy:busy,
  files:function(){var a=api();return (a&&!busy())?a.files():null},
  current:function(){if(busy()&&pendingName)return pendingName;var a=api();return a?a.cur():''},
  dirtyNow:function(){var a=api();return !!a&&mode==='edit'&&(a.edits||0)>base},
  markSaved:function(){var a=api();base=a?(a.edits||0):0}
};
})();
