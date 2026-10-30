/* Minimal recording stand-in for the Three classes used by model tests. */
export function createThreeMock() {
 const created = [];
 class Group {
  constructor() {this.children = [];this.position = {x: 0, y: 0, z: 0, set: (x, y, z) => Object.assign(this.position, {x, y, z})};this.rotation = {x: 0, y: 0, z: 0, set: (x, y, z) => Object.assign(this.rotation, {x, y, z})};}
  add(child) {this.children.push(child);}
 }
 class PlaneGeometry {
  constructor(w, h) {
   this.kind = 'plane';this.size = [w, h];const rows = [[0, 1], [1, 1], [0, 0], [1, 0]];this.rows = rows;
   this.attributes = {uv: {count: 4, getX: i => rows[i][0], getY: i => rows[i][1], setXY(i, u, v) {rows[i] = [u, v];}}};created.push(this);
  }
  dispose() {this.disposed = true;}
 }
 class BoxGeometry {
  constructor(w, h, d) {
   this.kind = 'box';this.size = [w, h, d];const P = [], N = [], rows = [];
   for (const n of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) for (const [a, b] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    P.push(n[0] ? [n[0] * w / 2, b * h / 2, a * d / 2] : n[1] ? [a * w / 2, n[1] * h / 2, b * d / 2] : [a * w / 2, b * h / 2, n[2] * d / 2]);N.push(n);rows.push([0, 0]);
   }
   this.rows = rows;
   this.attributes = {position: {count: 24, getX: i => P[i][0], getY: i => P[i][1], getZ: i => P[i][2]}, normal: {getX: i => N[i][0], getY: i => N[i][1], getZ: i => N[i][2]}, uv: {count: 24, getX: i => rows[i][0], getY: i => rows[i][1], setXY(i, u, v) {rows[i] = [u, v];}}};created.push(this);
  }
  dispose() {this.disposed = true;}
 }
 class Mesh {
  constructor(geometry, material) {
   this.geometry = geometry;this.material = material;
   this.position = {x: 0, y: 0, z: 0, set: (x, y, z) => Object.assign(this.position, {x, y, z})};this.rotation = {x: 0, y: 0, z: 0, set: (x, y, z) => Object.assign(this.rotation, {x, y, z})};
  }
 }
 return {Group, PlaneGeometry, BoxGeometry, Mesh, DoubleSide: 2, FrontSide: 0, created};
}
export function meshesOf(group) {
 return group.children.flatMap(child => child.children ? meshesOf(child) : [child]);
}
