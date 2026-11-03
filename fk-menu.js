/* One shared menu manager per document; no drawing tools or catalog dependencies. */
(function(root){
'use strict';
var FKM={cur:null,pushed:0,skip:false};
FKM.mark=function(m,on){(m.triggers||[]).forEach(function(t){t.classList.toggle('fkTrigOn',on)});root.document.body.classList.toggle('fkMenuOpen',on)};
FKM.open=function(m){
  if(FKM.cur===m)return;
  if(FKM.cur){FKM.cur.hide();FKM.mark(FKM.cur,false)}
  m.show();FKM.cur=m;FKM.mark(m,true);
  if(!FKM.pushed){try{root.history.pushState({fk:1},'');FKM.pushed=1}catch(e){}}
};
FKM.close=function(){
  var m=FKM.cur;if(!m)return;
  FKM.cur=null;m.hide();FKM.mark(m,false);
  if(FKM.pushed){FKM.pushed=0;FKM.skip=true;try{root.history.back()}catch(e){FKM.skip=false}}
};
FKM.toggle=function(m){if(FKM.cur===m)FKM.close();else FKM.open(m)};
root.addEventListener('popstate',function(){
  if(FKM.skip){FKM.skip=false;return}
  var m=FKM.cur;if(m){FKM.cur=null;FKM.pushed=0;m.hide();FKM.mark(m,false)}
});
root.FKM=FKM;
})(window);
