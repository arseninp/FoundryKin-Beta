/* Family navigation and edited slots remain separate from the composed model view. */
import {createCatalogAccess} from './access.mjs';
import {createFruitStemPreview} from './fruit-stem-preview.mjs';
const PAIRS=Object.freeze({pumpkin:'pumpkin_stem',melon_block:'melon_stem'});
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function withFruitStemSelection(catalog,resolve,Three) {
 const access=createCatalogAccess(catalog);
 return function(request) {
  if(!dictionary(request)||(request.kind??'block')!=='block'||(request.view??'model')!=='model')return resolve(request);
  const initial=access.describe(request.id,'block',request.form),family=initial?catalog.families[initial.card]:null;
  if(!initial||!Object.hasOwn(PAIRS,initial.card)||family?.stem!==PAIRS[initial.card])return resolve(request);
  const state=request.state??{},choices=request.faceChoices??{};
  if(!dictionary(state)||!dictionary(choices))throw new Error('Invalid preview parameters');
  const stemId=family.stem,fruitId=initial.form==='stem'?initial.card:initial.id;
  const withStem=state.stem===undefined?initial.form==='stem':state.stem;
  if(typeof withStem!=='boolean')throw new Error('Invalid fruit stem preview state');
  const paths=[...new Set([...(catalog.stateGroups?.[initial.card]?.paths??catalog.records[fruitId].paths),...catalog.records[stemId].paths])];
  const slot=request.slot??catalog.records[initial.id].paths[0];
  if(typeof slot!=='string'||!paths.includes(slot))throw new Error('Texture is outside the selected fruit family');
  const fruit=resolve({...request,id:fruitId,form:undefined,slot:undefined,state:{...state,stem:withStem}});
  let stem=null;
  if(withStem) {
   const stage=state.stage===undefined?7:state.stage,attached=state.attached===undefined?true:state.attached,facing=state.facing===undefined?'west':state.facing;
   if(!Number.isInteger(stage)||stage<0||stage>7)throw new Error('Invalid stem stage');
   if(attached!==true)throw new Error('Fruit view requires an attached stem');
   stem=resolve({id:stemId,state:{stage,attached,facing}});
  }
  const composed=stem?createFruitStemPreview(Three,fruit,stem):fruit;
  const resultState={...fruit.state,...(stem?stem.state:{}),stem:withStem};
  const object=initial.form==='stem'?initial:fruit.object;
  return {...fruit,object,forms:null,slot,paths,shared:[...new Set([...fruit.shared,...(stem?.shared??[])])],state:resultState,stages:stem?8:fruit.stages,scale:composed.scale,mode:composed.mode,
   parts:{fruit:{object:fruit.object,bindings:{...fruit.bindings}},...(stem?{stem:{object:stem.object,bindings:{...stem.bindings}}}:{})},
   build(environment){return composed.build(environment);}
  };
 };
}
