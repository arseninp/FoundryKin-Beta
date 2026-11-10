/* Approved editor forms preserve distinct source records, models and owned resources. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const APPROVED=Object.freeze({
 cauldron:Object.freeze({lava:'lava_cauldron'}),
 bamboo:Object.freeze({shoot:'bamboo_sapling'}),
 torchflower:Object.freeze({crop:'torchflower_crop'}),
 cave_vines:Object.freeze({body:'cave_vines_body_with_berries',head:'cave_vines_head_with_berries'}),
 standing_banner:Object.freeze({wall:'wall_banner'}),
 pumpkin:Object.freeze({stem:'pumpkin_stem'}),
 melon_block:Object.freeze({stem:'melon_stem'})
});
const PRESENTATIONS=Object.freeze(Object.fromEntries([
 ['skeleton','skull','skeleton_skull','skull'],
 ['wither_skeleton','skull','wither_skeleton_skull','skull'],
 ['creeper','head','creeper_head','skull'],
 ['zombie','head','zombie_head','skull'],
 ['piglin','head','piglin_head','skull'],
 ['ender_dragon','head','dragon_head','skull'],
 ['player','head','player_head','skull'],
 ...['','exposed_','weathered_','oxidized_'].map(prefix=>[prefix+'copper_golem','statue',prefix+'copper_golem_statue','copper_golem_statue'])
].map(([card,form,id,model])=>[card,Object.freeze({form,id,model})])));
export function familyDefault(records,base,forms) {
 if(!dictionary(records)||typeof base!=='string'||!dictionary(forms))throw new Error('Invalid family default input');
 if(own(records,base))return 'native';
 const spec=own(PRESENTATIONS,base)?PRESENTATIONS[base]:null;
 if(!spec||Object.keys(forms).length!==1||!own(forms,spec.form)||forms[spec.form]!==spec.id||!own(records,spec.id)||records[spec.id]?.model!==spec.model)throw new Error('Invalid family base: '+base);
 return spec.form;
}
export function familyRules(records,explicit={}) {
 if(!dictionary(records)||!dictionary(explicit))throw new Error('Invalid family rule input');
 const result=Object.create(null);
 for(const [base,forms] of Object.entries(APPROVED)) {
  if(own(records,base)&&Object.values(forms).every(id=>own(records,id)))result[base]={...forms};
 }
 const signs=new Map();
 for(const [id,record] of Object.entries(records)) {
  const source=record?.source;
  if(record?.model!=='sign'||!dictionary(source)||source.kind!=='block-entity'||source.template!=='sign'||!['standing','wall'].includes(source.placement))continue;
  if(typeof source.wood!=='string'||!/^[a-z][a-z0-9_]*$/.test(source.wood))throw new Error('Invalid sign family source: '+id);
  const placements=signs.get(source.wood)??Object.create(null);
  if(own(placements,source.placement))throw new Error('Ambiguous sign family source: '+source.wood+':'+source.placement);
  placements[source.placement]=id;signs.set(source.wood,placements);
 }
 for(const placements of signs.values())if(placements.standing&&placements.wall)result[placements.standing]={wall:placements.wall};
 for(const [base,spec] of Object.entries(PRESENTATIONS)) {
  if(!own(records,spec.id))continue;
  if(records[spec.id]?.model!==spec.model)throw new Error('Presentation model mismatch: '+spec.id);
  result[base]={[spec.form]:spec.id};
 }
 for(const [base,forms] of Object.entries(explicit)) {
  if(!dictionary(forms))throw new Error('Invalid family forms: '+base);
  const merged=Object.assign(Object.create(null),result[base]);
  for(const [form,id] of Object.entries(forms)) {
   if(own(merged,form)&&merged[form]!==id)throw new Error('Conflicting family form: '+base+':'+form);
   merged[form]=id;
  }
  result[base]=merged;
 }
 return result;
}
