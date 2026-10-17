/* FoundryKin editor host: loads index.html into the iframe and exposes the FKE contract used by fk-app.js. */
var FKE=(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var frame=null,loaded=null,base=0,lastMode='search',cb={},themeNow='light',pending=null,pendingFail=null,pendingT=null;
function api(){try{var w=frame&&frame.contentWindow;return (w&&w.FKAPI)||null}catch(e){return null}}
function setTheme(th){
  themeNow=th;
  try{var d=frame&&frame.contentDocument;if(d&&d.documentElement)d.documentElement.setAttribute('data-theme',th)}catch(e){}
}
function wait(fn,fail){
  pending=fn;pendingFail=fail;clearTimeout(pendingT);
  pendingT=setTimeout(function(){var f=pendingFail;pending=null;pendingFail=null;if(f)f('timeout')},30000);
}
function settle(){
  if(!pending)return;
  var fn=pending;pending=null;pendingFail=null;clearTimeout(pendingT);fn();
}
function abort(code){
  var f=pendingFail;pending=null;pendingFail=null;clearTimeout(pendingT);
  if(f)f(code);
}
function onState(S){
  var a=api();
  if(a&&S.mode!==lastMode){lastMode=S.mode;if(S.mode==='edit')base=a.edits||0}
  if(cb.onState)cb.onState(S,a);
  settle();
}
function fail(code){
  loaded=null;
  if(cb.onError)cb.onError(code);
  abort(code);
}
function open(f,url,callbacks){
  cb=callbacks||{};frame=f;
  var a0=api();
  if(loaded===url&&a0){a0.syncPack();a0.setMode('search');return}
  loaded=url;lastMode='search';
  f.onload=function(){
    var d=null,a=api();
    try{d=f.contentDocument}catch(e){}
    if(!d){fail('cross_origin');return}
    if(!a){fail('not_editor');return}
    setTheme(themeNow);
    a.subscribe(onState);
    try{f.contentWindow.addEventListener('scroll',function(){if(cb.onScroll)cb.onScroll()},{passive:true})}catch(e){}
    onState(a.state);
  };
  f.src=url;
}
function editTexture(path,data,obj,callbacks){
  callbacks=callbacks||{};
  function failed(code){if(callbacks.onFail)callbacks.onFail(code)}
  (function attempt(){
    var a=api();
    if(!a){wait(attempt,failed);return}
    var r=a.openTexture(path,data,obj);
    if(r){a.setMode('edit');return}
    if(r===false){failed('not_found');return}
    var st=a.state.status;
    if(st==='failed'||st==='empty'){failed('catalog');return}
    wait(attempt,failed);
  })();
}
return {
  version:VERSION,
  open:open,editTexture:editTexture,theme:setTheme,
  reset:function(){loaded=null},
  ready:function(){return !!api()},
  getMode:function(){var a=api();return a?a.state.mode:'search'},
  setMode:function(m){var a=api();if(a)a.setMode(m)},
  current:function(){var a=api();return a?a.current():null},
  files:function(){var a=api();return (a&&!a.busy)?a.files():null},
  dirtyNow:function(){var a=api();return !!a&&a.state.mode==='edit'&&(a.edits||0)>base},
  markSaved:function(){var a=api();base=a?(a.edits||0):0},
  closeMenu:function(){var a=api();return !!(a&&a.closeMenu&&a.closeMenu())},
  scrollY:function(){try{return frame.contentWindow.scrollY||0}catch(e){return 0}},
  info:function(){
    var a=api();if(!a)return {ready:false};
    var s=a.state,st=a.stats();
    return {ready:true,mode:s.mode,status:s.status,source:s.source,count:s.count,filtered:s.filtered,refreshing:s.refreshing,refreshFailed:s.refreshFailed,error:s.error,errors:s.errors.slice(),webgl:st.webgl,frames:st.frames,res:st.res};
  }
};
})();
