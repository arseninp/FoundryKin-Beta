import test from 'node:test';
import assert from 'node:assert/strict';
import {createDriedGhastModels} from '../models/dried-ghast.mjs';
import {utilityBindings} from '../catalog/rules/utility-parts.mjs';
import {SPECIAL_MODELS} from '../catalog/rules/models.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const P='textures/blocks/dried_ghast_state_',NAMES={up:'top',down:'bottom',north:'back',south:'front',east:'left',west:'right'};
function record() {
 const variants=Object.fromEntries(Object.entries(NAMES).map(([face,name])=>[face,[1,2,3,4].map(n=>P+n+'_'+name)]));
 const tent=[1,2,3,4].map(n=>P+n+'_tentacles'),icon='textures/items/dried_ghast';
 return {id:'dried_ghast',model:'dried_ghast',variants,carriedVariants:{up:tent},paths:[...Object.values(variants).flat(),...tent,icon],icons:[icon]};
}
function setup(stage=0,slot) {
 const r=record(),parts=utilityBindings(r),bindings=Object.fromEntries(Object.entries(parts).map(([role,paths])=>[role,paths[0]]));
 const Three=createThreeMock(),descriptor=createDriedGhastModels(Three)[0],E={cur:'dried_ghast',state:{stage},slot,bindings,mats:Object.fromEntries(r.paths.map(path=>[path,{path}])),hiddenMat:{},group:new Three.Group()};
 return {r,parts,Three,E,descriptor,build:()=>descriptor.build(E)};
}
test('dried ghast registers one explicit builder with 28 indexed part bindings, excluding its item icon',()=>{
 const s=setup();assert.equal(SPECIAL_MODELS.dried_ghast,'dried_ghast');assert.equal(s.descriptor.id,'dried_ghast');assert.equal(s.descriptor.scale,1);
 assert.equal(Object.keys(s.parts).length,28);assert.equal(s.r.paths.length,29);assert.ok(!Object.values(s.parts).flat().includes(s.r.icons[0]));
});
test('all four stages select their six body images and tentacles synchronously for every edited resource',()=>{
 for(let stage=0;stage<4;stage++)for(const slot of record().paths) {
  const s=setup(stage,slot),before=JSON.stringify(s.r);s.build();const m=meshesOf(s.E.group);
  assert.equal(m.length,42);assert.equal(m.filter(mesh=>mesh.material.path===P+(stage+1)+'_tentacles').length,36);
  assert.deepEqual(m.slice(0,6).map(mesh=>mesh.material.path),['front','right','back','left','top','bottom'].map(name=>P+(stage+1)+'_'+name));
  assert.equal(JSON.stringify(s.r),before);
 }
});
test('body retains the accepted half-turn, ten-pixel dimensions and six one-pixel tentacles',()=>{
 const s=setup();s.build();const m=meshesOf(s.E.group);
 assert.ok(m.slice(0,6).every(mesh=>JSON.stringify(mesh.geometry.size)==='[0.625,0.625]'));
 assert.equal(m[0].position.z,-5/16);assert.equal(m[0].material.path,P+'1_front');assert.equal(m[2].position.z,5/16);assert.equal(m[2].material.path,P+'1_back');
 assert.ok(m.slice(6).every(mesh=>mesh.position.y<=-7/16));
 assert.ok(m.every(mesh=>mesh.geometry.rows.every(row=>row.every(v=>v>=0&&v<=1))));
});
test('indexed bindings retain repeated images and reject incomplete or foreign stage resources',()=>{
 const r=record();r.variants.up[1]=r.variants.up[0];const parts=utilityBindings(r);assert.deepEqual(parts.stage_1_up,parts.stage_0_up);assert.equal(Object.keys(parts).length,28);
 const bad=record();bad.variants.west.pop();assert.throws(()=>utilityBindings(bad),/Incomplete dried ghast stages: west/);
 const tent=record();tent.carriedVariants.up.pop();assert.throws(()=>utilityBindings(tent),/Incomplete dried ghast stages: tent/);
 const foreign=record();foreign.paths=foreign.paths.filter(path=>path!==foreign.variants.north[3]);assert.throws(()=>utilityBindings(foreign),/Missing or ambiguous/);
});
test('invalid stages and missing materials reject before attaching a partial model',()=>{
 for(const stage of [-1,4,1.5,'1']) {const s=setup(stage);assert.throws(s.build,/Invalid dried ghast stage/);assert.equal(s.E.group.children.length,0);}
 const s=setup();delete s.E.mats[P+'1_tentacles'];assert.throws(s.build,/Missing model material/);assert.equal(s.E.group.children.length,0);assert.ok(s.Three.created.every(g=>g.disposed));
});
