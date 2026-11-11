/* FKLog: bounded in-memory diagnostic log. No storage, network or DOM access. */
(function(){
var MAX=400,PNG='data:image/png;base64,',SIG=[137,80,78,71,13,10,26,10],events=[],counts={info:0,warn:0,error:0},seq=0,start=Date.now();
function clip(value,limit){var text;try{text=typeof value==='string'?value:JSON.stringify(value)}catch(e){text=String(value)}if(text===undefined)text='';return text.length>limit?text.slice(0,limit)+'…':text}
function add(level,area,message,data){
 if(counts[level]===undefined)level='info';
 counts[level]++;
 var event={n:++seq,t:Date.now()-start,level:level,area:clip(area,24),message:clip(message,300)};
 if(data!==undefined)event.data=clip(data,600);
 events.push(event);if(events.length>MAX)events.shift();
 return event;
}
function fail(area,error,data){
 var message=error&&error.message!==undefined?error.message:String(error),stack=error&&error.stack?String(error.stack).split('\n').slice(0,4).join(' | '):'';
 return add('error',area,message,[data===undefined?'':clip(data,300),stack].filter(Boolean).join(' '));
}
function timer(area,message){
 var begin=performance.now();
 return function(data){return add('info',area,message+' '+Math.round(performance.now()-begin)+' ms',data)};
}
function u32(text,offset){return text.charCodeAt(offset)*16777216+(text.charCodeAt(offset+1)<<16)+(text.charCodeAt(offset+2)<<8)+text.charCodeAt(offset+3)}
/* Reads only the PNG signature and IHDR from a data URL, with the same size limits as the editor. */
function inspectPng(data){
 if(typeof data!=='string'||data.indexOf(PNG)!==0)return {ok:false,reason:'not a PNG data URL',bytes:typeof data==='string'?data.length:0};
 var body=data.slice(PNG.length),bytes=Math.floor(body.length*3/4),head;
 if(body.length<32)return {ok:false,reason:'truncated header',bytes:bytes};
 try{head=atob(body.slice(0,32))}catch(e){return {ok:false,reason:'invalid base64',bytes:bytes}}
 for(var i=0;i<8;i++)if(head.charCodeAt(i)!==SIG[i])return {ok:false,reason:'bad PNG signature',bytes:bytes};
 if(head.slice(12,16)!=='IHDR')return {ok:false,reason:'missing IHDR',bytes:bytes};
 var width=u32(head,16),height=u32(head,20),ok=width>=1&&height>=1&&width<=16384&&height<=16384&&width*height<=16777216;
 return {ok:ok,reason:ok?'':'size out of range',width:width,height:height,bytes:bytes};
}
function inspectAll(rows){
 var bad=[],bytes=0,total=0;
 (rows||[]).forEach(function(row){
  if(!row||!row.data)return;
  var info=inspectPng(row.data);total++;bytes+=info.bytes;
  if(!info.ok)bad.push({path:String(row.path),reason:info.reason,width:info.width,height:info.height,bytes:info.bytes});
 });
 return {total:total,bytes:bytes,bad:bad};
}
function dump(limit){
 var shown=events.slice(-(limit||80)),lines=['events: '+seq+' (errors '+counts.error+', warnings '+counts.warn+'), showing last '+shown.length];
 shown.forEach(function(event){
  lines.push('#'+event.n+' +'+(event.t/1000).toFixed(1)+'s '+event.level.toUpperCase()+' '+event.area+': '+event.message+(event.data?' | '+event.data:''));
 });
 return lines.join('\n');
}
window.FKLog={
 add:add,info:function(area,message,data){return add('info',area,message,data)},warn:function(area,message,data){return add('warn',area,message,data)},
 error:fail,timer:timer,inspectPng:inspectPng,inspectAll:inspectAll,dump:dump,
 counts:function(){return {info:counts.info,warn:counts.warn,error:counts.error}},
 clear:function(){events.length=0}
};
})();
