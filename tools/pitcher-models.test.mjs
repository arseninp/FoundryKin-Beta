import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {attachDependencies,declaredDependencies} from '../catalog/rules/dependencies.mjs';
import {compileStateGroups,powerRules} from '../catalog/states.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createPitcherModels} from '../models/pitcher.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup() {
 const P='textures/blocks/',atlas={top:{textures:P+'pitcher_crop_top'},bottom:{textures:P+'pitcher_crop_bottom'},side:{textures:P+'pitcher_crop_side'},lower:{textures:[1,2,3,4].map(n=>P+'pitcher_crop_bottom_stage_'+n)},upper:{textures:[3,4].map(n=>P+'pitcher_crop_top_stage_'+n)},grown_lower:{textures:P+'pitcher_crop_bottom_stage_4'},grown_upper:{textures:P+'pitcher_crop_top_stage_4'}};
 const defs={pitcher_crop:{textures:{up:'top',down:'bottom',north:'side',south:'lower',east:'upper',west:'upper'}},pitcher_plant:{textures:{up:'grown_upper',down:'grown_lower',side:'grown_lower'},carried_textures:'grown_upper'}};
 const raw=Object.fromEntries(Object.entries(defs).map(([id,def])=>[id,normalizeBlock(id,def,atlas,{model:'pitcher'})]));
 const paths=[...new Set(Object.values(raw).flatMap(r=>r.paths))],inventory=Object.fromEntries(paths.map(path=>[path,1]));
 const records=attachDependencies(raw,declaredDependencies({pitcher_crop:{model:'pitcher'},pitcher_plant:{model:'pitcher'}}),inventory),state=compileStateGroups(records,powerRules(records));
 const catalog={schema:1,records,items:{},aliases:{},families:{},resources:{},cards:state.cards,stateGroups:state.groups,stateRoutes:state.routes};
 const Three=createThreeMock(),model=createPitcherModels(Three)[0],registry={get:()=>model,build:(id,E)=>model.build(E)};
 return {catalog,records,paths,resolve:createPreviewResolver(catalog,registry),env:()=>({mats:Object.fromEntries(paths.map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}})};
}
test('pitcher crop and grown plant share one card while both saved IDs retain their source form',()=>{
 const s=setup();assert.deepEqual(s.catalog.cards,['pitcher_plant']);
 assert.equal(s.resolve({id:'pitcher_crop'}).object.id,'pitcher_crop');assert.equal(s.resolve({id:'pitcher_plant'}).object.id,'pitcher_plant');
 assert.equal(s.resolve({id:'pitcher_plant',state:{variant:'crop',stage:3}}).object.id,'pitcher_crop');
 assert.equal(s.records.pitcher_plant.paths.length,2);assert.ok(!s.records.pitcher_plant.paths.includes('textures/blocks/pitcher_crop_side'));
});
test('all five growth stages keep the accepted pod and crossed lower/upper sections independently of edit slot',()=>{
 const s=setup(),before=JSON.stringify(s.catalog);
 for(let stage=0;stage<=4;stage++)for(const slot of s.paths){
  const p=s.resolve({id:'pitcher_crop',slot,state:{stage}}),E=s.env();p.build(E);
  assert.equal(meshesOf(E.group).length,stage===0?6:stage<3?8:10);
 }
 const grown=s.env();s.resolve({id:'pitcher_plant'}).build(grown);assert.equal(meshesOf(grown.group).length,10);
 const pod=s.env();s.resolve({id:'pitcher_plant',state:{pod_only:true}}).build(pod);assert.equal(meshesOf(pod.group).length,6);
 assert.equal(JSON.stringify(s.catalog),before);
});
test('invalid stages, invalid pod flag and missing shared materials fail without attaching partial geometry',()=>{
 const s=setup();
 for(const stage of [-1,5,'2',1.5])assert.throws(()=>s.resolve({id:'pitcher_crop',state:{stage}}).build(s.env()),/Invalid pitcher stage/);
 assert.throws(()=>s.resolve({id:'pitcher_plant',state:{stage:2}}).build(s.env()),/Invalid pitcher stage/);
 assert.throws(()=>s.resolve({id:'pitcher_plant',state:{pod_only:'yes'}}).build(s.env()),/Invalid pitcher pod view/);
 const E=s.env();delete E.mats['textures/blocks/pitcher_crop_side'];assert.throws(()=>s.resolve({id:'pitcher_plant'}).build(E),/Missing model material/);assert.equal(E.group.children.length,0);
});
