import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createWorkshopModels} from '../models/workshop.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(id) {
 const atlas={inside:{textures:'textures/blocks/hopper_inside'},outside:{textures:'textures/blocks/hopper_outside'},top:{textures:'textures/blocks/hopper_top'},leg:{textures:'textures/blocks/log_big_oak'},pivot:{textures:'textures/blocks/grindstone_pivot'},round:{textures:'textures/blocks/grindstone_round'},side:{textures:'textures/blocks/grindstone_side'},frame:{textures:'textures/blocks/itemframe_background'},glow:{textures:'textures/blocks/glow_item_frame'}};
 const definitions={hopper:{textures:{down:'inside',up:'top',side:'outside'}},grindstone:{textures:{down:'leg',up:'round',north:'pivot',east:'side',south:'side',west:'side'}},frame:{textures:'frame'},glow_frame:{textures:'glow'}};
 const kind=id==='glow_frame'?'frame':id,icons=id==='frame'?['textures/items/item_frame']:id==='glow_frame'?['textures/items/glow_item_frame']:[];
 const record=normalizeBlock(id,definitions[id],atlas,{model:kind,icons}),Three=createThreeMock(),model=createWorkshopModels(Three).find(m=>m.id===kind);
 const catalog={schema:1,records:{[id]:record},items:{},aliases:{},families:{},resources:{}},registry={get:()=>model,build:(key,E)=>model.build(E)};
 return {record,Three,resolve:createPreviewResolver(catalog,registry),env:()=>({mats:Object.fromEntries(record.paths.map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}})};
}
test('hopper, grindstone and both frames are explicitly assigned without absorbing unrelated devices',()=>{
 const plan=planModelAssignments({hopper:{},grindstone:{},frame:{},glow_frame:{},future_device:{}});
 assert.deepEqual(plan.unresolved,['future_device']);assert.equal(plan.assignments.hopper.model,'hopper');assert.equal(plan.assignments.grindstone.model,'grindstone');assert.equal(plan.assignments.frame.model,'frame');assert.equal(plan.assignments.glow_frame.model,'frame');
});
test('accepted hopper, grindstone and frame geometry survives every edited resource slot',()=>{
 for(const [id,count]of [['hopper',32],['grindstone',26],['frame',6],['glow_frame',6]]){
  const s=setup(id),before=JSON.stringify(s.record);let expected;
  for(const slot of s.record.paths){
   const E=s.env();s.resolve({id,slot}).build(E);const m=meshesOf(E.group);assert.equal(m.length,count,id);
   assert.ok(m.every(mesh=>mesh.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
   const snapshot=m.map(mesh=>({size:mesh.geometry.size,path:mesh.material.path,uv:mesh.geometry.rows,x:mesh.position.x,y:mesh.position.y,z:mesh.position.z}));
   expected??=snapshot;assert.deepEqual(snapshot,expected,id);
  }
  assert.equal(JSON.stringify(s.record),before);
 }
});
test('frames use their block background, not the edited item icon',()=>{
 for(const id of ['frame','glow_frame']){
  const s=setup(id),E=s.env();s.resolve({id,slot:s.record.icons[0]}).build(E);
  const meshes=meshesOf(E.group);assert.ok(meshes.every(m=>m.material.path.startsWith('textures/blocks/')));
  assert.ok(meshes.filter(m=>m.geometry.size[0]===1&&m.geometry.size[1]===1).length===2);
 }
});
test('missing workshop materials reject the model before a partial scene is inserted',()=>{
 const s=setup('hopper'),E=s.env();delete E.mats['textures/blocks/hopper_top'];
 assert.throws(()=>s.resolve({id:'hopper'}).build(E),/Missing model material/);assert.equal(E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
 assert.throws(()=>createWorkshopModels({}),/require Three/);
});
