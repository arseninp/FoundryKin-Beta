/* Crops, turtle egg, sniffer egg and vine columns migrated from FKBlocksB and FKCuration. Stage is explicit, never the edited texture slot. */
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
 /* The accepted 14x16x12 egg. Every stage has six independently owned face textures. */
 function snifferEgg(E) {
  const bindings=E&&(E.bindings??E.faceMap),stage=E?.state?.stage??0;
  if(!bindings)throw new Error('Missing sniffer egg bindings');
  const count=Object.keys(bindings).filter(role=>/^stage_\d+_up$/.test(role)).length;
  if(!count||!Number.isInteger(stage)||stage<0||stage>=count)throw new Error('Invalid sniffer egg stage');
  const names=['up','down','north','south','east','west'];
  const roles=names.map(face=>'stage_'+stage+'_'+face),f=requireRoles(E,roles,'sniffer egg');
  const faceMap=Object.fromEntries(names.map((face,i)=>[face,f[roles[i]]]));
  composeShape(Three,E,p=>p.box([1,0,2],[15,16,14],faceMap,{up:[0,0,14,12],down:[0,0,14,12],north:[0,0,14,16],south:[0,0,14,16],east:[0,0,12,16],west:[0,0,12,16]}));
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
 return [{id: 'crop', scale: 1, mode: 'volume', build: crop}, {id: 'turtle_egg', scale: 1, mode: 'volume', build: egg}, {id: 'vines', scale: 1.4, mode: 'volume', build: vines}, {id: 'sniffer_egg', scale: 1, mode: 'volume', build: snifferEgg}];
}
