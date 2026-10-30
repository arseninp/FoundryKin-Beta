/* Dirt path, enchanting table, stonecutter and sea pickle migrated from FKCuration. Pots and conduit retain FKDetails geometry. */
import {composeShape, requireRoles} from './shapes.mjs';
import {createFireModels} from './fire.mjs';
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
 function flowerPot(E) {
  const id=requireRoles(E,['up'],'flower pot').up,six={north:id,south:id,east:id,west:id,up:id,down:id};
  composeShape(Three,E,p=>{
   p.box([5,0,5],[6,6,11],six,{down:[5,5,6,11],up:[5,5,6,11],north:[10,10,11,16],south:[5,10,6,16],west:[5,10,11,16],east:[5,10,11,16]});
   p.box([10,0,5],[11,6,11],six,{down:[10,5,11,11],up:[10,5,11,11],north:[5,10,6,16],south:[10,10,11,16],west:[5,10,11,16],east:[5,10,11,16]});
   p.box([6,0,5],[10,6,6],{north:id,south:id,up:id,down:id},{down:[6,10,10,11],up:[6,5,10,6],north:[6,10,10,16],south:[6,10,10,16]});
   p.box([6,0,10],[10,6,11],{north:id,south:id,up:id,down:id},{down:[6,5,10,6],up:[6,10,10,11],north:[6,10,10,16],south:[6,10,10,16]});
   p.box([6,0,6],[10,4,10],{up:id,down:id},{down:[6,12,10,16],up:[6,6,10,10]});
  });
 }
 function decoratedPot(E) {
  const f=requireRoles(E,['side','base'],'decorated pot'),S=f.side,B=f.base,SR=[1,0,15,16],six={north:B,south:B,east:B,west:B,up:B,down:B};
  composeShape(Three,E,p=>{
   p.box([1,0,1],[15,16,15],{north:S,south:S,east:S,west:S,up:B,down:B},{north:SR,south:SR,east:SR,west:SR,up:[0,6.5,7,13.5],down:[7,6.5,14,13.5]});
   p.box([5,16,5],[11,17,11],six,{east:[0,5.5,3,6],north:[3,5.5,6,6],west:[6,5.5,9,6],south:[9,5.5,12,6],up:[3,2.5,6,5.5],down:[6,2.5,9,5.5]});
   p.box([4,17,4],[12,20,12],six,{east:[0,4,4,5.5],north:[4,4,8,5.5],west:[8,4,12,5.5],south:[12,4,16,5.5],up:[4,0,8,4],down:[8,0,12,4]});
  });
 }
 function conduit(E) {
  const id=requireRoles(E,['up'],'conduit').up;
  composeShape(Three,E,p=>p.box([5,5,5],[11,11,11],{north:id,south:id,east:id,west:id,up:id,down:id},{east:[0,4,4,8],north:[4,4,8,8],west:[8,4,12,8],south:[12,4,16,8],up:[4,0,8,4],down:[8,0,12,4]}));
 }
 return [{id: 'grass_path', scale: 1, mode: 'volume', build: lowered('grass path', 15)}, {id: 'enchanting_table', scale: 1, mode: 'volume', build: lowered('enchanting table', 12)}, {id: 'stonecutter', scale: 1, mode: 'volume', build: stonecutter}, {id: 'sea_pickle', scale: 1, mode: 'volume', build: seaPickle}, {id:'flower_pot',scale:1,mode:'volume',build:flowerPot}, {id:'decorated_pot',scale:1.4,mode:'volume',build:decoratedPot}, {id:'conduit',scale:1,mode:'volume',build:conduit}, ...createFireModels(Three)];
}
