/* Two-block flowers (lilac, rose bush, peony) migrated from FKFixtures. The sunflower has its own front and back images and is not part of this model. */
import {composeShape, requireRoles} from './shapes.mjs';
const Q = Math.PI / 2;
export function createPlantModels(Three) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Plant models require Three');
 function flower(E) {
  const f = requireRoles(E, ['up', 'down'], 'tall flower');
  composeShape(Three, E, p => {
   for (const [id, y] of [[f.down, -.5], [f.up, .5]]) {
    p.face(id, Math.SQRT2, 1, 0, y, 0, 0, 0, null, true);p.face(id, Math.SQRT2, 1, 0, y, 0, 0, Q, null, true);
   }
  });
 }
 return [{id: 'flower', scale: 1.4, mode: 'volume', build: flower}];
}
