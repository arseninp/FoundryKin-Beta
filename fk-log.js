/* FKLog: bounded in-memory diagnostics. No PNG parser, storage, network or DOM. */
(function(){
'use strict';
var MAX=400,events=[],counts={info:0,warn:0,error:0},seq=0,start=Date.now();
var fields=['stage','source','path','id','model','form','slot','status','count','duration','width','height','cached','reason'];
function text(value,limit){
 var s='';try{s=value==null?'':String(value)}catch(e){s='[unreadable]'}
 s=s.replace(/data:[^\s'"<>)]*/gi,'[data omitted]')
  .replace(/\b(?:https?|file|blob):[^\s'"<>)]*/gi,function(url){return url.split(/[?#]/)[0].replace(/(\/\/)[^/]*@/,'$1[credentials omitted]@')})
  .replace(/([?&#][^\s=&#?]+)=([^\s&#]*)/g,'$1=[omitted]')
  .replace(/\b(authorization|bearer|token|password|secret|api[_-]?key)(?:\s*[:=]\s*|\s+)[^\s,;]+/gi,'$1 [omitted]')
  .replace(/[A-Za-z0-9+/_=-]{120,}/g,'[long value omitted]')
  .replace(/[\u0000-\u001f\u007f]/g,' ');
 return s.length>limit?s.slice(0,limit)+'…':s;
}
function metadata(data){
 if(!data||typeof data!=='object')return '';
 var out={};
 fields.forEach(function(key){
  try{var value=data[key];if(typeof value==='string')out[key]=text(value,160);else if(typeof value==='number'&&Number.isFinite(value))out[key]=Math.round(value*100)/100;else if(typeof value==='boolean')out[key]=value}catch(e){}
 });
 return text(JSON.stringify(out),600);
}
function add(level,area,message,data){
 if(!Object.prototype.hasOwnProperty.call(counts,level))level='info';
 counts[level]=Math.min(Number.MAX_SAFE_INTEGER,counts[level]+1);
 events.push({n:++seq,t:Math.max(0,Date.now()-start),level:level,area:text(area,24),message:text(message,240),data:metadata(data)});
 if(events.length>MAX)events.shift();
}
function fail(area,error,data){
 var message='Unknown error',stack='';
 try{message=error&&error.message!==undefined?error.message:error;stack=error&&error.stack?String(error.stack).split('\n').slice(1,4).join(' | '):''}catch(e){}
 add('error',area,text(message,180)+(stack?' | '+text(stack,180):''),data);
}
function timer(area,message){
 var begin=Date.now();return function(data){
  var details={};fields.forEach(function(key){try{if(data&&data[key]!==undefined)details[key]=data[key]}catch(e){}});
  details.duration=Math.max(0,Date.now()-begin);add('info',area,message,details);
 };
}
function dump(limit){
 limit=Number.isFinite(limit)?Math.max(0,Math.min(80,Math.floor(limit))):60;
 var shown=limit?events.slice(-limit):[],lines=['events: '+seq+' (errors '+counts.error+', warnings '+counts.warn+'), retained '+events.length+', showing last '+shown.length];
 shown.forEach(function(e){lines.push('#'+e.n+' +'+(e.t/1000).toFixed(1)+'s '+e.level.toUpperCase()+' '+e.area+': '+e.message+(e.data&&e.data!=='{}'?' | '+e.data:''))});
 return lines.join('\n');
}
window.FKLog={add:add,info:function(area,message,data){add('info',area,message,data)},warn:function(area,message,data){add('warn',area,message,data)},error:fail,timer:timer,dump:dump,text:text,
 counts:function(){return {info:counts.info,warn:counts.warn,error:counts.error}},
 clear:function(){events.length=0;counts={info:0,warn:0,error:0};seq=0;start=Date.now()}
};
})();
