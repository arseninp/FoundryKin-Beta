/* fk-shell.js v0.8.29: app shell labels: Find (title and button) and the editor header (block name + file pill). Loaded before fk-app.js. */
(function(){
var T=document.getElementById('title'),B=document.getElementById('addBtn'),L=document.getElementById('texList');
if(!T)return;
var LENS='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
var st=document.createElement('style');
st.textContent='#top .t .fkFind{display:inline-flex;align-items:center;gap:8px}#top .t .fkFind svg,#addBtn svg{display:block;width:22px;height:22px;flex:none}#addBtn svg{margin-left:8px}'+
'#top .t .fkHead{display:flex;align-items:center;gap:8px;min-width:0}#top .t .fkTn{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#top .t .fkTf{flex:0 3 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 9px;border:1px solid var(--line);border-radius:999px;background:var(--bg);color:var(--mute);font-size:11px;font-weight:400;line-height:1.5}';
document.head.appendChild(st);
if(B){B.innerHTML='Find'+LENS}
function fixTitle(){
  if(T.querySelector('.fkFind')||T.querySelector('.fkHead'))return;
  var t=T.textContent.trim();
  if(t==='FINDER'||t==='Поисковик'||t==='Find'){
    var s=document.createElement('span');s.className='fkFind';s.appendChild(document.createTextNode('Find'));s.insertAdjacentHTML('beforeend',LENS);
    T.textContent='';T.appendChild(s);return;
  }
  var d=null,sm=null,i,c;
  for(i=0;i<T.children.length;i++){c=T.children[i];if(c.tagName==='DIV'&&!d)d=c;else if(c.tagName==='SMALL'&&!sm)sm=c}
  if(d&&/:$/.test(d.textContent)){
    var name=d.textContent.replace(/:$/,''),file=sm?sm.textContent.trim():'';
    var h=document.createElement('span');h.className='fkHead';
    var n=document.createElement('span');n.className='fkTn';n.textContent=name;h.appendChild(n);
    if(file){var f=document.createElement('span');f.className='fkTf';f.textContent=file;h.appendChild(f)}
    T.textContent='';T.appendChild(h);
  }
}
new MutationObserver(fixTitle).observe(T,{childList:true});
if(L){
  new MutationObserver(function(){
    var h=L.innerHTML;
    if(h.indexOf('+ Add texture')>=0)L.innerHTML=h.split('+ Add texture').join('Find');
  }).observe(L,{childList:true});
}
fixTitle();
})();
