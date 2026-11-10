/* Banner layers are preview state in the existing picker, never edited PNG selection. */
import {BANNER_PATTERNS} from './rules/banner-sources.mjs';
import {BANNER_COLORS} from './banner-preview.mjs';
const own=(object,key)=>Object.hasOwn(object,key);
const dictionary=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function layers(value){
 if(!Array.isArray(value)||value.length>16)throw new Error('Invalid banner control layers');
 return Array.from(value,layer=>{
  if(!dictionary(layer)||!BANNER_PATTERNS.includes(layer.pattern)||typeof layer.color!=='string'||!own(BANNER_COLORS,layer.color))throw new Error('Invalid banner control layer');
  return {pattern:layer.pattern,color:layer.color};
 });
}
const LABELS={square_bottom_left:['Bottom-left square','Нижний левый квадрат'],square_bottom_right:['Bottom-right square','Нижний правый квадрат'],square_top_left:['Top-left square','Верхний левый квадрат'],square_top_right:['Top-right square','Верхний правый квадрат'],stripe_bottom:['Bottom stripe','Нижняя полоса'],stripe_top:['Top stripe','Верхняя полоса'],stripe_left:['Left stripe','Левая полоса'],stripe_right:['Right stripe','Правая полоса'],stripe_center:['Center stripe','Вертикальная полоса'],stripe_middle:['Middle stripe','Горизонтальная полоса'],stripe_downright:['Down-right stripe','Диагональ вправо'],stripe_downleft:['Down-left stripe','Диагональ влево'],small_stripes:['Small stripes','Мелкие полосы'],cross:['Diagonal cross','Диагональный крест'],straight_cross:['Straight cross','Прямой крест'],triangle_bottom:['Bottom triangle','Нижний треугольник'],triangle_top:['Top triangle','Верхний треугольник'],triangles_bottom:['Bottom triangles','Нижние треугольники'],triangles_top:['Top triangles','Верхние треугольники'],diagonal_left:['Diagonal left','Диагональная половина слева'],diagonal_up_right:['Diagonal upper right','Диагональная половина сверху справа'],diagonal_up_left:['Diagonal upper left','Диагональная половина сверху слева'],diagonal_right:['Diagonal right','Диагональная половина справа'],circle:['Circle','Круг'],rhombus:['Rhombus','Ромб'],half_vertical:['Vertical half','Вертикальная половина'],half_horizontal:['Horizontal half','Горизонтальная половина'],half_vertical_right:['Right vertical half','Правая вертикальная половина'],half_horizontal_bottom:['Bottom horizontal half','Нижняя горизонтальная половина'],border:['Border','Кайма'],curly_border:['Indented border','Зубчатая кайма'],gradient:['Gradient','Градиент'],gradient_up:['Upward gradient','Обратный градиент'],bricks:['Bricks','Кирпичи'],globe:['Globe','Глобус'],creeper:['Creeper','Крипер'],skull:['Skull','Череп'],flower:['Flower','Цветок'],mojang:['Mojang','Mojang'],piglin:['Piglin','Пиглин'],flow:['Flow','Поток'],guster:['Guster','Вихрь']};
export function bannerControlSpec(catalog,plan,schema,state){
 if(plan.model!=='banner')return;
 const record=catalog.records?.[plan.object.id],source=record?.source,selected=layers(plan.state.patterns??[]);
 if(source?.template!=='banner'||!dictionary(source.patterns))throw new Error('Missing declared banner patterns');
 const patterns=BANNER_PATTERNS.filter(pattern=>own(source.patterns,pattern));
 if(!patterns.length||selected.some(layer=>!patterns.includes(layer.pattern)))throw new Error('Missing banner control pattern');
 if(plan.state.ominous)return;
 const colors=schema.find(field=>field.key==='color')?.values;
 if(!Array.isArray(colors)||colors.length!==Object.keys(BANNER_COLORS).length||colors.some(option=>!own(BANNER_COLORS,option.value)))throw new Error('Missing shared banner color options');
 schema.push({key:'banner_layers',label:['Pattern layers (bottom to top)','Слоёв рисунка (снизу вверх)'],values:Array.from({length:17},(_,value)=>({value,label:[String(value),String(value)]}))});
 state.banner_layers=selected.length;
 if(selected.length>0){
  const values=[{value:'none',label:['Choose an action','Выбрать действие']}];
  selected.forEach((layer,index)=>{
   const number=index+1;
   values.push({value:index+'_remove',label:['Remove layer '+number+' from preview','Убрать слой '+number+' из просмотра']});
   if(index<selected.length-1)values.push({value:index+'_up',label:['Layer '+number+' one step up','Слой '+number+' на один выше']});
   if(index>0)values.push({value:index+'_down',label:['Layer '+number+' one step down','Слой '+number+' на один ниже']});
  });
  schema.push({key:'banner_move',label:['Layer actions (bottom to top)','Действия со слоями (снизу вверх)'],values});
  state.banner_move='none';
 }
 selected.forEach((layer,index)=>{
  const pattern='banner_pattern_'+index,color='banner_color_'+index,number=index+1;
  schema.push({key:pattern,label:['Layer '+number+' pattern','Слой '+number+' — рисунок'],values:patterns.map(value=>({value,label:[...(LABELS[value]??[value,value])]}))});
  schema.push({key:color,label:['Layer '+number+' color','Слой '+number+' — цвет'],values:colors.map(option=>({value:option.value,label:[...option.label]}))});
  state[pattern]=layer.pattern;state[color]=layer.color;
 });
}
export function bannerControlState(plan,state){
 if(plan.model!=='banner')return;
 const previous=layers(plan.state.patterns??[]),count=state.banner_layers===undefined?previous.length:state.banner_layers;
 if(!Number.isInteger(count)||count<0||count>16)throw new Error('Invalid banner layer count');
 if(typeof state.ominous!=='boolean')throw new Error('Invalid banner ominous control');
 const selected=state.ominous?previous:layers(Array.from({length:count},(_,index)=>({pattern:state['banner_pattern_'+index]===undefined?(previous[index]?.pattern??BANNER_PATTERNS[0]):state['banner_pattern_'+index],color:state['banner_color_'+index]===undefined?(previous[index]?.color??'black'):state['banner_color_'+index]})));
 const move=state.banner_move===undefined?'none':state.banner_move;
 if(move!=='none'){
  const match=typeof move==='string'?/^(0|[1-9]\d*)_(up|down|remove)$/.exec(move):null;
  if(!match||state.ominous)throw new Error('Invalid banner layer move');
  const from=Number(match[1]);
  if(from<0||from>=selected.length)throw new Error('Invalid banner layer move');
  if(match[2]==='remove')selected.splice(from,1);
  else{
   const to=from+(match[2]==='up'?1:-1);
   if(to<0||to>=selected.length)throw new Error('Invalid banner layer move');
   [selected[from],selected[to]]=[selected[to],selected[from]];
  }
 }
 for(const key of Object.keys(state))if(/^banner_(?:layers|move|pattern_\d+|color_\d+)$/.test(key))delete state[key];
 state.patterns=selected;
}
