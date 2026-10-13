/* fk-help.js v0.8.31: shorter editor texts, help panel (bottom sheet) with the shared close manager; the ⋮ button sits next to the floating search and in the service row; the app back button closes an open menu first. Loaded after fk-bg.js. */
(function(){
var EDITS=[
['Блок из игры (ищи по-английски: oak, door, trapdoor). В списке только родительские блоки, плиты, ступени, заборы и т.п. выбираются под превью. Точка: есть правки.','Блок из игры: ищи по-английски.'],
['Загруженный PNG ляжет в выбранную текстуру. Прозрачные пиксели остаются прозрачными.','Загруженный PNG заменит выбранную текстуру.'],
['Имя блока (подставляется из выбранного блока)','Имя блока'],
['<p class="lbl">Текстуры хранятся по файлам игры: если один файл используется в нескольких блоках (например, доски и книжная полка), правка видна везде. В один .mcpack попадают все файлы, которые ты правил. Проект сохраняется автоматически в память браузера на этом устройстве. Если очистить данные браузера, он пропадёт, поэтому скачивай результат.</p>','']
];
if(typeof PATCHES!=='undefined')EDITS.forEach(function(p){PATCHES.push(p)});
if(typeof FKE==='undefined')return;
var bk=document.getElementById('back');
if(bk)bk.addEventListener('click',function(e){
  try{var f=document.getElementById('editor'),w=f&&f.contentWindow;
    if(w&&w.FKM&&w.FKM.cur){e.stopImmediatePropagation();e.preventDefault();w.FKM.close()}}catch(x){}
},true);
var HELP='<p class="lbl">Правки попадают в пак по кнопке «Добавить» вверху экрана. Паки хранятся в памяти браузера на этом устройстве: если очистить данные браузера, они пропадут, поэтому экспортируй .mcpack из меню пака и сохраняй резервную копию.</p>'+
'<p class="lbl">Блок ищи по-английски (oak, door, trapdoor). В списке только родительские блоки; плиты, ступени, заборы и т.п. выбираются под превью. Красная рамка у карточки — у блока есть правки.</p>'+
'<p class="lbl">Если один файл текстуры используется в нескольких блоках (например, доски и книжная полка), правка видна везде. «Заменить» кладёт загруженный PNG в выбранную текстуру, прозрачные пиксели остаются прозрачными.</p>'+
'<p class="lbl">Пипетка слева берёт цвет с холста. Капля заменяет цвет: выбери новый цвет, коснись пикселя, и все пиксели точно такого же цвета на этой грани станут выбранным. Цвет в ряду можно удалить: задержи на нём палец.</p>';
var DOTS='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="19.5" r="2.4"/></svg>';
var CSS='#fkSearchBar{position:sticky;top:8px;z-index:30;display:flex;gap:6px;align-items:stretch}'+
'#fkSearchBar #q{position:static;flex:1 1 auto;min-width:0;box-shadow:0 2px 10px rgba(0,0,0,.28)}'+
'#fkSearchBar .fkHelpBtn{box-shadow:0 2px 10px rgba(0,0,0,.28)}'+
'.fkHelpBtn{min-width:44px;min-height:40px}.fkHelpBtn svg{display:block;width:22px;height:22px;margin:0 auto;pointer-events:none}'+
'#fkInfo summary{display:none!important}#fkInfo:not([open]){display:none}'+
'#fkHelpPanel{position:fixed;left:0;top:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center}'+
'#fkHelpPanel.on{display:flex}'+
'#fkHelpCard{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:16px 16px 0 0;padding:14px 14px 18px;max-width:460px;width:100%;max-height:85vh;overflow:auto}'+
'#fkHelpState .lbl{color:var(--ink);word-break:break-all}';
function attach(d){
  if(d.__fkHelp)return;
  var box=d.querySelector('#fkInfo'),q=d.querySelector('#q'),exp=d.querySelector('#clr');
  if(!box||!q||!q.parentNode||!exp||!exp.parentNode||!d.body)return;
  d.__fkHelp=true;
  var M=d.defaultView.FKM,info=d.querySelector('#info'),dbg=d.querySelector('#dbg');
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  function mk(){
    var b=d.createElement('button');b.type='button';b.className='ghost fkHelpBtn';b.innerHTML=DOTS;
    b.title='Справка';b.setAttribute('aria-label','Справка');b.setAttribute('aria-expanded','false');return b;
  }
  var b1=mk(),b2=mk();
  var bar=d.createElement('div');bar.id='fkSearchBar';
  q.parentNode.insertBefore(bar,q);bar.appendChild(q);bar.appendChild(b1);
  exp.parentNode.appendChild(b2);
  var panel=d.createElement('div');panel.id='fkHelpPanel';
  var card=d.createElement('div');card.id='fkHelpCard';
  var text=d.createElement('div');text.innerHTML=HELP;
  var state=d.createElement('div');state.id='fkHelpState';
  var cr=d.createElement('div');cr.className='row';
  var cb=d.createElement('button');cb.type='button';cb.className='ghost';cb.textContent='Закрыть';
  cr.appendChild(cb);card.appendChild(text);card.appendChild(state);card.appendChild(cr);panel.appendChild(card);d.body.appendChild(panel);
  function bad(){return (info&&/^Каталог (не загрузился|пустой)/.test(info.textContent))||(dbg&&/ошибка/.test(dbg.textContent))}
  function fill(){
    state.innerHTML='';
    var oi=null;try{oi=FKE.objInfo&&FKE.objInfo()}catch(e){}
    if(oi&&oi.file){var pf=d.createElement('p');pf.className='lbl';pf.textContent='Файл: '+oi.file;state.appendChild(pf)}
    [info,dbg].forEach(function(x){
      var t=x&&String(x.textContent||'').trim();
      if(t){var p=d.createElement('p');p.className='lbl';p.textContent=t;state.appendChild(p)}
    });
    var cf=d.querySelector('label[for="catfile"]');
    if(cf&&info&&/^Каталог (не загрузился|пустой)/.test(info.textContent))state.appendChild(cf.cloneNode(true));
  }
  function flag(v){b1.setAttribute('aria-expanded',v);b2.setAttribute('aria-expanded',v)}
  var menu={triggers:[b1,b2],show:function(){fill();panel.classList.add('on');flag('true')},hide:function(){panel.classList.remove('on');flag('false')}};
  function toggle(){if(M)M.toggle(menu);else if(panel.classList.contains('on'))menu.hide();else menu.show()}
  function shut(){if(M)M.close();else menu.hide()}
  b1.addEventListener('click',toggle);b2.addEventListener('click',toggle);
  cb.addEventListener('click',shut);
  panel.addEventListener('click',function(e){if(e.target===panel)shut()});
  box.open=false;
  var was=false;
  var tm=setInterval(function(){
    try{
      if(!d.defaultView||!d.defaultView.frameElement){clearInterval(tm);return}
      var x=!!bad();
      if(x&&!was)box.open=true;
      was=x;
    }catch(e){clearInterval(tm)}
  },1000);
}
var open0=FKE.open;
FKE.open=function(f,u,cb){
  var r=open0.call(FKE,f,u,cb),n=0;
  (function w(){
    var d=null;try{d=f.contentDocument}catch(e){}
    if(d&&d.__fkTidy){attach(d);return}
    if(++n<80)setTimeout(w,250);
  })();
  return r;
};
})();
