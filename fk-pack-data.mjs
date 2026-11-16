/* Validate and normalize the shell's saved record without writing storage. */
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function invalid(){throw new Error('Invalid saved pack data');}
export function normalizePackData(value){
 if(!object(value)||!Array.isArray(value.packs)||(value.active!=null&&typeof value.active!=='string'))invalid();
 if(value.backupEntries!==undefined&&(!object(value.backupEntries)||Object.values(value.backupEntries).some(entry=>typeof entry!=='string')))invalid();
 for(const pack of value.packs){
  if(!object(pack)||typeof pack.id!=='string'||typeof pack.name!=='string')invalid();
  for(const key of ['author','game','icon','desc','version','mod'])if(pack[key]!=null&&typeof pack[key]!=='string')invalid();
  if(pack.keep!==undefined&&typeof pack.keep!=='boolean')invalid();
  if(pack.textures===undefined)pack.textures=[];
  if(!Array.isArray(pack.textures))invalid();
  for(const texture of pack.textures){
   if(!object(texture)||typeof texture.path!=='string'||typeof texture.data!=='string')invalid();
   if(texture.obj!=null&&typeof texture.obj!=='string')invalid();
   if(texture.all!=null&&(!Array.isArray(texture.all)||texture.all.some(path=>typeof path!=='string')))invalid();
  }
  delete pack.fresh;
  pack.author=pack.author||'';pack.game=pack.game||'1.21.0';pack.icon=pack.icon||'';
  pack.desc=pack.desc||'';pack.version=pack.version||'1.0.0';
 }
 return value;
}
