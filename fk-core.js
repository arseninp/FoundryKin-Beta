/* Editor state and shared object preparation for editor and Find. */
(function(){
var FK=window.FK,V=window.FKView;
function tt(k,p){return FK.t(k,p)}
var res=16,shape='cube',slots=[],slot=null,faceMap={},cv={},tex={},mats={},undoS={},redoS={},ph={},applyGen=0,fr={},fi={},hs={};
var files={},cur='',dirty={},catalog=null,existing=null,shapeKeys=['cube'],decoded={},sourceLoads={},queuedPack=null;
var selection=null,unified=null,choice=null,controlTools=null,reader=null;
var unifiedMode=new URL(location.href).searchParams.get('catalog')==='unified';
try{unifiedMode=unifiedMode||new URL(parent.location.href).searchParams.get('catalog')==='unified'}catch(e){}
var $=function(s){return document.querySelector(s)};
try{var PD=parent.document.documentElement;var syncTheme=function(){document.documentElement.setAttribute('data-theme',PD.getAttribute('data-theme')||'light')};syncTheme();new MutationObserver(syncTheme).observe(PD,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
var ed=$('#ed'),ectx=ed.getContext('2d'),listeners=[],stateUi=window.FKModelState.create($('#shapesRow'),function(){if(!unified){build();return}if(choice&&!API.busy)selectCompiled({id:cur,...controlTools.previewControlSelection(choice.plan,stateUi.value())})});
var S={mode:'search',status:'loading',source:'',count:0,filtered:true,refreshing:false,refreshFailed:'',error:null,errors:[],info:null,message:null},ctx={onHistory:null,onRes:null};
function emit(){listeners.forEach(function(f){try{f(S)}catch(e){}})}
function showErr(code,detail){var last=S.errors[S.errors.length-1];detail=detail||'';if(last&&last.code===code&&last.detail===detail)return;S.errors.push({code:code,detail:detail});if(S.errors.length>3)S.errors.shift();emit()}
window.addEventListener('error',function(e){showErr('script',(e.message||'')+(e.lineno?' @'+e.lineno:''))});
window.addEventListener('unhandledrejection',function(e){showErr('promise',(e.reason&&e.reason.message)||String(e.reason))});
function say(key,p){S.message=key?{key:key,params:p||{}}:null;$('#msg').textContent=key?tt(key,p):'';emit()}
function ctxOf(k){return cv[k].getContext('2d')}
var stage=$('#stage'),W=stage.clientWidth||360,gl=typeof THREE!=='undefined'&&!!V,view=null,group=null,frames=0,renderFrame=null,resetView=true;
if(!gl)showErr('three_missing');
if(gl){try{view=V.createStage();group=view.group;V.mount(stage)}catch(err){gl=false;showErr('webgl_unavailable',err.message)}}
function requestRender(){if(!gl||S.mode!=='edit'||document.hidden||renderFrame!==null)return;renderFrame=requestAnimationFrame(function(){renderFrame=null;if(!gl||S.mode!=='edit'||document.hidden)return;if(!isFinite(group.rotation.x)||!isFinite(group.rotation.y))group.rotation.set(0,0,0);try{V.render(view,W,Math.min(devicePixelRatio,2));frames++}catch(err){showErr('render',err.message)}})}
function cancelRender(){if(renderFrame!==null){cancelAnimationFrame(renderFrame);renderFrame=null}}
function resizeStage(){if(!gl||S.mode!=='edit'||document.hidden)return;var w=stage.clientWidth;if(w)W=w;requestRender()}
function loadingUi(on){stateUi.busy(on);stage.setAttribute('aria-busy',String(on));['#ed','#slots','#shapesRow','#frames','#toolsPanel'].forEach(function(sel){var el=$(sel);el.inert=on;el.style.visibility=on?'hidden':''})}
function refreshDoor(){if(!gl||!mats.__door||shape!=='door')return;var L=faceMap.down,U=faceMap.north;if(!cv[L]||!cv[U])return;if(tex.__door)tex.__door.dispose();tex.__door=V.doorTexture(cv[L],cv[U]);V.mapMaterial(mats.__door,tex.__door);requestRender()}
function refreshTex(id){if(unified){if(gl&&view.instance)V.update(view,cv);requestRender();return}if(!gl||!cv[id]||!mats[id])return;if(tex[id])tex[id].dispose();tex[id]=V.texture(cv[id]);V.mapMaterial(mats[id],tex[id]);refreshDoor();requestRender()}
function rebuildTextures(){if(unified){if(gl&&view.instance)V.update(view,cv);requestRender();return}slots.forEach(function(s){refreshTex(s.id)});refreshDoor()}
function clearModel(){if(view)V.clear(view)}
function isFlat(){return unified?!!choice&&choice.plan.mode==='sprite':!!(FKShapes.flat&&FKShapes.flat(cur,slot))}
function build(){if(!gl)return;if(unified){if(choice)V.build(view,{plan:choice.plan,canvases:cv},resetView);else clearModel();resetView=false;requestRender();return}if(slots.length)V.build(view,{shape:shape,cur:cur,slot:slot,faceMap:faceMap,mats:mats,refreshDoor:refreshDoor,state:stateUi.value()},resetView);else clearModel();resetView=false;requestRender()}
var drag=null;
stage.addEventListener('pointerdown',function(e){if(!gl||API.busy||S.mode!=='edit'||isFlat()||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',function(e){if(!drag||drag.id!==e.pointerId||isFlat())return;group.rotation.y+=(e.clientX-drag.x)*.01;group.rotation.x=Math.max(-1.4,Math.min(1.4,group.rotation.x+(e.clientY-drag.y)*.01));drag.x=e.clientX;drag.y=e.clientY;requestRender()});
function endDrag(e){if(!e||drag&&drag.id===e.pointerId)drag=null}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
document.addEventListener('visibilitychange',function(){if(document.hidden){endDrag();cancelRender()}else resizeStage()});addEventListener('resize',resizeStage);
function setupSlots(list,fm){
  applyGen++;clearModel();Object.keys(tex).forEach(function(k){if(tex[k])tex[k].dispose()});Object.keys(mats).forEach(function(k){if(mats[k])mats[k].dispose()});
  tex={};mats={};cv={};undoS={};redoS={};ph={};fr={};fi={};hs={};slots=list;faceMap=fm;resetView=true;
  list.forEach(function(s){var f=files[s.id],n=(f&&f.frames)||1,a=[];for(var i=0;i<n;i++){var c=document.createElement('canvas');c.width=f?f.res:16;c.height=f?Math.max(1,Math.round(f.res*(f.aspect||1))):16;a.push(c)}fr[s.id]=a;fi[s.id]=0;hs[s.id]=[];cv[s.id]=a[0];undoS[s.id]=[];redoS[s.id]=[];if(gl)mats[s.id]=V.material(selection.doubleSided(catalog,cur))});
  if(gl&&!unified&&shape==='door')mats.__door=V.material(false);slot=list.length?list[0].id:null;buildSlotUi();
}
function buildSlotUi(){var boxEl=$('#slots'),list=unified&&choice?choice.plan.paths.map(id=>({id})):slots;boxEl.innerHTML='';list.forEach(function(s){var b=document.createElement('button');b.type='button';b.textContent=String(s.id).split('/').pop();b.title=s.id;b.dataset.id=s.id;if(s.id===slot)b.className='on';b.onclick=function(){setSlot(s.id)};boxEl.appendChild(b)});boxEl.style.display=list.length?'flex':'none';frameUi()}
function setSlot(id){if(unified){if(choice&&!API.busy)selectCompiled({id:cur,slot:id,form:choice.plan.forms?choice.plan.object.form:undefined,state:choice.plan.state});return}if(API.busy||!cv[id])return;slot=id;$('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});drawEd();frameUi();if(slots.some(function(s){return s.carried})){var so=selection.slotsFor(catalog,cur),isC=slots.some(function(s){return s.carried&&s.id===id}),nf={};if(isC){Object.keys(faceMap).forEach(function(k){nf[k]=id});faceMap=nf}else faceMap=so.fm}build()}
function frameUi(){var f=fr[slot],n=f?f.length:0;$('#frames').style.display=n>1?'flex':'none';if(n>1)$('#fNum').textContent=(fi[slot]+1)+' / '+n}
function setFrame(k){if(API.busy)return;var id=slot,f=fr[id];if(!f||k<0||k>=f.length||k===fi[id])return;hs[id][fi[id]]={u:undoS[id],r:redoS[id]};fi[id]=k;cv[id]=f[k];var h=hs[id][k]||{u:[],r:[]};undoS[id]=h.u;redoS[id]=h.r;refreshTex(id);drawEd();frameUi()}
$('#fPrev').onclick=function(){setFrame(fi[slot]-1)};$('#fNext').onclick=function(){setFrame(fi[slot]+1)};
function snap(k){var c=cv[k];return ctxOf(k).getImageData(0,0,c.width,c.height)}
function pushUndo(){var s=undoS[slot];s.push(snap(slot));if(s.length>60)s.shift();redoS[slot]=[];updHist()}
function doUndo(){if(API.busy)return;var s=undoS[slot];if(!s||!s.length)return;redoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function doRedo(){if(API.busy)return;var s=redoS[slot];if(!s||!s.length)return;undoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function updHist(){if(ctx.onHistory)ctx.onHistory(!!(undoS[slot]&&undoS[slot].length),!!(redoS[slot]&&redoS[slot].length))}
function resetHist(){slots.forEach(function(s){undoS[s.id]=[];redoS[s.id]=[];hs[s.id]=[]});updHist()}
function drawEd(){var c=cv[slot],w=c?c.width:16,h=c?c.height:16;res=w;ed.width=w;ed.height=h;ed.style.aspectRatio=w+' / '+h;ed.style.backgroundSize=(200/w)+'% '+(200/h)+'%';ectx.clearRect(0,0,w,h);if(c)ectx.drawImage(c,0,0);if(ctx.onRes)ctx.onRes(res);updHist()}
function touched(){dirty[slot]=true;delete ph[slot];API.edits++;refreshTex(slot);drawEd()}
function seg(sel,attr,fn){$(sel).addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled||API.busy)return;$(sel).querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});fn(b.dataset[attr])})}
seg('#shapes','s',function(v){var base=catalog.familyOf&&catalog.familyOf[cur],target=base&&catalog.formEntries[base][v];if(target&&target!==cur){selectBlock(target);return}shape=v;build()});
function setShapeUi(){$('#shapes').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.s===shape)})}
function updShapeUi(list){shapeKeys=list;var bx=$('#shapes');bx.innerHTML='';shapeKeys.forEach(function(k){var b=document.createElement('button');FKShapes.icon(b,tt('shape.'+k),k);b.dataset.s=k;bx.appendChild(b)});if(shapeKeys.indexOf(shape)<0)shape=shapeKeys[0]||'cube';$('#shapesRow').style.display=shapeKeys.length>1?'flex':'none';setShapeUi()}
function setRes(n){if(API.busy||n===res||[16,32,64].indexOf(n)<0)return;var old={};slots.forEach(function(s){old[s.id]=fr[s.id].map(function(f){var c=document.createElement('canvas');c.width=f.width;c.height=f.height;c.getContext('2d').drawImage(f,0,0);return c})});res=n;slots.forEach(function(s){fr[s.id].forEach(function(f,k){var src=old[s.id][k];f.width=n;f.height=Math.max(1,Math.round(src.height*n/src.width));var g=f.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,0,0,f.width,f.height)})});resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[s.id]=true});API.edits++}
function packCur(){slots.forEach(function(s){if(ph[s.id]||!cv[s.id])return;var fs=fr[s.id],n=fs.length,w=fs[0].width,h=fs[0].height,d;if(n>1){var c=document.createElement('canvas');c.width=w;c.height=h*n;var g=c.getContext('2d');fs.forEach(function(f,k){g.drawImage(f,0,k*h)});d=c.toDataURL('image/png')}else d=fs[0].toDataURL('image/png');files[s.id]={res:w,data:d,frames:n,aspect:h/w}})}
function entryFor(list){var r=0,o={};list.forEach(function(s){var f=files[s.id];if(f){o[s.id]=f.data;if(f.res>r)r=f.res}});return {res:r||16,slots:o}}
/* Shared image decode cache. */
function readImage(path,data){
  if(!data)return Promise.resolve(null);var hit=decoded[path];if(hit&&hit.data===data)return hit.promise;
  var item={data:data,promise:null};item.promise=new Promise(function(ok){var img=new Image();img.onload=function(){ok(img)};img.onerror=function(){if(decoded[path]===item)delete decoded[path];ok(null)};img.src=data});decoded[path]=item;return item.promise;
}
function applyEntry(e,done){
  var gen=++applyGen,list=slots,frs=fr,phNow=ph;
  Promise.all(list.map(function(s){return readImage(s.id,e.slots&&e.slots[s.id])})).then(function(imgs){if(gen!==applyGen)return;list.forEach(function(s,i){frs[s.id].forEach(function(c,k){selection.drawFrame(c,imgs[i],k,s.id)});if(!imgs[i])phNow[s.id]=true});rebuildTextures();drawEd();resetHist();if(done)done()});
}
var CAT_KEY='foundrykin.catalog.v6',lastB=null,lastTerrain=null,lastFamilies={};
function catalogReady(src){S.status='ready';S.source=src;S.count=unified?catalog.cards.length:catalog.ids.length;S.filtered=unified?true:!!catalog.filtered;S.refreshing=false;S.refreshFailed='';S.error=null;emit()}
function catalogFailed(code,detail){S.status='failed';S.error={code:code,detail:detail||''};S.refreshing=false;emit()}
function useCatalog(B,Tx,src){if(unifiedMode){catalogFailed('catalog_fetch','Pinned unified catalog required');return false}
 if(B)lastB=B;if(Tx)lastTerrain=Tx;if(!lastB)return false;
 var c=FKCatalog.build(lastB,lastTerrain);
 if(!Object.keys(c.b).length){if(catalog)say('msg.catalog_empty');else{S.status='empty';S.error=null;S.refreshing=false;emit()}return false}
 var plan=src==='file'?{}:lastFamilies;
 var prepared=FKCatalog.bindFamilies(FKCatalog.index(c,existing),plan);
 if(src!=='file')try{localStorage.setItem(CAT_KEY,JSON.stringify({commit:window.FKCatalogData.commit,version:API.version,b:c.b,p:c.p,cr:c.cr,extra:c.extra,existing:existing,familyPlan:plan}))}catch(err){}
 catalog=prepared;catalogReady(src);return true;
}
function loadCatalog(){
 import('./catalog/editor-selection.mjs').then(function(module){selection=module;if(queuedPack){API.grid().setPack(queuedPack);queuedPack=null;}if(unifiedMode)return loadUnifiedCatalog();loadLegacyCatalog()}).catch(function(err){catalogFailed('catalog_fetch',err.message)});
}
function loadLegacyCatalog(){
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
function familyPaths(id){if(unified)return selection.compiledFamilyPaths(unified,id);var base=catalog.familyOf&&catalog.familyOf[id],entries=base&&catalog.formEntries[base],out=[];(entries?Object.keys(entries).map(function(k){return entries[k]}):[id]).forEach(function(x){selection.pathsFor(catalog,x).forEach(function(p){if(out.indexOf(p)<0)out.push(p)})});return out}
function isEdited(id){return familyPaths(id).some(function(p){return dirty[p]})}
function familyFiles(){packCur();return familyPaths(cur).filter(function(p){return dirty[p]&&files[p]}).map(function(p){return {path:p+'.png',data:files[p].data}})}
function setBlockInfo(id,m,note,mo){var grp=catalog.members[catalog.sig[m]],fo=catalog.forms&&catalog.forms[m];S.info={id:id,files:selection.pathsFor(catalog,m),shared:grp.filter(function(x){return x!==m}),forms:fo?Object.keys(fo):[],note:note,kind:selection.isDoorBlock(catalog,m)?'door':(mo||'shape')};emit()}
function loadSource(path){if(!sourceLoads[path])sourceLoads[path]=FKCatalog.loadAny(path).then(function(im){if(!im)delete sourceLoads[path];return im},function(err){delete sourceLoads[path];throw err});return sourceLoads[path]}
function ensureFiles(m){
  var need=[];selection.pathsFor(catalog,m).forEach(function(x){if(!files[x]&&need.indexOf(x)<0)need.push(x)});if(!need.length)return Promise.resolve({vanilla:true,missing:0,loaded:false});
  return Promise.all(need.map(loadSource)).then(function(imgs){var first=imgs.filter(Boolean)[0],miss=0,c=document.createElement('canvas');need.forEach(function(x,i){var im=imgs[i];if(!im){miss++;return}if(files[x])return;var meta=selection.imageMeta(x,im.naturalWidth||im.width,im.naturalHeight||im.height);c.width=meta.res;c.height=Math.round(meta.res*meta.aspect*meta.frames);var g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0);files[x]={res:meta.res,data:c.toDataURL('image/png'),frames:meta.frames,aspect:meta.aspect}});return {vanilla:!!first,missing:miss,loaded:true}});
}
/* Snapshot state is local; no editor selection, history or canvas is modified. */
function previewBlock(id,valid){if(unified)return previewCompiled(id,valid);
  if(!gl||!catalog||!catalog.b[id]||!valid())return Promise.resolve(null);
  var cat=catalog,spec=selection.describe(catalog,id);
  return ensureFiles(spec.id).then(function(){if(!valid()||catalog!==cat)return null;var e=entryFor(spec.so.list);return Promise.all(spec.so.list.map(function(s){return readImage(s.id,e.slots[s.id])})).then(function(imgs){
    if(!valid()||catalog!==cat)return null;
    var canvases={},materials={},textures=[];
    try{
      spec.so.list.forEach(function(s,i){if(materials[s.id])return;var c=document.createElement('canvas');selection.drawFrame(c,imgs[i],0,s.id);canvases[s.id]=c;var mat=V.material(selection.doubleSided(catalog,spec.id));materials[s.id]=mat;var tx=V.texture(c);textures.push(tx);V.mapMaterial(mat,tx)});
      if(spec.shape==='door'){materials.__door=V.material(false);var door=V.doorTexture(canvases[spec.so.fm.down],canvases[spec.so.fm.north]);textures.push(door);V.mapMaterial(materials.__door,door)}
      return V.capture({shape:spec.shape,cur:spec.id,slot:spec.so.list[0].id,faceMap:spec.so.fm,mats:materials},256);
    }finally{Object.keys(materials).forEach(function(k){materials[k].dispose()});textures.forEach(function(t){t.dispose()})}
  })});
}
var selTok=0;
function selectBlock(id,reopened){if(unified)return selectCompiled({id,slot:reopened?.key},reopened);
  if(!catalog||!catalog.b[id])return;var spec=selection.describe(catalog,id),m=spec.id,tok=++selTok;
  if(!API.busy)packCur();applyGen++;endDrag();if(gl){clearModel();requestRender()}
  if(reopened){files[reopened.key]=selection.mkFile(reopened.data,reopened.key);dirty[reopened.key]=true;API.want=reopened.key}
  function go(note){if(tok!==selTok)return;cur=m;stateUi.select(m,FKShapes.stateSchema?FKShapes.stateSchema(m):null);shape=spec.shape;setupSlots(spec.so.list,spec.so.fm);updShapeUi(spec.keys);applyEntry(entryFor(spec.so.list),function(){if(tok!==selTok)return;build();setBlockInfo(id,m,note,spec.model);API.loaded(m)})}
  S.info=null;API.pending=id;API.loading();ensureFiles(m).then(function(r){go(!r.vanilla?'gray':(r.missing?'part':(r.loaded?'base':'')))}).catch(function(err){if(tok!==selTok)return;showErr('block_load',err.message);go('gray')});
}
function curFiles(){packCur();var out=[],seen={};slots.forEach(function(s){var f=files[s.id];if(!f)return;var p=s.id;if(!seen[p]){seen[p]=1;out.push({path:p+'.png',data:f.data})}});return out}
async function loadUnifiedCatalog(){
 const [runtime,controls,labels,images]=await Promise.all([FKCatalogData.loadCompiled(THREE),import('./preview-controls.mjs'),import('./preview-config.mjs'),import('./preview-images.mjs')]);
 controlTools=controls.createPreviewControls({en:{...labels.TEXT.en,powered:'Power',powered_off:'Off',powered_on:'On'},ru:{...labels.TEXT.ru,powered:'Сигнал',powered_off:'Нет',powered_on:'Есть'}});
 reader=images.createImageSource(FKCatalog.loadAny,data=>new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>fail(new Error('Saved PNG decode failed'));im.src=data}));
 unified=runtime;catalog=runtime.catalog;catalogReady('compiled');
}
function readCompiled(path){return reader(path,files[path]?{[path]:files[path].data}:{})}
function makeCanvas(){return document.createElement('canvas')}
async function previewCompiled(id,valid){
 if(!gl||!valid())return null;
 const next=selection.compiledSelection(unified,{id}),images=await selection.prepareEditorImages(next,readCompiled,makeCanvas,true);
 if(!valid())return null;
 return V.capture({plan:next.plan,canvases:Object.fromEntries(Object.entries(images).map(([path,value])=>[path,value.frames[0]]))},256);
}
async function selectCompiled(request,reopened){
 const token=++selTok;
 try{
  if(!API.busy)packCur();
  const next=selection.compiledSelection(unified,request),same=choice&&choice.plan.object.card===next.plan.object.card;
  if(reopened){files[reopened.key]=selection.mkFile(reopened.data,reopened.key);dirty[reopened.key]=true}
  API.pending=request.id;API.loading();endDrag();clearModel();
  const images=await selection.prepareEditorImages(next,readCompiled,makeCanvas);
  if(token!==selTok)return;
  if(!same)setupSlots([],{});
  for(const [path,value] of Object.entries(images)){
   if(next.editable.includes(path)){
    if(!fr[path]){fr[path]=value.frames;fi[path]=0;hs[path]=[];undoS[path]=[];redoS[path]=[];slots.push({id:path})}
    cv[path]=fr[path][fi[path]];
   }else cv[path]=value.frames[0];
  }
  choice=next;cur=next.sourceId;slot=next.plan.slot;shape=next.plan.model;resetView=!same;
  $('#shapes').innerHTML='';$('#shapesRow').style.display='none';
  const spec=controlTools.previewControlSpec(catalog,next.plan);stateUi.select('compiled:'+next.plan.object.card,spec.schema,spec.state);
  buildSlotUi();drawEd();build();S.info=selection.compiledInfo(unified,cur);API.loaded(cur);
 }catch(error){
  if(token!==selTok)return;
  try{clearModel()}catch(cleanup){error=new AggregateError([error,cleanup],'Editor cleanup failed')}
  choice=null;cur='';slot=null;slots=[];cv={};S.info=null;stateUi.select('',null);API.loaded('');
  showErr('block_load',request.id+': '+error.message);
 }
}
var API={
  edits:0,busy:false,want:null,block:'',pending:'',state:S,ctx:ctx,
  version:(function(){try{return parent.FK_V||'?'}catch(e){return '?'}})(),subscribe:function(f){listeners.push(f)},
  setMode:function(m){S.mode=m;document.body.classList.toggle('fk-search',m==='search');document.body.classList.toggle('fk-edit',m==='edit');try{scrollTo(0,0)}catch(e){}if(m==='edit')resizeStage();else{endDrag();cancelRender()}emit()},
  cur:function(){return cur},files:function(){return cur?familyFiles():[]},
  loading:function(){API.busy=true;loadingUi(true);emit()},
  loaded:function(m){API.busy=false;API.pending='';API.block=m;loadingUi(false);var w=API.want;API.want=null;if(w&&cv[w])setSlot(w);updHist();emit()},
  openTexture:function(path,data,preferredId){
    if(!catalog)return null;
    if(typeof path!=='string')return false;
    var key='textures/'+path;if(unified){var found=selection.compiledReopen(unified,key,preferredId);if(found.status!=='found')return false;var preferred=preferredId?unified.access.describe(preferredId):null,id=preferred?.id===found.object.id?preferredId:found.object.id;selectCompiled({id,slot:key}, {key,data});return id}var hit=null,candidates=Object.keys(catalog.b).filter(function(id){return selection.pathsFor(catalog,id).indexOf(key)>=0});
    if(preferredId!==undefined&&preferredId!==null&&preferredId!==''){
      if(typeof preferredId!=='string'||!Object.prototype.hasOwnProperty.call(catalog.b,preferredId))return false;
      if(candidates.indexOf(preferredId)>=0)hit=preferredId;
      else{var base=(catalog.familyOf&&catalog.familyOf[preferredId])||preferredId,relatives=candidates.filter(function(id){return ((catalog.familyOf&&catalog.familyOf[id])||id)===base});if(relatives.length===1)hit=relatives[0]}
    }else if(candidates.length===1)hit=candidates[0];
    if(!hit)return false;
    selectBlock(hit,{key:key,data:data});return hit;
  },
  stats:function(){return {frames:frames,webgl:gl,res:res,slots:slots.length}},
  grid:function(){return {catalog:catalog,files:files,dirty:dirty,shapes:FKShapes.SHAPES,load:FKCatalog.loadAny,select:selectBlock,edited:isEdited,preview:previewBlock,search:unified?q=>selection.compiledSearchIds(unified,q):null,
    discard:function(){if(unified)choice=null;slots.forEach(function(s){ph[s.id]=true})},
    obj:function(){return API.busy?{id:API.pending||null,paths:[]}:{id:unified?cur||null:(catalog.familyOf&&catalog.familyOf[cur])||cur||null,paths:cur?familyPaths(cur):[]}},
    setPack:function(map){if(!selection){queuedPack=map;return}if(unified)choice=null;Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k];delete decoded[k]}});Object.keys(map).forEach(function(k){if(!files[k]||files[k].data!==map[k]){files[k]=selection.mkFile(map[k],k);delete decoded[k]}dirty[k]=true})},
    shapeFor:function(id){if(unified){var o=unified.access.describe(id);return o?catalog.records[o.id].model:null}return selection.describe(catalog,id).shape}}}
};
ctx.el={ed:ed};ctx.res=function(){return res};ctx.setRes=setRes;ctx.ready=function(){return !API.busy&&!!cv[slot]};ctx.g=function(){return ctxOf(slot)};
ctx.pushUndo=pushUndo;ctx.undo=doUndo;ctx.redo=doRedo;ctx.touched=touched;ctx.syncHist=updHist;ctx.files=curFiles;ctx.say=say;
window.FKAPI=API;FK.apply(document);loadCatalog();
})();
