/* Approved editor forms preserve distinct source records, models and owned resources. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const APPROVED=Object.freeze({
 bamboo:Object.freeze({shoot:'bamboo_sapling'}),
 torchflower:Object.freeze({crop:'torchflower_crop'}),
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
