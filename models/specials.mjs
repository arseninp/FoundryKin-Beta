/* Dirt path, enchanting table, stonecutter and sea pickle migrated from FKCuration. Vanilla templates are geometry references. */
import {composeShape, requireRoles} from './shapes.mjs';
const FULL = [0, 0, 16, 16], FACES = ['up', 'down', 'north', 'south', 'east', 'west'];
export function createSpecialModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Special models require Three');
 /* A lowered block: the top keeps the full image, the sides show only the visible strip. */
 function lowered(label, height) {
  return function build(E) {
   const f = requireRoles(E, FACES, label), cut = [0, 16 - height, 16, 16];
   composeShape(Three, E, p => p.box([0, 0, 0], [16, height, 16], {up: f.up, down: f.down, north: f.north, south: f.south, east: f.east, west: f.west}, {up: FULL, down: FULL, north: cut, south: cut, east: cut, west: cut}));
  };
 }
 function stonecutter(E) {
  const f = requireRoles(E, FACES, 'stonecutter'), side = [0, 7, 16, 16];
  composeShape(Three, E, p => {
   p.box([0, 0, 0], [16, 9, 16], {up: f.up, down: f.down, north: f.north, south: f.south, east: f.north, west: f.north}, {up: FULL, down: FULL, north: side, south: side, east: side, west: side});
   p.face(f.east, 14 / 16, 7 / 16, 0, (12.5 - 8) / 16, 0, 0, Math.PI, [1, 9, 15, 16]);
   p.face(f.east, 14 / 16, 7 / 16, 0, (12.5 - 8) / 16, 0, 0, 0, [15, 9, 1, 16]);
  });
 }
 function seaPickle(E) {
  const id = requireRoles(E, ['up'], 'sea pickle').up, s = Math.SQRT2 / 16, y = (6.95 - 8) / 16;
  composeShape(Three, E, p => {
   p.box([6, 0, 6], [10, 6, 10], {up: id, down: id, north: id, south: id, east: id, west: id}, {down: [8, 1, 12, 5], up: [4, 1, 8, 5], north: [4, 5, 8, 11], south: [0, 5, 4, 11], west: [8, 5, 12, 11], east: [12, 5, 16, 11]});
   p.face(id, s, 3.5 / 16, 0, y, 0, 0, Math.PI / 4, [1, 0, 3, 5], true);
   p.face(id, s, 3.5 / 16, 0, y, 0, 0, -Math.PI / 4, [13, 0, 15, 5], true);
  });
 }
 return [{id: 'grass_path', scale: 1, mode: 'volume', build: lowered('grass path', 15)}, {id: 'enchanting_table', scale: 1, mode: 'volume', build: lowered('enchanting table', 12)}, {id: 'stonecutter', scale: 1, mode: 'volume', build: stonecutter}, {id: 'sea_pickle', scale: 1, mode: 'volume', build: seaPickle}];
}
