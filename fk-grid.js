/* fk-grid.js: the Find screen of the editor: block search, card grid and static 3D snapshots.
   Works only through FKAPI (state, grid(), subscribe, setMode). Models come from FKShapes. */
(function(){
var FK=window.FK,A=window.FKAPI;
function T(k,p){return FK.t(k,p)}
function $(s){return document.querySelector(s)}
var PAGE=60,MAX=6,S256=256;
var box=$('#fkGrid'),more=$('#fkMore'),qi=$('#q'),catLoad=$('#catLoad');
var pv={},queue=[],active=0,imgCache={},lastPack=null,lastCat=null,lastSig='',prevMode='search',savedY=0,clicked=false;
var ids=[],shown=0,st3=null,mode3d=null,fail3=0,migrated=null,tmr=null;

/* job queue: a few snapshots at a time */
function pump(){while(active<MAX&&queue.length){var j=queue.shift();active++;Promise.resolve().then(j).then(fin,fin)}}
function fin(){active--;pump()}
function enqueue(j){queue.push(j);pump()}
function need(shape,id){
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
function snap3d(o,SH,shape,im,dbl,id){
  var T3=o.T,g=o.g,mats={},own=[],tex=[],fm={};
  function matOf(key,canvas){
    if(mats[key])return mats[key];
    var c=canvas||im[key];if(!c)return null;
    var t=new T3.CanvasTexture(c);t.magFilter=t.minFilter=T3.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
    var m=new T3.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?T3.DoubleSide:T3.FrontSide,map:t});
    m.depthWrite=!semi(c);tex.push(t);own.push(m);mats[key]=m;return m;
  }
  ['up','down','north','south','east','west','plant','g1','g2','g3'].forEach(function(k){fm[k]=k;if(!matOf(k))mats[k]=o.hidden});
  if(shape==='door'){
    var L=im.down,U=im.north;
    if(!L||!U)throw new Error('door');
    var R2=Math.max(L.width,U.width),dc=document.createElement('canvas');
    dc.width=R2;dc.height=R2*2;var dg=dc.getContext('2d');dg.imageSmoothingEnabled=false;
    dg.drawImage(U,0,0,U.width,U.height,0,0,R2,R2);dg.drawImage(L,0,0,L.width,L.height,0,R2,R2,R2);
    matOf('__door',dc);
  }
  FKShapes.build({shape:shape,cur:id,slot:'up',iso:true,faceMap:fm,mats:mats,group:g,hiddenMat:o.hidden,SHAPES:SH,refreshDoor:function(){}});
  var url=null;
  try{
    g.updateMatrixWorld(true);
    var bb=new T3.Box3().setFromObject(g),ce=bb.getCenter(new T3.Vector3()),kk=Math.min(1,1.78/Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y,.001));
    g.scale.setScalar(kk);g.position.set(-ce.x*kk,-ce.y*kk,0);
    o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png');
  }finally{
    g.scale.setScalar(1);g.position.set(0,0,0);
    while(g.children.length){var ch=g.children[0];if(ch.geometry)ch.geometry.dispose();g.remove(ch)}
    own.forEach(function(x){x.dispose()});
    tex.forEach(function(t){t.dispose()});
  }
  return url;
}
var TINT=/^(?:[a-z_]+_)?leaves2?$|^(?:waterlily|vine|fern|large_fern|short_grass|tallgrass|tall_grass|double_plant|bush|leaf_litter|seagrass)$/;
function makePreview(ctx,id){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  if(cat.cr&&cat.cr[id]&&TINT.test(id)){var cp=cat.cr[id];fm={up:cp,down:cp,north:cp,south:cp,east:cp,west:cp}}
  var shape=ctx.shapeFor(id),keys=need(shape,id);
  return Promise.all(keys.map(function(k){return fm[k]?getImg(ctx,fm[k]):null})).then(function(arr){
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
  lastPack=m;c.setPack(m);pv={};
  return true;
}
function discardEdits(){
  var c=A.grid();c.discard();
  var m=packMap();lastPack=m;c.setPack(m);pv={};
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
    return makePreview(c,id).then(function(u){if(u)pv[id]={u:u,ed:ed,e:edits};if(card.isConnected)setImg(card,u)},function(){});
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
});
applyPack();
render();
})();
