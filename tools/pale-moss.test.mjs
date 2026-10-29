import test from 'node:test';
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
