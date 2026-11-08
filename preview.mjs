/* Read-only entry point for an explicit block slice. Uses the production compiler and preview path. */
import {compileModelCatalog} from './models/library.mjs';
import {createPreviewResolver} from './catalog/preview.mjs';
import {createPreviewControls} from './preview-controls.mjs';
import {activePack,imageFrames,frameCanvas,createImageSource} from './preview-images.mjs';
import {REVIEW_IDS as BASE_REVIEW_IDS,TEXT as BASE_TEXT} from './preview-config.mjs';
import {STONE_REVIEW_BLOCKS} from './preview-stone-data.mjs';
import {WOOD_REVIEW_BLOCKS} from './preview-wood-data.mjs';
import {LEAF_REVIEW_BLOCKS} from './preview-leaf-data.mjs';
const COPPER_STAGES=[['','',''],['exposed_','Exposed ','потемневшая'],['weathered_','Weathered ','состарившаяся'],['oxidized_','Oxidized ','окисленная']];
const COPPER_FORMS=[
 ['copper','Copper block','Медный блок'],
 ['chiseled_copper','Chiseled copper','Резной медный блок'],
 ['copper_grate','Copper grate','Медная решётка'],
 ['cut_copper','Cut copper','Резная медь'],
 ['cut_copper_slab','Cut copper slab','Плита из резной меди'],
 ['double_cut_copper_slab','Double cut copper slab','Двойная плита из резной меди'],
 ['cut_copper_stairs','Cut copper stairs','Ступени из резной меди']
];
const COPPER_REVIEW_BLOCKS=Object.freeze([false,true].flatMap(waxed=>COPPER_STAGES.flatMap(([prefix,enStage,ruStage])=>COPPER_FORMS.map(([form,en,ru])=>{
 const id=!waxed&&!prefix&&form==='copper'?'copper_block':(waxed?'waxed_':'')+prefix+form;
 const details=[ruStage,waxed?'вощёная':''].filter(Boolean);
 const name=(waxed?'Waxed ':'')+enStage+((waxed||prefix)?en.toLowerCase():en);
 return Object.freeze([id,name,ru+(details.length?' (медь: '+details.join(', ')+')':'')]);
}))).filter(([id])=>id!=='copper_block'));
const CUBE_REVIEW_BLOCKS=Object.freeze([
 ['ancient_debris','Ancient debris','Древние обломки'],
 ['basalt','Basalt','Базальт'],
 ['blue_ice','Blue ice','Синий лёд'],
 ['bone_block','Bone block','Костный блок'],
 ['bookshelf','Bookshelf','Книжная полка'],
 ['cartography_table','Cartography table','Стол картографа'],
 ['crafting_table','Crafting table','Верстак'],
 ['crying_obsidian','Crying obsidian','Плачущий обсидиан'],
 ['deepslate','Deepslate','Глубинный сланец'],
 ['dried_kelp_block','Dried kelp block','Блок сушёной ламинарии'],
 ['fletching_table','Fletching table','Стол лучника'],
 ['glowstone','Glowstone','Светокамень'],
 ['hay_block','Hay bale','Сноп сена'],
 ['honeycomb_block','Honeycomb block','Блок пчелиных сот'],
 ['ice','Ice','Лёд'],
 ['jukebox','Jukebox','Проигрыватель'],
 ['lodestone','Lodestone','Магнетит'],
 ['loom','Loom','Ткацкий станок'],
 ['magma','Magma block','Магмовый блок'],
 ['mud','Mud','Грязь'],
 ['noteblock','Note block','Нотный блок'],
 ['ochre_froglight','Ochre froglight','Охристый квампосвет'],
 ['packed_ice','Packed ice','Плотный лёд'],
 ['pearlescent_froglight','Pearlescent froglight','Перламутровый квампосвет'],
 ['polished_basalt','Polished basalt','Полированный базальт'],
 ['potent_sulfur','Potent sulfur','Активная сера'],
 ['powder_snow','Powder snow','Рыхлый снег'],
 ['purpur_pillar','Purpur pillar','Пурпуровый пилон'],
 ['quartz_pillar','Quartz pillar','Кварцевая колонна'],
 ['reinforced_deepslate','Reinforced deepslate','Укреплённый глубинный сланец'],
 ['sculk','Sculk','Скалк'],
 ['sea_lantern','Sea lantern','Морской фонарь'],
 ['smithing_table','Smithing table','Кузнечный стол'],
 ['snow','Snow block','Блок снега'],
 ['soul_sand','Soul sand','Песок душ'],
 ['soul_soil','Soul soil','Почва душ'],
 ['sponge','Sponge','Губка'],
 ['target','Target','Мишень'],
 ['tnt','TNT','Динамит'],
 ['verdant_froglight','Verdant froglight','Зелёный квампосвет'],
 ['wet_sponge','Wet sponge','Мокрая губка']
].map(row=>Object.freeze(row)));
const INDEXED_REVIEW_BLOCKS=Object.freeze([
 ...COPPER_STAGES.flatMap(([prefix,enStage,ruStage])=>{
  const id=prefix+'copper_bulb',name=prefix?enStage+'copper bulb':'Copper bulb',suffix=ruStage?' ('+ruStage+')':'';
  return [[id,name,'Медная лампа'+suffix],['waxed_'+id,'Waxed '+name.toLowerCase(),'Вощёная медная лампа'+suffix]];
 }),
 ['frosted_ice','Frosted ice','Подмороженный лёд'],
 ['respawn_anchor','Respawn anchor','Якорь возрождения']
].map(row=>Object.freeze(row)));
const FIXTURE_REVIEW_BLOCKS=Object.freeze([
 ['torch','Torch','Факел'],['soul_torch','Soul torch','Факел душ'],['copper_torch','Copper torch','Медный факел'],
 ['lantern','Lantern','Фонарь'],['soul_lantern','Soul lantern','Фонарь душ'],['iron_chain','Iron chain','Железная цепь'],
 ...[false,true].flatMap(waxed=>COPPER_STAGES.flatMap(([prefix,enStage,ruStage])=>{
  const enPrefix=(waxed?'Waxed ':'')+(waxed?enStage.toLowerCase():enStage),details=[ruStage,waxed?'вощёная':''].filter(Boolean),suffix=details.length?' (медь: '+details.join(', ')+')':'';
  return [['copper_lantern','Copper lantern','Медный фонарь'],['copper_chain','Copper chain','Медная цепь']].map(([form,en,ru])=>[(waxed?'waxed_':'')+prefix+form,enPrefix+((waxed||prefix)?en.toLowerCase():en),ru+suffix]);
 })),
 ['bamboo_fence','Bamboo fence','Бамбуковый забор'],['bamboo_fence_gate','Bamboo fence gate','Бамбуковая калитка'],
 ['anvil','Anvil','Наковальня'],['chipped_anvil','Chipped anvil','Повреждённая наковальня'],['damaged_anvil','Damaged anvil','Разбитая наковальня'],
 ['beacon','Beacon','Маяк'],['brewing_stand','Brewing stand','Варочная стойка'],['end_portal','End portal','Портал Края'],
 ['petrified_oak_slab','Petrified oak slab','Окаменевшая дубовая плита'],['petrified_oak_double_slab','Double petrified oak slab','Двойная окаменевшая дубовая плита'],
 ['infested_stone','Infested stone','Заражённый камень'],['infested_cobblestone','Infested cobblestone','Заражённый булыжник'],
 ['infested_stone_bricks','Infested stone bricks','Заражённые каменные кирпичи'],['infested_mossy_stone_bricks','Infested mossy stone bricks','Заражённые замшелые каменные кирпичи'],
 ['infested_cracked_stone_bricks','Infested cracked stone bricks','Заражённые потрескавшиеся каменные кирпичи'],['infested_chiseled_stone_bricks','Infested chiseled stone bricks','Заражённые резные каменные кирпичи'],
 ['infested_deepslate','Infested deepslate','Заражённый глубинный сланец']
].map(row=>Object.freeze(row)));
const SIGN_WOODS=[
 ['oak','Oak','дуба'],['spruce','Spruce','ели'],['birch','Birch','берёзы'],['jungle','Jungle','тропического дерева'],
 ['acacia','Acacia','акации'],['dark_oak','Dark oak','тёмного дуба'],['crimson','Crimson','багрового дерева'],['warped','Warped','искажённого дерева'],
 ['mangrove','Mangrove','мангрового дерева'],['cherry','Cherry','вишни'],['bamboo','Bamboo','бамбука'],['pale_oak','Pale oak','бледного дуба'],['poplar','Poplar','тополя']
];
const SIGN_PLACEMENTS=[['standing',' sign','Табличка из '],['wall',' wall sign','Настенная табличка из '],['hanging',' hanging sign','Подвесная табличка из ']];
const SIGN_REVIEW_BLOCKS=Object.freeze(SIGN_WOODS.flatMap(([wood,en,ru])=>SIGN_PLACEMENTS.map(([placement,suffix,prefix])=>{
 const source=placement==='hanging'?wood:wood==='oak'?'':wood==='dark_oak'?'darkoak':wood;
 return Object.freeze([(source?source+'_':'')+placement+'_sign',en+suffix,prefix+ru]);
})));
const JOINERY_REVIEW_BLOCKS=Object.freeze([
 ...SIGN_WOODS.flatMap(([wood,en,ru])=>[[wood==='oak'?'wooden_door':wood+'_door',en+' door','Дверь из '+ru],[wood+'_shelf',en+' shelf','Полка из '+ru]]),
 ['iron_door','Iron door','Железная дверь'],
 ...COPPER_STAGES.flatMap(([prefix,enStage,ruStage])=>{
  const id=prefix+'copper_door',name=prefix?enStage+'copper door':'Copper door',suffix=ruStage?' ('+ruStage+')':'';
  return [[id,name,'Медная дверь'+suffix],['waxed_'+id,'Waxed '+name.toLowerCase(),'Вощёная медная дверь'+suffix]];
 })
].map(row=>Object.freeze(row)));
const EXTRA_SOURCE_REVIEW_BLOCKS=Object.freeze([
 ...[['tube','Tube','трубчатый'],['brain','Brain','мозговой'],['bubble','Bubble','пузырчатый'],['fire','Fire','огненный'],['horn','Horn','роговый']].flatMap(([type,en,ru])=>[
  [type+'_coral_wall_fan',en+' coral wall fan','Настенный веерный коралл: '+ru],
  ['dead_'+type+'_coral_wall_fan','Dead '+en.toLowerCase()+' coral wall fan','Мёртвый настенный веерный коралл: '+ru]
 ]),
 ...COPPER_STAGES.map(([prefix,enStage,ruStage])=>['waxed_'+prefix+'copper_golem_statue','Waxed '+enStage.toLowerCase()+'copper golem statue','Вощёная статуя медного голема'+(ruStage?' (медь: '+ruStage+')':'')]),
 ['allow','Allow block','Разрешающий блок'],['deny','Deny block','Запрещающий блок'],['border_block','Border block','Пограничный блок'],['barrier','Barrier','Барьер'],['structure_void','Structure void','Структурная пустота']
].map(row=>Object.freeze(row)));
const ADDITIONAL_REVIEW_BLOCKS=Object.freeze([...STONE_REVIEW_BLOCKS,...WOOD_REVIEW_BLOCKS,...LEAF_REVIEW_BLOCKS,...COPPER_REVIEW_BLOCKS,...CUBE_REVIEW_BLOCKS,...INDEXED_REVIEW_BLOCKS,...FIXTURE_REVIEW_BLOCKS,...SIGN_REVIEW_BLOCKS,...JOINERY_REVIEW_BLOCKS,...EXTRA_SOURCE_REVIEW_BLOCKS]);
const REVIEW_IDS=Object.freeze([...BASE_REVIEW_IDS,...ADDITIONAL_REVIEW_BLOCKS.map(([id])=>id)]);
const TEXT=Object.fromEntries(Object.entries(BASE_TEXT).map(([lang,labels])=>[lang,{
 ...labels,...Object.fromEntries(ADDITIONAL_REVIEW_BLOCKS.map(([id,en,ru])=>['card_'+id,lang==='ru'?ru:en]))
}]));
export {activePack,imageFrames,frameCanvas,createImageSource};
export {REVIEW_IDS};
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
export const {previewFields,previewControlSpec,previewControlSelection,previewTextureField}=createPreviewControls(TEXT);
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
  const selection=previewControlSelection(controlPlan,stateUi.value());
  form=selection.form;slot=selection.slot;state=selection.state;show();
 },{language:()=>lang,doneLabel:()=>t('done'),manager:()=>globalThis.FKM});
 function controls(plan) {
  const spec=previewControlSpec(catalog,plan);controlPlan=plan;
  stateUi.select(plan.object.card,[previewTextureField(plan),...(spec.schema??[])],{...spec.state,texture:plan.slot});stateUi.busy(busy||lost);
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
   const plan=resolve({id,form,slot,state:{...state}}),paths=[...new Set([...resourcePaths(plan),plan.slot])],overrides=$('textureSource').value==='pack'?activePack(localStorage):{};
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
