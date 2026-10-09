var NEWPATCHES=[["function drawFb(){\n  if(!fbOn||!slots.length)return;\n  var c=$('#fb'),g=c.getContext('2d');\n  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,300,300);g.imageSmoothingEnabled=false;\n  var isDoor=(shape==='door'||shape==='dooropen');\n  var s=isDoor?95:140,a=s*.866,b=s*.5,T0={x:150,y:isDoor?12+s:12},R=res,F=faceMap;\n  function im(k){return cv[F[k]]}\n", "function drawFb(){\n  if(!slots.length)return;\n  drawBlock($('#fb'),shape,function(k){return cv[faceMap[k]]},res,300);\n}\nfunction drawBlock(c,shape,im,R,Z){\n  var g=c.getContext('2d'),q=Z/300;\n  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,Z,Z);g.imageSmoothingEnabled=false;\n  var isDoor=(shape==='door'||shape==='dooropen');\n  var s=(isDoor?95:140)*q,a=s*.866,b=s*.5,T0={x:150*q,y:isDoor?12*q+s:12*q};\n"], ["return hit}};\n/* ---------- старт ---------- */", "return hit},grid:function(){return {catalog:catalog,files:files,dirty:dirty,load:loadAny,select:selectBlock,edited:isEdited,drawBlock:drawBlock,obj:function(){return {id:cur==='custom'?null:cur,paths:slots.map(function(s){return s.id}),file:slot?String(slot).split('/').pop():''}},setPack:function(map){Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k]}});Object.keys(map).forEach(function(k){var d=map[k],w=16;try{var b=atob(d.split(',')[1].slice(0,40));w=(b.charCodeAt(16)*16777216)+(b.charCodeAt(17)<<16)+(b.charCodeAt(18)<<8)+b.charCodeAt(19)}catch(e){}if(!(w>0&&w<=1024))w=16;files[k]={res:w,data:d};dirty[k]=true})},shapeFor:function(id){var m=catalog.mother[id],mo=modelOf(m),k=shapeKeysFor(m,catalog.members[catalog.sig[m]]),w=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));return k.indexOf(w)>=0?w:k[0]}}}};\n/* ---------- старт ---------- */"], ["function save(){\n  try{packCur();localStorage.setItem(SAVE_KEY,", "function save(){\n  return;\n  try{packCur();localStorage.setItem(SAVE_KEY,"], ["function load(){\n  var raw=null,o=null;", "function load(){\n  return false;\n  var raw=null,o=null;"]];
(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var S=128,PAGE=60,MAX=6;
var pv={},pickName='',curDoc=null,savedY=0,queue=[],active=0,imgCache={},lastPackSig=null;
var CSS='#list{display:none!important}'+
'#fkGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}'+
'.fkc{position:relative;display:flex;flex-direction:column;padding:0;min-height:0;overflow:hidden;background:var(--panel);border:1px solid var(--line);border-radius:10px;color:var(--ink);cursor:pointer;text-align:center}'+
'.fkp{width:100%;aspect-ratio:1/1;background:repeating-conic-gradient(#7e7e7e 0 25%,#8c8c8c 0 50%) 0 0/16px 16px}'+
'.fkp img{display:block;width:100%;height:100%;image-rendering:auto}'+
'.fkn{padding:5px 4px 6px;font-size:11px;line-height:1.25;height:2.9em;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
'.fkm{position:absolute;top:4px;right:6px;color:#e0b030;font-size:14px;line-height:1;text-shadow:0 0 3px #000}'+
'#fkEmpty{grid-column:1/-1;padding:16px 4px;text-align:center;color:var(--mute)}'+
'#fkMore{height:1px}';
function pump(){while(active<MAX&&queue.length){var j=queue.shift();active++;j().then(fin,fin)}}
function fin(){active--;pump()}
function enqueue(j){queue.push(j);pump()}
function need(shape){
  if(shape==='plant')return ['up'];
  if(shape==='azalea')return ['plant','north','up'];
  if(shape==='beacon')return ['down','up','east'];
  if(shape==='door')return ['down','north'];
  return ['up','south','east'];
}
function packData(){
  try{var d=JSON.parse(localStorage.getItem('fk070_packs'));return (d&&d.packs&&d.packs.filter(function(x){return x.id===d.active})[0])||null}catch(e){return null}
}
function packMap(){var p=packData(),m={};if(p)p.textures.forEach(function(t){if(t.data)m['textures/'+t.path]=t.data});return m}
function packSig(m){return Object.keys(m).sort().map(function(k){return k+':'+m[k].length}).join('|')}
function getImg(d,ctx,path){
  var f=ctx.files&&ctx.files[path];
  if(f&&f.data)return new Promise(function(ok){var im=new d.defaultView.Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=f.data});
  if(!imgCache[path])imgCache[path]=ctx.load(path).then(function(im){if(!im)delete imgCache[path];return im});
  return imgCache[path];
}
function makePreview(d,ctx,id){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  var shape=ctx.shapeFor(id),keys=need(shape);
  return Promise.all(keys.map(function(k){return fm[k]?getImg(d,ctx,fm[k]):null})).then(function(arr){
    var R=0;arr.forEach(function(im){if(im&&im.width>R)R=im.width});
    if(!R)return null;
    var norm={};
    keys.forEach(function(k,i){
      var im=arr[i];if(!im)return;
      var c=d.createElement('canvas');c.width=c.height=R;
      var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,R,R);
      norm[k]=c;
    });
    var cv=d.createElement('canvas');cv.width=cv.height=S;
    ctx.drawBlock(cv,shape,function(k){return norm[k]},R,S);
    try{return cv.toDataURL('image/png')}catch(e){return null}
  });
}
function ctxNow(d){try{var a=d.defaultView.FKAPI;return (a&&a.grid)?a.grid():null}catch(e){return null}}
function applyPack(d){
  var c=ctxNow(d);if(!c||!c.setPack)return;
  var m=packMap(),sg=packSig(m);
  if(sg===lastPackSig)return;
  lastPackSig=sg;
  c.setPack(m);pv={};
  if(d.__fkRender)d.__fkRender();
}
function showFrame(d){try{d.defaultView.frameElement.style.visibility='visible'}catch(e){}}
function attach(d){
  if(d.__fkGrid){showFrame(d);return}
  var list=d.querySelector('#list'),qi=d.querySelector('#q');
  if(!list||!qi)return;
  d.__fkGrid=true;curDoc=d;
  try{localStorage.removeItem('foundrykin.project.v4');localStorage.removeItem('foundrykin.project.v3')}catch(e){}
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var box=d.createElement('div');box.id='fkGrid';
  var more=d.createElement('div');more.id='fkMore';
  list.parentNode.insertBefore(box,list.nextSibling);
  box.parentNode.insertBefore(more,box.nextSibling);
  var w=d.defaultView,ids=[],shown=0,lastCat=null,lastSig='',migrated=null;
  var obs=new w.IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
  var mobs=new w.IntersectionObserver(function(es){if(es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
  function paint(card){
    var c=ctxNow(d);if(!c||!c.catalog)return;
    var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=d.defaultView.FKAPI.edits||0,e=pv[id];
    if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
    enqueue(function(){
      if(!card.isConnected)return Promise.resolve();
      return makePreview(d,c,id).then(function(u){if(u)pv[id]={u:u,ed:ed,e:edits};if(card.isConnected)setImg(card,u)},function(){});
    });
  }
  function setImg(card,u){var im=card.querySelector('img');if(im&&u)im.src=u}
  function mkCard(c,id){
    var b=d.createElement('button');b.type='button';b.className='fkc';b.setAttribute('data-id',id);
    var p=d.createElement('div');p.className='fkp';p.appendChild(d.createElement('img'));
    var n=d.createElement('div');n.className='fkn';n.textContent=id.replace(/_/g,' ');
    b.appendChild(p);b.appendChild(n);
    if(c.edited(id)){var m=d.createElement('span');m.className='fkm';m.textContent='\u25cf';b.appendChild(m)}
    return b;
  }
  function addPage(){
    var c=ctxNow(d);if(!c||!c.catalog)return;
    var end=Math.min(shown+PAGE,ids.length);
    for(var i=shown;i<end;i++){var k=mkCard(c,ids[i]);box.appendChild(k);obs.observe(k)}
    shown=end;
  }
  function render(){
    var c=ctxNow(d);
    box.innerHTML='';mobs.unobserve(more);shown=0;
    if(!c||!c.catalog){var m0=d.createElement('div');m0.id='fkEmpty';m0.textContent='Каталог блоков загружается\u2026';box.appendChild(m0);ids=[];return}
    if(migrated!==c.catalog){migrated=c.catalog;try{if(window.FKAPP)window.FKAPP.migrate(c)}catch(e){}}
    var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
    ids=c.catalog.ids.filter(function(id){return !qv||id.indexOf(qv)>=0});
    lastCat=c.catalog;lastSig=sig(c);
    if(!ids.length){var m1=d.createElement('div');m1.id='fkEmpty';m1.textContent='Ничего не найдено';box.appendChild(m1);return}
    addPage();mobs.observe(more);
  }
  d.__fkRender=render;
  function sig(c){return Object.keys(c.dirty||{}).length+'|'+(d.defaultView.FKAPI.edits||0)}
  function refresh(c){
    Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){
      var id=k.getAttribute('data-id'),ed=!!c.edited(id),m=k.querySelector('.fkm');
      if(ed&&!m){m=d.createElement('span');m.className='fkm';m.textContent='\u25cf';k.appendChild(m)}
      if(!ed&&m)k.removeChild(m);
      paint(k);
    });
  }
  var tmr=null;
  qi.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,150)});
  box.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.fkc'):null;if(!b)return;
    var c=ctxNow(d);if(!c)return;
    pickName=b.getAttribute('data-id');
    c.select(pickName);
    if(typeof FKE!=='undefined')FKE.setMode('edit');
  });
  var poll=setInterval(function(){
    try{
      if(curDoc!==d||!d.defaultView){clearInterval(poll);return}
      if(typeof FKE!=='undefined'&&FKE.getMode()!=='search')return;
      var c=ctxNow(d);if(!c)return;
      if(c.catalog!==lastCat){render();return}
      if(sig(c)!==lastSig){lastSig=sig(c);refresh(c)}
    }catch(e){clearInterval(poll)}
  },700);
  applyPack(d);
  render();
  showFrame(d);
}
function watch(f){
  var n=0;
  (function p(){
    var d=null;try{d=f.contentDocument}catch(e){}
    if(d&&d.__fkTidy&&ctxNow(d)){attach(d);return}
    if(++n<240)setTimeout(p,500);
  })();
}
if(typeof PATCHES!=='undefined'){
  NEWPATCHES.forEach(function(p){PATCHES.push(p)});
}
if(typeof FKE!=='undefined'){
  var oo=FKE.open;
  FKE.open=function(f,u,cb){
    f.style.visibility='hidden';cb=cb||{};var oe=cb.onError;
    cb.onError=function(x){f.style.visibility='visible';if(oe)oe(x)};
    var r=oo.call(FKE,f,u,cb);
    watch(f);
    try{var d0=f.contentDocument;if(d0&&d0.__fkGrid)applyPack(d0)}catch(e){}
    setTimeout(function(){if(f.style.visibility==='hidden')f.style.visibility='visible'},4000);
    return r;
  };
  var oc=FKE.current;FKE.current=function(){if(pickName){if(FKE.busy())return pickName;pickName=''}return oc.call(FKE)};
  FKE.objInfo=function(){var d=curDoc;if(!d)return null;var c=ctxNow(d);return (c&&c.obj)?c.obj():null};
  var oe2=FKE.editTexture;
  FKE.editTexture=function(path,data,cb){
    cb=cb||{};
    var p=packData(),e=p&&p.textures.filter(function(t){return t.path===path})[0],obj=e&&e.obj;
    if(!obj)return oe2.call(FKE,path,data,cb);
    var n=0;
    (function wait(){
      var d=curDoc,c=d&&ctxNow(d);
      if(c&&c.catalog){
        if(!c.catalog.b[obj]){oe2.call(FKE,path,data,cb);return}
        applyPack(d);
        try{d.defaultView.FKAPI.want='textures/'+path}catch(er){}
        pickName=obj;c.select(obj);FKE.setMode('edit');return;
      }
      if(++n<80)setTimeout(wait,300);
      else if(cb.onFail)cb.onFail('Каталог блоков не загрузился');
    })();
  };
  var os=FKE.setMode;
  FKE.setMode=function(m){
    var d=curDoc,prev=FKE.getMode();
    if(d&&m==='edit'&&prev==='search'){try{savedY=d.defaultView.scrollY}catch(e){}}
    os.call(FKE,m);
    if(d&&m==='search'&&prev==='edit'&&savedY){setTimeout(function(){try{d.defaultView.scrollTo(0,savedY)}catch(e){}},30)}
  };
}
window.FKG={version:VERSION};
})();
