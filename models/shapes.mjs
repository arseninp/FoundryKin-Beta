/* Shared geometry painter. Meshes are collected first, so a failed model never leaves a partial scene. */
const FULL = [0, 0, 16, 16], Q = Math.PI / 2;
export function composeShape(Three, E, draw) {
 if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || typeof Three.BoxGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Shape models require Three');
 if (!E || !E.mats || !E.group || typeof E.group.add !== 'function') throw new Error('Missing shape environment');
 const geometries = [], doubled = new Set();
 function material(path) {
  const mat = E.mats[path];
  if (typeof path !== 'string' || !path || !mat || mat === E.hiddenMat) throw new Error('Missing model material: ' + path);
  return mat;
 }
 function fragment() {
  const items = [];
  const api = {
   face(path, w, h, x, y, z, rx, ry, rect, double) {
    const mat = material(path), geometry = new Three.PlaneGeometry(w, h), r = rect || FULL, k = r[4] || 0;
    geometries.push(geometry);
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
     const a = uv.getX(i), b = 1 - uv.getY(i);
     let s = a, t = b;
     if (k === 90) {s = b;t = 1 - a;} else if (k === 180) {s = 1 - a;t = 1 - b;} else if (k === 270) {s = 1 - b;t = a;}
     uv.setXY(i, (r[0] + s * (r[2] - r[0])) / 16, 1 - (r[1] + t * (r[3] - r[1])) / 16);
    }
    const mesh = new Three.Mesh(geometry, mat);
    mesh.position.set(x, y, z);mesh.rotation.set(rx || 0, ry || 0, 0);
    if (double) doubled.add(mat);
    items.push(mesh);
   },
   box(a, b, F, R) {
    const w = (b[0] - a[0]) / 16, h = (b[1] - a[1]) / 16, d = (b[2] - a[2]) / 16, x = (a[0] + b[0] - 16) / 32, y = (a[1] + b[1] - 16) / 32, z = (a[2] + b[2] - 16) / 32;
    const p = {north: [w, h, x, y, (a[2] - 8) / 16, 0, Math.PI], south: [w, h, x, y, (b[2] - 8) / 16, 0, 0], east: [d, h, (b[0] - 8) / 16, y, z, 0, Q], west: [d, h, (a[0] - 8) / 16, y, z, 0, -Q], up: [w, d, x, (b[1] - 8) / 16, z, -Q, 0], down: [w, d, x, (a[1] - 8) / 16, z, Q, 0]};
    for (const face of Object.keys(F)) api.face(F[face], ...p[face], R[face], false);
   },
   prism(w, h, d, x, y, z, path, R, N) {
    const mat = material(path), geometry = new Three.BoxGeometry(w, h, d), size = N || 64;
    geometries.push(geometry);
    const pos = geometry.attributes.position, nor = geometry.attributes.normal, uv = geometry.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
     const nx = nor.getX(i), ny = nor.getY(i), nz = nor.getZ(i), lx = pos.getX(i) / w + .5, ly = pos.getY(i) / h + .5, lz = pos.getZ(i) / d + .5;
     let face, a, b;
     if (nx > .5) {face = 'east';a = 1 - lz;b = ly;} else if (nx < -.5) {face = 'west';a = lz;b = ly;}
     else if (nz > .5) {face = 'south';a = lx;b = ly;} else if (nz < -.5) {face = 'north';a = 1 - lx;b = ly;}
     else if (ny > .5) {face = 'up';a = lx;b = 1 - lz;} else {face = 'down';a = lx;b = lz;}
     const r = R[face] || R.up, k = r[4] || 0, s = k ? 1 - b : a, t = k === 1 ? 1 - a : k === 2 ? a : 1 - b;
     uv.setXY(i, (r[0] + s * (r[2] - r[0])) / size, 1 - (r[1] + t * (r[3] - r[1])) / size);
    }
    const mesh = new Three.Mesh(geometry, mat);
    mesh.position.set(x, y, z);items.push(mesh);
   },
   turned(angle, drawInner) {
    if (typeof Three.Group !== 'function') throw new Error('Shape rotation requires Three.Group');
    const inner = fragment();
    drawInner(inner.api);items.push({inner, angle});
   }
  };
  return {api, flush(target) {
   for (const item of items) {
    if (item.inner) {
     const group = new Three.Group();
     group.rotation.y = item.angle;item.inner.flush(group);target.add(group);
    } else target.add(item);
   }
  }};
 }
 const root = fragment();
 try {draw(root.api);} catch (error) {
  for (const geometry of geometries) if (typeof geometry.dispose === 'function') geometry.dispose();
  throw error;
 }
 for (const mat of doubled) {mat.side = Three.DoubleSide;mat.needsUpdate = true;}
 root.flush(E.group);
}
export function requireRoles(E, names, label) {
 const bindings = E && (E.bindings ?? E.faceMap);
 if (!bindings) throw new Error('Missing ' + label + ' bindings');
 for (const name of names) if (typeof bindings[name] !== 'string' || !bindings[name]) throw new Error('Missing ' + label + ' binding: ' + name);
 return bindings;
}
