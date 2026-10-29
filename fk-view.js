/* One renderer and one view policy for the editor and Find. */
var FKView=(function(){
'use strict';
var renderer=null,hidden=null,preview=null,lost=false;
var ANGLE_X=.6155,ANGLE_Y=-Math.PI/4,EXTENT=.95;
function getRenderer(){
  if(!renderer){
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    renderer.setClearColor(0x000000,0);
    hidden=new THREE.MeshBasicMaterial({visible:false});
    renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true});
    renderer.domElement.addEventListener('webglcontextrestored',function(){lost=false});
  }
  if(lost)throw new Error('WebGL context is lost');
  return renderer;
}
function createStage(){
  getRenderer();
  var scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-EXTENT,EXTENT,EXTENT,-EXTENT,.1,50);
  camera.position.set(0,0,3.9);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff,.75));
  var light=new THREE.DirectionalLight(0xffffff,.55);light.position.set(2,4,3);scene.add(light);
  var group=new THREE.Group();group.rotation.set(ANGLE_X,ANGLE_Y,0);scene.add(group);
  return {scene:scene,camera:camera,group:group,flat:false};
}
function clear(stage){
  var seen=[];
  stage.group.traverse(function(o){if(o.geometry&&seen.indexOf(o.geometry)<0)seen.push(o.geometry)});
  seen.forEach(function(g){g.dispose()});
  while(stage.group.children.length)stage.group.remove(stage.group.children[0]);
}
function texture(canvas){
  var w=canvas.width,h=canvas.height,data=canvas.getContext('2d').getImageData(0,0,w,h).data;
  var out=new Uint8Array(w*h*4),semi=false;
  for(var y=0;y<h;y++){
    var start=y*w*4,end=(h-1-y)*w*4;
    for(var x=0;x<w*4;x++){
      var value=data[start+x];out[end+x]=value;
      if((x&3)===3&&value>8&&value<248)semi=true;
    }
  }
  var tx=new THREE.DataTexture(out,w,h,THREE.RGBAFormat);
  tx.magFilter=tx.minFilter=THREE.NearestFilter;tx.generateMipmaps=false;tx.needsUpdate=true;
  tx.userData={semi:semi};return tx;
}
function material(doubleSided){
  return new THREE.MeshLambertMaterial({transparent:true,alphaTest:.05,side:doubleSided?THREE.DoubleSide:THREE.FrontSide});
}
function mapMaterial(mat,tx){
  mat.map=tx;mat.depthWrite=!tx.userData.semi;mat.needsUpdate=true;
}
function doorTexture(lower,upper){
  if(lower.width!==upper.width||lower.height!==lower.width||upper.height!==upper.width)throw new Error('Door frames must be equally sized squares');
  var n=lower.width,canvas=document.createElement('canvas');canvas.width=n;canvas.height=2*n;
  var g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(upper,0,0);g.drawImage(lower,0,n);
  return texture(canvas);
}
function build(stage,entry,reset){
  clear(stage);
  var flat=!!(FKShapes.flat&&FKShapes.flat(entry.cur,entry.slot));
  if(flat)stage.group.rotation.set(0,0,0);
  else if(reset||stage.flat)stage.group.rotation.set(ANGLE_X,ANGLE_Y,0);
  stage.flat=flat;
  stage.camera.zoom=1/FKShapes.view(entry.cur);stage.camera.updateProjectionMatrix();
  var env={shape:entry.shape,cur:entry.cur,slot:entry.slot,faceMap:entry.faceMap,mats:entry.mats,group:stage.group,hiddenMat:hidden,SHAPES:FKShapes.SHAPES,refreshDoor:entry.refreshDoor||function(){},state:entry.state||{}};
  try{FKShapes.build(env)}catch(err){clear(stage);throw err}
}
function render(stage,width,pixelRatio){
  var r=getRenderer(),ratio=pixelRatio||1,size=r.getSize(new THREE.Vector2());
  if(r.getPixelRatio()!==ratio)r.setPixelRatio(ratio);
  if(size.x!==width||size.y!==width)r.setSize(width,width,false);
  r.render(stage.scene,stage.camera);
}
function mount(host){
  var node=getRenderer().domElement;
  if(node.parentNode!==host)host.insertBefore(node,host.firstChild);
  return node;
}
/* The hidden editor keeps its scene and camera. Its next frame restores its size.
   Consecutive cards reuse the same 256 px buffer instead of resizing it twice per card. */
function capture(entry,size){
  var r=getRenderer(),target=r.getRenderTarget();
  if(!preview)preview=createStage();
  try{
    build(preview,entry,true);r.setRenderTarget(null);render(preview,size||256,1);
    return r.domElement.toDataURL('image/png');
  }finally{
    clear(preview);r.setRenderTarget(target);
  }
}
return {createStage:createStage,clear:clear,texture:texture,material:material,mapMaterial:mapMaterial,doorTexture:doorTexture,build:build,render:render,mount:mount,capture:capture};
})();
