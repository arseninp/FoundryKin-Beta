/* Editor state and shared object preparation for editor and Find. */
(function(){
var FK=window.FK,V=window.FKView;
function tt(k,p){return FK.t(k,p)}
var res=16,shape='cube',slots=[],slot=null,faceMap={},cv={},tex={},mats={},undoS={},redoS={},ph={},applyGen=0,fr={},fi={},hs={};
var files={},cur='',dirty={},catalog=null,existing=null,shapeKeys=['cube'],decoded={},sourceLoads={};
var FACES=['up','down','north','south','east','west'],ALL_SHAPES=['cube','slab','stairs','wall','fence','gate','button','plate','pane','carpet'];
var $=function(s){return document.querySelector(s)};
try{var PD=parent.document.documentElement;var syncTheme=function(){document.documentElement.setAttribute('data-theme',PD.getAttribute('data-theme')||'light')};syncTheme();new MutationObserver(syncTheme).observe(PD,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
var ed=$('#ed'),ectx=ed.getContext('2d'),listeners=[],stateUi=window.FKModelState.create($('#shapesRow'),function(){build()});
var S={mode:'search',status:'loading',source:'',count:0,filtered:true,refreshing:false,refreshFailed:'',error:null,errors:[],info:null,message:null},ctx={onHistory:null,onRes:null};
function emit(){listeners.forEach(function(f){try{f(S)}catch(e){}})}
function showErr(code,detail){var last=S.errors[S.errors.length-1];detail=detail||'';if(last&&last.code===code&&last.detail===detail)return;S.errors.push({code:code,detail:detail});if(S.errors.length>3)S.errors.shift();emit()}
window.addEventListener('error',function(e){showErr('script',(e.message||'')+(e.lineno?' @'+e.lineno:''))});
window.addEventListener('unhandledrejection',function(e){showErr('promise',(e.reason&&e.reason.message)||String(e.reason))});
function say(key,p){S.message=key?{key:key,params:p||{}}:null;$('#msg').textContent=key?tt(key,p):'';emit()}
function rnd(x,y,s){var h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)}
function placeholder(g,r){for(var y=0;y<r;y++)for(var x=0;x<r;x++){var v=118+Math.round(rnd(Math.floor(x*16/r),Math.floor(y*16/r),5)*50);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,y,1,1)}}
function ctxOf(k){return cv[k].getContext('2d')}
function shapeOfId(id){var m=/_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane|carpet)$/.exec(id),map={fence_gate:'gate',pressure_plate:'plate'};return /_trapdoor$/.test(id)?'trapdoor':m?(map[m[1]]||m[1]):'cube'}
function isDoorBlock(m){return !!(catalog&&catalog.sp&&catalog.sp[m]&&catalog.sp[m].kind==='door')}
function modelOf(m){if(m==='beacon')return 'beacon';if(m==='azalea'||m==='flowering_azalea')return 'azalea';return (m==='bamboo'||(catalog&&catalog.p&&catalog.p[m]))?'plant':null}
function doubleSided(m){var mo=modelOf(m);return /leaves/.test(m)||mo==='plant'||mo==='azalea'}
function shapeKeysFor(m){
  var base=catalog.familyOf&&catalog.familyOf[m],fe=base&&catalog.formEntries[base];if(fe)return Object.keys(fe).sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});
  if(isDoorBlock(m))return ['door'];if(m==='anvil')return ['anvil'];if(m==='cake')return ['cake'];if(m==='bell')return ['bell'];
  if(m==='big_dripleaf'||m==='small_dripleaf_block')return ['dripleaf'];if(/_bed$/.test(m))return ['bed'];
  if(/(^|_)candle$/.test(m))return ['candle'];if(/(^|_)carpet$/.test(m))return ['carpet'];
  if(/(^|_)rail$/.test(m)||m==='waterlily'||m==='leaf_litter'||m==='frog_spawn')return ['rail'];
  if(m==='vine'||m==='glow_lichen'||m==='sculk_vein'||m==='resin_clump')return ['decal'];
  var mo=modelOf(m);if(mo)return [mo];if(/_trapdoor$/.test(m))return ['trapdoor'];
  var ks=[shapeOfId(m)],f=catalog.forms&&catalog.forms[m];if(f)Object.keys(f).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});return ks;
}
function slotsOf(p){var list=[],seen={},fm={};FACES.forEach(function(f,i){var path=p[i];fm[f]=path;if(!seen[path]){seen[path]=1;list.push({id:path})}});return {list:list,fm:fm}}
function slotsFor(m){if(catalog.sp&&catalog.sp[m])return {list:catalog.sp[m].list,fm:catalog.sp[m].fm};var so=slotsOf(catalog.b[m]),cp=catalog.cr&&catalog.cr[m];if(cp&&!so.list.some(function(s){return s.id===cp}))so.list.push({id:cp,carried:true});return so}
function pathsFor(m){if(catalog.sp&&catalog.sp[m])return catalog.sp[m].list.map(function(s){return s.id});var o=[];catalog.b[m].forEach(function(x){if(o.indexOf(x)<0)o.push(x)});var q=catalog.cr&&catalog.cr[m];if(q&&o.indexOf(q)<0)o.push(q);return o}
function describe(id){var m=catalog.mother[id]||id,mo=modelOf(m),keys=shapeKeysFor(m),want=(catalog.variantForm&&catalog.variantForm[m])||(isDoorBlock(m)?'door':(mo||shapeOfId(id)));return {id:m,model:mo,keys:keys,shape:keys.indexOf(want)>=0?want:keys[0],so:slotsFor(m)}}
var stage=$('#stage'),W=stage.clientWidth||360,gl=typeof THREE!=='undefined'&&!!V,view=null,group=null,frames=0,renderFrame=null,resetView=true;
if(!gl)showErr('three_missing');
if(gl){try{view=V.createStage();group=view.group;V.mount(stage)}catch(err){gl=false;showErr('webgl_unavailable',err.message)}}
function requestRender(){if(!gl||S.mode!=='edit'||document.hidden||renderFrame!==null)return;renderFrame=requestAnimationFrame(function(){renderFrame=null;if(!gl||S.mode!=='edit'||document.hidden)return;if(!isFinite(group.rotation.x)||!isFinite(group.rotation.y))group.rotation.set(0,0,0);try{V.render(view,W,Math.min(devicePixelRatio,2));frames++}catch(err){showErr('render',err.message)}})}
function cancelRender(){if(renderFrame!==null){cancelAnimationFrame(renderFrame);renderFrame=null}}
function resizeStage(){if(!gl||S.mode!=='edit'||document.hidden)return;var w=stage.clientWidth;if(w)W=w;requestRender()}
function loadingUi(on){stateUi.busy(on);stage.setAttribute('aria-busy',String(on));['#ed','#slots','#shapesRow','#frames','#toolsPanel'].forEach(function(sel){var el=$(sel);el.inert=on;el.style.visibility=on?'hidden':''})}
function refreshDoor(){if(!gl||!mats.__door||shape!=='door')return;var L=faceMap.down,U=faceMap.north;if(!cv[L]||!cv[U])return;if(tex.__door)tex.__door.dispose();tex.__door=V.doorTexture(cv[L],cv[U]);V.mapMaterial(mats.__door,tex.__door);requestRender()}
function refreshTex(id){if(!gl||!cv[id]||!mats[id])return;if(tex[id])tex[id].dispose();tex[id]=V.texture(cv[id]);V.mapMaterial(mats[id],tex[id]);refreshDoor();requestRender()}
function rebuildTextures(){slots.forEach(function(s){refreshTex(s.id)});refreshDoor()}
function clearModel(){if(view)V.clear(view)}
function isFlat(){return !!(FKShapes.flat&&FKShapes.flat(cur,slot))}
function build(){if(!gl)return;if(slots.length)V.build(view,{shape:shape,cur:cur,slot:slot,faceMap:faceMap,mats:mats,refreshDoor:refreshDoor,state:stateUi.value()},resetView);else clearModel();resetView=false;requestRender()}
var drag=null;
stage.addEventListener('pointerdown',function(e){if(!gl||API.busy||S.mode!=='edit'||isFlat()||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',function(e){if(!drag||drag.id!==e.pointerId||isFlat())return;group.rotation.y+=(e.clientX-drag.x)*.01;group.rotation.x=Math.max(-1.4,Math.min(1.4,group.rotation.x+(e.clientY-drag.y)*.01));drag.x=e.clientX;drag.y=e.clientY;requestRender()});
function endDrag(e){if(!e||drag&&drag.id===e.pointerId)drag=null}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
document.addEventListener('visibilitychange',function(){if(document.hidden){endDrag();cancelRender()}else resizeStage()});addEventListener('resize',resizeStage);
function setupSlots(list,fm){
  applyGen++;clearModel();Object.keys(tex).forEach(function(k){if(tex[k])tex[k].dispose()});Object.keys(mats).forEach(function(k){if(mats[k])mats[k].dispose()});
  tex={};mats={};cv={};undoS={};redoS={};ph={};fr={};fi={};hs={};slots=list;faceMap=fm;resetView=true;
  list.forEach(function(s){var n=(files[s.id]&&files[s.id].frames)||1,a=[];for(var i=0;i<n;i++){var c=document.createElement('canvas');c.width=c.height=res;a.push(c)}fr[s.id]=a;fi[s.id]=0;hs[s.id]=[];cv[s.id]=a[0];undoS[s.id]=[];redoS[s.id]=[];if(gl)mats[s.id]=V.material(doubleSided(cur))});
  if(gl&&shape==='door')mats.__door=V.material(false);slot=list[0].id;buildSlotUi();
}
function buildSlotUi(){var boxEl=$('#slots');boxEl.innerHTML='';slots.forEach(function(s){var b=document.createElement('button');b.type='button';b.textContent=String(s.id).split('/').pop();b.title=s.id;b.dataset.id=s.id;if(s.id===slot)b.className='on';b.onclick=function(){setSlot(s.id)};boxEl.appendChild(b)});boxEl.style.display=slots.length?'flex':'none';frameUi()}
function setSlot(id){if(API.busy||!cv[id])return;slot=id;$('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});drawEd();frameUi();if(slots.some(function(s){return s.carried})){var so=slotsFor(cur),isC=slots.some(function(s){return s.carried&&s.id===id}),nf={};if(isC){Object.keys(faceMap).forEach(function(k){nf[k]=id});faceMap=nf}else faceMap=so.fm}build()}
function frameUi(){var f=fr[slot],n=f?f.length:0;$('#frames').style.display=n>1?'flex':'none';if(n>1)$('#fNum').textContent=(fi[slot]+1)+' / '+n}
function setFrame(k){if(API.busy)return;var id=slot,f=fr[id];if(!f||k<0||k>=f.length||k===fi[id])return;hs[id][fi[id]]={u:undoS[id],r:redoS[id]};fi[id]=k;cv[id]=f[k];var h=hs[id][k]||{u:[],r:[]};undoS[id]=h.u;redoS[id]=h.r;refreshTex(id);drawEd();frameUi()}
$('#fPrev').onclick=function(){setFrame(fi[slot]-1)};$('#fNext').onclick=function(){setFrame(fi[slot]+1)};
function snap(k){return ctxOf(k).getImageData(0,0,res,res)}
function pushUndo(){var s=undoS[slot];s.push(snap(slot));if(s.length>60)s.shift();redoS[slot]=[];updHist()}
function doUndo(){if(API.busy)return;var s=undoS[slot];if(!s||!s.length)return;redoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function doRedo(){if(API.busy)return;var s=redoS[slot];if(!s||!s.length)return;undoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function updHist(){if(ctx.onHistory)ctx.onHistory(!!(undoS[slot]&&undoS[slot].length),!!(redoS[slot]&&redoS[slot].length))}
function resetHist(){slots.forEach(function(s){undoS[s.id]=[];redoS[s.id]=[];hs[s.id]=[]});updHist()}
function drawEd(){ed.width=ed.height=res;ed.style.backgroundSize=(200/res)+'% '+(200/res)+'%';ectx.clearRect(0,0,res,res);if(cv[slot])ectx.drawImage(cv[slot],0,0);updHist()}
function touched(){dirty[slot]=true;delete ph[slot];API.edits++;refreshTex(slot);drawEd()}
function seg(sel,attr,fn){$(sel).addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled||API.busy)return;$(sel).querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});fn(b.dataset[attr])})}
seg('#shapes','s',function(v){var base=catalog.familyOf&&catalog.familyOf[cur],target=base&&catalog.formEntries[base][v];if(target&&target!==cur){selectBlock(target);return}shape=v;build()});
function setShapeUi(){$('#shapes').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.s===shape)})}
function updShapeUi(list){shapeKeys=list;var bx=$('#shapes');bx.innerHTML='';shapeKeys.forEach(function(k){var b=document.createElement('button');FKShapes.icon(b,tt('shape.'+k),k);b.dataset.s=k;bx.appendChild(b)});if(shapeKeys.indexOf(shape)<0)shape=shapeKeys[0]||'cube';$('#shapesRow').style.display=shapeKeys.length>1?'flex':'none';setShapeUi()}
function setRes(n){if(API.busy||n===res)return;var old={};slots.forEach(function(s){old[s.id]=fr[s.id].map(function(f){var c=document.createElement('canvas');c.width=c.height=res;c.getContext('2d').drawImage(f,0,0);return c})});res=n;slots.forEach(function(s){fr[s.id].forEach(function(f,k){f.width=f.height=res;var g=f.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(old[s.id][k],0,0,res,res)})});resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[s.id]=true});API.edits++;if(ctx.onRes)ctx.onRes(res)}
function packCur(){slots.forEach(function(s){if(ph[s.id]||!cv[s.id])return;var fs=fr[s.id],n=fs.length,aspect=n>1?1:((files[s.id]&&files[s.id].aspect)||1),d;if(n>1||aspect!==1){var c=document.createElement('canvas');c.width=res;c.height=Math.max(1,Math.round(res*n*aspect));var g=c.getContext('2d');fs.forEach(function(f,k){g.drawImage(f,0,k*res)});d=c.toDataURL('image/png')}else d=cv[s.id].toDataURL('image/png');files[s.id]={res:res,data:d,frames:n,aspect:aspect}})}
function entryFor(list){var r=0,o={};list.forEach(function(s){var f=files[s.id];if(f){o[s.id]=f.data;if(f.res>r)r=f.res}});return {res:r||16,slots:o}}
/* Both consumers decode the same stored image and extract a frame identically. */
function readImage(path,data){
  if(!data)return Promise.resolve(null);var hit=decoded[path];if(hit&&hit.data===data)return hit.promise;
  var item={data:data,promise:null};item.promise=new Promise(function(ok){var img=new Image();img.onload=function(){ok(img)};img.onerror=function(){if(decoded[path]===item)delete decoded[path];ok(null)};img.src=data});decoded[path]=item;return item.promise;
}
function drawFrame(canvas,img,k,n){canvas.width=canvas.height=n;var g=canvas.getContext('2d');g.imageSmoothingEnabled=false;if(img)g.drawImage(img,0,k*img.width,img.width,img.width,0,0,n,n);else placeholder(g,n)}
function applyEntry(e,done){
  var gen=++applyGen,list=slots,frs=fr,phNow=ph,n=e.res||16;res=n;if(ctx.onRes)ctx.onRes(res);
  Promise.all(list.map(function(s){return readImage(s.id,e.slots&&e.slots[s.id])})).then(function(imgs){if(gen!==applyGen)return;list.forEach(function(s,i){frs[s.id].forEach(function(c,k){drawFrame(c,imgs[i],k,n)});if(!imgs[i])phNow[s.id]=true});rebuildTextures();drawEd();resetHist();if(done)done()});
}
var CAT_KEY='foundrykin.catalog.v6',lastB=null,lastTerrain=null,lastFamilies={};
function catalogReady(src){S.status='ready';S.source=src;S.count=catalog.ids.length;S.filtered=!!catalog.filtered;S.refreshing=false;S.refreshFailed='';S.error=null;emit()}
function catalogFailed(code,detail){S.status='failed';S.error={code:code,detail:detail||''};S.refreshing=false;emit()}
function useCatalog(B,Tx,src){
 if(B)lastB=B;if(Tx)lastTerrain=Tx;if(!lastB)return false;
 var c=FKCatalog.build(lastB,lastTerrain);
 if(!Object.keys(c.b).length){if(catalog)say('msg.catalog_empty');else{S.status='empty';S.error=null;S.refreshing=false;emit()}return false}
 var plan=src==='file'?{}:lastFamilies;
 var prepared=FKCatalog.bindFamilies(FKCatalog.index(c,existing),plan);
 if(src!=='file')try{localStorage.setItem(CAT_KEY,JSON.stringify({commit:window.FKCatalogData.commit,version:API.version,b:c.b,p:c.p,cr:c.cr,extra:c.extra,existing:existing,familyPlan:plan}))}catch(err){}
 catalog=prepared;catalogReady(src);return true;
}
function loadCatalog(){
  try{
    var cached=JSON.parse(localStorage.getItem(CAT_KEY));
    if(cached&&cached.commit===window.FKCatalogData.commit&&cached.version===API.version&&cached.b&&cached.existing&&cached.familyPlan){
      lastFamilies=cached.familyPlan;var restored=FKCatalog.bindFamilies(FKCatalog.index(cached,cached.existing),lastFamilies);
      if(restored.ids.length){existing=cached.existing;catalog=restored;catalogReady('cache');S.refreshing=true;emit()}
    }
  }catch(err){}
  FKCatalog.load().then(function(data){
    existing=data.existing;lastFamilies=data.families;
    useCatalog(data.blocks,data.terrain,'bundled');
  }).catch(function(err){
    if(!catalog)catalogFailed('catalog_fetch',err.message);
    else{S.refreshing=false;S.refreshFailed=err.message;emit()}
  });
}
$('#catfile').onchange=function(e){var inp=e.target,fl=[].slice.call(inp.files),left=fl.length,B=null,Tx=null;if(!left)return;fl.forEach(function(f){var fr=new FileReader();fr.onload=function(){try{var j=FKCatalog.parseLoose(fr.result);if(j&&j.texture_data)Tx=j;else B=j}catch(err){say('msg.file_not_json',{name:f.name,detail:err.message})}if(--left===0){if(!useCatalog(B,Tx,'file')&&!lastB&&!catalog)catalogFailed('catalog_no_blocks')}};fr.onerror=function(){if(--left===0)say('msg.file_unreadable')};fr.readAsText(f)});inp.value=''};
function familyPaths(id){var base=catalog.familyOf&&catalog.familyOf[id],entries=base&&catalog.formEntries[base],out=[];(entries?Object.keys(entries).map(function(k){return entries[k]}):[id]).forEach(function(x){pathsFor(x).forEach(function(p){if(out.indexOf(p)<0)out.push(p)})});return out}
function isEdited(id){return familyPaths(id).some(function(p){return dirty[p]})}
function familyFiles(){packCur();return familyPaths(cur).filter(function(p){return dirty[p]&&files[p]}).map(function(p){return {path:p+'.png',data:files[p].data}})}
function setBlockInfo(id,m,note,mo){var grp=catalog.members[catalog.sig[m]],fo=catalog.forms&&catalog.forms[m];S.info={id:id,files:pathsFor(m),shared:grp.filter(function(x){return x!==m}),forms:fo?Object.keys(fo):[],note:note,kind:isDoorBlock(m)?'door':(mo||'shape')};emit()}
function fcount(w,h){var n=Math.round(h/w);return n>1&&Math.abs(h/w-n)<.01?n:1}
function loadSource(path){if(!sourceLoads[path])sourceLoads[path]=FKCatalog.loadAny(path).then(function(im){if(!im)delete sourceLoads[path];return im},function(err){delete sourceLoads[path];throw err});return sourceLoads[path]}
function ensureFiles(m){
  var need=[];pathsFor(m).forEach(function(x){if(!files[x]&&need.indexOf(x)<0)need.push(x)});if(!need.length)return Promise.resolve({vanilla:true,missing:0,loaded:false});
  return Promise.all(need.map(loadSource)).then(function(imgs){var first=imgs.filter(Boolean)[0],mx=Math.max.apply(null,[0].concat(imgs.filter(Boolean).map(function(i){return i.width}))),r=mx>=64?64:mx>=32?32:16,miss=0,c=document.createElement('canvas');need.forEach(function(x,i){var im=imgs[i];if(!im){miss++;return}if(files[x])return;var n=fcount(im.width,im.height),aspect=n===1&&im.height<im.width?im.height/im.width:1;c.width=r;c.height=Math.max(1,Math.round(r*n*aspect));var g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,im.width,im.height,0,0,r,c.height);files[x]={res:r,data:c.toDataURL('image/png'),frames:n,aspect:aspect}});return {vanilla:!!first,missing:miss,loaded:true}});
}
/* Snapshot state is local; no editor selection, history or canvas is modified. */
function previewBlock(id,valid){
  if(!gl||!catalog||!catalog.b[id]||!valid())return Promise.resolve(null);
  var cat=catalog,spec=describe(id);
  return ensureFiles(spec.id).then(function(){if(!valid()||catalog!==cat)return null;var e=entryFor(spec.so.list);return Promise.all(spec.so.list.map(function(s){return readImage(s.id,e.slots[s.id])})).then(function(imgs){
    if(!valid()||catalog!==cat)return null;
    var canvases={},materials={},textures=[];
    try{
      spec.so.list.forEach(function(s,i){if(materials[s.id])return;var c=document.createElement('canvas');drawFrame(c,imgs[i],0,e.res);canvases[s.id]=c;var mat=V.material(doubleSided(spec.id));materials[s.id]=mat;var tx=V.texture(c);textures.push(tx);V.mapMaterial(mat,tx)});
      if(spec.shape==='door'){materials.__door=V.material(false);var door=V.doorTexture(canvases[spec.so.fm.down],canvases[spec.so.fm.north]);textures.push(door);V.mapMaterial(materials.__door,door)}
      return V.capture({shape:spec.shape,cur:spec.id,slot:spec.so.list[0].id,faceMap:spec.so.fm,mats:materials},256);
    }finally{Object.keys(materials).forEach(function(k){materials[k].dispose()});textures.forEach(function(t){t.dispose()})}
  })});
}
var selTok=0;
function selectBlock(id){
  if(!catalog||!catalog.b[id])return;var spec=describe(id),m=spec.id,tok=++selTok;
  if(!API.busy)packCur();applyGen++;endDrag();if(gl){clearModel();requestRender()}
  function go(note){if(tok!==selTok)return;cur=m;stateUi.select(m,FKShapes.stateSchema?FKShapes.stateSchema(m):null);shape=spec.shape;setupSlots(spec.so.list,spec.so.fm);updShapeUi(spec.keys);applyEntry(entryFor(spec.so.list),function(){if(tok!==selTok)return;build();setBlockInfo(id,m,note,spec.model);API.loaded(m)})}
  S.info=null;API.pending=id;API.loading();ensureFiles(m).then(function(r){go(!r.vanilla?'gray':(r.missing?'part':(r.loaded?'base':'')))}).catch(function(err){if(tok!==selTok)return;showErr('block_load',err.message);go('gray')});
}
function curFiles(){packCur();var out=[],seen={};slots.forEach(function(s){var f=files[s.id];if(!f)return;var p=s.id;if(!seen[p]){seen[p]=1;out.push({path:p+'.png',data:f.data})}});return out}
function mkFile(d){var w=16,h=16;try{var b=atob(d.split(',')[1].slice(0,40));w=(b.charCodeAt(16)*16777216)+(b.charCodeAt(17)<<16)+(b.charCodeAt(18)<<8)+b.charCodeAt(19);h=(b.charCodeAt(20)*16777216)+(b.charCodeAt(21)<<16)+(b.charCodeAt(22)<<8)+b.charCodeAt(23)}catch(e){}if(!(w>0&&w<=1024))w=16;if(!(h>0))h=w;var n=fcount(w,h);return {res:w,data:d,frames:n,aspect:n===1&&h<w?h/w:1}}
var API={
  edits:0,busy:false,want:null,block:'',pending:'',state:S,ctx:ctx,
  version:(function(){try{return parent.FK_V||'?'}catch(e){return '?'}})(),subscribe:function(f){listeners.push(f)},
  setMode:function(m){S.mode=m;document.body.classList.toggle('fk-search',m==='search');document.body.classList.toggle('fk-edit',m==='edit');try{scrollTo(0,0)}catch(e){}if(m==='edit')resizeStage();else{endDrag();cancelRender()}emit()},
  cur:function(){return cur},files:function(){return cur?familyFiles():[]},
  loading:function(){API.busy=true;loadingUi(true);emit()},
  loaded:function(m){API.busy=false;API.pending='';API.block=m;loadingUi(false);var w=API.want;API.want=null;if(w&&cv[w])setSlot(w);emit()},
  openTexture:function(path,data){var key='textures/'+path;if(!catalog)return null;var hit=null,alt=null,base=path.split('/').pop(),allIds=Object.keys(catalog.b);for(var i=0;i<allIds.length&&!hit;i++){var cid=allIds[i];if(pathsFor(cid).indexOf(key)>=0)hit=cid;else if(!alt&&cid===base)alt=cid}if(!hit&&alt){hit=alt;key=pathsFor(alt)[0]}if(!hit)return false;files[key]=mkFile(data);dirty[key]=true;API.want=key;selectBlock(hit);return hit},
  stats:function(){return {frames:frames,webgl:gl,res:res,slots:slots.length}},
  grid:function(){return {catalog:catalog,files:files,dirty:dirty,shapes:FKShapes.SHAPES,load:FKCatalog.loadAny,select:selectBlock,edited:isEdited,preview:previewBlock,
    discard:function(){slots.forEach(function(s){ph[s.id]=true})},
    obj:function(){return API.busy?{id:API.pending||null,paths:[]}:{id:(catalog.familyOf&&catalog.familyOf[cur])||cur||null,paths:cur?familyPaths(cur):[]}},
    setPack:function(map){Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k];delete decoded[k]}});Object.keys(map).forEach(function(k){if(!files[k]||files[k].data!==map[k]){files[k]=mkFile(map[k]);delete decoded[k]}dirty[k]=true})},
    shapeFor:function(id){return describe(id).shape}}}
};
ctx.el={ed:ed};ctx.res=function(){return res};ctx.setRes=setRes;ctx.ready=function(){return !API.busy&&!!cv[slot]};ctx.g=function(){return ctxOf(slot)};
ctx.pushUndo=pushUndo;ctx.undo=doUndo;ctx.redo=doRedo;ctx.touched=touched;ctx.syncHist=updHist;ctx.files=curFiles;ctx.say=say;
window.FKAPI=API;FK.apply(document);loadCatalog();
})();
