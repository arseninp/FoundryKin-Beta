/* Geometry only. Texture assignment belongs to the catalog; Three is injected. */
const PARTS = ['base', 'middle', 'frustum', 'tip', 'tip_merge'];
export function createStrandModels(Three) {
  if (!Three || typeof Three.Mesh !== 'function' || typeof Three.PlaneGeometry !== 'function' || Three.DoubleSide === undefined) throw new Error('Strand models require Three');
  function cross(env, id, width, height, y) {
    const material = env.mats[id];
    if (!material || material === env.hiddenMat) throw new Error('Missing segmented material: ' + id);
    material.side = Three.DoubleSide;
    material.needsUpdate = true;
    for (const angle of [0, Math.PI / 2]) {
      const mesh = new Three.Mesh(new Three.PlaneGeometry(width, height), material);
      mesh.position.set(0, y, 0);
      mesh.rotation.y = angle;
      env.group.add(mesh);
    }
  }
  function hangingMoss(env) {
    cross(env, env.faceMap.middle, Math.SQRT2, 1, .5);
    cross(env, env.faceMap.tip, Math.SQRT2, 1, -.5);
  }
  function sulfur(env) {
    const faces = env.faceMap;
    const up = PARTS.some(part => env.slot === faces['up_' + part]);
    const direction = up ? 'up' : 'down';
    const end = env.slot === faces[direction + '_tip_merge'] ? 'tip_merge' : 'tip';
    ['base', 'middle', 'frustum', end].forEach((part, index) => {
      cross(env, faces[direction + '_' + part], Math.SQRT2 * .5, .5, up ? -.75 + index * .5 : .75 - index * .5);
    });
  }
  return [
    {id: 'pale_hanging_moss', scale: 1.4, mode: 'volume', build: hangingMoss},
    {id: 'sulfur_spike', scale: 1.4, mode: 'volume', build: sulfur}
  ];
}
