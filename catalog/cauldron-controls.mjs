/* Cauldron fields use the existing family picker; edited PNGs never select contents. */
const own=(object,key)=>Object.hasOwn(object,key);
export function cauldronField(plan){
 const lava=plan.object.id==='lava_cauldron';
 return ['content',(lava?['empty','lava']:['empty','water','colored_water']).map(value=>[value,value]),lava?'lava':'empty'];
}
export function cauldronFormLabels(plan,schema){
 if(plan.model!=='cauldron'||plan.forms?.native!=='cauldron'||plan.forms?.lava!=='lava_cauldron')return;
 const field=schema.find(item=>item.key==='form');
 if(!field)throw new Error('Missing cauldron family control');
 field.label=['Cauldron variant','Вариант котла'];
 for(const option of field.values)if(option.value==='native')option.label=['Ordinary','Обычный'];else if(option.value==='lava')option.label=['Lava','С лавой'];
}
export function cauldronFormState(plan,form,state){
 if(plan.model!=='cauldron'||form===undefined||form===plan.object.form||!plan.forms||!own(plan.forms,form))return;
 const lava=plan.forms[form]==='lava_cauldron';
 if(!(lava?['empty','lava']:['empty','water','colored_water']).includes(state.content))delete state.content;
}
