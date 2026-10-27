/* One-time source migration. Never loaded by the browser. */
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const names=['fk-catalog.js','fk-core.js','fk-fixtures.js','app.html','index.html'];
const src=Object.fromEntries(await Promise.all(names.map(async n=>[n,await readFile(n,'utf8')]))),out={...src};
function once(s,a,b){assert.equal(s.split(a).length,2,'Anchor mismatch: '+a.slice(0,70));return s.replace(a,b)}
function section(s,a,b,v){const i=s.indexOf(a),j=s.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,'Section mismatch: '+a);return s.slice(0,i)+v+s.slice(j)}
let cat=src['fk-catalog.js'];
cat=section(cat,'var FORM_RE=','function buildCatalog(B,T){','');
cat=section(cat,'  Object.keys(raw).forEach(function(id){','  Object.keys(raw).forEach(function(id){\n    if(!all[id]',"  Object.keys(raw).forEach(function(id){if(!/^double_/.test(id)&&!/_double_/.test(id))all[id]=raw[id]});\n");
cat=section(cat,'  Object.keys(kids).forEach(function(bs){','  if(all.anvil){','');
const familyCode=String.raw`var familyPending=null;
function readFamilyFile(name,expected){
 return fetch('data/catalog-families/'+name,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error('Family data: HTTP '+r.status);return r.text()}).then(function(t){
  return window.crypto.subtle.digest('SHA-256',new window.TextEncoder().encode(t)).then(function(buf){
   var h=Array.prototype.map.call(new Uint8Array(buf),function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
   if(expected&&h!==expected)throw new Error('Family checksum mismatch: '+name);return JSON.parse(t);
  });
 });
}
function loadFamilies(){
 if(!familyPending)familyPending=readFamilyFile('manifest.json').then(function(m){
  if(m.schema!==1||!m.source||m.source.commit!==PIN||!m.counts||!Array.isArray(m.files))throw new Error('Invalid family manifest');
  var seen={},parts=m.files.filter(function(f){return /^families-/.test(f.name)});
  if(!parts.length)throw new Error('Missing family records');
  return Promise.all(parts.map(function(f){
   if(!/^families-[0-9]{3}\.json$/.test(f.name)||!/^[0-9a-f]{64}$/.test(f.sha256)||seen[f.name])throw new Error('Invalid family file');
   seen[f.name]=1;return readFamilyFile(f.name,f.sha256);
  })).then(function(chunks){
   var plan={},owners={},total=0;
   chunks.forEach(function(chunk){Object.keys(chunk).forEach(function(base){
    var f=chunk[base];if(plan[base]||!f||f.id!==base||!Array.isArray(f.variants))throw new Error('Invalid family record');
    var native=0;plan[base]=f.variants.map(function(v){
     if(!v||typeof v.id!=='string'||owners[v.id])throw new Error('Duplicate family variant');
     owners[v.id]=base;total++;if(v.id===base&&v.form==='native')native++;return {id:v.id,form:v.form};
    });
    if(native!==1)throw new Error('Missing native family variant');
   })});
   if(Object.keys(plan).length!==m.counts.families||total!==m.counts.blocks)throw new Error('Family counts mismatch');return plan;
  });
 }).catch(function(e){familyPending=null;throw e});return familyPending;
}
function loadCatalogData(){return Promise.all([window.FKCatalogData.load(),loadFamilies()]).then(function(r){return {blocks:r[0].blocks,terrain:r[0].terrain,existing:r[0].existing,source:r[0].source,families:r[1]}})}
function bindFamilies(cat,plan){
 cat.familyOf={};cat.variantForm={};cat.formEntries={};
 var hidden={},allowed={slab:1,stairs:1,wall:1,gate:1,fence:1,button:1,plate:1,pane:1,carpet:1};
 Object.keys(plan||{}).forEach(function(base){
  if(!cat.b[base]||cat.ids.indexOf(base)<0)return;
  var rows=plan[base],counts={},entries={cube:base};
  rows.forEach(function(v){if(v.id!==base&&allowed[v.form]&&cat.b[v.id])counts[v.form]=(counts[v.form]||0)+1});
  rows.forEach(function(v){if(v.id!==base&&allowed[v.form]&&counts[v.form]===1&&cat.b[v.id])entries[v.form]=v.id});
  var keys=Object.keys(entries);if(keys.length<2)return;
  cat.formEntries[base]=entries;cat.forms[base]={};cat.kids[base]=[];
  keys.forEach(function(form){var id=entries[form];cat.familyOf[id]=base;cat.variantForm[id]=form;if(id!==base){hidden[id]=1;cat.forms[base][form]=1;cat.kids[base].push(id)}});
 });
 var before=cat.ids.length;cat.ids=cat.ids.filter(function(id){return !hidden[id]});cat.hidden+=(before-cat.ids.length);return cat;
}
`;
cat=once(cat,'function loadImg(u){',familyCode+'function loadImg(u){');
cat=once(cat,'load:function(){return window.FKCatalogData.load()},','load:loadCatalogData,bindFamilies:bindFamilies,');out['fk-catalog.js']=cat;
let fx=src['fk-fixtures.js'];
fx=section(fx,'var WOOL=','function flowerPath(id,part,existing){','');
fx=section(fx,'/* A carpet joins','C.index=function(c,existing){','');
fx=once(fx,'  carpetFamilies(cat,data);\n','');out['fk-fixtures.js']=fx;
let core=src['fk-core.js'];
core=once(core,"var CAT_KEY='foundrykin.catalog.v4',lastB=null,lastTerrain=null;","var CAT_KEY='foundrykin.catalog.v5',lastB=null,lastTerrain=null,lastFamilies={};");
core=once(core,"'button','plate','pane'];","'button','plate','pane','carpet'];");
core=once(core,"function shapeOfId(id){return /_trapdoor$/.test(id)?'trapdoor':'cube'}","function shapeOfId(id){var m=/_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane|carpet)$/.exec(id),map={fence_gate:'gate',pressure_plate:'plate'};return /_trapdoor$/.test(id)?'trapdoor':m?(map[m[1]]||m[1]):'cube'}");
core=once(core,'function shapeKeysFor(m){\n',"function shapeKeysFor(m){\n  var base=catalog.familyOf&&catalog.familyOf[m],fe=base&&catalog.formEntries[base];if(fe)return Object.keys(fe).sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});\n");
core=once(core,"  var ks=['cube'],f=catalog.forms&&catalog.forms[m];","  var ks=[shapeOfId(m)],f=catalog.forms&&catalog.forms[m];");
core=section(core,'function describe(id){','\nvar stage=',"function describe(id){var m=catalog.mother[id]||id,mo=modelOf(m),keys=shapeKeysFor(m),want=(catalog.variantForm&&catalog.variantForm[m])||(isDoorBlock(m)?'door':(mo||shapeOfId(id)));return {id:m,model:mo,keys:keys,shape:keys.indexOf(want)>=0?want:keys[0],so:slotsFor(m)}}");
core=once(core,"seg('#shapes','s',function(v){shape=v;build()});","seg('#shapes','s',function(v){var base=catalog.familyOf&&catalog.familyOf[cur],target=base&&catalog.formEntries[base][v];if(target&&target!==cur){selectBlock(target);return}shape=v;build()});");
core=section(core,'function useCatalog(B,Tx,src){','function loadCatalog(){',`function useCatalog(B,Tx,src){
 if(B)lastB=B;if(Tx)lastTerrain=Tx;if(!lastB)return false;
 var c=FKCatalog.build(lastB,lastTerrain);
 if(!Object.keys(c.b).length){if(catalog)say('msg.catalog_empty');else{S.status='empty';S.error=null;S.refreshing=false;emit()}return false}
 var plan=src==='file'?{}:lastFamilies;
 var prepared=FKCatalog.bindFamilies(FKCatalog.index(c,existing),plan);
 if(src!=='file')try{localStorage.setItem(CAT_KEY,JSON.stringify({commit:window.FKCatalogData.commit,version:API.version,b:c.b,p:c.p,cr:c.cr,existing:existing,familyPlan:plan}))}catch(err){}
 catalog=prepared;catalogReady(src);return true;
}
`);
core=once(core,'&&cached.b&&cached.existing){','&&cached.b&&cached.existing&&cached.familyPlan){');
core=once(core,'var restored=FKCatalog.index(cached,cached.existing);','lastFamilies=cached.familyPlan;var restored=FKCatalog.bindFamilies(FKCatalog.index(cached,cached.existing),lastFamilies);');
core=once(core,'    existing=data.existing;','    existing=data.existing;lastFamilies=data.families;');
core=section(core,'function isEdited(id){','function setBlockInfo(',`function familyPaths(id){var base=catalog.familyOf&&catalog.familyOf[id],entries=base&&catalog.formEntries[base],out=[];(entries?Object.keys(entries).map(function(k){return entries[k]}):[id]).forEach(function(x){pathsFor(x).forEach(function(p){if(out.indexOf(p)<0)out.push(p)})});return out}
function isEdited(id){return familyPaths(id).some(function(p){return dirty[p]})}
function familyFiles(){packCur();return familyPaths(cur).filter(function(p){return dirty[p]&&files[p]}).map(function(p){return {path:p+'.png',data:files[p].data}})}
`);
core=once(core,"files:function(){return curFiles().filter(function(f){return dirty[f.path.replace(/\\.png$/,'')]})}","files:function(){return cur?familyFiles():[]}");
core=once(core,'i<catalog.ids.length&&!hit;i++){var cid=catalog.ids[i];','i<allIds.length&&!hit;i++){var cid=allIds[i];');
core=once(core,"base=path.split('/').pop();for(var i=0;","base=path.split('/').pop(),allIds=Object.keys(catalog.b);for(var i=0;");
core=once(core,"{id:cur||null,paths:slots.map(function(s){return s.id})}","{id:(catalog.familyOf&&catalog.familyOf[cur])||cur||null,paths:cur?familyPaths(cur):[]}");out['fk-core.js']=core;
for(const n of ['app.html','index.html']){assert.ok(src[n].includes('0.8.86'));out[n]=src[n].replaceAll('0.8.86','0.8.87')}
assert.ok(!cat.includes('baseFor(')&&!fx.includes('carpetFamilies')&&!fx.includes('var CARPETS='));
for(const n of names){assert.ok(Buffer.byteLength(out[n])<=25000,n+' exceeds limit');assert.notEqual(out[n],src[n])}
for(const n of names)await writeFile(n,out[n]);
await writeFile('tools/family-runtime.test.mjs',String.raw`import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
test('runtime families preserve variant resources and specialized models',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={},terrain={texture_data:{}},existing={};
 for(const n of await readdir(dir)){
  if(!/^(blocks|terrain|existing)-\d+\.json$/.test(n))continue;
  Object.assign(n.startsWith('blocks-')?blocks:n.startsWith('terrain-')?terrain.texture_data:existing,JSON.parse(await readFile(new URL(n,dir),'utf8')));
 }
 const compiled=compileFamilies(blocks,terrain),plan=Object.fromEntries(Object.entries(compiled.families).map(([id,f])=>[id,f.variants.map(v=>({id:v.id,form:v.form}))]));
 const ctx={FKShapes:{build(){}}};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['fk-catalog.js','fk-sculk.js','fk-lights.js','fk-details.js','fk-fixtures.js'])vm.runInContext(await readFile(new URL('../'+name,import.meta.url),'utf8'),ctx);
 const raw=ctx.FKCatalog.build(blocks,terrain),cat=ctx.FKCatalog.bindFamilies(ctx.FKCatalog.index(raw,existing),plan);
 for(const [carpet,base] of [['white_carpet','white_wool'],['moss_carpet','moss_block'],['pale_moss_carpet','pale_moss_block']]){
  assert.equal(cat.familyOf[carpet],base);assert.equal(cat.formEntries[base].carpet,carpet);assert.ok(cat.b[carpet]);assert.ok(!cat.ids.includes(carpet));assert.ok(cat.ids.includes(base));
 }
 assert.equal(cat.cr.pale_moss_carpet,'textures/blocks/pale_moss_carpet_side');
 assert.equal(cat.formEntries.oak_planks.stairs,'oak_stairs');assert.equal(cat.formEntries.white_wool.slab,'white_wool_slab');
 for(const id of ['bell','sunflower','lectern','oak_shelf'])if(blocks[id])assert.ok(cat.b[id],id);
 assert.ok(cat.sp.bell);assert.ok(cat.sp.sunflower);
 for(const id of Object.keys(cat.variantForm))assert.ok(cat.b[id],id);
});
`);
