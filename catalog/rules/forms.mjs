/* Approved editor forms preserve distinct source records, models and owned resources. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const APPROVED=Object.freeze({
 bamboo:Object.freeze({shoot:'bamboo_sapling'}),
 torchflower:Object.freeze({crop:'torchflower_crop'})
});
export function familyRules(records,explicit={}) {
 if(!dictionary(records)||!dictionary(explicit))throw new Error('Invalid family rule input');
 const result=Object.create(null);
 for(const [base,forms] of Object.entries(APPROVED)) {
  if(own(records,base)&&Object.values(forms).every(id=>own(records,id)))result[base]={...forms};
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
