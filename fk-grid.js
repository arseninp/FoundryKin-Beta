var NEWPATCHES=[["function drawFb(){\n  if(!fbOn||!slots.length)return;\n  var c=$('#fb'),g=c.getContext('2d');\n  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,300,300);g.imageSmoothingEnabled=false;\n  var isDoor=(shape==='door'||shape==='dooropen');\n  var s=isDoor?95:140,a=s*.866,b=s*.5,T0={x:150,y:isDoor?12+s:12},R=res,F=faceMap;\n  function im(k){return cv[F[k]]}\n", "function drawFb(){\n  if(!slots.length)return;\n  var c=$('#fb'),Z=Math.min(1200,Math.max(300,Math.round((c.clientWidth||360)*(window.devicePixelRatio||1))));\n  if(c.width!==Z){c.width=c.height=Z}\n  drawBlock(c,shape,function(k){return cv[faceMap[k]]},res,Z);\n}\nfunction drawBlock(c,shape,im,R,Z){\n  var g=c.getContext('2d'),q=Z/300;\n  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,Z,Z);g.imageSmoothingEnabled=false;\n  var isDoor=(shape==='door'||shape==='dooropen');\n  var s=(isDoor?95:140)*q,a=s*.866,b=s*.5,T0={x:150*q,y:isDoor?12*q+s:12*q};\n"], ["return hit}};\n/* ---------- старт ---------- */", "return hit},grid:function(){return {catalog:catalog,files:files,dirty:dirty,load:loadAny,select:selectBlock,edited:isEdited,drawBlock:drawBlock,discard:function(){slots.forEach(function(s){ph[s.id]=true})},obj:function(){return {id:cur==='custom'?null:cur,paths:slots.map(function(s){return s.id}),file:slot?String(slot).split('/').pop():''}},setPack:function(map){Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k]}});Object.keys(map).forEach(function(k){var d=map[k],w=16;try{var b=atob(d.split(',')[1].slice(0,40));w=(b.charCodeAt(16)*16777216)+(b.charCodeAt(17)<<16)+(b.charCodeAt(18)<<8)+b.charCodeAt(19)}catch(e){}if(!(w>0&&w<=1024))w=16;files[k]={res:w,data:d};dirty[k]=true})},shapeFor:function(id){var m=catalog.mother[id],mo=modelOf(m),k=shapeKeysFor(m,catalog.members[catalog.sig[m]]),w=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));return k.indexOf(w)>=0?w:k[0]}}}};\n/* ---------- старт ---------- */"], ["function save(){\n  try{packCur();localStorage.setItem(SAVE_KEY,", "function save(){\n  return;\n  try{packCur();localStorage.setItem(SAVE_KEY,"], ["function load(){\n  var raw=null,o=null;", "function load(){\n  return false;\n  var raw=null,o=null;"], ["else if(shape==='azalea'){fbPlane(im('plant'));fbBox(0,1,0,1,0,1,{left:im('north'),right:im('north'),top:im('up')});fbPlane(im('plant'))}", "else if(shape==='azalea'){fbPlane(im('plant'));fbBox(0,1,0,1,0,1,{left:im('north'),right:im('north'),top:im('up')})}"],["  beacon:{label:'Маяк'}\n};","  beacon:{label:'Маяк'},\n  candle:{label:'Свеча',parts:[[.125,.375,.125,0,-.3125,0]],shift:0},\n  carpet:{label:'Ковёр',parts:[[1,.0625,1,0,-.46875,0]],shift:.45},\n  rail:{label:'Рельс',parts:[[1,.0625,1,0,-.46875,0]],shift:.45},\n  decal:{label:'Налёт',parts:[[1,1,.0625,0,0,-.46875]],shift:0}\n};"],["var mo=modelOf(m);if(mo)return (mo==='beacon'||mo==='azalea')?[mo]:[mo,'cube'];","if(/(^|_)candle$/.test(m))return ['candle'];if(/(^|_)carpet$/.test(m)||m==='waterlily'||m==='leaf_litter'||m==='frog_spawn')return ['carpet'];if(/(^|_)rail$/.test(m))return ['rail'];if(m==='vine'||m==='glow_lichen'||m==='sculk_vein'||m==='resin_clump')return ['decal'];var mo=modelOf(m);if(mo)return (mo==='beacon'||mo==='azalea')?[mo]:[mo,'cube'];"],["d.parts.forEach(function(a){group.add(box.apply(null,a))});","d.parts.forEach(function(a){var bm=box.apply(null,shape==='rail'?a.concat([[faceMap.east,faceMap.west,(slot===faceMap.up?faceMap.up:faceMap.down),(slot===faceMap.up?faceMap.up:faceMap.down),faceMap.south,faceMap.north]]):a);if(shape==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}group.add(bm)});if(shape==='candle'){var wid=faceMap.east,wm=mats[wid];if(wm){wm.side=THREE.DoubleSide;wm.needsUpdate=true;[.7853981633974483,-.7853981633974483].forEach(function(ry){var pg=new THREE.PlaneGeometry(.125,.125),pu=pg.attributes.uv;for(var j=0;j<pu.count;j++){pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125)}var pm=new THREE.Mesh(pg,wm);pm.position.y=-.0625;pm.rotation.y=ry;group.add(pm)})}}"],["var s=(isDoor?95:140)*q,a=s*.866,b=s*.5,T0={x:150*q,y:isDoor?12*q+s:12*q};","var s=(isDoor?95:140)*q,a=s*.866,b=s*.5,T0={x:150*q,y:isDoor?12*q+s:12*q};var UO=(shape==='candle')?.4375:0;"],["face(I.left,x0*R,","face(I.left,(x0-UO)*R,"],["face(I.right,(1-y1)*R,","face(I.right,(1-y1-UO)*R,"],["face(I.top,x0*R,y0*R,","face(I.top,(x0-UO)*R,y0*R,"],["list.forEach(function(q){fbBox(q[0],q[1],q[2],q[3],q[4],q[5])});","list.forEach(function(q){fbBox(q[0],q[1],q[2],q[3],q[4],q[5],shape==='rail'?{left:im('south'),right:im('east'),top:im((c.id==='fb'&&slot===faceMap.up)?'up':'down')}:undefined)});"],["function drawEd(){ed.width=ed.height=res;","function drawEd(){ed.width=ed.height=res;ed.style.backgroundSize=(200/res)+'% '+(200/res)+'%';"],["  ['azalea','flowering_azalea'].forEach(function(id){","  ['rail','golden_rail','detector_rail','activator_rail'].forEach(function(id){\n    if(!all[id])return;\n    var rp=all[id],list=[],seen={};\n    [rp[0],rp[1]].forEach(function(p){if(!seen[p]){seen[p]=1;list.push({id:p,label:''})}});\n    var tk=list.map(function(s){return s.id.split('/').pop().split('_')}),com=tk[0].filter(function(w){return tk.every(function(x){return x.indexOf(w)>=0})});\n    list.forEach(function(s,i){var r=tk[i].filter(function(w){return com.indexOf(w)<0});s.label=(r.length?r:[tk[i][tk[i].length-1]]).join(' ')});\n    var ip='textures/items/'+rp[1].split('/').pop();\n    if(existing&&existing[ip])list.push({id:ip,label:'иконка'});\n    sp[id]={kind:'labels',list:list,fm:{up:rp[0],down:rp[1],north:rp[2],south:rp[3],east:rp[4],west:rp[5]}};\n  });\n  ['azalea','flowering_azalea'].forEach(function(id){"],["function setSlot(id){\n  if(!cv[id])return;slot=id;\n  $('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});\n  drawEd();\n}","function setSlot(id){\n  if(!cv[id])return;slot=id;\n  $('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});\n  drawEd();\n  if(shape==='rail')build();\n}"],["if(typeof t==='string'&&e.sound==='grass'&&!e.isotropic&&!e.carried_textures&&!e.ambient_occlusion_exponent)p[id]=1;","if(typeof t==='string'&&e.sound==='grass'&&!e.isotropic&&!e.carried_textures&&!e.ambient_occlusion_exponent)p[id]=1;if(/^(?:sapling|(?:[a-z_]+_)?sapling|(?:[a-z_]+_)?propagule|tallgrass|short_grass|tall_grass|fern|large_fern|deadbush|dead_bush|double_plant|yellow_flower|red_flower|dandelion|poppy|blue_orchid|allium|azure_bluet|(?:red|orange|white|pink)_tulip|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|open_eyeblossom|closed_eyeblossom|sunflower|lilac|rose_bush|peony|pitcher_plant|pink_petals|wildflowers|cactus_flower|(?:[a-z_]+_)?bush|brown_mushroom|red_mushroom|(?:crimson|warped)_(?:fungus|roots)|nether_sprouts|hanging_roots|spore_blossom|wheat|carrots|potatoes|beetroot|beetroots|nether_wart|(?:attached_)?(?:melon|pumpkin)_stem|torchflower_crop|pitcher_crop|reeds|sugar_cane|seagrass|sea_pickle|kelp|(?:dead_)?(?:tube|brain|bubble|fire|horn)_coral(?:_wall_fan|_fan)?|coral_fan(?:_dead|_hang\\d?)?|coral|coral_plant(?:_[a-z_]+)?|(?:small|medium|large)_amethyst_bud|amethyst_cluster|web|cobweb|cave_vines(?:_body_with_berries|_head_with_berries)?|weeping_vines|twisting_vines)$/.test(id))p[id]=1;"]];
(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var S=256,PAGE=60,MAX=6;
var pv={},pickName='',curDoc=null,savedY=0,queue=[],active=0,imgCache={},lastPackSig=null;
var st3=null,mode3d=null,fail3=0,setLab=function(){};
var SH={
  cube:{parts:[[1,1,1,0,0,0]],shift:0},
  slab:{parts:[[1,.5,1,0,-.25,0]],shift:.25},
  stairs:{parts:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],shift:0},
  wall:{parts:[[.5,1,.5,0,0,0],[1,.875,.25,0,-.0625,0]],shift:0},
  fence:{parts:[[.25,1,.25,0,0,0],[1,.1875,.125,0,-.03125,0],[1,.1875,.125,0,.34375,0]],shift:0},
  gate:{parts:[[.125,.6875,.125,-.4375,.15625,0],[.125,.6875,.125,.4375,.15625,0],[.75,.1875,.125,0,-.03125,0],[.75,.1875,.125,0,.34375,0]],shift:0},
  button:{parts:[[.375,.125,.25,0,-.4375,0]],shift:.4},
  plate:{parts:[[.875,.0625,.875,0,-.46875,0]],shift:.45},
  trapdoor:{parts:[[1,.1875,1,0,-.40625,0]],shift:.4},
candle:{parts:[[.125,.375,.125,0,-.3125,0]],shift:0},
carpet:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
rail:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
decal:{parts:[[1,1,.0625,0,0,-.46875]],shift:0}
};
var CSS='#list{display:none!important}'+
'#fkGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}'+
'.fkc{position:relative;display:flex;flex-direction:column;padding:0;min-height:0;overflow:hidden;background:var(--panel);border:1px solid var(--line);border-radius:10px;color:var(--ink);cursor:pointer;text-align:center}'+
'.fkp{width:100%;aspect-ratio:1/1;background:repeating-conic-gradient(#7e7e7e 0 25%,#8c8c8c 0 50%) 0 0/16px 16px}'+
'.fkp img{display:block;width:100%;height:100%;image-rendering:auto}'+
'.fkn{padding:5px 4px 6px;font-size:11px;line-height:1.25;height:2.9em;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
'.fkm{position:absolute;top:4px;right:6px;color:#e0b030;font-size:14px;line-height:1;text-shadow:0 0 3px #000}'+
'#fkEmpty{grid-column:1/-1;padding:16px 4px;text-align:center;color:var(--mute)}'+
'#fkLab{font-size:11px;color:var(--mute);margin:4px 0 0}'+
'#fkMore{height:1px}';
function pump(){while(active<MAX&&queue.length){var j=queue.shift();active++;j().then(fin,fin)}}
function fin(){active--;pump()}
function enqueue(j){queue.push(j);pump()}
function need(shape){
  if(shape==='plant')return ['up'];
  if(shape==='azalea')return ['plant','north','up'];
  if(shape==='beacon')return ['down','up','east'];
  if(shape==='door')return ['down','north'];
  return ['up','down','north','south','east','west'];
}
function packData(){
  try{var d=JSON.parse(localStorage.getItem('fk070_packs'));return (d&&d.packs&&d.packs.filter(function(x){return x.id===d.active})[0])||null}catch(e){return null}
}
function packMap(){var p=packData(),m={};if(p)p.textures.forEach(function(t){if(t.data)m['textures/'+t.path]=t.data});return m}
function packSig(m){return Object.keys(m).sort().map(function(k){return k+':'+m[k].length}).join('|')}
function getImg(d,ctx,path){
  var f=ctx.files&&ctx.files[path];
  if(f&&f.data)return new Promise(function(ok){var im=new d.defaultView.Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=f.data});
  if(!imgCache[path])imgCache[path]=ctx.load(path).then(function(im){if(!im)delete imgCache[path];return im});
  return imgCache[path];
}
function init3(d){
  var T=d.defaultView.THREE;if(!T)return null;
  try{
    var cv=d.createElement('canvas');
    var r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});
    r.setPixelRatio(1);r.setSize(S,S,false);r.setClearColor(0x000000,0);
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(35,1,.1,50);
    cam.position.set(0,0,4.4);cam.lookAt(0,0,0);
    sc.add(new T.AmbientLight(0xffffff,.75));
    var dl=new T.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);sc.add(dl);
    var g=new T.Group();g.rotation.set(.45,-.7,0);sc.add(g);
    var o={T:T,r:r,sc:sc,cam:cam,g:g,cv:cv,edge:new T.LineBasicMaterial({color:0x9aa0a6}),hidden:new T.MeshBasicMaterial({visible:false})};
    cv.addEventListener('webglcontextlost',function(e){e.preventDefault();mode3d=false;setLab()});
    return o;
  }catch(e){return null}
}
function semi(c){
  var a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(var i=3;i<a.length;i+=4){var v=a[i];if(v>8&&v<248)return true}
  return false;
}
function snap3d(o,shape,im,dbl){
  var T=o.T,g=o.g,mats={},tex=[],geos=[];
  function matOf(key,canvas){
    if(mats[key])return mats[key];
    var c=canvas||im[key];if(!c)return null;
    var t=new T.CanvasTexture(c);t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
    var m=new T.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?T.DoubleSide:T.FrontSide,map:t});
    m.depthWrite=!semi(c);tex.push(t);mats[key]=m;return m;
  }
  function box(w,h,d,x,y,z,ids,ys,vs){
    var ge=new T.BoxGeometry(w,h,d),p=ge.attributes.position,n=ge.attributes.normal,uv=ge.attributes.uv;
    ys=ys||0;vs=vs||1;
    for(var i=0;i<p.count;i++){
      var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
      if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
      else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
      else{u=X+.5;v=ny>0?.5-Z:Z+.5}
      uv.setXY(i,u,v);
    }
    ids=ids||['east','west','up','down','south','north'];
    var m=new T.Mesh(ge,ids.map(function(k){return k===null?o.hidden:(matOf(k)||o.hidden)}));
    m.add(new T.LineSegments(new T.EdgesGeometry(ge),o.edge));
    m.position.set(x,y,z);geos.push(ge);return m;
  }
  function plane(key,h,y,ry){
    var ge=new T.PlaneGeometry(Math.SQRT2,h),m=new T.Mesh(ge,matOf(key)||o.hidden);
    m.position.y=y;m.rotation.y=ry;geos.push(ge);return m;
  }
  if(shape==='plant'||shape==='azalea'){
    var st=shape==='azalea'?'plant':'up';
    g.add(plane(st,1,0,Math.PI/4));g.add(plane(st,1,0,-Math.PI/4));
    if(shape==='azalea')g.add(box(1,1,1,0,0,0,['north','north','up',null,'north','north']));
  }else if(shape==='beacon'){
    g.add(box(.75,.1875,.75,0,-.40625,0,['down','down','down','down','down','down']));
    g.add(box(.625,.625,.625,0,0,0,['up','up','up','up','up','up']));
    g.add(box(1,1,1,0,0,0,['east','east','east','east','east','east']));
  }else if(shape==='door'){
    var L=im.down,U=im.north;
    if(!L||!U)throw new Error('door');
    var R2=Math.max(L.width,U.width),dc=o.cv.ownerDocument.createElement('canvas');
    dc.width=R2;dc.height=R2*2;var dg=dc.getContext('2d');dg.imageSmoothingEnabled=false;
    dg.drawImage(U,0,0,U.width,U.height,0,0,R2,R2);dg.drawImage(L,0,0,L.width,L.height,0,R2,R2,R2);
    matOf('__door',dc);
    var dd=['__door','__door','__door','__door','__door','__door'];
    g.add(box(1,2,.1875,0,0,-.40625,dd,-.5,.5));
  }else{
    var sh=SH[shape]||SH.cube;
    sh.parts.forEach(function(a){var bm=box(a[0],a[1],a[2],a[3],a[4],a[5],shape==='rail'?['east','west','down','down','south','north']:undefined);if(shape==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}g.add(bm)});
    if(shape==='candle'){var wmt=matOf('east');if(wmt){[.7853981633974483,-.7853981633974483].forEach(function(ry){var pg=new T.PlaneGeometry(.125,.125),pu=pg.attributes.uv;for(var j=0;j<pu.count;j++){pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125)}var pm=new T.Mesh(pg,wmt);pm.position.y=-.0625;pm.rotation.y=ry;geos.push(pg);g.add(pm)})}}
    if(sh.shift)g.children.forEach(function(mm){mm.position.y+=sh.shift});
  }
  var url=null;
  try{o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png')}
  finally{
    while(g.children.length)g.remove(g.children[0]);
    geos.forEach(function(x){x.dispose()});
    Object.keys(mats).forEach(function(k){mats[k].dispose()});
    tex.forEach(function(t){t.dispose()});
  }
  return url;
}
function makePreview(d,ctx,id){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  var shape=ctx.shapeFor(id),keys=need(shape);
  return Promise.all(keys.map(function(k){return fm[k]?getImg(d,ctx,fm[k]):null})).then(function(arr){
    var R=0;arr.forEach(function(im){if(im&&im.width>R)R=im.width});
    if(!R)return null;
    var norm={};
    keys.forEach(function(k,i){
      var im=arr[i];if(!im)return;
      var c=d.createElement('canvas');c.width=c.height=R;
      var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,R,R);
      norm[k]=c;
    });
    if(mode3d===null){
      var forced2d=/[?&]p2d=1/.test(String(location.search||''));
      st3=forced2d?null:init3(d);mode3d=!!st3;setLab();
    }
    if(mode3d&&st3){
      try{
        var dbl=/leaves/.test(id)||shape==='plant'||shape==='azalea'||shape==='candle';
        var u3=snap3d(st3,shape,norm,dbl);
        if(u3&&u3.length>200)return u3;
      }catch(e){fail3++;if(fail3>=3){mode3d=false;setLab()}}
    }
    var cv=d.createElement('canvas');cv.width=cv.height=S;
    ctx.drawBlock(cv,shape,function(k){return norm[k]},R,S);
    try{return cv.toDataURL('image/png')}catch(e){return null}
  });
}
function ctxNow(d){try{var a=d.defaultView.FKAPI;return (a&&a.grid)?a.grid():null}catch(e){return null}}
function applyPack(d){
  var c=ctxNow(d);if(!c||!c.setPack)return;
  var m=packMap(),sg=packSig(m);
  if(sg===lastPackSig)return;
  lastPackSig=sg;
  c.setPack(m);pv={};
  if(d.__fkRender)d.__fkRender();
}
function discardEdits(d){
  var c=ctxNow(d);if(!c||!c.setPack)return;
  if(c.discard)c.discard();
  var m=packMap();lastPackSig=packSig(m);
  c.setPack(m);pv={};
  if(d.__fkRender)d.__fkRender();
}
function showFrame(d){try{d.defaultView.frameElement.style.visibility='visible'}catch(e){}}
function attach(d){
  if(d.__fkGrid){showFrame(d);return}
  var list=d.querySelector('#list'),qi=d.querySelector('#q');
  if(!list||!qi)return;
  d.__fkGrid=true;curDoc=d;
  try{localStorage.removeItem('foundrykin.project.v4');localStorage.removeItem('foundrykin.project.v3')}catch(e){}
  var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
  var lab=d.createElement('div');lab.id='fkLab';qi.parentNode.insertBefore(lab,qi.nextSibling);
  setLab=function(){lab.textContent=mode3d===null?'':(mode3d?'Превью: 3D-снимок':'Превью: 2D (запасной режим)');window.FKG.mode=mode3d===null?'?':(mode3d?'3d':'2d')};
  var box=d.createElement('div');box.id='fkGrid';
  var more=d.createElement('div');more.id='fkMore';
  list.parentNode.insertBefore(box,list.nextSibling);
  box.parentNode.insertBefore(more,box.nextSibling);
  var w=d.defaultView,ids=[],shown=0,lastCat=null,lastSig='',migrated=null;
  var obs=new w.IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
  var mobs=new w.IntersectionObserver(function(es){if(es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
  function paint(card){
    var c=ctxNow(d);if(!c||!c.catalog)return;
    var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=d.defaultView.FKAPI.edits||0,e=pv[id];
    if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
    enqueue(function(){
      if(!card.isConnected)return Promise.resolve();
      return makePreview(d,c,id).then(function(u){if(u)pv[id]={u:u,ed:ed,e:edits};if(card.isConnected)setImg(card,u)},function(){});
    });
  }
  function setImg(card,u){var im=card.querySelector('img');if(im&&u)im.src=u}
  function mkCard(c,id){
    var b=d.createElement('button');b.type='button';b.className='fkc';b.setAttribute('data-id',id);
    var p=d.createElement('div');p.className='fkp';p.appendChild(d.createElement('img'));
    var n=d.createElement('div');n.className='fkn';n.textContent=id.replace(/_/g,' ');
    b.appendChild(p);b.appendChild(n);
    if(c.edited(id)){var m=d.createElement('span');m.className='fkm';m.textContent='\u25cf';b.appendChild(m)}
    return b;
  }
  function addPage(){
    var c=ctxNow(d);if(!c||!c.catalog)return;
    var end=Math.min(shown+PAGE,ids.length);
    for(var i=shown;i<end;i++){var k=mkCard(c,ids[i]);box.appendChild(k);obs.observe(k)}
    shown=end;
  }
  function render(){
    var c=ctxNow(d);
    box.innerHTML='';mobs.unobserve(more);shown=0;
    if(!c||!c.catalog){var m0=d.createElement('div');m0.id='fkEmpty';m0.textContent='Каталог блоков загружается\u2026';box.appendChild(m0);ids=[];return}
    if(migrated!==c.catalog){migrated=c.catalog;try{if(window.FKAPP)window.FKAPP.migrate(c)}catch(e){}}
    var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
    ids=c.catalog.ids.filter(function(id){return !qv||id.indexOf(qv)>=0});
    lastCat=c.catalog;lastSig=sig(c);
    if(!ids.length){var m1=d.createElement('div');m1.id='fkEmpty';m1.textContent='Ничего не найдено';box.appendChild(m1);return}
    addPage();mobs.observe(more);
  }
  d.__fkRender=render;
  function sig(c){return Object.keys(c.dirty||{}).length+'|'+(d.defaultView.FKAPI.edits||0)}
  function refresh(c){
    Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){
      var id=k.getAttribute('data-id'),ed=!!c.edited(id),m=k.querySelector('.fkm');
      if(ed&&!m){m=d.createElement('span');m.className='fkm';m.textContent='\u25cf';k.appendChild(m)}
      if(!ed&&m)k.removeChild(m);
      paint(k);
    });
  }
  var tmr=null;
  qi.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,150)});
  box.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.fkc'):null;if(!b)return;
    var c=ctxNow(d);if(!c)return;
    pickName=b.getAttribute('data-id');
    c.select(pickName);
    if(typeof FKE!=='undefined')FKE.setMode('edit');
  });
  var poll=setInterval(function(){
    try{
      if(curDoc!==d||!d.defaultView){clearInterval(poll);return}
      if(typeof FKE!=='undefined'&&FKE.getMode()!=='search')return;
      var c=ctxNow(d);if(!c)return;
      if(c.catalog!==lastCat){render();return}
      if(sig(c)!==lastSig){lastSig=sig(c);refresh(c)}
    }catch(e){clearInterval(poll)}
  },700);
  applyPack(d);
  render();
  showFrame(d);
}
function watch(f){
  var n=0;
  (function p(){
    var d=null;try{d=f.contentDocument}catch(e){}
    if(d&&d.__fkTidy&&ctxNow(d)){attach(d);return}
    if(++n<240)setTimeout(p,500);
  })();
}
if(typeof PATCHES!=='undefined'){
  NEWPATCHES.forEach(function(p){PATCHES.push(p)});
}
if(typeof FKE!=='undefined'){
  var oo=FKE.open;
  FKE.open=function(f,u,cb){
    f.style.visibility='hidden';cb=cb||{};var oe=cb.onError;
    cb.onError=function(x){f.style.visibility='visible';if(oe)oe(x)};
    var r=oo.call(FKE,f,u,cb);
    watch(f);
    try{var d0=f.contentDocument;if(d0&&d0.__fkGrid)applyPack(d0)}catch(e){}
    setTimeout(function(){if(f.style.visibility==='hidden')f.style.visibility='visible'},4000);
    return r;
  };
  var oc=FKE.current;FKE.current=function(){if(pickName){if(FKE.busy())return pickName;pickName=''}return oc.call(FKE)};
  FKE.objInfo=function(){var d=curDoc;if(!d)return null;var c=ctxNow(d);return (c&&c.obj)?c.obj():null};
  var oe2=FKE.editTexture;
  FKE.editTexture=function(path,data,cb){
    cb=cb||{};
    var p=packData(),e=p&&p.textures.filter(function(t){return t.path===path})[0],obj=e&&e.obj;
    if(!obj)return oe2.call(FKE,path,data,cb);
    var n=0;
    (function wait(){
      var d=curDoc,c=d&&ctxNow(d);
      if(c&&c.catalog){
        if(!c.catalog.b[obj]){oe2.call(FKE,path,data,cb);return}
        applyPack(d);
        try{d.defaultView.FKAPI.want='textures/'+path}catch(er){}
        pickName=obj;c.select(obj);FKE.setMode('edit');return;
      }
      if(++n<80)setTimeout(wait,300);
      else if(cb.onFail)cb.onFail('Каталог блоков не загрузился');
    })();
  };
  var os=FKE.setMode;
  FKE.setMode=function(m){
    var d=curDoc,prev=FKE.getMode();
    if(d&&m==='edit'&&prev==='search'){try{savedY=d.defaultView.scrollY}catch(e){}}
    os.call(FKE,m);
    if(d&&m==='search'&&prev==='edit')discardEdits(d);
    if(d&&m==='search'&&prev==='edit'&&savedY){setTimeout(function(){try{d.defaultView.scrollTo(0,savedY)}catch(e){}},30)}
  };
}
window.FKG={version:VERSION,mode:'?'};
})();
