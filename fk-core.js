
(function(){
var FK=window.FK;
function tt(k,p){return FK.t(k,p)}
var res=16, shape='cube';
var slots=[], slot=null, faceMap={}, cv={}, tex={}, mats={}, undoS={}, redoS={}, ph={}, applyGen=0, hiddenMat=null;
var files={}, cur='', dirty={}, catalog=null, existing=null, shapeKeys=['cube'];
var FACES=['up','down','north','south','east','west'];
var FN={up:'face.up',down:'face.down',north:'face.north',south:'face.south',east:'face.east',west:'face.west'};
var SHAPES={
  cube:{parts:[[1,1,1,0,0,0]],shift:0},
  slab:{parts:[[1,.5,1,0,-.25,0]],shift:.25},
  stairs:{parts:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],shift:0},
  wall:{parts:[[.5,1,.5,0,0,0],[1,.875,.25,0,-.0625,0]],shift:0},
  fence:{parts:[[.25,1,.25,0,0,0],[1,.1875,.125,0,-.03125,0],[1,.1875,.125,0,.34375,0]],shift:0},
  gate:{parts:[[.125,.6875,.125,-.4375,.15625,0],[.125,.6875,.125,.4375,.15625,0],[.75,.1875,.125,0,-.03125,0],[.75,.1875,.125,0,.34375,0]],shift:0},
  button:{parts:[[.375,.125,.25,0,-.4375,0]],shift:.4},
  plate:{parts:[[.875,.0625,.875,0,-.46875,0]],shift:.45},
  trapdoor:{parts:[[1,.1875,1,0,-.40625,0]],shift:.4},
  door:{},
  plant:{},
  azalea:{},
  beacon:{},
  candle:{parts:[[.125,.375,.125,0,-.3125,0]],shift:0},
  carpet:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  rail:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  decal:{parts:[[1,1,.0625,0,0,-.46875]],shift:0}
};
var ALL_SHAPES=['cube','slab','stairs','wall','fence','gate','button','plate'];
var $=function(s){return document.querySelector(s)};
try{var PD=parent.document.documentElement;var syncTheme=function(){document.documentElement.setAttribute('data-theme',PD.getAttribute('data-theme')||'light')};syncTheme();new MutationObserver(syncTheme).observe(PD,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
var ed=$('#ed'), ectx=ed.getContext('2d');
var listeners=[];
var S={mode:'search',status:'loading',source:'',count:0,filtered:true,refreshing:false,refreshFailed:'',error:null,errors:[],info:null,message:null};
var ctx={onHistory:null,onRes:null};
function emit(){listeners.forEach(function(f){try{f(S)}catch(e){}})}
function showErr(code,detail){
  var last=S.errors[S.errors.length-1];detail=detail||'';
  if(last&&last.code===code&&last.detail===detail)return;
  S.errors.push({code:code,detail:detail});if(S.errors.length>3)S.errors.shift();emit();
}
window.addEventListener('error',function(e){showErr('script',(e.message||'')+(e.lineno?' @'+e.lineno:''))});
window.addEventListener('unhandledrejection',function(e){showErr('promise',(e.reason&&e.reason.message)||String(e.reason))});
function say(key,p){S.message=key?{key:key,params:p||{}}:null;$('#msg').textContent=key?tt(key,p):'';emit()}
function rnd(x,y,s){var h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)}
function placeholder(g,r){
  for(var y=0;y<r;y++)for(var x=0;x<r;x++){var v=118+Math.round(rnd(Math.floor(x*16/r),Math.floor(y*16/r),5)*50);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,y,1,1)}
}
function ctxOf(k){return cv[k].getContext('2d')}
function shapeOfId(id){
  if(/_trapdoor$/.test(id))return 'trapdoor';
  return 'cube';
}
function isDoorBlock(m){return !!(catalog&&catalog.sp&&catalog.sp[m]&&catalog.sp[m].kind==='door')}
function modelOf(m){
  if(m==='beacon')return 'beacon';
  if(m==='azalea'||m==='flowering_azalea')return 'azalea';
  return (catalog&&catalog.p&&catalog.p[m])?'plant':null;
}
function shapeKeysFor(m,grp){
  if(isDoorBlock(m))return ['door'];
  if(/(^|_)candle$/.test(m))return ['candle'];if(/(^|_)carpet$/.test(m)||m==='waterlily'||m==='leaf_litter'||m==='frog_spawn')return ['carpet'];if(/(^|_)rail$/.test(m))return ['rail'];if(m==='vine'||m==='glow_lichen'||m==='sculk_vein'||m==='resin_clump')return ['decal'];var mo=modelOf(m);if(mo)return (mo==='beacon'||mo==='azalea')?[mo]:[mo,'cube'];
  if(/_trapdoor$/.test(m))return ['trapdoor'];
  var ks=['cube'],f=catalog.forms&&catalog.forms[m];
  if(f)Object.keys(f).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});
  return ks;
}
var stage=$('#stage'),W=stage.clientWidth||360;
var gl=(typeof THREE!=='undefined'),renderer=null,scene=null,cam=null,group=null,frames=0;
if(!gl)showErr('three_missing');
if(gl){
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,W);stage.insertBefore(renderer.domElement,stage.firstChild);
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(35,1,.1,50);cam.position.set(0,0,3.9);cam.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffffff,.75));var dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);scene.add(dl);
    hiddenMat=new THREE.MeshBasicMaterial({visible:false});
    group=new THREE.Group();group.rotation.set(.45,-.7,0);scene.add(group);
  }catch(err){gl=false;renderer=null;showErr('webgl_unavailable',err.message)}
}
function texBuf(id){
  var n=res,d=ctxOf(id).getImageData(0,0,n,n).data,buf=new Uint8Array(n*n*4),semi=false;
  for(var y=0;y<n;y++){var s=y*n*4,t=(n-1-y)*n*4;for(var x=0;x<n*4;x++){var v=d[s+x];buf[t+x]=v;if((x&3)===3&&v>8&&v<248)semi=true}}
  return {buf:buf,semi:semi};
}
function makeTex(id){
  if(!gl)return null;
  var r=texBuf(id),n=res;
  var tx=new THREE.DataTexture(r.buf,n,n,THREE.RGBAFormat);
  tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.needsUpdate=true;tx.userData={semi:r.semi};return tx;
}
function refreshDoor(){
  if(!gl||!mats.__door)return;
  if(shape!=='door')return;
  var L=faceMap.down,U=faceMap.north;
  if(!cv[L]||!cv[U])return;
  var n=res,a=texBuf(L),b=texBuf(U),buf=new Uint8Array(n*n*8);
  buf.set(a.buf,0);buf.set(b.buf,n*n*4);
  if(tex.__door)tex.__door.dispose();
  var tx=new THREE.DataTexture(buf,n,2*n,THREE.RGBAFormat);
  tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.needsUpdate=true;
  tex.__door=tx;mats.__door.map=tx;mats.__door.depthWrite=!(a.semi||b.semi);mats.__door.needsUpdate=true;
}
function refreshTex(id){
  if(!gl||!cv[id]||!mats[id])return;
  if(tex[id])tex[id].dispose();
  tex[id]=makeTex(id);mats[id].map=tex[id];mats[id].depthWrite=!tex[id].userData.semi;mats[id].needsUpdate=true;
  refreshDoor();
}
function rebuildTextures(){slots.forEach(function(s){refreshTex(s.id)});refreshDoor()}
function box(w,h,d,x,y,z,ids,ys,vs){
  var g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  ys=ys||0;vs=vs||1;
  for(var i=0;i<p.count;i++){
    var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
    if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
    else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
    else if(vs!==1){var th=(Z-z+d/2)/d;u=X+.5;v=ny>0?1-.09375*th:.09375*th}
    else{u=X+.5;v=ny>0?.5-Z:Z+.5}
    uv.setXY(i,u,v);
  }
  var f=faceMap;
  ids=ids||[f.east,f.west,f.up,f.down,f.south,f.north];
  var m=new THREE.Mesh(g,ids.map(function(k){return k===null?hiddenMat:mats[k]}));
  m.position.set(x,y,z);return m;
}
function plane(id,h,y,ry){
  var m=new THREE.Mesh(new THREE.PlaneGeometry(Math.SQRT2,h),mats[id]);
  m.position.y=y;m.rotation.y=ry;return m;
}
function buildPlant(){
  var st=shape==='azalea'?faceMap.plant:faceMap.up;
  group.add(plane(st,1,0,Math.PI/4));group.add(plane(st,1,0,-Math.PI/4));
  if(shape==='azalea'){var t=faceMap.up,s=faceMap.north;group.add(box(1,1,1,0,0,0,[s,s,t,null,s,s]))}
}
function buildBeacon(){
  var f=faceMap,g=f.east,b=f.down,c=f.up;
  group.add(box(.75,.1875,.75,0,-.40625,0,[b,b,b,b,b,b]));
  group.add(box(.625,.625,.625,0,0,0,[c,c,c,c,c,c]));
  group.add(box(1,1,1,0,0,0,[g,g,g,g,g,g]));
}
function buildDoor(){
  var D='__door',d6=[D,D,D,D,D,D];
  refreshDoor();
  group.add(box(1,2,.1875,0,0,-.40625,d6,-.5,.5));
}
function build(){
  if(gl){
    while(group.children.length)group.remove(group.children[0]);
    if(!slots.length)return;
    if(shape==='plant'||shape==='azalea')buildPlant();
    else if(shape==='beacon')buildBeacon();
    else if(shape==='door')buildDoor();
    else{
      var d=SHAPES[shape]||SHAPES.cube;
      d.parts.forEach(function(a){var bm=box.apply(null,shape==='rail'?a.concat([[faceMap.east,faceMap.west,(slot===faceMap.up?faceMap.up:faceMap.down),(slot===faceMap.up?faceMap.up:faceMap.down),faceMap.south,faceMap.north]]):a);if(shape==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}group.add(bm)});if(shape==='candle'){var wid=faceMap.east,wm=mats[wid];if(wm){wm.side=THREE.DoubleSide;wm.needsUpdate=true;[.7853981633974483,-.7853981633974483].forEach(function(ry){var pg=new THREE.PlaneGeometry(.125,.125),pu=pg.attributes.uv;for(var j=0;j<pu.count;j++){pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125)}var pm=new THREE.Mesh(pg,wm);pm.position.y=-.0625;pm.rotation.y=ry;group.add(pm)})}}
      if(d.shift)group.children.forEach(function(m){m.position.y+=d.shift});
    }
  }
}
var drag=null,idle=true,lastT=0;
stage.addEventListener('pointerdown',function(e){if(!gl)return;drag={x:e.clientX,y:e.clientY};idle=false;stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',function(e){if(!drag)return;group.rotation.y+=(e.clientX-drag.x)*.01;group.rotation.x=Math.max(-1.4,Math.min(1.4,group.rotation.x+(e.clientY-drag.y)*.01));drag={x:e.clientX,y:e.clientY}});
function endDrag(){drag=null;setTimeout(function(){if(!drag)idle=true},2500)}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(t){
  requestAnimationFrame(loop);
  if(!gl)return;
  if(!isFinite(group.rotation.x)||!isFinite(group.rotation.y))group.rotation.set(.45,-.7,0);
  if(idle&&!reduce&&isFinite(t))group.rotation.y+=Math.min(100,(t-lastT))*.0004;
  if(isFinite(t))lastT=t;
  try{renderer.render(scene,cam);frames++}catch(err){showErr('render',err.message)}
}
addEventListener('resize',function(){if(!gl)return;var w=stage.clientWidth;if(w)renderer.setSize(w,w)});
function slotsOf(p){
  var order=[],map={};
  FACES.forEach(function(f,i){var path=p[i];if(!map[path]){map[path]=[];order.push(path)}map[path].push(f)});
  var list=order.map(function(path){
    var fs=map[path],sides=['north','south','east','west'].filter(function(x){return fs.indexOf(x)>=0}),names=[];
    var hasUp=fs.indexOf('up')>=0,hasDown=fs.indexOf('down')>=0;
    if(hasUp&&hasDown&&sides.length===4)return {id:path,k:['slot.all']};
    if(hasUp)names.push('slot.top');
    if(hasDown)names.push('slot.bottom');
    if(sides.length===4)names.push('slot.side');else sides.forEach(function(s){names.push(FN[s])});
    return {id:path,k:names};
  });
  var fm={};FACES.forEach(function(f,i){fm[f]=p[i]});
  return {list:list,fm:fm};
}
function slotsFor(m){
  if(catalog.sp&&catalog.sp[m])return {list:catalog.sp[m].list,fm:catalog.sp[m].fm};
  var so=slotsOf(catalog.b[m]),cp=catalog.cr&&catalog.cr[m];
  if(cp&&!so.list.some(function(s){return s.id===cp}))so.list.push({id:cp,k:['slot.carried'],carried:true});
  return so;
}
function pathsFor(m){
  if(catalog.sp&&catalog.sp[m])return catalog.sp[m].list.map(function(s){return s.id});
  var o=[];catalog.b[m].forEach(function(x){if(o.indexOf(x)<0)o.push(x)});var q=catalog.cr&&catalog.cr[m];if(q&&o.indexOf(q)<0)o.push(q);return o;
}
function setupSlots(list,fm){
  applyGen++;
  Object.keys(tex).forEach(function(k){if(tex[k])tex[k].dispose()});
  Object.keys(mats).forEach(function(k){if(mats[k])mats[k].dispose()});
  tex={};mats={};cv={};undoS={};redoS={};ph={};
  slots=list;faceMap=fm;
  var dbl=/leaves/.test(cur)||modelOf(cur)==='plant'||modelOf(cur)==='azalea';
  list.forEach(function(s){
    cv[s.id]=document.createElement('canvas');cv[s.id].width=cv[s.id].height=res;
    undoS[s.id]=[];redoS[s.id]=[];
    if(gl)mats[s.id]=new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?THREE.DoubleSide:THREE.FrontSide});
  });
  if(gl)mats.__door=new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:THREE.FrontSide});
  slot=list[0].id;
  buildSlotUi();
}
function uiIcon(b,label,k){
 b.type='button';b.title=label;b.setAttribute('aria-label',label);
 var s='',p=SHAPES[k]&&SHAPES[k].parts;
 if(p){
  function v(x,y,z){return (12+(x-z)*9)+','+(12-y*12+(x+z)*4)}
  p.forEach(function(a){var l=a[3]-a[0]/2,r=l+a[0],t=a[4]+a[1]/2,d=t-a[1],f=a[5]+a[2]/2,h=f-a[2];s+='<path d="M'+v(l,t,f)+' '+v(r,t,f)+' '+v(r,t,h)+' '+v(l,t,h)+'Z M'+v(l,t,f)+' '+v(l,d,f)+' '+v(r,d,f)+' '+v(r,d,h)+' '+v(r,t,h)+' M'+v(r,t,f)+' '+v(r,d,f)+'"/>'});
 }else s=k==='door'?'<rect x="6" y="2" width="12" height="20"/><path d="M15 12h1"/>':k==='beacon'?'<rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10"/>':'<path d="M12 22V4m0 9L4 5m8 12 8-8"/>';
 b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">'+s+'</svg>';
}
function slotLabels(list){
 var names=list.map(function(s){return String(s.id).split('/').pop().replace(/\.(png|tga)$/i,'').split('_')}),pre=0;
 while(names.length>1&&names.every(function(a){return pre<a.length&&a[pre]===names[0][pre]}))pre++;
 return list.map(function(s,i){
  var parts=names[i].slice(pre),label=(parts.length?parts:names[i]).join(' '),keys=s.k||[];
  if(keys.length>1)label=keys.map(function(k){return k.split('.').pop()}).join(' + ');
  return label;
 });
}
function buildSlotUi(){
  var boxEl=$('#slots'),labels=slotLabels(slots);boxEl.innerHTML='';
  slots.forEach(function(s,i){
    var b=document.createElement('button');b.type='button';b.textContent=labels[i];b.title=s.id;b.dataset.id=s.id;
    if(s.id===slot)b.className='on';
    b.onclick=function(){setSlot(s.id)};boxEl.appendChild(b);
  });
  boxEl.style.display=slots.length>1?'flex':'none';
}
function setSlot(id){
  if(!cv[id])return;slot=id;
  $('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});
  drawEd();
  if(shape==='rail')build();
  if(slots.some(function(s){return s.carried})){var so=slotsFor(cur),isC=slots.some(function(s){return s.carried&&s.id===id}),nf={};if(isC){Object.keys(faceMap).forEach(function(k){nf[k]=id});faceMap=nf}else faceMap=so.fm;build()}
}
function snap(k){return ctxOf(k).getImageData(0,0,res,res)}
function pushUndo(){var s=undoS[slot];s.push(snap(slot));if(s.length>60)s.shift();redoS[slot]=[];updHist()}
function doUndo(){var s=undoS[slot];if(!s||!s.length)return;redoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function doRedo(){var s=redoS[slot];if(!s||!s.length)return;undoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function updHist(){if(ctx.onHistory)ctx.onHistory(!!(undoS[slot]&&undoS[slot].length),!!(redoS[slot]&&redoS[slot].length))}
function resetHist(){slots.forEach(function(s){undoS[s.id]=[];redoS[s.id]=[]});updHist()}
function drawEd(){ed.width=ed.height=res;ed.style.backgroundSize=(200/res)+'% '+(200/res)+'%';ectx.clearRect(0,0,res,res);if(cv[slot])ectx.drawImage(cv[slot],0,0);updHist()}
function touched(){
  dirty[slot]=true;delete ph[slot];API.edits++;
  refreshTex(slot);drawEd();
}
function seg(sel,attr,fn){$(sel).addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;
  $(sel).querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});fn(b.dataset[attr])})}
seg('#shapes','s',function(v){shape=v;build()});
function setShapeUi(){$('#shapes').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.s===shape)})}
function updShapeUi(list){
  shapeKeys=list;
  var bx=$('#shapes');bx.innerHTML='';
  shapeKeys.forEach(function(k){var b=document.createElement('button');uiIcon(b,tt('shape.'+k),k);b.dataset.s=k;bx.appendChild(b)});
  if(shapeKeys.indexOf(shape)<0)shape=shapeKeys[0]||'cube';
  $('#shapesRow').style.display=shapeKeys.length>1?'flex':'none';
  setShapeUi();
}
function setRes(n){
  if(n===res)return;
  var old={};slots.forEach(function(s){var c=document.createElement('canvas');c.width=c.height=res;c.getContext('2d').drawImage(cv[s.id],0,0);old[s.id]=c});
  res=n;
  slots.forEach(function(s){cv[s.id].width=cv[s.id].height=res;var g=ctxOf(s.id);g.imageSmoothingEnabled=false;g.drawImage(old[s.id],0,0,res,res)});
  resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[s.id]=true});API.edits++;
  if(ctx.onRes)ctx.onRes(res);
}
function packCur(){
  slots.forEach(function(s){
    if(ph[s.id]||!cv[s.id])return;
    files[s.id]={res:res,data:cv[s.id].toDataURL('image/png')};
  });
}
function entryFor(list){
  var r=0,o={};
  list.forEach(function(s){var f=files[s.id];if(f){o[s.id]=f.data;if(f.res>r)r=f.res}});
  return {res:r||res,slots:o};
}
function applyEntry(e,done){
  var gen=++applyGen,list=slots,canv=cv,phNow=ph;
  res=e.res||16;if(ctx.onRes)ctx.onRes(res);
  var left=list.length;
  function fin(){
    if(--left!==0)return;
    if(gen!==applyGen)return;
    rebuildTextures();drawEd();resetHist();if(done)done();
  }
  list.forEach(function(s){
    var c=canv[s.id];
    c.width=c.height=res;
    var src=e.slots&&e.slots[s.id];
    if(!src){placeholder(c.getContext('2d'),res);phNow[s.id]=true;fin();return}
    var img=new Image();
    img.onload=function(){if(gen===applyGen){var g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,res,res)}fin()};
    img.onerror=fin;img.src=src;
  });
}
var CAT_KEY='foundrykin.catalog.v3',EX_KEY='foundrykin.exist.v2';
var lastB=null,lastT=null;
function catalogReady(src){
  S.status='ready';S.source=src;S.count=catalog.ids.length;S.filtered=!!catalog.filtered;
  S.refreshing=false;S.refreshFailed='';S.error=null;emit();
}
function catalogFailed(code,detail){
  S.status='failed';S.error={code:code,detail:detail||''};S.refreshing=false;emit();
}
function useCatalog(B,Tx,src){
  if(B)lastB=B;if(Tx)lastT=Tx;
  if(!lastB)return false;
  var c=FKCatalog.build(lastB,lastT);
  if(!Object.keys(c.b).length){
    if(catalog)say('msg.catalog_empty');
    else{S.status='empty';S.error=null;S.refreshing=false;emit()}
    return false;
  }
  try{localStorage.setItem(CAT_KEY,JSON.stringify({b:c.b,p:c.p}))}catch(err){}
  catalog=FKCatalog.index(c,existing);
  catalogReady(src);
  return true;
}
function loadCatalog(){
  var cached=null,cex=null;
  try{cached=JSON.parse(localStorage.getItem(CAT_KEY))}catch(err){}
  try{cex=JSON.parse(localStorage.getItem(EX_KEY))}catch(err){}
  if(cex&&cex.length){existing={};cex.forEach(function(p){existing[p]=1})}
  if(cached&&cached.b){catalog=FKCatalog.index(cached,existing);catalogReady('cache');S.refreshing=true;emit()}
  var eB='',eT='',eF='';
  Promise.all([
    FKCatalog.fetchJson(FKCatalog.URLS_B).catch(function(e){eB=e.message;return null}),
    FKCatalog.fetchJson(FKCatalog.URLS_T).catch(function(e){eT=e.message;return null}),
    FKCatalog.fetchExisting().catch(function(e){eF=e.message;return null})
  ]).then(function(r){
    if(r[2]){
      existing=r[2];
      try{localStorage.setItem(EX_KEY,JSON.stringify(Object.keys(existing).filter(function(p){return p.indexOf('textures/blocks/')===0||p.indexOf('textures/items/')===0})))}catch(err){}
    }else if(!existing)say('msg.files_list_failed',{detail:eF});
    if(!r[0]){
      if(!catalog)catalogFailed('catalog_fetch',eB);
      else{S.refreshing=false;S.refreshFailed=eB;emit()}
      return;
    }
    if(!r[1])say('msg.terrain_failed',{detail:eT});
    useCatalog(r[0],r[1],'network');
  });
}
$('#catfile').onchange=function(e){
  var inp=e.target,fl=[].slice.call(inp.files),left=fl.length,B=null,Tx=null;
  if(!left)return;
  fl.forEach(function(f){
    var fr=new FileReader();
    fr.onload=function(){
      try{var j=FKCatalog.parseLoose(fr.result);if(j&&j.texture_data)Tx=j;else B=j}catch(err){say('msg.file_not_json',{name:f.name,detail:err.message})}
      if(--left===0){if(!useCatalog(B,Tx,'file')&&!lastB&&!catalog)catalogFailed('catalog_no_blocks')}
    };
    fr.onerror=function(){if(--left===0)say('msg.file_unreadable')};
    fr.readAsText(f);
  });
  inp.value='';
};
function isEdited(id){return pathsFor(id).some(function(p){return dirty[p]})}
function setBlockInfo(id,m,note,mo){
  var grp=catalog.members[catalog.sig[m]],fo=catalog.forms&&catalog.forms[m];
  S.info={id:id,files:pathsFor(m),shared:grp.filter(function(x){return x!==m}),forms:fo?Object.keys(fo):[],note:note,kind:isDoorBlock(m)?'door':(mo||'shape')};
  emit();
}
function ensureFiles(m){
  var p=pathsFor(m),need=[];
  p.forEach(function(x){if(!files[x]&&need.indexOf(x)<0)need.push(x)});
  if(!need.length)return Promise.resolve({vanilla:true,missing:0,loaded:false});
  return Promise.all(need.map(FKCatalog.loadAny)).then(function(imgs){
    var first=imgs.filter(Boolean)[0],r=(first&&first.width===32)?32:16,miss=0,c=document.createElement('canvas');
    need.forEach(function(x,i){
      var im=imgs[i];
      if(!im){miss++;return}
      c.width=c.height=r;var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,r,r);
      files[x]={res:r,data:c.toDataURL('image/png')};
    });
    return {vanilla:!!first,missing:miss,loaded:true};
  });
}
var selTok=0;
function selectBlock(id){
  if(!catalog||!catalog.b[id])return;
  var m=catalog.mother[id],tok=++selTok,grp=catalog.members[catalog.sig[m]];
  var mo=modelOf(m),keysList=shapeKeysFor(m,grp);
  var want=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));
  var sh=keysList.indexOf(want)>=0?want:keysList[0];
  function go(note){
    if(tok!==selTok)return;
    packCur();cur=m;shape=sh;
    var so=slotsFor(m);setupSlots(so.list,so.fm);updShapeUi(keysList);
    applyEntry(entryFor(so.list),function(){build();setBlockInfo(id,m,note,mo);API.loaded(m)});
  }
  S.info=null;API.pending=id;API.loading();
  ensureFiles(m).then(function(r){go(!r.vanilla?'gray':(r.missing?'part':(r.loaded?'base':'')))}).catch(function(err){
    showErr('block_load',err.message);
    go('gray');
  });
}
function curFiles(){
  packCur();
  var out=[],seen={};
  slots.forEach(function(s){
    var f=files[s.id];if(!f)return;
    var p=s.id;
    if(!seen[p]){seen[p]=1;out.push({path:p+'.png',data:f.data})}
  });
  return out;
}
function pngSize(d){
  var w=16;
  try{var b=atob(d.split(',')[1].slice(0,40));w=(b.charCodeAt(16)*16777216)+(b.charCodeAt(17)<<16)+(b.charCodeAt(18)<<8)+b.charCodeAt(19)}catch(e){}
  return (w>0&&w<=1024)?w:16;
}
var API={
  edits:0,busy:false,want:null,block:'',pending:'',state:S,ctx:ctx,
  version:(function(){try{return parent.FK_V||'?'}catch(e){return '?'}})(),
  subscribe:function(f){listeners.push(f)},
  setMode:function(m){
    S.mode=m;
    document.body.classList.toggle('fk-search',m==='search');
    document.body.classList.toggle('fk-edit',m==='edit');
    try{scrollTo(0,0)}catch(e){}
    emit();
  },
  cur:function(){return cur},
  files:function(){return curFiles().filter(function(f){return dirty[f.path.replace(/\.png$/,'')]})},
  loading:function(){API.busy=true;emit()},
  loaded:function(m){API.busy=false;API.pending='';API.block=m;var w=API.want;API.want=null;if(w&&cv[w])setSlot(w);emit()},
  openTexture:function(path,data){
    var key='textures/'+path;
    if(!catalog)return null;
    var hit=null,alt=null,base=path.split('/').pop();
    for(var i=0;i<catalog.ids.length&&!hit;i++){
      var cid=catalog.ids[i];
      if(pathsFor(cid).indexOf(key)>=0)hit=cid;else if(!alt&&cid===base)alt=cid;
    }
    if(!hit&&alt){hit=alt;key=pathsFor(alt)[0]}
    if(!hit)return false;
    files[key]={res:pngSize(data),data:data};dirty[key]=true;API.want=key;selectBlock(hit);
    return hit;
  },
  stats:function(){return {frames:frames,webgl:gl,res:res,slots:slots.length}},
  grid:function(){
    return {
      catalog:catalog,files:files,dirty:dirty,shapes:SHAPES,load:FKCatalog.loadAny,select:selectBlock,edited:isEdited,
      discard:function(){slots.forEach(function(s){ph[s.id]=true})},
      obj:function(){return {id:cur||null,paths:slots.map(function(s){return s.id}),file:slot?String(slot).split('/').pop():''}},
      setPack:function(map){
        Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k]}});
        Object.keys(map).forEach(function(k){files[k]={res:pngSize(map[k]),data:map[k]};dirty[k]=true});
      },
      shapeFor:function(id){
        var m=catalog.mother[id],mo=modelOf(m),k=shapeKeysFor(m,catalog.members[catalog.sig[m]]),w=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));
        return k.indexOf(w)>=0?w:k[0];
      }
    };
  }
};
ctx.el={ed:ed};
ctx.res=function(){return res};
ctx.setRes=setRes;
ctx.ready=function(){return !!cv[slot]};
ctx.g=function(){return ctxOf(slot)};
ctx.pushUndo=pushUndo;ctx.undo=doUndo;ctx.redo=doRedo;ctx.touched=touched;
ctx.syncHist=updHist;ctx.files=curFiles;ctx.say=say;
window.FKAPI=API;
FK.apply(document);
loadCatalog();
requestAnimationFrame(loop);
setTimeout(function(){if(gl&&frames<2)showErr('render_stalled')},2500);
})();
