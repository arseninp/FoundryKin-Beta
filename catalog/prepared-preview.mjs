/* Explicit instance lifecycle for resolved previews. Texture loading remains caller-owned. */
import {createModelMaterials} from '../models/materials.mjs';
import {createModelTextures} from '../models/textures.mjs';
import {prepareBannerPlan,composeBannerCanvases} from './banner-preview.mjs';
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function materialRequest(catalog,registry,plan) {
 const sources=plan.parts===undefined?[{model:plan.model,bindings:plan.mode==='sprite'?{sprite:plan.slot}:plan.bindings}]:Object.values(plan.parts).map(part=>{
  const record=catalog.records[part.object.id];
  if(!record)throw new Error('Missing preview part record');
  return {model:record.model,bindings:part.bindings};
 });
 const bindings=Object.create(null),emissiveRoles=[];
 sources.forEach((source,index)=>{
  const descriptor=registry.get(source.model),roles=descriptor.emissiveRoles??[];
  if(!dictionary(source.bindings)||!Object.keys(source.bindings).length||!Array.isArray(roles))throw new Error('Invalid preview material parts');
  for(const role of roles)if(!Object.hasOwn(source.bindings,role))throw new Error('Missing preview emissive binding');
  for(const [role,path] of Object.entries(source.bindings)) {
   if(!/^[a-z][a-z0-9_]*$/.test(role))throw new Error('Invalid preview material role');
   const key='part_'+index+'_'+role;bindings[key]=path;
   if(descriptor.mode==='sprite'||roles.includes(role))emissiveRoles.push(key);
  }
 });
 if(!sources.length)throw new Error('Missing preview material parts');
 return {bindings,descriptor:{mode:'volume',...(emissiveRoles.length?{emissiveRoles}:{})}};
}
function release(root,materials) {
 const geometries=new Set(),errors=[];
 function visit(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])visit(child);}
 try{if(root.parent)root.parent.remove(root);}catch(error){errors.push(error);}
 try{visit(root);}catch(error){errors.push(error);}
 for(const geometry of geometries)try{if(typeof geometry.dispose==='function')geometry.dispose();}catch(error){errors.push(error);}
 try{materials.dispose();}catch(error){errors.push(error);}
 if(errors.length)throw new AggregateError(errors,'Preview instance cleanup failed');
}
export function withPreparedPreview(catalog,registry,Three,resolve) {
 return function(request) {
  const selected=resolve(request),plan=prepareBannerPlan(catalog.records?.[selected.object?.id],selected),build=plan.build.bind(plan);
  const materialPlan=materialRequest(catalog,registry,plan);
  function instantiateResolved(environment,textures) {
   if(!Three||typeof Three.Group!=='function')throw new Error('Prepared preview requires Three.Group');
   if(!dictionary(environment)||!environment.group||typeof environment.group.add!=='function'||typeof environment.group.remove!=='function')throw new Error('Missing prepared preview environment');
   const root=new Three.Group(),materials=createModelMaterials(Three,materialPlan.descriptor,materialPlan.bindings,textures);
   try{build({...environment,group:root,mats:materials.mats});environment.group.add(root);}catch(error){
    try{release(root,materials);}catch(cleanupError){throw new AggregateError([error,cleanupError],'Preview build and cleanup failed');}
    throw error;
   }
   let disposed=false;
   return Object.freeze({group:root,
    update(lookup){if(disposed)throw new Error('Preview instance is disposed');materials.update(lookup);},
    dispose(){if(disposed)return;disposed=true;release(root,materials);}
   });
  }
  const paths=[...new Set(Object.values(materialPlan.bindings))];
  return {...plan,modelResourcePaths:Object.freeze([...paths]),
   instantiate(environment,textures) {
    if(plan.banner)throw new Error('Banner composition requires instantiateCanvases');
    return instantiateResolved(environment,textures);
   },
   instantiateCanvases(environment,canvases) {
    const makeCanvas=environment?.makeCanvas??(()=>{
     if(!globalThis.document||typeof globalThis.document.createElement!=='function')throw new Error('Banner composition requires a canvas factory');
     return globalThis.document.createElement('canvas');
    });
    const upload=lookup=>plan.banner?composeBannerCanvases(plan.banner,lookup,makeCanvas):lookup;
    let batch=createModelTextures(Three,paths,upload(canvases)),instance;
    try{instance=instantiateResolved(environment,batch.textures);}catch(error){
     try{batch.dispose();}catch(cleanupError){throw new AggregateError([error,cleanupError],'Canvas preview creation and cleanup failed');}
     throw error;
    }
    let disposed=false;
    return Object.freeze({group:instance.group,
     update(lookup) {
      if(disposed)throw new Error('Canvas preview is disposed');
      const next=createModelTextures(Three,paths,upload(lookup));
      try{instance.update(next.textures);}catch(error){
       try{next.dispose();}catch(cleanupError){throw new AggregateError([error,cleanupError],'Canvas preview update and cleanup failed');}
       throw error;
      }
      const previous=batch;batch=next;previous.dispose();
     },
     dispose() {
      if(disposed)return;disposed=true;
      const errors=[];
      try{instance.dispose();}catch(error){errors.push(error);}
      try{batch.dispose();}catch(error){errors.push(error);}
      if(errors.length)throw new AggregateError(errors,'Canvas preview cleanup failed');
     }
    });
   }
  };
 };
}
