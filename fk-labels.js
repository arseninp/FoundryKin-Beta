/* fk-labels.js: slot names built only from face names become "Other" when the file name gives no hint. */
(function(){
var slots=document.getElementById('slots');if(!slots)return;
var FACES=/^(top|bottom|side|north|south|east|west|up|down)( \+ (top|bottom|side|north|south|east|west|up|down))+$/;
var WORDS={top:1,bottom:1,side:1,north:1,south:1,east:1,west:1,up:1,down:1,front:1,back:1,left:1,right:1,inner:1,outer:1,all:1};
function word(){var l='en';try{l=window.FK&&window.FK.lang?window.FK.lang():'en'}catch(e){}return l==='ru'?'Другое':'Other'}
function run(){
  var list=[];
  Array.prototype.forEach.call(slots.querySelectorAll('button'),function(b){
    if(!FACES.test(b.textContent.trim()))return;
    var name=String(b.dataset.id||b.title||'').split('/').pop().split(/[^a-zA-Z]+/);
    if(name.some(function(t){return WORDS[t.toLowerCase()]}))return;
    list.push(b);
  });
  list.forEach(function(b,i){b.textContent=word()+(list.length>1?' '+(i+1):'')});
}
new MutationObserver(run).observe(slots,{childList:true,subtree:true,characterData:true});
run();
})();
