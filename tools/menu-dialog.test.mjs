import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const manager=await readFile(new URL('../fk-menu.js',import.meta.url),'utf8');
class El{
 constructor(name,doc){this.name=name;this.doc=doc;this.attrs={};this.kids=[];this.parent=null;this.style={};this.disabled=false;this.offsetParent={};this.text='';this.connected=true;}
 add(child){child.parent=this;this.kids.push(child);return child;}
 setAttribute(key,value){this.attrs[key]=String(value);}
 getAttribute(key){return this.attrs[key];}
 focus(){this.doc.activeElement=this;}
 contains(node){for(let n=node;n;n=n.parent)if(n===this)return true;return false;}
 get isConnected(){return this.connected;}
 get textContent(){return this.text;}
 querySelectorAll(){const out=[];const walk=n=>n.kids.forEach(k=>{if(k.name==='button')out.push(k);walk(k);});walk(this);return out;}
 querySelector(selector){return selector==='.fkTitle'?this.title||null:null;}
 get classList(){return {toggle(){}};}
}
function setup(){
 const events={};let backs=0;const doc={activeElement:null};
 doc.body=new El('body',doc);const sheet=new El('sheet',doc);sheet.title=Object.assign(new El('span',doc),{text:'Settings'});
 const first=sheet.add(new El('button',doc)),last=sheet.add(new El('button',doc));
 const opener=doc.body.add(new El('button',doc));
 doc.querySelector=()=>sheet;
 const ctx={document:doc,addEventListener:(k,fn)=>(events[k]??=[]).push(fn),history:{pushState(){},back(){backs++;}}};ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(manager,ctx);
 const menu={triggers:[opener],show(){},hide(){}};
 const press=(key,extra={})=>{let prevented=false;for(const fn of events.keydown??[])fn(Object.assign({key,preventDefault(){prevented=true;},defaultPrevented:false},extra));return prevented;};
 return {ctx,doc,sheet,first,last,opener,menu,press,events};
}
test('open marks the visible sheet as a labelled modal dialog and moves focus into it',()=>{
 const s=setup();s.opener.focus();s.ctx.FKM.open(s.menu);
 assert.equal(s.sheet.getAttribute('role'),'dialog');assert.equal(s.sheet.getAttribute('aria-modal'),'true');assert.equal(s.sheet.getAttribute('aria-label'),'Settings');assert.equal(s.doc.activeElement,s.sheet);
});
test('roles and focus set by a menu itself are kept',()=>{
 const s=setup();s.sheet.setAttribute('role','radiogroup');s.sheet.setAttribute('aria-label','Own');s.first.focus();s.ctx.FKM.open(s.menu);
 assert.equal(s.sheet.getAttribute('role'),'radiogroup');assert.equal(s.sheet.getAttribute('aria-label'),'Own');assert.equal(s.doc.activeElement,s.first);
});
test('Escape closes the open sheet and returns focus to the control that opened it',()=>{
 const s=setup();s.opener.focus();s.ctx.FKM.open(s.menu);assert.equal(s.press('Escape'),true);
 assert.equal(s.ctx.FKM.cur,null);assert.equal(s.doc.activeElement,s.opener);
 assert.equal(s.press('Escape'),false);
});
test('Back navigation restores focus too',()=>{
 const s=setup();s.opener.focus();s.ctx.FKM.open(s.menu);for(const fn of s.events.popstate)fn();
 assert.equal(s.ctx.FKM.cur,null);assert.equal(s.doc.activeElement,s.opener);
});
test('Tab wraps inside the sheet in both directions',()=>{
 const s=setup();s.ctx.FKM.open(s.menu);
 s.last.focus();assert.equal(s.press('Tab'),true);assert.equal(s.doc.activeElement,s.first);
 s.first.focus();assert.equal(s.press('Tab',{shiftKey:true}),true);assert.equal(s.doc.activeElement,s.last);
 s.opener.focus();assert.equal(s.press('Tab'),true);assert.equal(s.doc.activeElement,s.first);
});
test('works without querySelector and ignores keys when nothing is open',()=>{
 const s=setup();delete s.doc.querySelector;assert.equal(s.press('Escape'),false);s.ctx.FKM.open(s.menu);
 assert.equal(s.ctx.FKM.sheet,null);assert.equal(s.press('Tab'),false);assert.equal(s.press('Escape'),true);assert.equal(s.ctx.FKM.cur,null);
});
