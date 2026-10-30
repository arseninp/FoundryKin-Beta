/* Named model parts are declared from owned resources, independently of edited slots. */
export function modelPartBindings(record) {
 if(record.model!=='flowerbed')return null;
 if(!['pink_petals','wildflowers'].includes(record.id))throw new Error('Unknown flowerbed object: '+record.id);
 const candidates=[...new Set(Object.values(record.faces??{}).flat())];
 const find=name=>{
  const paths=candidates.filter(path=>path.split('/').pop()===name);
  if(paths.length!==1)throw new Error('Missing or ambiguous flowerbed part: '+name);
  return paths;
 };
 return {flower:find(record.id),stem:find(record.id+'_stem')};
}
