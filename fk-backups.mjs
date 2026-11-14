/* Pack backup screens only. The shell owns routing and commits to live pack data. */
const TEXT={
 en:{create:'Create backup',replace:'Replace backup',restore:'Restore',remove:'Delete backup',title:'Backup',name:'Backup name',optional:'Optional. Leave blank to use the creation date and time.',empty:'No backup for this pack.',local:'Stored only in this browser. Clearing site data can remove the pack and its backup.',warning:'A backup uses additional device storage. Browser storage limits may leave less room for new textures, packs and other app data. Further saves may fail when storage is full. You can delete the backup without deleting the pack.',replacing:'The previous backup of this pack will be replaced.',restoring:'Checking backup images…',restored:'Pack restored from backup.',created:'Backup created.',replaced:'Backup replaced.',deleted:'Backup deleted.',deleteConfirm:'Delete only the backup? The current pack will remain unchanged.',restoreConfirm:'Replace the current saved state of this pack with its backup? Other packs will not be changed. The backup will remain available.',failed:'Could not complete the backup operation.',quota:'Not enough browser storage. The current pack and previous backup have not been replaced.',changed:'The pack or backup changed. Open the screen again.',unavailable:'The backup cannot be read. You can delete this backup separately.',size:'Approximate data size: '},
 ru:{create:'Создать бэкап',replace:'Заменить бэкап',restore:'Восстановить',remove:'Удалить бэкап',title:'Бэкап',name:'Название бэкапа',optional:'Необязательно. Если оставить поле пустым, будет показана дата и время создания.',empty:'Для этого пака бэкапа пока нет.',local:'Хранится только в этом браузере. При удалении данных сайта можно потерять пак и его бэкап.',warning:'Бэкап занимает дополнительное место на устройстве. Из-за ограничений хранилища браузера места для новых текстур, паков и других данных приложения может стать меньше. При нехватке места дальнейшее сохранение может не пройти. Бэкап можно удалить отдельно от пака.',replacing:'Предыдущий бэкап этого пака будет заменён.',restoring:'Проверяем изображения бэкапа…',restored:'Пак восстановлен из бэкапа.',created:'Бэкап создан.',replaced:'Бэкап заменён.',deleted:'Бэкап удалён.',deleteConfirm:'Удалить только бэкап? Текущий пак останется без изменений.',restoreConfirm:'Заменить текущее сохранённое состояние этого пака его бэкапом? Остальные паки не изменятся. Бэкап останется доступен.',failed:'Не удалось выполнить действие с бэкапом.',quota:'Недостаточно места в хранилище браузера. Текущий пак и предыдущий бэкап не заменены.',changed:'Пак или бэкап изменился. Откройте экран заново.',unavailable:'Не удалось прочитать бэкап. Его можно удалить отдельно.',size:'Примерный размер данных: '}
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
 if(doc.getElementById('s-backup')||doc.getElementById('packBackup'))throw new Error('Backup UI already mounted');
 const ask=options.confirmAction||((message)=>confirm(message));
 let draft=null,generation=0,pending=false,panelPack=null;
 function t(key){return TEXT[options.lang()==='ru'?'ru':'en'][key];}
 function el(tag,cls,text){const node=doc.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
 function button(key,action){const node=el('button','btn');node.type='button';node.addEventListener('click',action);node.dataset.backupLabel=key;return node;}
 const panel=el('div','tcard'),panelTitle=el('p'),panelSize=el('p','lbl'),panelLocal=el('p','lbl'),actions=el('div','row'),panelError=el('p','lbl');
 panel.id='packBackup';panelError.setAttribute('role','alert');panel.appendChild(panelTitle);panel.appendChild(panelSize);panel.appendChild(panelLocal);panel.appendChild(actions);panel.appendChild(panelError);
 const createButton=button('create',()=>open(panelPack)),restoreButton=button('restore',restore),replaceButton=button('replace',()=>open(panelPack)),deleteButton=button('remove',remove);
 for(const node of [createButton,restoreButton,replaceButton,deleteButton])actions.appendChild(node);
 const textures=doc.getElementById('texList');textures.parentNode.insertBefore(panel,textures);
 const screen=el('section','screen'),form=el('form'),packName=el('p','lbl'),label=el('label','lbl'),input=el('input'),hint=el('p','lbl'),warning=el('div','tcard'),warningText=el('p'),localText=el('p','lbl'),replaceText=el('p','lbl'),formError=el('p','lbl'),submitRow=el('div','row'),submit=el('button','btn pri');
 screen.id='s-backup';input.type='text';input.id='backupName';input.autocomplete='off';label.htmlFor=input.id;input.setAttribute('aria-describedby','backupNameHint');hint.id='backupNameHint';
 submit.type='submit';formError.setAttribute('role','alert');warning.appendChild(warningText);warning.appendChild(localText);submitRow.appendChild(submit);
 for(const node of [packName,label,input,hint,warning,replaceText,formError,submitRow])form.appendChild(node);
 screen.appendChild(form);doc.getElementById('screens').appendChild(screen);
 function errorText(error){return error&&error.name==='QuotaExceededError'?t('quota'):t('failed')+(error&&error.message?' '+error.message:'');}
 function cancel(){generation++;pending=false;actions.inert=false;panel.removeAttribute('aria-busy');}
 function labels(){for(const node of [createButton,restoreButton,replaceButton,deleteButton])node.textContent=t(node.dataset.backupLabel);}
 function caption(entry){return entry.name||new Date(entry.createdAt).toLocaleString(options.lang()==='ru'?'ru-RU':'en-US');}
 function renderPack(pack){
  cancel();panelPack=pack?pack.id:null;panel.hidden=!pack;if(!pack)return;
  labels();panelLocal.textContent=t('local');panelError.textContent='';
  let entry=null,broken=false;
  try{entry=store.read(pack.id);}catch(error){broken=true;panelError.textContent=t('unavailable');}
  panelTitle.textContent=entry?t('title')+': '+caption(entry):t('empty');
  panelSize.textContent=entry?t('size')+Math.ceil(new Blob([JSON.stringify(entry)]).size/1024)+' KB':'';
  createButton.hidden=!!entry||broken;restoreButton.hidden=replaceButton.hidden=!entry;deleteButton.hidden=!entry&&!broken;
 }
 function renderScreen(){
  if(!draft)return;
  const pack=getPack(draft.id);packName.textContent=pack?pack.name:'';
  label.textContent=t('name');hint.textContent=t('optional');warningText.textContent=t('warning');localText.textContent=t('local');
  replaceText.textContent=draft.replace?t('replacing'):'';submit.textContent=t(draft.replace?'replace':'create');
 }
 function open(id){
  if(pending||!id||!isCurrent(id,'pack'))return;
  const pack=getPack(id);if(!pack)return;
  let entry;try{entry=store.read(id);}catch(error){panelError.textContent=errorText(error);return;}
  cancel();draft={id,replace:!!entry,createdAt:entry?entry.createdAt:undefined,initial:entry?entry.name:''};
  input.value=draft.initial;formError.textContent='';renderScreen();openScreen('backup');
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!draft||pending||!isCurrent(draft.id,'backup'))return;
  const pack=getPack(draft.id);if(!pack){formError.textContent=t('changed');return;}
  const replacing=draft.replace;
  try{store.save(pack,input.value,{replace:replacing,expectedCreatedAt:draft.createdAt});}
  catch(error){formError.textContent=errorText(error);return;}
  draft=null;back();notice(t(replacing?'replaced':'created'));
 });
 function remove(){
  const id=panelPack;if(pending||!id||!isCurrent(id,'pack')||!ask(t('deleteConfirm')))return;
  try{store.remove(id);}catch(error){panelError.textContent=errorText(error);return;}
  renderPack(getPack(id));notice(t('deleted'));
 }
 async function restore(){
  const id=panelPack;if(pending||!id||!isCurrent(id,'pack'))return;
  let entry;try{entry=store.read(id);}catch(error){panelError.textContent=errorText(error);return;}
  if(!entry||!ask(t('restoreConfirm')))return;
  const pack=getPack(id);if(!pack)return;
  const before=JSON.stringify(pack),checkpoint=JSON.stringify(entry),ticket=++generation;
  pending=true;actions.inert=true;panel.setAttribute('aria-busy','true');panelError.textContent=t('restoring');
  try{
   await validateBackupImages(entry.pack,options.makeImage,()=>ticket===generation);
   if(ticket!==generation)return;
   if(!isCurrent(id,'pack')||getPack(id)!==pack||JSON.stringify(pack)!==before||JSON.stringify(store.read(id))!==checkpoint)throw new Error(t('changed'));
   if(commitRestore(entry.pack,pack)!==true)throw new Error(t('failed'));
   renderPack(getPack(id));notice(t('restored'));
  }catch(error){if(ticket===generation)panelError.textContent=errorText(error);}
  finally{if(ticket===generation){pending=false;actions.inert=false;panel.removeAttribute('aria-busy');}}
 }
 return {open,renderPack,renderScreen,title:()=>t(draft&&draft.replace?'replace':'create'),dirty:()=>!!draft&&input.value!==draft.initial,leave(){cancel();draft=null;},busy:()=>pending};
}
