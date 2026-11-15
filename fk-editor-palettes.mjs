import {createPaletteStore,paintPaletteSample,PALETTE_KEY} from './fk-palettes.mjs?v=0.9.20';
export function createEditorPalettes(o){
 const doc=o.button.ownerDocument,manager=window.FKM,store=createPaletteStore(),L=(en,ru)=>window.FK.lang()==='ru'?ru:en;
 let state={schema:1,active:null,palettes:[]},timer=null,fired=false,target=null,x=0,y=0,held=null,mode='choose',snapshot=[],trigger=null;
 function el(tag,cls,text){const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
 function button(text,action){const n=el('button','ghost',text);n.type='button';n.onclick=action;return n}
 const style=el('style');style.textContent='#fkColors{position:relative;isolation:isolate;gap:0;min-height:44px;overflow:hidden}#fkPaletteChoice{position:relative;z-index:2;display:flex;align-items:stretch;flex:none;width:max-content;max-width:none;height:44px;padding-right:44px;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:transparent;pointer-events:none}#fkPaletteChoice::after{content:"";position:absolute;inset:0 0 0 auto;width:44px;border-left:1px solid var(--line);background:linear-gradient(90deg,var(--panel),transparent);box-shadow:inset 8px 0 10px -8px rgba(0,0,0,.55);pointer-events:none}#fkPaletteChoice #fkPalBtn{flex:none;border:0;border-radius:0;width:40px;height:42px;pointer-events:auto}#fkPalSets{display:flex;align-items:center;flex:none;gap:6px;min-width:max-content;padding:6px 8px;border:0;border-left:1px solid var(--line);border-radius:0;color:var(--ink);background:var(--panel);pointer-events:auto}#fkPalSets span{flex:none;white-space:nowrap}#fkSwatches{position:absolute;z-index:0;left:0;right:0;top:50%;transform:translateY(-50%);box-sizing:border-box;align-items:center;min-width:0;min-height:38px;padding:2px 2px 2px var(--fk-palette-front,140px);scrollbar-width:none;-ms-overflow-style:none}#fkSwatches::-webkit-scrollbar{display:none}#fkPaletteHold{max-width:calc(100vw - 16px);max-height:calc(100dvh - 16px);overflow:auto}#fkPaletteHold button{white-space:normal}#fkPaletteDialog .fkTitle{font-size:17px;font-weight:800}.fkPalettePreview{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.fkPalettePreview canvas{width:32px;height:32px;border:1px solid var(--line);border-radius:8px}#fkPaletteDialog .fkPaletteActions{display:flex;gap:8px;margin-top:12px}#fkPaletteDialog .fkPaletteActions button{flex:1}';doc.head.appendChild(style);
 const group=el('div'),select=button('',()=>{stop();if(consume(select))return;open('choose',select)}),caption=el('span'),arrow=el('span','','▾');
 group.id='fkPaletteChoice';select.id='fkPalSets';arrow.setAttribute('aria-hidden','true');select.append(caption,arrow);o.button.parentNode.insertBefore(group,o.button);group.append(o.button,select);
 const panel=el('div','fkBack'),sheet=el('section','fkSheet'),head=el('div','fkHead'),title=el('span','fkTitle'),body=el('div'),error=el('p','lbl');
 panel.id='fkPaletteDialog';title.id=panel.id+'Title';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby',title.id);error.setAttribute('role','status');head.appendChild(title);sheet.append(head,body,error);panel.appendChild(sheet);doc.body.appendChild(panel);
 select.setAttribute('aria-haspopup','dialog');select.setAttribute('aria-controls',panel.id);select.setAttribute('aria-expanded','false');
 function measure(){const width=group.getBoundingClientRect().width;if(width>0)o.colors.style.setProperty('--fk-palette-front',width+'px')}
 if(typeof window.ResizeObserver==='function'){const observer=new window.ResizeObserver(measure);observer.observe(group)}
 window.addEventListener('resize',measure);o.colors.addEventListener('pointerdown',measure,true);
 if(doc.fonts?.ready)doc.fonts.ready.then(measure).catch(()=>{});
 function current(){return state.palettes.find(p=>p.id===state.active)||null}
 function colors(){const p=current();return (p?p.colors:o.recent()).slice()}
 function report(e){o.error(L('Palettes could not be read or saved.','Не удалось прочитать или сохранить палитры.'))}
 function refresh(){try{state=store.read()}catch(e){report(e)}const p=current();caption.textContent=p?p.name:L('Mix','Микс');select.title=caption.textContent;select.setAttribute('aria-label',L('Palette: ','Набор цветов: ')+caption.textContent);measure()}
 function stop(){clearTimeout(timer);timer=null}
 function consume(b){if(fired&&target===b){fired=false;return true}return false}
 function fail(e){error.textContent=e.message==='name'?L('Enter a name (up to 80 characters).','Введите название — до 80 символов.'):L('Could not save. The data has not been changed; the name is kept here.','Не удалось сохранить. Данные не изменены; введённое название сохранено в поле.')}
 const menu={triggers:[],show(){
  body.textContent='';error.textContent='';title.textContent=mode==='choose'?L('Palettes','Палитры'):L('Save palette','Сохранить палитру');let focus;
  if(mode==='choose'){
   refresh();const list=el('div','fkStateOptions');list.setAttribute('role','radiogroup');list.setAttribute('aria-label',title.textContent);
   [{id:null,name:L('Mix','Микс')},...state.palettes].forEach(p=>{const b=button('',()=>{if(manager.cur!==menu||!o.ready())return;try{store.select(p.id);refresh();manager.close();o.changed()}catch(e){fail(e)}}),label=el('span','fkStateOptionLabel',p.name),mark=el('span','',state.active===p.id?'✓':'');b.className='ghost fkStateOption';b.setAttribute('role','radio');b.setAttribute('aria-checked',String(state.active===p.id));b.classList.toggle('on',state.active===p.id);mark.setAttribute('aria-hidden','true');b.append(label,mark);list.appendChild(b);if(state.active===p.id)focus=b});body.appendChild(list);
  }else{
   const form=el('form'),label=el('label','lbl',L('Palette name','Название набора')),name=el('input'),preview=el('div','fkPalettePreview'),actions=el('div','fkPaletteActions');form.noValidate=true;name.type='text';name.id='fkEditorPaletteName';name.maxLength=80;name.autocomplete='off';label.htmlFor=name.id;
   snapshot.forEach(color=>{const c=el('canvas');c.width=c.height=32;c.setAttribute('aria-hidden','true');paintPaletteSample(c,color);preview.appendChild(c)});
   function save(){if(manager.cur!==menu||!o.ready())return;try{store.create(name.value,snapshot);refresh();manager.close();o.saved()}catch(e){fail(e)}}
   form.onsubmit=e=>{e.preventDefault();save()};actions.append(button(L('Save','Сохранить'),save),button(L('Cancel','Отмена'),()=>manager.close()));form.append(label,name,preview,actions);body.appendChild(form);focus=name;
  }
  panel.classList.add('on');trigger.setAttribute('aria-expanded','true');(focus||body.querySelector('button')).focus();
 },hide(){panel.classList.remove('on');if(trigger){trigger.setAttribute('aria-expanded','false');if(trigger.isConnected)trigger.focus()}}};
 function open(next,b){if(!o.ready())return;if(manager.cur===menu)manager.close();mode=next;trigger=b;menu.triggers=[b];manager.open(menu)}
 const hold=el('div','fkMenu');hold.id='fkPaletteHold';hold.tabIndex=-1;hold.style.display='none';doc.body.appendChild(hold);
 const holdMenu={triggers:[],show(){
  hold.textContent='';const all=held===o.button,recent=state.active===null,rect=held.getBoundingClientRect();
  if(all){const save=button(L('Save as a palette','Сохранить как набор'),()=>{snapshot=colors();manager.close();if(snapshot.length)open('save',o.button)});save.disabled=!colors().length;hold.appendChild(save)}
  if(recent){const remove=button(all?L('Clear Mix','Очистить микс'):L('Delete colour','Удалить цвет'),()=>{if(state.active!==null)return;const before=o.recent(),next=all?[]:before.filter(c=>c!==held.dataset.c);try{localStorage.setItem('fk_hist',JSON.stringify(next));manager.close();o.setRecent(next);o.changed()}catch(e){report(e)}});remove.disabled=all&&!o.recent().length;hold.appendChild(remove)}
  hold.style.display='block';hold.style.width=Math.min(all?240:170,innerWidth-16)+'px';const w=hold.offsetWidth,h=hold.offsetHeight;hold.style.left=Math.max(8,Math.min(innerWidth-w-8,rect.left-8))+'px';hold.style.top=(rect.bottom+6+h>innerHeight?Math.max(8,rect.top-h-6):rect.bottom+6)+'px';(hold.querySelector('button:not(:disabled)')||hold).focus();
 },hide(){hold.style.display='none'}};
 o.colors.addEventListener('pointerdown',e=>{
  const b=e.target.closest('.fkSw,#fkPalBtn');if(!b||!o.colors.contains(b)||e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
  stop();fired=false;target=b;if(b!==o.button&&state.active!==null)return;x=e.clientX;y=e.clientY;
  timer=setTimeout(()=>{timer=null;if(!o.ready()||!o.colors.contains(b))return;fired=true;held=b;holdMenu.triggers=[b];manager.open(holdMenu)},500);
 });
 o.colors.addEventListener('pointermove',e=>{if(timer&&(Math.abs(e.clientX-x)>8||Math.abs(e.clientY-y)>8))stop()});
 ['pointerup','pointercancel','pointerleave'].forEach(type=>o.colors.addEventListener(type,stop));o.swatches.addEventListener('scroll',stop);o.colors.addEventListener('contextmenu',e=>e.preventDefault());
 panel.addEventListener('click',e=>{if(e.target===panel)manager.close()});
 function keys(e){if(manager.cur!==menu&&manager.cur!==holdMenu)return;if(e.key==='Escape'){e.preventDefault();manager.close();return}const scope=manager.cur===menu?body:hold,items=[...scope.querySelectorAll('button,input')].filter(n=>!n.disabled),i=items.indexOf(doc.activeElement);let n;if(e.key==='Tab')n=(i+(e.shiftKey?-1:1)+items.length)%items.length;else if(mode==='choose'&&manager.cur===menu&&e.key==='ArrowDown')n=(i+1)%items.length;else if(mode==='choose'&&manager.cur===menu&&e.key==='ArrowUp')n=(i-1+items.length)%items.length;else return;if(items.length){e.preventDefault();items[n].focus()}}
 panel.addEventListener('keydown',keys);hold.addEventListener('keydown',keys);
 doc.addEventListener('pointerdown',e=>{if(manager.cur===holdMenu&&!hold.contains(e.target))manager.close()},true);
 function leave(){stop();fired=false;if(manager.cur===menu||manager.cur===holdMenu)manager.close()}
 window.addEventListener('blur',stop);window.addEventListener('storage',e=>{if(e.key!==null&&e.key!==PALETTE_KEY&&e.key!=='fk_hist')return;stop();if(manager.cur===holdMenu)manager.close();if(e.key===null||e.key==='fk_hist')try{o.setRecent(store.recent())}catch(error){report(error)}refresh();o.changed()});
 refresh();return {colors:queue=>{const p=current();return p?p.colors:queue},consume,leave};
}
