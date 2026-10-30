/* Piston, redstone torch, repeater and comparator. Geometry is migrated from FKBlocksB and FKCuration (Java models as reference). */
import {composeShape, requireRoles} from './shapes.mjs';
const FULL = [0, 0, 16, 16];
/* Lit torch sprites keep the pixels that extend beyond the 2 px shaft, so a lit torch adds two crossing full-height planes. */
function torchPost(p, id, lit, x, z, height, base, bottom) {
 const cap = {up: [7, 6, 9, 8], down: [7, 13, 9, 15]}, F = {up: id};
 if (bottom) F.down = id;
 if (!lit) {
  const s = [7, 6, 9, 6 + height];
  Object.assign(F, {north: id, south: id, east: id, west: id});Object.assign(cap, {north: s, south: s, east: s, west: s});
  p.box([x - 1, base, z - 1], [x + 1, base + height, z + 1], F, cap);
  return;
 }
 p.box([x - 1, base, z - 1], [x + 1, base + height, z + 1], F, cap);
 const full = [0, 0, 16, 6 + height];
 p.box([x - 1, base, z - 8], [x + 1, base + height + 6, z + 8], {east: id, west: id}, {east: full, west: full});
 p.box([x - 8, base, z - 1], [x + 8, base + height + 6, z + 1], {north: id, south: id}, {north: full, south: full});
}
export function createRedstoneModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Redstone models require Three');
 function piston(E) {
  const extended = E && E.state && E.state.extended !== undefined ? E.state.extended : false;
  if (typeof extended !== 'boolean') throw new Error('Invalid piston state');
  const f = requireRoles(E, extended ? ['head', 'inner', 'bottom', 'side'] : ['head', 'bottom', 'side'], 'piston'), s = f.side;
  composeShape(Three, E, p => {
   if (!extended) {
    p.box([0, 0, 0], [16, 16, 16], {up: f.head, down: f.bottom, north: s, south: s, east: s, west: s}, {up: FULL, down: FULL, north: FULL, south: FULL, east: FULL, west: FULL});
    return;
   }
   const body = [0, 4, 16, 16], plate = [0, 0, 16, 4], arm = [6, 0, 10, 4];
   p.box([0, 0, 0], [16, 12, 16], {up: f.inner, down: f.bottom, north: s, south: s, east: s, west: s}, {up: FULL, down: FULL, north: body, south: body, east: body, west: body});
   p.box([6, 12, 6], [10, 16, 10], {north: s, south: s, east: s, west: s}, {north: arm, south: arm, east: arm, west: arm});
   p.box([0, 16, 0], [16, 20, 16], {up: f.head, north: s, south: s, east: s, west: s}, {up: FULL, north: plate, south: plate, east: plate, west: plate});
  });
 }
 function torch(E) {
  const id = requireRoles(E, ['up'], 'redstone torch').up, lit = !(E && E.cur === 'unlit_redstone_torch');
  composeShape(Three, E, p => torchPost(p, id, lit, 8, 8, 10, 0, true));
 }
 function device(compare) {
  const label = compare ? 'comparator' : 'repeater';
  return function build(E) {
   const f = requireRoles(E, ['floor', 'top_off', 'top_on', 'torch_on', 'torch_off'], label), state = E.state || {};
   if (state.powered !== undefined && state.powered !== 'on' && state.powered !== 'off') throw new Error('Invalid power state');
   const powered = state.powered !== undefined ? state.powered === 'on' : /^powered_/.test(E.cur || '');
   const subtract = compare && state.subtract !== undefined ? state.subtract : false, delay = state.delay === undefined ? 1 : state.delay;
   if (typeof subtract !== 'boolean') throw new Error('Invalid comparator state');
   if (!compare && (!Number.isInteger(delay) || delay < 1 || delay > 4)) throw new Error('Invalid repeater delay');
   const top = compare && subtract && f.top_subtract ? f.top_subtract : powered ? f.top_on : f.top_off, edge = [0, 14, 16, 16], torchId = powered ? f.torch_on : f.torch_off;
   composeShape(Three, E, p => {
    p.box([0, 0, 0], [16, 2, 16], {up: top, down: f.floor, north: f.floor, south: f.floor, east: f.floor, west: f.floor}, {up: FULL, down: FULL, north: edge, south: edge, east: edge, west: edge});
    if (compare) {
     torchPost(p, torchId, powered, 5, 12, 5, 2, false);torchPost(p, torchId, powered, 11, 12, 5, 2, false);
     torchPost(p, subtract ? f.torch_on : f.torch_off, subtract, 8, 3, 3, 2, false);
    } else {
     torchPost(p, torchId, powered, 8, 5 + delay * 2, 5, 2, false);torchPost(p, torchId, powered, 8, 3, 5, 2, false);
    }
   });
  };
 }
 return [{id: 'piston', scale: 1.4, mode: 'volume', build: piston}, {id: 'redstone_torch', scale: 1, mode: 'volume', build: torch}, {id: 'repeater', scale: 1, mode: 'volume', build: device(false)}, {id: 'comparator', scale: 1, mode: 'volume', build: device(true)}];
}
