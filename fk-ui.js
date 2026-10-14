/* FoundryKin 0.8.32: shared header layout, mockup colours, rounded press feedback. */
(function(){
var COLORS=':root[data-theme=light]{--bg:#e6e3dc;--panel:#d5d0ca;--ink:#2a2826;--mute:#7e7973;--line:#b2ada7;--acc:#718198;--accink:#fff;--stage:#d5d0ca;--fkbg:#d5d0ca;--red:#a4757b}'+
':root[data-theme=dark]{--bg:#262625;--panel:#383733;--ink:#e8e5df;--mute:#989590;--line:#51504e;--acc:#6d7791;--accink:#fff;--stage:#383733;--fkbg:#383733;--red:#a47c7c}';
var PRESS='html,*{-webkit-tap-highlight-color:transparent}button,label.btn,label.ghost,.btn{transition:filter .1s}button:active:not(:disabled),label.btn:active,label.ghost:active,.btn:active:not(:disabled){filter:brightness(.9)}button.fkc:active:not(:disabled){filter:none}.fkc:active .fkp,.fkc:active .fkn{filter:brightness(.88)}';
var ARROW='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
var LENS='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
function style(d,s){var e=d.createElement('style');e.textContent=s;d.head.appendChild(e)}
style(document,COLORS+PRESS+'#s-add iframe{background:var(--bg)}#top{flex:none}body.fkUnifiedFind #top{display:none}.acts button:active{filter:none;background:rgba(0,0,0,.1)}'+
'#addBtn.btn.pri{background:var(--panel);color:var(--ink);border-color:var(--line)}[data-go=create].btn.pri{background:var(--panel);color:var(--ink);border-color:var(--line)}'+
'#top .t .fkHead{display:flex;align-items:center;gap:8px;min-width:0}#top .t .fkTn{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#top .t .fkTf{flex:0 3 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 9px;border:1px solid var(--line);border-radius:999px;background:var(--bg);color:var(--mute);font-size:11px;font-weight:400;line-height:1.5}');
function packHeader(){
 var t=document.getElementById('title');if(!t||t.querySelector('.fkHead'))return;
 var n=t.querySelector('div'),p=t.querySelector('.pill');if(!n||!p)return;
 var h=document.createElement('span');h.className='fkHead';
 var a=document.createElement('span');a.className='fkTn';a.textContent=n.textContent;
 var b=document.createElement('span');b.className='fkTf';b.textContent=p.textContent;
 h.appendChild(a);h.appendChild(b);t.textContent='';t.appendChild(h);
}
var title=document.getElementById('title');if(title)new MutationObserver(packHeader).observe(title,{childList:true});
function attach(d){
 if(d.__fkUnified)return;
 var bar=d.getElementById('fkSearchBar'),q=d.getElementById('q'),main=d.querySelector('main');
 if(!bar||!q||!main||!d.__fkHelp)return;
 d.__fkUnified=true;
 style(d,COLORS+PRESS+'#fkGrid .fkc.fk-edited .fkp,#fkGrid .fkc.fk-edited .fkn{border-color:var(--red)}#fkGrid .fkn{background:var(--bg)}'+
 'body.fk-search main{padding-top:0}#fkSearchBar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:8px;margin:0 -14px;padding:calc(8px + env(safe-area-inset-top,0px)) 12px 8px;background:var(--panel);border-bottom:1px solid var(--line)}'+
 'body.fk-edit #fkSearchBar{display:none!important}body.fkMenuOpen #fkSearchBar{z-index:101}#fkSearchBar #q{position:static;min-width:0;min-height:40px;width:100%;padding-left:40px;box-shadow:none;background:var(--bg)}'+
 '.fkUnifiedField{position:relative;flex:1 1 auto;min-width:0}.fkUnifiedField svg{position:absolute;left:12px;top:50%;margin-top:-10px;width:20px;height:20px;color:var(--mute);pointer-events:none}#fkSearchBar .fkUnifiedBack{min-width:44px;min-height:40px;padding:0}#fkSearchBar .fkUnifiedBack svg{width:22px;height:22px;display:block;margin:auto}');
 var help=bar.querySelector('.fkHelpBtn'),field=d.createElement('div'),back=d.createElement('button');
 field.className='fkUnifiedField';field.appendChild(q);field.insertAdjacentHTML('beforeend',LENS);q.placeholder='Find';q.setAttribute('aria-label','Find');
 back.type='button';back.className='ghost fkUnifiedBack';back.setAttribute('aria-label','Назад');back.innerHTML=ARROW;
 back.addEventListener('click',function(){var b=document.getElementById('back');if(b)b.click()});
 bar.textContent='';bar.appendChild(back);bar.appendChild(field);if(help)bar.appendChild(help);
 bar.classList.add('fk-search-part');main.insertBefore(bar,main.firstChild);
}
function sync(){
 var f=document.getElementById('editor'),s=document.getElementById('s-add'),d=null,hide=false;
 try{d=f&&f.contentDocument;if(d)attach(d);
 hide=!!(s&&s.classList.contains('on')&&d&&d.__fkUnified&&typeof FKE!=='undefined'&&FKE.getMode()!=='edit');}catch(e){}
 document.body.classList.toggle('fkUnifiedFind',hide);
}
if(typeof FKE!=='undefined'){
 var op=FKE.open;FKE.open=function(f,u,cb){var r=op.call(FKE,f,u,cb),n=0;(function wait(){sync();try{if(f.contentDocument&&f.contentDocument.__fkUnified)return}catch(e){}if(++n<160)setTimeout(wait,100)})();return r};
 var mode=FKE.setMode;FKE.setMode=function(m){var r=mode.call(FKE,m);sync();return r};
}
var screens=document.getElementById('screens');if(screens)new MutationObserver(sync).observe(screens,{attributes:true,attributeFilter:['class'],subtree:true});
setInterval(sync,250);packHeader();sync();
})();
