/* Explicit review labels for source logs, wood, stems, hyphae and bamboo blocks. */
const TREES=[
 ['acacia','Acacia','акации'],
 ['birch','Birch','берёзы'],
 ['cherry','Cherry','вишни'],
 ['dark_oak','Dark oak','тёмного дуба'],
 ['jungle','Jungle','тропического дерева'],
 ['mangrove','Mangrove','мангрового дерева'],
 ['oak','Oak','дуба'],
 ['pale_oak','Pale oak','бледного дуба'],
 ['poplar','Poplar','тополя'],
 ['spruce','Spruce','ели']
];
const FORMS=[
 ['','log','Бревно '],
 ['','wood','Древесина '],
 ['stripped_','log','Обтёсанное бревно '],
 ['stripped_','wood','Обтёсанная древесина ']
];
const OTHER=[
 ['crimson_stem','Crimson stem','Багровый стебель'],
 ['crimson_hyphae','Crimson hyphae','Багровые гифы'],
 ['stripped_crimson_stem','Stripped crimson stem','Обтёсанный багровый стебель'],
 ['stripped_crimson_hyphae','Stripped crimson hyphae','Обтёсанные багровые гифы'],
 ['warped_stem','Warped stem','Искажённый стебель'],
 ['warped_hyphae','Warped hyphae','Искажённые гифы'],
 ['stripped_warped_stem','Stripped warped stem','Обтёсанный искажённый стебель'],
 ['stripped_warped_hyphae','Stripped warped hyphae','Обтёсанные искажённые гифы'],
 ['bamboo_block','Bamboo block','Блок бамбука'],
 ['stripped_bamboo_block','Stripped bamboo block','Блок обтёсанного бамбука']
];
export const WOOD_REVIEW_BLOCKS=Object.freeze([
 ...TREES.flatMap(([wood,name,material])=>FORMS.map(([prefix,form,label])=>[
  prefix+wood+'_'+form,(prefix?'Stripped '+name.toLowerCase():name)+' '+form,label+material
 ])),
 ...OTHER.map(row=>[...row])
].map(row=>Object.freeze(row)));
