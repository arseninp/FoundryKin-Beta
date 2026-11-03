/* Read-only entry point for an explicit block slice. Uses the production compiler and preview path. */
import {compileModelCatalog} from './models/library.mjs';
import {createPreviewResolver} from './catalog/preview.mjs';
export const REVIEW_IDS=Object.freeze(['pumpkin','carved_pumpkin','lit_pumpkin','pumpkin_stem','melon_block','melon_stem','budding_amethyst','small_amethyst_bud','medium_amethyst_bud','large_amethyst_bud','amethyst_cluster','seagrass','mangrove_propagule','kelp','closed_eyeblossom','open_eyeblossom','firefly_bush',...['','exposed_','weathered_','oxidized_'].map(prefix=>prefix+'copper_golem_statue'),'skeleton_skull','wither_skeleton_skull','creeper_head','zombie_head','piglin_head']);
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function compileReview(input,Three) {
 if(!dictionary(input)||!dictionary(input.blocks))throw new Error('Missing pinned catalog data');
 const blocks=Object.fromEntries(REVIEW_IDS.map(id=>{
  if(!own(input.blocks,id))throw new Error('Missing review source ID: '+id);
  return [id,input.blocks[id]];
 }));
 return compileModelCatalog({...input,blocks},Three);
}
export function resourcePaths(plan) {
 const maps=plan.parts?Object.values(plan.parts).map(part=>part.bindings):[plan.mode==='sprite'?{sprite:plan.slot}:plan.bindings];
 return [...new Set(maps.flatMap(map=>Object.values(map)))];
}
export function activePack(storage) {
 const raw=storage.getItem('fk070_packs');if(!raw)throw new Error('No saved packs');
 const data=JSON.parse(raw),pack=data?.packs?.find(pack=>pack.id===data.active);
 if(!pack||!Array.isArray(pack.textures))throw new Error('No active pack');
 const textures=Object.create(null);
 for(const row of pack.textures) {
  if(!row.data)continue;
  if(typeof row.path!=='string'||typeof row.data!=='string'||!row.data.startsWith('data:image/png;base64,'))throw new Error('Invalid saved PNG');
  const path='textures/'+row.path.replace(/\.png$/i,'');
  if(own(textures,path)&&textures[path]!==row.data)throw new Error('Ambiguous saved texture: '+path);
  textures[path]=row.data;
 }
 return textures;
}
export function imageFrames(image) {
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width>16384||height>16384||width*height>16777216)throw new Error('Image exceeds review limits');
 return {width,height,count:height>width&&height%width===0?height/width:1};
}
export function frameCanvas(image,index,makeCanvas) {
 const {width,height,count}=imageFrames(image);
 if(!Number.isInteger(index)||index<0||index>=count)throw new Error('Invalid source frame');
 const canvas=makeCanvas();canvas.width=width;canvas.height=count>1?width:height;
 const context=canvas.getContext('2d');if(!context)throw new Error('Canvas 2D is unavailable');
 context.imageSmoothingEnabled=false;context.drawImage(image,0,count>1?index*width:0,width,canvas.height,0,0,width,canvas.height);
 return canvas;
}
export function createImageSource(loadVanilla,decodePNG,options={}) {
 if(typeof loadVanilla!=='function'||typeof decodePNG!=='function'||!dictionary(options))throw new Error('Invalid image source configuration');
 const timeoutMs=options.timeoutMs??20000,maxEntries=options.maxEntries??32,maxPixels=options.maxPixels??16777216;
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>2147483647||!Number.isSafeInteger(maxEntries)||maxEntries<1||!Number.isSafeInteger(maxPixels)||maxPixels<1)throw new Error('Invalid image source limits');
 const cache=new Map();let pixels=0;
 function remove(path) {
  const item=cache.get(path);if(!item)return;
  cache.delete(path);pixels-=item.pixels;
 }
 function trim() {
  while(cache.size>maxEntries||pixels>maxPixels)remove(cache.keys().next().value);
 }
 return function(path,overrides) {
  if(typeof path!=='string'||!path.startsWith('textures/')||path.split('/').some(part=>!part||part==='.'||part==='..'))return Promise.reject(new Error('Invalid resource path'));
  if(!dictionary(overrides))return Promise.reject(new Error('Invalid texture overrides'));
  const data=own(overrides,path)?overrides[path]:null,hit=cache.get(path);
  if(hit&&hit.data===data){cache.delete(path);cache.set(path,hit);return hit.promise;}
  remove(path);
  const item={data,promise:null,pixels:0};let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Image load timeout: '+path)),timeoutMs);});
  const operation=Promise.resolve().then(()=>data===null?loadVanilla(path):decodePNG(data));
  item.promise=Promise.race([operation,deadline]).then(image=>{
   if(!image)throw new Error('Missing texture: '+path);
   const dimensions=imageFrames(image);
   if(cache.get(path)===item){item.pixels=dimensions.width*dimensions.height;pixels+=item.pixels;trim();}
   return image;
  }).catch(error=>{if(cache.get(path)===item)remove(path);throw error;}).finally(()=>clearTimeout(timer));
  cache.set(path,item);trim();return item.promise;
 };
}
const TEXT={
 en:{back:'Editor',language:'Language',title:'New model preview',scope:'Explicit review slice: {count} source block IDs, not the full catalog or an editor release. Nothing is written to your packs.',scopeDetails:'Included source IDs',object:'Object',source:'Open source ID',open:'Open',textures:'Texture source',vanilla:'Pinned vanilla',pack:'Active pack (read only)',reload:'Reload',hint:'Drag to rotate. Manual source frames only: no playback or Bedrock animation timing. Kelp remains a static candidate. Statue poses are static.',resources:'Model resources',loading:'Loading',ready:'Displayed',failed:'Could not display',frame:'Source frame',stem:'Stem',stage:'Stem stage',facing:'Stem direction',variant:'Variant',crystals:'Crystal',growth:'Growth',face:'Block face',tall:'Tall form',hanging:'Hanging',age:'Age',off:'Without',on:'With',plain:'Plain',carved:'Carved',lit:'Lit',small:'Small',medium:'Medium',large:'Large',cluster:'Cluster',up:'Up',down:'Down',north:'North',south:'South',east:'East',west:'West',bloom:'Display',bloom_closed:'Closed',bloom_open:'Open',eyeblossom:'Eye blossom',done:'Done',pose:'Pose',standing:'Standing',sitting:'Sitting',running:'Running',star:'Star',card_copper_golem:'Copper golem',card_exposed_copper_golem:'Exposed copper golem',card_weathered_copper_golem:'Weathered copper golem',card_oxidized_copper_golem:'Oxidized copper golem',card_skeleton:'Skeleton',card_wither_skeleton:'Wither skeleton',card_creeper:'Creeper',card_zombie:'Zombie',card_piglin:'Piglin',form:'Representation',form_native:'Main form',form_head:'Head',form_skull:'Skull',form_statue:'Statue',form_shoot:'Shoot',form_crop:'Crop',form_stem:'Stem'},
 ru:{back:'Редактор',language:'Язык',title:'Новый просмотр моделей',scope:'Явный срез: {count} исходных ID блоков, не полный каталог и не выпуск редактора. В паки ничего не записывается.',scopeDetails:'Исходные ID в этом срезе',object:'Объект',source:'Открыть исходный ID',open:'Открыть',textures:'Источник текстур',vanilla:'Закреплённая ваниль',pack:'Активный пак (только чтение)',reload:'Обновить',hint:'Потяни для вращения. Кадры выбираются вручную: плеера и игрового тайминга ещё нет. Kelp остаётся статическим кандидатом. Позы статуи статичные.',resources:'Ресурсы модели',loading:'Загрузка',ready:'Показан',failed:'Не удалось показать',frame:'Кадр исходника',stem:'Стебель',stage:'Стадия стебля',facing:'Направление стебля',variant:'Вариант',crystals:'Нарост',growth:'Рост',face:'Грань блока',tall:'Высокая форма',hanging:'Висячий',age:'Возраст',off:'Без',on:'Со',plain:'Обычная',carved:'Вырезанная',lit:'Светящаяся',small:'Малый',medium:'Средний',large:'Большой',cluster:'Кластер',up:'Верх',down:'Низ',north:'Север',south:'Юг',east:'Восток',west:'Запад',bloom:'Отображение',bloom_closed:'Закрытый',bloom_open:'Открытый',eyeblossom:'Глазоцвет',done:'Готово',pose:'Поза',standing:'Стоит',sitting:'Сидит',running:'Бежит',star:'Звезда',card_copper_golem:'Медный голем',card_exposed_copper_golem:'Потемневший медный голем',card_weathered_copper_golem:'Состарившийся медный голем',card_oxidized_copper_golem:'Окисленный медный голем',card_skeleton:'Скелет',card_wither_skeleton:'Скелет-иссушитель',card_creeper:'Крипер',card_zombie:'Зомби',card_piglin:'Пиглин',form:'Представление',form_native:'Основная форма',form_head:'Голова',form_skull:'Череп',form_statue:'Статуя',form_shoot:'Росток',form_crop:'Посев',form_stem:'Стебель'}
};
const bool=[['off',false],['on',true]],directions=['north','south','east','west'].map(key=>[key,key]);
const numbers=n=>Array.from({length:n},(_,index)=>[String(index),index]);
const fruit=[['stem',bool,false],['facing',directions,'west'],['stage',numbers(8),7]];
const growth=['small','medium','large','cluster'].map(key=>[key,key]);
const FIELDS={pumpkin:fruit,melon_block:fruit,budding_amethyst:[['crystals',bool,false],['growth',growth,'cluster'],['face',[...directions,['up','up'],['down','down']],'up']],seagrass:[['tall',bool,false],['variant',[['A','a'],['B','b']],'a']],mangrove_propagule:[['hanging',bool,false],['age',numbers(5),0]]};
const MODEL_FIELDS={copper_golem_statue:[['pose',['standing','sitting','running','star'].map(key=>[key,key]),'standing']]};
export function previewFields(catalog,plan) {
 const route=catalog.stateRoutes?.[plan.object.id],group=route?catalog.stateGroups?.[route.card]:null;
 const fields=[...(FIELDS[plan.object.card]??[]),...(MODEL_FIELDS[plan.model]??[])];
 if(!group)return fields.map(([key,options,fallback])=>[key,options.map(option=>[...option]),fallback]);
 return [[group.parameter,Object.keys(group.variants).map(value=>[value,value]),group.default],...fields.filter(([key])=>key!==group.parameter).map(([key,options,fallback])=>[key,options.map(option=>[...option]),fallback])];
}
export function previewControlSpec(catalog,plan) {
 const fields=previewFields(catalog,plan),label=(key,fallback=key)=>['en','ru'].map(lang=>TEXT[lang][key]??TEXT[lang][fallback]??fallback);
 const schema=fields.map(([key,options])=>({key,label:label(key),values:options.map(([name,value])=>({value,label:label(key+'_'+name,name)}))}));
 const state=Object.fromEntries(fields.map(([key,,fallback])=>[key,plan.state[key]??fallback]));
 if(plan.forms) {
  if(!dictionary(plan.forms)||!own(plan.forms,plan.object.form)||schema.some(item=>item.key==='form'))throw new Error('Invalid preview form controls');
  schema.unshift({key:'form',label:label('form'),values:Object.keys(plan.forms).map(value=>({value,label:label('form_'+value,value)}))});
  state.form=plan.object.form;
 }
 return {schema:schema.length?schema:null,state};
}
export async function startPreview() {
 const Three=globalThis.THREE,$=id=>document.getElementById(id),stage=$('stage'),status=$('status');
 let lang=navigator.language.toLowerCase().startsWith('ru')?'ru':'en';
 const t=key=>(TEXT[lang][key]??key).replace('{count}',String(REVIEW_IDS.length)),makeCanvas=()=>document.createElement('canvas');
 const cardText=card=>TEXT[lang]['card_'+card]??(card==='closed_eyeblossom'?t('eyeblossom'):card);
 let renderer,current=null,resolve,catalog,id='',form,slot,state={},generation=0,busy=false,disposed=false,frame=null,drag=null,controlPlan=null,lost=false;
 let notice={key:'loading',detail:'',error:false};
 const frames=new Map(),readImage=createImageSource(path=>globalThis.FKCatalog.loadAny(path),data=>new Promise((ok,fail)=>{
  const image=new Image();image.onload=()=>ok(image);image.onerror=()=>fail(new Error('Saved PNG decode failed'));image.src=data;
 }));
 function message(key,detail='',error=false){notice={key,detail,error};status.className=error?'error':'';status.textContent=t(key)+(detail?' — '+detail:'');}
 function strings(){document.documentElement.lang=lang;document.querySelectorAll('[data-text]').forEach(el=>el.textContent=t(el.dataset.text));for(const option of $('object').options)option.textContent=cardText(option.value);}
 $('language').value=lang;strings();$('scopeList').textContent=REVIEW_IDS.join(', ');
 function render() {
  if(disposed||lost||!renderer||document.hidden||frame!==null)return;
  frame=requestAnimationFrame(()=>{
   frame=null;if(disposed||lost||document.hidden)return;
   const width=Math.max(1,stage.clientWidth);renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2));renderer.setSize(width,width,false);
   try{renderer.render(scene,camera);}catch(error){message('failed',error.message,true);}
  });
 }
 if(!Three)throw new Error('Three.js did not load');
 if(!globalThis.FKM||!globalThis.FKModelState)throw new Error('Shared state picker did not load');
 const scene=new Three.Scene(),camera=new Three.OrthographicCamera(-1,1,1,-1,.1,100),turn=new Three.Group();
 camera.position.set(0,0,10);camera.lookAt(0,0,0);scene.add(turn);scene.add(new Three.AmbientLight(0xffffff,.75));
 const light=new Three.DirectionalLight(0xffffff,.55);light.position.set(2,4,3);scene.add(light);
 renderer=new Three.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0,0);stage.appendChild(renderer.domElement);
 const stateUi=globalThis.FKModelState.create($('controls'),()=>{
  if(busy||disposed||lost||!controlPlan)return;
  const {form:nextForm,...nextState}=stateUi.value();
  form=nextForm;slot=controlPlan.slot;state={...controlPlan.state,...nextState};show();
 },{language:()=>lang,doneLabel:()=>t('done'),manager:()=>globalThis.FKM});
 function controls(plan) {
  const spec=previewControlSpec(catalog,plan);controlPlan=plan;
  stateUi.select(plan.object.card,spec.schema,spec.state);stateUi.busy(busy||lost);
 }
 function resources(snapshot) {
  $('resources').replaceChildren();
  for(const path of snapshot.paths) {
   const row=document.createElement('div'),body=document.createElement('div'),code=document.createElement('code'),info=document.createElement('small');row.className='resource';
   const canvas=snapshot.canvases[path];code.textContent=path;const image=snapshot.images[path],dims=imageFrames(image);info.textContent=dims.width+' × '+dims.height;
   body.append(code,info);row.append(canvas,body);
   if(dims.count>1) {
    const label=document.createElement('label'),text=document.createElement('span'),slider=document.createElement('input');slider.type='range';slider.min='0';slider.max=String(dims.count-1);slider.value=String(frames.get(path)??0);
    const caption=()=>{text.textContent=t('frame')+' '+(Number(slider.value)+1)+' / '+dims.count;};caption();label.append(text,slider);body.appendChild(label);
    slider.addEventListener('input',()=>{
     if(current!==snapshot||busy)return;
     try {
      const index=Number(slider.value),next=frameCanvas(image,index,makeCanvas),canvases={...snapshot.canvases,[path]:next};snapshot.instance.update(canvases);
      canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);canvas.getContext('2d').drawImage(next,0,0);snapshot.canvases[path]=canvas;frames.set(path,index);caption();render();
     }catch(error){message('failed',error.message,true);}
    });
   }
   $('resources').appendChild(row);
  }
 }
 async function show() {
  if(!resolve||disposed)return;if(lost){message('failed','WebGL context lost',true);return;}
  const token=++generation;busy=true;stateUi.busy(true);drag=null;stage.setAttribute('aria-busy','true');renderer.domElement.style.visibility='hidden';controlPlan=null;$('resources').replaceChildren();message('loading',id);
  let next;
  try {
   const plan=resolve({id,form,slot,state:{...state}}),paths=resourcePaths(plan),overrides=$('textureSource').value==='pack'?activePack(localStorage):{};
   controls(plan);const loaded=await Promise.all(paths.map(path=>readImage(path,overrides)));
   if(token!==generation||disposed)return;
   const images=Object.fromEntries(paths.map((path,index)=>[path,loaded[index]])),canvases=Object.fromEntries(paths.map(path=>[path,frameCanvas(images[path],frames.get(path)??0,makeCanvas)]));
   next=plan.instantiateCanvases({group:new Three.Group()},canvases);
   const bounds=new Three.Box3().setFromObject(next.group);if(bounds.isEmpty())throw new Error('Empty model geometry');
   next.group.position.sub(bounds.getCenter(new Three.Vector3()));const extent=Math.max(.1,bounds.getSize(new Three.Vector3()).length()/2*1.15);
   if(token!==generation||disposed){next.dispose();next=null;return;}
   const previous=current;current={plan,paths,images,canvases,instance:next};next=null;turn.add(current.instance.group);
   form=plan.forms?plan.object.form:undefined;slot=plan.slot;state={...plan.state};
   turn.rotation.set(plan.mode==='sprite'?0:.6155,plan.mode==='sprite'?0:-Math.PI/4,0);
   camera.left=camera.bottom=-extent;camera.right=camera.top=extent;camera.updateProjectionMatrix();
   let cleanup='';try{previous?.instance.dispose();}catch(error){cleanup='; '+error.message;}
   $('object').value=plan.object.card;renderer.domElement.style.visibility='';resources(current);message('ready',plan.object.id+cleanup);render();
  }catch(error){
   try{next?.dispose();}catch(cleanupError){error=new AggregateError([error,cleanupError],'Preview cleanup failed');}
   if(token===generation&&!disposed)message('failed',error.message,true);
  }finally{if(token===generation&&!disposed){busy=false;stage.setAttribute('aria-busy','false');stateUi.busy(lost);}}
 }
 function choose(value){id=value;form=undefined;slot=undefined;state={};frames.clear();$('source').value=id;show();}
 $('object').addEventListener('change',()=>choose($('object').value));
 $('sourceForm').addEventListener('submit',event=>{event.preventDefault();choose($('source').value.trim());});
 $('textureSource').addEventListener('change',()=>{frames.clear();show();});$('reload').addEventListener('click',()=>{if(resolve)show();else location.reload();});
 $('language').addEventListener('change',()=>{lang=$('language').value;strings();if(controlPlan)controls(controlPlan);if(current&&!busy&&renderer.domElement.style.visibility!=='hidden')resources(current);message(notice.key,notice.detail,notice.error);});
 stage.addEventListener('pointerdown',event=>{if(busy||!current||current.plan.mode==='sprite'||drag)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};stage.setPointerCapture(event.pointerId);});
 stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;turn.rotation.y+=(event.clientX-drag.x)*.01;turn.rotation.x=Math.max(-1.4,Math.min(1.4,turn.rotation.x+(event.clientY-drag.y)*.01));drag.x=event.clientX;drag.y=event.clientY;render();});
 const end=event=>{if(drag?.id===event.pointerId)drag=null;};['pointerup','pointercancel','lostpointercapture'].forEach(name=>stage.addEventListener(name,end));
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();generation++;lost=true;busy=false;stateUi.busy(true);drag=null;stage.setAttribute('aria-busy','false');if(frame!==null){cancelAnimationFrame(frame);frame=null;}renderer.domElement.style.visibility='hidden';message('failed','WebGL context lost',true);});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;show();});
 const resize=new ResizeObserver(render);resize.observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){drag=null;if(frame!==null){cancelAnimationFrame(frame);frame=null;}}else render();});
 window.addEventListener('pageshow',event=>{if(event.persisted)render();});
 window.addEventListener('storage',event=>{if(event.key==='fk070_packs'&&$('textureSource').value==='pack'){frames.clear();show();}});
 window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;generation++;resize.disconnect();if(frame!==null)cancelAnimationFrame(frame);try{stateUi.dispose();}finally{try{current?.instance.dispose();}finally{renderer.dispose();}}});
 try {
  const input=await globalThis.FKCatalogData.load();if(disposed)return;
  const compiled=compileReview(input,Three);catalog=compiled.catalog;resolve=createPreviewResolver(catalog,compiled.registry,Three);
  for(const card of catalog.cards){const option=document.createElement('option');option.value=card;option.textContent=cardText(card);$('object').appendChild(option);}
  ['object','source','open','textureSource','reload'].forEach(key=>$(key).disabled=false);
  choose(new URL(location.href).searchParams.get('id')||'pumpkin');
 }catch(error){message('failed',error.message,true);stage.setAttribute('aria-busy','false');}
}
if(typeof document!=='undefined'&&document.getElementById('stage'))startPreview().catch(error=>{const status=document.getElementById('status');status.className='error';status.textContent=error.message;});
