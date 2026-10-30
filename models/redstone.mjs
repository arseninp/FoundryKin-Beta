/* Piston and redstone torch. Piston geometry is migrated from FKBlocksB (Java piston models as reference); the torch shares the accepted torch box. */
import {composeShape, requireRoles} from './shapes.mjs';
const FULL = [0, 0, 16, 16];
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
  const id = requireRoles(E, ['up'], 'redstone torch').up, side = [7, 6, 9, 16];
  composeShape(Three, E, p => p.box([7, 0, 7], [9, 10, 9], {north: id, south: id, east: id, west: id, up: id, down: id}, {north: side, south: side, east: side, west: side, up: [7, 6, 9, 8], down: [7, 13, 9, 15]}));
 }
 return [{id: 'piston', scale: 1.4, mode: 'volume', build: piston}, {id: 'redstone_torch', scale: 1, mode: 'volume', build: torch}];
}
