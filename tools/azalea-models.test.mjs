import test from 'node:test';
import assert from 'node:assert/strict';
import {createAzaleaModels} from '../models/azalea.mjs';
function three(){
 class PlaneGeometry{constructor(w,h){this.size=[w,h];const rows=[[0,1],[1,1],[0,0],[1,0]];this.attributes={uv:{count:4,getX:i=>rows[i][0],getY:i=>rows[i][1],setXY(i,u,v){rows[i]=[u,v];},rows}};}dispose(){this.disposed=true;}}
 class Mesh{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(...v)=>{this.xyz=v;}};this.rotation={set:(...v)=>{this.angles=v;}};}}
 return {PlaneGeometry,Mesh,DoubleSide:2};
}
function setup(id='azalea',slot='top'){
 const bindings=Object.fromEntries(['top','side','plant'].map(role=>[role,id+'/'+role]));
 const E={cur:id,slot,bindings,hiddenMat:{},mats:Object.fromEntries(Object.values(bindings).map(path=>[path,{path}])),group:{children:[],add(mesh){this.children.push(mesh);}}};
 return {E,build:()=>createAzaleaModels(three())[0].build(E)};
}
function shot(E){return E.group.children.map(m=>({path:m.material.path,size:m.geometry.size,xyz:m.xyz,angles:m.angles,order:m.rotation.order,uv:m.geometry.attributes.uv.rows}));}
test('one descriptor handles both normal and flowering unpotted azalea',()=>{
 const models=createAzaleaModels(three());assert.equal(models.length,1);assert.equal(models[0].id,'azalea');assert.equal(models[0].scale,1);assert.equal(models[0].mode,'volume');
 for(const id of ['azalea','flowering_azalea']){const s=setup(id);s.build();assert.equal(s.E.group.children.length,7);assert.ok(s.E.group.children.every(m=>m.material.path.startsWith(id+'/')));}
});
test('all seven planes retain the accepted dimensions, positions and angles',()=>{
 const s=setup();s.build();const expected=[
  [[1,1],[0,.5,0],[-Math.PI/2,0,0]],
  [[1,11/16],[0,5/32,-.5],[0,Math.PI,0]],
  [[1,11/16],[0,5/32,.5],[0,0,0]],
  [[1,11/16],[.5,5/32,0],[0,Math.PI/2,0]],
  [[1,11/16],[-.5,5/32,0],[0,-Math.PI/2,0]],
  [[15.8*Math.SQRT2/16,15.9/16],[0,(15.9/2-8)/16,0],[0,Math.PI/4,0]],
  [[15.8*Math.SQRT2/16,15.9/16],[0,(15.9/2-8)/16,0],[0,-Math.PI/4,0]]
 ];
 s.E.group.children.forEach((m,i)=>{assert.deepEqual([m.geometry.size,m.xyz,m.angles],expected[i]);assert.equal(m.rotation.order,'YXZ');});
 assert.deepEqual(s.E.group.children.map(m=>m.material.path),['azalea/top','azalea/side','azalea/side','azalea/side','azalea/side','azalea/plant','azalea/plant']);
});
test('side UVs keep the eleven-pixel crop; top and plant retain the full PNG',()=>{
 const s=setup();s.build();s.E.group.children.forEach((m,i)=>{
  const bottom=i>=1&&i<=4?5/16:0;assert.deepEqual(m.geometry.attributes.uv.rows,[[0,1],[1,1],[0,bottom],[1,bottom]]);assert.equal(m.material.side,2);assert.equal(m.material.needsUpdate,true);
 });
});
test('selected editing slots cannot switch or reshape either azalea',()=>{
 for(const id of ['azalea','flowering_azalea']){let expected;for(const slot of ['top','side','plant','potted_top','potted_side','potted_plant']){const s=setup(id,slot);s.build();expected??=shot(s.E);assert.deepEqual(shot(s.E),expected);}}
});
test('bindings and existing group children are not changed',()=>{
 const s=setup(),before=JSON.stringify(s.E.bindings),existing={position:{y:9}};s.E.group.children.push(existing);s.build();assert.equal(s.E.group.children[0],existing);assert.equal(existing.position.y,9);assert.equal(JSON.stringify(s.E.bindings),before);
});
test('invalid objects and missing or hidden materials fail before attaching meshes',()=>{
 assert.throws(()=>createAzaleaModels({}),/require Three/);
 for(const id of ['potted_azalea','unknown',null]){const s=setup(id);assert.throws(s.build,/Unknown azalea object/);assert.equal(s.E.group.children.length,0);}
 for(const role of ['top','side','plant'])for(const hidden of [false,true]){const s=setup();if(hidden)s.E.mats[s.E.bindings[role]]=s.E.hiddenMat;else delete s.E.mats[s.E.bindings[role]];assert.throws(s.build,/Missing azalea material/);assert.equal(s.E.group.children.length,0);}
});
test('failed allocation disposes prepared geometry and leaves the group unchanged',()=>{
 const Three=three(),Base=Three.PlaneGeometry,created=[];Three.PlaneGeometry=class extends Base{constructor(...args){if(created.length===2)throw new Error('allocation');super(...args);created.push(this);}};
 const s=setup();assert.throws(()=>createAzaleaModels(Three)[0].build(s.E),/allocation/);assert.equal(s.E.group.children.length,0);assert.equal(created.length,2);assert.ok(created.every(g=>g.disposed));
});
