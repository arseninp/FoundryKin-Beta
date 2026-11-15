import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompiledModelFixture,modelSnapshot} from './compiled-model-fixture.mjs';
let runtime;const full=()=>runtime??=createCompiledModelFixture();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
test('piston extension is explicit, preserves all resources and includes the head underside',()=>{
 const r=full();for(const id of ['piston','sticky_piston']){
  const base=r.resolve({id}),spec=r.controls.previewControlSpec(r.catalog,base).schema.find(field=>field.key==='extended');assert.ok(spec);assert.deepEqual(spec.values.map(o=>o.value),[false,true]);
  for(const extended of [false,true]){let reference;for(const slot of base.paths){const {plan,group,meshes}=r.render({id,slot,state:{extended}});assert.equal(meshes.length,extended?16:6);assert.ok(meshes.some(m=>m.material.path===plan.bindings.head));if(extended){assert.ok(meshes.some(m=>m.material.path===plan.bindings.inner));assert.ok(meshes.some(m=>m.material.path===plan.bindings.head_back));assert.ok(Math.max(...meshes.map(m=>m.position.y+m.geometry.size[1]/2))>.5);}else assert.ok(!meshes.some(m=>m.material.path===plan.bindings.inner));const shape=modelSnapshot(group);reference??=shape;assert.deepEqual(shape,reference);}}
 }
});
test('crop and turtle egg stages come from the plan, never the edited PNG',()=>{
 const r=full();for(const id of ['wheat','carrots','potatoes','beetroot','turtle_egg']){
  const base=r.resolve({id}),count=base.stages;assert.ok(Number.isInteger(count)&&count>1);if(id==='wheat')assert.equal(count,8);if(id==='carrots')assert.equal(count,4);if(id==='turtle_egg')assert.equal(count,3);
  const field=r.controls.previewControlSpec(r.catalog,base).schema.find(f=>f.key==='stage');assert.deepEqual(field.values.map(o=>o.value),Array.from({length:count},(_,i)=>i));
  for(let stage=0;stage<count;stage++)for(const slot of base.paths){const {plan,meshes}=r.render({id,slot,state:{stage}});assert.equal(meshes.length,id==='turtle_egg'?6:4);assert.ok(meshes.every(m=>m.material.path===plan.bindings.stage));if(id!=='turtle_egg')assert.deepEqual(meshes.map(m=>Math.abs(m.position.x)+Math.abs(m.position.z)),[.25,.25,.25,.25]);else assert.ok(meshes.some(m=>m.geometry.size[0]===4/16&&m.geometry.size[1]===7/16));}
  assert.equal(r.resolve({id,slot:base.paths.at(-1)}).state.stage,0);assert.throws(()=>r.resolve({id,state:{stage:count}}),/Invalid/);
 }
});
test('pink petals and wildflowers preserve four quadrants and sixteen stem planes',()=>{
 const r=full();for(const id of ['pink_petals','wildflowers']){const {plan,meshes}=r.render({id}),petals=meshes.filter(m=>m.material.path===plan.bindings.flower),stems=meshes.filter(m=>m.material.path===plan.bindings.stem);assert.equal(petals.length,4);assert.equal(stems.length,16);assert.deepEqual(petals.map(m=>[m.position.x,m.position.z]),[[-.25,-.25],[-.25,.25],[.25,.25],[.25,-.25]]);assert.deepEqual(petals.map(m=>m.position.y),[(2.99-8)/16,(1-8)/16,(2-8)/16,(2-8)/16]);assert.ok(petals.every(m=>m.geometry.size[0]===.5&&m.geometry.size[1]===.5));assert.ok(stems.every(m=>m.geometry.size[0]===1/16&&m.geometry.size[1]<=2.99/16+1e-9));const per=[0,0,0,0];for(let i=0;i<stems.length;i+=2){const {x,z}=stems[i].position;per[x<0?(z<0?0:1):(z>0?2:3)]++;}assert.deepEqual(per,[3,1,3,1]);const group=new r.Three.Group();assert.throws(()=>r.registry.build('flowerbed',{bindings:{flower:plan.bindings.flower},mats:{[plan.bindings.flower]:{}},group}),/Missing flowerbed binding: stem/);assert.equal(group.children.length,0);}
});
test('tripwire hook attachment is explicit and tripwire retains its thin strip',()=>{
 const r=full(),bare=r.render({id:'tripwire_hook',state:{attached:false}}),attached=r.render({id:'tripwire_hook',state:{attached:true}});
 assert.equal(bare.group.children.filter(n=>!n.children).length,6);assert.deepEqual(bare.group.children.filter(n=>n.children).map(n=>n.rotation.x),[Math.PI/4,-Math.PI/4]);assert.ok(!bare.meshes.some(m=>m.material.path===bare.plan.bindings.string));
 assert.equal(attached.group.children.filter(n=>!n.children).length,12);assert.deepEqual(attached.group.children.filter(n=>n.children).map(n=>n.rotation.x),[-Math.PI/8,-Math.PI/8]);const strip=attached.meshes.filter(m=>m.material.path===attached.plan.bindings.string);assert.equal(strip.length,1);near(strip[0].geometry.size[0],.5/16);near(strip[0].geometry.size[1],6.7/16);
 for(const slot of bare.plan.paths)assert.deepEqual(modelSnapshot(r.render({id:'tripwire_hook',slot,state:{attached:false}}).group),modelSnapshot(bare.group));
 const wire=r.render({id:'trip_wire'}).meshes;assert.equal(wire.length,1);near(wire[0].geometry.size[0],.5/16);assert.equal(wire[0].geometry.size[1],1);near(wire[0].position.y,(1.5-8)/16);
});
test('weeping and twisting vines preserve their growing ends and two-block height',()=>{
 const r=full();for(const id of ['weeping_vines','twisting_vines']){const {plan,meshes}=r.render({id});assert.equal(meshes.length,4);assert.deepEqual(meshes.filter((m,i)=>i%2===0).map(m=>[m.position.y,m.material.path]),id==='weeping_vines'?[[-.5,plan.bindings.down],[.5,plan.bindings.up]]:[[.5,plan.bindings.down],[-.5,plan.bindings.up]]);assert.equal(plan.scale,1.4);}
});
test('nether portal is one sheet while End portal and gateway use the registered sprite',()=>{
 const r=full(),nether=r.render({id:'portal'});assert.equal(nether.meshes.length,1);assert.equal(nether.meshes[0].position.y,0);
 for(const id of ['end_portal','end_gateway']){const {plan,meshes}=r.render({id});assert.equal(plan.mode,'sprite');assert.equal(meshes.length,1);}
});
test('end portal frame eye is explicit and the body stays thirteen pixels high',()=>{
 const r=full();for(const eye of [false,true]){const base=r.render({id:'end_portal_frame',state:{eye}});assert.equal(base.meshes.length,eye?11:6);assert.ok(base.meshes.some(m=>m.geometry.size[1]===13/16));if(eye){const eyes=base.meshes.filter(m=>m.material.path===base.plan.bindings.eye);assert.equal(eyes.length,5);near(Math.max(...eyes.filter(m=>m.geometry.size[1]===3/16).map(m=>m.position.y+m.geometry.size[1]/2)),.5);}for(const slot of base.plan.paths)assert.deepEqual(modelSnapshot(r.render({id:'end_portal_frame',slot,state:{eye}}).group),modelSnapshot(base.group));}
});
test('state schemas are valid production control schemas without chained legacy hooks',()=>{
 const r=full();for(const [id,key] of [['piston','extended'],['sticky_piston','extended'],['tripwire_hook','attached'],['end_portal_frame','eye']]){const field=r.controls.previewControlSpec(r.catalog,r.resolve({id})).schema.find(f=>f.key===key);assert.ok(field);assert.deepEqual(field.values.map(o=>o.value),[false,true]);for(const o of field.values)assert.ok(o.label.length===2&&o.label.every(s=>typeof s==='string'&&s));}assert.throws(()=>r.resolve({id:'missing_model'}),/Unknown/);
});
test('ordinary models remain available and item sprites require an explicit declared icon view',()=>{
 const r=full();assert.ok(r.render({id:'stone'}).meshes.length);const record=r.catalog.records.unpowered_repeater;assert.ok(record.icons.length);const slot=record.icons[0];assert.equal(r.resolve({id:'unpowered_repeater',slot}).model,'repeater');const icon=r.render({id:'unpowered_repeater',slot,view:'sprite'});assert.equal(icon.plan.mode,'sprite');assert.equal(icon.meshes.length,1);
});
