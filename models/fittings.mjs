/* Ladder, lectern, lever and shelves migrated from FKFixtures. Java template_shelf_body and lectern/lever models are geometry references. */
import {composeShape, requireRoles} from './shapes.mjs';
export function createFittingModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Fitting models require Three');
 function ladder(E) {
  const id = requireRoles(E, ['up'], 'ladder').up;
  composeShape(Three, E, p => p.face(id, 1, 1, 0, 0, 7 / 16, 0, 0, null, true));
 }
 function lectern(E) {
  const f = requireRoles(E, ['up', 'down', 'north', 'south', 'east'], 'lectern'), B = f.east, S = f.south, F = f.north, D = f.down, T = f.up;
  composeShape(Three, E, p => {
   p.box([0, 0, 0], [16, 2, 16], {north: B, east: B, south: B, west: B, up: B, down: D}, {north: [0, 14, 16, 16], east: [0, 6, 16, 8], south: [0, 6, 16, 8], west: [0, 6, 16, 8], up: [0, 0, 16, 16, 180], down: [0, 0, 16, 16]});
   p.box([4, 2, 4], [12, 15, 12], {north: F, east: S, south: F, west: S}, {north: [0, 0, 8, 13], east: [2, 16, 15, 8, 90], south: [8, 3, 16, 16], west: [2, 8, 15, 16, 90]});
   p.tilted([8, 8, 8], -Math.PI / 8, q => q.box([.0125, 12, 3], [15.9875, 16, 16], {north: S, east: S, south: S, west: S, up: T, down: D}, {north: [0, 0, 16, 4], east: [0, 4, 13, 8], south: [0, 4, 16, 8], west: [0, 4, 13, 8], up: [0, 1, 16, 14, 180], down: [0, 0, 16, 13]}));
  });
 }
 function lever(E) {
  const f = requireRoles(E, ['east', 'up'], 'lever'), B = f.east, L = f.up;
  composeShape(Three, E, p => {
   p.box([5, -.02, 4], [11, 2.98, 12], {north: B, south: B, east: B, west: B, up: B, down: B}, {north: [5, 0, 11, 3], south: [5, 0, 11, 3], east: [4, 0, 12, 3], west: [4, 0, 12, 3], up: [5, 4, 11, 12], down: [5, 4, 11, 12]});
   p.tilted([8, 1, 8], -Math.PI / 4, q => q.box([7, 1, 7], [9, 11, 9], {north: L, south: L, east: L, west: L, up: L}, {north: [7, 6, 9, 16], south: [7, 6, 9, 16], east: [7, 6, 9, 16], west: [7, 6, 9, 16], up: [7, 6, 9, 8]}));
  });
 }
 /* The local half-turn presents the opening to the common view, identically on both screens. */
 function shelf(E) {
  const id = requireRoles(E, ['up'], 'shelf').up;
  composeShape(Three, E, p => p.turned(Math.PI, q => {
   q.box([0, 0, 13], [16, 16, 16], {east: id, south: id, west: id, up: id, down: id}, {east: [8, 0, 9.5, 8], south: [8, 0, 16, 8], west: [14.5, 0, 16, 8], up: [16, 5, 8, 3.5], down: [16, 6, 8, 4.5]});
   q.box([0, 0, 11], [16, 4, 13], {north: id, east: id, west: id, up: id, down: id}, {north: [0, 6, 8, 8], east: [1.5, 6, 2.5, 8], west: [5.5, 6, 6.5, 8], up: [8, 3.5, 16, 4.5], down: [16, 4.5, 8, 3.5]});
   q.box([0, 12, 11], [16, 16, 13], {north: id, east: id, west: id, up: id, down: id}, {north: [0, 0, 8, 2], east: [1.5, 0, 2.5, 2], west: [5.5, 0, 6.5, 2], up: [16, 6, 8, 5], down: [8, 5, 16, 6]});
   q.box([0, 4, 13], [16, 12, 13], {north: id}, {north: [0, 2, 8, 6]});
  }));
 }
 return [{id: 'ladder', scale: 1, mode: 'volume', build: ladder}, {id: 'lectern', scale: 1, mode: 'volume', build: lectern}, {id: 'lever', scale: 1, mode: 'volume', build: lever}, {id: 'shelf', scale: 1, mode: 'volume', build: shelf}];
}
