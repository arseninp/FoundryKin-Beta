import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {compileFamilies} from './catalog-families.mjs';
test('distinct atlas keys pointing to one PNG identify the same material',()=>{
 const b={oak_planks:{textures:'oak'},oak_stairs:{textures:'legacy_oak'}};
 const t={texture_data:{oak:{textures:'textures/blocks/planks_oak'},legacy_oak:{textures:{path:'textures/blocks/planks_oak'}}}};
 assert.equal(compileFamilies(b,t).owner.oak_stairs,'oak_planks');
});
test('missing atlas keys are not accepted as material evidence',()=>{
 const b={oak_planks:{textures:'missing'},oak_stairs:{textures:'missing'}};
 assert.equal(compileFamilies(b,{texture_data:{}}).owner.oak_stairs,'oak_stairs');
});
test('resolved actual atlas restores oak stairs and all wool forms without losing resources',async()=>{
 const dir=new URL('../data/catalog-candidate/',import.meta.url),b={},t={texture_data:{}};
 for(const n of (await readdir(dir)).filter(n=>/^(blocks|terrain)-\d+\.json$/.test(n)))Object.assign(n.startsWith('blocks-')?b:t.texture_data,JSON.parse(await readFile(new URL(n,dir),'utf8')));
 const r=compileFamilies(b,t);assert.equal(r.owner.oak_stairs,'oak_planks');
 const colors=['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'];
 for(const c of colors)for(const form of ['slab','stairs']){const id=c+'_wool_'+form;if(b[id])assert.equal(r.owner[id],c+'_wool',id)}
 for(const [id,resource] of Object.entries(b))assert.deepEqual(r.families[r.owner[id]].variants.find(v=>v.id===id).resource,resource,id);
 assert.equal(r.owner.pale_moss_carpet,'pale_moss_block');
});
