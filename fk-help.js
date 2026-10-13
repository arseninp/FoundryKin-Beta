/* fk-help.js v0.8.24: shorter editor texts, help panel behind the ⋮ button (details are kept, not removed). Loaded after fk-bg.js. */
(function(){
var EDITS=[
['Блок из игры (ищи по-английски: oak, door, trapdoor). В списке только родительские блоки, плиты, ступени, заборы и т.п. выбираются под превью. Точка: есть правки.','Блок из игры: ищи по-английски.'],
['Загруженный PNG ляжет в выбранную текстуру. Прозрачные пиксели остаются прозрачными.','Загруженный PNG заменит выбранную текстуру.'],
['Имя блока (подставляется из выбранного блока)','Имя блока'],
['<p class="lbl">Текстуры хранятся по файлам игры: если один файл используется в нескольких блоках (например, доски и книжная полка), правка видна везде. В один .mcpack попадают все файлы, которые ты правил. Проект сохраняется автоматически в память браузера на этом устройстве. Если очистить данные браузера, он пропадёт, поэтому скачивай результат.</p>','<p class="lbl">Правки попадают в пак по кнопке «✓ В пак».</p>']
];
if(typeof PATCHES!=='undefined')EDITS.forEach(function(p){PATCHES.push(p)});
if(typeof FKE==='undefined')return;
var HELP='<p class="lbl">Блок ищи по-английски (oak, door, trapdoor). В списке только родительские блоки; плиты, ступени, заборы и т.п. выбираются под превью. Красная рамка у карточки — у блока есть правки.</p>'+
'<p class="lbl">Если один файл текстуры используется в нескольких блоках (например, доски и книжная полка), правка видна везде. Загруженный PNG заменяет выбранную текстуру, прозрачные пиксели остаются прозрачными.</p>'+
'<p class="lbl">Правки сохраняются в пак кнопкой «✓ В пак». Паки хранятся в памяти браузера на этом устройстве: если очистить данные браузера, они пропадут, поэтому экспортируй .mcpack и скачивай резервную копию.</p>';
var CSS='#fkHelpRow{display:flex;justify-content:flex-end;margin:0 0 6px}body.fk-edit #fkHelpRow{display:flex!important}'+
'#fkHelpBtn{background:var(--panel);border:1px solid var(--line);min-width:44px;font-size:18px;line-height:1}'+
'#fkInfo summary{display:none!important}'+
'#fkHelpPanel{position:fixed;left:0;top:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,.45);display:none;align-items:flex-start;justify-content:center;padding:12px;overflow:auto}'+
'#fkHelpPanel.on{display:flex}'+
'#fkHelpCard{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:14px;max-width:460px;width:100%}'+
'#fkHelpState .lbl{color:var(--ink)}';
function attach(d){
  if(d.__fkHelp)return;
  var box=d.querySelector('#fkInfo'),main=d.querySelector('main');
  if(!box||!main||!d.body)return;
  d.__fkHelp=true;
  var info=d.querySelector('#info'),dbg=d.querySelector('#dbg');
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var row=d.createElement('div');row.id='fkHelpRow';row.className='fk-search-part';
  var b=d.createElement('button');b.id='fkHelpBtn';b.type='button';b.textContent='\u22EE';
  b.title='Справка';b.setAttribute('aria-label','Справка');b.setAttribute('aria-expanded','false');
  row.appendChild(b);main.insertBefore(row,main.firstChild);
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
    [info,dbg].forEach(function(x){
      var t=x&&String(x.textContent||'').trim();
      if(t){var p=d.createElement('p');p.className='lbl';p.textContent=t;state.appendChild(p)}
    });
    var cf=d.querySelector('label[for="catfile"]');
    if(cf&&info&&/^Каталог (не загрузился|пустой)/.test(info.textContent))state.appendChild(cf.cloneNode(true));
  }
  function show(on){
    if(on)fill();
    if(on)panel.classList.add('on');else panel.classList.remove('on');
    b.setAttribute('aria-expanded',on?'true':'false');
  }
  b.addEventListener('click',function(){show(!panel.classList.contains('on'))});
  cb.addEventListener('click',function(){show(false)});
  panel.addEventListener('click',function(e){if(e.target===panel)show(false)});
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
