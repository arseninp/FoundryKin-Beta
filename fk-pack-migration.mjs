/* D02 preparation for the remaining legacy migration entry point.
   Pure candidate construction: no storage or live-state mutation. */
export function preparePackMigration(root,catalog){
 if(!catalog||catalog.schema===1)return null;
 if(!Array.isArray(catalog.ids)||!catalog.b||typeof catalog.b!=='object')throw new TypeError('Invalid legacy migration catalog');
 const next=JSON.parse(JSON.stringify(root));
 let map=null,changed=false;
 function pathsOf(id){
  return catalog.sp&&catalog.sp[id]?catalog.sp[id].list.map(item=>item.id):catalog.b[id].filter((path,index,all)=>all.indexOf(path)===index);
 }
 function build(){
  map=Object.create(null);
  for(const id of catalog.ids){
   const paths=pathsOf(id);
   for(const path of paths)if(!map[path])map[path]={id,all:paths};
  }
 }
 for(const pack of next.packs){
  for(const texture of pack.textures){
   if(texture.obj)continue;
   if(!map)build();
   let match=map['textures/'+texture.path];
   if(!match){const base=texture.path.split('/').pop();if(catalog.b[base])match={id:base,all:pathsOf(base)};}
   if(match){texture.obj=match.id;texture.all=match.all;changed=true;}
  }
  const before=pack.textures.length;
  pack.textures=pack.textures.filter(texture=>{
   if(!texture.obj||!texture.all||texture.all.indexOf('textures/'+texture.path)>=0)return true;
   return !pack.textures.some(other=>other!==texture&&other.obj===texture.obj&&other.all&&other.all.indexOf('textures/'+other.path)>=0&&other.data===texture.data);
  });
  if(pack.textures.length!==before)changed=true;
 }
 return changed?next:null;
}
