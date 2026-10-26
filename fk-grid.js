/* Find UI. Object preparation and snapshots belong to FKAPI/FKView. */
(function(){
var FK=window.FK,A=window.FKAPI;
function T(k,p){return FK.t(k,p)}
function $(s){return document.querySelector(s)}
var PAGE=60,box=$('#fkGrid'),more=$('#fkMore'),qi=$('#q'),catLoad=$('#catLoad');
var pv={},generation=0,lastPack=null,lastCat=null,lastSig='',prevMode='search',savedY=0,clicked=false;
var ids=[],shown=0,migrated=null,tmr=null,category='all',M=window.FKM;
var categories=[['all','All','Всё'],['blocks','Blocks','Блоки'],['items','Items','Предметы'],['entities','Entities','Сущности'],['particles','Particles','Частицы'],['ui','UI','Интерфейс'],['environment','Environment','Окружение'],['colormap','Colormap','Карты цветов'],['paintings','Paintings','Картины'],['maps','Maps','Карты'],['equipment','Equipment','Экипировка'],['other','Other','Прочее']];
function categoryLabel(row){return row[FK.lang()==='ru'?2:1]}
function categoryOf(cat,id){return cat.category&&cat.category[id]||'blocks'}
var filterHost=document.createElement('span'),filterButton=document.createElement('button');
filterHost.className='fk-header-help';filterButton.type='button';filterButton.className='ghost fkHelpBtn';
filterButton.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h9m4 0h3"/><path d="M13 3v6M7 9v6m6 0v6"/></svg>';
filterButton.setAttribute('aria-haspopup','menu');filterButton.setAttribute('aria-expanded','false');filterButton.setAttribute('aria-controls','fkCategoryMenu');filterHost.appendChild(filterButton);
var helpSlot=$('#fkHelpSlot');helpSlot.parentNode.insertBefore(filterHost,helpSlot);
var filterPanel=document.createElement('div');filterPanel.id='fkCategoryMenu';filterPanel.className='fkMenu';filterPanel.setAttribute('role','menu');filterPanel.style.width='224px';filterPanel.style.maxWidth='calc(100vw - 16px)';filterPanel.style.maxHeight='65vh';filterPanel.style.overflowY='auto';document.body.appendChild(filterPanel);
function updateFilter(){var row=categories.filter(function(x){return x[0]===category})[0],label=(FK.lang()==='ru'?'Категория: ':'Category: ')+categoryLabel(row);filterButton.title=label;filterButton.setAttribute('aria-label',label);filterButton.classList.toggle('on',category!=='all')}
var filterMenu={triggers:[filterButton],show:function(){
  filterPanel.innerHTML='';categories.forEach(function(row){var button=document.createElement('button');button.type='button';button.textContent=categoryLabel(row);button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(category===row[0]));button.classList.toggle('on',category===row[0]);button.addEventListener('click',function(){var changed=category!==row[0];category=row[0];updateFilter();M.close();if(changed){clearTimeout(tmr);savedY=0;render();window.scrollTo(0,0)}filterButton.focus({preventScroll:true})});filterPanel.appendChild(button)});
  var rect=filterButton.getBoundingClientRect();filterPanel.style.left=Math.max(8,Math.min(innerWidth-232,rect.right-224))+'px';filterPanel.style.top=(rect.bottom+6)+'px';filterPanel.style.display='block';filterButton.setAttribute('aria-expanded','true');
},hide:function(){filterPanel.style.display='none';filterButton.setAttribute('aria-expanded','false')}};
filterButton.addEventListener('click',function(){M.toggle(filterMenu)});
document.addEventListener('pointerdown',function(e){if(M.cur===filterMenu&&!filterPanel.contains(e.target)&&!filterButton.contains(e.target))M.close()},true);updateFilter();
function invalidatePreviews(){generation++}
function valid(gen){return gen===generation&&A.state.mode==='search'&&!document.hidden}
function packData(){try{var d=JSON.parse(localStorage.getItem('fk070_packs'));return (d&&d.packs&&d.packs.filter(function(x){return x.id===d.active})[0])||null}catch(e){return null}}
function packMap(){var p=packData(),m={};if(p)p.textures.forEach(function(t){if(t.data)m['textures/'+t.path]=t.data});return m}
function samePack(a,b){var ka=Object.keys(a);if(ka.length!==Object.keys(b).length)return false;for(var i=0;i<ka.length;i++)if(a[ka[i]]!==b[ka[i]])return false;return true}
function applyPack(){var c=A.grid(),m=packMap();if(lastPack&&samePack(m,lastPack))return false;invalidatePreviews();lastPack=m;c.setPack(m);pv={};return true}
function discardEdits(){invalidatePreviews();var c=A.grid();c.discard();var m=packMap();lastPack=m;c.setPack(m);pv={}}
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&A.state.mode==='search'&&!document.hidden){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
var mobs=new IntersectionObserver(function(es){if(A.state.mode==='search'&&!document.hidden&&es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
function paint(card){
  var c=A.grid();if(!c.catalog||A.state.mode!=='search'||document.hidden)return;
  var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=A.edits||0,e=pv[id],gen=generation;
  if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}if(card.fkPending===gen)return;card.fkPending=gen;
  function current(){return valid(gen)&&card.isConnected&&A.grid().catalog===c.catalog}
  Promise.resolve().then(function(){return current()?c.preview(id,current):null}).then(function(u){if(card.fkPending===gen)card.fkPending=null;if(!current())return;if(u)pv[id]={u:u,ed:ed,e:edits};setImg(card,u)},function(){if(card.fkPending===gen)card.fkPending=null});
}
function setImg(card,u){var im=card.querySelector('img');if(im&&u)im.src=u}
function mkCard(c,id){var b=document.createElement('button');b.type='button';b.className='fkc';b.setAttribute('data-id',id);var p=document.createElement('div');p.className='fkp';p.appendChild(document.createElement('img'));var n=document.createElement('div');n.className='fkn';n.textContent=id.replace(/_/g,' ');b.appendChild(p);b.appendChild(n);b.classList.toggle('fk-edited',!!c.edited(id));return b}
function addPage(){var c=A.grid();if(!c.catalog)return;var end=Math.min(shown+PAGE,ids.length);for(var i=shown;i<end;i++){var k=mkCard(c,ids[i]);box.appendChild(k);obs.observe(k)}shown=end}
function note(text){obs.disconnect();box.innerHTML='';ids=[];var m=document.createElement('div');m.id='fkEmpty';m.textContent=text;box.appendChild(m)}
function statusNote(s){if(s.status==='failed')return s.error&&s.error.code==='catalog_no_blocks'?T('cat.no_blocks'):T('cat.failed',{detail:s.error?s.error.detail:''});if(s.status==='empty')return T('cat.empty');return T('cat.loading')}
function sig(c){return Object.keys(c.dirty||{}).length+'|'+(A.edits||0)}
function render(){invalidatePreviews();obs.disconnect();var c=A.grid();mobs.unobserve(more);shown=0;if(!c.catalog){note(statusNote(A.state));return}if(migrated!==c.catalog){migrated=c.catalog;try{if(parent.FKAPP)parent.FKAPP.migrate(c)}catch(e){}}var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');ids=c.catalog.ids.filter(function(id){return (!qv||id.indexOf(qv)>=0)&&(category==='all'||categoryOf(c.catalog,id)===category)});lastCat=c.catalog;lastSig=sig(c);box.innerHTML='';if(!ids.length){if(category==='all'||category==='blocks')note(T('cat.none'));return}addPage();mobs.observe(more)}
function refresh(){invalidatePreviews();obs.disconnect();var c=A.grid();Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){k.classList.toggle('fk-edited',!!c.edited(k.getAttribute('data-id')));obs.observe(k)})}
function restoreScroll(y){var de=document.documentElement;while(shown<ids.length&&de.scrollHeight<y+window.innerHeight)addPage();window.scrollTo(0,y);requestAnimationFrame(function(){window.scrollTo(0,y)})}
qi.addEventListener('input',function(){invalidatePreviews();clearTimeout(tmr);tmr=setTimeout(render,150)});
document.addEventListener('visibilitychange',function(){if(document.hidden)invalidatePreviews();else if(A.state.mode==='search'){var changed=applyPack();if(changed||A.grid().catalog!==lastCat)render();else refresh();mobs.unobserve(more);mobs.observe(more)}});
box.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('.fkc'):null;if(!b)return;savedY=window.scrollY;clicked=true;A.grid().select(b.getAttribute('data-id'));A.setMode('edit')});
$('#fkBack').addEventListener('click',function(){try{var b=parent.document.getElementById('back');if(b)b.click()}catch(e){}});
A.subscribe(function(s){var force=false,y=0;if(s.mode!==prevMode){if(s.mode==='edit'){if(M.cur===filterMenu)M.close();invalidatePreviews();if(!clicked)savedY=0;clicked=false}else if(prevMode==='edit'){discardEdits();force=true;y=savedY}prevMode=s.mode}catLoad.hidden=!(s.status==='failed'||s.status==='empty');if(s.mode!=='search')return;var c=A.grid(),changed=applyPack();if(!c.catalog){note(statusNote(s));return}if(force||changed||c.catalog!==lastCat)render();else if(sig(c)!==lastSig){lastSig=sig(c);refresh()}if(y)restoreScroll(y)});
applyPack();render();
})();
