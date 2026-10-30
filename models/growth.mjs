/* Crops, turtle egg and vine columns migrated from FKBlocksB. The growth stage is an explicit preview state, never the selected texture slot. */
import {composeShape, requireRoles} from './shapes.mjs';
const Q = Math.PI / 2;
export function createGrowthModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Growth models require Three');
 /* Four planes at 4 and 12 px (Java crop model); the bound stage image is the only material. */
 function crop(E) {
  const id = requireRoles(E, ['stage'], 'crop').stage;
  composeShape(Three, E, p => {
   for (const o of [-.25, .25]) {
    p.face(id, 1, 1, o, 0, 0, 0, Q, null, true);p.face(id, 1, 1, 0, 0, o, 0, 0, null, true);
   }
  });
 }
 /* One egg 4x7x4 (Java template_turtle_egg); the stage is the cracking stage. */
 function egg(E) {
  const id = requireRoles(E, ['stage'], 'turtle egg').stage, s = [1, 4, 5, 11], t = [0, 0, 4, 4];
  composeShape(Three, E, p => p.box([5, 0, 4], [9, 7, 8], {up: id, down: id, north: id, south: id, east: id, west: id}, {up: t, down: t, north: s, south: s, east: s, west: s}));
 }
 /* Two blocks: the head image at the growing end, the body image at the other. */
 function vines(E) {
  const f = requireRoles(E, ['up', 'down'], 'vine column'), weeping = E.cur === 'weeping_vines';
  composeShape(Three, E, p => {
   for (const [id, y] of [[f.down, weeping ? -.5 : .5], [f.up, weeping ? .5 : -.5]]) {
    p.face(id, Math.SQRT2, 1, 0, y, 0, 0, 0, null, true);p.face(id, Math.SQRT2, 1, 0, y, 0, 0, Q, null, true);
   }
  });
 }
 return [{id: 'crop', scale: 1, mode: 'volume', build: crop}, {id: 'turtle_egg', scale: 1, mode: 'volume', build: egg}, {id: 'vines', scale: 1.4, mode: 'volume', build: vines}];
}
