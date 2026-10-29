import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../fk-model-state.js',import.meta.url),'utf8');
const tools=await readFile(new URL('../fk-tools.js',import.meta.url),'utf8');
const start=tools.indexOf('var FKM='),end=tools.indexOf('window.FKM=FKM;',start);
assert.ok(start>=0&&end>start);
function setup(){
 const events={};let changes=0,pushed=0;
 const doc={activeElement:null,createElement:tag=>new Element(tag),body:null};
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.attrs={};this.events={};this.parentNode=null;this.ownerDocument=doc;this.className='';this.hidden=false;this.inert=false;this.text='';}
  set textContent(value){this.text=value;this.children.forEach(c=>c.parentNode=null);this.children=[];}
  get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}
  appendChild(c){this.children.push(c);c.parentNode=this;return c;}
  insertBefore(c,ref){this.children.splice(ref?this.children.indexOf(ref):this.children.length,0,c);c.parentNode=this;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  fire(k,event={}){for(const fn of this.events[k]??[])fn({target:this,preventDefault(){},...event});}
  focus(){doc.activeElement=this;}
  get isConnected(){return this===doc.body||!!this.parentNode?.isConnected;}
  get classList(){const change=(k,on)=>{const s=new Set(this.className.split(' ').filter(Boolean));if(on)s.add(k);else s.delete(k);this.className=[...s].join(' ');};return {add:k=>change(k,true),remove:k=>change(k,false),toggle:change};}
  querySelectorAll(tag){return this.children.flatMap(c=>[...(c.tagName===tag?[c]:[]),...c.querySelectorAll(tag)]);}
 }
 doc.body=new Element('body');const parent=doc.body.appendChild(new Element('main')),anchor=parent.appendChild(new Element('div'));
 const ctx={document:doc,FK:{lang:()=> 'en',t:()=> 'Done'},FKShapes:{previewStates:{}},addEventListener:(k,fn)=>(events[k]??=[]).push(fn),history:{pushState(){pushed++;},back(){for(const fn of events.popstate??[])fn();}}};ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(tools.slice(start,end+'window.FKM=FKM;'.length),ctx);vm.runInContext(source,ctx);
 const api=ctx.FKModelState.create(anchor,()=>changes++);
 return {api,ctx,doc,host:parent.children[1],panel:doc.body.children[1],changes:()=>changes,pushed:()=>pushed,pop:()=>{for(const fn of events.popstate??[])fn();}};
}
const schema=[{key:'enabled',label:['Power','Питание'],values:[{value:false,label:['Off','Выкл.']},{value:true,label:['On','Вкл.']}]}];
test('themed picker uses the real menu manager and preserves boolean values',()=>{
 const s=setup();s.api.select('device',schema);assert.equal(s.api.value().enabled,false);assert.equal(s.host.querySelectorAll('select').length,0);
 const trigger=s.host.querySelectorAll('button')[0];trigger.fire('click');assert.ok(s.ctx.FKM.cur);assert.equal(s.pushed(),1);
 const options=s.panel.querySelectorAll('button');assert.equal(options[1].getAttribute('aria-checked'),'true');options[2].fire('click');
 assert.equal(s.api.value().enabled,true);assert.ok(trigger.textContent.includes('On ▾'));assert.equal(s.changes(),1);assert.equal(s.ctx.FKM.cur,null);assert.equal(s.doc.activeElement,trigger);
 s.api.select('other',schema);s.api.select('device',schema);assert.equal(s.api.value().enabled,true);
});
test('Back, Escape and the backdrop close without changing the preview',()=>{
 const s=setup();s.api.select('device',schema);const trigger=s.host.querySelectorAll('button')[0];
 trigger.fire('click');s.pop();assert.equal(s.ctx.FKM.cur,null);
 trigger.fire('click');s.panel.fire('keydown',{key:'Escape'});assert.equal(s.ctx.FKM.cur,null);
 trigger.fire('click');s.panel.fire('click');assert.equal(s.ctx.FKM.cur,null);assert.equal(s.changes(),0);
});
test('loading closes only this picker and stale option clicks are ignored',()=>{
 const s=setup();s.ctx.FKShapes.previewStates.device=schema;s.api.select('device',null);
 s.host.querySelectorAll('button')[0].fire('click');const stale=s.panel.querySelectorAll('button')[2];s.api.busy(true);stale.fire('click');
 assert.equal(s.api.value().enabled,false);assert.equal(s.changes(),0);assert.equal(s.host.hidden,true);
 s.api.busy(false);assert.equal(s.host.hidden,false);s.api.select('none',null);assert.equal(s.host.hidden,true);
});
test('schema validation rejects duplicate keys and retains the previous valid selection',()=>{
 const s=setup();s.api.select('device',schema);
 assert.throws(()=>s.api.select('invalid',[schema[0],schema[0]]));assert.equal(s.api.value().enabled,false);
});
test('focus stays in the sheet while it is open',()=>{
 const s=setup();s.api.select('device',schema);s.host.querySelectorAll('button')[0].fire('click');
 const buttons=s.panel.querySelectorAll('button');buttons[buttons.length-1].focus();s.panel.fire('keydown',{key:'Tab'});assert.equal(s.doc.activeElement,buttons[0]);
});
