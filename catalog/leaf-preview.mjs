/* Explicit pinned leaf texture states. No biome tint, model building or source mutation. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const FACES=Object.freeze(['up','down','north','south','east','west']);
const TEXTURES=Object.freeze({
 oak_leaves:'leaves_oak',spruce_leaves:'leaves_spruce',birch_leaves:'leaves_birch',jungle_leaves:'leaves_jungle',
 acacia_leaves:'leaves_acacia',dark_oak_leaves:'leaves_big_oak',cherry_leaves:'cherry_leaves',
 pale_oak_leaves:'pale_oak_leaves',mangrove_leaves:'mangrove_leaves',
 azalea_leaves:'azalea_leaves',azalea_leaves_flowered:'azalea_leaves_flowers',
 orange_poplar_leaves:'orange_poplar_leaves',red_poplar_leaves:'red_poplar_leaves',yellow_poplar_leaves:'yellow_poplar_leaves'
});
const VALUES=Object.freeze(['cutout','opaque']);
const LABELS=Object.freeze({foliage:Object.freeze(['Leaf texture','Текстура листвы']),foliage_cutout:Object.freeze(['Cutout','С прозрачными участками']),foliage_opaque:Object.freeze(['Opaque','Непрозрачная'])});
const matches=plan=>plan?.model==='cube'&&own(TEXTURES,plan.object?.id);
function foliageState(state) {
 if(!dictionary(state))throw new Error('Invalid leaf preview state');
 const value=state.foliage===undefined?'cutout':state.foliage;
 if(!VALUES.includes(value))throw new Error('Invalid leaf preview state: foliage');
 return value;
}
export function leafPreviewSelection(record,state={}) {
 if(record?.model!=='cube'||!own(TEXTURES,record.id))return null;
 const foliage=foliageState(state),index=VALUES.indexOf(foliage),stem='textures/blocks/'+TEXTURES[record.id];
 if(!Array.isArray(record.paths))throw new Error('Missing leaf source resources');
 const expected=[stem,stem+'_opaque'],bindings={};
 for(const face of FACES) {
  const paths=record.variants?.[face];
  if(!Array.isArray(paths)||paths.length!==2||Array.from(paths).some((path,i)=>path!==expected[i]||!record.paths.includes(path)))throw new Error('Missing or invalid leaf variants: '+face);
  bindings[face]=[paths[index]];
 }
 return {bindings,state:{...state,foliage}};
}
export function leafControlState(plan,state) {
 return matches(plan)?{foliage:foliageState(state)}:null;
}
export function leafPreviewField(plan) {
 if(!matches(plan))return null;
 foliageState(plan.state);
 return ['foliage',VALUES.map(value=>[value,value]),'cutout'];
}
export function leafPreviewLabel(plan,key) {
 return matches(plan)&&own(LABELS,key)?[...LABELS[key]]:null;
}
