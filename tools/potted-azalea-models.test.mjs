import test from 'node:test';
import assert from 'node:assert/strict';
import {createPottedAzaleaModels} from '../models/potted-azalea.mjs';
function three(){
 class Group{constructor(){this.children=[];this.rotation={set:(...v)=>{this.angles=v;}};this.position={set:(...v)=>{this.xyz=v;}};}add(m){this.children.push(m);}}
 class PlaneGeometry{constructor(w,h){this.size=[w,h];const rows=[[0,1],[1,1],[0,0],[1,0]];this.attributes={uv:{count:4,getX:i=>rows[i][0],getY:i=>rows[i][1],setXY(i,u,v){rows[i]=[u,v];},rows}};}dispose(){this.disposed=true;}}
 class Mesh extends Group{constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
 return {Group,PlaneGeometry,Mesh,FrontSide:0};
}
function setup(cur='azalea',slot='top'){
 const Three=three(),bindings=Object.fromEntries(['pot','soil','top','side','plant'].map(role=>[role,cur+'/'+role])),E={cur,slot,bindings,mats:Object.fromEntries(Object.values(bindings).map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {Three,E,build:()=>createPottedAzaleaModels(Three)[0].build(E)};
}
function shot(E){return E.group.children.map(g=>({xyz:g.xyz,yaw:g.rotation.y,faces:g.children.map(m=>({size:m.geometry.size,xyz:m.xyz,angles:m.angles,uv:m.geometry.attributes.uv.rows,path:m.material.path}))}));}
test('reference layout contains twelve elements and thirty-six one-sided faces',()=>{
 for(const id of ['azalea','flowering_azalea']){const s=setup(id);s.build();assert.equal(s.E.group.children.length,12);const meshes=s.E.group.children.flatMap(g=>g.children);assert.equal(meshes.length,36);assert.ok(meshes.every(m=>m.material.side===0&&m.material.needsUpdate));}
 const m=createPottedAzaleaModels(three())[0];assert.equal(m.id,'potted_azalea');assert.equal(m.scale,1);assert.equal(m.mode,'volume');
});
test('pot walls, soil and canopy keep reference positions without scaling an ordinary azalea',()=>{
 const s=setup();s.build();const p=s.E.group.children;
 assert.deepEqual(p.slice(0,5).map(g=>g.xyz),[[-2.5/16,-5/16,0],[2.5/16,-5/16,0],[0,-5/16,-2.5/16],[0,-5/16,2.5/16],[0,-6/16,0]]);
 assert.ok(Math.abs(p[5].xyz[1]-.496875)<1e-12);
 assert.deepEqual(p.slice(6,10).map(g=>g.xyz),[[0,.25,-.25],[0,.25,.25],[-.25,.25,0],[.25,.25,0]]);
 assert.deepEqual(p[10].xyz,[0,.125,0]);assert.equal(p[10].rotation.y,Math.PI/4);assert.equal(p[11].rotation.y,Math.PI/4);
 assert.ok(Math.abs(p[10].children[0].geometry.size[0]-10.8*Math.SQRT2/16)<1e-12);
 assert.equal(p[10].children[0].geometry.size[1],.75);
});
test('pot, soil and three potted plant roles remain distinct with their own UVs',()=>{
 const s=setup();s.build();const p=s.E.group.children;
 assert.equal(p[4].children[0].material.path,'azalea/pot');assert.equal(p[4].children[1].material.path,'azalea/soil');
 assert.deepEqual(p[5].children[0].geometry.attributes.uv.rows,[[.25,.25],[.75,.25],[.25,.75],[.75,.75]]);
 assert.deepEqual(p[6].children[0].geometry.attributes.uv.rows,[[.25,11/16],[.75,11/16],[.25,3/16],[.75,3/16]]);
 assert.deepEqual(p[10].children[0].geometry.attributes.uv.rows,[[0,.75],[1,.75],[0,0],[1,0]]);
});
test('editing any material does not switch the model or rewrite its resource bindings',()=>{
 for(const id of ['azalea','flowering_azalea']){let expected;for(const slot of ['pot','soil','top','side','plant']){const s=setup(id,slot),before=JSON.stringify(s.E.bindings);s.build();expected??=shot(s.E);assert.deepEqual(shot(s.E),expected);assert.equal(JSON.stringify(s.E.bindings),before);}}
});
test('missing materials are rejected before adding any partial model',()=>{
 for(const role of ['pot','soil','top','side','plant'])for(const hidden of [false,true]){const s=setup();if(hidden)s.E.mats[s.E.bindings[role]]=s.E.hiddenMat;else delete s.E.mats[s.E.bindings[role]];assert.throws(s.build,/Missing potted azalea material/);assert.equal(s.E.group.children.length,0);}
 assert.throws(()=>createPottedAzaleaModels({}),/require Three/);
 const s=setup('unknown');assert.throws(s.build,/Unknown potted azalea object/);
});
test('allocation failure disposes prepared geometry and does not attach groups',()=>{
 const s=setup(),Base=s.Three.PlaneGeometry,created=[];s.Three.PlaneGeometry=class extends Base{constructor(...args){if(created.length===3)throw new Error('allocation');super(...args);created.push(this);}};
 assert.throws(s.build,/allocation/);assert.equal(s.E.group.children.length,0);assert.equal(created.length,3);assert.ok(created.every(g=>g.disposed));
});
