/* Caller-owned materials for one resolved model. Textures are borrowed, never cloned or disposed. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const ROLE=/^[a-z][a-z0-9_]*$/;
export function createModelMaterials(Three,descriptor,bindings,textures) {
 if(!Three||typeof Three.MeshLambertMaterial!=='function'||typeof Three.MeshBasicMaterial!=='function'||Three.FrontSide===undefined)throw new Error('Model materials require Three');
 if(!dictionary(descriptor)||!['volume','sprite'].includes(descriptor.mode)||!dictionary(bindings)||!Object.keys(bindings).length)throw new Error('Invalid model material input');
 const depthWrite=own(descriptor,'depthWrite')?descriptor.depthWrite:undefined;
 if(own(descriptor,'depthWrite')&&typeof depthWrite!=='boolean')throw new Error('Invalid model depth-write policy');
 const depthWriteRoles=own(descriptor,'depthWriteRoles')?descriptor.depthWriteRoles:{};
 if(!dictionary(depthWriteRoles)||Object.entries(depthWriteRoles).some(([role,value])=>!ROLE.test(role)||!own(bindings,role)||typeof value!=='boolean'))throw new Error('Invalid model role depth-write policy');
 const roles=own(descriptor,'emissiveRoles')?descriptor.emissiveRoles:[];
 if(!Array.isArray(roles)||(own(descriptor,'emissiveRoles')&&!roles.length)||new Set(roles).size!==roles.length||Array.from(roles).some(role=>typeof role!=='string'||!ROLE.test(role)||!own(bindings,role)))throw new Error('Invalid model emissive roles');
 const emissive=new Set(roles),uses=new Map();
 for(const [role,path] of Object.entries(bindings)) {
  if(!ROLE.test(role)||typeof path!=='string'||!path.startsWith('textures/'))throw new Error('Invalid resolved material binding');
  const unlit=descriptor.mode==='sprite'||emissive.has(role),write=own(depthWriteRoles,role)?depthWriteRoles[role]:depthWrite;
  if(uses.has(path)) {
   const previous=uses.get(path);
   if(previous.unlit!==unlit)throw new Error('Resource has conflicting lit and unlit roles: '+path);
   if(previous.depthWrite!==write)throw new Error('Resource has conflicting depth-write roles: '+path);
  }else uses.set(path,{unlit,depthWrite:write});
 }
 const requests=[...uses].map(([path,policy])=>({path,...policy}));
 function selected(lookup) {
  if(!dictionary(lookup))throw new Error('Invalid model texture lookup');
  return requests.map(({path})=>{
   const texture=own(lookup,path)?lookup[path]:null;
   if(!texture||texture.isTexture!==true||typeof texture.userData?.semi!=='boolean')throw new Error('Missing classified model texture: '+path);
   return texture;
  });
 }
 function policy(texture,write) {
  const semi=texture.userData.semi;
  return {map:texture,transparent:semi,alphaTest:semi?0:.05,depthWrite:write??!semi};
 }
 const maps=selected(textures),mats=Object.create(null),owned=[];
 let disposed=false;
 function dispose() {
  if(disposed)return;disposed=true;
  let failed=false,failure;
  for(const material of owned)try{if(typeof material.dispose==='function')material.dispose();}catch(error){if(!failed){failed=true;failure=error;}}
  if(failed)throw failure;
 }
 try {
  for(let i=0;i<requests.length;i++) {
   const {path,unlit,depthWrite:write}=requests[i],Constructor=unlit?Three.MeshBasicMaterial:Three.MeshLambertMaterial;
   const material=new Constructor({...policy(maps[i],write),side:Three.FrontSide,depthTest:true});owned.push(material);
   if(typeof material.dispose!=='function'||(unlit?material.isMeshBasicMaterial:material.isMeshLambertMaterial)!==true)throw new Error('Invalid constructed model material: '+path);
   mats[path]=material;
  }
 } catch(error) {
  try{dispose();}catch(cleanupError){throw new AggregateError([error,cleanupError],'Model material creation and cleanup failed');}
  throw error;
 }
 return Object.freeze({mats:Object.freeze(mats),
  update(lookup) {
   if(disposed)throw new Error('Model materials are disposed');
   const next=selected(lookup);
   for(let i=0;i<requests.length;i++) {
    const material=mats[requests[i].path],values=policy(next[i],requests[i].depthWrite);
    if(Object.entries(values).some(([key,value])=>material[key]!==value)){Object.assign(material,values);material.needsUpdate=true;}
   }
  },
  dispose
 });
}
