/* fk-help.js: help sheet of the editor: usage notes, catalog status, selected block info and recent errors.
   Every line is built from FKAPI.state, never from text on the page. */
(function(){
var FK=window.FK,A=window.FKAPI,M=window.FKM;
function T(k,p){return FK.t(k,p)}
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
var DOTS='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="19.5" r="2.4"/></svg>';

function catText(s){
  if(s.status==='failed')return s.error&&s.error.code==='catalog_no_blocks'?T('cat.no_blocks'):T('cat.failed',{detail:s.error?s.error.detail:''});
  if(s.status==='empty')return T('cat.empty');
  if(s.status==='ready'){
    var t=s.source==='cache'?(s.refreshing?T('cat.cache_refreshing',{n:s.count}):(s.refreshFailed?T('cat.cache_failed',{n:s.count,detail:s.refreshFailed}):T('cat.cache',{n:s.count}))):T('cat.ready',{n:s.count});
    return s.filtered?t:t+' '+T('cat.unfiltered');
  }
  return T('cat.loading');
}
function infoText(i){
  var t=T('info.selected',{id:i.id})+' '+T('info.files',{n:i.files.length,list:i.files.join(', ')});
  if(i.shared.length)t+=' '+T('info.shared',{n:i.shared.length,list:i.shared.slice(0,8).join(', ')+(i.shared.length>8?'…':'')});
  if(i.forms.length)t+=' '+T('info.forms',{list:i.forms.map(function(k){return T('shape.'+k).toLowerCase()}).join(', ')});
  if(i.note)t+=' '+T('info.note.'+i.note);
  return t+' '+T('info.kind.'+i.kind);
}
function errText(e){
  var k='err.'+e.code,t=T(k,{detail:e.detail});
  return t===k?e.code+(e.detail?': '+e.detail:''):t;
}

var panel=mk('div','fkBack'),card=mk('div','fkSheet'),text=mk('div',''),state=mk('div','');
var row=mk('div','row'),close=mk('button','ghost',T('ui.close'));
close.type='button';row.appendChild(close);
['help.p1','help.p2','help.p3','help.p4'].forEach(function(k){text.appendChild(mk('p','lbl',T(k)))});
card.appendChild(text);card.appendChild(state);card.appendChild(row);panel.appendChild(card);document.body.appendChild(panel);

function fill(){
  state.innerHTML='';
  var s=A.state,o=null;
  try{o=A.grid().obj()}catch(e){}
  function p(t){state.appendChild(mk('p','lbl',t))}
  if(o&&o.file)p(T('help.file',{name:o.file}));
  p(catText(s));
  if(s.info)p(infoText(s.info));
  s.errors.forEach(function(e){p(errText(e))});
  if(s.status==='failed'||s.status==='empty'){
    var l=mk('label','ghost btn',T('cat.load'));l.setAttribute('for','catfile');state.appendChild(l);
  }
}
function mkBtn(){
  var b=mk('button','ghost fkHelpBtn');b.type='button';b.innerHTML=DOTS;
  b.title=T('ui.help');b.setAttribute('aria-label',T('ui.help'));b.setAttribute('aria-expanded','false');return b;
}
var b1=mkBtn(),b2=mkBtn(),slot1=document.getElementById('fkHelpSlot'),svc=document.getElementById('fkSvc');
if(slot1)slot1.appendChild(b1);
if(svc)svc.appendChild(b2);
function flag(v){b1.setAttribute('aria-expanded',v);b2.setAttribute('aria-expanded',v)}
var menu={triggers:[b1,b2],show:function(){fill();panel.classList.add('on');flag('true')},hide:function(){panel.classList.remove('on');flag('false')}};
b1.addEventListener('click',function(){M.toggle(menu)});
b2.addEventListener('click',function(){M.toggle(menu)});
close.addEventListener('click',function(){M.close()});
panel.addEventListener('click',function(e){if(e.target===panel)M.close()});
A.subscribe(function(){if(panel.classList.contains('on'))fill()});
})();
