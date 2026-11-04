import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelLibrary, inspectModelCoverage, bindCatalogModels} from '../models/library.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
import {createShulkerBoxModels} from '../models/shulker-boxes.mjs';
import {attachShulkerSource} from '../catalog/rules/shulker-sources.mjs';
function three() {
 return {DoubleSide:2, BoxGeometry:class {constructor(){this.attributes={position:{count:0},normal:{},uv:{}};}},PlaneGeometry:class{},Mesh:class {constructor(){this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};this.rotation={};}}};
}
test('single library registers all migrated builders exactly once and seals the registry',()=>{
 const library=createModelLibrary(three());
 assert.equal(library.ids().length,113);assert.ok(library.has('cube'));assert.ok(library.has('sulfur_spike'));assert.ok(library.has('bell'));
 for(const id of ['lantern','chain','torch','campfire','cross','sprite','rail','decal','pane','candle','brewing','anvil','beacon','pumpkin','door','bed','sign','chest','shulker_box','banner','copper_golem_statue','skull','amethyst','azalea','potted_azalea','bamboo','bamboo_fence','bamboo_gate','pale_moss_carpet','piston','redstone_torch','repeater','comparator','ladder','lectern','lever','shelf','flower','grass_path','enchanting_table','stonecutter','sea_pickle','crop','turtle_egg','vines','portal','end_portal_frame','tripwire','tripwire_hook','spore_blossom','flowerbed','sunflower','sniffer_egg','pitcher','redstone_wire','track','bars','lightning_rod','end_rod','heavy_core','hopper','grindstone','frame','cauldron','cocoa','daylight','flower_pot','decorated_pot','conduit','fire','big_dripleaf','small_dripleaf','sculk_sensor','sculk_shrieker','sculk_catalyst','cactus','pointed_dripstone','dried_ghast','barrel','stage_cross','slime','honey_block','farmland','snow_layer','composter','scaffolding','cage','chorus_plant','chorus_flower','cave_vines','cave_vines_part','dragon_egg','stem','seagrass','mangrove_propagule','kelp','emissive_cross','water','lava'])assert.ok(library.has(id));
 assert.equal(library.get('door').scale,1.4);assert.equal(library.get('bed').scale,1.4);assert.equal(library.get('sign').scale,1);assert.equal(library.get('chest').scale,1);assert.equal(library.get('shulker_box').scale,1);assert.equal(library.get('banner').scale,1.4);assert.equal(library.get('copper_golem_statue').scale,1.4);assert.equal(library.get('skull').scale,1.4);assert.equal(library.get('bamboo').scale,1.8);assert.equal(library.get('piston').scale,1.4);assert.equal(library.get('flower').scale,1.4);assert.equal(library.get('vines').scale,1.4);assert.equal(library.get('sprite').mode,'sprite');
 assert.equal(library.get('cave_vines').scale,1.4);assert.equal(library.get('cave_vines_part').scale,1);
 assert.throws(()=>library.register([{id:'cube',build(){}}]),/sealed/);
 assert.throws(()=>library.build('unknown',{}),/Unknown/);
});
test('coverage returns every missing builder and invalid assignment, without inventing cubes',()=>{
 const records={stone:{model:'cube'},a:{model:'bed'},b:{model:'future_sign'},c:{model:'bed'},d:{},e:{model:null}};
 const before=JSON.stringify(records),report=inspectModelCoverage(records,createModelLibrary(three()));
 assert.equal(report.ready,false);assert.equal(report.total,6);
 assert.deepEqual(report.assigned,{bed:['a','c'],cube:['stone']});assert.deepEqual(report.missing,{future_sign:['b']});assert.deepEqual(report.invalid,['d','e']);
 assert.equal(JSON.stringify(records),before);
});
test('catalog binding validates complete coverage and dispatches to the migrated builder',()=>{
 const catalog={schema:1,records:{stone:{model:'cube'},slab:{model:'slab'}}};
 const {registry,coverage}=bindCatalogModels(catalog,three());assert.equal(coverage.ready,true);
 const group={children:[],add(mesh){this.children.push(mesh);}},faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(face=>[face,'stone']));
 registry.build(catalog.records.slab.model,{cur:'slab',faceMap,mats:{stone:{}},group});
 assert.equal(group.children.length,1);assert.equal(group.children[0].position.y,0);
});
test('incomplete catalog binding exposes the whole coverage report and does not mutate the catalog',()=>{
 const catalog={schema:1,records:{x:{model:'future_sign'},y:{model:'bed'},z:{}}},before=JSON.stringify(catalog);
 assert.throws(()=>bindCatalogModels(catalog,three()),error=>{
  assert.match(error.message,/future_sign: x/);assert.deepEqual(error.coverage.assigned,{bed:['y']});assert.deepEqual(error.coverage.missing,{future_sign:['x']});assert.deepEqual(error.coverage.invalid,['z']);return true;
 });
 assert.equal(JSON.stringify(catalog),before);
});
test('bad catalog structures and missing Three dependencies fail explicitly',()=>{
 for(const catalog of [null,{}, {schema:2,records:{}},{schema:1,records:[]}])assert.throws(()=>bindCatalogModels(catalog,three()),/Invalid compiled/);
 assert.throws(()=>createModelLibrary({}),/require Three/);
 assert.throws(()=>inspectModelCoverage([],createModelLibrary(three())),/Invalid model coverage/);
});
test('liquid source IDs have explicit builders and separate material contracts',()=>{
 const plan=planModelAssignments({water:{},flowing_water:{},lava:{},flowing_lava:{},mystery:{}});
 assert.deepEqual(plan.unresolved,['mystery']);
 for(const [id,model] of Object.entries({water:'water',flowing_water:'water',lava:'lava',flowing_lava:'lava'}))assert.equal(plan.assignments[id].model,model);
 const library=createModelLibrary(three());
 assert.deepEqual(library.get('water').emissiveRoles??[],[]);
 assert.deepEqual(library.get('lava').emissiveRoles,['up','down','north','south','east','west']);
});

const SHULKER_COLORS=['undyed','white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'];
function shulkerShape(node) {
 return {position:[node.position.x,node.position.y,node.position.z],rotation:[node.rotation.x,node.rotation.y,node.rotation.z],...(node.geometry?{size:[...node.geometry.size],uv:node.geometry.rows.map(row=>[...row])}:{}),children:(node.children??[]).map(shulkerShape)};
}
test('shulker source fixtures preserve resources and move only the lid',()=>{
 const Three=createThreeMock(),builder=createShulkerBoxModels(Three)[0],reference=new Map();
 for(const color of SHULKER_COLORS) {
  const id=color+'_shulker_box',native='textures/blocks/'+id,icon='textures/items/'+id,sheet='textures/entity/shulker/shulker_'+(color==='light_gray'?'silver':color);
  const record={id,model:'shulker_box',paths:[native,icon],icons:[icon],carried:{up:[native]}},definition={textures:id},before=JSON.stringify({record,definition});
  const attached=attachShulkerSource(record,definition,{[sheet]:{}});
  assert.equal(attached.id,id);assert.deepEqual(attached.bindings,{sheet:[sheet]});
  assert.deepEqual(attached.paths,[native,icon,sheet].sort());assert.deepEqual(attached.icons,record.icons);assert.deepEqual(attached.carried,record.carried);
  assert.deepEqual(attached.source.definition,definition);assert.notEqual(attached.source.definition,definition);
  assert.throws(()=>attachShulkerSource(record,definition,{}),/Missing shulker source sheet/);
  for(const open of [false,true])for(const slot of [native,sheet]) {
   const group=new Three.Group(),material={};builder.build({cur:id,bindings:{sheet},slot,state:{open},mats:{[sheet]:material},group});
   const meshes=meshesOf(group);assert.equal(meshes.length,2);assert.ok(meshes.every(mesh=>mesh.material===material));
   assert.deepEqual(meshes.map(mesh=>mesh.geometry.size),[[1,.75,1],[1,.5,1]]);
   assert.equal(meshes[0].position.y,open?.625:.125);assert.equal(meshes[1].position.y,-.25);
   assert.equal(group.rotation.y,0);assert.equal(group.children[1].rotation.y,0);
   if(open)assert.equal(group.children[0].rotation.y,-3*Math.PI/2);
   const shape=shulkerShape(group);
   if(reference.has(open))assert.deepEqual(shape,reference.get(open));else reference.set(open,shape);
  }
  const closed=new Three.Group();builder.build({cur:id,bindings:{sheet},state:{},mats:{[sheet]:{}},group:closed});
  assert.deepEqual(shulkerShape(closed),reference.get(false));
  for(const open of [0,1,'true',{},[]]) {
   const group=new Three.Group();assert.throws(()=>builder.build({cur:id,bindings:{sheet},state:{open},mats:{[sheet]:{}},group}),/Invalid shulker box open state/);assert.equal(group.children.length,0);
  }
  assert.equal(JSON.stringify({record,definition}),before);
 }
 assert.notDeepEqual(reference.get(false),reference.get(true));
});
test('pinned review connects shulker colors and player head with independent PNG selection',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {compileReview,REVIEW_IDS,previewControlSpec,previewControlSelection,previewTextureField}=await import('../preview.mjs');
 const {createPreviewResolver}=await import('../catalog/preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),inputBefore=JSON.stringify(input),Three=createThreeMock();
 const {catalog,registry,coverage}=compileReview(input,Three),before=JSON.stringify(catalog),resolve=createPreviewResolver(catalog,registry,Three);
 assert.equal(coverage.ready,true);assert.equal(REVIEW_IDS.length,63);assert.equal(new Set(REVIEW_IDS).size,63);
 const ids=SHULKER_COLORS.map(color=>color+'_shulker_box');
 assert.deepEqual(REVIEW_IDS.filter(id=>catalog.records[id].model==='shulker_box').sort(),[...ids].sort());
 assert.ok(!catalog.cards.includes('silver_shulker_box'));const sheets=new Set();
 for(const color of SHULKER_COLORS) {
  const id=color+'_shulker_box',record=catalog.records[id],sheet='textures/entity/shulker/shulker_'+(color==='light_gray'?'silver':color),plain=resolve({id});
  assert.ok(Object.hasOwn(input.blocks,id));assert.ok(catalog.cards.includes(id));assert.equal(plain.object.id,id);assert.equal(plain.object.card,id);
  assert.deepEqual(record.bindings,{sheet:[sheet]});assert.ok(record.paths.includes(sheet));assert.ok(Object.hasOwn(input.existing,sheet));
  assert.ok(catalog.resources[sheet].some(owner=>owner.kind==='block'&&owner.id===id));sheets.add(sheet);
  assert.deepEqual(plain.state,{open:false});assert.equal(plain.slot,sheet);
  const spec=previewControlSpec(catalog,plain);
  assert.deepEqual(spec.schema,[{key:'open',label:['Lid','Крышка'],values:[{value:false,label:['Closed','Закрыта']},{value:true,label:['Open','Открыта']}]}]);
  assert.deepEqual(previewTextureField(plain).values.map(option=>option.value),record.paths);
  const shapes=new Map();
  for(const open of [false,true])for(const slot of record.paths) {
   const selection=previewControlSelection(plain,{open,texture:slot}),plan=resolve({id,...selection});
   assert.equal(plan.object.id,id);assert.equal(plan.slot,slot);assert.deepEqual(plan.state,{open});assert.deepEqual(plan.bindings,{sheet});
   assert.deepEqual(previewControlSpec(catalog,plan).state,{open});
   const group=new Three.Group();plan.build({group,mats:{[sheet]:{}}});assert.equal(meshesOf(group).length,2);
   const shape=shulkerShape(group);if(shapes.has(open))assert.deepEqual(shape,shapes.get(open));else shapes.set(open,shape);
  }
  assert.notDeepEqual(shapes.get(false),shapes.get(true));
  for(const open of [0,1,'true',{},[]])assert.throws(()=>resolve({id,state:{open}}),/Invalid shulker box preview state/);
 }
 assert.equal(sheets.size,17);
 const player=resolve({id:'player_head'});
 assert.equal(player.object.id,'player_head');assert.equal(player.object.card,'player');assert.equal(player.object.form,'head');
 assert.deepEqual(player.forms,{head:'player_head'});assert.equal(player.bindings.sheet,'textures/entity/steve');
 assert.deepEqual(previewControlSpec(catalog,player).schema.map(field=>field.key),['form']);
 for(const slot of catalog.records.player_head.paths){
  const selection=previewControlSelection(player,{form:'head',texture:slot}),plan=resolve({id:'player',...selection});
  assert.equal(plan.object.id,'player_head');assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings,player.bindings);
 }
 const missing={...input.existing};delete missing['textures/entity/shulker/shulker_silver'];
 assert.throws(()=>compileReview({...input,existing:missing},Three),/Missing shulker source sheet/);
 assert.equal(JSON.stringify(input),inputBefore);assert.equal(JSON.stringify(catalog),before);
});
test('pinned bell preview preserves five legacy parts and independent PNG selection',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {compileReview,previewControlSpec,previewTextureField,resourcePaths}=await import('../preview.mjs');
 const {TEXT}=await import('../preview-config.mjs'),{createPreviewResolver}=await import('../catalog/preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),inputBefore=JSON.stringify(input),Three=createThreeMock();
 const {catalog,registry}=compileReview(input,Three),before=JSON.stringify(catalog),resolve=createPreviewResolver(catalog,registry,Three);
 const record=catalog.records.bell,sheet='textures/entity/bell/bell',plain=resolve({id:'bell'});
 assert.equal(record.model,'bell');assert.ok(catalog.cards.includes('bell'));assert.equal(plain.object.id,'bell');assert.equal(plain.object.card,'bell');
 assert.equal(plain.slot,sheet);assert.deepEqual(plain.bindings,{sheet,beam:record.faces.east[0],posts:record.faces.west[0]});
 assert.deepEqual(plain.state,{});assert.equal(previewControlSpec(catalog,plain).schema,null);assert.deepEqual([TEXT.en.card_bell,TEXT.ru.card_bell],['Bell','Колокол']);
 assert.deepEqual(previewTextureField(plain).values.map(option=>option.value),record.paths);
 for(const path of Object.values(plain.bindings)){assert.ok(Object.hasOwn(input.existing,path));assert.ok(record.paths.includes(path));assert.ok(catalog.resources[path].some(owner=>owner.kind==='block'&&owner.id==='bell'));}
 let reference;
 for(const slot of record.paths){
  const plan=resolve({id:'bell',slot}),group=new Three.Group(),mats=Object.fromEntries(resourcePaths(plan).map(path=>[path,{path}]));plan.build({group,mats});
  const meshes=meshesOf(group);assert.equal(meshes.length,5);assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings,plain.bindings);
  assert.deepEqual(meshes.map(mesh=>mesh.material.path),[plain.bindings.posts,plain.bindings.posts,plain.bindings.beam,sheet,sheet]);
  assert.deepEqual(meshes.map(mesh=>mesh.geometry.size),[[.125,1,.25],[.125,1,.25],[.75,.125,.125],[.375,.4375,.375],[.5,.125,.5]]);
  const shape=JSON.stringify(meshes.map(mesh=>({size:mesh.geometry.size,uv:mesh.geometry.rows,position:[mesh.position.x,mesh.position.y,mesh.position.z]})));
  reference??=shape;assert.equal(shape,reference);
 }
 const missing={...input.existing};delete missing[sheet];assert.throws(()=>compileReview({...input,existing:missing},Three),/Missing bell source sheet/);
 assert.equal(JSON.stringify(input),inputBefore);assert.equal(JSON.stringify(catalog),before);
});
