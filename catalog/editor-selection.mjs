/* Legacy editor selection queries. Pure; no DOM, storage, renderer or owned catalog state. */
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
