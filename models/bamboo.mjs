/* Bamboo family migrated from FKShapes and FKFixtures. Java fence geometry is a reference; Bedrock atlas regions and catalog paths are used. */
import {composeShape, requireRoles} from './shapes.mjs';
const Q = Math.PI / 2;
const STEM = {north: [0, 0, 3, 16], south: [0, 0, 3, 16], east: [0, 0, 3, 16], west: [0, 0, 3, 16], up: [13, 0, 16, 3], down: [13, 4, 16, 7]};
export function createBambooModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Bamboo models require Three');
 function bamboo(E) {
  const f = requireRoles(E, ['north', 'east', 'south', 'up'], 'bamboo');
  composeShape(Three, E, p => {
   for (const y of [-1, 0, 1]) p.prism(.1875, 1, .1875, 0, y, 0, f.north, STEM, 16);
   for (const [path, w, h, y] of [[f.east, .6, .5, -1.3], [f.south, .9, 1, 0], [f.up, .9, 1, 1]]) {
    p.face(path, w, h, 0, y, 0, 0, 0, null, true);p.face(path, w, h, 0, y, 0, 0, Q, null, true);
   }
  });
 }
 function fence(E) {
  const id = requireRoles(E, ['up'], 'bamboo fence').up, F = {north: id, south: id, east: id, west: id, up: id, down: id}, side = [0, 0, 4, 16];
  composeShape(Three, E, p => {
   p.box([6, 0, 6], [10, 16, 10], F, {north: side, south: side, east: side, west: side, up: [4, 0, 8, 4], down: [4, 0, 8, 4]});
   for (const y of [6, 12]) {
    p.box([7, y, 7], [16, y + 3, 9], {north: id, east: id, south: id, up: id, down: id}, {north: [4, 4, 13, 7], east: [13, 4, 15, 7], south: [4, 4, 13, 7], up: [13, 7, 15, 16, 270], down: [13, 7, 15, 16, 90]});
    p.box([0, y, 7], [9, y + 3, 9], {north: id, south: id, west: id, up: id, down: id}, {north: [4, 4, 13, 7], south: [4, 4, 13, 7], west: [15, 4, 13, 7], up: [13, 7, 15, 16, 270], down: [13, 7, 15, 16, 90]});
   }
  });
 }
 function gate(E) {
  const id = requireRoles(E, ['up'], 'bamboo gate').up, F = {north: id, south: id, east: id, west: id, up: id, down: id};
  const R = (side, cap) => ({north: side, south: side, east: side, west: side, up: cap, down: [cap[2], cap[3], cap[0], cap[1]]});
  composeShape(Three, E, p => {
   const post = R([0, 1, 2, 12], [0, 0, 2, 2]);
   p.box([0, 5, 7], [2, 16, 9], F, post);
   p.box([14, 5, 7], [16, 16, 9], F, post);
   const left = [8, 1, 10, 10], right = [11, 1, 13, 10];
   p.box([6, 6, 7], [8, 15, 9], {north: id, south: id, west: id, up: id, down: id}, {north: left, south: right, west: left, up: [8, 10, 10, 12], down: [10, 12, 8, 10]});
   p.box([8, 6, 7], [10, 15, 9], {north: id, east: id, south: id, up: id, down: id}, {north: right, east: right, south: left, up: [11, 10, 13, 12], down: [13, 12, 11, 10]});
   for (const y of [6, 12]) {
    const side = y === 6 ? [3, 9, 7, 12] : [3, 1, 7, 4], uv = R(side, [3, 4, 7, 6]), faces = {north: id, south: id, up: id, down: id};
    p.box([2, y, 7], [6, y + 3, 9], faces, uv);
    p.box([10, y, 7], [14, y + 3, 9], faces, uv);
   }
  });
 }
 return [{id: 'bamboo', scale: 1.8, mode: 'volume', build: bamboo}, {id: 'bamboo_fence', scale: 1, mode: 'volume', build: fence}, {id: 'bamboo_gate', scale: 1, mode: 'volume', build: gate}];
}
