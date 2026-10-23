/* fk-pill.js: file-name pill in the top right corner of the 3D stage; hides the shell header pill while editing. */
(function(){
var A=window.FKAPI,FK=window.FK,stage=document.getElementById('stage'),slots=document.getElementById('slots');
if(!A||!stage||!slots)return;
var st=document.createElement('style');
st.textContent='.fkStagePill{position:absolute;top:8px;right:8px;max-width:calc(100% - 16px);box-sizing:border-box;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:800;line-height:1.4;background:var(--panel);color:var(--ink);border:1px solid var(--line);opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;z-index:2}.fkStagePill:empty{display:none}';
document.head.appendChild(st);
var pill=document.createElement('div');pill.className='fkStagePill';stage.appendChild(pill);
var pd=null;
try{pd=parent.document;var ps=pd.createElement('style');ps.textContent='body.fkEditing #title .fkTf{display:none}';pd.head.appendChild(ps)}catch(e){pd=null}
function file(){
  var b=slots.querySelector('button.on'),p=b?(b.dataset.id||b.title||''):'';
  return String(p).split('/').pop();
}
function upd(){
  var t=A.busy?(FK&&FK.t?FK.t('title.loading'):'...'):file();
  if(pill.textContent!==t)pill.textContent=t;
  if(pd)try{pd.body.classList.toggle('fkEditing',A.state.mode==='edit')}catch(e){}
}
new MutationObserver(upd).observe(slots,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
A.subscribe(upd);
addEventListener('pagehide',function(){if(pd)try{pd.body.classList.remove('fkEditing')}catch(e){}});
upd();
})();
