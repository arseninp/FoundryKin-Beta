/* FKCatalog: Bedrock block catalog logic without editor state: data loading, indexing, vanilla texture images. */
var FKCatalog=(function(){
var URLS_B=['https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/blocks.json','https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@main/resource_pack/blocks.json'];
var URLS_T=['https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/terrain_texture.json','https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@main/resource_pack/textures/terrain_texture.json'];
var URLS_F=['https://data.jsdelivr.com/v1/package/gh/Mojang/bedrock-samples@main/flat','https://api.github.com/repos/Mojang/bedrock-samples/git/trees/main?recursive=1'];
var VAN1='https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/';
var VAN2='https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@main/resource_pack/';
function parseLoose(t){
  t=String(t).replace(/^\uFEFF/,'');
  try{return JSON.parse(t)}catch(e){}
  t=t.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,function(m,s){return s||''});
  t=t.replace(/,(\s*[}\]])/g,'$1');
  return JSON.parse(t);
}
function fetchJson(urls,i,errs2){
  i=i||0;errs2=errs2||[];
  if(i>=urls.length)return Promise.reject(new Error(errs2.join('; ')||'no response'));
  return fetch(urls[i]).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(parseLoose)
    .catch(function(err){errs2.push((err&&err.message?err.message:String(err))+' ['+urls[i].split('/')[2]+']');return fetchJson(urls,i+1,errs2)});
}
var FORM_RE=/_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane)\d*$/;
var FORM_OF={slab:'slab',stairs:'stairs',wall:'wall',fence_gate:'gate',fence:'fence',button:'button',pressure_plate:'plate',pane:'pane'};
function isDerived(id){return FORM_RE.test(id)||/^double_/.test(id)||/_double_/.test(id)}
function baseFor(id,m,raw){
  var pre=id.slice(0,m.index),cands=[pre,pre+'_block',pre+'_planks',pre+'_wool',pre+'_concrete',pre+'s',pre+'_bricks',pre+'_brick'];
  for(var i=0;i<cands.length;i++){var c=cands[i];if(raw[c]&&!isDerived(c))return c}
  return null;
}
var BASE=/_(double_slab|slab|stairs|wall|fence_gate|fence|button|pressure_plate)$/;
function buildCatalog(B,T){
  var td=(T&&T.texture_data)||{};
  function resolve(k){
    var e=td[k];if(!e)return null;
    var t=e.textures;if(Array.isArray(t))t=t[0];if(t&&typeof t==='object')t=t.path;
    return typeof t==='string'?t:null;
  }
  var b={},p={},unres={},cr={};
  Object.keys(B).forEach(function(id){
    var e=B[id];if(!e||typeof e!=='object'||!e.textures)return;
    var t=e.textures,ks;
    if(typeof t==='string')ks=[t,t,t,t,t,t];
    else{
      var any=t.side||t.up||t.down||t.north||t.south||t.east||t.west;
      var f=function(k){return t[k]||t.side||any};
      ks=[f('up'),f('down'),f('north'),f('south'),f('east'),f('west')];
    }
    for(var i=0;i<6;i++)if(!ks[i])return;
    var miss=false,paths=ks.map(function(k){var r=resolve(k);if(r)return r;miss=true;return 'textures/blocks/'+k});
    b[id]=paths;if(miss)unres[id]=1;if(typeof e.carried_textures==='string'){var cr0=resolve(e.carried_textures);if(cr0&&cr0!==paths[0])cr[id]=cr0}
    if(typeof t==='string'&&e.sound==='grass'&&!e.isotropic&&!e.carried_textures&&!e.ambient_occlusion_exponent)p[id]=1;if(/^(?:sapling|(?:[a-z_]+_)?sapling|(?:[a-z_]+_)?propagule|tallgrass|short_grass|tall_grass|fern|large_fern|deadbush|dead_bush|double_plant|yellow_flower|red_flower|dandelion|poppy|blue_orchid|allium|azure_bluet|(?:red|orange|white|pink)_tulip|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|open_eyeblossom|closed_eyeblossom|sunflower|lilac|rose_bush|peony|pitcher_plant|pink_petals|wildflowers|cactus_flower|(?:[a-z_]+_)?bush|brown_mushroom|red_mushroom|(?:crimson|warped)_(?:fungus|roots)|nether_sprouts|hanging_roots|spore_blossom|wheat|carrots|potatoes|beetroot|beetroots|nether_wart|(?:attached_)?(?:melon|pumpkin)_stem|torchflower_crop|pitcher_crop|reeds|sugar_cane|seagrass|sea_pickle|kelp|(?:dead_)?(?:tube|brain|bubble|fire|horn)_coral(?:_wall_fan|_fan)?|coral_fan(?:_dead|_hang\d?)?|coral|coral_plant(?:_[a-z_]+)?|(?:small|medium|large)_amethyst_bud|amethyst_cluster|web|cobweb|cave_vines(?:_body_with_berries|_head_with_berries)?|weeping_vines|twisting_vines)$/.test(id))p[id]=1;
  });
  return {b:b,p:p,cr:cr};
}
function doorPaths(id,existing){
  var N=(id==='wooden_door')?'wood':id.replace(/_door$/,'');
  var pats=[['door_'+N+'_lower','door_'+N+'_upper'],[N+'_door_bottom',N+'_door_top'],[N+'_door_lower',N+'_door_upper']];
  var low=null,upp=null,i,j;
  for(i=0;i<pats.length;i++){
    var l='textures/blocks/'+pats[i][0],u='textures/blocks/'+pats[i][1];
    if(existing?(existing[l]&&existing[u]):i===0){low=l;upp=u;break}
  }
  if(!low)return null;
  var icons=['textures/items/door_'+N,'textures/items/'+N+'_door'],ic=null;
  for(j=0;j<icons.length;j++){if(existing?existing[icons[j]]:j===0){ic=icons[j];break}}
  return {low:low,up:upp,icon:ic};
}
function indexCatalog(c,existing){
  var raw=c.b,all={},sp={},forms={},kids={};
  Object.keys(raw).forEach(function(id){
    if(isDerived(id)){
      if(/^double_/.test(id)||/_double_/.test(id))return;
      var m=FORM_RE.exec(id);if(!m)return;
      var base=baseFor(id,m,raw);if(!base)return;
      var f=FORM_OF[m[1]];
      (forms[base]=forms[base]||{})[f]=1;(kids[base]=kids[base]||[]).push(id);
      return;
    }
    all[id]=raw[id];
  });
  Object.keys(raw).forEach(function(id){
    if(!all[id]||!/_door$/.test(id))return;
    var d=doorPaths(id,existing);
    if(!d){delete all[id];return}
    all[id]=[d.low,d.low,d.up,d.up,d.up,d.up];
    var list=[{id:d.up,k:['slot.top']},{id:d.low,k:['slot.bottom']}];
    if(d.icon)list.push({id:d.icon,k:['slot.icon']});
    sp[id]={kind:'door',list:list,fm:{up:d.low,down:d.low,north:d.up,south:d.up,east:d.up,west:d.up}};
  });
  if(all.beacon){
    var bp=all.beacon;
    sp.beacon={kind:'labels',list:[{id:bp[0],k:['slot.core']},{id:bp[1],k:['slot.bottom']},{id:bp[4],k:['slot.sides']}],fm:{up:bp[0],down:bp[1],north:bp[2],south:bp[3],east:bp[4],west:bp[5]}};
  }
  ['rail','golden_rail','detector_rail','activator_rail'].forEach(function(id){
    if(!all[id])return;
    var rp=all[id],list=[],seen={};
    [rp[0],rp[1]].forEach(function(p){if(!seen[p]){seen[p]=1;list.push({id:p,label:''})}});
    var tk=list.map(function(s){return s.id.split('/').pop().split('_')}),com=tk[0].filter(function(w){return tk.every(function(x){return x.indexOf(w)>=0})});
    list.forEach(function(s,i){var r=tk[i].filter(function(w){return com.indexOf(w)<0});s.label=(r.length?r:[tk[i][tk[i].length-1]]).join(' ')});
    sp[id]={kind:'labels',list:list,fm:{up:rp[0],down:rp[1],north:rp[2],south:rp[3],east:rp[4],west:rp[5]}};
  });
  ['azalea','flowering_azalea'].forEach(function(id){
    if(!all[id])return;
    var ap=all[id];
    sp[id]={kind:'azalea',list:[{id:ap[0],k:['slot.top']},{id:ap[2],k:['slot.sides']},{id:ap[4],k:['slot.sapling']}],fm:{up:ap[0],down:ap[2],north:ap[2],south:ap[2],east:ap[2],west:ap[2],plant:ap[4]}};
  });
  if(all.cave_vines){
    var cv=all.cave_vines;
    sp.cave_vines={kind:'labels',list:[{id:cv[0],k:['slot.body']},{id:cv[1],k:['slot.head']}],fm:{up:cv[0],down:cv[1],north:cv[2],south:cv[3],east:cv[4],west:cv[5]}};
    ['cave_vines_body_with_berries','cave_vines_head_with_berries'].forEach(function(x){delete all[x]});
  }
  var AM=['amethyst_cluster','large_amethyst_bud','medium_amethyst_bud','small_amethyst_bud'],al=[],gm={};
  AM.forEach(function(x,i){if(all[x]){al.push({id:all[x][0],k:['slot.'+x]});if(i)gm['g'+i]=all[x][0]}});
  if(all.amethyst_cluster&&al.length>1){
    var ac=all.amethyst_cluster;
    sp.amethyst_cluster={kind:'pick',list:al,fm:{up:ac[0],down:ac[1],north:ac[2],south:ac[3],east:ac[4],west:ac[5],g1:gm.g1,g2:gm.g2,g3:gm.g3}};
    AM.slice(1).forEach(function(x){delete all[x]});
  }
  Object.keys(kids).forEach(function(bs){
    var pk=kids[bs].filter(function(k){return /_pane$/.test(k)})[0],gp=all[bs],pt=pk&&raw[pk][4];
    if(!pt||!gp||pt===gp[0]||sp[bs])return;
    sp[bs]={kind:'labels',list:[{id:gp[0],k:['slot.glass']},{id:pt,k:['slot.edge']}],fm:{up:gp[0],down:gp[1],north:gp[2],south:gp[3],east:gp[4],west:gp[5],edge:pt}};
  });
  if(all.anvil){
    var an=all.anvil,al2=[{id:an[0],k:['slot.top']},{id:an[1],k:['slot.base']}],ag={};
    [['chipped_anvil',1],['damaged_anvil',2]].forEach(function(x){var a=all[x[0]];if(a){al2.push({id:a[0],k:['slot.'+x[0]]});ag['g'+x[1]]=a[0]}});
    sp.anvil={kind:'pick',list:al2,fm:{up:an[0],down:an[1],north:an[1],south:an[1],east:an[1],west:an[1],g1:ag.g1,g2:ag.g2}};
    ['chipped_anvil','damaged_anvil','deprecated_anvil'].forEach(function(x){delete all[x]});
  }
  if(all.barrel){
    var br=all.barrel;
    sp.barrel={kind:'labels',list:[{id:br[2],k:['slot.top']},{id:br[3],k:['slot.bottom']},{id:br[0],k:['slot.side']}],fm:{up:br[2],down:br[3],north:br[0],south:br[0],east:br[0],west:br[0]}};
  }
  Object.keys(all).forEach(function(id){if(/(^|_)candle_cake$/.test(id))delete all[id]});
  if(all.cake){
    var ck=all.cake;
    sp.cake={kind:'labels',list:[{id:ck[0],k:['slot.top']},{id:ck[1],k:['slot.bottom']},{id:ck[2],k:['slot.side']},{id:ck[5],k:['slot.west']}],fm:{up:ck[0],down:ck[1],north:ck[2],south:ck[3],east:ck[4],west:ck[5]}};
  }
  if(all.bell){
    var bl=all.bell,en='textures/entity/bell/bell';
    sp.bell={kind:'bell',list:[{id:en,t:'bell',k:['slot.bell']},{id:bl[4],t:'beam',k:['slot.beam']},{id:bl[5],t:'posts',k:['slot.posts']}],fm:{up:en,down:en,north:en,south:en,east:bl[4],west:bl[5]}};
    all.bell=[en,en,en,en,bl[4],bl[5]];
  }
  if(all.bubble_column){
    var bc=all.bubble_column;
    sp.bubble_column={kind:'labels',list:[{id:bc[0],k:['slot.top']},{id:bc[1],k:['slot.bottom']},{id:bc[2],k:['slot.outer']},{id:bc[3],k:['slot.inner']}],fm:{up:bc[0],down:bc[1],north:bc[2],south:bc[3],east:bc[2],west:bc[3]}};
    all.bubble_column=[bc[0],bc[1],bc[2],bc[3],bc[2],bc[3]];
  }
  delete all.bed;
  ['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'].forEach(function(c){
    var ent='textures/entity/bed/'+(c==='light_gray'?'silver':c),ic=null,cs=['textures/items/bed_'+c];
    if(c==='light_gray')cs.push('textures/items/bed_silver');
    cs.forEach(function(p){if(!ic&&(existing?existing[p]:true))ic=p});
    var list=[{id:ent,t:'bed',k:['slot.bed']}];
    if(ic)list.push({id:ic,t:'icon',k:['slot.icon']});
    all[c+'_bed']=[ent,ent,ent,ent,ent,ent];
    sp[c+'_bed']={kind:'bed',list:list,fm:{up:ent,down:ent,north:ent,south:ent,east:ent,west:ent}};
  });
  var b={},filtered=false;
  if(existing){
    Object.keys(all).forEach(function(id){if((sp[id]&&(sp[id].kind==='bed'||sp[id].kind==='bell'))||all[id].every(function(p){return existing[p]}))b[id]=all[id]});
    if(Object.keys(b).length)filtered=true;else b=all;
  }else b=all;
  var cr2={};if(c.cr)Object.keys(c.cr).forEach(function(id){if(b[id]&&!sp[id]&&existing&&existing[c.cr[id]])cr2[id]=c.cr[id]});
  var sig={},members={},mother={};
  Object.keys(b).forEach(function(id){var sg=b[id].join('|');sig[id]=sg;(members[sg]=members[sg]||[]).push(id);mother[id]=id});
  return {b:b,cr:cr2,p:c.p||{},sp:sp,forms:forms,kids:kids,sig:sig,members:members,mother:mother,ids:Object.keys(b).sort(),filtered:filtered,hidden:Object.keys(raw).length-Object.keys(b).length};
}
function fetchExisting(){
  return fetchJson(URLS_F).then(function(j){
    var s={},n=0;
    (j.files||[]).forEach(function(f){var nm=f.name;if(/^\/resource_pack\/textures\/.+\.(png|tga)$/.test(nm)){s[nm.slice(15,-4)]=1;n++}});
    (j.tree||[]).forEach(function(f){var nm=f.path;if(/^resource_pack\/textures\/.+\.(png|tga)$/.test(nm)){s[nm.slice(14,-4)]=1;n++}});
    if(!n)throw new Error('empty file list');
    return s;
  });
}
function loadImg(u){return new Promise(function(ok){var im=new Image();im.crossOrigin='anonymous';im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=u})}
function fkTga(buf){var b=new Uint8Array(buf),idl=b[0],ct=b[1],it=b[2],w=b[12]|(b[13]<<8),h=b[14]|(b[15]<<8),bpp=b[16],desc=b[17];if(ct!==0||(it!==2&&it!==10&&it!==3&&it!==11)||!(bpp===24||bpp===32||bpp===8)||!w||!h)return null;var by=bpp>>3,off=18+idl,px=new Uint8Array(w*h*by),n=0,i,k;if(it===2||it===3){px.set(b.subarray(off,off+w*h*by))}else{while(n<w*h&&off<b.length){var hd=b[off++],c=(hd&127)+1;if(hd&128){for(i=0;i<c&&n<w*h;i++){for(k=0;k<by;k++)px[n*by+k]=b[off+k];n++}off+=by}else{for(i=0;i<c&&n<w*h;i++){for(k=0;k<by;k++)px[n*by+k]=b[off++];n++}}}}var out=new Uint8ClampedArray(w*h*4),top=(desc&32)!==0;for(var y=0;y<h;y++){var sy=top?y:(h-1-y);for(var x=0;x<w;x++){var si=(sy*w+x)*by,di=(y*w+x)*4;if(bpp===8){out[di]=out[di+1]=out[di+2]=px[si];out[di+3]=255}else{out[di]=px[si+2];out[di+1]=px[si+1];out[di+2]=px[si];out[di+3]=bpp===32?px[si+3]:255}}}return {w:w,h:h,data:out}}
function loadTga(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(buf){var t=fkTga(buf);if(!t)return null;var c=document.createElement('canvas');c.width=t.w;c.height=t.h;c.getContext('2d').putImageData(new ImageData(t.data,t.w,t.h),0,0);return new Promise(function(ok){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=c.toDataURL('image/png')})}).catch(function(){return null})}
function loadAny(p){return loadImg(VAN1+p+'.png').then(function(im){return im||loadImg(VAN2+p+'.png')}).then(function(im){return im||loadTga(VAN1+p+'.tga')}).then(function(im){return im||loadTga(VAN2+p+'.tga')})}
return {URLS_B:URLS_B,URLS_T:URLS_T,URLS_F:URLS_F,parseLoose:parseLoose,fetchJson:fetchJson,fetchExisting:fetchExisting,build:buildCatalog,index:indexCatalog,loadAny:loadAny};
})();
