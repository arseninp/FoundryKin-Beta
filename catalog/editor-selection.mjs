/* Stateless editor selection and image preparation. No storage, renderer or owned catalog state. */
const FACES=['up','down','north','south','east','west'];
const ALL_SHAPES=['cube','slab','stairs','wall','fence','gate','button','plate','pane','carpet'];
function shapeOfId(id){var m=/_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane|carpet)$/.exec(id),map={fence_gate:'gate',pressure_plate:'plate'};return /_trapdoor$/.test(id)?'trapdoor':m?(map[m[1]]||m[1]):'cube'}
export function isDoorBlock(catalog,m){return !!(catalog&&catalog.sp&&catalog.sp[m]&&catalog.sp[m].kind==='door')}
function modelOf(catalog,m){if(m==='beacon')return 'beacon';if(m==='azalea'||m==='flowering_azalea')return 'azalea';return (m==='bamboo'||(catalog&&catalog.p&&catalog.p[m]))?'plant':null}
export function doubleSided(catalog,m){var mo=modelOf(catalog,m);return /leaves/.test(m)||mo==='plant'||mo==='azalea'}
function shapeKeysFor(catalog,m){
  var base=catalog.familyOf&&catalog.familyOf[m],fe=base&&catalog.formEntries[base];if(fe)return Object.keys(fe).sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});
  if(isDoorBlock(catalog,m))return ['door'];if(m==='anvil')return ['anvil'];if(m==='cake')return ['cake'];if(m==='bell')return ['bell'];
  if(m==='big_dripleaf'||m==='small_dripleaf_block')return ['dripleaf'];if(/_bed$/.test(m))return ['bed'];
  if(/(^|_)candle$/.test(m))return ['candle'];if(/(^|_)carpet$/.test(m))return ['carpet'];
  if(/(^|_)rail$/.test(m)||m==='waterlily'||m==='leaf_litter'||m==='frog_spawn')return ['rail'];
  if(m==='vine'||m==='glow_lichen'||m==='sculk_vein'||m==='resin_clump')return ['decal'];
  var mo=modelOf(catalog,m);if(mo)return [mo];if(/_trapdoor$/.test(m))return ['trapdoor'];
  var ks=[shapeOfId(m)],f=catalog.forms&&catalog.forms[m];if(f)Object.keys(f).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});return ks;
}
function slotsOf(p){var list=[],seen={},fm={};FACES.forEach(function(f,i){var path=p[i];fm[f]=path;if(!seen[path]){seen[path]=1;list.push({id:path})}});return {list:list,fm:fm}}
export function slotsFor(catalog,m){if(catalog.sp&&catalog.sp[m])return {list:catalog.sp[m].list,fm:catalog.sp[m].fm};var so=slotsOf(catalog.b[m]),cp=catalog.cr&&catalog.cr[m];if(cp&&!so.list.some(function(s){return s.id===cp}))so.list.push({id:cp,carried:true});return so}
export function pathsFor(catalog,m){if(catalog.sp&&catalog.sp[m])return catalog.sp[m].list.map(function(s){return s.id});var o=[];catalog.b[m].forEach(function(x){if(o.indexOf(x)<0)o.push(x)});var q=catalog.cr&&catalog.cr[m];if(q&&o.indexOf(q)<0)o.push(q);return o}
export function describe(catalog,id){var m=catalog.mother[id]||id,mo=modelOf(catalog,m),keys=shapeKeysFor(catalog,m),want=(catalog.variantForm&&catalog.variantForm[m])||(isDoorBlock(catalog,m)?'door':(mo||shapeOfId(id)));return {id:m,model:mo,keys:keys,shape:keys.indexOf(want)>=0?want:keys[0],so:slotsFor(catalog,m)}}
function compiledObject(runtime,id){
 const object=runtime.access.describe(id);
 if(!object)throw new Error('Unknown editor object: '+id);
 return object;
}
function familySources(runtime,id){
 const {catalog}=runtime,object=compiledObject(runtime,id),forms=catalog.families[object.card],sources=new Set([id,object.id]);
 for(const member of forms?Object.values(forms):[object.card]){
  const selected=compiledObject(runtime,member),route=catalog.stateRoutes[selected.id],group=route?catalog.stateGroups[route.card]:null;
  sources.add(selected.id);
  if(group)for(const source of Object.values(group.variants))sources.add(source);
 }
 return [...sources];
}
export function compiledFamilyPaths(runtime,id){
 return [...new Set(familySources(runtime,id).flatMap(source=>runtime.catalog.records[source]?.paths??[]))].sort();
}
/* Resource grouping uses declared source roles, never filename or directory guesses. */
export function compiledResourceGroups(runtime,id,paths){
 const records=familySources(runtime,id).map(source=>runtime.catalog.records[source]).filter(Boolean),sources=records.map(record=>record.source).filter(source=>source?.template==='banner');
 const bubbles=records.filter(record=>record.model==='sprite'&&record.source?.kind==='engine-effect'&&record.source.template==='bubble_column');
 const pots=records.filter(record=>record.model==='decorated_pot'&&record.source?.template==='decorated_pot');
 const ghasts=records.filter(record=>record.model==='dried_ghast');
 const templates=[sources,bubbles,pots,ghasts].filter(rows=>rows.length);
 if(!templates.length)return null;
 if(templates.length!==1)throw new Error('Conflicting editor resource group templates');
 const owned=new Set(compiledFamilyPaths(runtime,id)),available=paths??[...owned];
 if(!Array.isArray(available)||!available.length||new Set(available).size!==available.length||available.some(path=>typeof path!=='string'||!owned.has(path)))throw new Error('Invalid grouped editor resources');
 const visible=new Set(available),used=new Set(),groups=[];
 function add(key,label,candidates){
  if(!Array.isArray(candidates)||candidates.some(path=>typeof path!=='string'||!owned.has(path)))throw new Error('Invalid editor resource group: '+key);
  const selected=[...new Set(candidates)].filter(path=>visible.has(path)).sort();
  for(const path of selected){if(used.has(path))throw new Error('Resource belongs to multiple editor groups: '+path);used.add(path);}
  if(selected.length)groups.push(Object.freeze({key,label:Object.freeze([...label]),paths:Object.freeze(selected)}));
 }
 function binding(record,role){
  const paths=record.bindings?.[role];
  if(!Array.isArray(paths)||paths.length!==1||typeof paths[0]!=='string'||!owned.has(paths[0]))throw new Error('Invalid editor resource binding: '+role);
  return paths[0];
 }
 if(sources.length){
  for(const source of sources)if(!source.patterns||typeof source.patterns!=='object'||Array.isArray(source.patterns)||!source.special||typeof source.special!=='object'||Array.isArray(source.special))throw new Error('Invalid banner resource groups');
  add('base',['Base','Основа'],sources.flatMap(source=>[source.base,...(Object.hasOwn(source.special,'illager')?[source.special.illager]:[])]));
  add('patterns',['Patterns','Рисунки'],sources.flatMap(source=>Object.values(source.patterns)));
  add('special',['Additional sources','Дополнительные исходники'],sources.flatMap(source=>Object.entries(source.special).filter(([role])=>role!=='illager').map(([,path])=>path)));
 }else if(bubbles.length){
  const roles=[['up_top',['Upward flow top','Верх восходящего потока'],4],['down_top',['Downward flow top','Верх нисходящего потока'],4],['outer',['Outer part','Внешняя часть'],8],['inner',['Inner part','Внутренняя часть'],2]];
  for(const record of bubbles){
   const bindings=record.bindings;
   if(!bindings||typeof bindings!=='object'||Array.isArray(bindings))throw new Error('Missing bubble resource bindings');
   const expected=new Set();
   for(const [part,,count] of roles)for(let index=0;index<count;index++)expected.add(part+'_'+String.fromCharCode(97+index));
   if(Object.keys(bindings).length!==expected.size||Object.keys(bindings).some(role=>!expected.has(role)))throw new Error('Invalid bubble resource roles');
   for(const role of expected)if(!Array.isArray(bindings[role])||bindings[role].length!==1)throw new Error('Invalid bubble resource binding: '+role);
  }
  for(const [part,label,count] of roles)add(part,label,bubbles.flatMap(record=>Array.from({length:count},(_,index)=>record.bindings[part+'_'+String.fromCharCode(97+index)]).flat()));
 }else if(pots.length){
  for(const record of pots){
   const patterns=record.potteryPatterns;
   if(!patterns||typeof patterns!=='object'||Array.isArray(patterns)||!Object.hasOwn(patterns,'brick')||patterns.brick!==binding(record,'side'))throw new Error('Invalid decorated pot resource groups');
  }
  add('base',['Base','Основа'],pots.flatMap(record=>[binding(record,'base'),binding(record,'side')]));
  add('patterns',['Patterns','Рисунки'],pots.flatMap(record=>Object.entries(record.potteryPatterns).filter(([role])=>role!=='brick').map(([,path])=>path)));
 }else{
  const faces=['up','down','north','south','east','west','tent'],expected=Array.from({length:4},(_,stage)=>faces.map(face=>'stage_'+stage+'_'+face)).flat();
  for(const record of ghasts)if(!record.bindings||typeof record.bindings!=='object'||Array.isArray(record.bindings)||Object.keys(record.bindings).length!==expected.length||Object.keys(record.bindings).some(role=>!expected.includes(role)))throw new Error('Invalid dried ghast resource roles');
  const stages=Array.from({length:4},(_,stage)=>[...new Set(ghasts.flatMap(record=>faces.map(face=>binding(record,'stage_'+stage+'_'+face))))]);
  const membership=new Map();
  for(const stage of stages)for(const path of stage)membership.set(path,(membership.get(path)??0)+1);
  const shared=new Set([...membership].filter(([,count])=>count>1).map(([path])=>path));
  add('shared_stages',['Shared across stages','Общие для стадий'],[...shared]);
  stages.forEach((stage,index)=>add('stage_'+index,['Stage '+index,'Стадия '+index],stage.filter(path=>!shared.has(path))));
 }
 add('icons',['Item icons','Предметные иконки'],records.flatMap(record=>record.icons??[]));
 add('other',['Other resources','Другие ресурсы'],available.filter(path=>!used.has(path)));
 return Object.freeze(groups);
}
export function compiledSelection(runtime,request){
 const {catalog}=runtime,initial=compiledObject(runtime,request.id);
 const icon=request.view===undefined&&typeof request.slot==='string'&&familySources(runtime,request.id).some(source=>catalog.records[source]?.icons?.includes(request.slot));
 const plan=runtime.resolve(icon?{...request,view:'sprite'}:request);
 if(!Array.isArray(plan.modelResourcePaths))throw new Error('Missing explicit editor model resources');
 const sourceId=Object.hasOwn(catalog.records,request.id)&&initial.id===plan.object.id?request.id:plan.object.id;
 const owned=compiledFamilyPaths(runtime,sourceId),owners=new Set(owned);
 if(!owners.has(plan.slot))throw new Error('Edited texture is outside the selected editor family');
 const required=[...new Set([...plan.modelResourcePaths,plan.slot])],resourceGroups=compiledResourceGroups(runtime,sourceId,plan.paths);
 return Object.freeze({plan,sourceId,resourceGroups,owned:Object.freeze(owned),required:Object.freeze(required),editable:Object.freeze(required.filter(path=>owners.has(path))),borrowed:Object.freeze(required.filter(path=>!owners.has(path)))});
}
export function compiledReopen(runtime,path,preferredId){
 const supplied=preferredId!==undefined&&preferredId!==null&&preferredId!=='';
 if(supplied&&(typeof preferredId!=='string'||!runtime.access.describe(preferredId)))return {status:'mismatch',candidates:[]};
 return runtime.access.locate(path,supplied?{preferredId}:{});
}
export function compiledSearchIds(runtime,query){
 const {catalog}=runtime,q=String(query??'').trim().toLowerCase().replace(/\s+/g,'_');
 if(!q)return [...catalog.cards];
 const matches=new Set(catalog.cards.filter(card=>card.includes(q)));
 for(const id of new Set([...Object.keys(catalog.records),...Object.keys(catalog.aliases),...Object.keys(catalog.families)])){
  if(!id.includes(q))continue;
  const object=runtime.access.describe(id);if(object)matches.add(object.card);
 }
 return catalog.cards.filter(card=>matches.has(card));
}
export function compiledInfo(runtime,id){
 const {catalog}=runtime,object=compiledObject(runtime,id),record=catalog.records[object.id];
 const files=[...new Set([...(catalog.records[id]?.paths??[]),...record.paths])],shared=new Set();
 for(const path of files)for(const owner of catalog.resources[path]??[])if(owner.kind==='block'&&owner.id!==id&&owner.id!==object.id)shared.add(owner.id);
 return {id,files,shared:[...shared].sort(),forms:Object.keys(catalog.families[object.card]??{}).filter(form=>form!=='native'),note:'',kind:record.model==='door'?'door':'shape'};
}
function rnd(x,y,s){var h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)}
function placeholder(g,r){for(var y=0;y<r;y++)for(var x=0;x<r;x++){var v=118+Math.round(rnd(Math.floor(x*16/r),Math.floor(y*16/r),5)*50);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,y,1,1)}}
function fcount(w,h){return h>w&&h%w===0?h/w:1}
export function imageMeta(path,w,h){if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w>16384||h>16384||w*h>16777216)throw new Error('Image exceeds editor limits: '+path);var n=String(path).indexOf('textures/entity/')===0?1:fcount(w,h);return {res:w,frames:n,aspect:h/n/w}}
export function drawFrame(canvas,img,k,path){var m=img?imageMeta(path,img.naturalWidth||img.width,img.naturalHeight||img.height):{res:16,frames:1,aspect:1};canvas.width=m.res;canvas.height=Math.max(1,Math.round(m.res*m.aspect));var g=canvas.getContext('2d');g.imageSmoothingEnabled=false;if(img)g.drawImage(img,0,k*canvas.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);else placeholder(g,16)}
export function mkFile(d,path){
 const prefix='data:image/png;base64,';
 function invalid(reason){throw new Error('Invalid saved PNG header: '+path+' ('+reason+')')}
 if(typeof d!=='string'||!d.startsWith(prefix))invalid('data URL');
 if(d.length-prefix.length<44)invalid('truncated IHDR');
 let b;
 try{b=atob(d.slice(prefix.length,prefix.length+44))}catch(error){invalid('base64')}
 const signature=[137,80,78,71,13,10,26,10];
 if(signature.some((byte,index)=>b.charCodeAt(index)!==byte))invalid('signature');
 function u32(offset){return b.charCodeAt(offset)*16777216+b.charCodeAt(offset+1)*65536+b.charCodeAt(offset+2)*256+b.charCodeAt(offset+3)}
 if(u32(8)!==13||b.slice(12,16)!=='IHDR')invalid('IHDR');
 const w=u32(16),h=u32(20),meta=imageMeta(path,w,h);
 return {res:meta.res,data:d,frames:meta.frames,aspect:meta.aspect};
}
export async function prepareEditorImages(selection,read,makeCanvas,firstOnly=false){
 const editable=new Set(selection.editable);
 return Object.fromEntries(await Promise.all(selection.required.map(async path=>{
  const image=await read(path),meta=imageMeta(path,image.naturalWidth||image.width,image.naturalHeight||image.height);
  const length=firstOnly||!editable.has(path)?1:meta.frames;
  const frames=Array.from({length},(_,index)=>{const canvas=makeCanvas();drawFrame(canvas,image,index,path);return canvas});
  return [path,{frames,count:meta.frames}];
 })));
}
