
(function(){
var FK=window.FK;
function tt(k,p){return FK.t(k,p)}
var res=16, shape='cube', tool='pen', color='#c0392b';
var slots=[], slot=null, faceMap={}, cv={}, tex={}, mats={}, undoS={}, redoS={}, ph={}, applyGen=0, hiddenMat=null;
var files={}, cur='', dirty={}, catalog=null, existing=null, shapeKeys=['cube'];
var FACES=['up','down','north','south','east','west'];
var FN={up:'face.up',down:'face.down',north:'face.north',south:'face.south',east:'face.east',west:'face.west'};
var SHAPES={
  cube:{parts:[[1,1,1,0,0,0]],shift:0},
  slab:{parts:[[1,.5,1,0,-.25,0]],shift:.25},
  stairs:{parts:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],shift:0},
  wall:{parts:[[.5,1,.5,0,0,0],[1,.875,.25,0,-.0625,0]],shift:0},
  fence:{parts:[[.25,1,.25,0,0,0],[1,.1875,.125,0,-.03125,0],[1,.1875,.125,0,.34375,0]],shift:0},
  gate:{parts:[[.125,.6875,.125,-.4375,.15625,0],[.125,.6875,.125,.4375,.15625,0],[.75,.1875,.125,0,-.03125,0],[.75,.1875,.125,0,.34375,0]],shift:0},
  button:{parts:[[.375,.125,.25,0,-.4375,0]],shift:.4},
  plate:{parts:[[.875,.0625,.875,0,-.46875,0]],shift:.45},
  trapdoor:{parts:[[1,.1875,1,0,-.40625,0]],shift:.4},
  door:{},
  plant:{},
  azalea:{},
  beacon:{},
  candle:{parts:[[.125,.375,.125,0,-.3125,0]],shift:0},
  carpet:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  rail:{parts:[[1,.0625,1,0,-.46875,0]],shift:.45},
  decal:{parts:[[1,1,.0625,0,0,-.46875]],shift:0}
};
var ALL_SHAPES=['cube','slab','stairs','wall','fence','gate','button','plate'];
var $=function(s){return document.querySelector(s)};
var ed=$('#ed'), ectx=ed.getContext('2d');

var listeners=[];
var S={status:'loading',source:'',count:0,filtered:true,refreshing:false,refreshFailed:'',error:null,errors:[],info:null,message:null};
function emit(){listeners.forEach(function(f){try{f(S)}catch(e){}})}
function showErr(code,detail){
  var last=S.errors[S.errors.length-1];detail=detail||'';
  if(last&&last.code===code&&last.detail===detail)return;
  S.errors.push({code:code,detail:detail});if(S.errors.length>3)S.errors.shift();emit();
}
window.addEventListener('error',function(e){showErr('script',(e.message||'')+(e.lineno?' @'+e.lineno:''))});
window.addEventListener('unhandledrejection',function(e){showErr('promise',(e.reason&&e.reason.message)||String(e.reason))});
function say(key,p){S.message=key?{key:key,params:p||{}}:null;$('#msg').textContent=key?tt(key,p):'';emit()}
function rnd(x,y,s){var h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)}
function placeholder(g,r){
  for(var y=0;y<r;y++)for(var x=0;x<r;x++){var v=118+Math.round(rnd(Math.floor(x*16/r),Math.floor(y*16/r),5)*50);g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,y,1,1)}
}
function ctxOf(k){return cv[k].getContext('2d')}

function shapeOfId(id){
  if(/_trapdoor$/.test(id))return 'trapdoor';
  return 'cube';
}
function isDoorBlock(m){return !!(catalog&&catalog.sp&&catalog.sp[m]&&catalog.sp[m].kind==='door')}
function modelOf(m){
  if(m==='beacon')return 'beacon';
  if(m==='azalea'||m==='flowering_azalea')return 'azalea';
  return (catalog&&catalog.p&&catalog.p[m])?'plant':null;
}
function shapeKeysFor(m,grp){
  if(isDoorBlock(m))return ['door'];
  if(/(^|_)candle$/.test(m))return ['candle'];if(/(^|_)carpet$/.test(m)||m==='waterlily'||m==='leaf_litter'||m==='frog_spawn')return ['carpet'];if(/(^|_)rail$/.test(m))return ['rail'];if(m==='vine'||m==='glow_lichen'||m==='sculk_vein'||m==='resin_clump')return ['decal'];var mo=modelOf(m);if(mo)return (mo==='beacon'||mo==='azalea')?[mo]:[mo,'cube'];
  if(/_trapdoor$/.test(m))return ['trapdoor'];
  var ks=['cube'],f=catalog.forms&&catalog.forms[m];
  if(f)Object.keys(f).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.sort(function(a,b){return ALL_SHAPES.indexOf(a)-ALL_SHAPES.indexOf(b)});
  return ks;
}

/* 3D (WebGL) */
var stage=$('#stage'),W=stage.clientWidth||360;
var gl=(typeof THREE!=='undefined'),renderer=null,scene=null,cam=null,group=null,frames=0;
if(!gl)showErr('three_missing');
if(gl){
  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,W);stage.insertBefore(renderer.domElement,stage.firstChild);
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(35,1,.1,50);cam.position.set(0,0,3.9);cam.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffffff,.75));var dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);scene.add(dl);
    hiddenMat=new THREE.MeshBasicMaterial({visible:false});
    group=new THREE.Group();group.rotation.set(.45,-.7,0);scene.add(group);
  }catch(err){gl=false;renderer=null;showErr('webgl_unavailable',err.message)}
}
function texBuf(id){
  var n=res,d=ctxOf(id).getImageData(0,0,n,n).data,buf=new Uint8Array(n*n*4),semi=false;
  for(var y=0;y<n;y++){var s=y*n*4,t=(n-1-y)*n*4;for(var x=0;x<n*4;x++){var v=d[s+x];buf[t+x]=v;if((x&3)===3&&v>8&&v<248)semi=true}}
  return {buf:buf,semi:semi};
}
function makeTex(id){
  if(!gl)return null;
  var r=texBuf(id),n=res;
  var tx=new THREE.DataTexture(r.buf,n,n,THREE.RGBAFormat);
  tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.needsUpdate=true;tx.userData={semi:r.semi};return tx;
}
function refreshDoor(){
  if(!gl||!mats.__door)return;
  if(shape!=='door')return;
  var L=faceMap.down,U=faceMap.north;
  if(!cv[L]||!cv[U])return;
  var n=res,a=texBuf(L),b=texBuf(U),buf=new Uint8Array(n*n*8);
  buf.set(a.buf,0);buf.set(b.buf,n*n*4);
  if(tex.__door)tex.__door.dispose();
  var tx=new THREE.DataTexture(buf,n,2*n,THREE.RGBAFormat);
  tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.needsUpdate=true;
  tex.__door=tx;mats.__door.map=tx;mats.__door.depthWrite=!(a.semi||b.semi);mats.__door.needsUpdate=true;
}
function refreshTex(id){
  if(!gl||!cv[id]||!mats[id])return;
  if(tex[id])tex[id].dispose();
  tex[id]=makeTex(id);mats[id].map=tex[id];mats[id].depthWrite=!tex[id].userData.semi;mats[id].needsUpdate=true;
  refreshDoor();
}
function rebuildTextures(){slots.forEach(function(s){refreshTex(s.id)});refreshDoor()}
function box(w,h,d,x,y,z,ids,ys,vs){
  var g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  ys=ys||0;vs=vs||1;
  for(var i=0;i<p.count;i++){
    var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
    if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
    else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
    else if(vs!==1){var th=(Z-z+d/2)/d;u=X+.5;v=ny>0?1-.09375*th:.09375*th}
    else{u=X+.5;v=ny>0?.5-Z:Z+.5}
    uv.setXY(i,u,v);
  }
  var f=faceMap;
  ids=ids||[f.east,f.west,f.up,f.down,f.south,f.north];
  var m=new THREE.Mesh(g,ids.map(function(k){return k===null?hiddenMat:mats[k]}));
  m.position.set(x,y,z);return m;
}
function plane(id,h,y,ry){
  var m=new THREE.Mesh(new THREE.PlaneGeometry(Math.SQRT2,h),mats[id]);
  m.position.y=y;m.rotation.y=ry;return m;
}
function buildPlant(){
  var st=shape==='azalea'?faceMap.plant:faceMap.up;
  group.add(plane(st,1,0,Math.PI/4));group.add(plane(st,1,0,-Math.PI/4));
  if(shape==='azalea'){var t=faceMap.up,s=faceMap.north;group.add(box(1,1,1,0,0,0,[s,s,t,null,s,s]))}
}
function buildBeacon(){
  var f=faceMap,g=f.east,b=f.down,c=f.up;
  group.add(box(.75,.1875,.75,0,-.40625,0,[b,b,b,b,b,b]));
  group.add(box(.625,.625,.625,0,0,0,[c,c,c,c,c,c]));
  group.add(box(1,1,1,0,0,0,[g,g,g,g,g,g]));
}
function buildDoor(){
  var D='__door',d6=[D,D,D,D,D,D];
  refreshDoor();
  group.add(box(1,2,.1875,0,0,-.40625,d6,-.5,.5));
}
function build(){
  if(gl){
    while(group.children.length)group.remove(group.children[0]);
    if(!slots.length)return;
    if(shape==='plant'||shape==='azalea')buildPlant();
    else if(shape==='beacon')buildBeacon();
    else if(shape==='door')buildDoor();
    else{
      var d=SHAPES[shape]||SHAPES.cube;
      d.parts.forEach(function(a){var bm=box.apply(null,shape==='rail'?a.concat([[faceMap.east,faceMap.west,(slot===faceMap.up?faceMap.up:faceMap.down),(slot===faceMap.up?faceMap.up:faceMap.down),faceMap.south,faceMap.north]]):a);if(shape==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}group.add(bm)});if(shape==='candle'){var wid=faceMap.east,wm=mats[wid];if(wm){wm.side=THREE.DoubleSide;wm.needsUpdate=true;[.7853981633974483,-.7853981633974483].forEach(function(ry){var pg=new THREE.PlaneGeometry(.125,.125),pu=pg.attributes.uv;for(var j=0;j<pu.count;j++){pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125)}var pm=new THREE.Mesh(pg,wm);pm.position.y=-.0625;pm.rotation.y=ry;group.add(pm)})}}
      if(d.shift)group.children.forEach(function(m){m.position.y+=d.shift});
    }
  }
}
var drag=null,idle=true,lastT=0;
stage.addEventListener('pointerdown',function(e){if(!gl)return;drag={x:e.clientX,y:e.clientY};idle=false;stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',function(e){if(!drag)return;group.rotation.y+=(e.clientX-drag.x)*.01;group.rotation.x=Math.max(-1.4,Math.min(1.4,group.rotation.x+(e.clientY-drag.y)*.01));drag={x:e.clientX,y:e.clientY}});
function endDrag(){drag=null;setTimeout(function(){if(!drag)idle=true},2500)}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(t){
  requestAnimationFrame(loop);
  if(!gl)return;
  if(!isFinite(group.rotation.x)||!isFinite(group.rotation.y))group.rotation.set(.45,-.7,0);
  if(idle&&!reduce&&isFinite(t))group.rotation.y+=Math.min(100,(t-lastT))*.0004;
  if(isFinite(t))lastT=t;
  try{renderer.render(scene,cam);frames++}catch(err){showErr('render',err.message)}
}
addEventListener('resize',function(){if(!gl)return;var w=stage.clientWidth;if(w)renderer.setSize(w,w)});

/* slots */
function slotsOf(p){
  var order=[],map={};
  FACES.forEach(function(f,i){var path=p[i];if(!map[path]){map[path]=[];order.push(path)}map[path].push(f)});
  var list=order.map(function(path){
    var fs=map[path],sides=['north','south','east','west'].filter(function(x){return fs.indexOf(x)>=0}),names=[];
    var hasUp=fs.indexOf('up')>=0,hasDown=fs.indexOf('down')>=0;
    if(hasUp&&hasDown&&sides.length===4)return {id:path,k:['slot.all']};
    if(hasUp)names.push('slot.top');
    if(hasDown)names.push('slot.bottom');
    if(sides.length===4)names.push('slot.side');else sides.forEach(function(s){names.push(FN[s])});
    return {id:path,k:names};
  });
  var fm={};FACES.forEach(function(f,i){fm[f]=p[i]});
  return {list:list,fm:fm};
}
function slotsFor(m){
  if(catalog.sp&&catalog.sp[m])return {list:catalog.sp[m].list,fm:catalog.sp[m].fm};
  var so=slotsOf(catalog.b[m]),cp=catalog.cr&&catalog.cr[m];
  if(cp&&!so.list.some(function(s){return s.id===cp}))so.list.push({id:cp,k:['slot.carried'],carried:true});
  return so;
}
function pathsFor(m){
  if(catalog.sp&&catalog.sp[m])return catalog.sp[m].list.map(function(s){return s.id});
  var o=[];catalog.b[m].forEach(function(x){if(o.indexOf(x)<0)o.push(x)});var q=catalog.cr&&catalog.cr[m];if(q&&o.indexOf(q)<0)o.push(q);return o;
}
function setupSlots(list,fm){
  applyGen++;
  Object.keys(tex).forEach(function(k){if(tex[k])tex[k].dispose()});
  Object.keys(mats).forEach(function(k){if(mats[k])mats[k].dispose()});
  tex={};mats={};cv={};undoS={};redoS={};ph={};
  slots=list;faceMap=fm;
  var dbl=/leaves/.test(cur)||modelOf(cur)==='plant'||modelOf(cur)==='azalea';
  list.forEach(function(s){
    cv[s.id]=document.createElement('canvas');cv[s.id].width=cv[s.id].height=res;
    undoS[s.id]=[];redoS[s.id]=[];
    if(gl)mats[s.id]=new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?THREE.DoubleSide:THREE.FrontSide});
  });
  if(gl)mats.__door=new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:THREE.FrontSide});
  slot=list[0].id;
  buildSlotUi();
}
function buildSlotUi(){
  var boxEl=$('#slots');boxEl.innerHTML='';
  slots.forEach(function(s){
    var b=document.createElement('button');b.textContent=s.k?s.k.map(function(x){return tt(x)}).join(' + '):s.label;b.dataset.id=s.id;
    if(s.id===slot)b.className='on';
    b.onclick=function(){setSlot(s.id)};boxEl.appendChild(b);
  });
  boxEl.style.display=slots.length>1?'flex':'none';
}
function setSlot(id){
  if(!cv[id])return;slot=id;
  $('#slots').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});
  drawEd();
  if(shape==='rail')build();
  if(slots.some(function(s){return s.carried})){var so=slotsFor(cur),isC=slots.some(function(s){return s.carried&&s.id===id}),nf={};if(isC){Object.keys(faceMap).forEach(function(k){nf[k]=id});faceMap=nf}else faceMap=so.fm;build()}
}

/* history */
function snap(k){return ctxOf(k).getImageData(0,0,res,res)}
function pushUndo(){var s=undoS[slot];s.push(snap(slot));if(s.length>60)s.shift();redoS[slot]=[];updHist()}
function doUndo(){var s=undoS[slot];if(!s||!s.length)return;redoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function doRedo(){var s=redoS[slot];if(!s||!s.length)return;undoS[slot].push(snap(slot));ctxOf(slot).putImageData(s.pop(),0,0);touched()}
function updHist(){$('#undo').disabled=!(undoS[slot]&&undoS[slot].length);$('#redo').disabled=!(redoS[slot]&&redoS[slot].length)}
function resetHist(){slots.forEach(function(s){undoS[s.id]=[];redoS[s.id]=[]});updHist()}

/* editor */
function drawEd(){ed.width=ed.height=res;ed.style.backgroundSize=(200/res)+'% '+(200/res)+'%';ectx.clearRect(0,0,res,res);if(cv[slot])ectx.drawImage(cv[slot],0,0);updHist()}
function touched(){
  dirty[slot]=true;delete ph[slot];API.edits++;
  refreshTex(slot);drawEd();
}
function cell(e){
  var r=ed.getBoundingClientRect();
  return {x:Math.floor((e.clientX-r.left)/r.width*res),y:Math.floor((e.clientY-r.top)/r.height*res)};
}
function inb(p){return p.x>=0&&p.y>=0&&p.x<res&&p.y<res}
function dot(g,x,y){if(x<0||y<0||x>=res||y>=res)return;if(tool==='erase')g.clearRect(x,y,1,1);else{g.fillStyle=color;g.fillRect(x,y,1,1)}}
function line(g,a,b){
  var x0=a.x,y0=a.y,x1=b.x,y1=b.y,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx+dy;
  for(var n=0;n<512;n++){dot(g,x0,y0);if(x0===x1&&y0===y1)break;var e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}
}
function hexRgba(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255,255]}
function floodFill(p){
  var g=ctxOf(slot),img=g.getImageData(0,0,res,res),d=img.data,t=hexRgba(color);
  function at(x,y){return (y*res+x)*4}
  var i0=at(p.x,p.y),s=[d[i0],d[i0+1],d[i0+2],d[i0+3]];
  if(s[0]===t[0]&&s[1]===t[1]&&s[2]===t[2]&&s[3]===t[3])return;
  var st=[[p.x,p.y]];
  while(st.length){
    var q=st.pop(),x=q[0],y=q[1];if(x<0||y<0||x>=res||y>=res)continue;
    var i=at(x,y);if(d[i]!==s[0]||d[i+1]!==s[1]||d[i+2]!==s[2]||d[i+3]!==s[3])continue;
    d[i]=t[0];d[i+1]=t[1];d[i+2]=t[2];d[i+3]=t[3];
    st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  g.putImageData(img,0,0);
}
function pickAt(p){
  var d=ctxOf(slot).getImageData(p.x,p.y,1,1).data;if(!d[3])return;
  var h='#'+[d[0],d[1],d[2]].map(function(v){return ('0'+v.toString(16)).slice(-2)}).join('');
  pickColor(h,false);
}
var down=false,last=null;
ed.addEventListener('pointerdown',function(e){
  var p=cell(e);if(!inb(p)||!cv[slot])return;
  e.preventDefault();ed.setPointerCapture(e.pointerId);
  if(tool==='pick'){pickAt(p);return}
  pushUndo();
  if(tool==='fill'){floodFill(p);touched();return}
  down=true;last=p;dot(ctxOf(slot),p.x,p.y);touched();
});
ed.addEventListener('pointermove',function(e){
  if(!down||!cv[slot])return;var p=cell(e);line(ctxOf(slot),last,p);last=p;touched();
});
function up(){down=false;last=null}
ed.addEventListener('pointerup',up);ed.addEventListener('pointercancel',up);

function seg(sel,attr,fn){$(sel).addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;
  $(sel).querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});fn(b.dataset[attr])})}
seg('#shapes','s',function(v){shape=v;build()});
seg('#tools','t',function(v){tool=v});
function setShapeUi(){$('#shapes').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.s===shape)})}
function updShapeUi(list){
  shapeKeys=list;
  var bx=$('#shapes');bx.innerHTML='';
  shapeKeys.forEach(function(k){var b=document.createElement('button');b.textContent=tt('shape.'+k);b.dataset.s=k;bx.appendChild(b)});
  if(shapeKeys.indexOf(shape)<0)shape=shapeKeys[0]||'cube';
  $('#shapesRow').style.display=shapeKeys.length>1?'flex':'none';
  setShapeUi();
}

function setRes(n){
  if(n===res)return;
  var old={};slots.forEach(function(s){var c=document.createElement('canvas');c.width=c.height=res;c.getContext('2d').drawImage(cv[s.id],0,0);old[s.id]=c});
  res=n;
  slots.forEach(function(s){cv[s.id].width=cv[s.id].height=res;var g=ctxOf(s.id);g.imageSmoothingEnabled=false;g.drawImage(old[s.id],0,0,res,res)});
  resetHist();rebuildTextures();drawEd();slots.forEach(function(s){dirty[s.id]=true});API.edits++;
}
function setResUi(){document.querySelectorAll('[data-r]').forEach(function(x){x.classList.toggle('on',+x.dataset.r===res)})}
document.querySelectorAll('[data-r]').forEach(function(b){b.addEventListener('click',function(){setRes(+b.dataset.r);setResUi()})});
$('#undo').onclick=doUndo;$('#redo').onclick=doRedo;

var pal=['#c0392b','#e67e22','#f1c40f','#3f7d4e','#2980b9','#8e44ad','#ffffff','#7f8c8d','#2c2c2c','#866043'];
var pe=$('#pal');
pal.forEach(function(c){var b=document.createElement('button');b.className='sw'+(c===color?' on':'');b.style.background=c;b.dataset.c=c;b.setAttribute('aria-label',c);
  b.onclick=function(){pickColor(c)};pe.appendChild(b)});
var ci=document.createElement('input');ci.type='color';ci.value=color;ci.oninput=function(){pickColor(ci.value,true)};pe.appendChild(ci);
function pickColor(c,fromInput){
  color=c;if(tool==='pick'||tool==='erase'){tool='pen';$('#tools').querySelectorAll('[data-t]').forEach(function(b){b.classList.toggle('on',b.dataset.t==='pen')})}
  pe.querySelectorAll('.sw').forEach(function(b){b.classList.toggle('on',b.dataset.c===c)});ci.value=c;
}
$('#file').onchange=function(e){
  var inp=e.target,f=inp.files[0];if(!f)return;var fr=new FileReader();
  fr.onload=function(){var img=new Image();
    img.onload=function(){if(!cv[slot])return;pushUndo();var g=ctxOf(slot);g.clearRect(0,0,res,res);g.imageSmoothingEnabled=false;g.drawImage(img,0,0,res,res);touched()};
    img.src=fr.result};
  fr.readAsDataURL(f);inp.value='';
};
$('#clr').onclick=function(){if(!cv[slot])return;pushUndo();ctxOf(slot).clearRect(0,0,res,res);touched()};

/* texture files */
function packCur(){
  slots.forEach(function(s){
    if(ph[s.id]||!cv[s.id])return;
    files[s.id]={res:res,data:cv[s.id].toDataURL('image/png')};
  });
}
function entryFor(list){
  var r=0,o={};
  list.forEach(function(s){var f=files[s.id];if(f){o[s.id]=f.data;if(f.res>r)r=f.res}});
  return {res:r||res,slots:o};
}
function applyEntry(e,done){
  var gen=++applyGen,list=slots,canv=cv,phNow=ph;
  res=e.res||16;setResUi();
  var left=list.length;
  function fin(){
    if(--left!==0)return;
    if(gen!==applyGen)return;
    rebuildTextures();drawEd();resetHist();if(done)done();
  }
  list.forEach(function(s){
    var c=canv[s.id];
    c.width=c.height=res;
    var src=e.slots&&e.slots[s.id];
    if(!src){placeholder(c.getContext('2d'),res);phNow[s.id]=true;fin();return}
    var img=new Image();
    img.onload=function(){if(gen===applyGen){var g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,res,res)}fin()};
    img.onerror=fin;img.src=src;
  });
}
/* Bedrock block catalog */
var CAT_KEY='foundrykin.catalog.v3',EX_KEY='foundrykin.exist.v2';
var lastB=null,lastT=null;
function catalogReady(src){
  S.status='ready';S.source=src;S.count=catalog.ids.length;S.filtered=!!catalog.filtered;
  S.refreshing=false;S.refreshFailed='';S.error=null;emit();
}
function catalogFailed(code,detail){
  S.status='failed';S.error={code:code,detail:detail||''};S.refreshing=false;emit();
}
function useCatalog(B,Tx,src){
  if(B)lastB=B;if(Tx)lastT=Tx;
  if(!lastB)return false;
  var c=FKCatalog.build(lastB,lastT);
  if(!Object.keys(c.b).length){
    if(catalog)say('msg.catalog_empty');
    else{S.status='empty';S.error=null;S.refreshing=false;emit()}
    return false;
  }
  try{localStorage.setItem(CAT_KEY,JSON.stringify({b:c.b,p:c.p}))}catch(err){}
  catalog=FKCatalog.index(c,existing);
  catalogReady(src);
  return true;
}
function loadCatalog(){
  var cached=null,cex=null;
  try{cached=JSON.parse(localStorage.getItem(CAT_KEY))}catch(err){}
  try{cex=JSON.parse(localStorage.getItem(EX_KEY))}catch(err){}
  if(cex&&cex.length){existing={};cex.forEach(function(p){existing[p]=1})}
  if(cached&&cached.b){catalog=FKCatalog.index(cached,existing);catalogReady('cache');S.refreshing=true;emit()}
  var eB='',eT='',eF='';
  Promise.all([
    FKCatalog.fetchJson(FKCatalog.URLS_B).catch(function(e){eB=e.message;return null}),
    FKCatalog.fetchJson(FKCatalog.URLS_T).catch(function(e){eT=e.message;return null}),
    FKCatalog.fetchExisting().catch(function(e){eF=e.message;return null})
  ]).then(function(r){
    if(r[2]){
      existing=r[2];
      try{localStorage.setItem(EX_KEY,JSON.stringify(Object.keys(existing).filter(function(p){return p.indexOf('textures/blocks/')===0||p.indexOf('textures/items/')===0})))}catch(err){}
    }else if(!existing)say('msg.files_list_failed',{detail:eF});
    if(!r[0]){
      if(!catalog)catalogFailed('catalog_fetch',eB);
      else{S.refreshing=false;S.refreshFailed=eB;emit()}
      return;
    }
    if(!r[1])say('msg.terrain_failed',{detail:eT});
    useCatalog(r[0],r[1],'network');
  });
}
$('#catfile').onchange=function(e){
  var inp=e.target,fl=[].slice.call(inp.files),left=fl.length,B=null,Tx=null;
  if(!left)return;
  fl.forEach(function(f){
    var fr=new FileReader();
    fr.onload=function(){
      try{var j=FKCatalog.parseLoose(fr.result);if(j&&j.texture_data)Tx=j;else B=j}catch(err){say('msg.file_not_json',{name:f.name,detail:err.message})}
      if(--left===0){if(!useCatalog(B,Tx,'file')&&!lastB&&!catalog)catalogFailed('catalog_no_blocks')}
    };
    fr.onerror=function(){if(--left===0)say('msg.file_unreadable')};
    fr.readAsText(f);
  });
  inp.value='';
};
function isEdited(id){return pathsFor(id).some(function(p){return dirty[p]})}
function setBlockInfo(id,m,note,mo){
  var grp=catalog.members[catalog.sig[m]],fo=catalog.forms&&catalog.forms[m];
  S.info={id:id,files:pathsFor(m),shared:grp.filter(function(x){return x!==m}),forms:fo?Object.keys(fo):[],note:note,kind:isDoorBlock(m)?'door':(mo||'shape')};
  emit();
}
function ensureFiles(m){
  var p=pathsFor(m),need=[];
  p.forEach(function(x){if(!files[x]&&need.indexOf(x)<0)need.push(x)});
  if(!need.length)return Promise.resolve({vanilla:true,missing:0,loaded:false});
  return Promise.all(need.map(FKCatalog.loadAny)).then(function(imgs){
    var first=imgs.filter(Boolean)[0],r=(first&&first.width===32)?32:16,miss=0,c=document.createElement('canvas');
    need.forEach(function(x,i){
      var im=imgs[i];
      if(!im){miss++;return}
      c.width=c.height=r;var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,r,r);
      files[x]={res:r,data:c.toDataURL('image/png')};
    });
    return {vanilla:!!first,missing:miss,loaded:true};
  });
}
var selTok=0;
function selectBlock(id){
  if(!catalog||!catalog.b[id])return;
  var m=catalog.mother[id],tok=++selTok,grp=catalog.members[catalog.sig[m]];
  var mo=modelOf(m),keysList=shapeKeysFor(m,grp);
  var want=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));
  var sh=keysList.indexOf(want)>=0?want:keysList[0];
  function go(note){
    if(tok!==selTok)return;
    packCur();cur=m;shape=sh;
    var so=slotsFor(m);setupSlots(so.list,so.fm);updShapeUi(keysList);
    applyEntry(entryFor(so.list),function(){build();setBlockInfo(id,m,note,mo);API.loaded(m)});
  }
  S.info=null;API.loading();
  ensureFiles(m).then(function(r){go(!r.vanilla?'gray':(r.missing?'part':(r.loaded?'base':'')))}).catch(function(err){
    showErr('block_load',err.message);
    go('gray');
  });
}
/* export */
function download(blob,fname){
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
}
function dataToBlob(d){
  var bin=atob(d.split(',')[1]),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  return new Blob([u],{type:'image/png'});
}
function curFiles(){
  packCur();
  var out=[],seen={};
  slots.forEach(function(s){
    var f=files[s.id];if(!f)return;
    var p=s.id;
    if(!seen[p]){seen[p]=1;out.push({path:p+'.png',data:f.data})}
  });
  return out;
}
$('#expPng').onclick=function(){
  var f=curFiles();
  f.forEach(function(x,i){setTimeout(function(){download(dataToBlob(x.data),x.path.split('/').pop())},i*300)});
  say('msg.png_saved',{n:f.length});
};
function pngSize(d){
  var w=16;
  try{var b=atob(d.split(',')[1].slice(0,40));w=(b.charCodeAt(16)*16777216)+(b.charCodeAt(17)<<16)+(b.charCodeAt(18)<<8)+b.charCodeAt(19)}catch(e){}
  return (w>0&&w<=1024)?w:16;
}
var API={
  edits:0,busy:false,want:null,block:'',state:S,
  subscribe:function(f){listeners.push(f)},
  cur:function(){return cur},
  files:function(){return curFiles().filter(function(f){return dirty[f.path.replace(/\.png$/,'')]})},
  loading:function(){API.busy=true;emit()},
  loaded:function(m){API.busy=false;API.block=m;var w=API.want;API.want=null;if(w&&cv[w])setSlot(w);emit()},
  openTexture:function(path,data){
    var key='textures/'+path;
    if(!catalog)return null;
    var hit=null,alt=null,base=path.split('/').pop();
    for(var i=0;i<catalog.ids.length&&!hit;i++){
      var cid=catalog.ids[i];
      if(pathsFor(cid).indexOf(key)>=0)hit=cid;else if(!alt&&cid===base)alt=cid;
    }
    if(!hit&&alt){hit=alt;key=pathsFor(alt)[0]}
    if(!hit)return false;
    files[key]={res:pngSize(data),data:data};dirty[key]=true;API.want=key;selectBlock(hit);
    return hit;
  },
  stats:function(){return {frames:frames,webgl:gl,res:res,slots:slots.length}},
  grid:function(){
    return {
      catalog:catalog,files:files,dirty:dirty,load:FKCatalog.loadAny,select:selectBlock,edited:isEdited,
      discard:function(){slots.forEach(function(s){ph[s.id]=true})},
      obj:function(){return {id:cur||null,paths:slots.map(function(s){return s.id}),file:slot?String(slot).split('/').pop():''}},
      setPack:function(map){
        Object.keys(dirty).forEach(function(k){if(!(k in map)){delete dirty[k];delete files[k]}});
        Object.keys(map).forEach(function(k){files[k]={res:pngSize(map[k]),data:map[k]};dirty[k]=true});
      },
      shapeFor:function(id){
        var m=catalog.mother[id],mo=modelOf(m),k=shapeKeysFor(m,catalog.members[catalog.sig[m]]),w=isDoorBlock(m)?'door':(mo?mo:shapeOfId(id));
        return k.indexOf(w)>=0?w:k[0];
      }
    };
  }
};
window.FKAPI=API;

/* start */
FK.apply(document);
loadCatalog();
requestAnimationFrame(loop);
setTimeout(function(){if(gl&&frames<2)showErr('render_stalled')},2500);
})();
