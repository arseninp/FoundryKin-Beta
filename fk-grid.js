(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var S=128,K=S/96,PAGE=60,MAX=6;
var pv={},pickName='',curDoc=null,savedY=0,queue=[],active=0,imgCache={};
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
function poly(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.closePath()}
function face(c,img,m,pts,shade){
  c.save();c.scale(K,K);poly(c,pts);
  if(!img){c.fillStyle='#777';c.fill();c.restore();return}
  c.clip();
  var n=img.width||16;
  c.setTransform(m[0]*K/n,m[1]*K/n,m[2]*K/n,m[3]*K/n,m[4]*K,m[5]*K);
  c.drawImage(img,0,0,n,n,0,0,n,n);
  c.restore();
  if(shade){c.save();c.scale(K,K);poly(c,pts);c.fillStyle='rgba(0,0,0,'+shade+')';c.fill();c.restore()}
}
function flat(c,img,x,y,w,h){
  if(!img){c.fillStyle='#777';c.fillRect(x,y,w,h);return}
  var n=img.width||16;c.drawImage(img,0,0,n,n,x,y,w,h);
}
function draw(c,kind,im){
  c.imageSmoothingEnabled=false;
  if(kind==='cube'){
    var T=[[48,10],[88,30],[48,50],[8,30]],L=[[8,30],[48,50],[48,90],[8,70]],R=[[48,50],[88,30],[88,70],[48,90]];
    face(c,im.top,[40,20,-40,20,48,10],T,0);
    face(c,im.left,[40,20,0,40,8,30],L,.22);
    face(c,im.right,[40,-20,0,40,48,50],R,.38);
    c.save();c.scale(K,K);poly(c,[[48,10],[88,30],[88,70],[48,90],[8,70],[8,30]]);c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=1;c.stroke();c.restore();
  }else if(kind==='door'){
    c.save();c.scale(K,K);c.imageSmoothingEnabled=false;
    flat(c,im.up,27,4,42,42);flat(c,im.low,27,46,42,42);
    c.restore();
  }else{
    c.save();c.scale(K,K);c.imageSmoothingEnabled=false;
    flat(c,im.flat,16,16,64,64);
    c.restore();
  }
}
function kindOf(cat,id){
  if(cat.sp&&cat.sp[id]&&cat.sp[id].kind==='door')return 'door';
  if(cat.p&&cat.p[id])return 'flat';
  return 'cube';
}
function getImg(d,ctx,path){
  var f=ctx.files&&ctx.files[path];
  if(f&&f.data)return new Promise(function(ok){var im=new d.defaultView.Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=f.data});
  if(!imgCache[path])imgCache[path]=ctx.load(path).then(function(im){if(!im)delete imgCache[path];return im});
  return imgCache[path];
}
function makePreview(d,ctx,id){
  var cat=ctx.catalog,b=cat.b[id],kind=kindOf(cat,id),want;
  if(kind==='cube')want={top:b[0],left:b[3],right:b[4]};
  else if(kind==='door')want={up:b[2],low:b[0]};
  else want={flat:b[3]};
  var keys=Object.keys(want);
  return Promise.all(keys.map(function(k){return getImg(d,ctx,want[k])})).then(function(arr){
    var im={};keys.forEach(function(k,i){im[k]=arr[i]});
    var cv=d.createElement('canvas');cv.width=cv.height=S;
    draw(cv.getContext('2d'),kind,im);
    try{return cv.toDataURL('image/png')}catch(e){return null}
  });
}
function ctxNow(d){try{var a=d.defaultView.FKAPI;return (a&&a.grid)?a.grid():null}catch(e){return null}}
function attach(d){
  if(d.__fkGrid)return;
  var list=d.querySelector('#list'),qi=d.querySelector('#q');
  if(!list||!qi)return;
  d.__fkGrid=true;curDoc=d;
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var box=d.createElement('div');box.id='fkGrid';
  var more=d.createElement('div');more.id='fkMore';
  list.parentNode.insertBefore(box,list.nextSibling);
  box.parentNode.insertBefore(more,box.nextSibling);
  var w=d.defaultView,ids=[],shown=0,lastCat=null,lastSig='';
  var obs=new w.IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
  var mobs=new w.IntersectionObserver(function(es){if(es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
  function paint(card){
    var c=ctxNow(d);if(!c||!c.catalog)return;
    var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=d.defaultView.FKAPI.edits||0,e=pv[id];
    if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
    enqueue(function(){
      if(!card.isConnected)return Promise.resolve();
      return makePreview(d,c,id).then(function(u){pv[id]={u:u,ed:ed,e:edits};if(card.isConnected)setImg(card,u)},function(){});
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
    var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
    ids=c.catalog.ids.filter(function(id){return !qv||id.indexOf(qv)>=0});
    lastCat=c.catalog;lastSig=sig(c);
    if(!ids.length){var m1=d.createElement('div');m1.id='fkEmpty';m1.textContent='Ничего не найдено';box.appendChild(m1);return}
    addPage();mobs.observe(more);
  }
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
  render();
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
  PATCHES.push(["return hit}};\n/* ---------- \u0441\u0442\u0430\u0440\u0442 ---------- */","return hit},grid:function(){return {catalog:catalog,files:files,dirty:dirty,load:loadAny,select:selectBlock,edited:isEdited}}};\n/* ---------- \u0441\u0442\u0430\u0440\u0442 ---------- */"]);
}
if(typeof FKE!=='undefined'){
  var oo=FKE.open;FKE.open=function(f,u,cb){var r=oo.call(FKE,f,u,cb);watch(f);return r};
  var oc=FKE.current;FKE.current=function(){if(pickName){if(FKE.busy())return pickName;pickName=''}return oc.call(FKE)};
  var os=FKE.setMode;
  FKE.setMode=function(m){
    var d=curDoc,prev=FKE.getMode();
    if(d&&m==='edit'&&prev==='search'){try{savedY=d.defaultView.scrollY}catch(e){}}
    os.call(FKE,m);
    if(d&&m==='search'&&prev==='edit'&&savedY){setTimeout(function(){try{d.defaultView.scrollTo(0,savedY)}catch(e){}},30)}
  };
}
window.FKG={version:VERSION,_draw:draw,_kind:kindOf};
})();
