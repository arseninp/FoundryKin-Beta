/* Pure schemas and labels for the existing shared state picker. No DOM, storage or model building. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function createPreviewControls(TEXT) {
 if(!dictionary(TEXT)||!dictionary(TEXT.en)||!dictionary(TEXT.ru))throw new Error('Invalid preview control labels');
const bool=[['off',false],['on',true]],directions=['north','south','east','west'].map(key=>[key,key]);
const numbers=n=>Array.from({length:n},(_,index)=>[String(index),index]);
const fruit=[['stem',bool,false],['facing',directions,'west'],['stage',numbers(8),7]];
const growth=['small','medium','large','cluster'].map(key=>[key,key]);
const FIELDS={pumpkin:fruit,melon_block:fruit,budding_amethyst:[['crystals',bool,false],['growth',growth,'cluster'],['face',[...directions,['up','up'],['down','down']],'up']],seagrass:[['tall',bool,false],['variant',[['A','a'],['B','b']],'a']],mangrove_propagule:[['hanging',bool,false],['age',numbers(5),0]]};
const liquid=[['level',numbers(8),0]];
const MODEL_FIELDS={azalea:[['potted',bool,false]],potted_azalea:[['potted',bool,false]],end_portal_frame:[['eye',bool,false]],tripwire_hook:[['attached',bool,false]],composter:[['level',numbers(9),0]],scaffolding:[['bottom',bool,false]],sculk_sensor:[['active',bool,false]],sculk_shrieker:[['can_summon',bool,false]],sculk_catalyst:[['bloom',bool,false]],dried_ghast:[['stage',numbers(4),0]],barrel:[['open',[['closed',false],['open',true]],false]],campfire:[['lit',[['off',false],['on',true]],true]],fire:[['variant',[['A','primary'],['B','alternate']],'primary']],shulker_box:[['open',[['closed',false],['open',true]],false]],chest:[['open',[['closed',false],['open',true]],false],['double',[['single',false],['double',true]],false]],water:liquid,lava:liquid,copper_golem_statue:[['pose',['standing','sitting','running','star'].map(key=>[key,key]),'standing']],conduit:[['active',[['inactive',false],['active',true]],false],['eye_open',[['closed',false],['open',true]],false],['wind',[['horizontal','horizontal'],['vertical','vertical']],'horizontal']]};
function previewFields(catalog,plan) {
 const route=catalog.stateRoutes?.[plan.object.id],group=route?catalog.stateGroups?.[route.card]:null;
 const fields=[...(FIELDS[plan.object.card]??[]),...(MODEL_FIELDS[plan.model]??[])].filter(([key])=>!(plan.model==='chest'&&plan.object.id==='ender_chest'&&key==='double'));
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
 const azaleaLabels={potted:['Pot','Горшок'],potted_off:['Without pot','Без горшка'],potted_on:['Potted','В горшке']};
 const fields=previewFields(catalog,plan),label=(key,fallback=key)=>['en','ru'].map((lang,index)=>TEXT[lang][plan.model+'_'+key]??((plan.model==='azalea'||plan.model==='potted_azalea')&&own(azaleaLabels,key)?azaleaLabels[key][index]:(plan.model==='stage_cross'||plan.model==='crop')&&key==='stage'?['Growth stage','Стадия роста'][index]:TEXT[lang][key]??TEXT[lang][fallback]??fallback));
 const schema=fields.map(([key,options])=>({key,label:label(key),values:options.map(([name,value])=>({value,label:label(key+'_'+name,name)}))}));
 const state=Object.fromEntries(fields.map(([key,,fallback])=>[key,plan.state[key]??fallback]));
 if(plan.forms) {
  if(!dictionary(plan.forms)||!own(plan.forms,plan.object.form)||schema.some(item=>item.key==='form'))throw new Error('Invalid preview form controls');
  schema.unshift({key:'form',label:label('form'),values:Object.keys(plan.forms).map(value=>({value,label:label('form_'+value,value)}))});
  state.form=plan.object.form;
 }
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
