/* Optional pixel-grid view. Call create explicitly from the editor settings builder. */
(function(root){
'use strict';
var KEY='fk_pixel_grid.v1',NS='http://www.w3.org/2000/svg';
function validStep(value){var n=Number(value);return isFinite(n)&&n>=1&&Math.floor(n)===n?n:1}
function segments(size,step){var d='';for(var k=step;k<size;k+=step)d+='M'+k+' 0V'+size+'M0 '+k+'H'+size;return d}
function create(options){
  var canvas=options.canvas,settings=options.settings,getResolution=options.getResolution,labels=options.labels;
  if(!canvas||!canvas.parentNode||!settings||typeof getResolution!=='function'||!labels)throw new Error('Pixel grid needs canvas, settings, resolution and labels');
  var doc=canvas.ownerDocument,state={enabled:false,step:1},observer=null,destroyed=false;
  try{var saved=JSON.parse(root.localStorage.getItem(KEY));if(saved&&typeof saved.enabled==='boolean'){state.enabled=saved.enabled;state.step=validStep(saved.step)}}catch(e){}
  var host=doc.createElement('div'),overlay=doc.createElementNS(NS,'svg'),path=doc.createElementNS(NS,'path');
  host.style.cssText='position:relative;width:100%';
  canvas.parentNode.insertBefore(host,canvas);host.appendChild(canvas);
  overlay.setAttribute('aria-hidden','true');overlay.setAttribute('focusable','false');overlay.setAttribute('preserveAspectRatio','none');
  overlay.style.cssText='position:absolute;left:1px;top:1px;width:calc(100% - 2px);height:calc(100% - 2px);pointer-events:none;mix-blend-mode:difference;display:none';
  path.setAttribute('fill','none');path.setAttribute('stroke','rgba(255,255,255,.65)');path.setAttribute('stroke-width','1');path.setAttribute('vector-effect','non-scaling-stroke');
  overlay.appendChild(path);host.appendChild(overlay);
  var panel=doc.createElement('div'),title=doc.createElement('p'),row=doc.createElement('div'),enabledLabel=doc.createElement('label'),toggle=doc.createElement('input'),stepLabel=doc.createElement('label'),input=doc.createElement('input');
  title.className='lbl';title.textContent=labels.title;row.className='row';row.style.alignItems='center';
  enabledLabel.style.cssText='display:flex;align-items:center;gap:8px';toggle.type='checkbox';enabledLabel.appendChild(toggle);enabledLabel.appendChild(doc.createTextNode(labels.enabled));
  stepLabel.style.cssText='display:flex;align-items:center;gap:8px';stepLabel.appendChild(doc.createTextNode(labels.step));input.type='number';input.min='1';input.step='1';input.inputMode='numeric';input.style.cssText='width:72px;min-height:40px;font:inherit;color:inherit;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px';stepLabel.appendChild(input);
  row.appendChild(enabledLabel);row.appendChild(stepLabel);panel.appendChild(title);panel.appendChild(row);settings.appendChild(panel);
  function save(){try{root.localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
  function refresh(){
    if(destroyed)return;
    var n=Number(getResolution());
    if(!isFinite(n)||n<1||Math.floor(n)!==n){overlay.style.display='none';return}
    toggle.checked=state.enabled;input.max=String(n);input.value=String(state.step);input.disabled=!state.enabled;
    var hidden=canvas.style.visibility==='hidden'||canvas.hidden;
    overlay.style.display=state.enabled&&!hidden?'block':'none';
    overlay.setAttribute('viewBox','0 0 '+n+' '+n);path.setAttribute('d',segments(n,state.step));
  }
  function onToggle(){state.enabled=toggle.checked;save();refresh()}
  function onStep(){var n=Number(getResolution()),v=validStep(input.value);state.step=Math.min(v,isFinite(n)&&n>=1?Math.floor(n):v);save();refresh()}
  toggle.addEventListener('change',onToggle);input.addEventListener('change',onStep);
  if(root.MutationObserver){observer=new root.MutationObserver(refresh);observer.observe(canvas,{attributes:true,attributeFilter:['width','height','style','hidden']})}
  refresh();
  return {refresh:refresh,destroy:function(){if(destroyed)return;destroyed=true;if(observer)observer.disconnect();toggle.removeEventListener('change',onToggle);input.removeEventListener('change',onStep);panel.parentNode.removeChild(panel);host.parentNode.insertBefore(canvas,host);host.parentNode.removeChild(host)}};
}
root.FKPixelGrid={create:create};
})(window);
