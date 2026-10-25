/* fk-grid.js: the Find screen of the editor: block search, card grid and static 3D snapshots.
   Works only through FKAPI (state, grid(), subscribe, setMode). Models come from FKShapes. */
(function(){
var FK=window.FK,A=window.FKAPI;
function T(k,p){return FK.t(k,p)}
function $(s){return document.querySelector(s)}
var PAGE=60,S256=256;
var box=$('#fkGrid'),more=$('#fkMore'),qi=$('#q'),catLoad=$('#catLoad');
var pv={},queue=[],active=false,pumpTimer=null,generation=0,imgCache={},lastPack=null,lastCat=null,lastSig='',prevMode='search',savedY=0,clicked=false;
var ids=[],shown=0,st3=null,mode3d=null,fail3=0,migrated=null,tmr=null;

/* Categories are object metadata, not guesses based on texture folders.
   The current catalog contains blocks; future catalogs can supply category[id]. */
var category='all',M=window.FKM;
var categories=[
  ['all','All','Всё'],['blocks','Blocks','Блоки'],['items','Items','Предметы'],
  ['entities','Entities','Сущности'],['particles','Particles','Частицы'],
  ['ui','UI','Интерфейс'],['environment','Environment','Окружение'],
  ['colormap','Colormap','Карты цветов'],['paintings','Paintings','Картины'],
  ['maps','Maps','Карты'],['equipment','Equipment','Экипировка'],['other','Other','Прочее']
];
function categoryLabel(row){return row[FK.lang()==='ru'?2:1]}
function categoryOf(cat,id){return cat.category&&cat.category[id]||'blocks'}
var filterHost=document.createElement('span'),filterButton=document.createElement('button');
filterHost.className='fk-header-help';filterButton.type='button';filterButton.className='ghost fkHelpBtn';
filterButton.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h9m4 0h3"/><path d="M13 3v6M7 9v6m6 0v6"/></svg>';
filterButton.setAttribute('aria-haspopup','menu');filterButton.setAttribute('aria-expanded','false');
filterButton.setAttribute('aria-controls','fkCategoryMenu');filterHost.appendChild(filterButton);
var helpSlot=$('#fkHelpSlot');helpSlot.parentNode.insertBefore(filterHost,helpSlot);
var filterPanel=document.createElement('div');filterPanel.id='fkCategoryMenu';filterPanel.className='fkMenu';
filterPanel.setAttribute('role','menu');filterPanel.style.width='224px';filterPanel.style.maxWidth='calc(100vw - 16px)';
filterPanel.style.maxHeight='65vh';filterPanel.style.overflowY='auto';document.body.appendChild(filterPanel);
function updateFilter(){
  var row=categories.filter(function(x){return x[0]===category})[0];
  var label=(FK.lang()==='ru'?'Категория: ':'Category: ')+categoryLabel(row);
  filterButton.title=label;filterButton.setAttribute('aria-label',label);
  filterButton.classList.toggle('on',category!=='all');
}
var filterMenu={triggers:[filterButton],show:function(){
  filterPanel.innerHTML='';
  categories.forEach(function(row){
    var button=document.createElement('button');button.type='button';button.textContent=categoryLabel(row);
    button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(category===row[0]));
    button.classList.toggle('on',category===row[0]);
    button.addEventListener('click',function(){
      var changed=category!==row[0];category=row[0];updateFilter();M.close();
      if(changed){clearTimeout(tmr);savedY=0;render();window.scrollTo(0,0)}
      filterButton.focus({preventScroll:true});
    });
    filterPanel.appendChild(button);
  });
  var rect=filterButton.getBoundingClientRect();
  filterPanel.style.left=Math.max(8,Math.min(innerWidth-232,rect.right-224))+'px';
  filterPanel.style.top=(rect.bottom+6)+'px';filterPanel.style.display='block';
  filterButton.setAttribute('aria-expanded','true');
},hide:function(){filterPanel.style.display='none';filterButton.setAttribute('aria-expanded','false')}};
filterButton.addEventListener('click',function(){M.toggle(filterMenu)});
document.addEventListener('pointerdown',function(e){
  if(M.cur===filterMenu&&!filterPanel.contains(e.target)&&!filterButton.contains(e.target))M.close();
},true);
updateFilter();

/* One preview job at a time; yield to the event loop between jobs. */
function pump(){
  if(active||pumpTimer!==null||!queue.length||A.state.mode!=='search'||document.hidden)return;
  pumpTimer=setTimeout(function(){
    pumpTimer=null;
    if(active||!queue.length||A.state.mode!=='search'||document.hidden)return;
    var job=queue.shift();active=true;
    Promise.resolve().then(job).then(fin,fin);
  },0);
}
function fin(){active=false;pump()}
function enqueue(job){queue.push(job);pump()}
function cancelJobs(){
  generation++;queue=[];
  if(pumpTimer!==null){clearTimeout(pumpTimer);pumpTimer=null}
}
function valid(gen){return gen===generation&&A.state.mode==='search'&&!document.hidden}
/* texture keys the model of a block needs; every key is a face of FKShapes faceMap */
function need(shape,id){
  if(id==='dried_ghast')return ['up','down','north','south','east','west','tent'];
  if(shape==='plant'){
    if(id==='bamboo')return ['north','up','south','east'];
    if(id==='cave_vines')return ['up','down'];
    if(id==='amethyst_cluster')return ['up','g1','g2','g3'];
    return ['up'];
  }
  if(shape==='azalea')return ['plant','north','up'];
  if(shape==='beacon')return ['down','up','east'];
  if(shape==='door')return ['down','north'];
  return ['up','down','north','south','east','west'];
}

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

/* offscreen WebGL renderer */
function init3(){
  var T3=window.THREE;if(!T3)return null;
  try{
    var cv=document.createElement('canvas');
    var r=new T3.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});
    r.setPixelRatio(1);r.setSize(S256,S256,false);r.setClearColor(0x000000,0);
    var sc=new T3.Scene(),cam=new T3.OrthographicCamera(-.95,.95,.95,-.95,.1,50);
    cam.position.set(0,0,3.9);cam.lookAt(0,0,0);
    sc.add(new T3.AmbientLight(0xffffff,.75));
    var dl=new T3.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);sc.add(dl);
    var g=new T3.Group();g.rotation.set(.6155,-.7854,0);sc.add(g);
    cv.addEventListener('webglcontextlost',function(e){e.preventDefault();mode3d=false});
    return {T:T3,r:r,sc:sc,cam:cam,g:g,cv:cv,hidden:new T3.MeshBasicMaterial({visible:false})};
  }catch(e){return null}
}
function semi(c){
  var a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(var i=3;i<a.length;i+=4){var v=a[i];if(v>8&&v<248)return true}
  return false;
}
/* One fixed camera per size class (FKShapes.view): no bounding-box fitting, no rescaling of the model. */
function snap3d(o,SH,shape,im,dbl,id){
  var T3=o.T,g=o.g,mats={},own=[],tex=[],fm={};
  function matOf(key,canvas){
    if(mats[key])return mats[key];
    var c=canvas||im[key];if(!c)return null;
    var t=new T3.CanvasTexture(c);t.magFilter=t.minFilter=T3.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
    var m=new T3.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?T3.DoubleSide:T3.FrontSide,map:t});
    m.depthWrite=!semi(c);tex.push(t);own.push(m);mats[key]=m;return m;
  }
  ['up','down','north','south','east','west','plant','g1','g2','g3','tent'].forEach(function(k){fm[k]=k;if(!matOf(k))mats[k]=o.hidden});
  if(shape==='door'){
    var L=im.down,U=im.north;
    if(!L||!U)throw new Error('door');
    var R2=Math.max(L.width,U.width),dc=document.createElement('canvas');
    dc.width=R2;dc.height=R2*2;var dg=dc.getContext('2d');dg.imageSmoothingEnabled=false;
    dg.drawImage(U,0,0,U.width,U.height,0,0,R2,R2);dg.drawImage(L,0,0,L.width,L.height,0,R2,R2,R2);
    matOf('__door',dc);
  }
  var fl=!!(FKShapes.flat&&FKShapes.flat(id));
  g.rotation.set(fl?0:.6155,fl?0:-.7854,0);
  o.cam.zoom=1/FKShapes.view(id);o.cam.updateProjectionMatrix();
  FKShapes.build({shape:shape,cur:id,slot:'up',iso:true,faceMap:fm,mats:mats,group:g,hiddenMat:o.hidden,SHAPES:SH,refreshDoor:function(){}});
  var url=null;
  try{
    o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png');
  }finally{
    var gs=[];g.traverse(function(x){if(x.geometry&&gs.indexOf(x.geometry)<0)gs.push(x.geometry)});
    gs.forEach(function(x){x.dispose()});
    while(g.children.length)g.remove(g.children[0]);
    own.forEach(function(x){x.dispose()});
    tex.forEach(function(t){t.dispose()});
  }
  return url;
}
var TINT=/^(?:[a-z_]+_)?leaves2?$|^(?:waterlily|vine|fern|large_fern|short_grass|tallgrass|tall_grass|double_plant|bush|leaf_litter|seagrass)$/;
function makePreview(ctx,id,isCurrent){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  if(cat.cr&&cat.cr[id]&&TINT.test(id)){var cp=cat.cr[id];fm={up:cp,down:cp,north:cp,south:cp,east:cp,west:cp}}
  var shape=ctx.shapeFor(id),keys=need(shape,id);
  return Promise.all(keys.map(function(k){return fm[k]?getImg(ctx,fm[k]):null})).then(function(arr){
    if(!isCurrent())return null;
    var R=0;arr.forEach(function(im){if(im&&im.width>R)R=im.width});
    if(!R)return null;
    var norm={};
    keys.forEach(function(k,i){
      var im=arr[i];if(!im)return;
      var c=document.createElement('canvas');c.width=c.height=R;
      var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,R,R);
      norm[k]=c;
    });
    if(mode3d===null){st3=init3();mode3d=!!st3}
    if(mode3d&&st3){
      try{
        var dbl=/leaves/.test(id)||shape==='plant'||shape==='azalea'||shape==='candle';
        var u3=snap3d(st3,ctx.shapes,shape,norm,dbl,id);
        if(u3&&u3.length>200)return u3;
      }catch(e){fail3++;if(fail3>=3)mode3d=false}
    }
    return null;
  });
}

/* active pack: put its textures into the editor state */
function applyPack(){
  var c=A.grid(),m=packMap();
  if(lastPack&&samePack(m,lastPack))return false;
  cancelJobs();lastPack=m;c.setPack(m);pv={};
  return true;
}
function discardEdits(){
  cancelJobs();
  var c=A.grid();c.discard();
  var m=packMap();lastPack=m;c.setPack(m);pv={};
}

/* cards */
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&A.state.mode==='search'&&!document.hidden){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
var mobs=new IntersectionObserver(function(es){if(A.state.mode==='search'&&!document.hidden&&es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
function paint(card){
  var c=A.grid();if(!c.catalog||A.state.mode!=='search'||document.hidden)return;
  var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=A.edits||0,e=pv[id],gen=generation;
  if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
  if(card.fkPending===gen)return;
  card.fkPending=gen;
  function current(){return valid(gen)&&card.isConnected&&A.grid().catalog===c.catalog}
  enqueue(function(){
    if(!current())return;
    return makePreview(c,id,current).then(function(u){
      if(card.fkPending===gen)card.fkPending=null;
      if(!current())return;
      if(u)pv[id]={u:u,ed:ed,e:edits};
      setImg(card,u);
    },function(){if(card.fkPending===gen)card.fkPending=null});
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
  obs.disconnect();box.innerHTML='';ids=[];
  var m=document.createElement('div');m.id='fkEmpty';m.textContent=text;box.appendChild(m);
}
function statusNote(s){
  if(s.status==='failed')return s.error&&s.error.code==='catalog_no_blocks'?T('cat.no_blocks'):T('cat.failed',{detail:s.error?s.error.detail:''});
  if(s.status==='empty')return T('cat.empty');
  return T('cat.loading');
}
function sig(c){return Object.keys(c.dirty||{}).length+'|'+(A.edits||0)}
function render(){
  cancelJobs();obs.disconnect();
  var c=A.grid();mobs.unobserve(more);shown=0;
  if(!c.catalog){note(statusNote(A.state));return}
  if(migrated!==c.catalog){migrated=c.catalog;try{if(parent.FKAPP)parent.FKAPP.migrate(c)}catch(e){}}
  var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
  ids=c.catalog.ids.filter(function(id){return (!qv||id.indexOf(qv)>=0)&&(category==='all'||categoryOf(c.catalog,id)===category)});
  lastCat=c.catalog;lastSig=sig(c);
  box.innerHTML='';
  if(!ids.length){if(category==='all'||category==='blocks')note(T('cat.none'));return}
  addPage();mobs.observe(more);
}
function refresh(){
  cancelJobs();obs.disconnect();
  var c=A.grid();
  Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){
    k.classList.toggle('fk-edited',!!c.edited(k.getAttribute('data-id')));
    obs.observe(k);
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
qi.addEventListener('input',function(){cancelJobs();clearTimeout(tmr);tmr=setTimeout(render,150)});
document.addEventListener('visibilitychange',function(){
  if(document.hidden)cancelJobs();
  else if(A.state.mode==='search'){
    var changed=applyPack();
    if(changed||A.grid().catalog!==lastCat)render();else refresh();
    mobs.unobserve(more);mobs.observe(more);
  }
});
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
    if(s.mode==='edit'){if(M.cur===filterMenu)M.close();cancelJobs();if(!clicked)savedY=0;clicked=false}
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
});
applyPack();
render();
})();
