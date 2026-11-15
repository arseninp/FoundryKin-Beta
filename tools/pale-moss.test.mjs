/* Pale moss contracts use the production library and resolver, never legacy globals. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createModelLibrary} from '../models/library.mjs';
import {paleMossState} from '../models/moss.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const DIRS=['north','south','east','west'],LEVELS=['none','short','tall'];
const ROLES={up:'top',down:'top',north:'top',south:'top',east:'top',west:'top',side_base:'base',side_tip:'tip'};
function snapshot(group){return group.children.map(node=>({position:[node.position.x,node.position.y,node.position.z],rotation:[node.rotation.x,node.rotation.y,node.rotation.z],...(node.geometry?{size:node.geometry.size,uv:node.geometry.rows,material:node.material.path}:{}),children:node.children?snapshot(node):[]}));}
test('all 162 pale moss states build consistent base and side geometry through the library',()=>{
 const Three=createThreeMock(),registry=createModelLibrary(Three);let count=0;
 for(const upper of [false,true])for(const n of LEVELS)for(const s of LEVELS)for(const e of LEVELS)for(const w of LEVELS){
  const values=[n,s,e,w],state={upper_block_bit:upper};DIRS.forEach((dir,i)=>state['pale_moss_carpet_side_'+dir]=values[i]);
  const group=new Three.Group(),mats=Object.fromEntries(['top','base','tip'].map(path=>[path,{path}]));
  registry.build('pale_moss_carpet',{cur:'pale_moss_carpet',state,group,mats,bindings:ROLES,faceMap:ROLES});
  const shown=DIRS.filter((dir,i)=>values[i]!=='none'),sides=group.children.filter(node=>node.children);
  assert.equal(group.children.length,(upper?0:6)+shown.length);assert.equal(sides.length,shown.length);
  sides.forEach((side,i)=>{
   const dir=shown[i],level=values[DIRS.indexOf(dir)];assert.equal(side.children.length,2);
   assert.equal(side.rotation.y,{north:0,south:Math.PI,east:-Math.PI/2,west:Math.PI/2}[dir]);
   for(const mesh of side.children){assert.deepEqual(mesh.geometry.size,[1,1]);assert.equal(mesh.material.path,upper||level==='short'?'tip':'base');}
  });count++;
 }
 assert.equal(count,162);assert.throws(()=>paleMossState({upper_block_bit:'false'}));assert.throws(()=>paleMossState({pale_moss_carpet_side_north:'invalid'}));
});
test('actual catalog exposes both pale moss side images to the production resolver',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={},atlas={},existing={};
 for(const name of (await readdir(dir)).sort()){
  if(!/^(blocks|terrain|existing)-\d+\.json$/.test(name))continue;
  Object.assign(name.startsWith('blocks-')?blocks:name.startsWith('terrain-')?atlas:existing,JSON.parse(await readFile(new URL(name,dir),'utf8')));
 }
 assert.ok(Object.hasOwn(blocks,'pale_moss_carpet'));
 const record=normalizeBlock('pale_moss_carpet',blocks.pale_moss_carpet,atlas,{model:'pale_moss_carpet',existing});
 const catalog={schema:1,records:{pale_moss_carpet:record},items:{},aliases:{},families:{},resources:{}},Three=createThreeMock(),registry=createModelLibrary(Three);
 registry.validate(catalog.records);const resolve=createPreviewResolver(catalog,registry,Three),before=JSON.stringify(catalog),P='textures/blocks/';
 const expected=[P+'pale_moss_block',P+'pale_moss_carpet_side_base',P+'pale_moss_carpet_side_tip'];
 for(const path of expected){assert.ok(record.paths.includes(path),path);assert.ok(Object.hasOwn(existing,path),path);}
 let reference;
 for(const slot of record.paths){
  const plan=resolve({id:'pale_moss_carpet',slot,state:{pale_moss_carpet_side_north:'tall',pale_moss_carpet_side_west:'short'}});
  assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings.side_base,expected[1]);assert.deepEqual(plan.bindings.side_tip,expected[2]);
  const group=new Three.Group(),mats=Object.fromEntries(record.paths.map(path=>[path,{path}]));plan.build({group,mats});
  assert.equal(group.children.length,8);assert.deepEqual(meshesOf(group).slice(6).map(mesh=>mesh.material.path),[expected[1],expected[1],expected[2],expected[2]]);
  const shape=snapshot(group);reference??=shape;assert.deepEqual(shape,reference);
 }
 assert.equal(JSON.stringify(catalog),before);
 const missing={...existing};delete missing[expected[2]];
 assert.throws(()=>normalizeBlock('pale_moss_carpet',blocks.pale_moss_carpet,atlas,{model:'pale_moss_carpet',existing:missing}),/Missing resource file/);
});
