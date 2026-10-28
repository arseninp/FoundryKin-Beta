/* Generic model preview controls; no canvas, pack or localStorage writes. */
(function(root){
'use strict';
function create(anchor,changed){
 var doc=anchor.ownerDocument,host=doc.createElement('div'),values={},current='',schema=null,blocked=false;
 host.className='fk-edit-part';host.style.cssText='margin:12px 0;padding:8px;border:1px solid var(--line);border-radius:10px';anchor.parentNode.insertBefore(host,anchor.nextSibling);
 function visible(){host.hidden=blocked||!schema;host.inert=blocked}
 function select(id,spec){
  current=id;schema=spec||(root.FKShapes&&root.FKShapes.previewStates&&root.FKShapes.previewStates[id])||null;host.textContent='';visible();if(!schema)return;
  var ru=root.FK.lang()==='ru',title=doc.createElement('p');title.className='lbl';title.textContent=ru?'Состояние модели — только просмотр':'Model state — preview only';host.appendChild(title);
  var state=values[id]||(values[id]={});
  schema.forEach(function(item){
   var label=doc.createElement('label'),input=doc.createElement('select');
   label.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0';label.appendChild(doc.createTextNode(item.label[ru?1:0]));
   if(!Object.prototype.hasOwnProperty.call(state,item.key))state[item.key]=item.values[0].value;
   item.values.forEach(function(option,i){var o=doc.createElement('option');o.value=String(i);o.textContent=option.label[ru?1:0];input.appendChild(o)});
   input.value=String(item.values.map(function(o){return o.value}).indexOf(state[item.key]));
   input.addEventListener('change',function(){var option=item.values[Number(input.value)];if(option){state[item.key]=option.value;changed()}});
   label.appendChild(input);host.appendChild(label);
  });
 }
 return {select:select,busy:function(on){blocked=on;visible()},value:function(){return schema?Object.assign({},values[current]):{}}};
}
root.FKModelState={create:create};
})(window);
