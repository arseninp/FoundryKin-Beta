/* FoundryKin i18n: the only source of UI strings. English is the base; other languages override keys. */
(function(){
var DICT={
en:{
  'search.placeholder':"Find",
  'cat.load':"Load blocks.json",
  'tool.pen':"Brush",
  'tool.erase':"Eraser",
  'tool.fill':"Fill",
  'tool.pick':"Pipette",
  'ui.undo':"Undo",
  'ui.redo':"Redo",
  'ui.replace':"Replace",
  'ui.clear':"Clear",
  'ui.download':"Download",
  'shape.cube':"Cube",
  'shape.slab':"Slab",
  'shape.stairs':"Stairs",
  'shape.wall':"Wall",
  'shape.fence':"Fence",
  'shape.gate':"Fence gate",
  'shape.button':"Button",
  'shape.plate':"Pressure plate",
  'shape.trapdoor':"Trapdoor",
  'shape.door':"Door",
  'shape.plant':"Plant",
  'shape.azalea':"Azalea",
  'shape.beacon':"Beacon",
  'shape.candle':"Candle",
  'shape.carpet':"Carpet",
  'shape.rail':"Rail",
  'shape.decal':"Overlay",
  'face.up':"top",
  'face.down':"bottom",
  'face.north':"north",
  'face.south':"south",
  'face.east':"east",
  'face.west':"west",
  'slot.all':"all faces",
  'slot.top':"top",
  'slot.bottom':"bottom",
  'slot.side':"side",
  'slot.sides':"sides",
  'slot.carried':"carried",
  'slot.icon':"icon",
  'slot.core':"core",
  'slot.sapling':"sapling",
  'msg.files_list_failed':"Game file list unavailable ({detail}): showing all blocks.",
  'msg.terrain_failed':"terrain_texture.json failed to load: {detail}",
  'msg.catalog_empty':"Catalog is empty: no blocks with textures in the file.",
  'msg.file_not_json':"File {name} is not valid JSON: {detail}",
  'msg.file_unreadable':"Could not read the file.",
  'msg.png_saved':"PNG: {n} file(s)."
},
ru:{
  'search.placeholder':"Find",
  'cat.load':"Загрузить blocks.json",
  'tool.pen':"Кисть",
  'tool.erase':"Ластик",
  'tool.fill':"Заливка",
  'tool.pick':"Пипетка",
  'ui.undo':"Отмена",
  'ui.redo':"Повтор",
  'ui.replace':"Заменить",
  'ui.clear':"Очистить",
  'ui.download':"Скачать",
  'shape.cube':"Куб",
  'shape.slab':"Плита",
  'shape.stairs':"Ступени",
  'shape.wall':"Стена",
  'shape.fence':"Забор",
  'shape.gate':"Калитка",
  'shape.button':"Кнопка",
  'shape.plate':"Нажимная плита",
  'shape.trapdoor':"Люк",
  'shape.door':"Дверь",
  'shape.plant':"Растение",
  'shape.azalea':"Азалия",
  'shape.beacon':"Маяк",
  'shape.candle':"Свеча",
  'shape.carpet':"Ковёр",
  'shape.rail':"Рельс",
  'shape.decal':"Налёт",
  'face.up':"верх",
  'face.down':"низ",
  'face.north':"север",
  'face.south':"юг",
  'face.east':"восток",
  'face.west':"запад",
  'slot.all':"все грани",
  'slot.top':"верх",
  'slot.bottom':"низ",
  'slot.side':"бок",
  'slot.sides':"бока",
  'slot.carried':"в руке",
  'slot.icon':"иконка",
  'slot.core':"ядро",
  'slot.sapling':"саженец",
  'msg.files_list_failed':"Список файлов игры не получен ({detail}): показаны все блоки.",
  'msg.terrain_failed':"terrain_texture.json не загрузился: {detail}",
  'msg.catalog_empty':"Каталог пустой: в файле нет блоков с текстурами.",
  'msg.file_not_json':"Файл {name} не читается как JSON: {detail}",
  'msg.file_unreadable':"Не удалось прочитать файл.",
  'msg.png_saved':"PNG: {n} файл(а)."
}
};
var KEY='fk070_settings';
function stored(){var s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}return (s&&s.lang)||'auto'}
function detect(){
  var l=stored();
  if(DICT[l])return l;
  var n=String((navigator.languages&&navigator.languages[0])||navigator.language||'en').toLowerCase();
  return n.indexOf('ru')===0?'ru':'en';
}
var lang=detect();
function t(key,p){
  var s=DICT[lang]&&DICT[lang][key];
  if(s===undefined)s=DICT.en[key];
  if(s===undefined)return key;
  return p?s.replace(/\{(\w+)\}/g,function(m,k){return p[k]===undefined?m:p[k]}):s;
}
function apply(root){
  (root||document).querySelectorAll('[data-i18n]').forEach(function(e){e.textContent=t(e.getAttribute('data-i18n'))});
  (root||document).querySelectorAll('[data-i18n-attr]').forEach(function(e){
    e.getAttribute('data-i18n-attr').split(' ').forEach(function(pair){var a=pair.split(':');if(a[1])e.setAttribute(a[0],t(a[1]))});
  });
}
window.FK={
  t:t,apply:apply,
  lang:function(){return lang},
  setting:stored,
  languages:Object.keys(DICT),
  set:function(l){
    var s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
    s=s||{};s.lang=l;
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    lang=detect();
  }
};
})();
