import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createStrandModels} from '../models/strands.mjs';
function setup(id){
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.size=[w,h];}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.rotation={};this.position={set:(...v)=>{this.xyz=v;}};}}};
 const paths=(id==='pale_hanging_moss'?['pale_hanging_moss_middle','pale_hanging_moss_tip']:['down','up'].flatMap(d=>['base','middle','frustum','tip','tip_merge'].map(p=>'sulfur_spike_'+d+'_'+p))).map(n=>'textures/blocks/'+n);
 const record={model:id,paths,icons:[],faces:{up:paths,down:paths}};
 const catalog={schema:1,records:{[id]:record},items:{},aliases:{},families:{},resources:{}};
 const models=new Map(createStrandModels(Three).map(m=>[m.id,m]));
 const registry={get:id=>models.get(id),build:(id,env)=>models.get(id).build(env)};
 const resolve=createPreviewResolver(catalog,registry);
 return {record,resolve,environment:()=>({mats:Object.fromEntries(paths.map(p=>[p,{path:p}])),group:{children:[],add(m){this.children.push(m);}}})};
}
test('normalized sulfur paths bind to real builder roles, not six generic faces',()=>{
 const s=setup('sulfur_spike'),preview=s.resolve({id:'sulfur_spike',state:{direction:'up',merged:true}}),env=s.environment();preview.build(env);
 assert.equal(Object.keys(preview.faceMap).length,10);assert.equal(env.group.children.length,8);
 assert.equal(env.group.children[6].material.path,'textures/blocks/sulfur_spike_up_tip_merge');
 assert.deepEqual(env.group.children.map(m=>m.xyz[1]),[-.75,-.75,-.25,-.25,.25,.25,.75,.75]);
});
test('moss resolves both named parts from the resource inventory',()=>{
 const s=setup('pale_hanging_moss'),preview=s.resolve({id:'pale_hanging_moss'}),env=s.environment();preview.build(env);
 assert.deepEqual(Object.keys(preview.faceMap),['middle','tip']);assert.equal(env.group.children.length,4);
});
test('missing and ambiguous named paths are rejected before dispatch',()=>{
 const s=setup('sulfur_spike');s.record.paths.pop();assert.throws(()=>s.resolve({id:'sulfur_spike'}),/Missing or ambiguous/);
 const m=setup('pale_hanging_moss');m.record.paths.push('textures/custom/pale_hanging_moss_middle');assert.throws(()=>m.resolve({id:'pale_hanging_moss'}),/Missing or ambiguous/);
});
test('invalid state is rejected during selection, before drawing starts',()=>{
 const s=setup('sulfur_spike');assert.throws(()=>s.resolve({id:'sulfur_spike',state:{direction:'left'}}),/Invalid sulfur/);
 assert.throws(()=>s.resolve({id:'sulfur_spike',state:{merged:1}}),/Invalid sulfur/);
});
