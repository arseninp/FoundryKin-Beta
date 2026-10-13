/* fk-help.js v0.8.23: shorter editor texts, help behind the ⋮ button (details are kept, not removed). Loaded after fk-bg.js. */
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
var CSS='#fkHelpRow{display:flex;justify-content:flex-end;margin:0 0 6px}#fkHelpBtn{background:var(--panel);border:1px solid var(--line);min-width:44px;font-size:18px;line-height:1}#fkInfo summary{display:none!important}#fkHelpText{margin-top:8px}';
function attach(d){
  if(d.__fkHelp)return;
  var box=d.querySelector('#fkInfo'),main=d.querySelector('main');
  if(!box||!main)return;
  d.__fkHelp=true;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var row=d.createElement('div');row.id='fkHelpRow';
  var b=d.createElement('button');b.id='fkHelpBtn';b.type='button';b.textContent='\u22EE';
  b.title='Справка';b.setAttribute('aria-label','Справка');b.setAttribute('aria-controls','fkInfo');
  row.appendChild(b);main.insertBefore(row,main.firstChild);
  var h=d.createElement('div');h.id='fkHelpText';h.innerHTML=HELP;box.appendChild(h);
  function mark(){b.setAttribute('aria-expanded',box.open?'true':'false')}
  box.open=false;mark();
  b.addEventListener('click',function(){box.open=!box.open;mark()});
  var info=d.querySelector('#info'),dbg=d.querySelector('#dbg'),was=false;
  var tm=setInterval(function(){
    try{
      if(!d.defaultView||!d.defaultView.frameElement){clearInterval(tm);return}
      var bad=(info&&/^Каталог (не загрузился|пустой)/.test(info.textContent))||(dbg&&/ошибка/.test(dbg.textContent));
      if(bad&&!was){box.open=true;mark()}
      was=!!bad;
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
