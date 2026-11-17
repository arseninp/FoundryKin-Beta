/* Controller regressions with fake DOM/FileReader; not browser/storage acceptance. */
import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mountPackForm} from '../fk-pack-form.mjs';
class Reader {
 static all=[];
 constructor(){this.readyState=0;Reader.all.push(this);}
 readAsDataURL(file){if(file.fail)throw new Error('read');this.readyState=1;}
 abort(){this.readyState=2;this.onabort?.();}
 load(value){this.readyState=2;this.result=value;this.onload?.();}
}
const globals=new Map(['FileReader','confirm'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
before(()=>{globalThis.FileReader=Reader;globalThis.confirm=()=>true;});
after(()=>{for(const [key,descriptor] of globals)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];});
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};}
const clone=value=>JSON.parse(JSON.stringify(value));
function fixture(save=()=>true,fresh=false){
 const ids='s-edit eSave eName eAuthor eDesc eVer eGame eIco eJson eIcoF eIcoX'.split(' '),nodes={};
 for(const id of ids)nodes[id]={value:'',src:'',files:[],events:{},addEventListener(name,fn){this.events[name]=fn;}};
 const state={data:{active:'p',packs:[{id:'p',name:'before',author:'',desc:'',version:'1.0.0',game:'1.21.0',icon:'old',textures:[]}]},fresh,current:true,dirty:false,calls:0,saved:0,messages:[]};
 const document={querySelector:selector=>nodes[selector.slice(1)],querySelectorAll:()=>['eName','eAuthor','eDesc','eVer','eGame'].map(id=>nodes[id])};
 const active=()=>state.data.packs.find(pack=>pack.id===state.data.active);
 const controller=mountPackForm(document,{getData:()=>state.data,active,isNew:()=>state.fresh,saved(){state.saved++;state.fresh=false;},setDirty:value=>state.dirty=value,current:()=>state.current,save(options){state.calls++;state.signal=options.signal;return save(state,options);},uuid:()=> 'new',manifest:pack=>({name:pack.name}),icon:'fallback',say:(key,detail)=>state.messages.push({key,detail}),t:key=>key});
 controller.fill();
 const put=name=>{nodes.eName.value=name;nodes.eName.events.input();};
 return {state,nodes,controller,put,click:()=>nodes.eSave.onclick()};
}
test('synchronous true/false/throw remain compatible for existing and new packs',()=>{
 for(const fresh of [false,true])for(const result of [true,false,new Error('quota')]){
  const f=fixture(()=>{if(result instanceof Error)throw result;return result;},fresh),before=clone(f.state.data);f.put('Draft');f.click();
  assert.equal(f.controller.busy(),false);assert.equal(f.nodes['s-edit'].inert,false);
  if(result===true){assert.equal(f.state.saved,1);assert.equal(f.state.dirty,false);assert.equal(f.state.messages.at(-1).key,'msg.saved');}
  else{assert.deepEqual(f.state.data,before);assert.equal(f.state.saved,0);assert.equal(f.state.fresh,fresh);assert.equal(f.state.dirty,true);assert.equal(f.nodes.eName.value,'Draft');}
 }
});
test('pending save cannot report success or run twice',async()=>{
 for(const fresh of [false,true]){
  const d=deferred(),f=fixture(()=>d.promise,fresh);f.put('Draft');const pending=f.click();f.click();
  assert.equal(f.state.calls,1);assert.equal(f.state.saved,0);assert.equal(f.controller.busy(),true);assert.equal(f.nodes.eSave.disabled,true);assert.equal(f.nodes['s-edit'].inert,true);
  d.resolve(true);await pending;assert.equal(f.state.saved,1);assert.equal(f.state.dirty,false);assert.equal(f.controller.busy(),false);assert.equal(f.nodes['s-edit'].inert,false);
 }
});
test('async false or rejection keeps both kinds of draft and rolls back live mutations',async()=>{
 for(const fresh of [false,true])for(const rejected of [false,true]){
  const d=deferred(),f=fixture(()=>d.promise,fresh),before=clone(f.state.data);f.put('Draft');const pending=f.click();
  if(rejected)d.reject(new Error('conflict'));else d.resolve(false);await pending;
  assert.deepEqual(f.state.data,before);assert.equal(f.nodes.eName.value,'Draft');assert.equal(f.state.dirty,true);assert.equal(f.state.saved,0);assert.equal(f.state.fresh,fresh);assert.equal(f.controller.busy(),false);
  assert.ok(f.state.messages.every(message=>message.key!=='msg.saved'));if(rejected)assert.equal(f.state.messages.at(-1).detail.detail,'conflict');
 }
});
test('leaving removes only the staged pack and ignores late completion',async()=>{
 for(const ok of [false,true]){
  const d=deferred(),f=fixture(()=>d.promise,true);f.put('Draft');const pending=f.click(),signal=f.state.signal;
  f.state.data.packs.push({...clone(f.state.data.packs[0]),id:'q',name:'Other'});f.controller.leave();
  assert.equal(signal.aborted,true);assert.deepEqual(f.state.data.packs.map(pack=>pack.id),['p','q']);
  f.state.data.active='q';f.state.fresh=false;f.controller.fill();f.put('Other draft');
  d.resolve(ok);await pending;assert.equal(f.nodes.eName.value,'Other draft');assert.equal(f.state.data.active,'q');assert.equal(f.state.saved,0);assert.equal(f.state.dirty,true);
 }
});
test('old settlement cannot unlock or roll back a newer pending save',async()=>{
 const a=deferred(),b=deferred(),f=fixture(state=>state.calls===1?a.promise:b.promise);
 f.put('A');const first=f.click();f.controller.leave();f.controller.fill();f.put('B');const second=f.click();
 a.reject(new Error('old'));await first;assert.equal(f.controller.busy(),true);assert.equal(f.nodes['s-edit'].inert,true);assert.equal(f.state.data.packs[0].name,'B');
 b.resolve(true);await second;assert.equal(f.state.saved,1);assert.equal(f.nodes.eName.value,'B');
});
test('rollback does not overwrite a replacement root or unrelated later changes',async()=>{
 for(const replace of [false,true]){
  const d=deferred(),f=fixture(()=>d.promise);f.put('Draft');const pending=f.click();
  if(replace)f.state.data=clone(f.state.data);
  f.state.data.packs[0].name='External';d.reject(new Error('no'));await pending;
  assert.equal(f.state.data.packs[0].name,'External');assert.equal(f.nodes.eName.value,'Draft');assert.equal(f.state.dirty,true);
 }
});
test('icon requests retain stale guards and block save until reading finishes',async()=>{
 Reader.all=[];const d=deferred(),f=fixture(()=>d.promise);
 function choose(file={}){f.nodes.eIcoF.files=[file];f.nodes.eIcoF.onchange.call(f.nodes.eIcoF);return Reader.all.at(-1);}
 const a=choose();assert.equal(f.nodes.eSave.disabled,true);f.click();assert.equal(f.state.calls,0);
 const b=choose();a.load('stale');assert.equal(f.nodes.eIco.src,'old');assert.equal(f.nodes.eSave.disabled,true);f.click();assert.equal(f.state.calls,0);
 b.load('new-icon');assert.equal(f.nodes.eSave.disabled,false);
 f.put('Draft');const pending=f.click();f.nodes.eIcoX.onclick();assert.equal(f.nodes.eIco.src,'new-icon');d.resolve(false);await pending;
 assert.equal(f.state.data.packs[0].icon,'old');assert.equal(f.nodes.eIco.src,'new-icon');assert.equal(f.state.dirty,true);
});
test('image errors and leaving cancel pending reads without a stuck save button',()=>{
 for(const thrown of [false,true]){
  const f=fixture();f.nodes.eIcoF.files=[{fail:thrown}];f.nodes.eIcoF.onchange.call(f.nodes.eIcoF);
  if(!thrown)Reader.all.at(-1).onerror();assert.equal(f.nodes.eSave.disabled,false);assert.equal(f.state.messages.at(-1).key,'msg.file_unreadable');
  f.nodes.eIcoF.files=[{}];f.nodes.eIcoF.onchange.call(f.nodes.eIcoF);const request=Reader.all.at(-1);f.controller.leave();request.load('late');assert.equal(f.nodes.eIco.src,'old');assert.equal(f.nodes.eSave.disabled,false);
 }
});
test('invalid name does not mutate data or start saving',()=>{
 const f=fixture(),before=clone(f.state.data);f.put('!!!');f.click();assert.equal(f.state.calls,0);assert.deepEqual(f.state.data,before);assert.equal(f.state.messages.at(-1).key,'msg.name_latin');
});
test('stale image completion releases only its own busy state',()=>{
 const f=fixture();f.nodes.eIcoF.files=[{}];f.nodes.eIcoF.onchange.call(f.nodes.eIcoF);
 const request=Reader.all.at(-1);f.state.data=clone(f.state.data);request.load('stale');
 assert.equal(f.nodes.eIco.src,'old');assert.equal(f.nodes.eSave.disabled,false);
});
