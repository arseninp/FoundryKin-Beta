/* One-time checked migration. Preview states never change exported pixels. */
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const names=['fk-catalog.js','fk-core.js','fk-fixtures.js','fk-view.js','app.html','index.html'];
const src=Object.fromEntries(await Promise.all(names.map(async n=>[n,await readFile(n,'utf8')]))),out={...src};
function once(s,a,b){assert.equal(s.split(a).length,2,'Anchor mismatch: '+a.slice(0,70));return s.replace(a,b)}
let cat=src['fk-catalog.js'];
cat=once(cat,'  return {b:b,p:p,cr:cr};',`  var extra={};
  function collect(value,paths){if(typeof value==='string'){if(paths.indexOf(value)<0)paths.push(value)}else if(Array.isArray(value))value.forEach(function(v){collect(v,paths)});else if(value&&typeof value.path==='string')collect(value.path,paths)}
  Object.keys(b).forEach(function(id){var e=B[id],t=e.textures,keys=typeof t==='string'?[t]:Object.keys(t).map(function(k){return t[k]}),paths=[];if(typeof e.carried_textures==='string')keys.push(e.carried_textures);keys.forEach(function(k){if(td[k])collect(td[k].textures,paths)});extra[id]=paths});
  return {b:b,p:p,cr:cr,extra:extra};`);out['fk-catalog.js']=cat;
let fx=src['fk-fixtures.js'];
fx=once(fx,'  return cat;\n};',`  var pm=cat.b.pale_moss_carpet;
  if(pm){
    var ex=(c.extra&&c.extra.pale_moss_carpet)||[],base=ex.filter(function(p){return /_side_base$/.test(p)})[0],tip=ex.filter(function(p){return /_side_tip$/.test(p)})[0];
    if(!base||!tip||!existing||!existing[base]||!existing[tip])throw new Error('Pale moss side resources are incomplete');
    var paths=[];pm.concat([base,tip]).forEach(function(p){if(paths.indexOf(p)<0)paths.push(p)});
    cat.sp.pale_moss_carpet={kind:'pale_moss',list:paths.map(function(p){return {id:p}}),fm:{up:pm[0],down:pm[1],north:pm[2],south:pm[3],east:pm[4],west:pm[5],sideBase:base,sideTip:tip}};
  }
  return cat;
};`);
const moss=String.raw`var MOSS_DIRS=['north','south','east','west'];
function paleState(input){
 input=input||{};var upper=input.upper_block_bit===undefined?false:input.upper_block_bit,sides={};
 if(typeof upper!=='boolean')throw new Error('Invalid upper_block_bit');
 MOSS_DIRS.forEach(function(d){var v=input['pale_moss_carpet_side_'+d]||'none';if(['none','short','tall'].indexOf(v)<0)throw new Error('Invalid moss side');sides[d]=v});
 return {upper:upper,sides:sides};
}
H.paleMossState=paleState;
H.stateSchema=function(id){
 if(id!=='pale_moss_carpet')return null;
 var schema=[{key:'upper_block_bit',label:['Upper part','Верхняя часть'],values:[{value:false,label:['No','Нет']},{value:true,label:['Yes','Да']}]}];
 MOSS_DIRS.forEach(function(d,i){schema.push({key:'pale_moss_carpet_side_'+d,label:[['North','South','East','West'][i],['Север','Юг','Восток','Запад'][i]],values:[{value:'none',label:['None','Нет']},{value:'short',label:['Short','Короткая']},{value:'tall',label:['Tall','Высокая']}]})});return schema;
};
/* Full-height inset side planes; transparent pixels define the visible outline.
 Java mossy_carpet_side is a geometry reference, Bedrock uses base/tip images. */
function paleMoss(E){
 var s=paleState(E.state),f=E.faceMap;
 if(!s.upper){var F={up:f.up,down:f.down,north:f.north,south:f.south,east:f.east,west:f.west},R={up:[0,0,16,16],down:[0,0,16,16],north:[0,15,16,16],south:[0,15,16,16],east:[0,15,16,16],west:[0,15,16,16]};box(E,[0,0,0],[16,1,16],F,R)}
 MOSS_DIRS.forEach(function(d){
  var level=s.sides[d];if(level==='none')return;
  var id=s.upper||level==='short'?f.sideTip:f.sideBase;
  if(!id||!E.mats[id])throw new Error('Missing pale moss side material');
  var g=new THREE.Group(),e=Object.create(E);e.group=g;
  face(e,id,1,1,0,0,-7.9/16,0,Math.PI,[16,0,0,16]);
  face(e,id,1,1,0,0,-7.9/16,0,0,[0,0,16,16]);
  g.rotation.y={north:0,east:-Q,south:Math.PI,west:Q}[d];E.group.add(g);
 });
}
`;
fx=once(fx,'function ladder(E){',moss+'function ladder(E){');
fx=once(fx,"  if(/_shelf$/.test(E.cur))return shelf(E);","  if(E.cur==='pale_moss_carpet')return paleMoss(E);\n  if(/_shelf$/.test(E.cur))return shelf(E);");out['fk-fixtures.js']=fx;
let core=src['fk-core.js'];
core=once(core,"var ed=$('#ed'),ectx=ed.getContext('2d'),listeners=[];","var ed=$('#ed'),ectx=ed.getContext('2d'),listeners=[],stateUi=window.FKModelState.create($('#shapesRow'),function(){build()});");
core=once(core,'function loadingUi(on){','function loadingUi(on){stateUi.busy(on);');
core=once(core,'mats:mats,refreshDoor:refreshDoor},resetView)','mats:mats,refreshDoor:refreshDoor,state:stateUi.value()},resetView)');
core=once(core,'cur=m;shape=spec.shape;','cur=m;stateUi.select(m,FKShapes.stateSchema?FKShapes.stateSchema(m):null);shape=spec.shape;');
core=once(core,'cr:c.cr,existing:existing,familyPlan:plan','cr:c.cr,extra:c.extra,existing:existing,familyPlan:plan');
core=once(core,'foundrykin.catalog.v5','foundrykin.catalog.v6');out['fk-core.js']=core;
out['fk-view.js']=once(src['fk-view.js'],'refreshDoor:entry.refreshDoor||function(){}}','refreshDoor:entry.refreshDoor||function(){},state:entry.state||{}}');
for(const n of ['app.html','index.html']){assert.ok(src[n].includes('0.8.87'));out[n]=src[n].replaceAll('0.8.87','0.8.88')}
out['index.html']=once(out['index.html'],'<script src="fk-core.js?v=0.8.88"></script>','<script src="fk-model-state.js?v=0.8.88"></script>\n<script src="fk-core.js?v=0.8.88"></script>');
out['fk-model-state.js']=`/* Generic model preview controls; no canvas, pack or localStorage writes. */
(function(root){
'use strict';
function create(anchor,changed){
 var doc=anchor.ownerDocument,host=doc.createElement('div'),values={},current='',schema=null,blocked=false;
 host.className='fk-edit-part';host.style.cssText='margin:12px 0;padding:8px;border:1px solid var(--line);border-radius:10px';anchor.parentNode.insertBefore(host,anchor.nextSibling);
 function visible(){host.hidden=blocked||!schema;host.inert=blocked}
 function select(id,spec){
  current=id;schema=spec;host.textContent='';visible();if(!schema)return;
  var ru=root.FK.lang()==='ru',title=doc.createElement('p');title.className='lbl';title.textContent=ru?'Состояние модели — только просмотр':'Model state — preview only';host.appendChild(title);
  var state=values[id]||(values[id]={});
  schema.forEach(function(item){
   var label=doc.createElement('label'),input=doc.createElement('select');
   label.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0';label.appendChild(doc.createTextNode(item.label[ru?1:0]));
   if(!Object.prototype.hasOwnProperty.call(state,item.key))state[item.key]=item.values[0].value;
   item.values.forEach(function(option,i){var o=doc.createElement('option');o.value=String(i);o.textContent=option.label[ru?1:0];input.appendChild(o)});
   input.value=String(item.values.map(function(o){return o.value}).indexOf(state[item.key]));
   input.addEventListener('change',function(){var option=item.values[Number(input.value)];if(option){state[item.key]=option.value;changed()}});
   label.appendChild(input);host.appendChild(label);
  });
 }
 return {select:select,busy:function(on){blocked=on;visible()},value:function(){return schema?Object.assign({},values[current]):{}}};
}
root.FKModelState={create:create};
})(window);
`;
for(const [n,t] of Object.entries(out))assert.ok(Buffer.byteLength(t)<=25000,n+' exceeds limit');
for(const [n,t] of Object.entries(out))await writeFile(n,t);
await writeFile('tools/pale-moss.test.mjs',String.raw`import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
async function context(){
 const ctx={FKShapes:{build(){}},THREE:{Group:class{constructor(){this.children=[];this.rotation={}}add(m){this.children.push(m)}},PlaneGeometry:class{constructor(w,h){this.width=w;this.height=h;this.attributes={uv:{count:4,getX:i=>i%2,getY:i=>i<2?1:0,setXY(){}}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set(){}};this.rotation={set(){}}}}}};
 ctx.window=ctx;vm.createContext(ctx);
 for(const n of ['fk-catalog.js','fk-sculk.js','fk-lights.js','fk-details.js','fk-fixtures.js'])vm.runInContext(await readFile(new URL('../'+n,import.meta.url),'utf8'),ctx);return ctx;
}
test('all 162 pale moss states build consistent base and side geometry',async()=>{
 const ctx=await context(),dirs=['north','south','east','west'],levels=['none','short','tall'];let count=0;
 for(const upper of [false,true])for(const n of levels)for(const s of levels)for(const e of levels)for(const w of levels){
  const vals=[n,s,e,w],state={upper_block_bit:upper};dirs.forEach((d,i)=>state['pale_moss_carpet_side_'+d]=vals[i]);
  const group=new ctx.THREE.Group(),mats={top:{},base:{},tip:{}};
  ctx.FKShapes.build({cur:'pale_moss_carpet',state,group,mats,faceMap:{up:'top',down:'top',north:'top',south:'top',east:'top',west:'top',sideBase:'base',sideTip:'tip'}});
  assert.equal(group.children.length,(upper?0:6)+vals.filter(v=>v!=='none').length);
  group.children.filter(c=>c.children).forEach(g=>{assert.equal(g.children.length,2);for(const m of g.children){assert.equal(m.geometry.width,1);assert.equal(m.geometry.height,1)}});count++;
 }
 assert.equal(count,162);assert.throws(()=>ctx.FKShapes.paleMossState({upper_block_bit:'false'}));assert.throws(()=>ctx.FKShapes.paleMossState({pale_moss_carpet_side_north:'invalid'}));
});
test('actual catalog exposes both pale moss side images inside the family',async()=>{
 const ctx=await context(),dir=new URL('../data/catalog-candidate/',import.meta.url),b={},t={texture_data:{}},existing={};
 for(const n of await readdir(dir)){if(!/^(blocks|terrain|existing)-\d+\.json$/.test(n))continue;Object.assign(n.startsWith('blocks-')?b:n.startsWith('terrain-')?t.texture_data:existing,JSON.parse(await readFile(new URL(n,dir),'utf8')))}
 const raw=ctx.FKCatalog.build(b,t),cat=ctx.FKCatalog.index(raw,existing),sp=cat.sp.pale_moss_carpet,paths=sp.list.map(s=>s.id);
 for(const p of ['textures/blocks/pale_moss_block','textures/blocks/pale_moss_carpet_side_base','textures/blocks/pale_moss_carpet_side_tip']){assert.ok(paths.includes(p),p);assert.ok(existing[p],p)}
 assert.equal(sp.fm.sideBase,'textures/blocks/pale_moss_carpet_side_base');assert.equal(sp.fm.sideTip,'textures/blocks/pale_moss_carpet_side_tip');
});
`);
