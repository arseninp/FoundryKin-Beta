/* FKE: bridge between the app shell and the editor document (index.html inside the iframe).
   The editor owns the mode; FKE forwards calls to window.FKAPI and reports changes to the shell. */
var FKE=(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var frame=null,cb={},loaded=null,wantEdit=false,mode='search',base=0,attached=null;
function win(){try{return frame&&frame.contentWindow}catch(e){return null}}
function api(){try{var w=win();return (w&&w.FKAPI)||null}catch(e){return null}}
function attach(a){
  if(attached===a)return;
  attached=a;
  a.subscribe(function(s){
    if(s.mode!==mode){
      if(s.mode==='edit')base=a.edits||0;
      mode=s.mode;
      if(cb.onMode)cb.onMode(mode);
    }
    if(cb.onState)cb.onState(s);
  });
}
function open(f,url,c){
  cb=c||{};frame=f;
  var a=api();
  if(loaded===url&&a){attach(a);a.setMode('search');if(cb.onReady)cb.onReady();return}
  loaded=url;attached=null;
  f.onload=function(){
    var a2=api();
    if(!a2||!a2.subscribe){loaded=null;if(cb.onError)cb.onError('not_editor',url);return}
    attach(a2);
    try{win().addEventListener('scroll',function(){if(cb.onScroll)cb.onScroll(win().scrollY)},{passive:true})}catch(e){}
    a2.setMode(wantEdit?'edit':'search');
    if(cb.onReady)cb.onReady();
  };
  f.src=url;
}
function editTexture(path,data,c){
  c=c||{};wantEdit=true;var tries=0;
  (function poll(){
    var a=api(),r=(a&&a.openTexture)?a.openTexture(path,data,c.obj):null;
    if(r){wantEdit=false;a.setMode('edit');return}
    if(r===false||++tries>40){
      wantEdit=false;if(a)a.setMode('search');
      if(c.onFail)c.onFail(r===false?'no_block':'no_catalog');
      return;
    }
    setTimeout(poll,500);
  })();
}
function info(){
  var a=api(),s=a&&a.state,st=a&&a.stats?a.stats():null;
  return {
    version:VERSION,mode:mode,ready:!!a,busy:!!(a&&a.busy),
    status:s?s.status:'',source:s?s.source:'',count:s?s.count:0,
    errors:s?s.errors.slice():[],webgl:st?st.webgl:null,frames:st?st.frames:0,
    editor:a&&a.version?a.version:'?'
  };
}
return {
  version:VERSION,
  open:open,editTexture:editTexture,info:info,
  getMode:function(){return mode},
  setMode:function(m){var a=api();if(a)a.setMode(m)},
  reset:function(){loaded=null},
  ready:function(){return !!api()},
  busy:function(){var a=api();return !!(a&&a.busy)},
  files:function(){var a=api();return (a&&!a.busy)?a.files():null},
  current:function(){var a=api();return a?(a.busy&&a.pending?a.pending:a.cur()):''},
  objInfo:function(){var a=api();try{return a?a.grid().obj():null}catch(e){return null}},
  dirtyNow:function(){var a=api();return !!a&&mode==='edit'&&(a.edits||0)>base},
  markSaved:function(){var a=api();base=a?(a.edits||0):0},
  closeMenu:function(){var a=api();return !!(a&&a.closeMenu&&a.closeMenu())},
  scrollY:function(){try{return win().scrollY||0}catch(e){return 0}}
};
})();
