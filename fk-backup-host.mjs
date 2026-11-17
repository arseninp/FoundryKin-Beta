/* Adapt backup storage to the shell's single saved record; never write during setup. */
import {createPackBackupStore} from './fk-backup-store.mjs?v=0.9.16';
import {createPackBackupUI} from './fk-backups.mjs?v=0.9.16-d02-restore';
export function createPackBackupHost(options){
 let staged=null,deleting=false;
 function root(){return staged||options.getData();}
 function entries(){
  const value=root().backupEntries;
  if(value===undefined)return {};
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid saved backup entries');
  return value;
 }
 function commit(next,writeOptions){if(staged){staged=next;return;}return options.commitData(next,writeOptions);}
 const storage={
  getItem(key){const map=entries();return Object.hasOwn(map,key)?map[key]:null;},
  setItem(key,value,writeOptions){return commit({...root(),backupEntries:{...entries(),[key]:value}},writeOptions);},
  removeItem(key,writeOptions){const map={...entries()};delete map[key];return commit({...root(),backupEntries:map},writeOptions);}
 };
 const store=createPackBackupStore(storage);
 const ui=createPackBackupUI({...options,store,restoreCompletion:'ui',commitRestore(snapshot,previous,writeOptions={}){
  const current=options.getData(),index=current.packs.indexOf(previous);
  if(index<0||snapshot.id!==previous.id||!options.isCurrent(previous.id,'create'))throw new Error('Pack changed before restore');
  const packs=current.packs.slice();packs[index]=snapshot;
  function accepted(result){
   if(result===false)throw new Error('Pack restore was not saved');
   if(!writeOptions.deferAfterRestore)options.afterRestore();
   return true;
  }
  const result=options.commitData({...current,packs},{signal:writeOptions.signal});
  return result&&typeof result.then==='function'?Promise.resolve(result).then(accepted):accepted(result);
 }});
 function deletePack(id,writeOptions={}){
  const current=options.getData();
  if(!current.packs.some(pack=>pack.id===id))return false;
  if(staged||deleting)throw new Error('Backup operation already in progress');
  staged={...current,active:current.active===id?null:current.active,packs:current.packs.filter(pack=>pack.id!==id)};
  let next;
  try{store.remove(id,writeOptions);next=staged;}
  finally{staged=null;}
  deleting=true;
  function accepted(result){deleting=false;if(result===false)throw new Error('Pack deletion was not saved');return true;}
  function rejected(error){deleting=false;throw error;}
  try{
   const result=options.commitData(next,writeOptions);
   return result&&typeof result.then==='function'?Promise.resolve(result).then(accepted,rejected):accepted(result);
  }catch(error){return rejected(error);}
 }
 return {ui,deletePack};
}
