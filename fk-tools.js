/* fk-tools.js v0.8.29: editor layout, icon set, colour queue with long-press delete, palette and settings sheets, replace-colour tool, brush size, 64px, alpha, rotate/flip, no 3D edge lines (patches into index.html). Loaded after fk-help.js. */
(function(){
var NL=String.fromCharCode(10),Q=String.fromCharCode(39);
function inj(f){var s=String(f);return s.slice(s.indexOf('{')+1,s.lastIndexOf('}'))}

var DOT=inj(function(){
var fkBrush=1,fkAlpha=255;try{var _fb=+localStorage.getItem('fk_brush');if(_fb>=1&&_fb<=8)fkBrush=_fb}catch(e){}
function fkCss(){if(fkAlpha>=255)return color;var n=parseInt(color.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+(fkAlpha/255)+')'}
function dot(g,x,y){var n=fkBrush,o=Math.floor((n-1)/2),xa=Math.max(0,x-o),ya=Math.max(0,y-o),xb=Math.min(res,x-o+n),yb=Math.min(res,y-o+n);if(xb<=xa||yb<=ya)return;if(tool==='erase'||fkAlpha<=0)g.clearRect(xa,ya,xb-xa,yb-ya);else{if(fkAlpha<255)g.clearRect(xa,ya,xb-xa,yb-ya);g.fillStyle=fkCss();g.fillRect(xa,ya,xb-xa,yb-ya)}}
}).trim();

var START=inj(function(){
var FKI={
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
  drop:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'
};
function fkIcon(n){return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+FKI[n]+'</svg>'}
var fkUI=null,fkQ=null,fkP={h:0,s:0,v:0,a:255};
var FKQ_OLD=['#c0392bff','#e67e22ff','#f1c40fff','#3f7d4eff','#2980b9ff','#8e44adff','#ffffffff','#7f8c8dff','#2c2c2cff','#866043ff'];
function fkHex8(){var n=parseInt(color.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255,fkAlpha].map(function(v){return ('0'+v.toString(16)).slice(-2)}).join('')}
function fkLoadQ(){var q=null;try{q=JSON.parse(localStorage.getItem('fk_hist'))}catch(e){}
  q=Array.isArray(q)?q.filter(function(x){return /^#[0-9a-f]{8}$/.test(x)}).slice(0,20):[];
  var mig=null;try{mig=localStorage.getItem('fk_hist_v2')}catch(e){}
  if(!mig){q=q.filter(function(x){return FKQ_OLD.indexOf(x)<0});try{localStorage.setItem('fk_hist_v2','1');localStorage.setItem('fk_hist',JSON.stringify(q))}catch(e){}}
  return q}
function fkSaveQ(){try{localStorage.setItem('fk_hist',JSON.stringify(fkQ))}catch(e){}}
function fkSwBg(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16),a=(parseInt(h.slice(7,9),16)/255).toFixed(3),c='rgba('+r+','+g+','+b+','+a+')';
  return 'linear-gradient('+c+','+c+'),conic-gradient(#bbb 25%,#e6e6e6 0 50%,#bbb 0 75%,#e6e6e6 0) 0 0/10px 10px'}
function fkRenderQ(){
  if(!fkUI)return;var box=fkUI.sw,cur8=fkHex8();box.innerHTML='';
  fkQ.forEach(function(h){var b=document.createElement('button');b.type='button';b.className='fkSw'+(h===cur8?' on':'');b.dataset.c=h;b.style.background=fkSwBg(h);b.setAttribute('aria-label',h);box.appendChild(b)});
}
function fkSync(){
  if(!fkUI)return;var cur8=fkHex8();
  fkUI.sw.querySelectorAll('.fkSw').forEach(function(b){b.classList.toggle('on',b.dataset.c===cur8)});
}
function fkQueueFront(){
  var h=fkHex8();fkQ=[h].concat(fkQ.filter(function(x){return x!==h})).slice(0,20);fkSaveQ();fkRenderQ();
  if(fkUI)fkUI.sw.scrollLeft=0;
}
function fkHsv2Rgb(h,s,v){var c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]}
function fkRgb2Hsv(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0;
  if(d){if(mx===r)h=60*(((g-b)/d)%6);else if(mx===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4)}
  if(h<0)h+=360;return [h,mx?d/mx:0,mx]}
function fkParseHex(t){t=String(t).trim().replace(/^#/,'');if(!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t))return null;
  if(t.length===3)t=t.replace(/./g,'$&$&');if(t.length===6)t+='ff';
  return [parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16),parseInt(t.slice(6,8),16)]}
function fkBrushSet(n,keep){
  fkBrush=n;
  if(!keep){try{localStorage.setItem('fk_brush',String(n))}catch(e){}}
  var el=$('#fkBrush');if(!el)return;
  el.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',+b.dataset.n===n)});
}
function fkXform(k){
  if(cur==='custom'){say('Сначала выбери блок из списка.');return}
  if(!cv[slot])return;
  var n=res,g=ctxOf(slot),src=g.getImageData(0,0,n,n),out=g.createImageData(n,n),a=src.data,b=out.data,x,y,i,j,X,Y;
  for(y=0;y<n;y++)for(x=0;x<n;x++){
    if(k==='r'){X=n-1-y;Y=x}else if(k==='l'){X=y;Y=n-1-x}else if(k==='v'){X=x;Y=n-1-y}else{X=n-1-x;Y=y}
    i=(y*n+x)*4;j=(Y*n+X)*4;b[j]=a[i];b[j+1]=a[i+1];b[j+2]=a[i+2];b[j+3]=a[i+3];
  }
  pushUndo();g.putImageData(out,0,0);touched();
}
function fkSwap(p){
  var g=ctxOf(slot),n=res,img=g.getImageData(0,0,n,n),d=img.data,i0=(p.y*n+p.x)*4,r0=d[i0],g0=d[i0+1],b0=d[i0+2],a0=d[i0+3];
  var c=parseInt(color.slice(1),16),r1=c>>16&255,g1=c>>8&255,b1=c&255,a1=fkAlpha,changed=false,i,hit;
  if(!a0){if(!a1)return}else if(a0===a1&&r0===r1&&g0===g1&&b0===b1)return;
  for(i=0;i<d.length;i+=4){
    hit=a0?(d[i]===r0&&d[i+1]===g0&&d[i+2]===b0&&d[i+3]===a0):(d[i+3]===0);
    if(hit){d[i]=r1;d[i+1]=g1;d[i+2]=b1;d[i+3]=a1;changed=true}
  }
  if(!changed)return;
  pushUndo();g.putImageData(img,0,0);touched();
}
function fkMk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function fkSheet(title){
  var back=fkMk('div','fkBack'),sh=fkMk('div','fkSheet'),head=fkMk('div','fkHead'),t=fkMk('span','fkTitle',title),ok=fkMk('button','fkOk','✓'),body=fkMk('div','');
  ok.type='button';ok.setAttribute('aria-label','Готово');head.appendChild(t);head.appendChild(ok);sh.appendChild(head);sh.appendChild(body);back.appendChild(sh);document.body.appendChild(back);
  var o={back:back,body:body,ok:ok,show:function(){back.classList.add('on')},hide:function(){back.classList.remove('on')}};
  back.addEventListener('click',function(e){if(e.target===back)o.hide()});
  return o;
}
function fkIconBtn(btn,name,title){btn.innerHTML=fkIcon(name);btn.title=title;btn.setAttribute('aria-label',title)}
function fkBuild(){
  try{if(window.THREE&&THREE.LineSegments&&THREE.Object3D){THREE.LineSegments=function(){return new THREE.Object3D()}}}catch(e){}
  var main=document.querySelector('main'),canvasSec=$('#ed').closest('.sec'),tools=$('#tools');
  var R2=$('#undo').closest('.row'),R3=$('#clr').closest('.row'),pal=$('#pal'),undo=$('#undo'),redo=$('#redo'),resSeg=R2.querySelector('.seg');
  var nameInp=$('#name'),S3=nameInp.closest('.sec'),expPng=$('#expPng'),expPack=$('#expPack'),msg=$('#msg'),clr=$('#clr'),fileLabel=R3.querySelector('label[for="file"]');
  var st=fkMk('style');
  st.textContent='button svg{display:block;width:22px;height:22px;margin:0 auto;pointer-events:none}'+
  '#fkTop{display:flex;gap:6px;margin:8px 0}#fkTop button{flex:1 1 0;min-width:0;min-height:40px;padding:4px 0;background:var(--panel);border:1px solid var(--line)}#fkTop .fkGap{margin-left:8px}'+
  '#fkColors{display:flex;gap:6px;align-items:center;margin:8px 0}#fkPalBtn{flex:0 0 auto;width:44px;height:40px;min-height:0;padding:0;background:var(--panel);border:1px solid var(--line)}'+
  '#fkSwatches{display:flex;gap:6px;overflow-x:auto;flex:1 1 auto;min-width:0;min-height:38px;padding:2px 0}.fkSw{flex:0 0 auto;width:34px;height:34px;min-height:0;padding:0;border-radius:8px;border:2px solid var(--line);-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.fkSw.on{border-color:var(--ink)}'+
  '.fkMenu{position:fixed;z-index:120;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.4);padding:4px;display:none}.fkMenu button{display:block;width:100%;min-height:40px;padding:8px 16px;text-align:left;white-space:nowrap}'+
  '#tools{flex-wrap:nowrap;gap:6px;margin:8px 0}#tools .seg{flex:1 1 auto;min-width:0}#tools .seg button{flex:1 1 0;min-width:0;padding:8px 0}.fkPick{flex:0 0 auto;width:48px;margin-right:8px;padding:0;background:var(--panel);border:1px solid var(--line)}'+
  '#fkSvc{flex-wrap:nowrap;gap:6px;margin:8px 0}#fkSvc>button,#fkSvc>label{flex:1 1 auto;min-width:0;min-height:40px;padding:9px 4px;font-size:14px;white-space:nowrap;justify-content:center}#fkSvc>.fkIconBtn,#fkSvc>.fkHelpBtn{flex:0 0 auto;min-width:44px;padding:0 6px}'+
  'label.ghost{background:var(--panel);border:1px solid var(--line)}#msg:empty{display:none}#msg{margin:6px 0}'+
  'main>.sec{margin-top:10px}main>.sec:first-child{margin-top:0}'+
  '.fkBack{position:fixed;left:0;top:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,.5);display:none;align-items:flex-end;justify-content:center}.fkBack.on{display:flex}'+
  '.fkSheet{width:100%;max-width:460px;max-height:90vh;overflow:auto;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-bottom:0;border-radius:16px 16px 0 0;padding:12px 14px 18px}'+
  '.fkHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.fkTitle{font-weight:600}.fkOk{min-width:44px;font-size:20px;color:var(--acc);border:1px solid var(--line);background:transparent}'+
  '.fkSvW{position:relative;border-radius:10px;box-shadow:0 0 0 1px var(--line)}#fkSV{display:block;width:100%;height:170px;border-radius:10px;touch-action:none}'+
  '.fkMark{position:absolute;width:20px;height:20px;box-sizing:border-box;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #000,inset 0 0 0 1px #000;transform:translate(-50%,-50%);pointer-events:none}'+
  '.fkRow{display:flex;gap:10px;align-items:center;margin:12px 0}.fkPrev{flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:1px solid var(--line)}.fkSl{flex:1 1 auto;display:flex;flex-direction:column;gap:8px}'+
  '.fkR{-webkit-appearance:none;appearance:none;width:100%;height:24px;margin:0;padding:0;background:transparent;outline:none}'+
  '.fkR::-webkit-slider-runnable-track{height:16px;border-radius:8px;background:var(--fkT)}.fkR::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;margin-top:-4px;box-sizing:border-box;border-radius:50%;background:#fff;border:2px solid #444}'+
  '.fkR::-moz-range-track{height:16px;border-radius:8px;background:var(--fkT)}.fkR::-moz-range-thumb{width:24px;height:24px;box-sizing:border-box;border-radius:50%;background:#fff;border:2px solid #444}'+
  '.fkFld{display:flex;gap:8px}.fkFld label{flex:1 1 0;display:flex;flex-direction:column;align-items:center;font-size:12px;color:var(--mute);gap:4px}.fkFld input{width:100%;min-height:36px;text-align:center;padding:4px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}'+
  '#fkHex{width:100%;min-height:40px;margin-top:10px;text-align:center;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit}';
  document.head.appendChild(st);
  var top=fkMk('div','');top.id='fkTop';
  undo.className='';redo.className='';fkIconBtn(undo,'undo','Отмена');fkIconBtn(redo,'redo','Повтор');
  top.appendChild(undo);top.appendChild(redo);
  [['l','rotl','Повернуть на 90° влево'],['r','rotr','Повернуть на 90° вправо'],['v','flipv','Отразить по вертикали'],['h','fliph','Зеркало по горизонтали']].forEach(function(d,i){
    var b=fkMk('button',i===0?'fkGap':'');b.type='button';fkIconBtn(b,d[1],d[2]);b.addEventListener('click',function(){fkXform(d[0])});top.appendChild(b);
  });
  var row=fkMk('div','');row.id='fkColors';
  var pb=fkMk('button','');pb.id='fkPalBtn';pb.type='button';fkIconBtn(pb,'palette','Палитра');
  var sw=fkMk('div','');sw.id='fkSwatches';row.appendChild(pb);row.appendChild(sw);
  main.insertBefore(top,canvasSec);main.insertBefore(row,canvasSec);
  pal.style.display='none';
  var tm={pen:['pencil','Кисть'],erase:['eraser','Ластик'],fill:['bucket','Заливка'],pick:['pipette','Пипетка']};
  tools.querySelectorAll('[data-t]').forEach(function(b){var m=tm[b.dataset.t];if(m)fkIconBtn(b,m[0],m[1])});
  var segT=tools.querySelector('.seg'),pick=tools.querySelector('[data-t="pick"]');
  var sp=fkMk('button','');sp.type='button';sp.dataset.t='swap';fkIconBtn(sp,'drop','Замена цвета: все пиксели точно такого цвета станут выбранным');segT.appendChild(sp);
  pick.className='fkPick';tools.insertBefore(pick,tools.firstChild);
  fkUI={sw:sw};fkQ=fkLoadQ();fkRenderQ();
  var menu=fkMk('div','fkMenu'),del=fkMk('button','','Удалить цвет');del.type='button';menu.appendChild(del);document.body.appendChild(menu);
  var lpT=null,lpFired=false,lpX=0,lpY=0,lpC=null;
  function hideMenu(){menu.style.display='none';lpC=null}
  function showMenu(b){
    var r=b.getBoundingClientRect(),w=170;lpC=b.dataset.c;menu.style.display='block';
    var left=Math.max(8,Math.min(innerWidth-w-8,r.left-8)),topPos=r.bottom+6;
    if(topPos+52>innerHeight)topPos=Math.max(8,r.top-52);
    menu.style.left=left+'px';menu.style.top=topPos+'px';
  }
  sw.addEventListener('pointerdown',function(e){var b=e.target.closest('.fkSw');if(!b)return;lpFired=false;lpX=e.clientX;lpY=e.clientY;clearTimeout(lpT);lpT=setTimeout(function(){lpFired=true;showMenu(b)},500)});
  sw.addEventListener('pointermove',function(e){if(lpT&&(Math.abs(e.clientX-lpX)>8||Math.abs(e.clientY-lpY)>8)){clearTimeout(lpT);lpT=null}});
  ['pointerup','pointercancel','pointerleave'].forEach(function(t){sw.addEventListener(t,function(){clearTimeout(lpT);lpT=null})});
  sw.addEventListener('contextmenu',function(e){e.preventDefault()});
  sw.addEventListener('click',function(e){
    var b=e.target.closest('.fkSw');if(!b)return;
    if(lpFired){lpFired=false;return}
    var v=fkParseHex(b.dataset.c);fkAlpha=v[3];pickColor(b.dataset.c.slice(0,7),false);
  });
  del.addEventListener('click',function(){var c=lpC;hideMenu();if(!c)return;fkQ=fkQ.filter(function(x){return x!==c});fkSaveQ();fkRenderQ()});
  document.addEventListener('pointerdown',function(e){if(menu.style.display!=='none'&&!menu.contains(e.target))hideMenu()},true);
  var sg=fkSheet('Настройки');
  var l1=fkMk('p','lbl','Размер кисти'),bs=fkMk('div','seg');bs.id='fkBrush';
  for(var n=1;n<=8;n++){var bb=fkMk('button','',String(n));bb.dataset.n=String(n);bs.appendChild(bb)}
  bs.addEventListener('click',function(e){var b=e.target.closest('button');if(b)fkBrushSet(+b.dataset.n)});
  var l2=fkMk('p','lbl','Разрешение текстуры');
  var b64=fkMk('button','','64');b64.dataset.r='64';b64.addEventListener('click',function(){setRes(64);setResUi()});resSeg.appendChild(b64);
  sg.body.appendChild(l1);sg.body.appendChild(bs);sg.body.appendChild(l2);sg.body.appendChild(resSeg);
  sg.ok.addEventListener('click',sg.hide);
  R2.parentNode.removeChild(R2);
  var hid=fkMk('div','');hid.hidden=true;document.body.appendChild(hid);
  Array.prototype.slice.call(S3.querySelectorAll('p.lbl')).forEach(function(p){if(/^Имя блока/.test(p.textContent))p.parentNode.removeChild(p)});
  var expRow=expPng.parentNode;
  fileLabel.textContent='Заменить';expPng.textContent='Скачать';clr.textContent='Очистить';
  R3.id='fkSvc';R3.insertBefore(expPng,clr);
  hid.appendChild(expPack);hid.appendChild(nameInp);
  if(expRow&&expRow.parentNode)expRow.parentNode.removeChild(expRow);
  R3.parentNode.insertBefore(msg,R3.nextSibling);
  if(S3&&S3.parentNode)S3.parentNode.removeChild(S3);
  var gear=fkMk('button','ghost fkIconBtn');gear.type='button';fkIconBtn(gear,'gear','Настройки');
  gear.addEventListener('click',function(){sg.show()});R3.appendChild(gear);
  fkBrushSet(fkBrush,true);setResUi();
  var ps=fkSheet('Палитра');
  var svw=fkMk('div','fkSvW'),svc=fkMk('canvas',''),mark=fkMk('div','fkMark');svc.id='fkSV';svc.width=240;svc.height=170;svw.appendChild(svc);svw.appendChild(mark);
  var r1=fkMk('div','fkRow'),prev=fkMk('div','fkPrev'),sl=fkMk('div','fkSl');
  var hue=fkMk('input','fkR');hue.id='fkHue';hue.type='range';hue.min='0';hue.max='360';hue.value='0';hue.setAttribute('aria-label','Оттенок');
  hue.style.setProperty('--fkT','linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)');
  var al=fkMk('input','fkR');al.id='fkAlpha';al.type='range';al.min='0';al.max='255';al.value='255';al.setAttribute('aria-label','Прозрачность');
  sl.appendChild(hue);sl.appendChild(al);r1.appendChild(prev);r1.appendChild(sl);
  var fl=fkMk('div','fkFld'),fin={};
  ['R','G','B','A'].forEach(function(k){var lb=fkMk('label','',k),inp=fkMk('input','');inp.type='number';inp.min='0';inp.max='255';inp.inputMode='numeric';lb.appendChild(inp);fl.appendChild(lb);fin[k]=inp});
  var hx=fkMk('input','');hx.id='fkHex';hx.type='text';hx.autocomplete='off';hx.spellcheck=false;hx.setAttribute('aria-label','Hex');
  ps.body.appendChild(svw);ps.body.appendChild(r1);ps.body.appendChild(fl);ps.body.appendChild(hx);
  function rgb(){return fkHsv2Rgb(fkP.h,fkP.s,fkP.v)}
  function drawSV(){
    var g=svc.getContext('2d'),w=svc.width,h=svc.height,gr=g.createLinearGradient(0,0,w,0);
    gr.addColorStop(0,'#fff');gr.addColorStop(1,'hsl('+fkP.h+',100%,50%)');g.fillStyle=gr;g.fillRect(0,0,w,h);
    var gv=g.createLinearGradient(0,0,0,h);gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(1,'#000');g.fillStyle=gv;g.fillRect(0,0,w,h);
    mark.style.left=(fkP.s*100)+'%';mark.style.top=((1-fkP.v)*100)+'%';
  }
  function paint(skip){
    var c=rgb(),r=c[0],g=c[1],b=c[2],a=fkP.a,css='rgba('+r+','+g+','+b+','+(a/255).toFixed(3)+')';
    drawSV();hue.value=String(Math.round(fkP.h));al.value=String(a);
    prev.style.background='linear-gradient('+css+','+css+'),conic-gradient(#bbb 25%,#e6e6e6 0 50%,#bbb 0 75%,#e6e6e6 0) 0 0/10px 10px';
    al.style.setProperty('--fkT','linear-gradient(to right,rgba('+r+','+g+','+b+',0),rgb('+r+','+g+','+b+')),conic-gradient(#bbb 25%,#e6e6e6 0 50%,#bbb 0 75%,#e6e6e6 0) 0 0/10px 10px');
    if(skip!=='f'){fin.R.value=r;fin.G.value=g;fin.B.value=b;fin.A.value=a}
    if(skip!=='x')hx.value='#'+[r,g,b,a].map(function(v){return ('0'+v.toString(16)).slice(-2)}).join('').toUpperCase();
  }
  function setRgba(r,g,b,a){var h=fkRgb2Hsv(r,g,b);if(!(r===g&&g===b))fkP.h=h[0];fkP.s=h[1];fkP.v=h[2];fkP.a=a}
  function svAt(e){var rc=svc.getBoundingClientRect();fkP.s=Math.max(0,Math.min(1,(e.clientX-rc.left)/rc.width));fkP.v=1-Math.max(0,Math.min(1,(e.clientY-rc.top)/rc.height));paint()}
  var drag=false;
  svc.addEventListener('pointerdown',function(e){e.preventDefault();drag=true;try{svc.setPointerCapture(e.pointerId)}catch(x){}svAt(e)});
  svc.addEventListener('pointermove',function(e){if(drag)svAt(e)});
  svc.addEventListener('pointerup',function(){drag=false});svc.addEventListener('pointercancel',function(){drag=false});
  hue.addEventListener('input',function(){fkP.h=+hue.value;paint()});
  al.addEventListener('input',function(){fkP.a=+al.value;paint()});
  ['R','G','B','A'].forEach(function(k){fin[k].addEventListener('change',function(){
    var v=function(x){x=Math.round(+x);return isNaN(x)?0:Math.max(0,Math.min(255,x))};
    setRgba(v(fin.R.value),v(fin.G.value),v(fin.B.value),v(fin.A.value));paint()})});
  hx.addEventListener('change',function(){var p=fkParseHex(hx.value);if(p){setRgba(p[0],p[1],p[2],p[3])}paint()});
  pb.addEventListener('click',function(){
    var n=parseInt(color.slice(1),16),c=fkRgb2Hsv(n>>16&255,n>>8&255,n&255);
    fkP.h=(c[1]===0&&fkP.h)?fkP.h:c[0];fkP.s=c[1];fkP.v=c[2];fkP.a=fkAlpha;paint();ps.show();
  });
  ps.ok.addEventListener('click',function(){
    var c=rgb(),hex='#'+c.map(function(v){return ('0'+v.toString(16)).slice(-2)}).join('');
    fkAlpha=fkP.a;pickColor(hex,true);fkQueueFront();ps.hide();
  });
  fkSync();
}
fkBuild();
}).trim();

var MARK='/* ---------- старт ---------- */';
var P=[
 ["function dot(g,x,y){if(x<0||y<0||x>=res||y>=res)return;if(tool==='erase')g.clearRect(x,y,1,1);else{g.fillStyle=color;g.fillRect(x,y,1,1)}}",DOT],
 ["function hexRgba(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255,255]}","function hexRgba(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255,fkAlpha]}"],
 [['  pickColor(h,false);','}'].join(NL),['  fkAlpha=d[3];pickColor(h,false);if(typeof fkQueueFront==='+Q+'function'+Q+')fkQueueFront();','}'].join(NL)],
 [['b.classList.toggle('+Q+'on'+Q+',b.dataset.c===c)});ci.value=c;','}'].join(NL),['b.classList.toggle('+Q+'on'+Q+',b.dataset.c===c)});ci.value=c;if(typeof fkSync==='+Q+'function'+Q+')fkSync();','}'].join(NL)],
 [["  if(tool==='pick'){pickAt(p);return}","  pushUndo();",""].join(NL),["  if(tool==='pick'){pickAt(p);return}","  if(tool==='swap'){fkSwap(p);return}","  pushUndo();",""].join(NL)],
 [MARK,START+NL+MARK]
];
if(typeof PATCHES!=='undefined')P.forEach(function(p){PATCHES.push(p)});
})();
