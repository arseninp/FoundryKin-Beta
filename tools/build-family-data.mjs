/* Build data for the upcoming family-aware editor, not a runtime patch. */
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {compileFamilies} from './catalog-families.mjs';
import {chunks} from './build-catalog-candidate.mjs';
const input=resolve('data/catalog-candidate'),output=resolve('data/catalog-families');
const sha=t=>createHash('sha256').update(t).digest('hex');
const text=await readFile(resolve(input,'manifest.json'),'utf8'),manifest=JSON.parse(text);
if(manifest.schema!==1||manifest.source?.commit!=='46ba6ea985fb5a92d79a9419198f10dda14c199d')throw new Error('Unexpected source catalog');
const blocks={};
for(const f of manifest.files.filter(f=>/^blocks-\d{3}\.json$/.test(f.name))){
 const t=await readFile(resolve(input,f.name),'utf8');
 if(sha(t)!==f.sha256)throw new Error('Source checksum mismatch: '+f.name);
 for(const [id,value] of Object.entries(JSON.parse(t))){if(Object.hasOwn(blocks,id))throw new Error('Duplicate source block: '+id);blocks[id]=value}
}
if(Object.keys(blocks).length!==manifest.counts.blocks)throw new Error('Source block count mismatch');
const result=compileFamilies(blocks),documents=[];
function add(name,value){const text=JSON.stringify(value)+'\n';if(Buffer.byteLength(text)>25000)throw new Error('Oversized generated file: '+name);documents.push({name,text,sha256:sha(text)})}
function section(name,value){chunks(value,22000).forEach((part,i)=>add(name+'-'+String(i).padStart(3,'0')+'.json',part))}
section('families',result.families);
section('owners',result.owner);
const decisions={};
for(const kind of ['grouped','ambiguous','standalone'])for(const row of result.report[kind])decisions[row.id]={kind,...row};
section('decisions',decisions);
const summary={schema:1,source:manifest.source,sourceManifestSha256:sha(text),counts:{blocks:Object.keys(blocks).length,families:result.cards.length,grouped:result.report.grouped.length,ambiguous:result.report.ambiguous.length,standaloneForms:result.report.standalone.length},moss:{ordinary:result.owner.moss_carpet,pale:result.owner.pale_moss_carpet}};
if(summary.moss.ordinary!=='moss_block'||summary.moss.pale!=='pale_moss_block')throw new Error('Moss family regression');
const pale=result.families.pale_moss_block.variants.find(v=>v.id==='pale_moss_carpet');
if(pale.resource.carried_textures!==blocks.pale_moss_carpet.carried_textures)throw new Error('Pale moss resource loss');
add('summary.json',summary);
add('manifest.json',{schema:1,source:manifest.source,sourceManifestSha256:sha(text),counts:summary.counts,files:documents.map(({name,sha256})=>({name,sha256}))});
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const d of documents)await writeFile(resolve(output,d.name),d.text);
