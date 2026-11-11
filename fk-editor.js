/* FKE: bridge between the app shell and the editor document (index.html inside the iframe).
   The editor owns the mode; FKE forwards calls to window.FKAPI and reports changes to the shell. */
var FKE=(function(){
var src='';try{src=String(document.currentScript.src||'')}catch(e){}
var vm=/[?&]v=([\d.]+)/.exec(src),VERSION=vm?vm[1]:'?';
var frame=null,cb={},loaded=null,wantEdit=false,mode='search',base=0,attached=null;
function diagnostic(level,message,data,error){try{var log=window.FKLog;if(log){if(error)log.error('shell',error,data);else log.add(level,'shell',message,data)}}catch(ignored){}}
function safeText(value,limit){try{var log=window.FKLog;return log&&log.text?log.text(value,limit):'[redaction unavailable]'}catch(e){return '[redaction unavailable]'}}
window.addEventListener('error',function(e){diagnostic('error','Shell script error',{stage:'script'},e.error||new Error(e.message||'Script error'))});
window.addEventListener('unhandledrejection',function(e){diagnostic('error','Shell promise rejection',{stage:'promise'},e.reason||new Error('Promise rejected'))});
function win(){try{return frame&&frame.contentWindow}catch(e){return null}}
function api(){try{var w=win();return (w&&w.FKAPI)||null}catch(e){return null}}
function attach(a){
  if(attached===a)return;
  attached=a;
  a.subscribe(function(s){
    if(s.mode!==mode){
      if(s.mode==='edit')base=a.edits||0;
      mode=s.mode;diagnostic('info','Editor mode changed',{status:mode});
      if(cb.onMode)cb.onMode(mode);
    }
    if(cb.onState)cb.onState(s);
  });
}
function editorUrl(url){
  var u=new URL(url,document.baseURI);
  u.searchParams.set('v',window.FK_V||VERSION);
  u.searchParams.set('catalog','unified');
  return u.href;
}
function open(f,url,c){
  cb=c||{};frame=f;url=editorUrl(url);
  var a=api();
  if(loaded===url&&a){attach(a);a.setMode('search');if(cb.onReady)cb.onReady();return}
  loaded=url;attached=null;diagnostic('info','Editor document loading',{stage:'iframe'});
  f.onload=function(){
    var a2=api();
    if(!a2||!a2.subscribe){diagnostic('warn','Editor API unavailable',{stage:'iframe'});loaded=null;if(cb.onError)cb.onError('not_editor',url);return}
    attach(a2);diagnostic('info','Editor document ready',{stage:'iframe'});
    /* A card can be clicked before iframe load finishes; keep that user-selected mode. */
    a2.setMode(wantEdit?'edit':(a2.state&&a2.state.mode)||'search');
    if(cb.onReady)cb.onReady();
  };
  f.src=url;
}
function editTexture(path,data,c){
  c=c||{};wantEdit=true;var tries=0;
  (function poll(){
    var a=api(),r=(a&&a.openTexture)?a.openTexture(path,data,c.obj):null;
    if(r){diagnostic('info','Saved texture opening',{path:path,source:'saved',stage:'reopen'});wantEdit=false;a.setMode('edit');return}
    if(r===false||++tries>40){
      diagnostic('warn','Saved texture could not open',{path:path,source:'saved',stage:'reopen',reason:r===false?'no_block':'no_catalog'});
      wantEdit=false;if(a)a.setMode('search');
      if(c.onFail)c.onFail(r===false?'no_block':'no_catalog');
      return;
    }
    setTimeout(poll,500);
  })();
}
function info(){
  var a=api(),s=a&&a.state,st=null,rejected=[],total=0,availability=a?'unsupported':'not loaded',editorLog='not loaded';
  try{st=a&&a.stats?a.stats():null}catch(e){}
  try{
    if(a&&typeof a.diagnostics==='function'){
      var d=a.diagnostics(),rows=Array.isArray(d&&d.rejected)?d.rejected:[];total=rows.length;
      rejected=rows.slice(0,40).map(function(row){return {path:safeText(row.path,160),error:safeText(row.error,240)}});availability='available';
    }
  }catch(e){availability='unavailable'}
  try{var w=win();if(w&&w.FKLog)editorLog=String(w.FKLog.dump(60)).split('\n').slice(0,61).map(function(line){return safeText(line,900)}).join('\n')}catch(e){editorLog='unavailable'}
  return {
    version:VERSION,mode:mode,ready:!!a,busy:!!(a&&a.busy),
    status:s?s.status:'',source:s?s.source:'',count:s?s.count:0,
    errors:s?s.errors.slice():[],webgl:st?st.webgl:null,frames:st?st.frames:0,
    editor:a&&a.version?a.version:'?',
    diagnostics:{status:availability,rejected:rejected,rejectedCount:total,log:editorLog},
    catalogError:s&&s.error?{code:safeText(s.error.code,40),detail:safeText(s.error.detail,240)}:null
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
  pendingEdit:function(){return wantEdit},
  doc:function(){try{return win().document}catch(e){return null}}
};
})();
