/* Editor selection queries. Pure; no DOM, storage, renderer or owned catalog state. */
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
export function compiledFamilyPaths(runtime,id){
 const {catalog}=runtime,object=compiledObject(runtime,id),forms=catalog.families[object.card],sources=new Set([id,object.id]);
 for(const member of forms?Object.values(forms):[object.card]){
  const selected=compiledObject(runtime,member),route=catalog.stateRoutes[selected.id],group=route?catalog.stateGroups[route.card]:null;
  sources.add(selected.id);
  if(group)for(const source of Object.values(group.variants))sources.add(source);
 }
 return [...new Set([...sources].flatMap(source=>catalog.records[source]?.paths??[]))].sort();
}
export function compiledSelection(runtime,request){
 const {catalog}=runtime,initial=compiledObject(runtime,request.id),plan=runtime.resolve(request);
 if(!Array.isArray(plan.modelResourcePaths))throw new Error('Missing explicit editor model resources');
 const sourceId=Object.hasOwn(catalog.records,request.id)&&initial.id===plan.object.id?request.id:plan.object.id;
 const owned=compiledFamilyPaths(runtime,sourceId),owners=new Set(owned);
 if(!owners.has(plan.slot))throw new Error('Edited texture is outside the selected editor family');
 const required=[...new Set([...plan.modelResourcePaths,plan.slot])];
 return Object.freeze({plan,sourceId,owned:Object.freeze(owned),required:Object.freeze(required),editable:Object.freeze(required.filter(path=>owners.has(path))),borrowed:Object.freeze(required.filter(path=>!owners.has(path)))});
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
