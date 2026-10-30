/* Tall flowers, spore blossom and sunflower migrated from FKFixtures and FKCuration. */
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
 function spore(E) {
  const f = requireRoles(E, ['up', 'down'], 'spore blossom');
  if (typeof Three.Group !== 'function') throw new Error('Spore blossom requires Three.Group');
  if (!E.mats || !E.group || typeof E.group.add !== 'function') throw new Error('Missing spore blossom environment');
  const materials = [f.up, f.down].map(path => {
   const mat = E.mats[path];
   if (!mat || mat === E.hiddenMat) throw new Error('Missing spore blossom material: ' + path);
   return mat;
  });
  const geometries = [], parts = [];
  function face(mat, w, h, x, y, z, rect) {
   const g = new Three.PlaneGeometry(w, h);geometries.push(g);
   const uv = g.attributes.uv, r = rect || [0, 0, 16, 16];
   for (let i = 0; i < uv.count; i++) {
    const a = uv.getX(i), b = 1 - uv.getY(i), s = r[4] === 90 ? b : a, t = r[4] === 90 ? 1 - a : b;
    uv.setXY(i, (r[0] + s * (r[2] - r[0])) / 16, 1 - (r[1] + t * (r[3] - r[1])) / 16);
   }
   const mesh = new Three.Mesh(g, mat);mesh.position.set(x, y, z);mesh.rotation.set(-Q, 0, 0);return mesh;
  }
  try {
   parts.push(face(materials[0], 14 / 16, 14 / 16, 0, (15.9 - 8) / 16, 0, [1, 1, 15, 15]));
   for (const angle of [0, Q, Math.PI, -Q]) {
    const outer = new Three.Group(), inner = new Three.Group();
    inner.add(face(materials[1], 1, 1, .5, -.01875, 0, [0, 0, 16, 16, 90]));
    inner.rotation.z = -Math.PI / 8;outer.rotation.y = angle;outer.position.set(0, .5, 0);outer.add(inner);parts.push(outer);
   }
  } catch (error) {
   for (const g of geometries) if (typeof g.dispose === 'function') g.dispose();
   throw error;
  }
  for (const mat of materials) {mat.side = Three.DoubleSide;mat.needsUpdate = true;}
  for (const part of parts) E.group.add(part);
 }
 function sunflower(E) {
  const f=requireRoles(E,['up','down','front','back'],'sunflower');
  if(typeof Three.Group!=='function')throw new Error('Sunflower requires Three.Group');
  if(!E.mats||!E.group||typeof E.group.add!=='function')throw new Error('Missing sunflower environment');
  const mats=Object.fromEntries(['up','down','front','back'].map(role=>{
   const mat=E.mats[f[role]];if(!mat||mat===E.hiddenMat)throw new Error('Missing sunflower material: '+role);return [role,mat];
  }));
  const geometries=[],parts=[];
  function face(mat,w,h,x,y,ry,rect) {
   const g=new Three.PlaneGeometry(w,h);geometries.push(g);const uv=g.attributes.uv,r=rect||[0,0,16,16];
   for(let i=0;i<uv.count;i++)uv.setXY(i,(r[0]+uv.getX(i)*(r[2]-r[0]))/16,1-(r[1]+(1-uv.getY(i))*(r[3]-r[1]))/16);
   const m=new Three.Mesh(g,mat);m.position.set(x,y,0);m.rotation.set(0,ry,0);return m;
  }
  try {
   for(const angle of [0,Q])parts.push(face(mats.down,Math.SQRT2,1,0,-.5,angle));
   for(const angle of [0,Q])parts.push(face(mats.up,Math.SQRT2,.5,0,.25,angle,[0,8,16,16]));
   const outer=new Three.Group(),head=new Three.Group(),s=1/Math.cos(Math.PI/8);
   head.add(face(mats.front,14/16,s,.1*s,-s/16,Q));
   head.add(face(mats.back,14/16,s,.1*s,-s/16,-Q));
   head.position.set(0,.5,0);head.rotation.z=Math.PI/8;outer.rotation.y=-Math.PI/4;outer.add(head);parts.push(outer);
  } catch(error) {
   for(const g of geometries)if(typeof g.dispose==='function')g.dispose();throw error;
  }
  for(const mat of Object.values(mats)){mat.side=Three.DoubleSide;mat.needsUpdate=true;}
  for(const part of parts)E.group.add(part);
 }
 return [{id: 'flower', scale: 1.4, mode: 'volume', build: flower}, {id: 'spore_blossom', scale: 1, mode: 'volume', build: spore}, {id: 'sunflower', scale: 1.4, mode: 'volume', build: sunflower}];
}
