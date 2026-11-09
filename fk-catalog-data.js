/* Pinned catalog inputs and compilation. No editor state or storage access. */
(function(root){
'use strict';
var COMMIT='46ba6ea985fb5a92d79a9419198f10dda14c199d';
var BASE='data/catalog-candidate/',pending=null;
function read(url){return fetch(url,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(url+': HTTP '+r.status);return r.text()})}
function hash(text){
 if(!root.crypto||!root.crypto.subtle||!root.TextEncoder)throw new Error('Catalog verification requires Web Crypto');
 return root.crypto.subtle.digest('SHA-256',new root.TextEncoder().encode(text)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')});
}
function manifest(m){
 if(!m||m.schema!==1||!m.source||m.source.commit!==COMMIT||!Array.isArray(m.files)||!m.counts)throw new Error('Unsupported catalog manifest');
 var seen={};
 m.files.forEach(function(f){
  if(!f||! /^(?:(?:blocks|terrain|items|existing|auxiliary)-[0-9]{3}|report)\.json$/.test(f.name)||! /^[0-9a-f]{64}$/.test(f.sha256)||seen[f.name])throw new Error('Invalid catalog file descriptor');
  seen[f.name]=true;
 });
 return m;
}
function assemble(m,parts){
 if(m.counts.blocks<1)throw new Error('Catalog counts do not match manifest');
 return import('./catalog/load.mjs').then(function(helpers){return helpers.assembleChunks(m,parts)});
}
function load(){
 if(!pending)pending=read(BASE+'manifest.json').then(function(t){return manifest(JSON.parse(t))}).then(function(m){
  return Promise.all(m.files.map(function(f){return read(BASE+f.name).then(function(t){return hash(t).then(function(h){if(h!==f.sha256)throw new Error('Catalog checksum mismatch: '+f.name);return {name:f.name,value:JSON.parse(t)}})})})).then(function(parts){return assemble(m,parts)});
 }).catch(function(e){pending=null;throw e});
 return pending;
}
function loadCompiled(Three){
 return Promise.all([load(),import('./models/library.mjs'),import('./catalog/access.mjs'),import('./catalog/preview.mjs')]).then(function(parts){
  var compiled=parts[1].compileModelCatalog(parts[0],Three);
  return Object.freeze({catalog:compiled.catalog,registry:compiled.registry,coverage:compiled.coverage,access:parts[2].createCatalogAccess(compiled.catalog),resolve:parts[3].createPreviewResolver(compiled.catalog,compiled.registry,Three),source:parts[0].source});
 });
}
root.FKCatalogData={load:load,loadCompiled:loadCompiled,commit:COMMIT};
})(window);
