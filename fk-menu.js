/* One shared menu manager per document; no drawing tools or catalog dependencies. */
(function(root){
'use strict';
var FKM={cur:null,pushed:0,skip:false,opener:null,sheet:null};
FKM.mark=function(m,on){(m.triggers||[]).forEach(function(t){t.classList.toggle('fkTrigOn',on)});root.document.body.classList.toggle('fkMenuOpen',on)};
/* Dialog semantics for the visible sheet; roles and labels set by a menu itself are kept. */
function enter(m){
  var d=root.document,s=d.querySelector?d.querySelector('.fkBack.on .fkSheet'):null;
  FKM.sheet=s;if(!s)return;
  if(!s.getAttribute('role'))s.setAttribute('role','dialog');
  if(!s.getAttribute('aria-modal'))s.setAttribute('aria-modal','true');
  if(!s.getAttribute('aria-label')&&!s.getAttribute('aria-labelledby')){
    var t=s.querySelector&&s.querySelector('.fkTitle'),a=m.triggers&&m.triggers[0],n=(t&&t.textContent)||(a&&a.getAttribute('aria-label'))||'';
    if(n)s.setAttribute('aria-label',n);
  }
  if(!s.contains||!s.contains(d.activeElement)){s.tabIndex=-1;s.style.outline='none';try{s.focus()}catch(e){}}
}
function leave(){
  var o=FKM.opener;FKM.opener=null;FKM.sheet=null;
  if(o&&o.isConnected&&o.focus)try{o.focus()}catch(e){}
}
FKM.open=function(m){
  if(FKM.cur===m)return;
  if(!FKM.opener)FKM.opener=root.document.activeElement||null;
  if(FKM.cur){FKM.cur.hide();FKM.mark(FKM.cur,false)}
  m.show();FKM.cur=m;FKM.mark(m,true);enter(m);
  if(!FKM.pushed){try{root.history.pushState({fk:1},'');FKM.pushed=1}catch(e){}}
};
FKM.close=function(){
  var m=FKM.cur;if(!m)return;
  FKM.cur=null;m.hide();FKM.mark(m,false);leave();
  if(FKM.pushed){FKM.pushed=0;FKM.skip=true;try{root.history.back()}catch(e){FKM.skip=false}}
};
FKM.toggle=function(m){if(FKM.cur===m)FKM.close();else FKM.open(m)};
root.addEventListener('popstate',function(){
  if(FKM.skip){FKM.skip=false;return}
  var m=FKM.cur;if(m){FKM.cur=null;FKM.pushed=0;m.hide();FKM.mark(m,false);leave()}
});
root.addEventListener('keydown',function(e){
  var m=FKM.cur,s=FKM.sheet;if(!m||e.defaultPrevented)return;
  if(e.key==='Escape'){e.preventDefault();FKM.close();return}
  if(e.key!=='Tab'||!s||!s.querySelectorAll)return;
  var f=[].filter.call(s.querySelectorAll('button,input,select,textarea,a[href]'),function(x){return !x.disabled&&x.offsetParent!==null});
  if(!f.length){e.preventDefault();return}
  var a=root.document.activeElement,first=f[0],last=f[f.length-1],inside=s.contains&&s.contains(a);
  if(e.shiftKey&&(a===first||a===s||!inside)){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&(a===last||!inside)){e.preventDefault();first.focus()}
});
root.FKM=FKM;
})(window);
