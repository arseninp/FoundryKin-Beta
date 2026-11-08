import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as config from '../preview-config.mjs';
import {createPreviewText} from '../preview-text.mjs';
import {STONE_REVIEW_BLOCKS} from '../preview-stone-data.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const BED_LABELS=[['white','White','Белая'],['orange','Orange','Оранжевая'],['magenta','Magenta','Пурпурная'],['light_blue','Light blue','Голубая'],['yellow','Yellow','Жёлтая'],['lime','Lime','Лаймовая'],['pink','Pink','Розовая'],['gray','Gray','Серая'],['light_gray','Light gray','Светло-серая'],['cyan','Cyan','Бирюзовая'],['purple','Purple','Фиолетовая'],['blue','Blue','Синяя'],['brown','Brown','Коричневая'],['green','Green','Зелёная'],['red','Red','Красная'],['black','Black','Чёрная']];
const bedKeys=new Set(['card_bed',...BED_LABELS.map(([color])=>'card_'+color+'_bed')]);
const CANDLES=[['candle','Candle','Свеча'],...BED_LABELS.map(([color,en,ru])=>[color+'_candle',en+' candle',ru+' свеча'])];
const CAKES=['cake','candle_cake',...BED_LABELS.map(([color])=>color+'_candle_cake')];
const extensionKeys=new Set([...bedKeys,...CANDLES.map(([id])=>'card_'+id),'card_cake']);
// Preserve the original snapshots; reviewed groups are explicit appended extensions.
test('split config preserves original 602 ordered IDs before reviewed bed candle and cake groups',()=>{
 assert.deepEqual(Object.keys(config).sort(),['REVIEW_IDS','TEXT']);
 assert.equal(config.REVIEW_IDS.length,638);assert.equal(new Set(config.REVIEW_IDS).size,638);
 assert.ok(Object.isFrozen(config.REVIEW_IDS));
 assert.equal(digest(config.REVIEW_IDS.slice(0,602)),'383f57f30d695202881230ee6769ee0bec1a4729b89ba4b27d09b471ed958fba');
 assert.deepEqual(config.REVIEW_IDS.slice(602),['bed',...CANDLES.map(([id])=>id),...CAKES]);
 for(const [color] of BED_LABELS)assert.ok(!config.REVIEW_IDS.includes(color+'_bed'));
});
test('split config retains all original translations and their key order',()=>{
 assert.deepEqual(Object.keys(config.TEXT),['en','ru']);
 assert.equal(Object.keys(config.TEXT.en).length,719);
 assert.deepEqual(Object.keys(config.TEXT.en),Object.keys(config.TEXT.ru));
 for(const labels of Object.values(config.TEXT))for(const value of Object.values(labels))assert.ok(typeof value==='string'&&value.length>0);
 const baseline=Object.fromEntries(Object.entries(config.TEXT).map(([lang,labels])=>[lang,Object.fromEntries(Object.entries(labels).filter(([key])=>!extensionKeys.has(key)))]));
 assert.equal(digest(baseline),'a406284765d3fae91d89ff6ca1a87bff01cd5fa53f97eff098bd83491bb069db');
 assert.deepEqual(Object.keys(config.TEXT.en).slice(684),[...extensionKeys]);
 assert.equal(config.TEXT.en.card_bed,'Bed');assert.equal(config.TEXT.ru.card_bed,'Кровать');
 for(const [color,en,ru] of BED_LABELS){assert.equal(config.TEXT.en['card_'+color+'_bed'],en+' bed');assert.equal(config.TEXT.ru['card_'+color+'_bed'],ru+' кровать');}
 for(const [id,en,ru] of CANDLES){assert.equal(config.TEXT.en['card_'+id],en);assert.equal(config.TEXT.ru['card_'+id],ru);}
 assert.equal(config.TEXT.en.card_cake,'Cake');assert.equal(config.TEXT.ru.card_cake,'Торт');
});
test('stone review data has 273 immutable distinct IDs with EN/RU labels',()=>{
 assert.equal(STONE_REVIEW_BLOCKS.length,273);assert.ok(Object.isFrozen(STONE_REVIEW_BLOCKS));
 const ids=new Set();
 for(const row of STONE_REVIEW_BLOCKS){assert.ok(Object.isFrozen(row));assert.equal(row.length,3);assert.match(row[0],/^[a-z0-9_]+$/);assert.ok(!ids.has(row[0]));ids.add(row[0]);assert.ok(row[1].trim());assert.match(row[2],/[А-Яа-яЁё]/);}
 for(const id of ['stone_stairs','end_brick_stairs','prismarine_bricks_stairs','normal_stone_stairs','stone_brick_stairs','sandstone_stairs','red_sandstone_stairs'])assert.ok(ids.has(id),id);
 for(const id of ['cobblestone_stairs','end_stone_brick_stairs','prismarine_brick_stairs'])assert.ok(!ids.has(id),id);
});
test('base and stone source datasets compose to 911 IDs without collisions or mutation',()=>{
 const before=JSON.stringify({config,STONE_REVIEW_BLOCKS});
 const combined=[...config.REVIEW_IDS,...STONE_REVIEW_BLOCKS.map(([id])=>id)];
 assert.equal(combined.length,911);assert.equal(new Set(combined).size,911);
 assert.deepEqual(combined.slice(0,config.REVIEW_IDS.length),config.REVIEW_IDS);
 assert.equal(JSON.stringify({config,STONE_REVIEW_BLOCKS}),before);
});
test('text factory preserves grammatical forms and does not mutate source label arrays',()=>{
 const input={SHULKER_BOXES:[['undyed','Shulker box','Шалкеровый ящик']],WOOL_COLORS:[['white','White','Белая','Белый','Белые']],WOOL_FORMS:[['wool','wool','шерсть',2],['carpet','carpet','ковёр',3],['wool_stairs','wool stairs','шерстяные ступени',4]],MATERIAL_FORMS:[['concrete','concrete','бетон',3]],FINISHING_BLOCKS:[],WOOD_BLOCKS:[],FIXTURE_BLOCKS:[]};
 const before=JSON.stringify(input),first=createPreviewText(input),second=createPreviewText(input);
 assert.equal(first.ru.card_white_wool,'Белая шерсть');assert.equal(first.ru.card_white_carpet,'Белый ковёр');assert.equal(first.ru.card_white_wool_stairs,'Белые шерстяные ступени');assert.equal(first.ru.card_white_concrete,'Белый бетон');
 assert.equal(first.en.card_undyed_shulker_box,'Shulker box');assert.equal(first.ru.card_undyed_shulker_box,'Шалкеровый ящик');
 assert.deepEqual(first,second);assert.notEqual(first,second);assert.notEqual(first.en,second.en);assert.equal(JSON.stringify(input),before);
});
test('first mineral extension preserves the original 213 rows and appends only reviewed full blocks',()=>{
 assert.equal(digest(STONE_REVIEW_BLOCKS.slice(0,213)),'05c6d06a57c1b6dd469a0058222bd5117336ac3ff2b315d892580896899c4b62');
 const expected='amethyst_block bedrock calcite chiseled_cinnabar chiseled_deepslate chiseled_nether_bricks chiseled_polished_blackstone chiseled_resin_bricks chiseled_sulfur clay coal_block coal_ore coarse_dirt copper_block copper_ore cracked_deepslate_bricks cracked_deepslate_tiles cracked_nether_bricks cracked_polished_blackstone_bricks deepslate_coal_ore deepslate_copper_ore deepslate_diamond_ore deepslate_emerald_ore deepslate_gold_ore deepslate_iron_ore deepslate_lapis_ore deepslate_redstone_ore diamond_block diamond_ore dirt dripstone_block emerald_block emerald_ore end_stone'.split(' ');
 assert.equal(expected.length,34);assert.deepEqual(STONE_REVIEW_BLOCKS.slice(213,247).map(([id])=>id),expected);
});
test('second mineral extension preserves 247 rows and appends 26 reviewed source IDs',()=>{
 assert.equal(digest(STONE_REVIEW_BLOCKS.slice(0,247)),'f2dd8c46999e70a750cd4a4e8b2884453fe126d897fb695703d7d6d5c497bac8');
 const expected='gilded_blackstone gold_block gold_ore gravel iron_block iron_ore lapis_block lapis_ore nether_gold_ore netherite_block netherrack obsidian packed_mud quartz_bricks quartz_ore raw_copper_block raw_gold_block raw_iron_block red_sand redstone_block redstone_ore resin_block sand smooth_basalt chiseled_stone_bricks cracked_stone_bricks'.split(' ');
 assert.equal(expected.length,26);assert.deepEqual(STONE_REVIEW_BLOCKS.slice(247).map(([id])=>id),expected);
});
test('pinned preview expands the real bed source into sixteen owned color sheets',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {createThreeMock,meshesOf}=await import('./three-mock.mjs');
 const {compileReview,REVIEW_IDS,previewTextureField,previewControlSelection}=await import('../preview.mjs');
 const {createPreviewResolver}=await import('../catalog/preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input),Three=createThreeMock();
 assert.ok(Object.hasOwn(input.blocks,'bed'));assert.equal(REVIEW_IDS.filter(id=>id==='bed').length,1);
 const {catalog,registry,coverage}=compileReview(input,Three),resolve=createPreviewResolver(catalog,registry,Three);
 assert.equal(coverage.ready,true);assert.equal(catalog.aliases.bed,'red_bed');assert.equal(resolve({id:'bed'}).object.id,'red_bed');
 const sheets=new Set();
 for(const [color] of BED_LABELS){
  const id=color+'_bed',sheet='textures/entity/bed/'+(color==='light_gray'?'silver':color),record=catalog.records[id],plain=resolve({id});
  assert.equal(record.model,'bed');assert.deepEqual(record.bindings,{sheet:[sheet]});assert.ok(Object.hasOwn(input.existing,sheet));
  assert.ok(catalog.resources[sheet].some(owner=>owner.kind==='block'&&owner.id===id));
  assert.equal(plain.object.id,id);assert.equal(plain.slot,sheet);assert.deepEqual(plain.bindings,{sheet});sheets.add(sheet);
  assert.deepEqual(previewTextureField(plain).values.map(option=>option.value),plain.paths);
  for(const slot of record.paths){
   const selection=previewControlSelection(plain,{texture:slot}),plan=resolve({id,...selection}),group=new Three.Group(),material={};
   assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings,{sheet});plan.build({group,mats:{[sheet]:material}});
   const meshes=meshesOf(group);assert.equal(meshes.length,9);assert.ok(meshes.every(mesh=>mesh.material===material));
  }
 }
 assert.equal(sheets.size,16);assert.ok(!Object.hasOwn(catalog.records,'silver_bed'));
 const existing={...input.existing};delete existing['textures/entity/bed/silver'];
 assert.throws(()=>compileReview({...input,existing},Three),/Missing bed source sheet/);
 assert.equal(JSON.stringify(input),before);
});
test('pinned candles use shared lit controls without coupling state to edited PNG',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {createThreeMock,meshesOf}=await import('./three-mock.mjs');
 const {compileReview,REVIEW_IDS,previewControlSpec,previewControlSelection,previewTextureField}=await import('../preview.mjs');
 const {createPreviewResolver}=await import('../catalog/preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input),Three=createThreeMock();
 const {catalog,registry,coverage}=compileReview(input,Three),resolve=createPreviewResolver(catalog,registry,Three);assert.equal(coverage.ready,true);
 for(const [id] of CANDLES){
  assert.ok(Object.hasOwn(input.blocks,id));assert.equal(REVIEW_IDS.filter(source=>source===id).length,1);
  const record=catalog.records[id],plain=resolve({id});assert.equal(record.model,'candle');assert.deepEqual(plain.state,{lit:false});
  assert.deepEqual(previewTextureField(plain).values.map(option=>option.value),plain.paths);
  const off='textures/blocks/candles/'+id,on=off+'_lit';
  for(const path of [off,on]){assert.ok(record.paths.includes(path));assert.ok(Object.hasOwn(input.existing,path));}
  assert.deepEqual(previewControlSpec(catalog,plain).schema,[{key:'lit',label:['Burning','Горение'],values:[{value:false,label:['Unlit','Не горит']},{value:true,label:['Lit','Горит']}]}]);
  for(const lit of [false,true])for(const slot of record.paths){
   const selection=previewControlSelection(plain,{lit,texture:slot}),plan=resolve({id,...selection}),path=lit?on:off,group=new Three.Group(),material={};
   assert.equal(plan.slot,slot);assert.deepEqual(plan.state,{lit});assert.ok(Object.values(plan.bindings).every(value=>value===path));
   plan.build({group,mats:{[path]:material}});const meshes=meshesOf(group);assert.equal(meshes.length,3);assert.ok(meshes.every(mesh=>mesh.material===material));
  }
  for(const lit of [null,0,1,'true',{},[]]){assert.throws(()=>previewControlSelection(plain,{lit}),/Invalid candle/);assert.throws(()=>resolve({id,state:{lit}}),/Invalid candle/);}
 }
 assert.equal(JSON.stringify(input),before);
});
test('pinned cake source aliases retain indexed resources and reopen one whole cake',async()=>{
 const {fileURLToPath}=await import('node:url'),{readCandidate}=await import('./model-coverage.mjs');
 const {createThreeMock,meshesOf}=await import('./three-mock.mjs');
 const {compileReview,REVIEW_IDS,previewTextureField}=await import('../preview.mjs');
 const {createPreviewResolver}=await import('../catalog/preview.mjs');
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),before=JSON.stringify(input),Three=createThreeMock();
 const {catalog,registry,coverage}=compileReview(input,Three),resolve=createPreviewResolver(catalog,registry,Three);assert.equal(coverage.ready,true);
 const original=JSON.stringify(catalog),expected={up:'textures/blocks/cake_top',down:'textures/blocks/cake_bottom',north:'textures/blocks/cake_side',south:'textures/blocks/cake_side',east:'textures/blocks/cake_side',west:'textures/blocks/cake_side'};
 assert.ok(catalog.cards.includes('cake'));
 for(const id of CAKES){
  assert.ok(Object.hasOwn(input.blocks,id));assert.equal(REVIEW_IDS.filter(source=>source===id).length,1);
  const record=catalog.records[id];assert.equal(record.model,'cake');
  assert.deepEqual(record.variants,catalog.records.cake.variants);assert.deepEqual(record.paths,catalog.records.cake.paths);
  assert.equal(record.variants.up.length,2);assert.equal(record.variants.west.length,2);assert.ok(record.paths.includes('textures/blocks/cake_inner'));
  if(id!=='cake'){assert.equal(catalog.aliases[id],'cake');assert.ok(!catalog.cards.includes(id));}
  const plain=resolve({id});assert.equal(plain.object.id,'cake');assert.equal(plain.object.card,'cake');assert.deepEqual(plain.bindings,expected);
  assert.deepEqual(previewTextureField(plain).values.map(option=>option.value),plain.paths);
  for(const slot of record.paths){
   const plan=resolve({id,slot}),group=new Three.Group(),mats=Object.fromEntries([...new Set(Object.values(expected))].map(path=>[path,{path}]));
   assert.equal(plan.slot,slot);assert.deepEqual(plan.bindings,expected);plan.build({group,mats});assert.equal(meshesOf(group).length,1);
  }
 }
 assert.equal(JSON.stringify(catalog),original);assert.equal(JSON.stringify(input),before);
});
