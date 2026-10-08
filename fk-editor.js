var PATCHES=[["else{u=X+.5;v=ny>0?.5-Z:Z+.5}", "else if(vs!==1){var th=(w<d)?(X-x+w/2)/w:(Z-z+d/2)/d;u=(w<d)?Z+.5:X+.5;v=ny>0?1-.09375*th:.09375*th}\n    else{u=X+.5;v=ny>0?.5-Z:Z+.5}"], ["  var f=document.createElement('button');f.textContent='✎ свободный режим';f.onclick=selectCustom;box.insertBefore(f,box.firstChild);\n", ""], ["function syncSame(){$('#sameLabel').style.display=cur==='custom'?'flex':'none';$('#same').checked=customSame}", "function syncSame(){$('#same').checked=customSame}"], ["<label class=\"chk\" id=\"sameLabel\">", "<label class=\"chk\" id=\"sameLabel\" style=\"display:none\">"], ["if(cur==='custom'){n.disabled=false;n.value=customName}else{n.disabled=true;n.value=cur}", "if(cur==='custom'){n.disabled=true;n.value='';n.placeholder='выбери блок'}else{n.disabled=true;n.value=cur}"], ["Имя блока (в свободном режиме вводится вручную, для блока из игры подставляется само)", "Имя блока (подставляется из выбранного блока)"], ["Пока работает свободный режим.", "Выбери блок из списка, когда он загрузится."], [" либо работай в свободном режиме.", "."], ["  e.preventDefault();ed.setPointerCapture(e.pointerId);\n", "  if(cur==='custom'){say('Сначала выбери блок из списка.');return}\n  e.preventDefault();ed.setPointerCapture(e.pointerId);\n"], ["img.onload=function(){if(!cv[slot])return;pushUndo();", "img.onload=function(){if(!cv[slot]||cur==='custom')return;pushUndo();"], ["$('#clr').onclick=function(){if(!cv[slot])return;", "$('#clr').onclick=function(){if(!cv[slot]||cur==='custom')return;"], ["    var f=files[fk(s.id)];if(!f)return;\n    var p=cur==='custom'?customPath(s.id):s.id;", "    if(cur==='custom')return;\n    var f=files[fk(s.id)];if(!f)return;\n    var p=s.id;"], ["if(k.indexOf('custom/')===0){var id=k.slice(7);if(customSame&&id!=='side')return;p=customPath(id)}\n    else p=k;", "if(k.indexOf('custom/')===0)return;\n    p=k;"], ["Нечего экспортировать: нарисуй хотя бы одну текстуру.", "Нечего экспортировать: выбери блок и измени его текстуру."], ["/* ---------- старт ---------- */", "window.FKAPI={files:function(){return curFiles().filter(function(f){return dirty[f.path.replace(/\\.png$/,'')]})},cur:function(){return cur}};\n/* ---------- старт ---------- */"], ["v0.6.4", "v0.6.5"], ["return !q||id.indexOf(q)>=0}).slice(0,60);", "return !q||id.indexOf(q)>=0}).slice(0,300);"]];
function applyPatches(h){
  var failed=[];
  PATCHES.forEach(function(p){
    if(h.indexOf(p[0])<0){failed.push(p[0].slice(0,40));return}
    h=h.split(p[0]).join(p[1]);
  });
  return {html:h,failed:failed};
}
var FKE=(function(){
var frame=null,mode='search',onMode=null,loaded=null;
function doc(){try{return (frame&&frame.contentDocument)||null}catch(e){return null}}
function api(){try{var d=doc();return (d&&d.defaultView&&d.defaultView.FKAPI)||null}catch(e){return null}}
function note(){if(onMode)onMode(mode)}
function setMode(m){
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
    var list=d.querySelector('#list');
    if(list)list.addEventListener('click',function(e){
      if(!e.target.closest('button'))return;
      setMode('edit');
      setTimeout(note,800);
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
    tidy(d);setMode('search');
  };
  fetch(url).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(h){
    var res=applyPatches(h),base=new URL(url,location.href).href;
    if(res.failed.length&&cb.onWarn)cb.onWarn('Часть правок редактора не применилась: '+res.failed.length);
    f.srcdoc=res.html.replace(/<head>/i,'<head><base href="'+base+'">');
  }).catch(function(){f.src=url});
}
return {
  open:open,setMode:setMode,
  getMode:function(){return mode},
  reset:function(){loaded=null},
  files:function(){var a=api();return a?a.files():null},
  current:function(){var a=api();return a?a.cur():''}
};
})();
