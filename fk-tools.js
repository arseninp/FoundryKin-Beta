/* fk-tools.js: drawing tools, colour palette, settings sheet and the menu manager FKM of the editor.
   Builds its own panel inside #toolsPanel and talks to fk-core.js only through FKAPI.ctx. */
(function(){
var FK=window.FK,C=window.FKAPI.ctx;
function T(k){return FK.t(k)}
var ICONS={
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  rotl:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  rotr:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  flipv:'<path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/>',
  fliph:'<path d="M3 12h18"/><path d="m7 8-4 4 4 4"/><path d="m17 8 4 4-4 4"/>',
  palette:'<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/>',
  gear:'<path d="M18.88 9.87L21.82 10.11L21.82 13.89L18.88 14.13L18.37 15.36L20.28 17.61L17.61 20.28L15.36 18.37L14.13 18.88L13.89 21.82L10.11 21.82L9.87 18.88L8.64 18.37L6.39 20.28L3.72 17.61L5.63 15.36L5.12 14.13L2.18 13.89L2.18 10.11L5.12 9.87L5.63 8.64L3.72 6.39L6.39 3.72L8.64 5.63L9.87 5.12L10.11 2.18L13.89 2.18L14.13 5.12L15.36 5.63L17.61 3.72L20.28 6.39L18.37 8.64Z"/><circle cx="12" cy="12" r="3.2"/>',
  pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  eraser:'<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
  bucket:'<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>',
  pipette:'<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
  drop:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>'
};
function icon(n){return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>'}
function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function btn(cls,name,title){var b=mk('button',cls);b.type='button';b.innerHTML=icon(name);if(title){b.title=title;b.setAttribute('aria-label',title)}return b}
function h2(v){return ('0'+v.toString(16)).slice(-2)}

/* state */
var tool='pen',color='#c0392b',alpha=255,brush=1,queue=[],P={h:0,s:0,v:0,a:255};
try{var sb=+localStorage.getItem('fk_brush');if(sb>=1&&sb<=8)brush=sb}catch(e){}
try{var q0=JSON.parse(localStorage.getItem('fk_hist'));if(Array.isArray(q0))queue=q0.filter(function(x){return /^#[0-9a-f]{8}$/.test(x)}).slice(0,20)}catch(e){}

/* colour maths */
function rgbOf(hex){var n=parseInt(hex.slice(1),16);return [n>>16&255,n>>8&255,n&255]}
function hex6(r,g,b){return '#'+h2(r)+h2(g)+h2(b)}
function hex8(){var c=rgbOf(color);return hex6(c[0],c[1],c[2])+h2(alpha)}
function css(){if(alpha>=255)return color;var c=rgbOf(color);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(alpha/255)+')'}
function target(){var c=rgbOf(color);return [c[0],c[1],c[2],alpha]}
function hsv2rgb(h,s,v){var c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]}
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0;
  if(d){if(mx===r)h=60*(((g-b)/d)%6);else if(mx===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4)}
  if(h<0)h+=360;return [h,mx?d/mx:0,mx]}
function parseHex(t){t=String(t).trim().replace(/^#/,'');if(!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t))return null;
  if(t.length===3)t=t.replace(/./g,'$&$&');if(t.length===6)t+='ff';
  return [parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16),parseInt(t.slice(6,8),16)]}
var CHECK='conic-gradient(#bbb 25%,#e6e6e6 0 50%,#bbb 0 75%,#e6e6e6 0) 0 0/10px 10px';
function swatchBg(h){var c=parseHex(h),f='rgba('+c[0]+','+c[1]+','+c[2]+','+(c[3]/255).toFixed(3)+')';return 'linear-gradient('+f+','+f+'),'+CHECK}

/* pixel operations on a 2D context */
function brushRect(n,size,x,y){
  var o=Math.floor((size-1)/2),l=Math.max(0,x-o),t=Math.max(0,y-o),r=Math.min(n,x-o+size),b=Math.min(n,y-o+size);
  return (r>l&&b>t)?{x:l,y:t,w:r-l,h:b-t}:null;
}
function dot(g,x,y){
  var r=brushRect(C.res(),brush,x,y);if(!r)return;
  if(tool==='erase'||alpha<=0)g.clearRect(r.x,r.y,r.w,r.h);
  else{if(alpha<255)g.clearRect(r.x,r.y,r.w,r.h);g.fillStyle=css();g.fillRect(r.x,r.y,r.w,r.h)}
}
function line(g,a,b){
  var x0=a.x,y0=a.y,x1=b.x,y1=b.y,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx+dy;
  for(var n=0;n<512;n++){dot(g,x0,y0);if(x0===x1&&y0===y1)break;var e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}
}
function floodFill(g,n,p){
  var img=g.getImageData(0,0,n,n),d=img.data,t=target();
  function at(x,y){return (y*n+x)*4}
  var i0=at(p.x,p.y),s=[d[i0],d[i0+1],d[i0+2],d[i0+3]];
  if(s[0]===t[0]&&s[1]===t[1]&&s[2]===t[2]&&s[3]===t[3])return;
  var st=[[p.x,p.y]];
  while(st.length){
    var q=st.pop(),x=q[0],y=q[1];if(x<0||y<0||x>=n||y>=n)continue;
    var i=at(x,y);if(d[i]!==s[0]||d[i+1]!==s[1]||d[i+2]!==s[2]||d[i+3]!==s[3])continue;
    d[i]=t[0];d[i+1]=t[1];d[i+2]=t[2];d[i+3]=t[3];
    st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  g.putImageData(img,0,0);
}
function swapColor(g,n,p){
  var img=g.getImageData(0,0,n,n),d=img.data,i0=(p.y*n+p.x)*4,r0=d[i0],g0=d[i0+1],b0=d[i0+2],a0=d[i0+3],t=target(),changed=false,i,hit;
  if(!a0){if(!t[3])return}else if(a0===t[3]&&r0===t[0]&&g0===t[1]&&b0===t[2])return;
  for(i=0;i<d.length;i+=4){
    hit=a0?(d[i]===r0&&d[i+1]===g0&&d[i+2]===b0&&d[i+3]===a0):(d[i+3]===0);
    if(hit){d[i]=t[0];d[i+1]=t[1];d[i+2]=t[2];d[i+3]=t[3];changed=true}
  }
  if(!changed)return;
  C.pushUndo();g.putImageData(img,0,0);C.touched();
}
function pickAt(g,p){
  var d=g.getImageData(p.x,p.y,1,1).data;if(!d[3])return;
  alpha=d[3];setColor(hex6(d[0],d[1],d[2]));queueFront();
}
function transform(kind){
  if(!C.ready())return;
  var n=C.res(),g=C.g(),img=g.getImageData(0,0,n,n),a=img.data,out=new Uint8ClampedArray(a.length),x,y,i,j,X,Y;
  for(y=0;y<n;y++)for(x=0;x<n;x++){
    if(kind==='r'){X=n-1-y;Y=x}else if(kind==='l'){X=y;Y=n-1-x}else if(kind==='v'){X=x;Y=n-1-y}else{X=n-1-x;Y=y}
    i=(y*n+x)*4;j=(Y*n+X)*4;out[j]=a[i];out[j+1]=a[i+1];out[j+2]=a[i+2];out[j+3]=a[i+3];
  }
  C.pushUndo();img.data.set(out);g.putImageData(img,0,0);C.touched();
}

/* menu manager: one open menu at a time; closes on the same button, the backdrop and system Back */
var FKM={cur:null,pushed:0,skip:false};
FKM.mark=function(m,on){(m.triggers||[]).forEach(function(t){t.classList.toggle('fkTrigOn',on)});document.body.classList.toggle('fkMenuOpen',on)};
FKM.open=function(m){
  if(FKM.cur===m)return;
  if(FKM.cur){FKM.cur.hide();FKM.mark(FKM.cur,false)}
  m.show();FKM.cur=m;FKM.mark(m,true);
  if(!FKM.pushed){try{history.pushState({fk:1},'');FKM.pushed=1}catch(e){}}
};
FKM.close=function(){
  var m=FKM.cur;if(!m)return;
  FKM.cur=null;m.hide();FKM.mark(m,false);
  if(FKM.pushed){FKM.pushed=0;FKM.skip=true;try{history.back()}catch(e){FKM.skip=false}}
};
FKM.toggle=function(m){if(FKM.cur===m)FKM.close();else FKM.open(m)};
window.addEventListener('popstate',function(){
  if(FKM.skip){FKM.skip=false;return}
  var m=FKM.cur;if(m){FKM.cur=null;FKM.pushed=0;m.hide();FKM.mark(m,false)}
});
window.FKM=FKM;
C.closeMenu=function(){if(!FKM.cur)return false;FKM.close();return true};
window.FKAPI.closeMenu=C.closeMenu;

/* panel */
var UI={};
function sheet(title){
  var back=mk('div','fkBack'),sh=mk('div','fkSheet'),head=mk('div','fkHead'),ok=btn('fkOk','check',T('ui.done')),body=mk('div','');
  head.appendChild(mk('span','fkTitle',title));head.appendChild(ok);sh.appendChild(head);sh.appendChild(body);back.appendChild(sh);document.body.appendChild(back);
  back.addEventListener('click',function(e){if(e.target===back)FKM.close()});
  return {body:body,ok:ok,show:function(){back.classList.add('on')},hide:function(){back.classList.remove('on')}};
}
function setTool(t){
  tool=t;
  UI.toolBtns.forEach(function(b){b.classList.toggle('on',b.dataset.t===t)});
}
function setColor(c){
  color=c;
  if(tool==='pick'||tool==='erase')setTool('pen');
  syncSwatches();
}
function renderQueue(){
  var cur8=hex8();UI.sw.innerHTML='';
  queue.forEach(function(h){
    var b=mk('button','fkSw'+(h===cur8?' on':''));b.type='button';b.dataset.c=h;b.style.background=swatchBg(h);b.setAttribute('aria-label',h);UI.sw.appendChild(b);
  });
}
function syncSwatches(){var cur8=hex8();UI.sw.querySelectorAll('.fkSw').forEach(function(b){b.classList.toggle('on',b.dataset.c===cur8)})}
function saveQueue(){try{localStorage.setItem('fk_hist',JSON.stringify(queue))}catch(e){}}
function queueFront(){
  var h=hex8();queue=[h].concat(queue.filter(function(x){return x!==h})).slice(0,20);
  saveQueue();renderQueue();UI.sw.scrollLeft=0;
}
function setBrush(n){
  brush=n;try{localStorage.setItem('fk_brush',String(n))}catch(e){}
  markBrush();
}
function markBrush(){UI.brushBtns.forEach(function(b){b.classList.toggle('on',+b.dataset.n===brush)})}
function markRes(n){UI.resBtns.forEach(function(b){b.classList.toggle('on',+b.dataset.r===n)})}

function build(root){
  var undo=btn('','undo',T('ui.undo')),redo=btn('','redo',T('ui.redo')),top=mk('div','');top.id='fkTop';
  top.appendChild(undo);top.appendChild(redo);
  [['l','rotl','xform.rotl'],['r','rotr','xform.rotr'],['v','flipv','xform.flipv'],['h','fliph','xform.fliph']].forEach(function(d,i){
    var b=btn(i===0?'fkGap':'',d[1],T(d[2]));b.addEventListener('click',function(){transform(d[0])});top.appendChild(b);
  });
  undo.addEventListener('click',C.undo);redo.addEventListener('click',C.redo);
  C.onHistory=function(u,r){undo.disabled=!u;redo.disabled=!r};

  var colors=mk('div','');colors.id='fkColors';
  var pb=btn('','palette',T('pal.title'));pb.id='fkPalBtn';
  UI.sw=mk('div','');UI.sw.id='fkSwatches';colors.appendChild(pb);colors.appendChild(UI.sw);

  var tools=mk('div','');tools.id='tools';
  var pick=btn('fkPick','pipette',T('tool.pick'));pick.dataset.t='pick';
  var seg=mk('div','seg');
  UI.toolBtns=[pick];
  [['pen','pencil','tool.pen'],['erase','eraser','tool.erase'],['fill','bucket','tool.fill'],['swap','drop','tool.swap']].forEach(function(d){
    var b=btn(d[0]==='pen'?'on':'',d[1],T(d[2]));b.dataset.t=d[0];seg.appendChild(b);UI.toolBtns.push(b);
  });
  tools.appendChild(pick);tools.appendChild(seg);
  UI.toolBtns.forEach(function(b){b.addEventListener('click',function(){setTool(b.dataset.t)})});

  var svc=mk('div','');svc.id='fkSvc';
  var rep=mk('label','ghost btn',T('ui.replace'));rep.setAttribute('for','file');
  var file=mk('input','');file.type='file';file.id='file';file.accept='image/png,image/*';
  var dl=mk('button','ghost',T('ui.download'));dl.type='button';
  var clr=mk('button','ghost',T('ui.clear'));clr.type='button';
  var gear=btn('ghost fkIconBtn','gear',T('set.title'));
  [rep,dl,clr,gear].forEach(function(e){svc.appendChild(e)});svc.appendChild(file);
  [top,colors,tools,svc].forEach(function(e){root.appendChild(e)});

  /* settings sheet: brush size and texture resolution */
  var sg=sheet(T('set.title')),bs=mk('div','seg');UI.brushBtns=[];UI.resBtns=[];
  for(var n=1;n<=8;n++){var bb=mk('button','',String(n));bb.dataset.n=String(n);bs.appendChild(bb);UI.brushBtns.push(bb)}
  bs.addEventListener('click',function(e){var b=e.target.closest('button');if(b)setBrush(+b.dataset.n)});
  var rs=mk('div','seg');
  [16,32,64].forEach(function(v){var b=mk('button','',String(v));b.dataset.r=String(v);rs.appendChild(b);UI.resBtns.push(b)});
  rs.addEventListener('click',function(e){var b=e.target.closest('button');if(b)C.setRes(+b.dataset.r)});
  sg.body.appendChild(mk('p','lbl',T('set.brush')));sg.body.appendChild(bs);sg.body.appendChild(mk('p','lbl',T('set.res')));sg.body.appendChild(rs);
  sg.ok.addEventListener('click',function(){FKM.close()});
  var setM={triggers:[gear],show:sg.show,hide:sg.hide};
  gear.addEventListener('click',function(){FKM.toggle(setM)});
  C.onRes=markRes;

  /* palette sheet: HSV square, hue, opacity, RGBA fields, hex */
  var ps=sheet(T('pal.title')),svw=mk('div','fkSvW'),svc=mk('canvas',''),mark=mk('div','fkMark');
  svc.id='fkSV';svc.width=240;svc.height=170;svw.appendChild(svc);svw.appendChild(mark);
  var r1=mk('div','fkRow'),prev=mk('div','fkPrev'),sl=mk('div','fkSl');
  var hue=mk('input','fkR');hue.id='fkHue';hue.type='range';hue.min='0';hue.max='360';hue.value='0';hue.setAttribute('aria-label',T('pal.hue'));
  hue.style.setProperty('--fkT','linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)');
  var al=mk('input','fkR');al.id='fkAlpha';al.type='range';al.min='0';al.max='255';al.value='255';al.setAttribute('aria-label',T('pal.alpha'));
  sl.appendChild(hue);sl.appendChild(al);r1.appendChild(prev);r1.appendChild(sl);
  var fl=mk('div','fkFld'),fin={};
  ['R','G','B','A'].forEach(function(k){var lb=mk('label','',k),inp=mk('input','');inp.type='number';inp.min='0';inp.max='255';inp.inputMode='numeric';lb.appendChild(inp);fl.appendChild(lb);fin[k]=inp});
  var hx=mk('input','');hx.id='fkHex';hx.type='text';hx.autocomplete='off';hx.spellcheck=false;hx.setAttribute('aria-label',T('pal.hex'));
  [svw,r1,fl,hx].forEach(function(e){ps.body.appendChild(e)});
  function rgb(){return hsv2rgb(P.h,P.s,P.v)}
  function drawSV(){
    var g=svc.getContext('2d'),w=svc.width,h=svc.height,gr=g.createLinearGradient(0,0,w,0);
    gr.addColorStop(0,'#fff');gr.addColorStop(1,'hsl('+P.h+',100%,50%)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    var gv=g.createLinearGradient(0,0,0,h);gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(1,'#000');g.fillStyle=gv;g.fillRect(0,0,w,h);
    mark.style.left=(P.s*100)+'%';mark.style.top=((1-P.v)*100)+'%';
  }
  function paint(skip){
    var c=rgb(),r=c[0],g=c[1],b=c[2],a=P.a,f='rgba('+r+','+g+','+b+','+(a/255).toFixed(3)+')';
    drawSV();hue.value=String(Math.round(P.h));al.value=String(a);
    prev.style.background='linear-gradient('+f+','+f+'),'+CHECK;
    al.style.setProperty('--fkT','linear-gradient(to right,rgba('+r+','+g+','+b+',0),rgb('+r+','+g+','+b+')),'+CHECK);
    if(skip!=='f'){fin.R.value=r;fin.G.value=g;fin.B.value=b;fin.A.value=a}
    if(skip!=='x')hx.value=(hex6(r,g,b)+h2(a)).toUpperCase();
  }
  function setRgba(r,g,b,a){var h=rgb2hsv(r,g,b);if(!(r===g&&g===b))P.h=h[0];P.s=h[1];P.v=h[2];P.a=a}
  function svAt(e){var rc=svc.getBoundingClientRect();P.s=Math.max(0,Math.min(1,(e.clientX-rc.left)/rc.width));P.v=1-Math.max(0,Math.min(1,(e.clientY-rc.top)/rc.height));paint()}
  var drag=false;
  svc.addEventListener('pointerdown',function(e){e.preventDefault();drag=true;try{svc.setPointerCapture(e.pointerId)}catch(x){}svAt(e)});
  svc.addEventListener('pointermove',function(e){if(drag)svAt(e)});
  svc.addEventListener('pointerup',function(){drag=false});svc.addEventListener('pointercancel',function(){drag=false});
  hue.addEventListener('input',function(){P.h=+hue.value;paint()});
  al.addEventListener('input',function(){P.a=+al.value;paint()});
  ['R','G','B','A'].forEach(function(k){fin[k].addEventListener('change',function(){
    var v=function(x){x=Math.round(+x);return isNaN(x)?0:Math.max(0,Math.min(255,x))};
    setRgba(v(fin.R.value),v(fin.G.value),v(fin.B.value),v(fin.A.value));paint()})});
  hx.addEventListener('change',function(){var p=parseHex(hx.value);if(p)setRgba(p[0],p[1],p[2],p[3]);paint()});
  var palM={triggers:[pb],show:ps.show,hide:ps.hide};
  pb.addEventListener('click',function(){
    if(FKM.cur===palM){FKM.close();return}
    var c=rgbOf(color),h=rgb2hsv(c[0],c[1],c[2]);
    P.h=(h[1]===0&&P.h)?P.h:h[0];P.s=h[1];P.v=h[2];P.a=alpha;paint();FKM.open(palM);
  });
  ps.ok.addEventListener('click',function(){var c=rgb();alpha=P.a;setColor(hex6(c[0],c[1],c[2]));queueFront();FKM.close()});

  /* history swatches: tap to use, hold to delete */
  var menu=mk('div','fkMenu'),del=mk('button','',T('pal.delete'));del.type='button';menu.appendChild(del);document.body.appendChild(menu);
  var lpT=null,lpFired=false,lpX=0,lpY=0,lpC=null;
  function hideMenu(){menu.style.display='none';lpC=null}
  function showMenu(b){
    var r=b.getBoundingClientRect(),w=170;lpC=b.dataset.c;menu.style.display='block';
    var left=Math.max(8,Math.min(innerWidth-w-8,r.left-8)),tp=r.bottom+6;
    if(tp+52>innerHeight)tp=Math.max(8,r.top-52);
    menu.style.left=left+'px';menu.style.top=tp+'px';
  }
  UI.sw.addEventListener('pointerdown',function(e){var b=e.target.closest('.fkSw');if(!b)return;lpFired=false;lpX=e.clientX;lpY=e.clientY;clearTimeout(lpT);lpT=setTimeout(function(){lpFired=true;showMenu(b)},500)});
  UI.sw.addEventListener('pointermove',function(e){if(lpT&&(Math.abs(e.clientX-lpX)>8||Math.abs(e.clientY-lpY)>8)){clearTimeout(lpT);lpT=null}});
  ['pointerup','pointercancel','pointerleave'].forEach(function(t){UI.sw.addEventListener(t,function(){clearTimeout(lpT);lpT=null})});
  UI.sw.addEventListener('contextmenu',function(e){e.preventDefault()});
  UI.sw.addEventListener('click',function(e){
    var b=e.target.closest('.fkSw');if(!b)return;
    if(lpFired){lpFired=false;return}
    var v=parseHex(b.dataset.c);alpha=v[3];setColor(b.dataset.c.slice(0,7));
  });
  del.addEventListener('click',function(){var c=lpC;hideMenu();if(!c)return;queue=queue.filter(function(x){return x!==c});saveQueue();renderQueue()});
  document.addEventListener('pointerdown',function(e){if(menu.style.display!=='none'&&!menu.contains(e.target))hideMenu()},true);

  /* canvas pointer input */
  var ed=C.el.ed,down=false,last=null;
  function cell(e){var r=ed.getBoundingClientRect(),n=C.res();return {x:Math.floor((e.clientX-r.left)/r.width*n),y:Math.floor((e.clientY-r.top)/r.height*n)}}
  ed.addEventListener('pointerdown',function(e){
    if(!C.ready())return;
    var n=C.res(),p=cell(e);if(p.x<0||p.y<0||p.x>=n||p.y>=n)return;
    e.preventDefault();ed.setPointerCapture(e.pointerId);
    var g=C.g();
    if(tool==='pick'){pickAt(g,p);return}
    if(tool==='swap'){swapColor(g,n,p);return}
    C.pushUndo();
    if(tool==='fill'){floodFill(g,n,p);C.touched();return}
    down=true;last=p;dot(g,p.x,p.y);C.touched();
  });
  ed.addEventListener('pointermove',function(e){
    if(!down||!C.ready())return;
    var p=cell(e);line(C.g(),last,p);last=p;C.touched();
  });
  function up(){down=false;last=null}
  ed.addEventListener('pointerup',up);ed.addEventListener('pointercancel',up);

  /* replace from PNG, clear, download */
  file.addEventListener('change',function(e){
    var inp=e.target,f=inp.files[0];if(!f)return;var fr=new FileReader();
    fr.onload=function(){var img=new Image();
      img.onload=function(){
        if(!C.ready())return;
        var n=C.res(),g=C.g();C.pushUndo();g.clearRect(0,0,n,n);g.imageSmoothingEnabled=false;g.drawImage(img,0,0,n,n);C.touched();
      };
      img.src=fr.result};
    fr.readAsDataURL(f);inp.value='';
  });
  clr.addEventListener('click',function(){if(!C.ready())return;var n=C.res();C.pushUndo();C.g().clearRect(0,0,n,n);C.touched()});
  dl.addEventListener('click',function(){
    var fs=C.files();
    fs.forEach(function(x,i){setTimeout(function(){
      var bin=atob(x.data.split(',')[1]),u=new Uint8Array(bin.length);for(var k=0;k<bin.length;k++)u[k]=bin.charCodeAt(k);
      var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([u],{type:'image/png'}));a.download=x.path.split('/').pop();document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
    },i*300)});
    C.say('msg.png_saved',{n:fs.length});
  });

  renderQueue();markBrush();markRes(C.res());C.syncHist();
}
build(document.getElementById('toolsPanel'));
})();
