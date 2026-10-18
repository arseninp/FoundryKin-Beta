/* fk-grid.js: the Find screen of the editor: block search, card grid and static 3D snapshots.
   Works only through FKAPI (state, grid(), subscribe, setMode). */
(function(){
var FK=window.FK,A=window.FKAPI;
function T(k,p){return FK.t(k,p)}
function $(s){return document.querySelector(s)}
var PAGE=60,MAX=6,S256=256;
var box=$('#fkGrid'),more=$('#fkMore'),qi=$('#q'),catLoad=$('#catLoad');
var pv={},queue=[],active=0,imgCache={},lastPackSig=null,lastCat=null,lastSig='',prevMode='search',savedY=0;
var ids=[],shown=0,st3=null,mode3d=null,fail3=0,migrated=null,tmr=null;

/* job queue: a few snapshots at a time */
function pump(){while(active<MAX&&queue.length){var j=queue.shift();active++;Promise.resolve().then(j).then(fin,fin)}}
function fin(){active--;pump()}
function enqueue(j){queue.push(j);pump()}
function need(shape){
  if(shape==='plant')return ['up'];
  if(shape==='azalea')return ['plant','north','up'];
  if(shape==='beacon')return ['down','up','east'];
  if(shape==='door')return ['down','north'];
  return ['up','down','north','south','east','west'];
}

/* active pack, read from the shell storage */
function packData(){
  try{var d=JSON.parse(localStorage.getItem('fk070_packs'));return (d&&d.packs&&d.packs.filter(function(x){return x.id===d.active})[0])||null}catch(e){return null}
}
function packMap(){var p=packData(),m={};if(p)p.textures.forEach(function(t){if(t.data)m['textures/'+t.path]=t.data});return m}
function packSig(m){return Object.keys(m).sort().map(function(k){return k+':'+m[k].length}).join('|')}
function getImg(ctx,path){
  var f=ctx.files&&ctx.files[path];
  if(f&&f.data)return new Promise(function(ok){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){ok(null)};im.src=f.data});
  if(!imgCache[path])imgCache[path]=ctx.load(path).then(function(im){if(!im)delete imgCache[path];return im});
  return imgCache[path];
}

/* offscreen WebGL renderer */
function init3(){
  var T3=window.THREE;if(!T3)return null;
  try{
    var cv=document.createElement('canvas');
    var r=new T3.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});
    r.setPixelRatio(1);r.setSize(S256,S256,false);r.setClearColor(0x000000,0);
    var sc=new T3.Scene(),cam=new T3.OrthographicCamera(-.95,.95,.95,-.95,.1,50);
    cam.position.set(0,0,3.9);cam.lookAt(0,0,0);
    sc.add(new T3.AmbientLight(0xffffff,.75));
    var dl=new T3.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);sc.add(dl);
    var g=new T3.Group();g.rotation.set(.6155,-.7854,0);sc.add(g);
    cv.addEventListener('webglcontextlost',function(e){e.preventDefault();mode3d=false});
    return {T:T3,r:r,sc:sc,cam:cam,g:g,cv:cv,hidden:new T3.MeshBasicMaterial({visible:false})};
  }catch(e){return null}
}
function semi(c){
  var a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(var i=3;i<a.length;i+=4){var v=a[i];if(v>8&&v<248)return true}
  return false;
}
function snap3d(o,SH,shape,im,dbl){
  var T3=o.T,g=o.g,mats={},tex=[],geos=[];
  function matOf(key,canvas){
    if(mats[key])return mats[key];
    var c=canvas||im[key];if(!c)return null;
    var t=new T3.CanvasTexture(c);t.magFilter=t.minFilter=T3.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
    var m=new T3.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?T3.DoubleSide:T3.FrontSide,map:t});
    m.depthWrite=!semi(c);tex.push(t);mats[key]=m;return m;
  }
  function box(w,h,d,x,y,z,idl,ys,vs){
    var ge=new T3.BoxGeometry(w,h,d),p=ge.attributes.position,n=ge.attributes.normal,uv=ge.attributes.uv;
    ys=ys||0;vs=vs||1;
    for(var i=0;i<p.count;i++){
      var X=p.getX(i)+x,Y=p.getY(i)+y,Z=p.getZ(i)+z,nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i),u,v;
      if(Math.abs(nx)>.5){u=nx>0?.5-Z:Z+.5;v=(Y+.5-ys)*vs}
      else if(Math.abs(nz)>.5){u=nz>0?X+.5:.5-X;v=(Y+.5-ys)*vs}
      else{u=X+.5;v=ny>0?.5-Z:Z+.5}
      uv.setXY(i,u,v);
    }
    idl=idl||['east','west','up','down','south','north'];
    var m=new T3.Mesh(ge,idl.map(function(k){return k===null?o.hidden:(matOf(k)||o.hidden)}));
    m.position.set(x,y,z);geos.push(ge);return m;
  }
  function plane(key,h,y,ry){
    var ge=new T3.PlaneGeometry(1,h),m=new T3.Mesh(ge,matOf(key)||o.hidden);
    m.position.y=y;m.rotation.y=ry;geos.push(ge);return m;
  }
  if(shape==='plant'||shape==='azalea'){
    var st=shape==='azalea'?'plant':'up';
    g.add(plane(st,1,0,0));g.add(plane(st,1,0,Math.PI/2));
    if(shape==='azalea')g.add(box(1,1,1,0,0,0,['north','north','up',null,'north','north']));
  }else if(shape==='beacon'){
    g.add(box(.75,.1875,.75,0,-.40625,0,['down','down','down','down','down','down']));
    g.add(box(.625,.625,.625,0,0,0,['up','up','up','up','up','up']));
    g.add(box(1,1,1,0,0,0,['east','east','east','east','east','east']));
  }else if(shape==='door'){
    var L=im.down,U=im.north;
    if(!L||!U)throw new Error('door');
    var R2=Math.max(L.width,U.width),dc=document.createElement('canvas');
    dc.width=R2;dc.height=R2*2;var dg=dc.getContext('2d');dg.imageSmoothingEnabled=false;
    dg.drawImage(U,0,0,U.width,U.height,0,0,R2,R2);dg.drawImage(L,0,0,L.width,L.height,0,R2,R2,R2);
    matOf('__door',dc);
    g.add(box(1,2,.1875,0,0,-.40625,['__door','__door','__door','__door','__door','__door'],-.5,.5));
  }else{
    var sh=(SH[shape]&&SH[shape].parts)?SH[shape]:SH.cube;
    sh.parts.forEach(function(a){
      var bm=box(a[0],a[1],a[2],a[3],a[4],a[5],shape==='rail'?['east','west','down','down','south','north']:undefined);
      if(shape==='candle'){var uv=bm.geometry.attributes.uv;for(var i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-.4375);uv.needsUpdate=true}
      g.add(bm);
    });
    if(shape==='candle'){
      var wmt=matOf('east');
      if(wmt)[.7853981633974483,-.7853981633974483].forEach(function(ry){
        var pg=new T3.PlaneGeometry(.125,.125),pu=pg.attributes.uv;
        for(var j=0;j<pu.count;j++)pu.setXY(j,pu.getX(j)*.125,.375+pu.getY(j)*.125);
        var pm=new T3.Mesh(pg,wmt);pm.position.y=-.0625;pm.rotation.y=ry;geos.push(pg);g.add(pm);
      });
    }
    if(sh.shift)g.children.forEach(function(mm){mm.position.y+=sh.shift});
  }
  var url=null;
  try{
    g.updateMatrixWorld(true);
    var bb=new T3.Box3().setFromObject(g),ce=bb.getCenter(new T3.Vector3()),kk=Math.min(1,1.78/Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y,.001));
    g.scale.setScalar(kk);g.position.set(-ce.x*kk,-ce.y*kk,0);
    o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png');
  }finally{
    g.scale.setScalar(1);g.position.set(0,0,0);while(g.children.length)g.remove(g.children[0]);
    geos.forEach(function(x){x.dispose()});
    Object.keys(mats).forEach(function(k){mats[k].dispose()});
    tex.forEach(function(t){t.dispose()});
  }
  return url;
}
var TINT=/^(?:[a-z_]+_)?leaves2?$|^(?:waterlily|vine|fern|large_fern|short_grass|tallgrass|tall_grass|double_plant|bush|leaf_litter|seagrass)$/;
function makePreview(ctx,id){
  var cat=ctx.catalog,b=cat.b[id],sp=cat.sp&&cat.sp[id];
  var fm=sp?sp.fm:{up:b[0],down:b[1],north:b[2],south:b[3],east:b[4],west:b[5]};
  if(cat.cr&&cat.cr[id]&&TINT.test(id)){var cp=cat.cr[id];fm={up:cp,down:cp,north:cp,south:cp,east:cp,west:cp}}
  var shape=ctx.shapeFor(id),keys=need(shape);
  return Promise.all(keys.map(function(k){return fm[k]?getImg(ctx,fm[k]):null})).then(function(arr){
    var R=0;arr.forEach(function(im){if(im&&im.width>R)R=im.width});
    if(!R)return null;
    var norm={};
    keys.forEach(function(k,i){
      var im=arr[i];if(!im)return;
      var c=document.createElement('canvas');c.width=c.height=R;
      var g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(im,0,0,im.width,im.width,0,0,R,R);
      norm[k]=c;
    });
    if(mode3d===null){st3=init3();mode3d=!!st3}
    if(mode3d&&st3){
      try{
        var dbl=/leaves/.test(id)||shape==='plant'||shape==='azalea'||shape==='candle';
        var u3=snap3d(st3,ctx.shapes,shape,norm,dbl);
        if(u3&&u3.length>200)return u3;
      }catch(e){fail3++;if(fail3>=3)mode3d=false}
    }
    return null;
  });
}

/* active pack: put its textures into the editor state */
function applyPack(){
  var c=A.grid(),m=packMap(),sg=packSig(m);
  if(sg===lastPackSig)return false;
  lastPackSig=sg;c.setPack(m);pv={};
  return true;
}
function discardEdits(){
  var c=A.grid();c.discard();
  var m=packMap();lastPackSig=packSig(m);c.setPack(m);pv={};
}

/* cards */
var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){obs.unobserve(e.target);paint(e.target)}})},{rootMargin:'250px'});
var mobs=new IntersectionObserver(function(es){if(es[0].isIntersecting&&shown<ids.length){addPage();mobs.unobserve(more);mobs.observe(more)}},{rootMargin:'400px'});
function paint(card){
  var c=A.grid();if(!c.catalog)return;
  var id=card.getAttribute('data-id'),ed=!!c.edited(id),edits=A.edits||0,e=pv[id];
  if(e&&e.ed===ed&&(!ed||e.e===edits)){setImg(card,e.u);return}
  enqueue(function(){
    if(!card.isConnected)return Promise.resolve();
    return makePreview(c,id).then(function(u){if(u)pv[id]={u:u,ed:ed,e:edits};if(card.isConnected)setImg(card,u)},function(){});
  });
}
function setImg(card,u){var im=card.querySelector('img');if(im&&u)im.src=u}
function mkCard(c,id){
  var b=document.createElement('button');b.type='button';b.className='fkc';b.setAttribute('data-id',id);
  var p=document.createElement('div');p.className='fkp';p.appendChild(document.createElement('img'));
  var n=document.createElement('div');n.className='fkn';n.textContent=id.replace(/_/g,' ');
  b.appendChild(p);b.appendChild(n);
  b.classList.toggle('fk-edited',!!c.edited(id));
  return b;
}
function addPage(){
  var c=A.grid();if(!c.catalog)return;
  var end=Math.min(shown+PAGE,ids.length);
  for(var i=shown;i<end;i++){var k=mkCard(c,ids[i]);box.appendChild(k);obs.observe(k)}
  shown=end;
}
function note(text){
  box.innerHTML='';ids=[];
  var m=document.createElement('div');m.id='fkEmpty';m.textContent=text;box.appendChild(m);
}
function statusNote(s){
  if(s.status==='failed')return s.error&&s.error.code==='catalog_no_blocks'?T('cat.no_blocks'):T('cat.failed',{detail:s.error?s.error.detail:''});
  if(s.status==='empty')return T('cat.empty');
  return T('cat.loading');
}
function sig(c){return Object.keys(c.dirty||{}).length+'|'+(A.edits||0)}
function render(){
  var c=A.grid();mobs.unobserve(more);shown=0;
  if(!c.catalog){note(statusNote(A.state));return}
  if(migrated!==c.catalog){migrated=c.catalog;try{if(parent.FKAPP)parent.FKAPP.migrate(c)}catch(e){}}
  var qv=qi.value.trim().toLowerCase().replace(/\s+/g,'_');
  ids=c.catalog.ids.filter(function(id){return !qv||id.indexOf(qv)>=0});
  lastCat=c.catalog;lastSig=sig(c);
  box.innerHTML='';
  if(!ids.length){note(T('cat.none'));return}
  addPage();mobs.observe(more);
}
function refresh(){
  var c=A.grid();
  Array.prototype.forEach.call(box.querySelectorAll('.fkc'),function(k){
    k.classList.toggle('fk-edited',!!c.edited(k.getAttribute('data-id')));
    paint(k);
  });
}

/* events */
qi.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(render,150)});
box.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('.fkc'):null;if(!b)return;
  A.grid().select(b.getAttribute('data-id'));
  A.setMode('edit');
});
$('#fkBack').addEventListener('click',function(){
  try{var b=parent.document.getElementById('back');if(b)b.click()}catch(e){}
});
A.subscribe(function(s){
  var force=false;
  if(s.mode!==prevMode){
    if(s.mode==='edit')savedY=window.scrollY;
    else if(prevMode==='edit'){
      discardEdits();force=true;
      if(savedY){var y=savedY;setTimeout(function(){window.scrollTo(0,y)},30)}
    }
    prevMode=s.mode;
  }
  catLoad.hidden=!(s.status==='failed'||s.status==='empty');
  if(s.mode!=='search')return;
  var c=A.grid(),changed=applyPack();
  if(!c.catalog){note(statusNote(s));return}
  if(force||changed||c.catalog!==lastCat)render();
  else if(sig(c)!==lastSig){lastSig=sig(c);refresh()}
});
applyPack();
render();
})();
