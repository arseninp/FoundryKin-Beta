
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createPackWriter} from '../fk-pack-writer.mjs';
import {createPackCommitter} from '../fk-pack-commits.mjs';
const KEY='fk070_packs',SKEY='fk070_settings';
const original=readFileSync(new URL('../fk-app.js',import.meta.url),'utf8');
const at=original.lastIndexOf('})();');
const source=(original.slice(0,at)+'window.__shell={commitData,save,go,migrate,getData:()=>data,ready:()=>packsReady,unreadable:()=>unreadable,busy:()=>!!packCommitter&&packCommitter.busy()};'+original.slice(at)).replace(/\bimport\(/g,'__load(');
const clone=x=>JSON.parse(JSON.stringify(x));
async function flush(){for(let i=0;i<30;i++)await Promise.resolve()}
function shared(){const map=new Map([[KEY,JSON.stringify({active:'p',packs:[{id:'p',name:'P',textures:[]},{id:'q',name:'Q',textures:[]}]})]]);const s={map,writes:0,fail:false,hold:false,queue:[]};s.storage={getItem:k=>map.has(k)?map.get(k):null,setItem(k,v){if(k===KEY&&s.fail)throw Object.assign(Error('quota'),{name:'QuotaExceededError'});map.set(k,v);if(k===KEY)s.writes++}};s.locks={request(name,options,action){assert.equal(name,KEY+':write');if(!s.hold)return Promise.resolve().then(action);return new Promise((ok,no)=>s.queue.push(()=>{try{ok(action())}catch(e){no(e)}}))}};s.release=()=>{s.hold=false;for(const action of s.queue.splice(0))action()};return s}
async function fixture(s=shared(),config={}){
 const nodes=new Map(),events={},captured={};
 function node(id){if(!nodes.has(id))nodes.set(id,{id,style:{},dataset:{},value:'',textContent:'',innerHTML:'',classList:{toggle(){}},setAttribute(){},addEventListener(){},querySelectorAll:()=>[]});return nodes.get(id)}
 const document={currentScript:{src:'https://example.test/fk-app.js?v=0.9.34'},body:node('body'),documentElement:node('html'),hidden:false,querySelector:selector=>node(selector.startsWith('#')?selector.slice(1):selector),querySelectorAll:()=>[]};
 let mode='search',callbacks={};const FKE={getMode:()=>mode,dirtyNow:()=>false,busy:()=>false,pendingEdit:()=>false,cancelPendingEdit(){},reset(){},closeMenu:()=>false,objInfo:()=>({id:'stone',paths:[]}),current:()=> 'stone',open(f,url,c){callbacks=c;mode='search';c.onMode?.('search')},setMode(m){mode=m;callbacks.onMode?.(m)}};
 function control(){return {fill(){},leave(){},render(){},renderCards(){},renderScreen(){},busy:()=>false,dirty:()=>false,title:()=> 'Backup'}}
 const modules={
  './fk-pack-list.mjs':{mountPackList(el,o){captured.list=o;return control()}},
  './fk-pack-textures.mjs':{mountPackTextures(el,o){captured.textures=o;return control()}},
  './fk-pack-form.mjs':{mountPackForm(doc,o){captured.form=o;return control()}},
  './fk-pack-import.mjs':{createPackImport(o){captured.import=o;return control()}},
  './fk-pack-clear.mjs':{createPackClear(o){captured.clear=o;return control()}},
  './fk-editor-save.mjs':{createEditorSave(o){captured.editor=o;return control()}},
  './fk-backup-host.mjs':{createPackBackupHost(o){captured.backup=o;return {ui:control()}}},
  './fk-pack-writer.mjs':{createPackWriter},'./fk-pack-commits.mjs':{createPackCommitter},
  './fk-pack-migration.mjs':{preparePackMigration:root=>({...root,packs:root.packs.map(p=>({...p,name:'M'}))})}
 };
 const FK={t:key=>key,lang:()=> 'en',apply(){},setting:()=> 'auto',refresh(){}};
 const context={document,FK,FKE,navigator:{locks:config.noLocks?undefined:s.locks},localStorage:s.storage,AbortController,URL,Blob,matchMedia:()=>({matches:false}),setTimeout:()=>1,clearTimeout(){},confirm:()=>true,__load(name){if(config.failModule&&name.includes('fk-pack-writer'))return Promise.reject(Error('module unavailable'));return Promise.resolve(modules[name.split('?')[0]]||{})}};
 context.window=context;context.FK_V='0.9.20';context.addEventListener=(name,fn)=>events[name]=fn;
 vm.createContext(context);new vm.Script(source,{filename:'fk-app.js'}).runInContext(context);await flush();
 assert.equal(document.body.inert,false);
 return {s,api:context.__shell,captured,nodes,node,events,FKE};
}
const rename=(f,name)=>({...f.api.getData(),packs:f.api.getData().packs.map(p=>({...p,name}))});
test('full shell startup reads normalized mutable data without storage writes',async()=>{const s=shared(),raw=s.map.get(KEY),f=await fixture(s);assert.equal(f.api.ready(),true);assert.equal(f.api.getData().packs[0].version,'1.0.0');f.api.getData().packs[0].name='draft';assert.equal(s.map.get(KEY),raw);assert.equal(s.writes,0)});
test('full shell waits for lock and publishes a detached normalized result',async()=>{const f=await fixture(),before=f.api.getData(),next=rename(f,'saved');f.s.hold=true;const p=f.api.commitData(next);assert.equal(f.api.getData(),before);next.packs[0].name='later';await flush();f.s.release();assert.equal(await p,true);assert.equal(f.api.getData().packs[0].name,'saved');assert.equal(f.s.writes,1)});
test('full shell rejects same-tab simultaneous writes',async()=>{const f=await fixture();f.s.hold=true;const p=f.api.commitData(rename(f,'A'));await assert.rejects(f.api.commitData(rename(f,'B')),{code:'PACK_WRITE_BUSY'});f.s.release();await p;assert.equal(f.s.writes,1)});
test('quota failure preserves live data and supports retry',async()=>{const f=await fixture(),before=f.api.getData(),next=rename(f,'retry');f.s.fail=true;await assert.rejects(f.api.commitData(next),{name:'QuotaExceededError'});assert.equal(f.api.getData(),before);assert.equal(f.s.writes,0);f.s.fail=false;await f.api.commitData(next);assert.equal(f.api.getData().packs[0].name,'retry')});
test('two full shell contexts retain foreign write and local candidate on conflict',async()=>{const s=shared(),a=await fixture(s),b=await fixture(s),draft=rename(b,'local');await a.api.commitData({...a.api.getData(),backupEntries:{p:'foreign'}});const raw=s.map.get(KEY);await assert.rejects(b.api.commitData(draft),{code:'PACK_WRITE_CONFLICT'});assert.equal(s.map.get(KEY),raw);assert.equal(draft.packs[0].name,'local');assert.equal(b.api.getData().packs[0].name,'P')});
test('abort before queued lock prevents storage and live changes',async()=>{const f=await fixture(),before=f.api.getData(),c=new AbortController();f.s.hold=true;const p=f.api.commitData(rename(f,'no'),{signal:c.signal});c.abort();f.s.release();await assert.rejects(p,{name:'AbortError'});assert.equal(f.api.getData(),before);assert.equal(f.s.writes,0)});
test('damaged initial storage is not repaired and writes remain blocked',async()=>{const s=shared();s.map.set(KEY,'{bad');const f=await fixture(s);assert.equal(f.api.unreadable()[KEY],true);assert.throws(()=>f.api.commitData({active:null,packs:[]}));assert.equal(s.map.get(KEY),'{bad');assert.equal(s.writes,0)});
test('missing Web Locks permits startup but refuses pack writes',async()=>{const f=await fixture(shared(),{noLocks:true});assert.equal(f.api.ready(),true);await assert.rejects(f.api.commitData(rename(f,'no')),{code:'PACK_LOCKS_UNAVAILABLE'});assert.equal(f.s.writes,0)});
test('settings stay independent and generic KEY save is blocked',async()=>{const f=await fixture(),raw=f.s.map.get(KEY);assert.equal(f.api.save(SKEY,{theme:'dark'}),true);assert.equal(f.api.save(KEY,{packs:[]}),false);assert.equal(f.s.map.get(KEY),raw);assert.equal(f.s.writes,0)});
test('actual form callback rolls back staging before writer acknowledgement',async()=>{const f=await fixture(),live=f.api.getData(),candidate=clone(live);candidate.packs[0].name='Draft';live.packs[0].name='staged';f.s.hold=true;const p=f.captured.form.save({candidate,signal:new AbortController().signal,rollback(){live.packs[0].name='P'}});assert.equal(f.api.getData().packs[0].name,'P');f.s.release();assert.equal(await p,true);assert.equal(f.api.getData().packs[0].name,'Draft')});
test('pack selection is persisted before live active ID changes',async()=>{const f=await fixture();f.s.hold=true;const p=f.captured.list.select('q',{signal:new AbortController().signal});assert.equal(f.api.getData().active,'p');f.s.release();await p;assert.equal(f.api.getData().active,'q');assert.equal(JSON.parse(f.s.map.get(KEY)).active,'q')});
test('texture callback accepts async commit and refreshes header after completion',async()=>{const f=await fixture();f.api.go('pack');const next=clone(f.api.getData());next.packs[0].textures=[{path:'a',data:'PNG'}];await f.captured.textures.commitData(next,{signal:new AbortController().signal});assert.equal(f.api.getData().packs[0].textures.length,1)});
test('import, editor, backup and clear receive the central asynchronous callback',async()=>{for(const name of ['import','editor','backup','clear']){const f=await fixture(),next=name==='clear'?{active:null,packs:[]}:{...f.api.getData(),backupEntries:{p:name}};f.s.hold=true;const p=f.captured[name].commitData(next,{signal:new AbortController().signal});assert.equal(f.s.writes,0);f.s.release();assert.equal(await p,true);assert.equal(f.s.writes,1)}});
test('beforeunload includes pending central writes',async()=>{const f=await fixture();f.s.hold=true;const p=f.api.commitData(rename(f,'pending'));let prevented=false;f.events.beforeunload({preventDefault(){prevented=true}});assert.equal(prevented,true);f.s.release();await p;prevented=false;f.events.beforeunload({preventDefault(){prevented=true}});assert.equal(prevented,false)});
test('startup module failure unlocks UI but never enables pack writes',async()=>{const f=await fixture(shared(),{failModule:true});assert.equal(f.api.ready(),false);assert.equal(f.api.unreadable()[KEY],true);assert.throws(()=>f.api.commitData({packs:[]}));assert.equal(f.s.writes,0)});
test('actual shell navigation cancels migration before queued write',async()=>{const f=await fixture();f.api.go('add');f.s.hold=true;const p=f.api.migrate({catalog:{ids:['x'],b:{}}},{signal:new AbortController().signal});await flush();assert.equal(f.s.queue.length,1);f.api.go('home');f.s.release();assert.equal(await p,false);assert.equal(f.s.writes,0)});
