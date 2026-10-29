import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
test('bamboo fixtures use their own catalog material and bounded atlas UVs',async()=>{
  const dir=new URL('../data/catalog-candidate/',import.meta.url),B=JSON.parse(await readFile(new URL('blocks-000.json',dir),'utf8')),T={texture_data:{}};
  for(const n of (await readdir(dir)).filter(n=>/^terrain-\d+\.json$/.test(n)))Object.assign(T.texture_data,JSON.parse(await readFile(new URL(n,dir),'utf8')));
  let fallback=0;const ctx={FKShapes:{build(){fallback++}},THREE:{PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.uvs=[];this.attributes={uv:{count:4,getX:i=>i%2,getY:i=>i<2?1:0,setXY:(i,u,v)=>this.uvs.push([u,v])}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set(){}};this.rotation={set(){}}}}}};
  ctx.window=ctx;vm.createContext(ctx);
  for(const n of ['fk-catalog.js','fk-fixtures.js'])vm.runInContext(await readFile(new URL('../'+n,import.meta.url),'utf8'),ctx);
  const raw=ctx.FKCatalog.build(B,T);
  for(const [id,count] of [['bamboo_fence',26],['bamboo_fence_gate',38]]){
    const path=raw.b[id][0];let expected=T.texture_data[B[id].textures].textures;if(Array.isArray(expected))expected=expected[0];if(typeof expected==='object')expected=expected.path;
    assert.equal(path,expected);assert.notEqual(path,raw.b.bamboo_planks[0]);
    const material={},group={children:[],add(m){this.children.push(m)}};
    ctx.FKShapes.build({cur:id,faceMap:{up:path},mats:{[path]:material},group});
    assert.equal(group.children.length,count,id);
    for(const m of group.children){assert.equal(m.material,material);assert.ok(m.geometry.w>0&&m.geometry.h>0);for(const uv of m.geometry.uvs)for(const v of uv)assert.ok(v>=0&&v<=1)}
  }
  assert.equal(fallback,0);ctx.FKShapes.build({cur:'oak_fence'});assert.equal(fallback,1);
});
