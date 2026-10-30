import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createTrackModels} from '../models/tracks.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const IDS=['rail','golden_rail','detector_rail','activator_rail'];
function setup() {
 const records=Object.fromEntries(IDS.map(id=>[id,normalizeBlock(id,{textures:{up:'alternate',down:'base',side:'base'}},{base:{textures:'textures/blocks/'+id+'_base'},alternate:{textures:'textures/blocks/'+id+'_alternate'}},{model:'track'})]));
 const Three=createThreeMock(),model=createTrackModels(Three)[0],registry={get:()=>model,build:(id,E)=>model.build(E)};
 const c={schema:1,records,items:{},aliases:{},families:{},resources:{}};
 const env=()=>({mats:Object.fromEntries(Object.values(records).flatMap(r=>r.paths).map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}});
 return {records,Three,model,resolve:createPreviewResolver(c,registry),env};
}
test('all four rail records are explicitly assigned to the shared track builder',()=>{
 const plan=planModelAssignments(Object.fromEntries(IDS.map(id=>[id,{}])));assert.deepEqual(plan.unresolved,[]);
 for(const id of IDS)assert.equal(plan.assignments[id].model,'track');
 assert.deepEqual(planModelAssignments({future_rail:{}}).unresolved,['future_rail']);
});
test('curvature and power select the correct material without following the edit slot',()=>{
 const s=setup(),before=JSON.stringify(s.records);
 for(const id of IDS)for(const alternate of [false,true])for(const slot of s.records[id].paths){
  const state=id==='rail'?{curved:alternate}:{powered:alternate?'on':'off'},E=s.env();
  s.resolve({id,slot,state}).build(E);const m=meshesOf(E.group);assert.equal(m.length,1);
  assert.equal(m[0].material.path,alternate?s.records[id].faces.up[0]:s.records[id].faces.down[0]);
  assert.deepEqual(m[0].geometry.size,[1,1]);assert.equal(m[0].rotation.x,-Math.PI/2);assert.equal(m[0].position.y,0);assert.equal(m[0].material.side,2);
 }
 assert.equal(JSON.stringify(s.records),before);
});
test('defaults are straight or unpowered, and impossible rail states are rejected before insertion',()=>{
 const s=setup();for(const id of IDS){const E=s.env();s.resolve({id}).build(E);assert.equal(meshesOf(E.group)[0].material.path,s.records[id].faces.down[0]);}
 for(const [id,state] of [['rail',{curved:'yes'}],['rail',{powered:'on'}],['golden_rail',{powered:true}],['detector_rail',{curved:true}],['activator_rail',{powered:'maybe'}]]){
  const E=s.env();assert.throws(()=>s.resolve({id,state}).build(E));assert.equal(E.group.children.length,0);
 }
 const E=s.env();delete E.mats[s.records.rail.faces.up[0]];assert.throws(()=>s.resolve({id:'rail',state:{curved:true}}).build(E),/Missing model material/);assert.equal(E.group.children.length,0);
 assert.throws(()=>createTrackModels({}),/require Three/);
});
