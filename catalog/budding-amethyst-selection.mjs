/* Additional budding-amethyst view; source cards and owned edit slots stay unchanged. */
import {buddingAmethystResources} from './rules/shared.mjs';
const STAGES=Object.freeze({small:'small_amethyst_bud',medium:'medium_amethyst_bud',large:'large_amethyst_bud',cluster:'amethyst_cluster'});
const PLACEMENTS=Object.freeze({up:[0,1,0,0,0],down:[0,-1,0,0,Math.PI],east:[1,0,0,0,-Math.PI/2],west:[-1,0,0,0,Math.PI/2],north:[0,0,-1,-Math.PI/2,0],south:[0,0,1,Math.PI/2,0]});
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function release(group) {
 const geometries=new Set();
 function visit(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])visit(child);}
 visit(group);for(const geometry of geometries)if(typeof geometry.dispose==='function')geometry.dispose();
}
export function withBuddingAmethystSelection(catalog,resolve,Three) {
 return function(request) {
  if(!dictionary(request)||(request.kind??'block')!=='block'||request.id!=='budding_amethyst'||(request.view??'model')!=='model')return resolve(request);
  const state=request.state??{};
  if(!dictionary(state))throw new Error('Invalid budding amethyst state');
  const crystals=state.crystals===undefined?false:state.crystals,growth=state.growth===undefined?'cluster':state.growth,face=state.face===undefined?'up':state.face;
  if(typeof crystals!=='boolean'||typeof growth!=='string'||!Object.hasOwn(STAGES,growth)||typeof face!=='string'||!Object.hasOwn(PLACEMENTS,face))throw new Error('Invalid budding amethyst view');
  const block=resolve({...request,state:{...state,crystals,growth,face}});
  if(block.object.id!=='budding_amethyst'||block.model!=='cube'||block.mode!=='volume')throw new Error('Invalid budding amethyst base');
  if(!crystals)return block;
  if(!Three||typeof Three.Group!=='function')throw new Error('Budding amethyst view requires Three.Group');
  const crystal=resolve({id:STAGES[growth]}),role='crystal_'+growth,declared=catalog.records.budding_amethyst.dependencies?.[role],expected=buddingAmethystResources[role];
  const paths=[...new Set(Object.values(crystal.bindings))];
  if(crystal.object.id!==STAGES[growth]||crystal.model!=='amethyst'||crystal.mode!=='volume'||!Array.isArray(declared)||declared.length!==1||declared[0]!==expected||paths.length!==1||paths[0]!==expected)throw new Error('Missing or mismatched budding amethyst dependency');
  const [x,y,z,rx,rz]=PLACEMENTS[face];
  return {...block,shared:[...new Set([...block.shared,expected])],scale:Math.max(block.scale,1.4),
   parts:{block:{object:block.object,bindings:{...block.bindings}},crystal:{object:crystal.object,bindings:{...crystal.bindings}}},
   build(environment) {
    if(!dictionary(environment)||!environment.group||typeof environment.group.add!=='function')throw new Error('Missing budding amethyst environment');
    const root=new Three.Group(),blockGroup=new Three.Group(),crystalGroup=new Three.Group();root.add(blockGroup);root.add(crystalGroup);
    crystalGroup.position.set(x,y,z);crystalGroup.rotation.set(rx,0,rz);
    try{block.build({...environment,group:blockGroup});crystal.build({...environment,group:crystalGroup});}catch(error){release(root);throw error;}
    environment.group.add(root);
   }
  };
 };
}
