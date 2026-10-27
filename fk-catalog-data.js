/* Pinned catalog inputs. No editor state or storage access. */
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
  if(!f||! /^(?:(?:blocks|terrain|existing|auxiliary)-[0-9]{3}|report)\.json$/.test(f.name)||! /^[0-9a-f]{64}$/.test(f.sha256)||seen[f.name])throw new Error('Invalid catalog file descriptor');
  seen[f.name]=true;
 });
 return m;
}
function assemble(m,parts){
 var d={blocks:{},terrain:{texture_data:{}},existing:{},auxiliary:{},source:m.source};
 parts.forEach(function(p){
  var section=p.name.split('-')[0],target=section==='terrain'?d.terrain.texture_data:d[section];
  if(!target)return;
  if(!p.value||typeof p.value!=='object'||Array.isArray(p.value))throw new Error('Invalid catalog section');
  Object.keys(p.value).forEach(function(k){if(Object.prototype.hasOwnProperty.call(target,k))throw new Error('Duplicate catalog key: '+k);Object.defineProperty(target,k,{value:p.value[k],enumerable:true,writable:true,configurable:true})});
 });
 if(!Object.keys(d.blocks).length||Object.keys(d.blocks).length!==m.counts.blocks||Object.keys(d.terrain.texture_data).length!==m.counts.terrain||Object.keys(d.existing).length!==m.counts.existing)throw new Error('Catalog counts do not match manifest');
 return d;
}
function load(){
 if(!pending)pending=read(BASE+'manifest.json').then(function(t){return manifest(JSON.parse(t))}).then(function(m){
  return Promise.all(m.files.map(function(f){return read(BASE+f.name).then(function(t){return hash(t).then(function(h){if(h!==f.sha256)throw new Error('Catalog checksum mismatch: '+f.name);return {name:f.name,value:JSON.parse(t)}})})})).then(function(parts){return assemble(m,parts)});
 }).catch(function(e){pending=null;throw e});
 return pending;
}
root.FKCatalogData={load:load,commit:COMMIT};
})(window);
