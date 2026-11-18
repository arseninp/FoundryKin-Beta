/* D02 import preparation; shell wiring follows separately.
   commitData must publish live state only after a successful write. */
export function createPackImport(options){
 let pending=null;
 function current(operation){return pending===operation&&!operation.controller.signal.aborted&&options.current();}
 function sync(){options.changed?.(!!pending);}
 function leave(){const operation=pending;pending=null;operation?.controller.abort();sync();}
 async function importFile(file){
  if(!file||pending||!options.current())return false;
  const zip=options.getZip();
  if(!zip){options.say('msg.no_jszip');return false;}
  const operation={controller:new AbortController()};pending=operation;
  let writing=false;
  try{
   sync();
   const root=options.getData(),before=JSON.stringify(root);
   const archive=await zip.loadAsync(file);if(!current(operation))return false;
   const manifest=Object.keys(archive.files).filter(name=>/(^|\/)manifest\.json$/i.test(name)&&!archive.files[name].dir).sort((a,b)=>a.length-b.length)[0];
   if(!manifest){options.say('msg.no_manifest');return false;}
   const prefix=manifest.slice(0,manifest.length-'manifest.json'.length);
   const text=await archive.file(manifest).async('string');if(!current(operation))return false;
   let document;
   try{document=JSON.parse(text.replace(/^\uFEFF/,''));}catch(error){options.say('msg.bad_manifest');return false;}
   const header=document.header||{},modules=document.modules||[];
   const names=Object.keys(archive.files).filter(name=>name.indexOf(prefix+'textures/')===0&&/\.png$/i.test(name)&&!archive.files[name].dir);
   const textures=[];let total=0;
   for(const name of names){
    const encoded=await archive.file(name).async('base64');if(!current(operation))return false;
    total+=encoded.length;if(total>4000000){options.say('msg.too_big');return false;}
    textures.push({path:name.slice((prefix+'textures/').length).replace(/\.png$/i,''),data:'data:image/png;base64,'+encoded});
   }
   const iconFile=archive.file(prefix+'pack_icon.png');
   const icon=iconFile?await iconFile.async('base64'):'';if(!current(operation))return false;
   if(options.getData()!==root||JSON.stringify(root)!==before)throw new Error('Packs changed during import; retry the import');
   if(before.length+total*1.4>5000000){options.say('msg.no_space',{mb:Math.round(total/1e5)/10});return false;}
   const name=String(header.name||file.name.replace(/\.[^.]+$/,'')).replace(/[^A-Za-z0-9_\- ]/g,'').trim()||'imported_pack';
   const keep=typeof header.uuid==='string'&&/^[0-9a-f-]{36}$/i.test(header.uuid)&&!root.packs.some(pack=>pack.id===header.uuid);
   const pack={id:keep?header.uuid:options.uuid(),keep,mod:modules[0]&&typeof modules[0].uuid==='string'?modules[0].uuid:'',name,desc:String(header.description||''),version:Array.isArray(header.version)?header.version.join('.'):'1.0.0',game:Array.isArray(header.min_engine_version)?header.min_engine_version.join('.'):'1.21.0',author:document.metadata&&document.metadata.authors&&document.metadata.authors[0]||'',icon:icon?'data:image/png;base64,'+icon:'',textures};
   const candidate={...root,active:pack.id,packs:[...root.packs,pack]};
   writing=true;
   const result=await options.commitData(candidate,{signal:operation.controller.signal});
   if(result===false)throw new Error('Imported pack was not saved');
   if(!current(operation))return false;
   options.saved?.(pack);options.say('msg.imported',{name:pack.name,n:textures.length});return true;
  }catch(error){
   if(current(operation))options.say(writing?'msg.save_failed':'msg.archive_unreadable',{detail:error?.message||String(error)});
   return false;
  }finally{
   if(pending===operation){pending=null;sync();}
  }
 }
 return {importFile,leave,busy:()=>!!pending};
}
