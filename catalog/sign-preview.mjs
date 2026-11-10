/* Pure controls for existing hanging-sign placements; no geometry, catalog state or DOM. */
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const MOUNTINGS=Object.freeze(['ceiling','attached','wall']);
const LABELS=Object.freeze({mounting:['Mounting','Крепление'],mounting_ceiling:['Ceiling','Потолочное'],mounting_attached:['Attached','Закреплённое'],mounting_wall:['Wall bracket','Настенный кронштейн']});
const matches=plan=>plan?.model==='sign'&&typeof plan.object?.id==='string'&&/(^|_)hanging_sign$/.test(plan.object.id);
export function signControlState(plan,state) {
 if(!matches(plan))return null;
 if(!dictionary(state))throw new Error('Invalid hanging sign control state');
 const mounting=state.mounting===undefined?'ceiling':state.mounting;
 if(!MOUNTINGS.includes(mounting))throw new Error('Invalid hanging sign control: mounting');
 return {mounting};
}
export function signPreviewField(plan) {
 if(!matches(plan))return null;
 signControlState(plan,plan.state);
 return ['mounting',MOUNTINGS.map(value=>[value,value]),'ceiling'];
}
export function signPreviewLabel(plan,key) {
 return matches(plan)&&own(LABELS,key)?[...LABELS[key]]:null;
}
