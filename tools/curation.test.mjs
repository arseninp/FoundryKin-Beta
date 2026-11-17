import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompiledModelFixture,modelSnapshot} from './compiled-model-fixture.mjs';
let runtime;const full=()=>runtime??=createCompiledModelFixture();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
const BOX_FACES=['east','west','up','down','south','north'];
function boxFaces(plan,meshes){
 assert.equal(meshes.length,1);
 const mesh=meshes[0];assert.equal(mesh.geometry.kind,'box');assert.deepEqual(mesh.geometry.size,[1,1,1]);
 assert.ok(Array.isArray(mesh.material));assert.equal(mesh.material.length,6);
 assert.deepEqual(mesh.material.map(material=>material.path),BOX_FACES.map(face=>plan.bindings[face]));
 return mesh;
}
test('coral wall fans and lit ores remain addressable through explicit compiled identity',()=>{
 const r=full(),ids=['horn','brain','bubble','fire','tube'].flatMap(k=>[k+'_coral_wall_fan','dead_'+k+'_coral_wall_fan']).concat(['lit_redstone_ore','lit_deepslate_redstone_ore']);
 for(const id of ids){assert.ok(Object.hasOwn(r.input.blocks,id));const object=r.access.describe(id);assert.ok(object,id);assert.ok(r.catalog.records[object.id]);assert.equal(r.catalog.cards.filter(card=>card===object.card).length,1);}
});
test('redstone lamp retains powered records and six face materials on one cube',()=>{
 const r=full(),card='redstone_lamp',off='redstone_lamp',on='lit_redstone_lamp',group=r.catalog.stateGroups[card];
 assert.deepEqual({...group.variants},{off,on});let previous;
 for(const powered of ['off','on']){
  const base=r.render({id:card,state:{powered}}),{plan,meshes}=base;assert.equal(plan.object.id,powered==='off'?off:on);
  const mesh=boxFaces(plan,meshes),material=mesh.material[0].path;assert.ok(mesh.material.every(m=>m.path===material));
  if(previous)assert.notEqual(material,previous);previous=material;
  for(const p of r.catalog.records[plan.object.id].paths)assert.ok(group.paths.includes(p));
  for(const slot of plan.paths)assert.deepEqual(modelSnapshot(r.render({id:card,slot,state:{powered}}).group),modelSnapshot(base.group));
 }
});
test('redstone torch retains powered records and six planes independently of the lamp',()=>{
 const r=full(),card='redstone_torch',off='unlit_redstone_torch',on='redstone_torch',group=r.catalog.stateGroups[card];
 assert.deepEqual({...group.variants},{off,on});let previous;
 for(const powered of ['off','on']){
  const base=r.render({id:card,state:{powered}}),{plan,meshes}=base;assert.equal(plan.object.id,powered==='off'?off:on);assert.equal(meshes.length,6);
  const material=plan.bindings.up;assert.ok(meshes.every(m=>m.geometry.kind==='plane'&&m.material.path===material));
  if(previous)assert.notEqual(material,previous);previous=material;
  for(const p of r.catalog.records[plan.object.id].paths)assert.ok(group.paths.includes(p));
  for(const slot of plan.paths)assert.deepEqual(modelSnapshot(r.render({id:card,slot,state:{powered}}).group),modelSnapshot(base.group));
 }
});
test('pitcher crop and plant retain stage resources, pod resources and declared icons in one state group',()=>{
 const r=full(),group=r.catalog.stateGroups.pitcher_plant;assert.deepEqual({...group.variants},{crop:'pitcher_crop',grown:'pitcher_plant'});
 for(const id of ['pitcher_crop','pitcher_plant']){assert.equal(r.access.describe(id).card,'pitcher_plant');const record=r.catalog.records[id];for(const path of record.paths)assert.ok(group.paths.includes(path));for(const paths of Object.values(record.dependencies??{}))for(const path of paths)assert.ok(Object.hasOwn(r.input.existing,path));}
 assert.ok(r.catalog.records.pitcher_plant.icons.includes('textures/items/pitcher_pod'));assert.equal(new Set(group.paths).size,group.paths.length);
});
test('pitcher geometry preserves lower and upper coordinate frames independently of edited PNG',()=>{
 const r=full();for(const stage of [1,2,3,4]){const id=stage===4?'pitcher_plant':'pitcher_crop',base=r.render({id,state:{stage}}),planes=base.meshes.filter(m=>m.geometry.size[1]===1),sides=base.meshes.filter(m=>m.geometry.size[1]===6/16);assert.equal(sides.length,4);for(const m of sides){near(m.position.y,-.875);near(m.position.y-3/16,-1.0625);near(m.position.y+3/16,-.6875);}assert.equal(base.meshes.length,stage>=3?10:8);assert.deepEqual(planes.map(m=>m.position.y),stage>=3?[-.5,-.5,.5,.5]:[-.1875,-.1875]);for(const slot of base.plan.paths)assert.deepEqual(modelSnapshot(r.render({id,slot,state:{stage}}).group),modelSnapshot(base.group));}
 const pod=r.render({id:'pitcher_crop',state:{stage:0,pod_only:true}});assert.equal(pod.meshes.length,6);assert.ok(pod.meshes.every(m=>!m.material.path.includes('stage')));assert.equal(pod.plan.scale,1.4);
});
test('pumpkin appearance is selected by explicit variant and not by its edited resource',()=>{
 const r=full();for(const variant of ['plain','carved','lit']){
  const base=r.render({id:'pumpkin',state:{variant}});boxFaces(base.plan,base.meshes);
  assert.equal(base.plan.object.id,{plain:'pumpkin',carved:'carved_pumpkin',lit:'lit_pumpkin'}[variant]);
  assert.equal(base.plan.bindings.south.split('/').pop(),{plain:'pumpkin_side',carved:'pumpkin_face_off',lit:'pumpkin_face_on'}[variant]);
  for(const slot of base.plan.paths)assert.deepEqual(modelSnapshot(r.render({id:'pumpkin',slot,state:{variant}}).group),modelSnapshot(base.group));
 }
});
test('repeater and comparator keep slab geometry, powered records, torch dependencies and declared icons',()=>{
 const r=full();for(const [id,model] of [['unpowered_repeater','repeater'],['unpowered_comparator','comparator']]){
  const record=r.catalog.records[id];assert.ok(record.icons.includes('textures/items/'+model));
  for(const powered of ['off','on']){
   const base=r.render({id,state:{powered}}),{plan,meshes}=base;assert.equal(plan.model,model);
   const sides=meshes.filter(m=>m.geometry.kind==='plane'&&m.geometry.size[0]===1&&m.geometry.size[1]===2/16&&m.material.path===plan.bindings.floor);
   assert.equal(sides.length,4);
   assert.deepEqual(sides.map(m=>[m.position.x,m.position.y,m.position.z]).sort(),[[0,-7/16,-.5],[0,-7/16,.5],[.5,-7/16,0],[-.5,-7/16,0]].sort());
   for(const m of sides){const v=m.geometry.rows.map(p=>(1-p[1])*16);near(Math.min(...v),14);near(Math.max(...v),16);}
   const top=meshes.filter(m=>m.geometry.size[0]===1&&m.geometry.size[1]===1&&m.position.y===-6/16),bottom=meshes.filter(m=>m.geometry.size[0]===1&&m.geometry.size[1]===1&&m.position.y===-.5);
   assert.equal(top.length,1);assert.equal(bottom.length,1);assert.equal(top[0].material.path,plan.bindings[powered==='on'?'top_on':'top_off']);assert.equal(bottom[0].material.path,plan.bindings.floor);
   for(const role of ['torch_on','torch_off']){assert.ok(plan.bindings[role]);assert.ok(Object.hasOwn(r.input.existing,plan.bindings[role]));}
   const torchPaths=[plan.bindings.torch_on,plan.bindings.torch_off],caps=meshes.filter(m=>torchPaths.includes(m.material.path)&&m.geometry.size[0]===2/16&&m.geometry.size[1]===2/16);
   assert.equal(caps.length,model==='repeater'?2:3);
   for(const slot of plan.paths)assert.deepEqual(modelSnapshot(r.render({id,slot,state:{powered}}).group),modelSnapshot(base.group));
  }
 }
 for(const delay of [1,2,3,4])assert.ok(r.render({id:'unpowered_repeater',state:{delay}}).meshes.length>6);assert.throws(()=>r.resolve({id:'unpowered_repeater',state:{delay:5}}),/Invalid/);
});
test('redstone wire keeps its one-sheet geometry with an explicit pattern',()=>{
 const r=full();for(const pattern of ['cross','line']){const base=r.render({id:'redstone_wire',state:{pattern}});assert.equal(base.meshes.length,1);assert.equal(base.meshes[0].position.y,0);assert.equal(base.meshes[0].material.path,base.plan.bindings[pattern==='cross'?'up':'down']);for(const slot of base.plan.paths)assert.deepEqual(modelSnapshot(r.render({id:'redstone_wire',slot,state:{pattern}}).group),modelSnapshot(base.group));}
});
test('dirt path and enchanting table preserve heights and side UV crops',()=>{
 const r=full();for(const [id,h] of [['grass_path',15],['enchanting_table',12]]){const {meshes}=r.render({id});assert.equal(meshes.length,6);const sides=meshes.filter(m=>m.geometry.size[1]===h/16);assert.equal(sides.length,4);for(const m of sides){const v=m.geometry.rows.map(p=>(1-p[1])*16);near(Math.min(...v),16-h);near(Math.max(...v),16);}}
});
test('stonecutter, sniffer egg, sea pickle and spore blossom preserve accepted dimensions',()=>{
 const r=full(),cutter=r.render({id:'stonecutter_block'}).meshes;assert.equal(cutter.length,8);assert.equal(cutter.filter(m=>m.geometry.size[0]===14/16&&m.geometry.size[1]===7/16).length,2);
 const egg=r.render({id:'sniffer_egg'}).meshes;assert.equal(egg.length,6);assert.ok(egg.some(m=>m.geometry.size[0]===14/16&&m.geometry.size[1]===1));assert.equal(r.render({id:'sea_pickle'}).meshes.length,8);
 const blossom=r.render({id:'spore_blossom'}).group;assert.equal(blossom.children.length,5);assert.equal(blossom.children.filter(n=>n.children).length,4);
});
test('sunflower head stays turned forty-five degrees between the stem planes',()=>{
 const {group}=full().render({id:'sunflower'}),outer=group.children.find(n=>n.children);assert.ok(outer);near(outer.rotation.y,-Math.PI/4);const rotations=group.children.filter(n=>!n.children).map(n=>n.rotation.y);assert.ok(rotations.includes(0));assert.ok(rotations.some(a=>Math.abs(a-Math.PI/2)<1e-9));
});
test('ordinary models and explicit item views use the same registry without legacy dispatch',()=>{
 const r=full();assert.ok(r.render({id:'stone'}).meshes.length);const slot=r.catalog.records.unpowered_repeater.icons[0];assert.ok(slot);assert.equal(r.render({id:'unpowered_repeater',slot,view:'sprite'}).meshes.length,1);assert.throws(()=>r.registry.build('missing_model',{}),/Unknown/);
});
