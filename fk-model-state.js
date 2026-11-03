/* Shared themed state picker. Preview values never modify PNGs or pack storage. */
(function(root){
'use strict';
var serial=0,own=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
function validate(spec){
 if(!spec)return null;
 if(!Array.isArray(spec)||!spec.length)throw new Error('Invalid preview schema');
 var keys=Object.create(null);
 function label(a){if(!Array.isArray(a)||a.length<2||typeof a[0]!=='string'||typeof a[1]!=='string')throw new Error('Invalid preview label');return a.slice(0,2)}
 return spec.map(function(item){
  if(!item||typeof item.key!=='string'||!/^[a-z][a-z0-9_]*$/.test(item.key)||keys[item.key]||!Array.isArray(item.values)||!item.values.length)throw new Error('Invalid preview field');
  keys[item.key]=true;var seen=[];
  return {key:item.key,label:label(item.label),values:item.values.map(function(option){
   var v=option&&option.value,t=typeof v;
   if(!option||!(['string','boolean','number'].indexOf(t)>=0)||(t==='number'&&!isFinite(v))||seen.indexOf(v)>=0)throw new Error('Invalid preview option');
   seen.push(v);return {value:v,label:label(option.label)};
  })};
 });
}
function create(anchor,changed,options){
 options=options||{};
 if(typeof changed!=='function'||typeof options!=='object'||Array.isArray(options))throw new Error('Invalid preview picker configuration');
 ['language','doneLabel','manager'].forEach(function(key){if(own(options,key)&&typeof options[key]!=='function')throw new Error('Invalid preview picker dependency: '+key)});
 var language=options.language||function(){return root.FK.lang()},doneLabel=options.doneLabel||function(){return root.FK.t('ui.done')},getManager=options.manager||function(){return root.FKM};
 var doc=anchor.ownerDocument,values=Object.create(null),current='',schema=null,blocked=false,opened=null,disposed=false;
 function mk(tag,cls,text){var el=doc.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
 function text(pair){return pair[language()==='ru'?1:0]}
 var host=mk('div','fk-edit-part fkStatePanel');anchor.parentNode.insertBefore(host,anchor.nextSibling);
 var panel=mk('div','fkBack'),sheet=mk('section','fkSheet'),head=mk('div','fkHead'),title=mk('span','fkTitle'),done=mk('button','fkOk'),choices=mk('div','fkStateOptions');
 panel.id='fkStateDialog'+(++serial);title.id=panel.id+'Title';
 sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby',title.id);
 done.type='button';done.textContent='✓';done.setAttribute('aria-label',doneLabel());
 choices.setAttribute('role','radiogroup');
 head.appendChild(title);head.appendChild(done);sheet.appendChild(head);sheet.appendChild(choices);panel.appendChild(sheet);doc.body.appendChild(panel);
 function visible(){host.hidden=blocked||!schema;host.inert=blocked}
 function close(restore){
  if(opened&&restore===false)opened.restore=false;
  var manager=getManager();if(manager&&manager.cur===menu)manager.close();else if(opened)menu.hide();
 }
 var menu={triggers:[],show:function(){
  var snapshot=opened;if(disposed||!snapshot)return;
  title.textContent=text(snapshot.item.label);choices.textContent='';done.setAttribute('aria-label',doneLabel());
  choices.setAttribute('aria-label',title.textContent);
  var selected=null;
  snapshot.item.values.forEach(function(option){
   var button=mk('button','ghost fkStateOption'),active=values[current][snapshot.item.key]===option.value;
   button.type='button';button.setAttribute('role','radio');button.setAttribute('aria-checked',String(active));button.classList.toggle('on',active);
   button.appendChild(mk('span','',text(option.label)));var mark=mk('span','',active?'✓':'');mark.setAttribute('aria-hidden','true');button.appendChild(mark);
   button.addEventListener('click',function(){
    if(disposed||blocked||opened!==snapshot||current!==snapshot.id||schema!==snapshot.schema)return;
    var state=values[current],different=state[snapshot.item.key]!==option.value;
    state[snapshot.item.key]=option.value;snapshot.valueNode.textContent=text(option.label)+' ▾';close();if(different)changed();
   });
   choices.appendChild(button);if(active)selected=button;
  });
  panel.classList.add('on');snapshot.trigger.setAttribute('aria-expanded','true');(selected||done).focus();
 },hide:function(){
  var previous=opened;opened=null;panel.classList.remove('on');
  if(previous){previous.trigger.setAttribute('aria-expanded','false');if(previous.restore!==false&&!disposed&&!blocked&&!host.hidden&&previous.trigger.isConnected)previous.trigger.focus()}
 }};
 done.addEventListener('click',function(){close()});
 panel.addEventListener('click',function(e){if(e.target===panel)close()});
 panel.addEventListener('keydown',function(e){
  var manager=getManager();if(disposed||!manager||manager.cur!==menu)return;
  if(e.key==='Escape'){e.preventDefault();close();return}
  if(e.key==='Tab'){
   var buttons=Array.prototype.slice.call(panel.querySelectorAll('button')),i=buttons.indexOf(doc.activeElement),step=e.shiftKey?-1:1;
   e.preventDefault();buttons[(i+step+buttons.length)%buttons.length].focus();
  }
 });
 function select(id,spec,initial){
  if(disposed)throw new Error('Preview picker is disposed');
  if(typeof id!=='string')throw new Error('Invalid preview object ID');
  var raw=spec||(root.FKShapes&&root.FKShapes.previewStates&&root.FKShapes.previewStates[id])||null,next=validate(raw);
  if(initial!==undefined&&(!initial||typeof initial!=='object'||Array.isArray(initial)))throw new Error('Invalid initial preview state');
  var state=Object.assign(Object.create(null),values[id]);
  (next||[]).forEach(function(item){
   if(initial&&own(initial,item.key)){
    if(!item.values.some(function(option){return option.value===initial[item.key]}))throw new Error('Invalid initial preview value: '+item.key);
    state[item.key]=initial[item.key];
   }
   if(!own(state,item.key)||!item.values.some(function(option){return option.value===state[item.key]}))state[item.key]=item.values[0].value;
  });
  close(false);current=id;schema=next;values[id]=state;host.textContent='';visible();if(!schema)return;
  done.setAttribute('aria-label',doneLabel());
  host.appendChild(mk('p','lbl',text(['Model state — preview only','Состояние модели — только просмотр'])));
  schema.forEach(function(item){
   var button=mk('button','ghost fkStateRow'),valueNode=mk('span','fkStateValue');button.type='button';
   button.appendChild(mk('span','',text(item.label)));button.appendChild(valueNode);
   valueNode.textContent=text(item.values.filter(function(option){return option.value===state[item.key]})[0].label)+' ▾';
   button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded','false');
   var selectedId=current,selectedSchema=schema;
   button.addEventListener('click',function(){
    if(disposed||blocked||current!==selectedId||schema!==selectedSchema)return;
    var manager=getManager();if(!manager||typeof manager.toggle!=='function'||typeof manager.close!=='function')throw new Error('Preview picker requires the shared menu manager');
    opened={id:current,schema:schema,item:item,trigger:button,valueNode:valueNode,restore:true};menu.triggers=[button];manager.toggle(menu);
   });host.appendChild(button);
  });
 }
 visible();
 return {select:select,
  busy:function(on){if(disposed)return;blocked=!!on;if(blocked)close(false);visible()},
  value:function(){var result={};if(!disposed&&schema)schema.forEach(function(item){result[item.key]=values[current][item.key]});return result},
  dispose:function(){if(disposed)return;close(false);disposed=true;schema=null;values=Object.create(null);menu.triggers=[];if(host.parentNode)host.parentNode.removeChild(host);if(panel.parentNode)panel.parentNode.removeChild(panel)}
 };
}
root.FKModelState={create:create};
})(window);
