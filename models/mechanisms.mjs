/* Nether portal, end portal frame, tripwire and tripwire hook migrated from FKBlocksB (Java models as geometry reference). */
import {composeShape, requireRoles} from './shapes.mjs';
const Q = Math.PI / 2, FULL = [0, 0, 16, 16];
export function createMechanismModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Mechanism models require Three');
 const flag = (E, key, label) => {
  const value = E && E.state && E.state[key] !== undefined ? E.state[key] : false;
  if (typeof value !== 'boolean') throw new Error('Invalid ' + label + ' state');
  return value;
 };
 const six = id => ({up: id, down: id, north: id, south: id, east: id, west: id});
 function portal(E) {
  const id = requireRoles(E, ['up'], 'portal').up;
  composeShape(Three, E, p => p.face(id, 1, 1, 0, 0, 0, 0, 0, null, true));
 }
 /* A 13 px body; the state With eye adds the eye on top. */
 function frame(E) {
  const eye = flag(E, 'eye', 'end portal frame'), f = requireRoles(E, eye ? ['up', 'down', 'north', 'south', 'east', 'west', 'eye'] : ['up', 'down', 'north', 'south', 'east', 'west'], 'end portal frame'), side = [0, 3, 16, 16];
  composeShape(Three, E, p => {
   p.box([0, 0, 0], [16, 13, 16], {up: f.up, down: f.down, north: f.north, south: f.south, east: f.east, west: f.west}, {up: FULL, down: FULL, north: side, south: side, east: side, west: side});
   if (eye) {const e = [4, 0, 12, 3];p.box([4, 13, 4], [12, 16, 12], {up: f.eye, north: f.eye, south: f.eye, east: f.eye, west: f.eye}, {up: [4, 4, 12, 12], north: e, south: e, east: e, west: e});}
  });
 }
 /* The string alone, a thin strip 1.5 px above the floor. */
 function wire(E) {
  const id = requireRoles(E, ['up'], 'tripwire').up;
  composeShape(Three, E, p => p.face(id, .5 / 16, 1, 0, (1.5 - 8) / 16, 0, -Q, 0, [0, 0, 16, 2, 90], true));
 }
 /* Hook (Java tripwire_hook models): bare hook, or with the string strip and the hook piece lying at 22.5 degrees. */
 function hook(E) {
  const attached = flag(E, 'attached', 'tripwire hook'), f = requireRoles(E, attached ? ['wood', 'hook', 'string'] : ['wood', 'hook'], 'tripwire hook'), W = f.wood, K = f.hook, S = f.string;
  composeShape(Three, E, p => {
   p.box([6, 1, 14], [10, 9, 16], six(W), {down: [6, 14, 10, 16], up: [6, 0, 10, 2], north: [6, 7, 10, 15], south: [6, 7, 10, 15], west: [0, 7, 2, 15], east: [14, 7, 16, 15]});
   const arm = {down: [7, 9, 9, 14], up: [7, 2, 9, 7], north: [7, 9, 9, 11], south: [7, 9, 9, 11], west: [2, 9, 7, 11], east: [9, 9, 14, 11]}, piece = {down: [5, 3, 11, 9], up: [5, 3, 11, 9], north: [5, 3, 11, 4], south: [5, 8, 11, 9], west: [5, 8, 11, 9], east: [5, 3, 11, 4]};
   if (!attached) {
    p.tilted([8, 6, 14], Math.PI / 4, q => q.box([7.4, 5.2, 10], [8.8, 6.8, 14], six(W), arm));
    p.tilted([8, 6, 5.2], -Math.PI / 4, q => q.box([6.2, 3.8, 7.9], [9.8, 4.6, 11.5], six(K), piece));
    return;
   }
   p.box([7.4, 5.2, 10], [8.8, 6.8, 14], six(W), arm);
   p.tilted([8, 4.2, 6.7], -Math.PI / 8, q => q.box([6.2, 4.2, 6.7], [9.8, 5, 10.3], six(K), piece));
   p.tilted([8, 0, 0], -Math.PI / 8, q => q.face(S, .5 / 16, 6.7 / 16, 0, (1.5 - 8) / 16, (3.35 - 8) / 16, -Q, 0, [0, 6, 16, 8, 90], true));
  });
 }
 return [{id: 'portal', scale: 1, mode: 'volume', build: portal}, {id: 'end_portal_frame', scale: 1, mode: 'volume', build: frame}, {id: 'tripwire', scale: 1, mode: 'volume', build: wire}, {id: 'tripwire_hook', scale: 1, mode: 'volume', build: hook}];
}
