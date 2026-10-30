/* Pale moss carpet: base plate plus full-height inset side planes. Java mossy_carpet_side is a geometry reference; Bedrock uses base/tip images. */
import {composeShape, requireRoles} from './shapes.mjs';
const Q = Math.PI / 2, DIRS = ['north', 'south', 'east', 'west'], LEVELS = ['none', 'short', 'tall'];
const TURN = {north: 0, east: -Q, south: Math.PI, west: Q};
const own = (object, key) => Object.hasOwn(object, key);
export function paleMossState(input) {
 const state = input ?? {}, upper = state.upper_block_bit === undefined ? false : state.upper_block_bit, sides = {};
 if (typeof upper !== 'boolean') throw new Error('Invalid upper_block_bit');
 for (const d of DIRS) {
  const value = own(state, 'pale_moss_carpet_side_' + d) ? state['pale_moss_carpet_side_' + d] : 'none';
  if (!LEVELS.includes(value)) throw new Error('Invalid moss side');
  sides[d] = value;
 }
 return {upper, sides};
}
export function createMossModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Moss models require Three');
 function carpet(E) {
  const state = paleMossState(E && E.state), f = requireRoles(E, ['up', 'down', 'north', 'south', 'east', 'west'], 'pale moss');
  const shown = DIRS.filter(d => state.sides[d] !== 'none');
  if (shown.length && (typeof f.side_base !== 'string' || typeof f.side_tip !== 'string')) throw new Error('Missing pale moss side material');
  composeShape(Three, E, p => {
   if (!state.upper) {
    const full = [0, 0, 16, 16], edge = [0, 15, 16, 16];
    p.box([0, 0, 0], [16, 1, 16], {up: f.up, down: f.down, north: f.north, south: f.south, east: f.east, west: f.west}, {up: full, down: full, north: edge, south: edge, east: edge, west: edge});
   }
   for (const d of shown) {
    const id = state.upper || state.sides[d] === 'short' ? f.side_tip : f.side_base;
    p.turned(TURN[d], q => {
     q.face(id, 1, 1, 0, 0, -7.9 / 16, 0, Math.PI, [16, 0, 0, 16]);
     q.face(id, 1, 1, 0, 0, -7.9 / 16, 0, 0, [0, 0, 16, 16]);
    });
   }
  });
 }
 return [{id: 'pale_moss_carpet', scale: 1, mode: 'volume', build: carpet}];
}
