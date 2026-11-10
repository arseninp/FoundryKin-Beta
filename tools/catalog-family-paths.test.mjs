import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {compileFamilies} from './catalog-families.mjs';
import {compiledResourceGroups,compiledFamilyPaths} from '../catalog/editor-selection.mjs';
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

const base='textures/entity/banner/banner_base',a='textures/entity/banner/banner_creeper',b='textures/entity/banner/banner_flower',special='textures/entity/banner/banner_illager',legacy='textures/entity/banner/banner',patternIllager='textures/entity/banner/banner_pattern_illager',icon='textures/items/banner',extra='textures/entity/banner/extra';
function runtime(){
 const paths=[base,a,b,special,legacy,patternIllager,icon,extra],source={template:'banner',base,patterns:{creeper:a,flower:b},special:{legacy,illager:special,pattern_illager:patternIllager}};
 const catalog={records:{standing_banner:{paths:[...paths],icons:[icon],source:structuredClone(source)},wall_banner:{paths:[...paths],icons:[icon],source:structuredClone(source)},stone:{paths:['textures/blocks/stone'],icons:[]}},families:{standing_banner:{native:'standing_banner',wall:'wall_banner'}},stateRoutes:{},stateGroups:{}};
 return {catalog,access:{describe(id){if(!catalog.records[id])return null;return {id,card:id==='stone'?'stone':'standing_banner',form:id==='wall_banner'?'wall':'native'};}}};
}
test('groups cover every owned resource once for both forms without changing input',()=>{
 for(const id of ['standing_banner','wall_banner']){
  const r=runtime(),before=JSON.stringify(r.catalog),groups=compiledResourceGroups(r,id);
  assert.deepEqual(groups.map(group=>group.key),['base','patterns','special','icons','other']);
  assert.deepEqual(groups.find(group=>group.key==='base').paths,[base,special]);
  assert.deepEqual(groups.find(group=>group.key==='patterns').paths,[a,b]);assert.deepEqual(groups.find(group=>group.key==='special').paths,[legacy,patternIllager]);
  const all=groups.flatMap(group=>group.paths);assert.equal(all.length,8);assert.equal(new Set(all).size,8);assert.deepEqual([...all].sort(),compiledFamilyPaths(r,id));
  assert.equal(JSON.stringify(r.catalog),before);assert.ok(Object.isFrozen(groups));
  for(const group of groups){assert.ok(Object.isFrozen(group));assert.ok(Object.isFrozen(group.paths));assert.ok(Object.isFrozen(group.label));}
 }
});
test('available selection filters groups and keeps selected source paths discoverable',()=>{
 const r=runtime(),groups=compiledResourceGroups(r,'standing_banner',[base,b]);
 assert.deepEqual(groups.map(group=>[group.key,group.paths]),[['base',[base]],['patterns',[b]]]);
 assert.deepEqual(compiledResourceGroups(r,'wall_banner',[special]).map(group=>[group.key,group.paths]),[['base',[special]]]);
});
test('foreign resources, conflicting roles and invalid source metadata fail',()=>{
 const r=runtime();for(const paths of [[],[base,base],['textures/foreign']])assert.throws(()=>compiledResourceGroups(r,'standing_banner',paths),/Invalid grouped/);
 r.catalog.records.standing_banner.source.patterns.bad='textures/foreign';assert.throws(()=>compiledResourceGroups(r,'standing_banner'),/Invalid editor resource group/);
 const conflicting=runtime();conflicting.catalog.records.standing_banner.source.special.bad=a;assert.throws(()=>compiledResourceGroups(conflicting,'standing_banner'),/multiple editor groups/);
 const invalid=runtime();invalid.catalog.records.standing_banner.source.patterns=[];assert.throws(()=>compiledResourceGroups(invalid,'standing_banner'),/Invalid banner resource groups/);
});
test('ordinary models keep ungrouped behavior',()=>{assert.equal(compiledResourceGroups(runtime(),'stone'),null);});
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attributes={};this.listeners={};this.open=false;}
 set innerHTML(value){this.children=[];}
 hasChildNodes(){return this.children.length>0;}
 appendChild(child){this.children.push(child);return child;}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(key,callback){this.listeners[key]=callback;}
}
async function slotUi(choice,slot){
 const source=await readFile(new URL('../fk-core.js',import.meta.url),'utf8'),start=source.indexOf('function buildSlotUi(){'),end=source.indexOf('\nfunction setSlot(',start);
 assert.ok(start>=0&&end>start,'Editor slot renderer boundary changed');
 const host=new Element('div'),resourceInfo=new Element('div'),calls=[];let frames=0;
 const context={choice,slot,resourceInfo,unified:{},resourceTools:{appendResourceUsage(){}},clearResourceInfo(){resourceInfo.innerHTML='';resourceInfo.hidden=true;},showErr(code,detail){throw new Error(code+': '+detail);},document:{createElement:tag=>new Element(tag)},FK:{lang:()=> 'ru'},$:()=>host,setSlot:id=>calls.push(id),frameUi:()=>{frames++;}};
 vm.runInNewContext(source.slice(start,end)+'\nbuildSlotUi();',context,{timeout:1000});
 return {host,calls,frames};
}
test('grouped resource UI opens the selected group and toggles without selecting or loading files',async()=>{
 const r=runtime(),result=await slotUi({plan:{paths:compiledFamilyPaths(r,'standing_banner')},resourceGroups:compiledResourceGroups(r,'standing_banner')},b),root=result.host;
 assert.equal(root.children.length,5);assert.deepEqual(root.children.filter(node=>node.open).map(node=>node.dataset.group),['patterns']);
 const group=root.children.find(node=>node.dataset.group==='patterns'),summary=group.children[0];
 assert.equal(summary.className,'fkResourceRow');assert.equal(summary.children.length,2);assert.equal(summary.children[0].textContent,'Рисунки');
 assert.equal(summary.children[1].className,'fkStateValue');assert.equal(summary.children[1].textContent,'2 ▾');
 group.open=false;group.listeners.toggle();assert.equal(summary.children[1].textContent,'2 ▸');assert.deepEqual(result.calls,[]);
 const buttons=group.children[1].children;assert.equal(buttons.find(button=>button.dataset.id===b).attributes['aria-pressed'],'true');
 buttons.find(button=>button.dataset.id===a).onclick();assert.deepEqual(result.calls,[a]);assert.equal(result.frames,1);
});
test('ordinary resource UI remains flat and preserves selection',async()=>{
 const result=await slotUi({plan:{paths:[base,a]},resourceGroups:null},base),root=result.host;
 assert.deepEqual(root.children.map(node=>node.tag),['button','button']);assert.equal(root.children[0].className,'on');
 root.children[1].onclick();assert.deepEqual(result.calls,[a]);assert.equal(result.frames,1);
});
test('opening the illager sheet opens base rather than additional sources',async()=>{
 const r=runtime(),result=await slotUi({plan:{paths:compiledFamilyPaths(r,'standing_banner')},resourceGroups:compiledResourceGroups(r,'standing_banner')},special),root=result.host;
 assert.deepEqual(root.children.filter(node=>node.open).map(node=>node.dataset.group),['base']);
 const group=root.children.find(node=>node.dataset.group==='base');assert.equal(group.children[0].children[1].textContent,'2 ▾');
 assert.equal(group.children[1].children.find(button=>button.dataset.id===special).attributes['aria-pressed'],'true');
});
