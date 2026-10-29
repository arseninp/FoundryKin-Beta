import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
// Visible atlas rows 0..11 transcribed from the owner's screenshot.
// This is a partial visual reference, not a decoded original PNG or a WebGL test.
const rows=['##..............','##.####.##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...','##......##.##...','##......##.##...','##......##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...'];
test('bamboo gate uses visible opaque atlas regions without stretching',async()=>{
 const ctx={FKCatalog:{index(){}},FKShapes:{build(){throw new Error('Unexpected fallback')}},THREE:{PlaneGeometry:class{constructor(w,h){this.w=w;this.h=h;this.coords=[];this.attributes={uv:{count:4,getX:i=>i%2,getY:i=>i<2?1:0,setXY:(i,u,v)=>this.coords.push([u,v])}}}},Mesh:class{constructor(g,m){this.geometry=g;this.material=m;this.position={set(){}};this.rotation={set(){}}}}}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(await readFile(new URL('../fk-fixtures.js',import.meta.url),'utf8'),ctx);
 const meshes=[],material={};ctx.FKShapes.build({cur:'bamboo_fence_gate',faceMap:{up:'gate'},mats:{gate:material},group:{add:m=>meshes.push(m)}});
 assert.equal(meshes.length,38);
 for(const m of meshes){
  assert.equal(m.material,material);
  const u=m.geometry.coords.map(p=>p[0]*16),v=m.geometry.coords.map(p=>(1-p[1])*16),x0=Math.min(...u),x1=Math.max(...u),y0=Math.min(...v),y1=Math.max(...v);
  assert.ok(Math.abs(x1-x0-m.geometry.w*16)<1e-8,'horizontal texel density');
  assert.ok(Math.abs(y1-y0-m.geometry.h*16)<1e-8,'vertical texel density');
  for(let y=Math.round(y0);y<Math.round(y1);y++)for(let x=Math.round(x0);x<Math.round(x1);x++)assert.equal(rows[y]?.[x],'#','Transparent or unverified atlas cell '+x+','+y);
 }
});
