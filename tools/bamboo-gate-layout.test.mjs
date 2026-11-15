import test from 'node:test';
import assert from 'node:assert/strict';
import {createBambooModels} from '../models/bamboo.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
// Visible atlas rows 0..11 transcribed from the owner's screenshot.
// This is a partial visual reference, not a decoded original PNG or a WebGL test.
const rows=['##..............','##.####.##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...','##......##.##...','##......##.##...','##......##.##...','##.####.##.##...','##.####.##.##...','##.####.##.##...'];
test('bamboo gate uses visible opaque atlas regions without stretching',()=>{
 const Three=createThreeMock(),model=createBambooModels(Three).find(entry=>entry.id==='bamboo_gate'),group=new Three.Group(),material={};
 assert.ok(model);model.build({cur:'bamboo_fence_gate',bindings:{up:'gate'},faceMap:{up:'gate'},mats:{gate:material},group});
 const meshes=meshesOf(group);assert.equal(meshes.length,38);
 for(const mesh of meshes){
  assert.equal(mesh.material,material);
  const u=mesh.geometry.rows.map(point=>point[0]*16),v=mesh.geometry.rows.map(point=>(1-point[1])*16),x0=Math.min(...u),x1=Math.max(...u),y0=Math.min(...v),y1=Math.max(...v);
  assert.ok(Math.abs(x1-x0-mesh.geometry.size[0]*16)<1e-8,'horizontal texel density');
  assert.ok(Math.abs(y1-y0-mesh.geometry.size[1]*16)<1e-8,'vertical texel density');
  for(let y=Math.round(y0);y<Math.round(y1);y++)for(let x=Math.round(x0);x<Math.round(x1);x++)assert.equal(rows[y]?.[x],'#','Transparent or unverified atlas cell '+x+','+y);
 }
});
