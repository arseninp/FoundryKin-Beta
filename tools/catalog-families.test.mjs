import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
test('groups wool and moss carpets without a per-color table',()=>{
 const data={white_wool:{textures:'white'},white_carpet:{textures:'white'},moss_block:{textures:'moss'},moss_carpet:{textures:'moss'}};
 const r=compileFamilies(data);assert.deepEqual(r.cards,['moss_block','white_wool']);assert.equal(r.owner.white_carpet,'white_wool');assert.equal(r.families.moss_block.variants[1].form,'carpet');
});
test('pale moss carried texture remains part of the carpet variant',()=>{
 const input={pale_moss_block:{textures:'pale'},pale_moss_carpet:{textures:'pale',carried_textures:'pale_side',sound:'moss_carpet'}};
 const r=compileFamilies(input),v=r.families.pale_moss_block.variants.find(v=>v.form==='carpet');
 assert.equal(r.cards.length,1);assert.deepEqual(v.resource,input.pale_moss_carpet);v.resource.carried_textures='changed';assert.equal(input.pale_moss_carpet.carried_textures,'pale_side');
});
test('same texture alone does not merge unrelated blocks',()=>{
 const r=compileFamilies({first:{textures:'same'},second:{textures:'same'}});assert.equal(r.cards.length,2);
});
test('ambiguous material parents are not silently chosen',()=>{
 const r=compileFamilies({oak:{textures:'oak'},oak_planks:{textures:'oak'},oak_slab:{textures:'oak'}});assert.equal(r.owner.oak_slab,'oak_slab');assert.equal(r.report.ambiguous.length,1);
});
test('different resources and orphan forms remain accessible',()=>{
 const r=compileFamilies({stone:{textures:'stone'},stone_slab:{textures:'different'},orphan_carpet:{textures:'orphan'}});assert.equal(r.cards.length,3);assert.equal(r.owner.stone_slab,'stone_slab');
});
test('actual pinned blocks retain every definition and group both moss carpets',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),blocks={};
 for(const n of (await readdir(dir)).filter(n=>/^blocks-\d+\.json$/.test(n)))Object.assign(blocks,JSON.parse(await readFile(new URL(n,dir),'utf8')));
 const before=JSON.stringify(blocks),r=compileFamilies(blocks);
 assert.equal(Object.keys(r.owner).length,Object.keys(blocks).length);
 for(const [id,entry] of Object.entries(blocks)){const v=r.families[r.owner[id]].variants.find(v=>v.id===id);assert.deepEqual(v.resource,entry,id)}
 assert.equal(r.owner.moss_carpet,'moss_block');assert.equal(r.owner.pale_moss_carpet,'pale_moss_block');
 assert.equal(r.families.pale_moss_block.variants.find(v=>v.id==='pale_moss_carpet').resource.carried_textures,'pale_moss_carpet_side');
 assert.equal(JSON.stringify(blocks),before);
});
