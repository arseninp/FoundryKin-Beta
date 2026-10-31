import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlanarModels} from '../models/planar.mjs';
function setup(id,overrides={}) {
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.size=[w,h];}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set:(...v)=>{this.angles=v;}};}}};
 const env={slot:'icon',faceMap:{up:'top',south:'side'},mats:{icon:{id:'icon'},top:{id:'top'},side:{id:'side'},variant:{id:'variant'}},hiddenMat:{},group:{children:[],add(mesh){this.children.push(mesh);}},...overrides};
 const models=createPlanarModels(Three);return {Three,env,models,build:()=>models.find(m=>m.id===id).build(env)};
}
function snapshot(env){return env.group.children.map(m=>[m.material.id,m.geometry.size,m.xyz,m.angles]);}
test('simple plant has two full axis-aligned planes with accepted width',()=>{
 const s=setup('cross');s.build();assert.equal(s.env.group.children.length,2);
 assert.deepEqual(s.env.group.children.map(m=>m.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);
 assert.deepEqual(s.env.group.children.map(m=>m.angles),[[0,0,0],[0,Math.PI/2,0]]);
 assert.ok(s.env.group.children.every(m=>m.material.id==='top'&&m.material.side===2));
});
test('sprite uses selected resource regardless of its directory and declares sprite camera mode',()=>{
 const s=setup('sprite');s.env.slot='textures/entity/shield';s.env.mats[s.env.slot]={id:s.env.slot};s.build();
 assert.equal(s.models.find(m=>m.id==='sprite').mode,'sprite');
 assert.equal(s.env.group.children[0].material.id,'textures/entity/shield');
 assert.deepEqual(s.env.group.children[0].geometry.size,[1.1,1.1]);
});
test('horizontal surface does not change when the editor selects a different PNG',()=>{
 const a=setup('rail'),b=setup('rail',{slot:'side'});a.build();b.build();assert.deepEqual(snapshot(a.env),snapshot(b.env));
 assert.deepEqual(a.env.group.children[0].angles,[-Math.PI/2,0,0]);
 const c=setup('rail',{previewPath:'variant'});c.build();assert.equal(c.env.group.children[0].material.id,'variant');
});
test('decal retains its wall offset and ignores unrelated texture slots',()=>{
 const s=setup('decal');s.build();const mesh=s.env.group.children[0];
 assert.deepEqual(mesh.xyz,[0,0,-.49]);assert.equal(mesh.material.id,'side');assert.equal(mesh.material.needsUpdate,true);
});
test('missing or hidden resource fails instead of creating an invisible placeholder',()=>{
 const s=setup('sprite');delete s.env.mats.icon;assert.throws(()=>s.build(),/Missing planar material/);assert.equal(s.env.group.children.length,0);
 const h=setup('cross');h.env.mats.top=h.env.hiddenMat;assert.throws(()=>h.build(),/Missing planar material/);
});
test('invalid Three dependency fails; existing group children are not repositioned',()=>{
 assert.throws(()=>createPlanarModels({}),/require Three/);
 const s=setup('rail'),existing={position:{y:9}};s.env.group.children.push(existing);s.build();assert.equal(existing.position.y,9);
});

const planarIds=['cross','sprite','rail','decal','stage_cross'];
function stagedSetup(id) {return setup(id,{bindings:{stage_0:'top',stage_1:'variant',stage_2:'variant',stage_3:'side'},state:{}});}
test('cross and staged cross retain identical geometry and ignore the editing slot',()=>{
 const expected=stagedSetup('cross');expected.build();
 for(const id of ['cross','stage_cross'])for(const slot of ['top','side','icon']) {
  const s=stagedSetup(id);s.env.slot=slot;s.build();assert.deepEqual(snapshot(s.env),snapshot(expected.env));
 }
});
test('staged cross keeps repeated indices and selects only the explicit stage',()=>{
 const sequence=['top','variant','variant','side'];
 for(let stage=0;stage<sequence.length;stage++) {
  const s=stagedSetup('stage_cross');s.env.state={stage};const before=JSON.stringify({bindings:s.env.bindings,state:s.env.state});s.build();
  assert.equal(s.env.group.children.length,2);assert.ok(s.env.group.children.every(mesh=>mesh.material.id===sequence[stage]));
  assert.equal(JSON.stringify({bindings:s.env.bindings,state:s.env.state}),before);
 }
 for(const stage of [-1,4,1.5,'1']){const s=stagedSetup('stage_cross');s.env.state={stage};assert.throws(s.build,/Invalid staged cross stage/);assert.equal(s.env.group.children.length,0);}
 const gap=stagedSetup('stage_cross');delete gap.env.bindings.stage_1;assert.throws(gap.build,/Invalid staged cross stage/);
});
test('every planar builder cleans allocated geometries and preserves scene and materials on allocation failure',()=>{
 for(const id of planarIds) {
  const s=stagedSetup(id),created=[],existing={position:{y:9}},before=JSON.stringify(s.env.mats),Base=s.Three.PlaneGeometry;
  s.env.group.children.push(existing);
  s.Three.PlaneGeometry=class extends Base{constructor(...args){if(created.length===(id==='cross'||id==='stage_cross'?1:0))throw new Error('allocation');super(...args);created.push(this);}dispose(){this.disposed=true;}};
  assert.throws(s.build,/allocation/);assert.deepEqual(s.env.group.children,[existing]);assert.equal(JSON.stringify(s.env.mats),before);assert.ok(created.every(g=>g.disposed));
 }
});
test('every planar builder disposes geometry if mesh construction or transform setup fails',()=>{
 for(const id of planarIds)for(const failure of ['mesh','position','rotation']) {
  const s=stagedSetup(id),created=[],BaseGeometry=s.Three.PlaneGeometry,BaseMesh=s.Three.Mesh,before=JSON.stringify(s.env.mats);
  s.Three.PlaneGeometry=class extends BaseGeometry{constructor(...args){super(...args);created.push(this);}dispose(){this.disposed=true;}};
  s.Three.Mesh=class extends BaseMesh{constructor(...args){super(...args);if(failure==='mesh')throw new Error('construction');this[failure].set=()=>{throw new Error('construction');};}};
  assert.throws(s.build,/construction/);assert.equal(s.env.group.children.length,0);assert.equal(JSON.stringify(s.env.mats),before);assert.ok(created.length>0&&created.every(g=>g.disposed));
 }
});
test('every planar builder rejects a missing target before allocating geometry or changing materials',()=>{
 for(const id of planarIds) {
  const s=stagedSetup(id),before=JSON.stringify(s.env.mats);let allocations=0;
  s.env.group={};s.Three.PlaneGeometry=class{constructor(){allocations++;}};
  assert.throws(s.build,/Missing planar environment/);assert.equal(allocations,0);assert.equal(JSON.stringify(s.env.mats),before);
 }
});
test('all planar builders reject missing and hidden materials without scene changes',()=>{
 for(const id of planarIds)for(const hidden of [false,true]) {
  const s=stagedSetup(id),path=id==='sprite'?'icon':id==='decal'?'side':'top',existing={position:{y:9}};
  s.env.group.children.push(existing);if(hidden)s.env.mats[path]=s.env.hiddenMat;else delete s.env.mats[path];
  assert.throws(s.build,/Missing planar material/);assert.deepEqual(s.env.group.children,[existing]);
 }
});
