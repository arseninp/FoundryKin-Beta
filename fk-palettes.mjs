/* Named palettes are independent of packs and the recent-colour history. */
export const PALETTE_KEY='fk_palettes';
export function parseColor(value){
 let hex=String(value).trim().replace(/^#/,'').toLowerCase();
 if(/^[0-9a-f]{3}$/.test(hex))hex=hex.replace(/./g,'$&$&');
 if(/^[0-9a-f]{6}$/.test(hex))hex+='ff';
 return /^[0-9a-f]{8}$/.test(hex)?'#'+hex:null;
}
function nameOf(value){if(typeof value!=='string'||!value.trim()||value.trim().length>80)throw Error('name');return value.trim()}
function valid(data){
 if(!data||data.schema!==1||!Array.isArray(data.palettes)||(data.active!==null&&typeof data.active!=='string'))throw Error('data');
 const ids=new Set();
 for(const palette of data.palettes){
  if(!palette||typeof palette.id!=='string'||!palette.id||ids.has(palette.id)||nameOf(palette.name)!==palette.name||!Array.isArray(palette.colors))throw Error('data');
  ids.add(palette.id);const colors=new Set();
  for(const color of palette.colors){if(typeof color!=='string'||parseColor(color)!==color||colors.has(color))throw Error('data');colors.add(color)}
 }
 if(data.active!==null&&!ids.has(data.active))throw Error('data');
 return data;
}
export function createPaletteStore(storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)}){
 function read(){const raw=storage.getItem(PALETTE_KEY);if(raw===null)return {schema:1,active:null,palettes:[]};let data;try{data=JSON.parse(raw)}catch(error){throw Error('data')}try{return valid(data)}catch(error){throw Error('data')}}
 function change(action){const data=read(),result=action(data);valid(data);storage.setItem(PALETTE_KEY,JSON.stringify(data));return result}
 function find(data,id){const palette=data.palettes.find(p=>p.id===id);if(!palette)throw Error('missing');return palette}
 return {read,
  recent(){let colors;try{colors=JSON.parse(storage.getItem('fk_hist'))}catch(error){throw Error('history')}if(colors===null)return [];if(!Array.isArray(colors))throw Error('history');return [...new Set(colors.filter(c=>typeof c==='string'&&/^#[0-9a-f]{8}$/.test(c)))].slice(0,20)},
  create(name,colors=[]){name=nameOf(name);if(!Array.isArray(colors))throw Error('color');colors=colors.map(parseColor);if(colors.some(c=>!c))throw Error('color');return change(data=>{let id;do{id=globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}while(data.palettes.some(p=>p.id===id));data.palettes.push({id,name,colors:[...new Set(colors)]});return id})},
  rename(id,name){name=nameOf(name);return change(data=>{find(data,id).name=name})},
  remove(id){return change(data=>{find(data,id);data.palettes=data.palettes.filter(p=>p.id!==id);if(data.active===id)data.active=null})},
  select(id){return change(data=>{if(id!==null)find(data,id);data.active=id})},
  color(id,before,next){if(next!==null){next=parseColor(next);if(!next)throw Error('color')}return change(data=>{const colors=find(data,id).colors,index=before===null?-1:colors.indexOf(before);if(before!==null&&index<0)throw Error('stale');if(next!==null&&colors.some((c,i)=>c===next&&i!==index))throw Error('duplicate');if(next===null){if(index>=0)colors.splice(index,1)}else if(index<0)colors.push(next);else colors[index]=next})}
 };
}
export function paintPaletteSample(canvas,color){
 const rgba=parseColor(color);if(!rgba)throw Error('color');
 const bytes=[1,3,5,7].map(i=>parseInt(rgba.slice(i,i+2),16)),g=canvas.getContext('2d'),image=g.createImageData(canvas.width,canvas.height),alpha=bytes[3]/255;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
  const bg=(Math.floor(x/5)+Math.floor(y/5))%2?230:187,i=(y*canvas.width+x)*4;
  for(let k=0;k<3;k++)image.data[i+k]=Math.round(bytes[k]*alpha+bg*(1-alpha));image.data[i+3]=255;
 }
 g.putImageData(image,0,0);
}
export function mountPaletteSettings(root){
 if(!root||root.dataset.mounted)return;
 const doc=root.ownerDocument,store=createPaletteStore();let draft=null;
 const L=(en,ru)=>window.FK.lang()==='ru'?ru:en;
 function el(tag,cls,text){const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
 function button(text,action){const n=el('button','btn',text);n.type='button';n.onclick=()=>{try{action()}catch(error){failure(error)}};return n}
 function form(action){const n=el('form','col');n.noValidate=true;n.onsubmit=e=>{e.preventDefault();action()};return n}
 function input(type,value){const n=el('input');n.type=type;n.value=value;n.autocomplete='off';return n}
 function sample(color){const n=el('canvas');n.width=n.height=32;n.setAttribute('aria-hidden','true');paintPaletteSample(n,color);return n}
 const title=el('h2'),hint=el('p','lbl'),createBox=form(()=>create(false)),name=input('text',''),nameLabel=el('label','lbl'),createActions=el('div','row'),list=el('div'),status=el('p','lbl');
 name.id='fkPaletteName';name.maxLength=80;nameLabel.htmlFor=name.id;status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const empty=button('',()=>create(false)),recent=button('',()=>create(true));createActions.append(empty,recent);createBox.append(nameLabel,name,createActions);root.append(title,hint,createBox,status,list);
 function failure(error){const messages={name:L('Enter a name (up to 80 characters).','Введите название — до 80 символов.'),color:L('Enter a valid HEX or RGBA colour.','Введите корректный цвет HEX или RGBA.'),duplicate:L('This exact RGBA colour is already in the palette.','Такой цвет с этой прозрачностью уже есть в наборе.'),stale:L('This colour changed in another window. Cancel and open it again.','Цвет изменён в другом окне. Отмените редактирование и откройте его заново.'),missing:L('This palette no longer exists.','Этот набор уже удалён.'),data:L('Palette data could not be read. It has not been overwritten.','Не удалось прочитать данные палитр. Они не перезаписаны.'),history:L('Recent colours could not be read.','Не удалось прочитать последние цвета.')};status.textContent=messages[error.message]||L('Could not save. Browser storage may be unavailable or full. The change was not applied.','Не удалось сохранить. Хранилище браузера может быть недоступно или заполнено. Изменение не применено.')}
 function run(action){try{action();status.textContent='';renderList();return true}catch(error){failure(error);return false}}
 function leaveDraft(){return !draft?.dirty||window.confirm(L('Discard the unsaved palette edit?','Отменить несохранённое изменение палитры?'))}
 function create(fromRecent){if(!leaveDraft())return;if(run(()=>{store.create(name.value,fromRecent?store.recent():[]);draft=null}))name.value=''}
 function open(id,type,before=null){if(!leaveDraft())return;draft={id,type,before,dirty:false,value:type==='name'?store.read().palettes.find(p=>p.id===id)?.name||'':before||''};renderList()}
 function editor(card,palette){
  const selected=draft,box=form(apply),field=input('text',selected.value),label=el('label','lbl',selected.type==='name'?L('Palette name','Название набора'):L('Colour: HEX / RGBA','Цвет: HEX / RGBA'));
  field.id='fkPaletteEdit';label.htmlFor=field.id;field.maxLength=selected.type==='name'?80:9;field.spellcheck=false;box.append(label,field);
  let rgba=[],preview;
  if(selected.type==='color'){
   field.placeholder='#RRGGBBAA';const row=el('div','fkPaletteChannels');preview=el('canvas');preview.width=preview.height=44;preview.setAttribute('aria-hidden','true');
   ['R','G','B','A'].forEach((key,i)=>{const lb=el('label','lbl',key),n=input('number',selected.channels?.[i]??(i===3?'255':''));n.min='0';n.max='255';n.step='1';n.inputMode='numeric';lb.appendChild(n);row.appendChild(lb);rgba.push(n);n.oninput=()=>{selected.dirty=true;selected.channels=rgba.map(n=>n.value);const values=rgba.map(n=>n.value.trim());if(values.every(v=>/^\d{1,3}$/.test(v)&&+v<=255)){selected.value='#'+values.map(v=>(+v).toString(16).padStart(2,'0')).join('');field.value=selected.value;show()}else{selected.value='';field.value='';preview.hidden=true}}});
   box.append(row,preview);
  }
  function show(){if(!preview)return;const color=parseColor(selected.value);preview.hidden=!color;if(color)paintPaletteSample(preview,color)}
  function channels(){if(!rgba.length)return;const color=parseColor(selected.value);if(color)rgba.forEach((n,i)=>n.value=String(parseInt(color.slice(1+i*2,3+i*2),16)));show()}
  field.oninput=()=>{selected.dirty=true;selected.value=field.value;selected.channels=null;channels()};channels();
  function apply(){run(()=>{if(selected.type==='name')store.rename(palette.id,selected.value);else{const color=parseColor(selected.value);if(!color)throw Error('color');store.color(palette.id,selected.before,color)}draft=null})}
  const actions=el('div','row');actions.append(button(L('Save','Сохранить'),apply),button(L('Cancel','Отмена'),()=>{draft=null;status.textContent='';renderList()}));
  if(selected.type==='color'&&selected.before!==null)actions.appendChild(button(L('Delete colour','Удалить цвет'),()=>run(()=>{store.color(palette.id,selected.before,null);draft=null})));
  box.appendChild(actions);card.appendChild(box);
 }
 function renderList(){
  let data;try{data=store.read()}catch(error){failure(error);return}
  list.textContent='';if(draft&&!data.palettes.some(p=>p.id===draft.id))draft=null;
  if(!data.palettes.length)list.appendChild(el('p','lbl',L('No personal palettes yet.','Личных палитр пока нет.')));
  data.palettes.forEach(palette=>{
   const card=el('div','card fkPaletteCard'),heading=el('h3','',palette.name),colors=el('div','fkPaletteColors'),actions=el('div','row');
   palette.colors.forEach(color=>{const b=button(color,()=>open(palette.id,'color',color));b.textContent='';b.className='fkPaletteSwatch';b.setAttribute('aria-label',L('Edit colour ','Изменить цвет ')+color);b.title=color;b.appendChild(sample(color));colors.appendChild(b)});
   if(!palette.colors.length)colors.appendChild(el('p','lbl',L('This palette is empty.','В наборе пока нет цветов.')));
   actions.append(button(L('Add colour','Добавить цвет'),()=>open(palette.id,'color')),button(L('Rename','Переименовать'),()=>open(palette.id,'name')),button(L('Delete palette','Удалить набор'),()=>{if(window.confirm(L('Delete palette “','Удалить набор «')+palette.name+L('”?','»?')))run(()=>{store.remove(palette.id);if(draft?.id===palette.id)draft=null})}));
   card.append(heading,colors,actions);if(draft?.id===palette.id)editor(card,palette);list.appendChild(card);
  });
 }
 function refresh(){title.textContent=L('Palettes','Палитры');hint.textContent=L('Personal palettes are shared by all packs and saved in this browser. They are separate from Recent colours and are not included in pack backups or the current pack-data export.','Личные наборы общие для всех паков и сохраняются в этом браузере. Они независимы от «Последних» и не входят в бэкапы паков и текущую выгрузку данных паков.');nameLabel.textContent=L('New palette name','Название нового набора');empty.textContent=L('Create empty','Создать пустой');recent.textContent=L('Save Recent as a palette','Сохранить «Последние» как набор');renderList()}
 doc.getElementById('sLang').addEventListener('change',refresh);
 window.addEventListener('beforeunload',e=>{if(name.value.trim()||draft?.dirty){e.preventDefault();e.returnValue=''}});
 window.addEventListener('storage',e=>{if(e.key===PALETTE_KEY||e.key===null)renderList()});
 refresh();root.dataset.mounted='true';
}
