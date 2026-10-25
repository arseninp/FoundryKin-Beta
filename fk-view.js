/* FKView: the one 3D stage of the app.
   Editor: live view that is redrawn only when asked. Find: one frozen frame per card from the same renderer,
   camera, light and start angle. Models (FKShapes.build) never know which of the two is asking. */
var FKView=(function(){
var HALF=.95,DIST=3.9,PX=256,PITCH=.6155,YAW=-Math.PI/4;
/* Camera classes by height in blocks: 1 ordinary block, 2 two blocks high or long, 3 three blocks, 4 large mobs later. */
var SCALE={1:1,2:1.4,3:1.8,4:2.3};
var R=null,sc=null,cam=null,grp=null,hid=null,ok=null,err=null,lost=null;
var used='',editW=360,edKey='',edScale=1;
function cls(id){
  if(id==='bamboo')return 3;
  if(/(^|_)door$/.test(id)||/_bed$/.test(id)||/^(?:sunflower|lilac|rose_bush|peony|decorated_pot|pointed_dripstone|cave_vines)$/.test(id))return 2;
  return 1;
}
/* Everything that depends on the object: camera class, face-on sprite mode, start angle. */
function spec(id,slot){
  var flat=id==='end_portal'||id==='end_gateway'||(typeof slot==='string'&&slot.indexOf('textures/items/')===0);
  var turn=/^(?:dried_ghast|big_dripleaf|small_dripleaf_block)$/.test(id);
  return {scale:SCALE[cls(id)],flat:flat,yaw:flat?0:YAW+(turn?Math.PI:0),pitch:flat?0:PITCH};
}
function init(){
  if(ok!==null)return ok;
  if(typeof THREE==='undefined'){ok=false;err={code:'three_missing',detail:''};return ok}
  try{
    R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    R.setClearColor(0x000000,0);
    sc=new THREE.Scene();
    cam=new THREE.OrthographicCamera(-HALF,HALF,HALF,-HALF,.1,50);cam.position.set(0,0,DIST);cam.lookAt(0,0,0);
    sc.add(new THREE.AmbientLight(0xffffff,.75));
    var dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(2,4,3);sc.add(dl);
    grp=new THREE.Group();sc.add(grp);
    hid=new THREE.MeshBasicMaterial({visible:false});
    R.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();ok=false;err={code:'webgl_lost',detail:''};if(lost)lost()});
    ok=true;
  }catch(e){ok=false;R=null;err={code:'webgl_unavailable',detail:e.message}}
  return ok;
}
function usage(m){
  if(used===m)return;used=m;
  if(m==='shot'){R.setPixelRatio(1);R.setSize(PX,PX,false)}
  else{R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.setSize(editW,editW)}
}
function attach(host,w){
  editW=w||editW;used='';
  if(!init())return false;
  host.insertBefore(R.domElement,host.firstChild);
  return true;
}
function size(w){editW=w;used=''}
/* Editor pose: the start angle is set once per object, later turns by hand are kept. */
function setup(id,slot){
  var s=spec(id,slot),k=id+'|'+(s.flat?1:0);
  if(grp&&k!==edKey){edKey=k;grp.rotation.set(s.pitch,s.yaw,0)}
  edScale=s.scale;
  return s;
}
function rotate(dx,dy){grp.rotation.y+=dx;grp.rotation.x=Math.max(-1.4,Math.min(1.4,grp.rotation.x+dy))}
function clear(){
  var g=[];
  grp.traverse(function(o){if(o.geometry&&g.indexOf(o.geometry)<0)g.push(o.geometry)});
  g.forEach(function(x){x.dispose()});
  while(grp.children.length)grp.remove(grp.children[0]);
}
function render(){usage('edit');cam.zoom=1/edScale;cam.updateProjectionMatrix();R.render(sc,cam)}
/* One card: build the model with fill(group,hiddenMaterial), draw it once at the start angle, keep the frame as a blob URL. */
function shot(id,fill){
  if(!init())return Promise.resolve(null);
  usage('shot');edKey='';
  var s=spec(id,null),done=null;
  cam.zoom=1/s.scale;cam.updateProjectionMatrix();grp.rotation.set(s.pitch,s.yaw,0);
  try{
    done=fill(grp,hid);
    R.render(sc,cam);
    return new Promise(function(ok2){R.domElement.toBlob(function(b){ok2(b?URL.createObjectURL(b):null)},'image/png')});
  }finally{
    clear();if(done)done();
  }
}
function texture(c){
  var t=new THREE.CanvasTexture(c);
  t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
  return t;
}
function material(dbl,map){
  return new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:dbl?THREE.DoubleSide:THREE.FrontSide,map:map||null});
}
function semi(c){
  var a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(var i=3;i<a.length;i+=4){var v=a[i];if(v>8&&v<248)return true}
  return false;
}
/* Door: upper half over lower half in one texture, redrawn into reuse when given. */
function door(L,U,reuse){
  var n=Math.max(L.width,U.width),c=reuse||document.createElement('canvas');
  if(c.width!==n||c.height!==2*n){c.width=n;c.height=2*n}
  var g=c.getContext('2d');g.clearRect(0,0,n,2*n);g.imageSmoothingEnabled=false;
  g.drawImage(U,0,0,U.width,U.height,0,0,n,n);g.drawImage(L,0,0,L.width,L.height,0,n,n,n);
  return c;
}
return {attach:attach,size:size,setup:setup,rotate:rotate,render:render,shot:shot,clear:clear,spec:spec,
  texture:texture,material:material,semi:semi,door:door,
  group:function(){return grp},hidden:function(){return hid},error:function(){return err},
  onLost:function(f){lost=f}};
})();
