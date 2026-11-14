/* One local checkpoint per pack. The shell owns live packs, navigation and notifications. */
const PREFIX='fk070_backup:';
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function packId(id){if(typeof id!=='string'||!id.trim()||id.length>128)throw new Error('Invalid backup pack ID');return id;}
function validatePack(pack){
  if(!object(pack))throw new Error('Invalid backup pack');
  packId(pack.id);
  for(const key of ['name','desc','version','game','author','icon','mod']){
    if(pack[key]!==undefined&&typeof pack[key]!=='string')throw new Error('Invalid backup pack field: '+key);
  }
  if(typeof pack.name!=='string'||!Array.isArray(pack.textures))throw new Error('Missing backup pack data');
  if(pack.keep!==undefined&&typeof pack.keep!=='boolean')throw new Error('Invalid backup pack keep flag');
  const paths=new Set();
  for(const texture of pack.textures){
    if(!object(texture)||typeof texture.path!=='string'||!texture.path||paths.has(texture.path)||typeof texture.data!=='string'||!texture.data.startsWith('data:image/png;base64,'))throw new Error('Invalid backup texture');
    if(texture.obj!==undefined&&typeof texture.obj!=='string')throw new Error('Invalid backup texture owner');
    if(texture.all!==undefined&&(!Array.isArray(texture.all)||texture.all.some(path=>typeof path!=='string')))throw new Error('Invalid backup texture paths');
    paths.add(texture.path);
  }
  return pack;
}
function decode(raw,id){
  const entry=JSON.parse(raw);
  if(!object(entry)||entry.schema!==1||entry.packId!==id||typeof entry.name!=='string'||typeof entry.createdAt!=='string'||!Number.isFinite(Date.parse(entry.createdAt)))throw new Error('Invalid or unsupported pack backup');
  validatePack(entry.pack);
  if(entry.pack.id!==id)throw new Error('Backup pack ID mismatch');
  return entry;
}
export function createPackBackupStore(storage,now=()=>new Date()){
  function key(id){return PREFIX+packId(id);}
  function read(id){const raw=storage.getItem(key(id));return raw===null?null:decode(raw,id);}
  function save(pack,name='',options={}){
    validatePack(pack);
    if(typeof name!=='string')throw new Error('Invalid backup name');
    const id=pack.id,previous=read(id);
    if(previous&&!options.replace)throw new Error('A backup already exists for this pack');
    if(options.replace&&!previous)throw new Error('The backup to replace no longer exists');
    if(options.expectedCreatedAt!==undefined&&(!previous||previous.createdAt!==options.expectedCreatedAt))throw new Error('The backup changed; reopen the backup screen');
    const entry={schema:1,packId:id,name:name.trim(),createdAt:now().toISOString(),pack};
    const raw=JSON.stringify(entry),snapshot=decode(raw,id);
    storage.setItem(key(id),raw);
    return snapshot;
  }
  function remove(id){const k=key(id),exists=storage.getItem(k)!==null;if(exists)storage.removeItem(k);return exists;}
  function restore(id){const entry=read(id);if(!entry)throw new Error('No backup exists for this pack');return entry.pack;}
  return {read,save,remove,restore};
}
