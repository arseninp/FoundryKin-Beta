import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlantModels} from '../models/plants.mjs';
import {modelPartBindings} from '../catalog/rules/parts.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
function setup(prefix='double_plant_') {
 const paths=Object.fromEntries(['top','bottom','front','back'].map(part=>[part,'textures/blocks/'+prefix+'sunflower_'+part]));
 const record={id:'sunflower',model:'sunflower',faces:{up:[paths.top],down:[paths.bottom],north:[paths.front,paths.back]},paths:[...Object.values(paths),'textures/items/sunflower_front']};
 const bindings=Object.fromEntries(Object.entries(modelPartBindings(record)).map(([role,rows])=>[role,rows[0]]));
 const Three=createThreeMock(),model=createPlantModels(Three).find(m=>m.id==='sunflower');
 const env=()=>({cur:'sunflower',bindings,mats:Object.fromEntries(Object.values(bindings).map(path=>[path,{path}])),group:new Three.Group(),hiddenMat:{}});
 return {paths,record,bindings,Three,model,env};
}
test('sunflower binds front and back explicitly in either resource naming scheme, excluding icons',()=>{
 for(const prefix of ['','double_plant_']) {
  const s=setup(prefix);
  assert.deepEqual(s.bindings,{up:s.paths.top,down:s.paths.bottom,front:s.paths.front,back:s.paths.back});
  assert.equal(s.model.scale,1.4);
  s.record.faces.north=[s.paths.front];assert.throws(()=>modelPartBindings(s.record),/Missing or ambiguous sunflower part: back/);
 }
});
test('sunflower preserves two crossed stem sections and a tilted head with separate front and back',()=>{
 const s=setup(),E=s.env();s.model.build(E);const root=E.group.children,all=meshesOf(E.group);
 assert.equal(root.length,5);assert.equal(all.length,6);
 assert.deepEqual(root.slice(0,4).map(m=>[m.material.path,m.position.y,m.rotation.y]),[[s.paths.bottom,-.5,0],[s.paths.bottom,-.5,Math.PI/2],[s.paths.top,.25,0],[s.paths.top,.25,Math.PI/2]]);
 assert.deepEqual(root[2].geometry.rows,[[0,.5],[1,.5],[0,0],[1,0]]);
 const head=root[4].children[0];assert.equal(root[4].rotation.y,-Math.PI/4);assert.equal(head.rotation.z,Math.PI/8);assert.equal(head.position.y,.5);
 assert.deepEqual(head.children.map(m=>[m.material.path,m.rotation.y]),[[s.paths.front,Math.PI/2],[s.paths.back,-Math.PI/2]]);
 assert.ok(all.every(m=>m.material.side===2));
});
test('editing any owned resource leaves sunflower geometry and named parts unchanged',()=>{
 const s=setup(),before=JSON.stringify(s.bindings);let expected;
 for(const slot of Object.values(s.paths)) {
  const E=s.env();E.slot=slot;s.model.build(E);
  const shot=meshesOf(E.group).map(m=>({size:m.geometry.size,uv:m.geometry.rows,path:m.material.path,x:m.position.x,y:m.position.y,z:m.position.z}));
  expected??=shot;assert.deepEqual(shot,expected);
 }
 assert.equal(JSON.stringify(s.bindings),before);
});
test('missing materials and allocation failures never attach a partial sunflower',()=>{
 const s=setup(),E=s.env();delete E.mats[s.paths.back];assert.throws(()=>s.model.build(E),/Missing sunflower material: back/);assert.equal(E.group.children.length,0);
 const t=setup(),Base=t.Three.PlaneGeometry;t.Three.PlaneGeometry=class extends Base{constructor(...args){if(t.Three.created.length===3)throw new Error('allocation');super(...args);}};
 const model=createPlantModels(t.Three).find(m=>m.id==='sunflower'),F=t.env();assert.throws(()=>model.build(F),/allocation/);assert.equal(F.group.children.length,0);assert.ok(t.Three.created.every(g=>g.disposed));
});
