/* fk-grid.js: the Find screen of the editor: block search, card grid and the frozen frame of each card.
   Works only through FKAPI (state, grid(), subscribe, setMode). Cards are single frames taken from the FKView stage. */
(function(){
var FK=window.FK,A=window.FKAPI;
function T(k,p){return FK.t(k,p)}
function $(s){return document.querySelector(s)}
var PAGE=60,MAX=6;
var box=$('#fkGrid'),more=$('#fkMore'),qi=$('#q'),catLoad=$('#catLoad');
var pv={},queue=[],active=0,imgCache={},lastPack=null,lastCat=null,lastSig='',prevMode='search',savedY=0,clicked=false;
var ids=[],shown=0,fail3=0,migrated=null,tmr=null;

/* job queue: a few image loads at a time; frames are taken only while the Find screen is open */
function pump(){while(active<MAX&&queue.length&&A.state.mode==='search'){var j=queue.shift();active++;Promise.resolve().then(j).then(fin,fin)}}
function fin(){active--;pump()}
function enqueue(j){queue.push(j);pump()}

/* active pack, read from the shell storage */
function packData(){
  try{var d=JSON.parse(localStorage.getItem('fk070_packs'));return (d&&d.packs&&d.packs.filter(function(x){return x.id===d.active})[0])||null}catch(e){return null}
}
function packMap(){var p=packData(),m={};if(p)p.textures.forEach(function(t){if(t.data)m['textures/'+t.path]=t.data});return m}
/* compares the pack by content: same paths and identical data URLs */
function samePack(a,b){
  var ka=Object.keys(a);
  if(ka.length!==Object.keys(b).length)return false;
  for(var i=0;i<ka.length;i++){if(a[ka[i]]!==b[ka[i]])return false}
  return true;
}
function getImg(ctx,path){
  var f=ctx.files&&ctx.files[path];
  if(f&&f.data)return new Promise(function(ok){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=f.data});
  if(!imgCache[path])imgCache[path]=ctx.load(path).then(function(im){if(!im)delete imgCache[path];return im});
  return imgCache[path];
}
function dropFrames(){Object.keys(pv).forEach(function(k){URL.revokeObjectURL(pv[k].u)});pv={}}

/* One frame of the shared stage: same model, light, angle and camera class as in the editor.
   Every texture the editor model uses (all keys of the face map) is loaded once per path. */
function snap(SH,shape,fm,keys,norm,id){
  var dbl=/leaves/.test(id)||shape==='plant'||shape==='azalea'||shape==='candle';
  return FKView.shot(id,function(g,hid){
    var mats={},ids2={},byPath={},own=[];
    function mk(c){var t=FKView.texture(c),m=FKView.material(dbl,t);m.depthWrite=!FKView.semi(c);own.push(t,m);return m}
    keys.forEach(function(k){
      var p=fm[k],c=norm[p];ids2[k]=k;
      if(!c){mats[k]=hid;return}
      mats[k]=byPath[p]||(byPath[p]=mk(c));
    });
    if(shape==='door'){
      var L=norm[fm.down],U=norm[fm.north];
      if(!L||!U)throw new Error('door');
      mats.__door=mk(FKView.door(L,U));
    }
    FKShapes.build({shape:shape,cur:id,slot:'up',faceMap:ids2,mats:mats,group:g,hiddenMat:hid,SHAPES:SH,refreshDoor:function(){}});
    return function(){own.forEach(function(x){x.dispose()})};
  });
}
var TINT=/^(?:[a-z_]+_)?leaves2?$|^(?:waterlily|vine|fern|large_fern|short_grass|tallgrass|tall_grass|double_plant|bush|leaf_litter|seagrass)$/;
function makePreview(ctx,id){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  if(cat.cr&&cat.cr[id]&&TINT.test(id)){var cp=cat.cr[id];fm={up:cp,down:cp,north:cp,south:cp,east:cp,west:cp}}
  var shape=ctx.shapeFor(id),keys=Object.keys(fm).filter(function(k){return fm[k]}),paths=[];
  keys.forEach(function(k){if(paths.indexOf(fm[k])<0)paths.push(fm[k])});
  return Promise.all(paths.map(function(p){return getImg(ctx,p)})).then(function(arr){
    var R=0;arr.forEach(function(im){if(im&&im.width>R)R=im.width});
    if(!R||fail3>=3||A.state.mode!=='search')return null;
    var norm={};
    paths.forEach(function(p,i){
      var im=arr[i];if(!im)return;
      var c=document.createElement('canvas');c.width=c.height=R;
      var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,R,R);
      norm[p]=c;
    });
    try{return snap(ctx.shapes,shape,fm,keys,norm,id)}catch(e){fail3++;return null}
  });
}

/* active pack: put its textures into the editor state */
function applyPack(){
  var c=A.grid(),m=packMap();
  if(lastPack&&samePack(m,lastPack))return false;
  lastPack=m;c.setPack(m);dropFrames();
  return true;
}
function discardEdits(){
  var c=A.grid();c.discard();
  var m=packMap();lastPack=m;c.setPack(m);dropFrames();
}

/* cards */
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
var mobs=new IntersectionObserver(function(es){if(es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
function paint(card){
  var c=A.grid();if(!c.catalog)return;
  var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=A.edits||0,e=pv[id];
  if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
  enqueue(function(){
    if(!card.isConnected)return Promise.resolve();
    return makePreview(c,id).then(function(u){
      if(!u)return;
      var o=pv[id];pv[id]={u:u,ed:ed,e:edits};
      if(card.isConnected)setImg(card,u);
      if(o)URL.revokeObjectURL(o.u);
    },function(){});
  });
}
function setImg(card,u){var im=card.querySelector('img');if(im&&u)im.src=u}
function mkCard(c,id){
  var b=document.createElement('button');b.type='button';b.className='fkc';b.setAttribute('data-id',id);
  var p=document.createElement('div');p.className='fkp';p.appendChild(document.createElement('img'));
  var n=document.createElement('div');n.className='fkn';n.textContent=id.replace(/_/g,' ');
  b.appendChild(p);b.appendChild(n);
  b.classList.toggle('fk-edited',!!c.edited(id));
  return b;
}
function addPage(){
  var c=A.grid();if(!c.catalog)return;
  var end=Math.min(shown+PAGE,ids.length);
  for(var i=shown;i<end;i++){var k=mkCard(c,ids[i]);box.appendChild(k);obs.observe(k)}
  shown=end;
}
function note(text){
  box.innerHTML='';ids=[];
  var m=document.createElement('div');m.id='fkEmpty';m.textContent=text;box.appendChild(m);
}
function statusNote(s){
  if(s.status==='failed')return s.error&&s.error.code==='catalog_no_blocks'?T('cat.no_blocks'):T('cat.failed',{detail:s.error?s.error.detail:''});
  if(s.status==='empty')return T('cat.empty');
  return T('cat.loading');
}
function sig(c){return Object.keys(c.dirty||{}).length+'|'+(A.edits||0)}
function render(){
  var c=A.grid();mobs.unobserve(more);shown=0;
  if(!c.catalog){note(statusNote(A.state));return}
  if(migrated!==c.catalog){migrated=c.catalog;try{if(parent.FKAPP)parent.FKAPP.migrate(c)}catch(e){}}
  var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
  ids=c.catalog.ids.filter(function(id){return !qv||id.indexOf(qv)>=0});
  lastCat=c.catalog;lastSig=sig(c);
  box.innerHTML='';
  if(!ids.length){note(T('cat.none'));return}
  addPage();mobs.observe(more);
}
function refresh(){
  var c=A.grid();
  Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){
    k.classList.toggle('fk-edited',!!c.edited(k.getAttribute('data-id')));
    paint(k);
  });
}
/* back from the editor: load enough cards to reach the saved position, then scroll once the layout is ready */
function restoreScroll(y){
  var de=document.documentElement;
  while(shown<ids.length&&de.scrollHeight<y+window.innerHeight)addPage();
  window.scrollTo(0,y);
  requestAnimationFrame(function(){window.scrollTo(0,y)});
}

/* events */
qi.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,150)});
box.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('.fkc'):null;if(!b)return;
  savedY=window.scrollY;clicked=true;
  A.grid().select(b.getAttribute('data-id'));
  A.setMode('edit');
});
/* the shell hides its own header on the Find screen, so this button stands in for the shell Back */
$('#fkBack').addEventListener('click',function(){
  try{var b=parent.document.getElementById('back');if(b)b.click()}catch(e){}
});
A.subscribe(function(s){
  var force=false,y=0;
  if(s.mode!==prevMode){
    if(s.mode==='edit'){if(!clicked)savedY=0;clicked=false}
    else if(prevMode==='edit'){discardEdits();force=true;y=savedY}
    prevMode=s.mode;
  }
  catLoad.hidden=!(s.status==='failed'||s.status==='empty');
  if(s.mode!=='search')return;
  var c=A.grid(),changed=applyPack();
  if(!c.catalog){note(statusNote(s));return}
  if(force||changed||c.catalog!==lastCat)render();
  else if(sig(c)!==lastSig){lastSig=sig(c);refresh()}
  if(y)restoreScroll(y);
  pump();
});
applyPack();
render();
})();
