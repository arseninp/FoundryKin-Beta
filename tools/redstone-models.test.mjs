import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {attachDependencies, declaredDependencies} from '../catalog/rules/dependencies.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createRedstoneModels} from '../models/redstone.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const P = 'textures/blocks/', ROLES = {head: 'head', inner: 'inner', bottom: 'bottom', side: 'side', head_back: 'back'};
const DEVICE = {floor: 'floor', top_off: 'off', top_on: 'on', top_subtract: 'sub', torch_on: 'tOn', torch_off: 'tOff'};
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
function setup(id, roles, state, cur) {
 const Three = createThreeMock(), model = createRedstoneModels(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {state, cur, bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
test('redstone models register a piston framed at two blocks, a torch, a repeater and a comparator', () => {
 const models = createRedstoneModels(createThreeMock());
 assert.deepEqual(models.map(m => [m.id, m.scale, m.mode]), [['piston', 1.4, 'volume'], ['redstone_torch', 1, 'volume'], ['repeater', 1, 'volume'], ['comparator', 1, 'volume']]);
 assert.throws(() => createRedstoneModels({}), /require Three/);
});
test('retracted piston is one cube with the head on top; extended piston adds arm and head plate above the block', () => {
 const a = setup('piston', ROLES, {});a.build();const m = meshesOf(a.E.group);
 assert.equal(m.length, 6);assert.equal(m.find(x => x.rotation.x === -Math.PI / 2).material.path, 'head');assert.ok(!m.some(x => x.material.path === 'inner'));
 const b = setup('piston', ROLES, {extended: true});b.build();const n = meshesOf(b.E.group);
 assert.equal(n.length, 16);assert.equal(n.filter(x => x.material.path === 'head').length, 1);assert.equal(n.filter(x => x.material.path === 'inner').length, 1);
 assert.equal(Math.max(...n.map(x => x.position.y)), .75);assert.ok(uvInside(n));
});
test('piston state and materials are validated before anything is added', () => {
 const bad = setup('piston', ROLES, {extended: 'yes'});assert.throws(bad.build, /Invalid piston state/);assert.equal(bad.E.group.children.length, 0);
 const plain = setup('piston', {head: 'head', bottom: 'bottom', side: 'side'}, {});plain.build();assert.equal(plain.E.group.children.length, 6);
 const ext = setup('piston', {head: 'head', bottom: 'bottom', side: 'side'}, {extended: true});assert.throws(ext.build, /Missing piston binding: inner/);
 const hidden = setup('piston', ROLES, {extended: true});hidden.E.mats.inner = hidden.E.hiddenMat;
 assert.throws(hidden.build, /Missing model material: inner/);assert.equal(hidden.E.group.children.length, 0);assert.ok(hidden.Three.created.every(g => g.disposed));
});
test('unlit redstone torch is the 2 by 10 pixel box; a lit torch adds two crossing full-height sprite planes', () => {
 const off = setup('redstone_torch', {up: 'off'}, {}, 'unlit_redstone_torch');off.build();const a = meshesOf(off.E.group);
 assert.equal(a.length, 6);assert.ok(a.every(x => x.material === off.mats.off));assert.ok(uvInside(a));
 const side = a.find(x => x.rotation.y === Math.PI);assert.deepEqual([side.geometry.size, side.position.y], [[.125, .625], -.1875]);
 const on = setup('redstone_torch', {up: 'on'}, {}, 'redstone_torch');on.build();const b = meshesOf(on.E.group);
 assert.equal(b.length, 6);assert.equal(b.filter(x => x.geometry.size[0] === 1 && x.geometry.size[1] === 1).length, 4);assert.equal(b.filter(x => x.geometry.size[0] === .125 && x.geometry.size[1] === .125).length, 2);
 assert.throws(setup('redstone_torch', {north: 'on'}).build, /Missing redstone torch binding: up/);
});
test('repeater is a 2 px slab with two torches whose moving torch follows the delay; power follows the record', () => {
 const counts = [];const zs = [];
 for (const delay of [1, 2, 3, 4]) {
  const s = setup('repeater', DEVICE, {delay}, 'unpowered_repeater');s.build();const m = meshesOf(s.E.group);
  counts.push(m.length);zs.push(Math.max(...m.filter(x => x.material.path === 'tOff' && x.rotation.x === -Math.PI / 2).map(x => x.position.z)).toFixed(4));
  assert.ok(m.find(x => x.rotation.x === -Math.PI / 2 && x.geometry.size[0] === 1 && x.material.path === 'off'));assert.ok(uvInside(m));
 }
 assert.deepEqual(counts, [16, 16, 16, 16]);assert.equal(new Set(zs).size, 4);
 const on = setup('repeater', DEVICE, {}, 'powered_repeater');on.build();const m = meshesOf(on.E.group);
 assert.ok(m.some(x => x.material.path === 'on'));assert.ok(m.some(x => x.material.path === 'tOn'));assert.ok(!m.some(x => x.material.path === 'tOff'));
});
test('comparator shows compare or subtract mode with the third torch and the subtract top', () => {
 const cmp = setup('comparator', DEVICE, {}, 'unpowered_comparator');cmp.build();const a = meshesOf(cmp.E.group);
 assert.equal(a.length, 21);assert.ok(a.some(x => x.material.path === 'off'));assert.ok(!a.some(x => x.material.path === 'tOn'));
 const sub = setup('comparator', DEVICE, {subtract: true}, 'unpowered_comparator');sub.build();const b = meshesOf(sub.E.group);
 assert.ok(b.some(x => x.material.path === 'sub'));assert.ok(b.some(x => x.material.path === 'tOn'));assert.ok(b.some(x => x.material.path === 'tOff'));
 const noSub = {...DEVICE};delete noSub.top_subtract;const plain = setup('comparator', noSub, {subtract: true}, 'powered_comparator');plain.build();
 assert.ok(meshesOf(plain.E.group).some(x => x.material.path === 'on'));
});
test('device state, bindings and materials are validated before anything is added', () => {
 for (const [state, pattern] of [[{delay: 5}, /Invalid repeater delay/], [{delay: 1.5}, /Invalid repeater delay/], [{powered: 'maybe'}, /Invalid power state/]]) {
  const s = setup('repeater', DEVICE, state, 'unpowered_repeater');assert.throws(s.build, pattern);assert.equal(s.E.group.children.length, 0);
 }
 assert.throws(setup('comparator', DEVICE, {subtract: 'yes'}, 'unpowered_comparator').build, /Invalid comparator state/);
 const {torch_on, ...rest} = DEVICE;assert.throws(setup('repeater', rest, {}, 'unpowered_repeater').build, /Missing repeater binding: torch_on/);
 const hidden = setup('comparator', DEVICE, {}, 'unpowered_comparator');hidden.E.mats.tOff = hidden.E.hiddenMat;
 assert.throws(hidden.build, /Missing model material: tOff/);assert.equal(hidden.E.group.children.length, 0);assert.ok(hidden.Three.created.every(g => g.disposed));
});
test('repeater and comparator declare redstone torch textures as shared dependencies', () => {
 const T = {torch_on: P + 'redstone_torch_on', torch_off: P + 'redstone_torch_off'};
 assert.deepEqual(declaredDependencies({unpowered_repeater: {model: 'repeater'}, powered_comparator: {model: 'comparator'}, stone: {model: 'cube'}}), {unpowered_repeater: T, powered_comparator: T});
});
function catalog(kind, withSubtract = true) {
 const tops = kind === 'repeater' ? [P + 'repeater_off', P + 'repeater_on'] : [P + 'comparator_off', P + 'comparator_on', ...(withSubtract ? [P + 'comparator_subtract_on'] : [])];
 const atlas = {floor: {textures: P + (kind === 'repeater' ? 'stone_slab_top' : 'comparator_stone_slab')}, up: {textures: tops}};
 const def = {textures: {down: 'floor', side: 'floor', up: 'up'}};
 const ids = ['unpowered_' + kind, 'powered_' + kind], records = Object.fromEntries(ids.map(id => [id, normalizeBlock(id, def, atlas, {model: kind})]));
 const inventory = Object.fromEntries([P + 'redstone_torch_on', P + 'redstone_torch_off'].map(p => [p, 1]));
 const compiled = attachDependencies(records, declaredDependencies(Object.fromEntries(ids.map(id => [id, {model: kind}]))), inventory);
 return {schema: 1, records: compiled, items: {}, aliases: {}, families: {}, resources: {}};
}
test('preview binds device tops by name and torches from dependencies, with explicit delay and subtract states', () => {
 const Three = createThreeMock(), models = Object.fromEntries(createRedstoneModels(Three).map(m => [m.id, m]));
 const registry = {get: id => models[id], build: (id, E) => models[id].build(E)};
 const rep = catalog('repeater'), before = JSON.stringify(rep), resolve = createPreviewResolver(rep, registry);
 const p = resolve({id: 'unpowered_repeater', state: {delay: 3}});
 assert.deepEqual(p.bindings, {floor: P + 'stone_slab_top', top_off: P + 'repeater_off', top_on: P + 'repeater_on', torch_on: P + 'redstone_torch_on', torch_off: P + 'redstone_torch_off'});
 assert.deepEqual(p.shared, [P + 'redstone_torch_on', P + 'redstone_torch_off']);assert.equal(p.state.delay, 3);assert.equal(resolve({id: 'unpowered_repeater'}).state.delay, 1);
 const mats = Object.fromEntries([...rep.records.powered_repeater.paths, P + 'redstone_torch_on', P + 'redstone_torch_off'].map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 resolve({id: 'powered_repeater'}).build(E);assert.ok(meshesOf(E.group).some(m => m.material.path === P + 'redstone_torch_on'));
 for (const slot of rep.records.unpowered_repeater.paths) assert.deepEqual(resolve({id: 'unpowered_repeater', slot}).bindings, p.bindings);
 assert.throws(() => resolve({id: 'unpowered_repeater', slot: P + 'redstone_torch_on'}), /outside the selected object/);
 assert.throws(() => resolve({id: 'unpowered_repeater', state: {delay: 9}}), /Invalid repeater preview state/);
 assert.equal(JSON.stringify(rep), before);
 const cmp = createPreviewResolver(catalog('comparator'), registry), q = cmp({id: 'unpowered_comparator', state: {subtract: true}});
 assert.equal(q.bindings.top_subtract, P + 'comparator_subtract_on');assert.equal(q.state.subtract, true);assert.throws(() => cmp({id: 'unpowered_comparator', state: {subtract: 'x'}}), /Invalid comparator preview state/);
 assert.ok(!('top_subtract' in createPreviewResolver(catalog('comparator', false), registry)({id: 'unpowered_comparator'}).bindings));
 const bad = catalog('repeater');delete bad.records.unpowered_repeater.dependencies;assert.throws(() => createPreviewResolver(bad, registry)({id: 'unpowered_repeater'}), /Missing repeater dependency/);
});
function pistonCatalog(carriedUp = true, sticky = false) {
 const id = sticky ? 'sticky_piston' : 'piston', head = sticky ? 'piston_top_sticky' : 'piston_top_normal';
 const atlas = {piston_bottom: {textures: P + 'piston_bottom'}, piston_side: {textures: P + 'piston_side'}, piston_top: {textures: P + 'piston_inner'}, piston_top_normal: {textures: P + 'piston_top_normal'}, piston_top_sticky: {textures: P + 'piston_top_sticky'}};
 const def = {textures: {down: 'piston_bottom', side: 'piston_side', up: 'piston_top'}, carried_textures: {down: 'piston_bottom', side: 'piston_side', up: head}};
 const record = normalizeBlock(id, def, atlas, {model: 'piston'});
 if (!carriedUp) record.carried.up = [];
 const records = attachDependencies({[id]: record}, declaredDependencies({[id]: {model: 'piston'}}), {[P + 'piston_top_normal']: 1});
 return {schema: 1, records, items: {}, aliases: {}, families: {}, resources: {}};
}
test('preview binds piston head from the carried texture and the hole from the block face, with an explicit extended state', () => {
 const Three = createThreeMock(), model = createRedstoneModels(Three)[0];
 const registry = {get: id => {assert.equal(id, 'piston');return model;}, build: (id, E) => model.build(E)};
 const c = pistonCatalog(), before = JSON.stringify(c), resolve = createPreviewResolver(c, registry);
 const p = resolve({id: 'piston', state: {extended: true}});
 assert.deepEqual(p.bindings, {head: P + 'piston_top_normal', inner: P + 'piston_inner', bottom: P + 'piston_bottom', side: P + 'piston_side', head_back: P + 'piston_top_normal'});
 assert.equal(p.scale, 1.4);assert.equal(p.state.extended, true);assert.equal(resolve({id: 'piston'}).state.extended, false);
 const mats = Object.fromEntries(c.records.piston.paths.map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 p.build(E);assert.equal(E.group.children.length, 16);
 for (const slot of c.records.piston.paths) assert.deepEqual(resolve({id: 'piston', slot, state: {extended: true}}).bindings, p.bindings);
 assert.throws(() => resolve({id: 'piston', state: {extended: 'yes'}}), /Invalid piston preview state/);
 assert.throws(() => createPreviewResolver(pistonCatalog(false), registry)({id: 'piston'}), /Missing or ambiguous piston head/);
 assert.equal(JSON.stringify(c), before);
});
test('both piston variants declare the ordinary head back as an explicit dependency', () => {
 const back = {head_back: P + 'piston_top_normal'};
 assert.deepEqual(declaredDependencies({piston: {model: 'piston'}, sticky_piston: {model: 'piston'}}), {piston: back, sticky_piston: back});
 assert.throws(() => attachDependencies({sticky_piston: {}}, declaredDependencies({sticky_piston: {model: 'piston'}}), {}), /Missing dependency resource/);
});
test('ordinary and sticky piston backs use the ordinary texture without changing owned slots or the front', () => {
 for (const sticky of [false, true]) {
  const id = sticky ? 'sticky_piston' : 'piston', c = pistonCatalog(true, sticky), before = JSON.stringify(c), Three = createThreeMock(), model = createRedstoneModels(Three)[0];
  const registry = {get: () => model, build: (key, E) => model.build(E)}, resolve = createPreviewResolver(c, registry), p = resolve({id, state: {extended: true}}), back = P + 'piston_top_normal';
  assert.equal(p.bindings.head_back, back);assert.equal(p.bindings.head, P + (sticky ? 'piston_top_sticky' : 'piston_top_normal'));assert.deepEqual(p.shared, sticky ? [back] : []);
  assert.deepEqual(p.paths, c.records[id].paths);assert.equal(c.records[id].paths.includes(back), !sticky);
  const E = {mats: Object.fromEntries([...p.paths, ...p.shared].map(path => [path, {path}])), hiddenMat: {}, group: new Three.Group()};p.build(E);
  const meshes = meshesOf(E.group), rear = meshes.filter(m => m.rotation.x === Math.PI / 2 && m.position.y === .5), front = meshes.filter(m => m.rotation.x === -Math.PI / 2 && m.position.y === .75);
  assert.equal(meshes.length, 16);assert.equal(rear.length, 1);assert.equal(front.length, 1);assert.equal(rear[0].material.path, back);assert.equal(front[0].material.path, p.bindings.head);
  assert.deepEqual(rear[0].geometry.size, [1, 1]);assert.deepEqual(rear[0].geometry.rows, [[0, 1], [1, 1], [0, 0], [1, 0]]);assert.ok(uvInside(meshes));
  for (const slot of p.paths) assert.deepEqual(resolve({id, slot, state: {extended: true}}).bindings, p.bindings);
  if (sticky) {assert.throws(() => resolve({id, slot: back}), /outside the selected object/);assert.throws(() => resolve({id, faceChoices: {head_back: p.bindings.head}}), /Explicit face variant required/);}
  assert.equal(JSON.stringify(c), before);
 }
});
test('missing head-back bindings, hidden materials and allocation failures leave no partial piston', () => {
 const roles = {...ROLES};delete roles.head_back;const missing = setup('piston', roles, {extended: true});
 assert.throws(missing.build, /Missing piston binding: head_back/);assert.equal(missing.Three.created.length, 0);
 for (const hide of [false, true]) {
  const s = setup('piston', ROLES, {extended: true}), existing = {};s.E.group.add(existing);
  if (hide) s.E.mats.back = s.E.hiddenMat;else delete s.E.mats.back;
  assert.throws(s.build, /Missing model material: back/);assert.deepEqual(s.E.group.children, [existing]);assert.ok(s.Three.created.every(g => g.disposed));
 }
 const s = setup('piston', ROLES, {extended: true}), Base = s.Three.PlaneGeometry;
 s.Three.PlaneGeometry = class extends Base {constructor(...args) {if (s.Three.created.length === 11) throw new Error('allocation');super(...args);}};
 assert.throws(s.build, /allocation/);assert.equal(s.E.group.children.length, 0);assert.ok(s.Three.created.every(g => g.disposed));
 const c = pistonCatalog(true, true);delete c.records.sticky_piston.dependencies.head_back;
 assert.throws(() => createPreviewResolver(c, {get: () => ({scale: 1.4, mode: 'volume'}), build() {}})({id: 'sticky_piston'}), /Missing or ambiguous piston head_back/);
});
