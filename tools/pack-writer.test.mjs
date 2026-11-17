import test from 'node:test';
import assert from 'node:assert/strict';
import {createPackWriter} from '../fk-pack-writer.mjs';
function setup(){
 const state={raw:JSON.stringify({active:'p',packs:[{id:'p',name:'base',textures:[]}]}),writes:0,fail:false};
 const storage={getItem:()=>state.raw,setItem(key,raw){if(state.fail)throw Object.assign(new Error('full'),{name:'QuotaExceededError'});state.raw=raw;state.writes++;}};
 let tail=Promise.resolve();
 const locks={request(name,options,action){
  assert.equal(name,'fk070_packs:write');assert.equal(options.mode,'exclusive');
  const task=tail.then(()=>action({name,mode:'exclusive'}));tail=task.catch(()=>{});return task;
 }};
 return {state,storage,locks,a:createPackWriter({storage,locks}),b:createPackWriter({storage,locks})};
}
const rename=(base,name)=>({...base.value,packs:[{...base.value.packs[0],name}]});
test('read normalizes and freezes snapshots without writing',()=>{
 const {state,a}=setup(),raw=state.raw,base=a.read();
 assert.equal(base.value.packs[0].version,'1.0.0');assert.equal(state.raw,raw);assert.equal(state.writes,0);
 assert.throws(()=>base.value.packs.push({}),TypeError);
});
test('competing old snapshots cannot both save, across or within writers',async()=>{
 for(const same of [false,true]){
  const {state,a,b}=setup(),other=same?a:b,sa=a.read(),sb=other.read();
  const results=await Promise.allSettled([a.write(sa,rename(sa,'A')),other.write(sb,rename(sb,'B'))]);
  assert.deepEqual(results.map(result=>result.status),['fulfilled','rejected']);
  assert.equal(results[1].reason.code,'PACK_WRITE_CONFLICT');assert.equal(state.writes,1);
  assert.equal(JSON.parse(state.raw).packs[0].name,'A');
 }
});
test('candidate is copied and a successful snapshot supports the next save',async()=>{
 const {state,a}=setup(),base=a.read(),candidate=rename(base,'first'),pending=a.write(base,candidate);
 candidate.packs[0].name='later';const saved=await pending;
 assert.equal(saved.value.packs[0].name,'first');assert.equal(base.value.packs[0].name,'base');
 await a.write(saved,rename(saved,'second'));assert.equal(JSON.parse(state.raw).packs[0].name,'second');
});
test('quota refusal preserves storage and permits retry with the original snapshot',async()=>{
 const {state,a}=setup(),base=a.read(),raw=state.raw,candidate=rename(base,'retry');state.fail=true;
 await assert.rejects(a.write(base,candidate),{name:'QuotaExceededError'});assert.equal(state.raw,raw);assert.equal(state.writes,0);
 state.fail=false;await a.write(base,candidate);assert.equal(JSON.parse(state.raw).packs[0].name,'retry');
});
test('external clearing or damage is not overwritten; invalid initial data is not repaired',async()=>{
 for(const raw of [null,'{bad','null','{"packs":[null]}']){
  const {state,a}=setup(),base=a.read();state.raw=raw;
  await assert.rejects(a.write(base,rename(base,'old')),{code:'PACK_WRITE_CONFLICT'});
  assert.equal(state.raw,raw);assert.equal(state.writes,0);
  if(raw!==null)assert.throws(()=>a.read());
 }
});
test('foreign snapshots, invalid data, unavailable or failed locks never write',async()=>{
 const {state,storage,locks,a,b}=setup(),base=a.read();
 await assert.rejects(b.write(base,rename(base,'bad')),{code:'PACK_SNAPSHOT_INVALID'});
 await assert.rejects(a.write(base,{packs:[null]}));
 for(const lockManager of [undefined,{request(){throw new Error('denied');}}]){
  const writer=createPackWriter({storage,locks:lockManager}),snapshot=writer.read();
  await assert.rejects(writer.write(snapshot,rename(snapshot,'bad')));
 }
 assert.equal(state.writes,0);
});
test('already aborted and queued writes are cancelled without writing',async()=>{
 const {state,a}=setup(),base=a.read(),controller=new AbortController();
 const pending=a.write(base,rename(base,'cancelled'),{signal:controller.signal});controller.abort();
 await assert.rejects(pending,{name:'AbortError'});
 await assert.rejects(a.write(base,rename(base,'cancelled'),{signal:controller.signal}),{name:'AbortError'});
 assert.equal(state.writes,0);
});
test('old pack metadata cannot erase a new backup or discard the local candidate',async()=>{
 const {state,a,b}=setup(),sa=a.read(),sb=b.read(),candidate=rename(sb,'draft');
 await a.write(sa,{...sa.value,backupEntries:{'fk070_backup:p':'checkpoint'}});
 await assert.rejects(b.write(sb,candidate),{code:'PACK_WRITE_CONFLICT'});
 assert.equal(JSON.parse(state.raw).backupEntries['fk070_backup:p'],'checkpoint');
 assert.equal(candidate.packs[0].name,'draft');assert.equal(sb.value.packs[0].name,'base');
});
