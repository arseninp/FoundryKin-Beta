import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createRedstoneModels} from '../models/redstone.mjs';
import {createThreeMock, meshesOf} from './three-mock.mjs';
const P = 'textures/blocks/', ROLES = {head: 'head', inner: 'inner', bottom: 'bottom', side: 'side'};
const uvInside = meshes => meshes.every(m => m.geometry.rows.every(row => row.every(v => v >= 0 && v <= 1)));
function setup(id, roles, state) {
 const Three = createThreeMock(), model = createRedstoneModels(Three).find(m => m.id === id);
 const mats = Object.fromEntries([...new Set(Object.values(roles))].map(path => [path, {path}]));
 const E = {state, bindings: roles, faceMap: roles, mats, hiddenMat: {}, group: new Three.Group()};
 return {Three, model, E, mats, build: () => model.build(E)};
}
test('redstone models register a piston framed at two blocks and a redstone torch', () => {
 const models = createRedstoneModels(createThreeMock());
 assert.deepEqual(models.map(m => [m.id, m.scale, m.mode]), [['piston', 1.4, 'volume'], ['redstone_torch', 1, 'volume']]);
 assert.throws(() => createRedstoneModels({}), /require Three/);
});
test('retracted piston is one cube with the head on top; extended piston adds arm and head plate above the block', () => {
 const a = setup('piston', ROLES, {});a.build();const m = meshesOf(a.E.group);
 assert.equal(m.length, 6);assert.equal(m.find(x => x.rotation.x === -Math.PI / 2).material.path, 'head');assert.ok(!m.some(x => x.material.path === 'inner'));
 const b = setup('piston', ROLES, {extended: true});b.build();const n = meshesOf(b.E.group);
 assert.equal(n.length, 15);assert.equal(n.filter(x => x.material.path === 'head').length, 1);assert.equal(n.filter(x => x.material.path === 'inner').length, 1);
 assert.equal(Math.max(...n.map(x => x.position.y)), .75);assert.ok(uvInside(n));
});
test('piston state and materials are validated before anything is added', () => {
 const bad = setup('piston', ROLES, {extended: 'yes'});assert.throws(bad.build, /Invalid piston state/);assert.equal(bad.E.group.children.length, 0);
 const plain = setup('piston', {head: 'head', bottom: 'bottom', side: 'side'}, {});plain.build();assert.equal(plain.E.group.children.length, 6);
 const ext = setup('piston', {head: 'head', bottom: 'bottom', side: 'side'}, {extended: true});assert.throws(ext.build, /Missing piston binding: inner/);
 const hidden = setup('piston', ROLES, {extended: true});hidden.E.mats.inner = hidden.E.hiddenMat;
 assert.throws(hidden.build, /Missing model material: inner/);assert.equal(hidden.E.group.children.length, 0);assert.ok(hidden.Three.created.every(g => g.disposed));
});
test('redstone torch is the accepted 2 by 10 pixel torch box with one material', () => {
 const s = setup('redstone_torch', {up: 'lit'});s.build();const m = meshesOf(s.E.group);
 assert.equal(m.length, 6);assert.ok(m.every(x => x.material === s.mats.lit));assert.ok(uvInside(m));
 const side = m.find(x => x.rotation.y === Math.PI);assert.deepEqual([side.geometry.size, side.position.y], [[.125, .625], -.1875]);
 assert.throws(setup('redstone_torch', {north: 'lit'}).build, /Missing redstone torch binding: up/);
});
function catalog(carriedUp = true) {
 const atlas = {piston_bottom: {textures: P + 'piston_bottom'}, piston_side: {textures: P + 'piston_side'}, piston_top: {textures: P + 'piston_inner'}, piston_top_normal: {textures: P + 'piston_top_normal'}};
 const def = {textures: {down: 'piston_bottom', side: 'piston_side', up: 'piston_top'}, carried_textures: {down: 'piston_bottom', side: 'piston_side', up: 'piston_top_normal'}};
 const record = normalizeBlock('piston', def, atlas, {model: 'piston'});
 if (!carriedUp) record.carried.up = [];
 return {schema: 1, records: {piston: record}, items: {}, aliases: {}, families: {}, resources: {}};
}
test('preview binds piston head from the carried texture and the hole from the block face, with an explicit extended state', () => {
 const Three = createThreeMock(), model = createRedstoneModels(Three)[0];
 const registry = {get: id => {assert.equal(id, 'piston');return model;}, build: (id, E) => model.build(E)};
 const c = catalog(), before = JSON.stringify(c), resolve = createPreviewResolver(c, registry);
 const p = resolve({id: 'piston', state: {extended: true}});
 assert.deepEqual(p.bindings, {head: P + 'piston_top_normal', inner: P + 'piston_inner', bottom: P + 'piston_bottom', side: P + 'piston_side'});
 assert.equal(p.scale, 1.4);assert.equal(p.state.extended, true);assert.equal(resolve({id: 'piston'}).state.extended, false);
 const mats = Object.fromEntries(c.records.piston.paths.map(path => [path, {path}])), E = {mats, hiddenMat: {}, group: new Three.Group()};
 p.build(E);assert.equal(E.group.children.length, 15);
 for (const slot of c.records.piston.paths) assert.deepEqual(resolve({id: 'piston', slot, state: {extended: true}}).bindings, p.bindings);
 assert.throws(() => resolve({id: 'piston', state: {extended: 'yes'}}), /Invalid piston preview state/);
 assert.throws(() => createPreviewResolver(catalog(false), registry)({id: 'piston'}), /Missing or ambiguous piston head/);
 assert.equal(JSON.stringify(c), before);
});
