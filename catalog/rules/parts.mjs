/* Named model parts are declared from owned resources, independently of edited slots. */
export function modelPartBindings(record) {
 if(record.model!=='flowerbed'&&record.model!=='sunflower')return null;
 const candidates=[...new Set(Object.values(record.faces??{}).flat())];
 if(record.model==='sunflower') {
  if(record.id!=='sunflower')throw new Error('Unknown sunflower object: '+record.id);
  const find=part=>{
   const paths=candidates.filter(path=>{const name=path.split('/').pop();return name==='sunflower_'+part||name==='double_plant_sunflower_'+part;});
   if(paths.length!==1)throw new Error('Missing or ambiguous sunflower part: '+part);return paths;
  };
  const up=record.faces?.up,down=record.faces?.down;
  if(!Array.isArray(up)||up.length!==1||!Array.isArray(down)||down.length!==1)throw new Error('Missing or ambiguous sunflower stem');
  return {up,down,front:find('front'),back:find('back')};
 }
 if(!['pink_petals','wildflowers'].includes(record.id))throw new Error('Unknown flowerbed object: '+record.id);
 const find=name=>{
  const paths=candidates.filter(path=>path.split('/').pop()===name);
  if(paths.length!==1)throw new Error('Missing or ambiguous flowerbed part: '+name);
  return paths;
 };
 return {flower:find(record.id),stem:find(record.id+'_stem')};
}
