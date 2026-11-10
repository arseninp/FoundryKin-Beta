/* Read-only resource relationships from the compiled catalog; no ownership or selection changes. */
function resourceUsages(runtime,paths){
 const {catalog,access}=runtime,results=new Map();
 for(const path of paths){
  if(typeof path!=='string'||!path.startsWith('textures/'))throw new Error('Invalid usage resource path');
  if(!results.has(path))results.set(path,new Map());
 }
 function add(path,id,relation,roles){
  const object=access.describe(id);
  if(!object||!catalog.cards.includes(object.card))throw new Error('Inaccessible resource usage: '+id);
  const cards=results.get(path);let card=cards.get(object.card);
  if(!card){card={card:object.card,uses:new Map()};cards.set(object.card,card);}
  const key=JSON.stringify([object.id,object.form,object.state??{},relation]);
  let use=card.uses.get(key);
  if(!use){use={id:object.id,form:object.form,state:{...object.state},relation,sources:new Set(),roles:new Set()};card.uses.set(key,use);}
  use.sources.add(id);for(const role of roles)use.roles.add(role);
 }
 for(const path of results.keys())for(const owner of catalog.resources[path]??[]){
  if(owner.kind!=='block')continue;
  const record=catalog.records[owner.id];
  if(!record?.paths.includes(path))throw new Error('Usage index disagrees with owner: '+owner.id);
  const roles=[];
  for(const [field,prefix] of [['bindings','part'],['faces','face'],['carried','carried']])for(const [role,paths] of Object.entries(record[field]??{}))if(paths.includes(path))roles.push(prefix+':'+role);
  if(record.icons?.includes(path))roles.push('icon');
  for(const [color,maps] of Object.entries(record.textureSets??{}))for(const [role,map] of Object.entries(maps))if(map===path)roles.push('material:'+role+' ('+color+')');
  for(const [role,resource] of Object.entries(record.potteryPatterns??{}))if(resource===path)roles.push('pattern:'+role);
  add(path,owner.id,'owned',roles);
 }
 for(const [id,record] of Object.entries(catalog.records)){
  const matches=new Map();
  for(const [role,declared] of Object.entries(record.dependencies??{})){
   if(!Array.isArray(declared))throw new Error('Invalid usage dependency: '+id+':'+role);
   for(const path of new Set(declared))if(results.has(path)){
    if(!matches.has(path))matches.set(path,[]);
    matches.get(path).push(role);
   }
  }
  for(const [path,roles] of matches)add(path,id,'dependency',roles);
 }
 for(const [path,cards] of results)results.set(path,[...cards.values()].sort((a,b)=>a.card.localeCompare(b.card)).map(card=>({card:card.card,uses:[...card.uses.values()].map(use=>({...use,sources:[...use.sources].sort(),roles:[...use.roles].sort()})).sort((a,b)=>a.id.localeCompare(b.id)||a.relation.localeCompare(b.relation))})));
 return results;
}
export function resourceUsage(runtime,path){return resourceUsages(runtime,[path]).get(path);}
export function resourceUsageInfo(runtime,selection){
 const path=selection.plan.slot,borrowedPaths=[...new Set(selection.borrowed)].sort(),results=resourceUsages(runtime,[path,...borrowedPaths]),users=results.get(path),borrowed=borrowedPaths.map(path=>({path,users:results.get(path)}));
 const identities=new Set(users.flatMap(card=>card.uses.map(use=>use.id)));
 return {path,users,shared:identities.size>1,borrowed};
}
export function appendResourceUsage(host,runtime,selection,language){
 const ru=language==='ru',doc=host.ownerDocument;
 function node(tag,text){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
 const plan=selection.plan,record=runtime.catalog.records[plan.object.id];
 if(['bubble_column','end_portal','end_gateway'].includes(plan.object.id)&&record?.model==='sprite'&&plan.mode==='sprite'&&!record.icons?.includes(plan.slot)){
  const note=node('p',ru?'В игре этот эффект создаёт Minecraft. Здесь показана исходная текстура для редактирования, а не симуляция игрового эффекта.':'Minecraft generates this effect in-game. This editor shows the source texture for editing, not a simulation of the effect.');
  note.className='lbl';note.dataset.engineEffectNote='';host.appendChild(note);
 }
 const info=resourceUsageInfo(runtime,selection);
 if(plan.mode==='sprite'&&info.users.some(card=>card.card===plan.object.card&&card.uses.some(use=>use.roles.includes('icon')))){
  const note=node('p',ru?'Это предметная иконка: плоский спрайт без вращения. Она относится к этой карточке и не является текстурой модели блока.':'This is an item icon: a flat sprite without rotation. It belongs to this card and is not a block model texture.');
  note.className='lbl';note.dataset.itemIconNote='';host.appendChild(note);
 }
 if(!info.shared&&!info.borrowed.length)return null;
 const details=node('details'),summary=node('summary'),title=node('span',info.shared?(ru?'Общая текстура':'Shared texture'):(ru?'Заимствованные текстуры':'Borrowed textures')),value=node('span');
 details.dataset.resourceUsage='';details.style.overflowWrap='anywhere';summary.className='fkResourceRow';value.className='fkStateValue';
 function caption(){value.textContent=(info.shared?(ru?'Объектов: ':'Objects: ')+info.users.length:String(info.borrowed.length))+' '+(details.open?'▾':'▸');}
 caption();details.addEventListener('toggle',caption);summary.appendChild(title);summary.appendChild(value);details.appendChild(summary);
 function users(parent,rows){
  const list=node('ul');
  for(const card of rows){
   const item=node('li',card.card),routes=node('ul');
   for(const use of card.uses){
    const state=Object.entries(use.state).map(([key,value])=>key+'='+String(value)).join(', ');
    const text=[use.sources.join(', '),(ru?'форма: ':'form: ')+use.form,state,use.relation==='dependency'?(ru?'заимствование':'borrowed'):(ru?'собственный ресурс':'owned resource'),use.roles.join(', ')].filter(Boolean).join(' · ');
    routes.appendChild(node('li',text));
   }
   item.appendChild(routes);list.appendChild(item);
  }
  if(!rows.length)list.appendChild(node('li',ru?'Владелец не объявлен; ресурс используется по явной зависимости.':'No owner declared; resource used through an explicit dependency.'));
  parent.appendChild(list);
 }
 if(info.shared){
  details.appendChild(node('p',(ru?'Выбранный файл: ':'Selected file: ')+info.path));
  details.appendChild(node('p',ru?'Использование файла, включая текущий объект:':'File usage, including the current object:'));users(details,info.users);
 }
 if(info.borrowed.length){
  details.appendChild(node('p',ru?'Заимствованные ресурсы текущего просмотра (не отдельные редактируемые файлы этой карточки):':'Borrowed resources of the current preview (not separately editable files owned by this card):'));
  for(const resource of info.borrowed){details.appendChild(node('p',resource.path));users(details,resource.users);}
 }
 host.appendChild(details);return details;
}
