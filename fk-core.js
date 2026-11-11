/* Compiled catalog editor state shared with Find. No legacy catalog fallback. */
(function(){
var FK=window.FK,V=window.FKView;
function tt(k,p){return FK.t(k,p)}
var res=16,slots=[],slot=null,cv={},undoS={},redoS={},ph={},fr={},fi={},hs={},encoded={};
var files={},cur='',dirty={},catalog=null,queuedPack=null,rejected=Object.create(null);
var selection=null,unified=null,choice=null,controlTools=null,reader=null,resourceTools=null,iconTools=null,selTok=0;
var $=function(s){return document.querySelector(s)};
try{var PD=parent.document.documentElement;var syncTheme=function(){document.documentElement.setAttribute('data-theme',PD.getAttribute('data-theme')||'light')};syncTheme();new MutationObserver(syncTheme).observe(PD,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
var ed=$('#ed'),ectx=ed.getContext('2d'),listeners=[],stateUi=window.FKModelState.create($('#shapesRow'),function(){if(choice&&!API.busy)selectCompiled({id:cur,...controlTools.previewControlSelection(choice.plan,{...stateUi.value(),texture:slot})})},{preview:previewStateOption});
var S={mode:'search',status:'loading',source:'',count:0,filtered:true,refreshing:false,refreshFailed:'',error:null,errors:[],info:null,message:null},ctx={onHistory:null,onRes:null};
function emit(){listeners.forEach(function(f){try{f(S)}catch(e){}})}
function showErr(code,detail){var last=S.errors[S.errors.length-1];detail=detail||'';if(last&&last.code===code&&last.detail===detail)return;S.errors.push({code:code,detail:detail});if(S.errors.length>3)S.errors.shift();emit()}
window.addEventListener('error',function(e){showErr('script',(e.message||'')+(e.lineno?' @'+e.lineno:''))});
window.addEventListener('unhandledrejection',function(e){showErr('promise',(e.reason&&e.reason.message)||String(e.reason))});
function say(key,p){S.message=key?{key:key,params:p||{}}:null;$('#msg').textContent=key?tt(key,p):'';emit()}
function ctxOf(k){return cv[k].getContext('2d')}
var stage=$('#stage'),W=stage.clientWidth||360,gl=typeof THREE!=='undefined'&&!!V,view=null,group=null,frames=0,renderFrame=null,resetView=true;
var resourceInfo=document.createElement('div');resourceInfo.id='resourceInfo';resourceInfo.className='fk-edit-part';resourceInfo.hidden=true;stage.parentNode.insertBefore(resourceInfo,stage);
if(!gl)showErr('three_missing');
if(gl){try{view=V.createStage();group=view.group;V.mount(stage)}catch(err){gl=false;showErr('webgl_unavailable',err.message)}}
function requestRender(){if(!gl||S.mode!=='edit'||document.hidden||renderFrame!==null)return;renderFrame=requestAnimationFrame(function(){renderFrame=null;if(!gl||S.mode!=='edit'||document.hidden)return;if(!isFinite(group.rotation.x)||!isFinite(group.rotation.y))group.rotation.set(0,0,0);try{V.render(view,W,Math.min(devicePixelRatio,2));frames++}catch(err){showErr('render',err.message)}})}
function cancelRender(){if(renderFrame!==null){cancelAnimationFrame(renderFrame);renderFrame=null}}
function resizeStage(){if(!gl||S.mode!=='edit'||document.hidden)return;var w=stage.clientWidth;if(w)W=w;requestRender()}
function loadingUi(on){stateUi.busy(on);stage.setAttribute('aria-busy',String(on));['#resourceInfo','#ed','#slots','#shapesRow','#frames','#toolsPanel'].forEach(function(sel){var el=$(sel);el.inert=on;el.style.visibility=on?'hidden':''})}
function refreshTex(){if(gl&&view.instance)V.update(view,cv);requestRender()}
function rebuildTextures(){refreshTex()}
function clearModel(){if(view)V.clear(view)}
function isFlat(){return !!choice&&choice.plan.mode==='sprite'}
function build(){if(!gl)return;if(choice)V.build(view,{plan:choice.plan,canvases:cv},resetView);else clearModel();resetView=false;requestRender()}
var frameTimer=null,playbackGeneration=0,framePointer=null;
function stopPlayback(){playbackGeneration++;if(frameTimer!==null){clearTimeout(frameTimer);frameTimer=null}frameUi()}
function canPlay(){return !API.busy&&S.mode==='edit'&&!document.hidden&&framePointer===null&&!!choice&&!!fr[slot]&&fr[slot].length>1}
function startPlayback(){
 if(!canPlay()||frameTimer!==null)return;
 var generation=++playbackGeneration,id=slot,selected=choice;
 function tick(){
  if(generation!==playbackGeneration)return;
  if(!canPlay()||slot!==id||choice!==selected){stopPlayback();return}
  try{setFrame((fi[id]+1)%fr[id].length)}catch(error){stopPlayback();showErr('render',error.message);return}
  if(generation===playbackGeneration){frameTimer=setTimeout(tick,1000)}
 }
 frameTimer=setTimeout(tick,1000);frameUi();
}
var framePlay=document.createElement('button');framePlay.type='button';framePlay.id='fPlay';$('#frames').insertBefore(framePlay,$('#fNext'));
framePlay.onclick=function(){if(frameTimer!==null)stopPlayback();else startPlayback()};
ed.addEventListener('pointerdown',function(e){if(API.busy||S.mode!=='edit'||framePointer!==null)return;framePointer=e.pointerId;stopPlayback()});
function releaseFramePointer(e){if(e&&e.pointerId!==framePointer)return;framePointer=null;frameUi()}
ed.addEventListener('lostpointercapture',releaseFramePointer);
window.addEventListener('pointerup',releaseFramePointer);window.addEventListener('pointercancel',releaseFramePointer);
window.addEventListener('blur',function(){releaseFramePointer();stopPlayback()});
window.addEventListener('pagehide',stopPlayback);

var drag=null;
stage.addEventListener('pointerdown',function(e){if(!gl||API.busy||S.mode!=='edit'||isFlat()||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',function(e){if(!drag||drag.id!==e.pointerId||isFlat())return;group.rotation.y+=(e.clientX-drag.x)*.01;group.rotation.x=Math.max(-1.4,Math.min(1.4,group.rotation.x+(e.clientY-drag.y)*.01));drag.x=e.clientX;drag.y=e.clientY;requestRender()});
function endDrag(e){if(!e||drag&&drag.id===e.pointerId)drag=null}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
document.addEventListener('visibilitychange',function(){if(document.hidden){releaseFramePointer();stopPlayback();endDrag();cancelRender()}else resizeStage()});addEventListener('resize',resizeStage);
function clearResourceInfo(){resourceInfo.innerHTML='';resourceInfo.hidden=true}
function resetImages(){stopPlayback();clearModel();cv={};undoS={};redoS={};ph={};fr={};fi={};hs={};encoded={};slots=[];slot=null;resetView=true;$('#slots').innerHTML='';$('#slots').style.display='none';clearResourceInfo()}
function slotIconLabels(paths){
 var records=new Map();
 for(const path of paths)for(const owner of catalog.resources[path]??[]){
  if(owner.kind!=='block')continue;
  const object=unified.access.describe(owner.id);
  if(object&&object.card===choice.plan.object.card)records.set(owner.id,catalog.records[owner.id]);
 }
 return iconTools.iconLabelsForSet([...records.values()],paths);
}
function buildSlotUi(){
 var boxEl=$('#slots'),paths=choice?choice.plan.paths:[],groups=choice&&choice.resourceGroups,iconLabels=choice?slotIconLabels(paths):new Set();
 boxEl.innerHTML='';clearResourceInfo();
 if(choice)try{resourceTools.appendResourceUsage(resourceInfo,unified,choice,FK.lang());resourceInfo.hidden=!resourceInfo.hasChildNodes()}catch(error){clearResourceInfo();showErr('resource_info',error.message)}
 function appendSlot(target,id){
  var button=document.createElement('button'),name=document.createElement('span');button.type='button';name.className='fkResourceName';name.textContent=String(id).split('/').pop();button.appendChild(name);button.title=id;button.dataset.id=id;
  if(iconLabels.has(id)){var badge=document.createElement('span');badge.className='fkResourceIconBadge';badge.textContent='• icon';button.appendChild(badge);button.setAttribute('aria-label',name.textContent+' · icon')}
  button.setAttribute('aria-pressed',String(id===slot));if(id===slot)button.className='on';
  button.onclick=function(){setSlot(id)};target.appendChild(button);
 }
 if(groups)groups.forEach(function(resourceGroup){
  var details=document.createElement('details'),summary=document.createElement('summary'),content=document.createElement('div'),title=document.createElement('span'),value=document.createElement('span');
  details.dataset.group=resourceGroup.key;details.open=resourceGroup.paths.indexOf(slot)>=0;summary.className='fkResourceRow';content.className='seg';
  title.textContent=resourceGroup.label[FK.lang()==='ru'?1:0];value.className='fkStateValue';summary.appendChild(title);summary.appendChild(value);
  function caption(){value.textContent=resourceGroup.paths.length+' '+(details.open?'▾':'▸')}
  caption();details.addEventListener('toggle',caption);details.appendChild(summary);
  resourceGroup.paths.forEach(function(id){appendSlot(content,id)});details.appendChild(content);boxEl.appendChild(details);
 });else paths.forEach(function(id){appendSlot(boxEl,id)});
 boxEl.style.display=paths.length?'flex':'none';frameUi();
}
function setSlot(id){if(choice&&!API.busy)selectCompiled({id:cur,slot:id,form:choice.plan.forms?choice.plan.object.form:undefined,state:choice.plan.state})}
function frameUi(){
 var f=fr[slot],n=f?f.length:0,playing=frameTimer!==null;
 $('#frames').style.display=n>1?'flex':'none';
 if(n>1)$('#fNum').textContent=(fi[slot]+1)+' / '+n;
 framePlay.disabled=!canPlay();if(framePlay.getAttribute('aria-pressed')===String(playing))return;framePlay.setAttribute('aria-pressed',String(playing));
 var label=FK.lang()==='ru'?(playing?'Пауза':'Воспроизвести'):(playing?'Pause':'Play');
 framePlay.title=label;framePlay.setAttribute('aria-label',label);
 framePlay.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">'+(playing?'<path d="M8 5v14M16 5v14"/>':'<path d="m8 5 11 7-11 7Z"/>')+'</svg>';
}
function setFrame(k){if(API.busy)return;var id=slot,f=fr[id];if(!f||k<0||k>=f.length||k===fi[id])return;hs[id][fi[id]]={u:undoS[id],r:redoS[id]};fi[id]=k;cv[id]=f[k];var h=hs[id][k]||{u:[],r:[]};undoS[id]=h.u;redoS[id]=h.r;refreshTex(id);drawEd();frameUi()}
$('#fPrev').onclick=function(){stopPlayback();setFrame(fi[slot]-1)};$('#fNext').onclick=function(){stopPlayback();setFrame(fi[slot]+1)};
function snap(k){var c=cv[k];return ctxOf(k).getImageData(0,0,c.width,c.height)}
function pushUndo(){stopPlayback();var s=undoS[slot];s.push(snap(slot));if(s.length>60)s.shift();redoS[slot]=[];updHist()}
function doUndo(){if(API.busy)return;stopPlayback();var s=undoS[slot];if(!s||!s.length)return;redoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function doRedo(){if(API.busy)return;stopPlayback();var s=redoS[slot];if(!s||!s.length)return;undoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function updHist(){if(ctx.onHistory)ctx.onHistory(!!(undoS[slot]&&undoS[slot].length),!!(redoS[slot]&&redoS[slot].length))}
function resetHist(){slots.forEach(function(s){undoS[s.id]=[];redoS[s.id]=[];hs[s.id]=[]});updHist()}
function drawEd(){var c=cv[slot],w=c?c.width:16,h=c?c.height:16;res=w;ed.width=w;ed.height=h;ed.style.aspectRatio=w+' / '+h;ed.style.backgroundSize=(200/w)+'% '+(200/h)+'%';ectx.clearRect(0,0,w,h);if(c)ectx.drawImage(c,0,0);if(ctx.onRes)ctx.onRes(res);updHist()}
function touched(){dirty[slot]=true;delete ph[slot];delete encoded[slot];API.edits++;refreshTex(slot);drawEd()}
function setRes(n){if(API.busy||n===res||[16,32,64].indexOf(n)<0)return;stopPlayback();var old={};slots.forEach(function(s){old[s.id]=fr[s.id].map(function(f){var c=document.createElement('canvas');c.width=f.width;c.height=f.height;c.getContext('2d').drawImage(f,0,0);return c})});res=n;slots.forEach(function(s){fr[s.id].forEach(function(f,k){var src=old[s.id][k];f.width=n;f.height=Math.max(1,Math.round(src.height*n/src.width));var g=f.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,0,0,f.width,f.height)})});resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[s.id]=true;delete ph[s.id];delete encoded[s.id]});API.edits++}
function packCur(onlyDirty){slots.forEach(function(s){if(ph[s.id]||!cv[s.id]||(onlyDirty&&!dirty[s.id])||(encoded[s.id]&&files[s.id]))return;var fs=fr[s.id],n=fs.length,w=fs[0].width,h=fs[0].height,d;if(n>1){var c=document.createElement('canvas');c.width=w;c.height=h*n;var g=c.getContext('2d');fs.forEach(function(f,k){g.drawImage(f,0,k*h)});d=c.toDataURL('image/png')}else d=fs[0].toDataURL('image/png');files[s.id]={res:w,data:d,frames:n,aspect:h/w};encoded[s.id]=true})}
function familyPaths(id){return selection.compiledFamilyPaths(unified,id)}
function isEdited(id){return familyPaths(id).some(function(p){return dirty[p]})}
function familyFiles(){packCur(true);return familyPaths(cur).filter(function(p){return dirty[p]&&files[p]}).map(function(p){return {path:p+'.png',data:files[p].data}})}
function curFiles(){packCur();var out=[],seen={};slots.forEach(function(s){var f=files[s.id];if(!f)return;var p=s.id;if(!seen[p]){seen[p]=1;out.push({path:p+'.png',data:f.data})}});return out}
function readCompiled(path){if(Object.hasOwn(rejected,path))return Promise.reject(rejected[path]);return reader(path,files[path]?{[path]:files[path].data}:{})}
function makeCanvas(){return document.createElement('canvas')}
function previewStateOption(field,option){
 if(!choice||choice.plan.model!=='banner'||choice.plan.state.ominous||!/^banner_pattern_\d+$/.test(field.key))return null;
 var selected=choice,record=catalog.records[selected.plan.object.id],source=record&&record.source;
 if(!source||source.template!=='banner'||!source.patterns||!Array.isArray(record.paths))return null;
 var path=source.patterns[option.value];
 if(!path||!record.paths.includes(path)||!record.paths.includes(source.base))return null;
 return async function(){
  var edits=API.edits;
  function valid(){return choice===selected&&!API.busy&&API.edits===edits&&S.mode==='edit'&&!document.hidden}
  if(!valid())return null;
  function sourceCanvas(path){
   if(cv[path])return Promise.resolve(cv[path]);
   return readCompiled(path).then(function(image){var canvas=makeCanvas();selection.drawFrame(canvas,image,0,path);return canvas});
  }
  const [base,pattern,tools]=await Promise.all([sourceCanvas(source.base),sourceCanvas(path),import('./catalog/banner-preview.mjs')]);
  if(!valid())return null;
  const rendered=tools.composeBannerCanvases({base:source.base,color:'white',layers:[{path,color:'black'}]},{[source.base]:base,[path]:pattern},makeCanvas)[source.base];
  const thumbnail=makeCanvas();thumbnail.width=20;thumbnail.height=40;
  const context=thumbnail.getContext('2d');context.imageSmoothingEnabled=false;
  context.drawImage(rendered,rendered.width/64,rendered.height/64,rendered.width*20/64,rendered.height*40/64,0,0,20,40);
  return thumbnail;
 };
}
async function previewCompiled(id,valid){
 if(!gl||!valid())return null;
 const next=selection.compiledSelection(unified,{id}),images=await selection.prepareEditorImages(next,readCompiled,makeCanvas,true);
 if(!valid())return null;
 return V.capture({plan:next.plan,canvases:Object.fromEntries(Object.entries(images).map(([path,value])=>[path,value.frames[0]]))},256);
}
function cancelCompiled(){stopPlayback();selTok++;choice=null;clearResourceInfo();API.busy=false;API.pending='';loadingUi(false)}
async function selectCompiled(request,reopened){
 stopPlayback();
 const token=++selTok;
 try{
  const next=selection.compiledSelection(unified,request),same=!reopened&&choice&&choice.plan.object.card===next.plan.object.card;
  if(!API.busy&&!same)packCur(true);
  if(reopened){files[reopened.key]=selection.mkFile(reopened.data,reopened.key);delete rejected[reopened.key];dirty[reopened.key]=true}
  API.pending=request.id;API.loading();endDrag();
  const required=same?next.required.filter(path=>!next.editable.includes(path)||!fr[path]):next.required;
  const images=await selection.prepareEditorImages({...next,required},readCompiled,makeCanvas);
  if(token!==selTok)return;
  if(!same)resetImages();
  for(const [path,value] of Object.entries(images)){
   if(next.editable.includes(path)){
    if(!fr[path]){fr[path]=value.frames;fi[path]=0;hs[path]=[];undoS[path]=[];redoS[path]=[];encoded[path]=!!files[path];slots.push({id:path})}
    cv[path]=fr[path][fi[path]];
   }else cv[path]=value.frames[0];
  }
  choice=next;cur=next.sourceId;slot=next.plan.slot;resetView=!same;
  $('#shapes').innerHTML='';$('#shapesRow').style.display='none';
  const spec=controlTools.previewControlSpec(catalog,next.plan);stateUi.select('compiled:'+next.plan.object.card,spec.schema,spec.state);
  buildSlotUi();drawEd();build();S.info=selection.compiledInfo(unified,cur);API.loaded(cur);
 }catch(error){
  if(token!==selTok)return;
  try{clearModel()}catch(cleanup){error=new AggregateError([error,cleanup],'Editor cleanup failed')}
  choice=null;cur='';slot=null;slots=[];cv={};S.info=null;buildSlotUi();stateUi.select('',null);API.loaded('');
  showErr('block_load',request.id+': '+error.message);
 }
}
function setPack(map){
 if(!selection){queuedPack=map;return}
 cancelCompiled();resetImages();rejected=Object.create(null);
 Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k]}});
 Object.keys(map).forEach(function(k){
  try{if(!files[k]||files[k].data!==map[k])files[k]=selection.mkFile(map[k],k);dirty[k]=true}
  catch(error){delete files[k];delete dirty[k];rejected[k]=error}
 });
 var bad=Object.keys(rejected);
 if(bad.length)showErr('block_load',bad.length+' saved texture(s) rejected; first: '+bad[0]+': '+rejected[bad[0]].message);
}
async function loadCatalog(){
 try{
  const [selected,runtime,controls,labels,images,resources,icons]=await Promise.all([import('./catalog/editor-selection.mjs'),FKCatalogData.loadCompiled(THREE),import('./preview-controls.mjs'),import('./preview-config.mjs'),import('./preview-images.mjs'),import('./catalog/editor-resource-usage.mjs'),import('./catalog/rules/icons.mjs')]);
  selection=selected;unified=runtime;resourceTools=resources;iconTools=icons;
  controlTools=controls.createPreviewControls({en:{...labels.TEXT.en,powered:'Power',powered_off:'Off',powered_on:'On'},ru:{...labels.TEXT.ru,powered:'Сигнал',powered_off:'Нет',powered_on:'Есть'}});
  reader=images.createImageSource(FKCatalog.loadAny,data=>new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>fail(new Error('Saved PNG decode failed'));im.src=data}));
  if(queuedPack){setPack(queuedPack);queuedPack=null}
  catalog=runtime.catalog;S.status='ready';S.source='compiled';S.count=catalog.cards.length;S.error=null;emit();
 }catch(error){S.status='failed';S.error={code:'catalog_fetch',detail:error.message};emit()}
}
var API={
 edits:0,busy:false,want:null,block:'',pending:'',state:S,ctx:ctx,
 version:(function(){try{return parent.FK_V||'?'}catch(e){return '?'}})(),subscribe:function(f){listeners.push(f)},
 setMode:function(m){S.mode=m;document.body.classList.toggle('fk-search',m==='search');document.body.classList.toggle('fk-edit',m==='edit');try{scrollTo(0,0)}catch(e){}if(m==='edit')resizeStage();else{stopPlayback();endDrag();cancelRender()}emit()},
 cur:function(){return cur},files:function(){return cur?familyFiles():[]},
 loading:function(){API.busy=true;stopPlayback();loadingUi(true);emit()},
 loaded:function(m){API.busy=false;API.pending='';API.block=m;loadingUi(false);var w=API.want;API.want=null;if(w&&cv[w])setSlot(w);frameUi();updHist();emit()},
 openTexture:function(path,data,preferredId){
  if(!catalog)return null;if(typeof path!=='string')return false;
  var key='textures/'+path,found=selection.compiledReopen(unified,key,preferredId);
  if(found.status!=='found')return false;
  var preferred=preferredId?unified.access.describe(preferredId):null,id=preferred?.id===found.object.id?preferredId:found.object.id;
  selectCompiled({id,slot:key},{key,data});return id;
 },
 diagnostics:function(){return {rejected:Object.keys(rejected).map(function(path){return {path:path,error:rejected[path].message}})}},
 stats:function(){return {frames:frames,webgl:gl,res:res,slots:slots.length}},
 grid:function(){return {catalog:catalog,files:files,dirty:dirty,load:FKCatalog.loadAny,select:function(id){return selectCompiled({id})},edited:isEdited,preview:previewCompiled,search:unified?q=>selection.compiledSearchIds(unified,q):null,
  discard:function(){cancelCompiled();slots.forEach(function(s){ph[s.id]=true})},
  obj:function(){return API.busy?{id:API.pending||null,paths:[]}:{id:cur||null,paths:cur?familyPaths(cur):[]}},
  setPack:setPack,
  shapeFor:function(id){var o=unified.access.describe(id);return o?catalog.records[o.id].model:null}}}
};
$('#catfile').disabled=true;
ctx.el={ed:ed};ctx.res=function(){return res};ctx.setRes=setRes;ctx.ready=function(){return !API.busy&&!!cv[slot]};ctx.g=function(){return ctxOf(slot)};
ctx.pushUndo=pushUndo;ctx.undo=doUndo;ctx.redo=doRedo;ctx.touched=touched;ctx.syncHist=updHist;ctx.files=curFiles;ctx.say=say;
window.FKAPI=API;FK.apply(document);loadCatalog();
})();
