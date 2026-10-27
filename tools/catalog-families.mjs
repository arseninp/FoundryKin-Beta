/* Build-time family relationships; never discard a variant's resource definition. */
const FORM = /_(slab|stairs|wall|fence_gate|fence|button|pressure_plate|pane|carpet)$/;
const SHAPE = {slab:'slab',stairs:'stairs',wall:'wall',fence_gate:'gate',fence:'fence',button:'button',pressure_plate:'plate',pane:'pane',carpet:'carpet'};
const own = (o,k) => Object.hasOwn(o,k);
function derived(id){return FORM.test(id)||/^double_/.test(id)||/_double_/.test(id)}
function primaryTextures(entry){
 const t=entry.textures;
 if(typeof t==='string')return [t];
 if(!t||typeof t!=='object'||Array.isArray(t))throw new Error('Invalid block textures');
 return [...new Set(Object.values(t).filter(x=>typeof x==='string'))];
}
function materialEvidence(a,b){
 const x=primaryTextures(a),y=primaryTextures(b);
 return x.some(k=>y.includes(k));
}
export function compileFamilies(blocks){
 if(!blocks||typeof blocks!=='object'||Array.isArray(blocks)||!Object.keys(blocks).length)throw new Error('Nonempty block definitions required');
 const ids=Object.keys(blocks).sort(),links={},report={grouped:[],ambiguous:[],standalone:[]};
 for(const id of ids){
  if(!blocks[id]||!blocks[id].textures)throw new Error('Missing resource definition: '+id);
  const match=FORM.exec(id);if(!match||/^double_/.test(id)||/_double_/.test(id))continue;
  const pre=id.slice(0,match.index);
  const candidates=[...new Set([pre,pre+'_block',pre+'_planks',pre+'_wool',pre+'_concrete',pre+'s',pre+'_bricks',pre+'_brick'])].filter(x=>x!==id&&own(blocks,x)&&!derived(x));
  const eligible=candidates.filter(x=>materialEvidence(blocks[id],blocks[x]));
  if(eligible.length===1){links[id]={base:eligible[0],form:SHAPE[match[1]]};report.grouped.push({id,...links[id]})}
  else if(eligible.length>1)report.ambiguous.push({id,candidates:eligible});
  else report.standalone.push({id,candidates,reason:candidates.length?'no-shared-primary-texture':'no-material-parent'});
 }
 const families={},owner={};
 for(const id of ids){
  const link=links[id],base=link?link.base:id;
  if(!own(families,base))families[base]={id:base,variants:[]};
  families[base].variants.push({id,form:link?link.form:'native',resource:structuredClone(blocks[id])});owner[id]=base;
 }
 for(const family of Object.values(families))family.variants.sort((a,b)=>(a.id===family.id?-1:b.id===family.id?1:a.id.localeCompare(b.id)));
 const cards=Object.keys(families).sort();
 if(Object.values(families).reduce((n,f)=>n+f.variants.length,0)!==ids.length)throw new Error('Variant accounting mismatch');
 return {schema:1,cards,families,owner,report};
}
