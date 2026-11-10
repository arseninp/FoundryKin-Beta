/* Pure schemas and labels for the existing shared state picker. No DOM, storage or model building. */
import {leafControlState,leafPreviewField,leafPreviewLabel} from './catalog/leaf-preview.mjs';
import {signControlState,signPreviewField,signPreviewLabel} from './catalog/sign-preview.mjs';
import {cauldronField,cauldronFormLabels,cauldronFormState} from './catalog/cauldron-controls.mjs';
import {bannerControlSpec,bannerControlState} from './catalog/banner-controls.mjs';
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function createPreviewControls(TEXT) {
 if(!dictionary(TEXT)||!dictionary(TEXT.en)||!dictionary(TEXT.ru))throw new Error('Invalid preview control labels');
const bool=[['off',false],['on',true]],directions=['north','south','east','west'].map(key=>[key,key]);
const numbers=n=>Array.from({length:n},(_,index)=>[String(index),index]);
const BULB_MODES=['off','lit','powered','lit_powered'];
const INDEXED_CUBE_FIELDS={
 ...Object.fromEntries(['','exposed_','weathered_','oxidized_'].flatMap(prefix=>{
  const id=prefix+'copper_bulb',field=['mode',BULB_MODES.map(value=>[value,value]),'off'];
  return [[id,field],['waxed_'+id,field]];
 })),
 observer:['powered',[['off','off'],['on','on']],'off'],
 crafter:['mode',['idle','triggered','crafting'].map(value=>[value,value]),'idle'],creaking_heart:['mode',['inactive','dormant','active'].map(value=>[value,value]),'inactive'],chiseled_bookshelf:['occupied',bool,false],suspicious_sand:['brushing',numbers(4),0],suspicious_gravel:['brushing',numbers(4),0],
 structure_block:['mode',['default','data','save','load','corner','export'].map(value=>[value,value]),'default'],
 frosted_ice:['stage',numbers(4),0],respawn_anchor:['charges',numbers(5),0]
};
const INDEXED_CUBE_LABELS={powered:['Power','Сигнал'],powered_off:['Unpowered','Без сигнала'],powered_on:['Powered','С сигналом'],mode:['Operating state','Режим'],mode_off:['Unlit, unpowered','Не горит, без сигнала'],mode_lit:['Lit, unpowered','Горит, без сигнала'],mode_powered:['Unlit, powered','Не горит, с сигналом'],mode_lit_powered:['Lit, powered','Горит, с сигналом'],stage:['Crack stage','Стадия трещин'],charges:['Charges','Заряды'],mode_idle:['Idle','Покой'],mode_triggered:['Triggered','С сигналом'],mode_crafting:['Crafting','Создание'],mode_inactive:['Inactive','Неактивно'],mode_dormant:['Dormant','Спит'],mode_active:['Active','Активно'],occupied:['Books','Книги'],occupied_off:['Empty','Пусто'],occupied_on:['Filled','Заполнено'],brushing:['Brushing stage','Стадия очистки'],mode_default:['Default','Обычный'],mode_data:['Data','Данные'],mode_save:['Save','Сохранение'],mode_load:['Load','Загрузка'],mode_corner:['Corner','Угол'],mode_export:['Export','Экспорт']};
function indexedCubeControlState(plan,state) {
 if(plan.model!=='cube'||!own(INDEXED_CUBE_FIELDS,plan.object.id))return null;
 if(!dictionary(state))throw new Error('Invalid indexed cube control state');
 const [key,options,fallback]=INDEXED_CUBE_FIELDS[plan.object.id],value=state[key]===undefined?fallback:state[key];
 if(!options.some(([,allowed])=>value===allowed))throw new Error('Invalid indexed cube control: '+key);
 return {[key]:value};
}
function indexedCubeLabel(plan,key) {
 return plan.model==='cube'&&own(INDEXED_CUBE_FIELDS,plan.object.id)&&own(INDEXED_CUBE_LABELS,key)?INDEXED_CUBE_LABELS[key]:null;
}
const CANDLE_LABELS={lit:['Burning','Горение'],lit_off:['Unlit','Не горит'],lit_on:['Lit','Горит']};
function candleControlLit(state) {
 if(!dictionary(state))throw new Error('Invalid candle control state');
 const lit=state.lit===undefined?false:state.lit;
 if(typeof lit!=='boolean')throw new Error('Invalid candle control lit');
 return lit;
}
const CHORUS_FIELDS={chorus_plant:['north','south','east','west','up','down'],chorus_flower:['dead']};
const CHORUS_LABELS={north:['North connection','Соединение: север'],south:['South connection','Соединение: юг'],east:['East connection','Соединение: восток'],west:['West connection','Соединение: запад'],up:['Upper connection','Соединение: верх'],down:['Lower connection','Соединение: низ'],dead:['Flower state','Состояние цветка'],dead_off:['Living','Живой'],dead_on:['Dead','Мёртвый']};
for(const key of CHORUS_FIELDS.chorus_plant){CHORUS_LABELS[key+'_off']=['Disconnected','Нет'];CHORUS_LABELS[key+'_on']=['Connected','Есть'];}
function chorusControlState(plan,state) {
 if(!dictionary(state))throw new Error('Invalid chorus control state');
 return Object.fromEntries(CHORUS_FIELDS[plan.model].map(key=>{
  const value=state[key]===undefined?false:state[key];
  if(typeof value!=='boolean')throw new Error('Invalid chorus control: '+key);
  return [key,value];
 }));
}
const isHivePlan=plan=>plan.model==='cube'&&['bee_nest','beehive'].includes(plan.object.id);
function hiveControlHoney(state) {
 if(!dictionary(state))throw new Error('Invalid hive control state');
 const honey=state.honey===undefined?false:state.honey;
 if(typeof honey!=='boolean')throw new Error('Invalid hive control honey');
 return honey;
}
const MUSHROOM_DEFAULTS=Object.freeze({brown_mushroom_block:14,red_mushroom_block:14,mushroom_stem:10});
const isMushroomPlan=plan=>plan.model==='cube'&&own(MUSHROOM_DEFAULTS,plan.object.id);
function mushroomControlVariant(plan,state) {
 if(!dictionary(state))throw new Error('Invalid mushroom control state');
 const variant=state.variant===undefined?MUSHROOM_DEFAULTS[plan.object.id]:state.variant;
 if(!Number.isInteger(variant)||variant<0||variant>15)throw new Error('Invalid mushroom control variant');
 return variant;
}
function snowControlLayers(state) {
 if(!dictionary(state))throw new Error('Invalid snow control state');
 const layers=state.layers===undefined?1:state.layers;
 if(!Number.isInteger(layers)||layers<1||layers>8)throw new Error('Invalid snow control layers');
 return layers;
}
function farmlandControlWet(state) {
 if(!dictionary(state))throw new Error('Invalid farmland control state');
 const wet=state.wet===undefined?true:state.wet;
 if(typeof wet!=='boolean')throw new Error('Invalid farmland control wet');
 return wet;
}
function cocoaControlStage(state) {
 if(!dictionary(state))throw new Error('Invalid cocoa control state');
 const stage=state.stage===undefined?2:state.stage;
 if(!Number.isInteger(stage)||stage<0||stage>2)throw new Error('Invalid cocoa control stage');
 return stage;
}
function pitcherControlState(plan,state) {
 const id=plan.object.id;
 if(!['pitcher_crop','pitcher_plant'].includes(id)||!dictionary(state))throw new Error('Invalid pitcher control state');
 const stage=state.stage===undefined?(id==='pitcher_plant'?4:0):state.stage,pod_only=state.pod_only===undefined?false:state.pod_only;
 if(!Number.isInteger(stage)||stage<0||stage>4||(id==='pitcher_plant'&&stage!==4))throw new Error('Invalid pitcher control stage');
 if(typeof pod_only!=='boolean')throw new Error('Invalid pitcher pod control');
 return {stage,pod_only};
}
function caveVineControlState(plan,state) {
 if(!dictionary(state))throw new Error('Invalid cave vine control state');
 const berries=state.berries===undefined?plan.model==='cave_vines_part':state.berries;
 if(typeof berries!=='boolean')throw new Error('Invalid cave vine berries control');
 return {berries};
}
const fruit=[['stem',bool,false],['facing',directions,'west'],['stage',numbers(8),7]];
const growth=['small','medium','large','cluster'].map(key=>[key,key]);
const FIELDS={pumpkin:fruit,melon_block:fruit,budding_amethyst:[['crystals',bool,false],['growth',growth,'cluster'],['face',[...directions,['up','up'],['down','down']],'up']],seagrass:[['tall',bool,false],['variant',[['A','a'],['B','b']],'a']],mangrove_propagule:[['hanging',bool,false],['age',numbers(5),0]]};
const liquid=[['level',numbers(8),0]];
const MODEL_FIELDS={azalea:[['potted',bool,false]],potted_azalea:[['potted',bool,false]],end_portal_frame:[['eye',bool,false]],tripwire_hook:[['attached',bool,false]],composter:[['level',numbers(9),0]],scaffolding:[['bottom',bool,false]],sculk_sensor:[['active',bool,false]],sculk_shrieker:[['can_summon',bool,false]],sculk_catalyst:[['bloom',bool,false]],dried_ghast:[['stage',numbers(4),0]],barrel:[['open',[['closed',false],['open',true]],false]],campfire:[['lit',[['off',false],['on',true]],true]],fire:[['variant',[['A','primary'],['B','alternate']],'primary']],shulker_box:[['open',[['closed',false],['open',true]],false]],chest:[['open',[['closed',false],['open',true]],false],['double',[['single',false],['double',true]],false]],water:liquid,lava:liquid,copper_golem_statue:[['pose',['standing','sitting','running','star'].map(key=>[key,key]),'standing']],conduit:[['active',[['inactive',false],['active',true]],false],['eye_open',[['closed',false],['open',true]],false],['wind',[['horizontal','horizontal'],['vertical','vertical']],'horizontal']]};
for(const [model,keys] of Object.entries(CHORUS_FIELDS))MODEL_FIELDS[model]=keys.map(key=>[key,bool,false]);
MODEL_FIELDS.piston=[['extended',bool,false]];
MODEL_FIELDS.repeater=[['delay',[1,2,3,4].map(value=>[String(value),value]),1]];
MODEL_FIELDS.comparator=[['subtract',bool,false]];
const powerOptions=[['off','off'],['on','on']];
MODEL_FIELDS.lightning_rod=[['powered',powerOptions,'off']];
const MECHANISM_LABELS={piston_extended:['Extension','Выдвижение'],piston_extended_off:['Retracted','Втянут'],piston_extended_on:['Extended','Выдвинут'],repeater_delay:['Delay','Задержка'],comparator_subtract:['Mode','Режим'],comparator_subtract_off:['Compare','Сравнение'],comparator_subtract_on:['Subtract','Вычитание'],track_curved:['Track shape','Форма рельсов'],track_curved_off:['Straight','Прямые'],track_curved_on:['Curved','Изогнутые'],track_powered:['Power','Сигнал'],track_powered_off:['Off','Нет'],track_powered_on:['On','Есть'],lightning_rod_powered:['Power','Сигнал'],lightning_rod_powered_off:['Off','Нет'],lightning_rod_powered_on:['On','Есть']};
function trackFields(plan) {
 if(plan.model!=='track')return [];
 if(!['rail','golden_rail','detector_rail','activator_rail'].includes(plan.object.id))throw new Error('Unknown rail control object');
 return [plan.object.id==='rail'?['curved',bool,false]:['powered',powerOptions,'off']];
}
MODEL_FIELDS.turtle_egg=MODEL_FIELDS.sniffer_egg=[['stage',numbers(3),0]];
MODEL_FIELDS.sulfur_spike=MODEL_FIELDS.pointed_dripstone=[['direction',[['down','down'],['up','up']],'down'],['merged',bool,false]];
MODEL_FIELDS.redstone_wire=[['pattern',[['cross','cross'],['line','line']],'cross']];
const BANNER_COLOR_OPTIONS=[['white','White','Белый'],['orange','Orange','Оранжевый'],['magenta','Magenta','Пурпурный'],['light_blue','Light blue','Голубой'],['yellow','Yellow','Жёлтый'],['lime','Lime','Лаймовый'],['pink','Pink','Розовый'],['gray','Gray','Серый'],['light_gray','Light gray','Светло-серый'],['cyan','Cyan','Бирюзовый'],['purple','Purple','Фиолетовый'],['blue','Blue','Синий'],['brown','Brown','Коричневый'],['green','Green','Зелёный'],['red','Red','Красный'],['black','Black','Чёрный']];
MODEL_FIELDS.banner=[['color',BANNER_COLOR_OPTIONS.map(([id])=>[id,id]),'white'],['ominous',bool,false]];
const OTHER_MODELS=['cauldron','daylight','cage','turtle_egg','sniffer_egg','sulfur_spike','pointed_dripstone','redstone_wire','banner'];
const OTHER_LABELS={content:['Contents','Содержимое'],content_empty:['Empty','Пусто'],content_water:['Water','Вода'],content_colored_water:['Colored water','Окрашенная вода'],content_lava:['Lava','Лава'],mode:['Mode','Режим'],mode_day:['Daylight','Дневной свет'],mode_inverted:['Inverted','Инверсия'],variant:['Variant','Вариант'],stage:['Crack stage','Стадия трещин'],direction:['Direction','Направление'],direction_down:['Down','Вниз'],direction_up:['Up','Вверх'],merged:['Merged tip','Соединённый кончик'],merged_off:['Separate','Раздельно'],merged_on:['Merged','Соединено'],pattern:['Pattern','Рисунок'],pattern_cross:['Cross','Крест'],pattern_line:['Line','Линия'],color:['Cloth color','Цвет полотна'],ominous:['Banner type','Тип знамени'],ominous_off:['Ordinary','Обычное'],ominous_on:['Ominous','Зловещее']};
for(const [id,en,ru] of BANNER_COLOR_OPTIONS)OTHER_LABELS['color_'+id]=[en,ru];
MODEL_FIELDS.candle=[['lit',bool,false]];
MODEL_FIELDS.snow_layer=[['layers',Array.from({length:8},(_,index)=>[String(index+1),index+1]),1]];
MODEL_FIELDS.farmland=[['wet',bool,true]];
MODEL_FIELDS.cocoa=[['stage',numbers(3),2]];
MODEL_FIELDS.cave_vines=[['berries',bool,false]];
MODEL_FIELDS.cave_vines_part=[['berries',bool,true]];
const MOSS_SIDES=['north','south','east','west'],MOSS_LEVELS=['none','short','tall'];
MODEL_FIELDS.pale_moss_carpet=[['upper_block_bit',bool,false],...MOSS_SIDES.map(side=>['pale_moss_carpet_side_'+side,MOSS_LEVELS.map(value=>[value,value]),'none'])];
const MOSS_LABELS={upper_block_bit:['Upper part','Верхняя часть'],pale_moss_carpet_side_north:['North side','Северная сторона'],pale_moss_carpet_side_south:['South side','Южная сторона'],pale_moss_carpet_side_east:['East side','Восточная сторона'],pale_moss_carpet_side_west:['West side','Западная сторона']};
function mossControlState(state) {
 if(!dictionary(state))throw new Error('Invalid pale moss control state');
 return Object.fromEntries(MODEL_FIELDS.pale_moss_carpet.map(([key,options,fallback])=>{
  const value=state[key]===undefined?fallback:state[key];
  if(!options.some(([,allowed])=>value===allowed))throw new Error('Invalid pale moss control: '+key);
  return [key,value];
 }));
}
function previewFields(catalog,plan) {
 if(plan.model==='candle')candleControlLit(plan.state);
 const indexedCube=indexedCubeControlState(plan,plan.state);
 if(isMushroomPlan(plan))mushroomControlVariant(plan,plan.state);
 if(isHivePlan(plan))hiveControlHoney(plan.state);
 if(plan.model==='snow_layer')snowControlLayers(plan.state);
 if(plan.model==='farmland')farmlandControlWet(plan.state);
 if(plan.model==='cocoa')cocoaControlStage(plan.state);
 if(own(CHORUS_FIELDS,plan.model))chorusControlState(plan,plan.state);
 if(plan.model==='pale_moss_carpet')mossControlState(plan.state);
 if(plan.model==='cave_vines'||plan.model==='cave_vines_part')caveVineControlState(plan,plan.state);
 const route=catalog.stateRoutes?.[plan.object.id],group=route?catalog.stateGroups?.[route.card]:null;
 const fields=[...(FIELDS[plan.object.card]??[]),...(MODEL_FIELDS[plan.model]??[]),...trackFields(plan)].filter(([key])=>!(plan.model==='chest'&&plan.object.id==='ender_chest'&&key==='double'));
 if(plan.model==='cauldron')fields.push(cauldronField(plan));
 if(plan.model==='cage'){const count={mob_spawner:1,trial_spawner:12,vault:8}[plan.object.id];if(!count)throw new Error('Unknown cage control object');fields.push(['variant',numbers(count),0]);}
 if(indexedCube)fields.push(INDEXED_CUBE_FIELDS[plan.object.id]);
 const leafField=leafPreviewField(plan);if(leafField)fields.push(leafField);
 const signField=signPreviewField(plan);if(signField)fields.push(signField);
 if(isMushroomPlan(plan))fields.push(['variant',numbers(16),MUSHROOM_DEFAULTS[plan.object.id]]);
 if(isHivePlan(plan))fields.push(['honey',bool,false]);
 if(plan.model==='pitcher') {
  pitcherControlState(plan,plan.state);
  const plant=plan.object.id==='pitcher_plant';
  fields.push(['stage',plant?[['4',4]]:numbers(5),plant?4:0],['pod_only',bool,false]);
 }
 if(plan.model==='stage_cross'||plan.model==='crop') {
  if(!Number.isInteger(plan.stages)||plan.stages<1)throw new Error('Invalid '+plan.model+' control stages');
  const stage=plan.state?.stage??0;
  if(!Number.isInteger(stage)||stage<0||stage>=plan.stages)throw new Error('Invalid '+plan.model+' control stage');
  fields.push(['stage',numbers(plan.stages),0]);
 }
 if(!group)return fields.map(([key,options,fallback])=>[key,options.map(option=>[...option]),fallback]);
 return [[group.parameter,Object.keys(group.variants).map(value=>[value,value]),group.default],...fields.filter(([key])=>key!==group.parameter).map(([key,options,fallback])=>[key,options.map(option=>[...option]),fallback])];
}
const POT_FACES=Object.freeze(['north','south','east','west']);
const POT_LABELS=Object.freeze({brick:['Plain','Без рисунка'],angler_pottery_sherd:['Angler','Рыболов'],archer_pottery_sherd:['Archer','Лучник'],arms_up_pottery_sherd:['Arms up','Руки вверх'],blade_pottery_sherd:['Blade','Клинок'],brewer_pottery_sherd:['Brewer','Пивовар'],burn_pottery_sherd:['Burn','Пламя'],danger_pottery_sherd:['Danger','Опасность'],explorer_pottery_sherd:['Explorer','Исследователь'],friend_pottery_sherd:['Friend','Друг'],heart_pottery_sherd:['Heart','Сердце'],heartbreak_pottery_sherd:['Heartbreak','Разбитое сердце'],howl_pottery_sherd:['Howl','Вой'],miner_pottery_sherd:['Miner','Шахтёр'],mourner_pottery_sherd:['Mourner','Скорбящий'],plenty_pottery_sherd:['Plenty','Изобилие'],prize_pottery_sherd:['Prize','Награда'],sheaf_pottery_sherd:['Sheaf','Сноп'],shelter_pottery_sherd:['Shelter','Укрытие'],skull_pottery_sherd:['Skull','Череп'],snort_pottery_sherd:['Snort','Фырканье'],flow_pottery_sherd:['Flow','Поток'],guster_pottery_sherd:['Guster','Вихрь'],scrape_pottery_sherd:['Scrape','Соскоб']});
function previewControlSpec(catalog,plan) {
 const farmlandLabels={wet:['Moisture','Влажность'],wet_off:['Dry','Сухая'],wet_on:['Moist','Увлажнённая']};
 const azaleaLabels={potted:['Pot','Горшок'],potted_off:['Without pot','Без горшка'],potted_on:['Potted','В горшке']};
 const vineLabels={berries:['Glow berries','Светящиеся ягоды'],berries_off:['Without berries','Без ягод'],berries_on:['With berries','С ягодами']};
 const pitcherLabels={stage:['Growth stage','Стадия роста'],pod_only:['View','Отображение'],pod_only_off:['Whole plant','Всё растение'],pod_only_on:['Pod only','Только стручок']};
 const fields=previewFields(catalog,plan),label=(key,fallback=key)=>['en','ru'].map((lang,index)=>TEXT[lang][plan.model+'_'+key]??MECHANISM_LABELS[plan.model+'_'+key]?.[index]??(OTHER_MODELS.includes(plan.model)?OTHER_LABELS[key]?.[index]:undefined)??(plan.model==='candle'?CANDLE_LABELS[key]?.[index]:undefined)??indexedCubeLabel(plan,key)?.[index]??leafPreviewLabel(plan,key)?.[index]??signPreviewLabel(plan,key)?.[index]??(plan.model==='snow_layer'&&key==='layers'?['Layers','Слои'][index]:plan.model==='farmland'&&own(farmlandLabels,key)?farmlandLabels[key][index]:own(CHORUS_FIELDS,plan.model)&&own(CHORUS_LABELS,key)?CHORUS_LABELS[key][index]:(plan.model==='cave_vines'||plan.model==='cave_vines_part')&&own(vineLabels,key)?vineLabels[key][index]:plan.model==='pitcher'&&own(pitcherLabels,key)?pitcherLabels[key][index]:(plan.model==='azalea'||plan.model==='potted_azalea')&&own(azaleaLabels,key)?azaleaLabels[key][index]:(plan.model==='stage_cross'||plan.model==='crop'||plan.model==='cocoa')&&key==='stage'?['Growth stage','Стадия роста'][index]:TEXT[lang][key]??TEXT[lang][fallback]??fallback));
 const schema=fields.map(([key,options])=>({key,label:label(key),values:options.map(([name,value])=>({value,label:label(key+'_'+name,name)}))}));
 const state=Object.fromEntries(fields.map(([key,,fallback])=>[key,plan.state[key]??fallback]));
 if(isMushroomPlan(plan))schema.find(field=>field.key==='variant').label=['en','ru'].map((lang,index)=>TEXT[lang][plan.object.id+'_variant']??['Variant','Вариант'][index]);
 if(isHivePlan(plan)) {
  const item=schema.find(field=>field.key==='honey');
  item.label=['en','ru'].map((lang,index)=>TEXT[lang][plan.object.id+'_honey']??['Honey','Мёд'][index]);
  for(const option of item.values) {
   const name=option.value?'on':'off',labels=option.value?['With honey','С мёдом']:['Without honey','Без мёда'];
   option.label=['en','ru'].map((lang,index)=>TEXT[lang][plan.object.id+'_honey_'+name]??labels[index]);
  }
 }
 if(plan.model==='pale_moss_carpet') {
  for(const item of schema) {
   item.label=['en','ru'].map((lang,index)=>TEXT[lang][plan.model+'_'+item.key]??MOSS_LABELS[item.key][index]);
   for(const option of item.values) {
    const name=typeof option.value==='boolean'?(option.value?'on':'off'):option.value;
    const labels={off:['Lower','Нижняя'],on:['Upper','Верхняя'],none:['None','Нет'],short:['Short','Короткий'],tall:['Tall','Высокий']}[name];
    option.label=['en','ru'].map((lang,index)=>TEXT[lang][plan.model+'_'+item.key+'_'+name]??labels[index]);
   }
  }
 }
 if(plan.forms) {
  if(!dictionary(plan.forms)||!own(plan.forms,plan.object.form)||schema.some(item=>item.key==='form'))throw new Error('Invalid preview form controls');
  schema.unshift({key:'form',label:label('form'),values:Object.keys(plan.forms).map(value=>({value,label:label('form_'+value,value)}))});
  state.form=plan.object.form;
 }
 cauldronFormLabels(plan,schema);
 bannerControlSpec(catalog,plan,schema,state);
 if(plan.model==='decorated_pot') {
  const record=catalog.records?.[plan.object.id],patterns=record?.potteryPatterns,selected=plan.state.patterns??{};
  if(!dictionary(patterns)||!own(patterns,'brick')||!dictionary(selected)||!Array.isArray(record.paths)||Object.values(patterns).some(path=>typeof path!=='string'||!record.paths.includes(path)))throw new Error('Invalid decorated pot controls');
  for(const face of POT_FACES) {
   const key='pattern_'+face,value=selected[face]??'brick';
   if(typeof value!=='string'||!own(patterns,value))throw new Error('Invalid decorated pot control value: '+face);
   schema.push({key,label:[TEXT.en[face]+' side',TEXT.ru[face]+' — узор'],values:Object.keys(patterns).map(value=>({value,label:[...(POT_LABELS[value]??[value,value])]}))});
   state[key]=value;
  }
 }
 return {schema:schema.length?schema:null,state};
}
/* Translate flat picker fields into the resolver's model state; PNG and form stay separate. */
function previewControlSelection(plan,values) {
 if(!dictionary(values))throw new Error('Invalid preview control values');
 const {form,texture,...chosen}=values,state={...plan.state,...chosen};
 cauldronFormState(plan,form,state);
 bannerControlState(plan,state);
 if(plan.model==='candle')state.lit=candleControlLit(state);
 const indexedCube=indexedCubeControlState(plan,state);if(indexedCube)Object.assign(state,indexedCube);
 const leafState=leafControlState(plan,state);if(leafState)Object.assign(state,leafState);
 const signState=signControlState(plan,state);if(signState)Object.assign(state,signState);
 if(isMushroomPlan(plan))state.variant=mushroomControlVariant(plan,state);
 if(isHivePlan(plan))state.honey=hiveControlHoney(state);
 if(plan.model==='snow_layer')state.layers=snowControlLayers(state);
 if(plan.model==='farmland')state.wet=farmlandControlWet(state);
 if(plan.model==='cocoa')state.stage=cocoaControlStage(state);
 if(own(CHORUS_FIELDS,plan.model))Object.assign(state,chorusControlState(plan,state));
 if(plan.model==='cave_vines'||plan.model==='cave_vines_part')Object.assign(state,caveVineControlState(plan,state));
 if(plan.model==='pitcher')Object.assign(state,pitcherControlState(plan,state));
 if(plan.model==='pale_moss_carpet')Object.assign(state,mossControlState(state));
 if(plan.model==='decorated_pot') {
  const patterns={};
  for(const face of POT_FACES) {
   const key='pattern_'+face;
   if(!own(chosen,key)||typeof chosen[key]!=='string')throw new Error('Missing decorated pot control: '+face);
   patterns[face]=chosen[key];delete state[key];
  }
  state.patterns=patterns;
 }
 return {form,slot:texture,state};
}
/* Texture selection belongs to the view, not to model state. */
function previewTextureField(plan) {
 if(!Array.isArray(plan.paths)||!plan.paths.length||plan.paths.some(path=>typeof path!=='string')||!plan.paths.includes(plan.slot))throw new Error('Invalid preview texture controls');
 return {key:'texture',label:[TEXT.en.texture,TEXT.ru.texture],values:plan.paths.map(path=>({value:path,label:[path,path]}))};
}
 return Object.freeze({previewFields,previewControlSpec,previewControlSelection,previewTextureField});
}
