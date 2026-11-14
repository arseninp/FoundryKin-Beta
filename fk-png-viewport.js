/* PNG view only: preserve the existing canvas, pixels and editing history.
   Load after fk-core.js and before fk-tools.js so navigation gates input before drawing tools. */
(function(root){
'use strict';
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fit(w,h,vw,vh){var k=Math.min(vw/w,vh/h);return {width:w*k,height:h*k}}
function bound(s,b,vw,vh){var m=Math.min(48,vw/4,vh/4);return {z:s.z,x:clamp(s.x,m-b.width*s.z,vw-m),y:clamp(s.y,m-b.height*s.z,vh-m)}}
function initial(b,vw,vh){return {z:1,x:(vw-b.width)/2,y:(vh-b.height)/2}}
function zoom(s,factor,from,to,b,vw,vh){var z=clamp(s.z*factor,.25,256),k=z/s.z;return bound({z:z,x:to.x-(from.x-s.x)*k,y:to.y-(from.y-s.y)*k},b,vw,vh)}
function gesture(points){var p=Array.from(points.values());if(!p.length)return null;if(p.length===1)return {x:p[0].x,y:p[0].y,d:0};return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)}}
function create(canvas,api){
 if(!canvas||!api||!api.ctx||!canvas.parentNode)throw new Error('PNG viewport requires the editor canvas and API');
 var doc=canvas.ownerDocument,panel=canvas.parentNode,C=api.ctx,ru=root.FK.lang()==='ru';
 if(panel.id==='fkPngPanel')throw new Error('PNG viewport already mounted');
 panel.id='fkPngPanel';panel.classList.add('fkPngPanel');
 function element(tag,cls){var e=doc.createElement(tag);if(cls)e.className=cls;return e}
 var controls=element('div','fkPngControls'),freeButton=element('button'),resetButton=element('button'),view=element('div','fkPngClip'),surface=element('div','fkPngSurface');
 freeButton.type=resetButton.type='button';freeButton.textContent=ru?'Свободная позиция':'Free position';resetButton.textContent=ru?'Начальная позиция':'Initial position';
 freeButton.setAttribute('aria-pressed','false');view.tabIndex=0;view.setAttribute('aria-label',ru?'Поле рисования. В свободной позиции: перетаскивание и масштаб двумя пальцами.':'Drawing field. In free position: drag and pinch to zoom.');
 controls.appendChild(freeButton);controls.appendChild(resetButton);panel.insertBefore(controls,canvas);panel.insertBefore(view,canvas);view.appendChild(surface);surface.appendChild(canvas);
 var free=false,points=new Map(),last=null,paintingPointer=null,b={width:1,height:1},s={z:1,x:0,y:0},vw=0,vh=0,iw=0,ih=0,source=null;
 function usable(){return api.state.mode==='edit'&&!api.busy&&C.viewReady()&&!doc.hidden}
 function draw(){surface.style.width=b.width+'px';surface.style.height=b.height+'px';surface.style.transform='translate('+s.x+'px,'+s.y+'px) scale('+s.z+')'}
 function releasePaint(){var id=paintingPointer;paintingPointer=null;if(id!==null)try{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id)}catch(error){}}
 function cancel(){var ids=Array.from(points.keys());points.clear();last=null;ids.forEach(function(id){try{if(view.hasPointerCapture(id))view.releasePointerCapture(id)}catch(error){}});releasePaint()}
 function setFree(value){cancel();free=value;panel.classList.toggle('fkPngFree',free);freeButton.setAttribute('aria-pressed',String(free))}
 function reset(){cancel();s=initial(b,vw,vh);draw()}
 function sync(){
  var ready=usable();freeButton.disabled=resetButton.disabled=!ready;panel.inert=!!api.busy;panel.style.visibility=api.busy?'hidden':'';
  if(!ready){cancel();if(api.state.mode!=='edit')setFree(false);return}
  var w=view.clientWidth,h=view.clientHeight;if(!w||!h)return;
  var changed=source!==api.cur()||iw!==canvas.width||ih!==canvas.height,old=b;
  var center={x:vw?(vw/2-s.x)/(old.width*s.z):.5,y:vh?(vh/2-s.y)/(old.height*s.z):.5};
  b=fit(canvas.width,canvas.height,w,h);
  if(changed){setFree(false);s=initial(b,w,h)}else if(w!==vw||h!==vh)s=bound({z:s.z,x:w/2-center.x*b.width*s.z,y:h/2-center.y*b.height*s.z},b,w,h);
  vw=w;vh=h;iw=canvas.width;ih=canvas.height;source=api.cur();draw();
 }
 function point(e){var r=view.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
 function begin(e){
  if(!free||!usable()||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();points.set(e.pointerId,point(e));last=gesture(points);try{view.setPointerCapture(e.pointerId)}catch(error){}
 }
 function move(e){
  if(!free||!points.has(e.pointerId))return;
  if(!usable()){cancel();return}
  e.preventDefault();points.set(e.pointerId,point(e));var next=gesture(points),factor=last.d>0&&next.d>0?next.d/last.d:1;
  s=zoom(s,factor,last,next,b,vw,vh);last=next;draw();
 }
 function end(e){points.delete(e.pointerId);last=gesture(points);if(paintingPointer===e.pointerId)paintingPointer=null}
 function canvasDown(e){if(free){begin(e);e.preventDefault();e.stopImmediatePropagation()}else paintingPointer=e.pointerId}
 function canvasMove(e){
  if(free){move(e);e.preventDefault();e.stopImmediatePropagation();return}
  if(paintingPointer===e.pointerId){var r=view.getBoundingClientRect();if(e.clientX<r.left||e.clientY<r.top||e.clientX>=r.right||e.clientY>=r.bottom){releasePaint();e.stopImmediatePropagation()}}
 }
 freeButton.addEventListener('click',function(){if(usable())setFree(!free)});
 resetButton.addEventListener('click',function(){if(usable())reset()});
 canvas.addEventListener('pointerdown',canvasDown);canvas.addEventListener('pointermove',canvasMove);
 view.addEventListener('pointerdown',begin);root.addEventListener('pointermove',move,{passive:false});
 root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);
 view.addEventListener('wheel',function(e){if(!free||!usable())return;e.preventDefault();var p=point(e),unit=e.deltaMode===1?16:e.deltaMode===2?vh:1;s=zoom(s,Math.exp(clamp(-e.deltaY*unit*.002,-4,4)),p,p,b,vw,vh);draw()},{passive:false});
 view.addEventListener('keydown',function(e){
  if(!free||!usable())return;var p={x:vw/2,y:vh/2},d={ArrowLeft:[24,0],ArrowRight:[-24,0],ArrowUp:[0,24],ArrowDown:[0,-24]}[e.key];
  if(e.key==='Home'||e.key==='0'){e.preventDefault();reset();return}
  if(d){e.preventDefault();s=bound({z:s.z,x:s.x+d[0],y:s.y+d[1]},b,vw,vh);draw()}
  else if(['+','=','-','_'].includes(e.key)){e.preventDefault();s=zoom(s,e.key==='-'||e.key==='_'?.8:1.25,p,p,b,vw,vh);draw()}
 });
 root.addEventListener('blur',cancel);doc.addEventListener('visibilitychange',function(){if(doc.hidden)cancel();else sync()});
 if(root.ResizeObserver)new root.ResizeObserver(sync).observe(view);else root.addEventListener('resize',sync);
 if(root.MutationObserver)new root.MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['width','height']});
 api.subscribe(sync);sync();
 return {reset:reset,free:function(){return free},state:function(){return {z:s.z,x:s.x,y:s.y}}};
}
root.FKPngViewport={fit:fit,bound:bound,initial:initial,zoom:zoom,gesture:gesture,create:create};
if(root.document)root.FKPngViewport.instance=create(root.document.getElementById('ed'),root.FKAPI);
})(typeof window==='undefined'?globalThis:window);
