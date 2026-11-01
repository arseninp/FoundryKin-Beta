/* Compose resolved fruit/stem previews without changing records, owned slots or builders. */
const FRUITS=Object.freeze({pumpkin:['pumpkin','pumpkin_stem'],carved_pumpkin:['pumpkin','pumpkin_stem'],lit_pumpkin:['pumpkin','pumpkin_stem'],melon_block:['cube','melon_stem']});
const OFFSETS=Object.freeze({west:[1,0,0],east:[-1,0,0],north:[0,0,1],south:[0,0,-1]});
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function validPreview(plan) {
 return dictionary(plan)&&dictionary(plan.object)&&plan.object.kind==='block'&&plan.mode==='volume'&&typeof plan.build==='function'&&Number.isFinite(plan.scale)&&plan.scale>0;
}
function disposeGeometry(group) {
 const geometries=new Set();
 function collect(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])collect(child);}
 collect(group);
 for(const geometry of geometries)if(typeof geometry.dispose==='function')geometry.dispose();
}
export function createFruitStemPreview(Three,fruit,stem=null) {
 if(!Three||typeof Three.Group!=='function')throw new Error('Fruit composition requires Three.Group');
 if(!validPreview(fruit)||!Object.hasOwn(FRUITS,fruit.object.id))throw new Error('Invalid fruit preview');
 const [fruitModel,stemId]=FRUITS[fruit.object.id];
 if(fruit.model!==fruitModel)throw new Error('Invalid fruit model');
 let offset=null;
 if(stem!==null) {
  if(!validPreview(stem)||stem.object.id!==stemId||stem.model!=='stem')throw new Error('Mismatched fruit stem preview');
  if(!dictionary(stem.state)||stem.state.attached!==true||!Object.hasOwn(OFFSETS,stem.state.facing))throw new Error('Composition requires an attached directed stem');
  offset=[...OFFSETS[stem.state.facing]];
 }
 const buildFruit=fruit.build.bind(fruit),buildStem=stem===null?null:stem.build.bind(stem);
 return Object.freeze({mode:'volume',scale:stem===null?fruit.scale:Math.max(fruit.scale,1.4),
  build(environment) {
   if(!dictionary(environment)||!environment.group||typeof environment.group.add!=='function')throw new Error('Missing fruit composition environment');
   const root=new Three.Group(),fruitGroup=new Three.Group(),stemGroup=buildStem?new Three.Group():null;
   root.add(fruitGroup);if(stemGroup){stemGroup.position.set(...offset);root.add(stemGroup);}
   try {
    buildFruit({...environment,group:fruitGroup});
    if(buildStem)buildStem({...environment,group:stemGroup});
   } catch(error) {disposeGeometry(root);throw error;}
   environment.group.add(root);
  }
 });
}
