/* Pack backup screens only. The shell owns routing and commits to live pack data. */
const TEXT={
 en:{create:'Create backup',restore:'Restore',remove:'Delete backup',title:'Backup',name:'Backup name (optional)',placeholder:'Leave blank to use the creation date and time',empty:'No backup for this pack.',local:'Stored only in this browser. Clearing site data can remove the pack and its backup.',warning:'A backup uses additional device storage. Browser storage limits may leave less room for new textures, packs and other app data. Further saves may fail when storage is full. You can delete the backup without deleting the pack.',restoring:'Checking backup images…',restored:'Pack restored from backup.',created:'Backup created.',deleted:'Backup deleted.',deleteConfirm:'Delete only the backup? The current pack will remain unchanged.',restoreConfirm:'Replace the current saved state of this pack with its backup? Other packs will not be changed. The backup will remain available.',failed:'Could not complete the backup operation.',quota:'Not enough browser storage. The current pack and its backup have not been changed.',changed:'The pack or backup changed. Open the screen again.',unavailable:'The backup cannot be read. You can delete this backup separately.'},
 ru:{create:'Создать бэкап',restore:'Восстановить',remove:'Удалить бэкап',title:'Бэкап',name:'Название бэкапа (необязательно)',placeholder:'Без названия — дата и время создания',empty:'Для этого пака бэкапа пока нет.',local:'Хранится только в этом браузере. При удалении данных сайта можно потерять пак и его бэкап.',warning:'Бэкап занимает дополнительное место на устройстве. Из-за ограничений хранилища браузера места для новых текстур, паков и других данных приложения может стать меньше. При нехватке места дальнейшее сохранение может не пройти. Бэкап можно удалить отдельно от пака.',restoring:'Проверяем изображения бэкапа…',restored:'Пак восстановлен из бэкапа.',created:'Бэкап создан.',deleted:'Бэкап удалён.',deleteConfirm:'Удалить только бэкап? Текущий пак останется без изменений.',restoreConfirm:'Заменить текущее сохранённое состояние этого пака его бэкапом? Остальные паки не изменятся. Бэкап останется доступен.',failed:'Не удалось выполнить действие с бэкапом.',quota:'Недостаточно места в хранилище браузера. Текущий пак и его бэкап не изменены.',changed:'Пак или бэкап изменился. Откройте экран заново.',unavailable:'Не удалось прочитать бэкап. Его можно удалить отдельно.'}
};
export async function validateBackupImages(pack,makeImage=()=>new Image(),valid=()=>true){
 for(const data of [...pack.textures.map(texture=>texture.data),...(pack.icon?[pack.icon]:[])]){
  if(!valid())throw new Error('Backup check cancelled');
  if(typeof data!=='string'||!data.startsWith('data:image/'))throw new Error('Invalid backup image source');
  await new Promise((resolve,reject)=>{
   const image=makeImage();
   image.onload=()=>{
    const w=image.naturalWidth,h=image.naturalHeight;
    image.onload=image.onerror=null;
    if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w>16384||h>16384||w*h>16777216)reject(new Error('Backup image exceeds editor limits'));
    else resolve();
   };
   image.onerror=()=>{image.onload=image.onerror=null;reject(new Error('Backup image decode failed'));};
   image.src=data;
  });
 }
}
export function createPackBackupUI(options){
 const {document:doc,store,getPack,isCurrent,openScreen,back,notice,commitRestore}=options;
 if(doc.getElementById('s-backup'))throw new Error('Backup UI already mounted');
 const ask=options.confirmAction||((message)=>confirm(message));
 let draft=null,generation=0,pending=false,rows=new Map();
 function t(key){return TEXT[options.lang()==='ru'?'ru':'en'][key];}
 function el(tag,cls,text){const node=doc.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
 function button(key,action){const node=el('button','btn');node.type='button';node.dataset.backupLabel=key;node.textContent=t(key);node.addEventListener('click',action);return node;}
 const list=doc.getElementById('packList');
 const screen=el('section','screen'),form=el('form'),packName=el('p','fkBackupPack'),label=el('label','lbl fkBackupName'),input=el('input'),warning=el('div','tcard fkBackupWarning'),warningText=el('p'),localText=el('p','lbl'),formError=el('p','lbl'),submitRow=el('div','row'),submit=el('button','btn pri');
 screen.id='s-backup';input.type='text';input.id='backupName';input.autocomplete='off';label.htmlFor=input.id;input.setAttribute('aria-describedby','backupWarning');warning.id='backupWarning';
 submit.type='submit';formError.setAttribute('role','alert');warning.appendChild(warningText);warning.appendChild(localText);submitRow.appendChild(submit);
 for(const node of [packName,label,input,warning,formError,submitRow])form.appendChild(node);
 screen.appendChild(form);doc.getElementById('screens').appendChild(screen);
 function errorText(error){return error&&error.name==='QuotaExceededError'?t('quota'):t('failed')+(error&&error.message?' '+error.message:'');}
 function busy(on){pending=on;for(const row of rows.values())for(const node of row.actions.children)node.disabled=on;}
 function cancel(){generation++;busy(false);}
 function fail(id,error){const row=rows.get(id);if(row){row.error.hidden=false;row.error.textContent=errorText(error);}}
 function renderCards(){
  cancel();const previous=rows;rows=new Map();
  for(const card of list.querySelectorAll('.card')){
   const texture=card.querySelector('[data-a="open"]'),id=texture&&texture.dataset.id;
   if(!id||!getPack(id))continue;
   let row=previous.get(id);
   if(!row||row.card!==card){
    const info=el('p','lbl'),error=el('p','lbl'),actions=el('div','fkBackupActions');error.setAttribute('role','alert');
    const name=card.querySelector('.pk .n');name.appendChild(info);name.appendChild(error);
    const group=card.querySelector('.acts');group.insertBefore(actions,texture.nextSibling);
    row={card,info,error,actions,create:button('create',()=>open(id)),restore:button('restore',()=>restore(id)),remove:button('remove',()=>remove(id))};
    for(const node of [row.create,row.restore,row.remove])actions.appendChild(node);
   }
   rows.set(id,row);row.error.textContent='';row.error.hidden=true;
   let entry=null,broken=false;
   try{entry=store.read(id);}catch(error){broken=true;row.error.hidden=false;row.error.textContent=t('unavailable');}
   row.info.textContent=entry?t('title')+': '+(entry.name||new Date(entry.createdAt).toLocaleString(options.lang()==='ru'?'ru-RU':'en-US')):t('empty');
   row.create.hidden=!!entry||broken;row.restore.hidden=!entry;row.remove.hidden=!entry&&!broken;
   for(const node of row.actions.children)node.textContent=t(node.dataset.backupLabel);
  }
 }
 function renderScreen(){
  if(!draft)return;
  const pack=getPack(draft.id);packName.textContent=pack?pack.name:'';
  label.textContent=t('name');input.placeholder=t('placeholder');warningText.textContent=t('warning');localText.textContent=t('local');submit.textContent=t('create');
 }
 function open(id){
  if(pending||!isCurrent(id,'create')||!getPack(id))return;
  try{if(store.read(id)){renderCards();return;}}catch(error){fail(id,error);return;}
  cancel();draft={id,initial:''};input.value='';formError.textContent='';renderScreen();openScreen('backup',id);
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!draft||pending||!isCurrent(draft.id,'backup'))return;
  const pack=getPack(draft.id);if(!pack){formError.textContent=t('changed');return;}
  try{store.save(pack,input.value);}catch(error){formError.textContent=errorText(error);return;}
  draft=null;back();notice(t('created'));
 });
 function remove(id){
  if(pending||!isCurrent(id,'create')||!getPack(id)||!ask(t('deleteConfirm')))return;
  try{store.remove(id);}catch(error){fail(id,error);return;}
  renderCards();notice(t('deleted'));
 }
 async function restore(id){
  if(pending||!isCurrent(id,'create'))return;
  let entry;try{entry=store.read(id);}catch(error){fail(id,error);return;}
  if(!entry||!ask(t('restoreConfirm')))return;
  const pack=getPack(id),row=rows.get(id);if(!pack||!row)return;
  const before=JSON.stringify(pack),checkpoint=JSON.stringify(entry),ticket=++generation;
  busy(true);row.error.hidden=false;row.error.textContent=t('restoring');
  try{
   await validateBackupImages(entry.pack,options.makeImage,()=>ticket===generation);
   if(ticket!==generation)return;
   if(!isCurrent(id,'create')||rows.get(id)!==row||getPack(id)!==pack||JSON.stringify(pack)!==before||JSON.stringify(store.read(id))!==checkpoint)throw new Error(t('changed'));
   if(commitRestore(entry.pack,pack)!==true)throw new Error(t('failed'));
   renderCards();notice(t('restored'));
  }catch(error){if(ticket===generation)fail(id,error);}
  finally{if(ticket===generation)busy(false);}
 }
 return {open,renderCards,renderScreen,title:()=>t('create'),dirty:()=>!!draft&&input.value!==draft.initial,leave(){cancel();draft=null;},busy:()=>pending};
}
