/* Adapt backup storage to the shell's single saved record; never write during setup. */
import {createPackBackupStore} from './fk-backup-store.mjs?v=0.9.16';
import {createPackBackupUI} from './fk-backups.mjs?v=0.9.16';
export function createPackBackupHost(options){
 let staged=null;
 function root(){return staged||options.getData();}
 function entries(){
  const value=root().backupEntries;
  if(value===undefined)return {};
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid saved backup entries');
  return value;
 }
 function commit(next){if(staged)staged=next;else options.commitData(next);}
 const storage={
  getItem(key){const map=entries();return Object.hasOwn(map,key)?map[key]:null;},
  setItem(key,value){commit({...root(),backupEntries:{...entries(),[key]:value}});},
  removeItem(key){const map={...entries()};delete map[key];commit({...root(),backupEntries:map});}
 };
 const store=createPackBackupStore(storage);
 const ui=createPackBackupUI({...options,store,commitRestore(snapshot,previous){
  const current=options.getData(),index=current.packs.indexOf(previous);
  if(index<0||snapshot.id!==previous.id||!options.isCurrent(previous.id,'create'))throw new Error('Pack changed before restore');
  const packs=current.packs.slice();packs[index]=snapshot;
  options.commitData({...current,packs});
  options.afterRestore();return true;
 }});
 function deletePack(id){
  const current=options.getData();
  if(!current.packs.some(pack=>pack.id===id))return false;
  if(staged)throw new Error('Backup operation already in progress');
  staged={...current,active:current.active===id?null:current.active,packs:current.packs.filter(pack=>pack.id!==id)};
  try{
   store.remove(id);
   const next=staged;staged=null;options.commitData(next);return true;
  }finally{staged=null;}
 }
 return {ui,deletePack};
}
