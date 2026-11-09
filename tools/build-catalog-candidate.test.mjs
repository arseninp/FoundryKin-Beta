import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { snapshot, chunks, writeCandidate } from './build-catalog-candidate.mjs';
import {assembleChunks} from '../catalog/load.mjs';
const commit = '46ba6ea985fb5a92d79a9419198f10dda14c199d';
const ACTIVE = ['white_wool', 'camera', 'pale_moss_carpet', 'grass_block', 'iron_chain', 'sea_lantern', 'trip_wire'];
const TERRAIN = Object.fromEntries(['white', 'portal', 'moss', 'moss_side', 'grass_top', 'grass_side', 'chain1', 'chain2', 'sea_lantern', 'trip_wire'].map(x => [x, { textures: 'textures/blocks/' + x }]));
const PATHS = ['resource_pack/textures/blocks/wool_white.png', 'resource_pack/textures/blocks/portal.tga'];
function definitions() {
  return { wool: { textures: 'old' }, white_wool: { textures: 'white' }, camera: { textures: 'camera' }, end_gateway: { textures: 'portal' }, pale_moss_carpet: { textures: 'moss', carried_textures: 'moss_side' }, grass: { textures: { up: 'grass_top', side: 'grass_side' } }, chain: { textures: { up: 'chain1', side: 'chain2' } }, seaLantern: { textures: 'sea_lantern' }, tripWire: { textures: 'trip_wire' } };
}
function registry(ids = ACTIVE) { return { data_items: ids.map(id => ({ name: 'minecraft:' + id })) }; }
function fixture() { return snapshot(definitions(), registry(), { texture_data: TERRAIN }, PATHS, commit); }
test('admission is separate from auxiliary render resources', () => {
  const data = fixture();
  assert.equal(data.blocks.wool, undefined);
  assert.equal(data.blocks.camera, undefined);
  assert.equal(data.blocks.end_gateway, undefined);
  assert.ok(data.auxiliary.end_gateway);
  assert.ok(data.terrain.moss_side);
});
test('legacy ids feed only exact active aliases', () => {
  const data = fixture();
  assert.equal(data.blocks.grass_block.textures.up, 'grass_top');
  assert.equal(data.blocks.iron_chain.textures.side, 'chain2');
  assert.equal(data.blocks.sea_lantern.textures, 'sea_lantern');
  assert.equal(data.blocks.trip_wire.textures, 'trip_wire');
  for (const old of ['grass', 'chain', 'seaLantern', 'tripWire']) assert.equal(data.blocks[old], undefined);
  assert.deepEqual(data.report.legacyAliases.map(x => x.target), ['grass_block', 'iron_chain', 'sea_lantern', 'trip_wire']);
});
test('alias copies do not mutate input definitions', () => {
  const input = definitions(), before = JSON.stringify(input);
  const data = snapshot(input, registry(), { texture_data: TERRAIN }, PATHS, commit);
  data.blocks.grass_block.textures.up = 'changed';
  assert.equal(JSON.stringify(input), before);
});
test('missing alias source or inactive target fails closed', () => {
  const noSource = definitions(); delete noSource.grass;
  assert.throws(() => snapshot(noSource, registry(), { texture_data: TERRAIN }, PATHS, commit), /legacy resource alias source is missing/);
  assert.throws(() => snapshot(definitions(), registry(['white_wool']), { texture_data: TERRAIN }, PATHS, commit), /Alias target is absent/);
});
test('chunks obey byte limits and preserve all entries', () => {
  const input = { a: 'мох', b: 'шерсть', c: 'текстура' };
  const parts = chunks(input, 32);
  assert.deepEqual(Object.assign({}, ...parts), input);
  assert.ok(parts.every(part => Buffer.byteLength(JSON.stringify(part)) <= 32));
  assert.throws(() => chunks({ a: 'x'.repeat(50) }, 20));
});
test('writes review-only manifest with verifiable hashes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fk-candidate-'));
  try {
    await writeCandidate(directory, fixture());
    const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
    assert.equal(manifest.candidate, true);
    assert.equal(manifest.source.commit, commit);
    for (const file of manifest.files) {
      const text = await readFile(join(directory, file.name));
      assert.ok(text.length <= 25000);
      assert.equal(createHash('sha256').update(text).digest('hex'), file.sha256);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('rejects unrelated source revisions', () => {
  assert.throws(() => snapshot({}, {}, {}, [], '0'.repeat(40)));
});

test('old manifests do not invent an empty item atlas',()=>{
 const data=assembleChunks({schema:1,counts:{blocks:0,terrain:0,existing:0}},[]);
 assert.equal(Object.hasOwn(data,'items'),false);
});
test('item chunks preserve indexed alternatives and separate terrain keys',()=>{
 const manifest={schema:1,counts:{blocks:0,terrain:1,existing:0,items:2}},bed={textures:['textures/items/bed_white','textures/items/bed_silver','textures/items/bed_white']};
 const parts=[{name:'terrain-000.json',value:{sign:{textures:'textures/blocks/planks_oak'}}},{name:'items-000.json',value:{bed}},{name:'items-001.json',value:{sign:{textures:{path:'textures/items/sign'}}}}],before=JSON.stringify({manifest,parts});
 const data=assembleChunks(manifest,parts);
 assert.deepEqual(data.items.texture_data.bed,bed);
 assert.equal(data.items.texture_data.sign.textures.path,'textures/items/sign');
 assert.equal(data.terrain.texture_data.sign.textures,'textures/blocks/planks_oak');
 assert.equal(JSON.stringify({manifest,parts}),before);
});
test('item counts, duplicates and invalid sections fail closed',()=>{
 const manifest={schema:1,counts:{blocks:0,terrain:0,existing:0,items:1}},part={name:'items-000.json',value:{sign:{textures:'textures/items/sign'}}};
 assert.throws(()=>assembleChunks(manifest,[]),/count mismatch: items/);
 assert.throws(()=>assembleChunks(manifest,[part,{...part,name:'items-001.json'}]),/Duplicate catalog key/);
 assert.throws(()=>assembleChunks(manifest,[{...part,value:[]}]),/Invalid catalog section/);
 for(const items of [-1,1.5,'1',null])assert.throws(()=>assembleChunks({...manifest,counts:{...manifest.counts,items}},[part]),/Invalid item atlas count/);
 const legacy={...manifest,counts:{blocks:0,terrain:0,existing:0}};
 assert.throws(()=>assembleChunks(legacy,[part]),/Item atlas count is missing/);
 assert.deepEqual(assembleChunks({...manifest,counts:{...manifest.counts,items:0}},[]).items,{texture_data:{}});
});
function iconFixture(){
 const extra={acacia_door:{textures:'white'},standing_sign:{textures:'white'},wall_sign:{textures:'white'},bed:{textures:'white'}};
 const colors='white orange magenta light_blue yellow lime pink gray silver cyan purple blue brown green red black'.split(' ');
 const items={texture_data:{chain:{textures:'textures/items/chain'},string:{textures:'textures/items/string'},acacia_door:{textures:'textures/items/door_acacia'},sign:{textures:{path:'textures/items/sign'}},bed:{textures:colors.map(color=>'textures/items/bed_'+color)},unused:{textures:'textures/items/not_in_scope'}}};
 const defs={...definitions(),...extra},reg=registry([...ACTIVE,...Object.keys(extra)]);
 return {defs,reg,items,build:()=>snapshot(defs,reg,{texture_data:TERRAIN},PATHS,commit,items)};
}
test('snapshot selects linked icons and the bed source without mutating the official atlas',()=>{
 const f=iconFixture(),before=JSON.stringify(f.items),data=f.build();
 assert.deepEqual(Object.keys(data.items),['acacia_door','bed','chain','sign','string']);
 assert.equal(data.items.acacia_door.textures,'textures/items/door_acacia');
 assert.deepEqual(data.items.bed,f.items.texture_data.bed);
 assert.equal(data.items.bed.textures.length,16);assert.equal(data.items.bed.textures[8],'textures/items/bed_silver');
 assert.equal(data.items.sign.textures.path,'textures/items/sign');
 data.items.bed.textures[0]='changed';assert.equal(JSON.stringify(f.items),before);
 assert.equal(Object.hasOwn(fixture(),'items'),false);
});
test('item source schema and missing required icon links are rejected',()=>{
 for(const items of [null,{}, {texture_data:[]}])assert.throws(()=>snapshot(definitions(),registry(),{texture_data:TERRAIN},PATHS,commit,items),/Missing item texture data/);
 const f=iconFixture();delete f.items.texture_data.acacia_door;assert.throws(()=>f.build(),/Missing item-atlas link/);
 const bed=iconFixture();delete bed.items.texture_data.bed;assert.throws(()=>bed.build(),/Missing item-atlas entry: bed/);
});
test('generated item chunks round-trip through the production loader with verifiable hashes',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'fk-icons-'));
 try{
  const data=iconFixture().build(),before=JSON.stringify(data);await writeCandidate(directory,data);
  const manifest=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8')),parts=[];
  assert.equal(manifest.counts.items,5);assert.ok(manifest.files.some(file=>/^items-\d{3}\.json$/.test(file.name)));
  for(const file of manifest.files){const text=await readFile(join(directory,file.name),'utf8');assert.ok(Buffer.byteLength(text)<=25000);assert.equal(createHash('sha256').update(text).digest('hex'),file.sha256);parts.push({name:file.name,value:JSON.parse(text)})}
  const loaded=assembleChunks(manifest,parts);assert.deepEqual(loaded.items.texture_data,data.items);assert.deepEqual(loaded.terrain.texture_data,data.terrain);assert.equal(JSON.stringify(data),before);
 }finally{await rm(directory,{recursive:true,force:true})}
});
