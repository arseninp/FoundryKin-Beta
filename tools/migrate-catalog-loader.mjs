/* One-shot source migration, never loaded by the application. */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const names = ['fk-core.js','fk-catalog.js','app.html','index.html'];
const original = Object.fromEntries(await Promise.all(names.map(async n => [n, await readFile(n,'utf8')])));
const output = {...original};
function once(text, from, to) {assert.equal(text.split(from).length,2,'Expected one source anchor: '+from.slice(0,70));return text.replace(from,to)}
function section(text,start,end,replacement) {const a=text.indexOf(start),b=text.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Missing source section');assert.equal(text.indexOf(start,a+1),-1,'Duplicate source section');return text.slice(0,a)+replacement+text.slice(b)}
let cat=original['fk-catalog.js'];
const parse=cat.slice(cat.indexOf('function parseLoose(t){'),cat.indexOf('function sha256(text){'));
assert.ok(parse.startsWith('function parseLoose(t){')&&parse.includes('return JSON.parse(t);'));
cat=section(cat,'/* Block data comes','var FORM_RE=',"var PIN='46ba6ea985fb5a92d79a9419198f10dda14c199d';\nvar VAN1='https://raw.githubusercontent.com/Mojang/bedrock-samples/'+PIN+'/resource_pack/';\nvar VAN2='https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@'+PIN+'/resource_pack/';\n"+parse);
cat=section(cat,'function fetchExisting(){','function loadImg(u){','');
cat=once(cat,'return {URLS_B:URLS_B,URLS_T:URLS_T,URLS_F:URLS_F,parseLoose:parseLoose,fetchJson:fetchJson,fetchExisting:fetchExisting,build:buildCatalog,index:indexCatalog,loadAny:loadAny};','return {load:function(){return window.FKCatalogData.load()},parseLoose:parseLoose,build:buildCatalog,index:indexCatalog,loadAny:loadAny};');
assert.ok(!cat.includes('local:')&&!cat.includes('fetchJson'));
output['fk-catalog.js']=cat;
let core=original['fk-core.js'];
core=once(core,"var CAT_KEY='foundrykin.catalog.v3',EX_KEY='foundrykin.exist.v2',lastB=null,lastTerrain=null;","var CAT_KEY='foundrykin.catalog.v4',lastB=null,lastTerrain=null;");
core=once(core,'try{localStorage.setItem(CAT_KEY,JSON.stringify({b:c.b,p:c.p}))}catch(err){}',"if(src!=='file')try{localStorage.setItem(CAT_KEY,JSON.stringify({commit:window.FKCatalogData.commit,version:API.version,b:c.b,p:c.p,cr:c.cr,existing:existing}));localStorage.removeItem('foundrykin.catalog.v3');localStorage.removeItem('foundrykin.exist.v2')}catch(err){}");
core=section(core,'function loadCatalog(){',"$('#catfile').onchange=",`function loadCatalog(){
  try{
    var cached=JSON.parse(localStorage.getItem(CAT_KEY));
    if(cached&&cached.commit===window.FKCatalogData.commit&&cached.version===API.version&&cached.b&&cached.existing){
      var restored=FKCatalog.index(cached,cached.existing);
      if(restored.ids.length){existing=cached.existing;catalog=restored;catalogReady('cache');S.refreshing=true;emit()}
    }
  }catch(err){}
  FKCatalog.load().then(function(data){
    existing=data.existing;
    useCatalog(data.blocks,data.terrain,'bundled');
  }).catch(function(err){
    if(!catalog)catalogFailed('catalog_fetch',err.message);
    else{S.refreshing=false;S.refreshFailed=err.message;emit()}
  });
}
`);
assert.ok(!core.includes('EX_KEY')&&!core.includes('FKCatalog.fetchJson')&&!core.includes('FKCatalog.fetchExisting'));
output['fk-core.js']=core;
for(const name of ['app.html','index.html']) {
 assert.ok(original[name].includes('0.8.85'),'Expected version 0.8.85');
 output[name]=original[name].replaceAll('0.8.85','0.8.86');
}
output['index.html']=once(output['index.html'],'<script src="fk-catalog.js?v=0.8.86"></script>','<script src="fk-catalog-data.js?v=0.8.86"></script>\n<script src="fk-catalog.js?v=0.8.86"></script>');
assert.ok(output['app.html'].includes("window.FK_V='0.8.86'"));
for(const name of names){assert.ok(Buffer.byteLength(output[name])<=25000,name+' exceeds size limit');assert.notEqual(output[name],original[name]);}
for(const name of names)await writeFile(name,output[name]);
