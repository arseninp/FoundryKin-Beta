/* Selection and model resources are independent of the edited PNG. */
import {createCatalogAccess} from './access.mjs';
const own = (value, key) => Object.hasOwn(value, key);
const dictionary = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function azaleaBindings(record) {
 if(record.model!=='azalea')return null;
 const bindings=own(record,'bindings')?record.bindings:{top:record.faces?.up,side:record.faces?.north,plant:record.faces?.east};
 if(!dictionary(bindings)||Object.keys(bindings).length!==3||!['top','side','plant'].every(role=>Array.isArray(bindings[role])&&bindings[role].length===1))throw new Error('Missing or ambiguous azalea parts');
 return bindings;
}
function doorBindings(record) {
 if(record.model!=='door')return null;
 const bindings=own(record,'bindings')?record.bindings:{lower:record.faces?.down,upper:record.faces?.north};
 if(!dictionary(bindings)||Object.keys(bindings).length!==2||!['lower','upper'].every(role=>Array.isArray(bindings[role])&&bindings[role].length===1))throw new Error('Missing or ambiguous door halves');
 return bindings;
}
function pumpkinBindings(record) {
 if(record.model!=='pumpkin')return null;
 const names={pumpkin:'pumpkin_side',carved_pumpkin:'pumpkin_face_off',lit_pumpkin:'pumpkin_face_on'};
 if(!own(names,record.id))throw new Error('Unknown pumpkin variant');
 const found=record.faces.south.filter(path=>path.split('/').pop()===names[record.id]);
 if(found.length!==1)throw new Error('Missing or ambiguous pumpkin resource');
 return {...record.faces,south:found};
}
function candleBindings(record,state) {
 if(record.model!=='candle')return null;
 state.lit??=false;
 if(typeof state.lit!=='boolean')throw new Error('Invalid candle preview state');
 const name=record.id+(state.lit?'_lit':'');
 return Object.fromEntries(Object.entries(record.faces).map(([face,paths])=>{
  const found=paths.filter(path=>path.split('/').pop()===name);
  if(found.length!==1)throw new Error('Missing or ambiguous candle resource: '+name);
  return [face,found];
 }));
}
function segmentedBindings(record) {
 let names;
 if (record.model==='pale_hanging_moss') names={middle:'pale_hanging_moss_middle',tip:'pale_hanging_moss_tip'};
 else if (record.model==='sulfur_spike') {
  names=Object.fromEntries(['down','up'].flatMap(direction=>['base','middle','frustum','tip','tip_merge'].map(part=>[direction+'_'+part,'sulfur_spike_'+direction+'_'+part])));
 } else return null;
 return Object.fromEntries(Object.entries(names).map(([role,name])=>{
  const found=record.paths.filter(path=>path.split('/').pop()===name);
  if(found.length!==1)throw new Error('Missing or ambiguous model resource: '+name);
  return [role,[found[0]]];
 }));
}
export function createPreviewResolver(catalog, registry) {
 const access = createCatalogAccess(catalog);
 if (!registry || typeof registry.get !== 'function' || typeof registry.build !== 'function') throw new Error('Invalid preview registry');
 return function resolve(request) {
  if (!dictionary(request)) throw new Error('Invalid preview request');
  const kind=request.kind??'block', initial=access.describe(request.id,kind);
  if (!initial) throw new Error('Unknown preview object: '+request.id);
  const state=request.state??{}, choices=request.faceChoices??{};
  if (!dictionary(state)||!dictionary(choices)) throw new Error('Invalid preview parameters');
  const route=kind==='block'&&own(catalog.stateRoutes??{},initial.id)?catalog.stateRoutes[initial.id]:null;
  const group=route?catalog.stateGroups[route.card]:null;
  let selected=initial;
  if (group && own(state,group.parameter)) {
   const value=state[group.parameter];
   if (typeof value!=='string'||!own(group.variants,value)) throw new Error('Invalid preview state: '+group.parameter);
   selected=access.describe(group.variants[value],kind);
  }
  const record=kind==='block'?catalog.records[selected.id]:catalog.items[selected.id];
  const available=[...new Set(group?group.paths:record.paths)];
  const slot=request.slot??record.paths[0];
  if (typeof slot!=='string'||!available.includes(slot)) throw new Error('Texture is outside the selected object');
  const view=request.view??(kind==='item'?'sprite':'model');
  if (view!=='model'&&view!=='sprite') throw new Error('Invalid preview view');
  if (kind==='item'&&view==='model'&&(!own(record,'model')||typeof record.model!=='string'||!record.model||!dictionary(record.bindings))) throw new Error('Item model view is not assigned');
  if (kind==='block'&&view==='sprite') {
   const iconPaths=group?Object.values(group.variants).flatMap(id=>catalog.records[id].icons):record.icons;
   if (!Array.isArray(iconPaths)||!iconPaths.includes(slot)) throw new Error('Resource has no declared icon role');
  }
  const model=view==='sprite'?'sprite':record.model, descriptor=registry.get(model);
  const previewState={...selected.state,...state};
  const faceMap={};
  if (view==='model') {
   const bindings=azaleaBindings(record)??doorBindings(record)??pumpkinBindings(record)??candleBindings(record,previewState)??segmentedBindings(record)??(own(record,'bindings')?record.bindings:record.faces);
   if (!dictionary(bindings)||!Object.keys(bindings).length) throw new Error('Missing model bindings');
   for (const face of Object.keys(choices)) if (!own(bindings,face)) throw new Error('Unknown face choice: '+face);
   for (const [face,paths] of Object.entries(bindings)) {
    if (!/^[a-z][a-z0-9_]*$/.test(face)||!Array.isArray(paths)||!paths.length) throw new Error('Invalid model binding: '+face);
    if(paths.some(path=>typeof path!=='string'||!record.paths.includes(path)))throw new Error('Binding resource is outside the selected record: '+face);
    const path=own(choices,face)?choices[face]:paths.length===1?paths[0]:null;
    if (typeof path!=='string'||!paths.includes(path)) throw new Error('Explicit face variant required: '+face);
    faceMap[face]=path;
   }
  }
  if (model==='sulfur_spike') {
   previewState.direction??='down';previewState.merged??=false;
   if (!['down','up'].includes(previewState.direction)||typeof previewState.merged!=='boolean') throw new Error('Invalid sulfur preview state');
  }
  const buildFaces={...faceMap},buildState={...previewState};
  return {object:selected,model,slot,paths:available,faceMap:{...faceMap},bindings:{...faceMap},state:{...previewState},scale:descriptor.scale,mode:descriptor.mode,
   build(environment) {
    if (!dictionary(environment)) throw new Error('Invalid preview environment');
    return registry.build(model,{...environment,cur:selected.id,slot,faceMap:{...buildFaces},bindings:{...buildFaces},state:{...buildState}});
   }
  };
 };
}
