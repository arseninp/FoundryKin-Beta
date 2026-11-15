/* Shell settings use the shared sheet, option styles and menu manager. */
(function(){
'use strict';
var doc=document,manager=window.FKM,FK=window.FK;
var fields=[{id:'sTheme',title:'settings.theme',prefix:'theme.',values:['auto','light','dark']},{id:'sLang',title:'settings.language',prefix:'lang.',values:['auto','en','ru']}];
function mk(tag,cls){var el=doc.createElement(tag);if(cls)el.className=cls;return el}
var panel=mk('div','fkBack'),sheet=mk('section','fkSheet'),head=mk('div','fkHead'),title=mk('span','fkTitle'),choices=mk('div','fkStateOptions'),opened=null;
panel.id='fkSettingsChoiceDialog';title.id=panel.id+'Title';
sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby',title.id);
choices.setAttribute('role','radiogroup');head.appendChild(title);sheet.appendChild(head);sheet.appendChild(choices);panel.appendChild(sheet);doc.body.appendChild(panel);
function sync(){
 fields.forEach(function(field){
  var button=doc.getElementById(field.id),value=field.values.indexOf(button.value)>=0?button.value:'auto';
  button.textContent=FK.t(field.prefix+value)+' ▾';
  button.setAttribute('aria-label',FK.t(field.title)+': '+FK.t(field.prefix+value));
 });
}
var menu={triggers:[],show:function(){
 var field=opened.field,trigger=opened.trigger,selected=null;
 title.textContent=FK.t(field.title);choices.setAttribute('aria-label',title.textContent);choices.textContent='';
 field.values.forEach(function(value){
  var button=mk('button','ghost fkStateOption'),label=mk('span','fkStateOptionLabel'),mark=mk('span'),active=trigger.value===value;
  button.type='button';button.setAttribute('role','radio');button.setAttribute('aria-checked',String(active));button.classList.toggle('on',active);
  label.textContent=FK.t(field.prefix+value);mark.textContent=active?'✓':'';mark.setAttribute('aria-hidden','true');button.appendChild(label);button.appendChild(mark);
  button.addEventListener('click',function(){
   if(!opened||opened.trigger!==trigger||manager.cur!==menu)return;
   var different=trigger.value!==value;manager.close();
   if(different){trigger.value=value;trigger.dispatchEvent(new Event('change',{bubbles:true}))}
   sync();
  });
  choices.appendChild(button);if(active)selected=button;
 });
 panel.classList.add('on');trigger.setAttribute('aria-expanded','true');(selected||choices.querySelector('button')).focus();
},hide:function(){
 var previous=opened;opened=null;panel.classList.remove('on');
 if(previous){previous.trigger.setAttribute('aria-expanded','false');if(previous.trigger.isConnected)previous.trigger.focus()}
}};
fields.forEach(function(field){
 var trigger=doc.getElementById(field.id);
 trigger.addEventListener('click',function(){
  if(manager.cur===menu&&opened&&opened.trigger===trigger){manager.close();return}
  if(manager.cur)manager.close();opened={field:field,trigger:trigger};menu.triggers=[trigger];manager.open(menu);
 });
 trigger.addEventListener('change',sync);
});
panel.addEventListener('click',function(e){if(e.target===panel)manager.close()});
panel.addEventListener('keydown',function(e){
 if(manager.cur!==menu)return;
 if(e.key==='Escape'){e.preventDefault();manager.close();return}
 var buttons=Array.prototype.slice.call(choices.querySelectorAll('button')),i=buttons.indexOf(doc.activeElement),next;
 if(e.key==='Tab')next=(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length;
 else if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%buttons.length;
 else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;
 else if(e.key==='Home')next=0;
 else if(e.key==='End')next=buttons.length-1;
 else return;
 e.preventDefault();buttons[next].focus();
});
doc.addEventListener('click',function(e){if(e.target.closest('[data-go="settings"],#back'))sync()});
sync();
})();
