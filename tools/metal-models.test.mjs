import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createMetalModels} from '../models/metals.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(model,roles,state) {
 const Three=createThreeMock(),descriptor=createMetalModels(Three).find(m=>m.id===model),E={bindings:roles,faceMap:roles,state,mats:Object.fromEntries(Object.values(roles).map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {Three,E,build:()=>descriptor.build(E)};
}
test('nine bars, eight lightning rods, end rod and heavy core get explicit dedicated geometry',()=>{
 const expected={iron_bars:'bars',end_rod:'end_rod',heavy_core:'heavy_core'};
 for(const prefix of ['','exposed_','weathered_','oxidized_'])for(const wax of ['','waxed_']){expected[wax+prefix+'copper_bars']='bars';expected[wax+prefix+'lightning_rod']='lightning_rod';}
 const plan=planModelAssignments(Object.fromEntries(Object.keys(expected).map(id=>[id,{}])));assert.deepEqual(plan.unresolved,[]);assert.equal(Object.keys(expected).length,19);
 for(const [id,model]of Object.entries(expected))assert.equal(plan.assignments[id].model,model,id);
 assert.deepEqual(planModelAssignments({copper_chest:{},copper_golem_statue:{}}).unresolved,['copper_chest','copper_golem_statue']);
});
test('accepted bars retain one sheet and four narrow edge planes rather than a glass pane box',()=>{
 const s=setup('bars',{north:'sheet',east:'edge'});s.build();const m=meshesOf(s.E.group);
 assert.equal(m.length,5);assert.equal(m[0].material.path,'sheet');assert.deepEqual(m.slice(1).map(x=>x.material.path),['edge','edge','edge','edge']);
 assert.deepEqual(m.map(x=>x.geometry.size),[[1,1],[.125,1],[.125,1],[1,.125],[1,.125]]);assert.ok(m.every(x=>x.material.side===2));
});
test('end rod, lightning rod and heavy core retain their accepted face counts and atlas bounds',()=>{
 for(const [model,roles,count]of [['end_rod',{up:'end'},11],['lightning_rod',{off:'off',on:'on'},11],['heavy_core',{up:'core'},6]]){
  const s=setup(model,roles);s.build();const m=meshesOf(s.E.group);assert.equal(m.length,count,model);assert.ok(m.every(mesh=>mesh.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
 }
});
test('lightning rods preserve both indexed materials and select power independently of edit slot',()=>{
 const off='textures/blocks/oxidized_lightning_rod',on='textures/blocks/lightning_rod_powered';
 const r=normalizeBlock('waxed_oxidized_lightning_rod',{textures:'rod'},{rod:{textures:[off,on]}},{model:'lightning_rod'});
 assert.deepEqual(r.bindings,{off:[off],on:[on]});
 const Three=createThreeMock(),model=createMetalModels(Three).find(m=>m.id==='lightning_rod'),c={schema:1,records:{[r.id]:r},items:{},aliases:{},families:{},resources:{}},registry={get:()=>model,build:(id,E)=>model.build(E)},resolve=createPreviewResolver(c,registry);
 for(const powered of ['off','on'])for(const slot of r.paths){const E={mats:{[off]:{path:off},[on]:{path:on}},hiddenMat:{},group:new Three.Group()};resolve({id:r.id,slot,state:{powered}}).build(E);assert.ok(meshesOf(E.group).every(m=>m.material.path===(powered==='on'?on:off)));}
 const s=setup('lightning_rod',{off:'off',on:'on'},{powered:true});assert.throws(s.build,/Invalid lightning rod power state/);assert.equal(s.E.group.children.length,0);
});
test('missing materials reject metal models before a partial scene can be inserted',()=>{
 const s=setup('bars',{north:'sheet',east:'edge'});delete s.E.mats.edge;assert.throws(s.build,/Missing model material/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 assert.throws(()=>createMetalModels({}),/require Three/);
});
