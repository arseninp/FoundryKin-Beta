/* fk-editor.js: loads the editor iframe. It is the only boundary between the shell and the editor. */
var FKE=(function(){
var frame=null,url='',mode='search',cb={},ready=false,wantEdit=false;
var base=0,savedY=0,pendingName='',theme='light',packProvider=null,scrollCb=null,subs=[];
function win(){try{return frame&&frame.contentWindow}catch(e){return null}}
function doc(){try{return frame&&frame.contentDocument}catch(e){return null}}
function api(){var w=win();return (w&&w.FKAPI)||null}
function grid(){var a=api();return (a&&a.grid)?a.grid():null}
function packMap(){return packProvider?packProvider():{}}
function setTheme(t){
  theme=t;
  var d=doc();
  if(d&&d.documentElement)d.documentElement.setAttribute('data-theme',t);
}
function syncPack(){
  var g=grid(),w=win();
  if(!g)return;
  g.setPack(packMap());
  if(w&&w.FKGRID)w.FKGRID.render();
}
function restore(){
  var g=grid(),w=win();
  if(!g)return;
  g.discard();g.setPack(packMap());
  if(w&&w.FKGRID)w.FKGRID.render();
  setTimeout(function(){try{w.scrollTo(0,savedY)}catch(e){}},30);
}
function setMode(m,name){
  var prev=mode,w=win(),d=doc(),a=api();
  if(name)pendingName=name;
  if(m==='edit'&&prev!=='edit'){
    base=a?a.edits:0;
    try{savedY=w.scrollY}catch(e){}
  }
  mode=m;
  if(d&&d.body){
    d.body.classList.toggle('fk-search',m==='search');
    d.body.classList.toggle('fk-edit',m==='edit');
    try{w.scrollTo(0,m==='edit'?0:savedY)}catch(e){}
  }
  if(m==='search'&&prev==='edit')restore();
  if(cb.onMode)cb.onMode(mode);
}
function hook(){
  var w=win(),a=api();
  if(a)a.subscribe(function(s){subs.forEach(function(f){try{f(s)}catch(e){}})});
  w.addEventListener('scroll',function(){if(scrollCb)scrollCb(w.scrollY)},{passive:true});
}
function open(f,u,callbacks){
  cb=callbacks||{};frame=f;
  if(ready&&url===u){syncPack();setMode('search');return}
  url=u;ready=false;
  f.onload=function(){
    var d=null,why='';
    try{d=f.contentDocument;if(!d||!d.querySelector('#ed'))why='not_editor'}catch(e){why='cross_origin'}
    if(why){url='';if(cb.onError)cb.onError(why,u);return}
    ready=true;setTheme(theme);hook();syncPack();
    setMode(wantEdit?'edit':'search');
  };
  f.src=u;
}
function editTexture(path,data,obj,c){
  c=c||{};wantEdit=true;
  var tries=0;
  function fail(code){wantEdit=false;setMode('search');if(c.onFail)c.onFail(code,path)}
  (function wait(){
    var a=api(),st=a&&a.state;
    if(st&&st.status==='ready'){
      wantEdit=false;
      var g=a.grid(),r;
      g.setPack(packMap());
      if(obj&&g.catalog.b[obj]){a.want='textures/'+path;g.select(obj);r=obj}
      else r=a.openTexture(path,data);
      if(!r){fail('no_block');return}
      pendingName=String(r);setMode('edit');
      return;
    }
    if((st&&(st.status==='failed'||st.status==='empty'))||++tries>80){fail('catalog');return}
    setTimeout(wait,300);
  })();
}
function busy(){var a=api();return !!(a&&a.busy)}
return {
  open:open,setMode:setMode,editTexture:editTexture,syncPack:syncPack,setTheme:setTheme,busy:busy,
  getMode:function(){return mode},
  reset:function(){url='';ready=false},
  setPackProvider:function(fn){packProvider=fn},
  onScroll:function(fn){scrollCb=fn},
  subscribe:function(fn){subs.push(fn)},
  scrollY:function(){var w=win();try{return w?w.scrollY:0}catch(e){return 0}},
  closeMenu:function(){var w=win();if(w&&w.FKM&&w.FKM.cur){w.FKM.close();return true}return false},
  files:function(){var a=api();return (a&&!a.busy)?a.files():null},
  current:function(){if(busy()&&pendingName)return pendingName;var a=api();return a?a.cur():''},
  objInfo:function(){var g=grid();return g?g.obj():null},
  dirtyNow:function(){var a=api();return !!a&&mode==='edit'&&a.edits>base},
  markSaved:function(){var a=api();base=a?a.edits:0},
  info:function(){
    var a=api();
    return {ready:ready,mode:mode,busy:busy(),state:a?a.state:null,stats:a&&a.stats?a.stats():null};
  }
};
})();
