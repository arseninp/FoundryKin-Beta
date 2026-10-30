import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createGrowthModels} from '../models/growth.mjs';
import {createMechanismModels} from '../models/mechanisms.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const P = 'textures/blocks/';
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
function setup(factory, id, roles, state, cur) {
 const Three = createThreeMock(), model = factory(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {state, cur, bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
test('policy assigns crops, turtle egg, vine columns, portals, tripwire and hook explicitly', () => {
 const ids = ['wheat', 'carrots', 'potatoes', 'beetroot', 'turtle_egg', 'weeping_vines', 'twisting_vines', 'portal', 'end_portal_frame', 'trip_wire', 'tripwire_hook', 'sniffer_egg'];
 const plan = planModelAssignments(Object.fromEntries(ids.map(id => [id, {}])));
 const models = Object.fromEntries(Object.entries(plan.assignments).map(([id, a]) => [id, a.model]));
 assert.deepEqual(models, {beetroot: 'crop', carrots: 'crop', end_portal_frame: 'end_portal_frame', portal: 'portal', potatoes: 'crop', sniffer_egg: 'sniffer_egg', trip_wire: 'tripwire', tripwire_hook: 'tripwire_hook', turtle_egg: 'turtle_egg', twisting_vines: 'vines', weeping_vines: 'vines', wheat: 'crop'});
 assert.deepEqual(plan.unresolved, []);
});
test('registration exposes explicit builders; vine columns keep the two-block camera', () => {
 const Three = createThreeMock();
 assert.deepEqual(createGrowthModels(Three).map(m => [m.id, m.scale]), [['crop', 1], ['turtle_egg', 1], ['vines', 1.4], ['sniffer_egg', 1]]);
 assert.deepEqual(createMechanismModels(Three).map(m => [m.id, m.scale]), [['portal', 1], ['end_portal_frame', 1], ['tripwire', 1], ['tripwire_hook', 1]]);
 assert.throws(() => createGrowthModels({}), /require Three/);assert.throws(() => createMechanismModels({}), /require Three/);
});
test('crop is four double-sided planes of the bound stage; turtle egg is a 4 by 7 pixel box', () => {
 const c = setup(createGrowthModels, 'crop', {stage: 's'});c.build();const a = meshesOf(c.E.group);
 assert.equal(a.length, 4);assert.equal(c.mats.s.side, 2);assert.deepEqual(a.map(m => [m.position.x, m.position.z]), [[-.25, 0], [0, -.25], [.25, 0], [0, .25]]);
 const e = setup(createGrowthModels, 'turtle_egg', {stage: 's'});e.build();const b = meshesOf(e.E.group);
 assert.equal(b.length, 6);assert.ok(uvInside(b));assert.deepEqual(b.find(m => m.rotation.y === Math.PI).geometry.size, [.25, 7 / 16]);
});
test('weeping and twisting columns swap which image sits at the growing end', () => {
 const w = setup(createGrowthModels, 'vines', {up: 'base', down: 'head'}, {}, 'weeping_vines');w.build();
 const t = setup(createGrowthModels, 'vines', {up: 'base', down: 'head'}, {}, 'twisting_vines');t.build();
 const ys = s => meshesOf(s.E.group).map(m => [m.material.path, m.position.y]);
 assert.deepEqual(ys(w), [['head', -.5], ['head', -.5], ['base', .5], ['base', .5]]);assert.deepEqual(ys(t), [['head', .5], ['head', .5], ['base', -.5], ['base', -.5]]);
});
test('portal and tripwire are single double-sided planes', () => {
 for (const id of ['portal', 'tripwire']) {const s = setup(createMechanismModels, id, {up: 'p'});s.build();assert.equal(meshesOf(s.E.group).length, 1, id);assert.equal(s.mats.p.side, 2, id);}
});
test('end portal frame shows the eye only in the With eye state', () => {
 const roles = {up: 'u', down: 'd', north: 'n', south: 's', east: 'e', west: 'w', eye: 'y'};
 const a = setup(createMechanismModels, 'end_portal_frame', roles, {});a.build();const b = setup(createMechanismModels, 'end_portal_frame', roles, {eye: true});b.build();
 assert.equal(meshesOf(a.E.group).length, 6);assert.equal(meshesOf(b.E.group).length, 11);assert.ok(!meshesOf(a.E.group).some(m => m.material.path === 'y'));assert.ok(uvInside(meshesOf(b.E.group)));
 const {eye, ...noEye} = roles;assert.throws(setup(createMechanismModels, 'end_portal_frame', noEye, {eye: true}).build, /Missing end portal frame binding: eye/);
 assert.throws(setup(createMechanismModels, 'end_portal_frame', roles, {eye: 'yes'}).build, /Invalid end portal frame state/);
});
test('tripwire hook is tilted pieces bare and gains the string strip when attached', () => {
 const roles = {wood: 'w', hook: 'k', string: 's'};
 const a = setup(createMechanismModels, 'tripwire_hook', roles, {});a.build();const b = setup(createMechanismModels, 'tripwire_hook', roles, {attached: true});b.build();
 assert.equal(a.E.group.children.length, 8);assert.equal(meshesOf(a.E.group).length, 18);assert.equal(a.E.group.children.filter(x => x.children).length, 2);assert.ok(!meshesOf(a.E.group).some(m => m.material.path === 's'));
 assert.equal(b.E.group.children.length, 14);assert.equal(meshesOf(b.E.group).length, 19);assert.equal(b.E.group.children.filter(x => x.children).length, 2);assert.equal(b.mats.s.side, 2);
 const {string, ...bare} = roles;assert.throws(setup(createMechanismModels, 'tripwire_hook', bare, {attached: true}).build, /Missing tripwire hook binding: string/);
 assert.equal(setup(createMechanismModels, 'tripwire_hook', bare, {}).build(), undefined);
});
test('missing materials reject the model before anything is added and free geometry', () => {
 const s = setup(createMechanismModels, 'tripwire_hook', {wood: 'w', hook: 'k', string: 's'}, {attached: true});s.E.mats.s = s.E.hiddenMat;
 assert.throws(s.build, /Missing model material: s/);assert.equal(s.E.group.children.length, 0);assert.ok(s.Three.created.every(g => g.disposed));
 assert.throws(setup(createGrowthModels, 'crop', {up: 'x'}).build, /Missing crop binding: stage/);
 assert.throws(setup(createGrowthModels, 'vines', {up: 'x'}, {}, 'weeping_vines').build, /Missing vine column binding: down/);
});
function catalog(model, count, carried) {
 const names = Array.from({length: count}, (v, i) => P + model + '_stage_' + i), atlas = {s: {textures: names}, a: {textures: P + 'frame_eye'}, u: {textures: P + 'frame_top'}, d: {textures: P + 'frame_bottom'}, n: {textures: P + 'frame_side'}};
 const def = model === 'end_portal_frame' ? {textures: {up: 'u', down: 'd', side: 'n'}, carried_textures: 'a'} : {textures: 's'};
 void carried;return {schema: 1, records: {[model]: normalizeBlock(model, def, atlas, {model})}, items: {}, aliases: {}, families: {}, resources: {}};
}
test('preview picks the growth stage from the explicit state, never from the edited slot', () => {
 const Three = createThreeMock(), models = Object.fromEntries([...createGrowthModels(Three), ...createMechanismModels(Three)].map(m => [m.id, m]));
 const registry = {get: id => models[id], build: (id, E) => models[id].build(E)};
 const c = catalog('crop', 8), before = JSON.stringify(c), resolve = createPreviewResolver(c, registry), paths = c.records.crop.faces.up;
 const p = resolve({id: 'crop'}), q = resolve({id: 'crop', state: {stage: 3}});
 assert.deepEqual(p.bindings, {stage: paths[0]});assert.deepEqual(q.bindings, {stage: paths[3]});assert.equal(p.stages, 8);assert.equal(q.state.stage, 3);
 for (const slot of c.records.crop.paths) assert.deepEqual(resolve({id: 'crop', slot, state: {stage: 5}}).bindings, {stage: paths[5]});
 const mats = Object.fromEntries(c.records.crop.paths.map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 q.build(E);assert.equal(E.group.children.length, 4);assert.ok(E.group.children.every(m => m.material.path === paths[3]));
 for (const bad of [8, -1, 1.5, '2']) assert.throws(() => resolve({id: 'crop', state: {stage: bad}}), /Invalid crop stage/);
 const egg = createPreviewResolver(catalog('turtle_egg', 3), registry)({id: 'turtle_egg', state: {stage: 2}});assert.equal(egg.stages, 3);assert.equal(egg.model, 'turtle_egg');
 assert.equal(JSON.stringify(c), before);
});
test('preview binds the end portal frame eye from the carried image and rejects bad mechanism states', () => {
 const Three = createThreeMock(), models = Object.fromEntries(createMechanismModels(Three).map(m => [m.id, m]));
 const registry = {get: id => models[id], build: (id, E) => models[id].build(E)}, c = catalog('end_portal_frame', 1), resolve = createPreviewResolver(c, registry);
 const p = resolve({id: 'end_portal_frame', state: {eye: true}});
 assert.equal(p.bindings.eye, P + 'frame_eye');assert.equal(p.bindings.up, P + 'frame_top');assert.equal(p.stages, 0);
 const mats = Object.fromEntries(c.records.end_portal_frame.paths.map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 p.build(E);assert.equal(E.group.children.length, 11);
 assert.throws(() => resolve({id: 'end_portal_frame', state: {eye: 1}}), /Invalid end portal frame preview state/);
});
function snifferRecord() {
 const faces=['up','down','north','south','east','west'];
 const atlas=Object.fromEntries(faces.map(face=>[face,{textures:[0,1,2].map(stage=>P+'sniffer_'+stage+'_'+face)}]));
 atlas.icon={textures:'textures/items/sniffer_egg'};
 return normalizeBlock('sniffer_egg',{textures:Object.fromEntries(faces.map(face=>[face,face])),carried_textures:'icon'},atlas,{model:'sniffer_egg'});
}
test('sniffer egg declares all indexed faces and retains repeats and a separate carried icon',()=>{
 const r=snifferRecord();assert.equal(Object.keys(r.bindings).length,18);assert.equal(r.paths.length,19);
 assert.ok(!Object.values(r.bindings).flat().includes('textures/items/sniffer_egg'));
 const repeated=structuredClone(r);for(const face of Object.keys(repeated.variants))repeated.variants[face][1]=repeated.variants[face][0];
 const bindings=modelPartBindings(repeated);assert.equal(Object.keys(bindings).length,18);assert.deepEqual(bindings.stage_1_north,bindings.stage_0_north);
 const bad=structuredClone(r);bad.variants.east.pop();assert.throws(()=>modelPartBindings(bad),/Mismatched sniffer egg stages/);
});
test('sniffer egg uses one explicit stage for all six faces, independent of edited resource',()=>{
 const r=snifferRecord(),Three=createThreeMock(),model=createGrowthModels(Three).find(m=>m.id==='sniffer_egg');
 const c={schema:1,records:{sniffer_egg:r},items:{},aliases:{},families:{},resources:{}};
 const registry={get:()=>model,build:(id,E)=>model.build(E)},resolve=createPreviewResolver(c,registry);
 const before=JSON.stringify(r);
 for(let stage=0;stage<3;stage++)for(const slot of r.paths){
  const p=resolve({id:'sniffer_egg',slot,state:{stage}}),E={mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}};
  p.build(E);const m=meshesOf(E.group);assert.equal(m.length,6);assert.ok(uvInside(m));
  assert.deepEqual(m.map(mesh=>mesh.material.path),['up','down','north','south','east','west'].map(face=>r.variants[face][stage]));
 }
 assert.equal(JSON.stringify(r),before);
 const bindings=Object.fromEntries(Object.entries(r.bindings).map(([role,paths])=>[role,paths[0]]));
 for(const stage of [-1,3,1.5,'2'])assert.throws(()=>model.build({bindings,state:{stage}}),/Invalid sniffer egg stage/);
});
