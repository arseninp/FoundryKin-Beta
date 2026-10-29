import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlanarModels} from '../models/planar.mjs';
function setup(id,overrides={}) {
 const Three={DoubleSide:2,PlaneGeometry:class{constructor(w,h){this.size=[w,h];}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set:(...v)=>{this.angles=v;}};}}};
 const env={slot:'icon',faceMap:{up:'top',south:'side'},mats:{icon:{id:'icon'},top:{id:'top'},side:{id:'side'},variant:{id:'variant'}},hiddenMat:{},group:{children:[],add(mesh){this.children.push(mesh);}},...overrides};
 const models=createPlanarModels(Three);return {env,models,build:()=>models.find(m=>m.id===id).build(env)};
}
function snapshot(env){return env.group.children.map(m=>[m.material.id,m.geometry.size,m.xyz,m.angles]);}
test('simple plant has two full axis-aligned planes with accepted width',()=>{
 const s=setup('cross');s.build();assert.equal(s.env.group.children.length,2);
 assert.deepEqual(s.env.group.children.map(m=>m.geometry.size),[[Math.SQRT2,1],[Math.SQRT2,1]]);
 assert.deepEqual(s.env.group.children.map(m=>m.angles),[[0,0,0],[0,Math.PI/2,0]]);
 assert.ok(s.env.group.children.every(m=>m.material.id==='top'&&m.material.side===2));
});
test('sprite uses selected resource regardless of its directory and declares sprite camera mode',()=>{
 const s=setup('sprite');s.env.slot='textures/entity/shield';s.env.mats[s.env.slot]={id:s.env.slot};s.build();
 assert.equal(s.models.find(m=>m.id==='sprite').mode,'sprite');
 assert.equal(s.env.group.children[0].material.id,'textures/entity/shield');
 assert.deepEqual(s.env.group.children[0].geometry.size,[1.1,1.1]);
});
test('horizontal surface does not change when the editor selects a different PNG',()=>{
 const a=setup('rail'),b=setup('rail',{slot:'side'});a.build();b.build();assert.deepEqual(snapshot(a.env),snapshot(b.env));
 assert.deepEqual(a.env.group.children[0].angles,[-Math.PI/2,0,0]);
 const c=setup('rail',{previewPath:'variant'});c.build();assert.equal(c.env.group.children[0].material.id,'variant');
});
test('decal retains its wall offset and ignores unrelated texture slots',()=>{
 const s=setup('decal');s.build();const mesh=s.env.group.children[0];
 assert.deepEqual(mesh.xyz,[0,0,-.49]);assert.equal(mesh.material.id,'side');assert.equal(mesh.material.needsUpdate,true);
});
test('missing or hidden resource fails instead of creating an invisible placeholder',()=>{
 const s=setup('sprite');delete s.env.mats.icon;assert.throws(()=>s.build(),/Missing planar material/);assert.equal(s.env.group.children.length,0);
 const h=setup('cross');h.env.mats.top=h.env.hiddenMat;assert.throws(()=>h.build(),/Missing planar material/);
});
test('invalid Three dependency fails; existing group children are not repositioned',()=>{
 assert.throws(()=>createPlanarModels({}),/require Three/);
 const s=setup('rail'),existing={position:{y:9}};s.env.group.children.push(existing);s.build();assert.equal(existing.position.y,9);
});
