import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createWireModels} from '../models/wires.mjs';
import {createPlanarModels} from '../models/planar.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup() {
 const cross='textures/blocks/redstone_dust_cross',line='textures/blocks/redstone_dust_line',icon='textures/items/redstone_dust';
 const record=normalizeBlock('redstone_wire',{textures:{up:'cross',down:'line',side:'line'}},{cross:{textures:cross},line:{textures:line}},{model:'redstone_wire',icons:[icon]});
 const Three=createThreeMock(),models=Object.fromEntries([...createWireModels(Three),...createPlanarModels(Three)].map(m=>[m.id,m]));
 const registry={get:id=>models[id],build:(id,E)=>models[id].build(E)};
 const catalog={schema:1,records:{redstone_wire:record},items:{},aliases:{},families:{},resources:{}};
 return {cross,line,icon,record,Three,resolve:createPreviewResolver(catalog,registry),env:()=>({mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}})};
}
test('redstone wire defaults to a cross and keeps the accepted centered horizontal sheet',()=>{
 const s=setup(),E=s.env();s.resolve({id:'redstone_wire'}).build(E);const m=meshesOf(E.group);
 assert.equal(m.length,1);assert.deepEqual(m[0].geometry.size,[1,1]);assert.equal(m[0].rotation.x,-Math.PI/2);assert.deepEqual([m[0].position.x,m[0].position.y,m[0].position.z],[0,0,0]);
 assert.equal(m[0].material.path,s.cross);assert.equal(m[0].material.side,2);
});
test('cross and line are explicit states independent of all edited PNGs including the icon',()=>{
 const s=setup(),before=JSON.stringify(s.record);
 for(const pattern of ['cross','line'])for(const slot of s.record.paths){
  const E=s.env();s.resolve({id:'redstone_wire',slot,state:{pattern}}).build(E);
  assert.equal(meshesOf(E.group)[0].material.path,pattern==='cross'?s.cross:s.line);
 }
 assert.equal(JSON.stringify(s.record),before);
 const E=s.env();const p=s.resolve({id:'redstone_wire',slot:s.icon,view:'sprite'});assert.equal(p.model,'sprite');p.build(E);assert.equal(meshesOf(E.group)[0].material.path,s.icon);
});
test('invalid patterns and missing materials fail without adding a partial wire',()=>{
 const s=setup();for(const pattern of ['invalid',false,1]){const E=s.env();assert.throws(()=>s.resolve({id:'redstone_wire',state:{pattern}}).build(E),/Invalid redstone wire pattern/);assert.equal(E.group.children.length,0);}
 const E=s.env();delete E.mats[s.line];assert.throws(()=>s.resolve({id:'redstone_wire',state:{pattern:'line'}}).build(E),/Missing model material/);assert.equal(E.group.children.length,0);
 assert.throws(()=>createWireModels({}),/require Three/);
});
