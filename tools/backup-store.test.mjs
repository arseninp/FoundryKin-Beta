/* Mock storage only; not native quota, image decode or browser acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createPackBackupStore} from '../fk-backup-store.mjs';
const KEY='fk070_backup:p',DATE='2026-11-17T00:00:00.000Z';
const pack=()=>({id:'p',name:'Pack',textures:[{path:'blocks/stone',data:'data:image/png;base64,AA=='}]});
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};}
function fixture(){
 const map=new Map(),state={mode:'sync',calls:0,error:null,refuse:false,gate:deferred(),signal:null};
 function write(action,options){
  state.calls++;state.signal=options?.signal;
  if(state.error)throw state.error;
  if(state.refuse)return false;
  if(state.mode==='async')return state.gate.promise.then(result=>{if(options?.signal?.aborted)throw options.signal.reason;if(result===false)return false;action();return result;});
  action();
 }
 const storage={getItem:key=>map.get(key)??null,setItem:(key,value,options)=>write(()=>map.set(key,value),options),removeItem:(key,options)=>write(()=>map.delete(key),options)};
 return {map,state,store:createPackBackupStore(storage,()=>new Date(DATE))};
}
test('synchronous save/read/restore/remove retain their values and backup format',()=>{
 const {store,map}=fixture(),entry=store.save(pack(),' name '),expected={schema:1,packId:'p',name:'name',createdAt:DATE,pack:pack()};
 assert.equal(entry instanceof Promise,false);assert.deepEqual(entry,expected);assert.deepEqual(JSON.parse(map.get(KEY)),expected);
 assert.deepEqual(store.read('p'),expected);const restored=store.restore('p');assert.deepEqual(restored,expected.pack);
 restored.name='local';assert.equal(store.read('p').pack.name,'Pack');
 assert.equal(store.remove('p'),true);assert.equal(store.remove('p'),false);assert.equal(map.size,0);assert.throws(()=>store.restore('p'),/No backup/);
});
test('async save acknowledges only after writing the captured bytes',async()=>{
 const {store,map,state}=fixture();state.mode='async';const input=pack(),pending=store.save(input);let done=false;pending.then(()=>done=true);
 input.name='later';await Promise.resolve();assert.equal(done,false);assert.equal(map.size,0);
 state.gate.resolve();const saved=await pending;assert.equal(saved.pack.name,'Pack');assert.equal(store.read('p').pack.name,'Pack');assert.equal(done,true);
});
test('async removal waits; a missing entry still returns synchronous false',async()=>{
 const {store,map,state}=fixture();store.save(pack());state.mode='async';const pending=store.remove('p');assert.equal(map.size,1);
 state.gate.resolve();assert.equal(await pending,true);assert.equal(map.size,0);const calls=state.calls;assert.equal(store.remove('p'),false);assert.equal(state.calls,calls);
});
test('quota refusal preserves the checkpoint and permits retry',()=>{
 const {store,map,state}=fixture(),saved=store.save(pack()),before=map.get(KEY);state.error=Object.assign(new Error('full'),{name:'QuotaExceededError'});
 assert.throws(()=>store.remove('p'),{name:'QuotaExceededError'});
 assert.throws(()=>store.save({...pack(),name:'Changed'},'',{replace:true,expectedCreatedAt:saved.createdAt}),{name:'QuotaExceededError'});
 assert.equal(map.get(KEY),before);state.error=null;assert.equal(store.remove('p'),true);
});
test('rejected or explicitly refused async writes cannot report success',async()=>{
 for(const remove of [false,true])for(const rejected of [false,true]){
  const {store,map,state}=fixture();if(remove)store.save(pack());const before=map.get(KEY);state.mode='async';
  const pending=remove?store.remove('p'):store.save(pack());if(rejected)state.gate.reject(new Error('denied'));else state.gate.resolve(false);
  await assert.rejects(pending);assert.equal(map.get(KEY),before);
 }
});
test('explicit synchronous refusal is not a successful save or deletion',()=>{
 const {store,map,state}=fixture();state.refuse=true;assert.throws(()=>store.save(pack()),/refused/);assert.equal(map.size,0);
 state.refuse=false;store.save(pack());const before=map.get(KEY);state.refuse=true;assert.throws(()=>store.remove('p'),/refused/);assert.equal(map.get(KEY),before);
});
test('already cancelled calls do not reach the write adapter',()=>{
 const {store,state}=fixture(),controller=new AbortController();controller.abort();
 assert.throws(()=>store.save(pack(),'',{signal:controller.signal}),{name:'AbortError'});
 assert.throws(()=>store.remove('p',{signal:controller.signal}),{name:'AbortError'});assert.equal(state.calls,0);
});
test('queued writes forward cancellation to a cancellation-aware adapter',async()=>{
 for(const remove of [false,true]){
  const {store,map,state}=fixture();if(remove)store.save(pack());const before=map.get(KEY),controller=new AbortController();state.mode='async';
  const pending=remove?store.remove('p',{signal:controller.signal}):store.save(pack(),'',{signal:controller.signal});
  assert.equal(state.signal,controller.signal);controller.abort();state.gate.resolve();await assert.rejects(pending,{name:'AbortError'});assert.equal(map.get(KEY),before);
 }
});
test('one-slot, replacement and timestamp guards run before writing',()=>{
 const {store,state}=fixture(),saved=store.save(pack());
 assert.throws(()=>store.save(pack()),/already exists/);assert.throws(()=>store.save(pack(),'',{replace:true,expectedCreatedAt:'wrong'}),/changed/);assert.equal(state.calls,1);
 const changed=store.save({...pack(),name:'Changed'},'',{replace:true,expectedCreatedAt:saved.createdAt});assert.equal(changed.pack.name,'Changed');assert.equal(state.calls,2);
 const fresh=fixture();assert.throws(()=>fresh.store.save(pack(),'',{replace:true}),/no longer exists/);assert.equal(fresh.state.calls,0);
});
test('invalid pack data fails before any write',()=>{
 const invalid=[{...pack(),id:''},{...pack(),id:1},{...pack(),id:'x'.repeat(129)},{...pack(),name:1},{...pack(),textures:null},{...pack(),textures:[pack().textures[0],pack().textures[0]]},{...pack(),textures:[{path:'x',data:'not PNG'}]},{...pack(),keep:'yes'},{...pack(),textures:[{...pack().textures[0],obj:1}]},{...pack(),textures:[{...pack().textures[0],all:[null]}]}];
 for(const value of invalid){const {store,state}=fixture();assert.throws(()=>store.save(value));assert.equal(state.calls,0);}
});
test('damaged or mismatched backups are preserved until explicitly deleted',()=>{
 const valid={schema:1,packId:'p',name:'',createdAt:DATE,pack:pack()};
 const values=['{bad',JSON.stringify({...valid,schema:2}),JSON.stringify({...valid,packId:'other'}),JSON.stringify({...valid,createdAt:'bad'}),JSON.stringify({...valid,pack:{...pack(),id:'other'}})];
 for(const raw of values){const {store,map}=fixture();map.set(KEY,raw);assert.throws(()=>store.read('p'));assert.throws(()=>store.restore('p'));assert.equal(map.get(KEY),raw);assert.equal(store.remove('p'),true);}
});
