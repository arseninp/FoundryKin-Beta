/* Explicit review source IDs and EN/RU labels. No catalog compilation, DOM or storage. */
import {createPreviewText} from './preview-text.mjs';
const SHULKER_BOXES=Object.freeze([
 ["undyed","Shulker box","Шалкеровый ящик"],
 ["white","White shulker box","Белый шалкеровый ящик"],
 ["orange","Orange shulker box","Оранжевый шалкеровый ящик"],
 ["magenta","Magenta shulker box","Пурпурный шалкеровый ящик"],
 ["light_blue","Light blue shulker box","Голубой шалкеровый ящик"],
 ["yellow","Yellow shulker box","Жёлтый шалкеровый ящик"],
 ["lime","Lime shulker box","Лаймовый шалкеровый ящик"],
 ["pink","Pink shulker box","Розовый шалкеровый ящик"],
 ["gray","Gray shulker box","Серый шалкеровый ящик"],
 ["light_gray","Light gray shulker box","Светло-серый шалкеровый ящик"],
 ["cyan","Cyan shulker box","Бирюзовый шалкеровый ящик"],
 ["purple","Purple shulker box","Фиолетовый шалкеровый ящик"],
 ["blue","Blue shulker box","Синий шалкеровый ящик"],
 ["brown","Brown shulker box","Коричневый шалкеровый ящик"],
 ["green","Green shulker box","Зелёный шалкеровый ящик"],
 ["red","Red shulker box","Красный шалкеровый ящик"],
 ["black","Black shulker box","Чёрный шалкеровый ящик"]
]);
const WOOL_COLORS=Object.freeze([
 ['white','White','Белая','Белый','Белые'],
 ['orange','Orange','Оранжевая','Оранжевый','Оранжевые'],
 ['magenta','Magenta','Пурпурная','Пурпурный','Пурпурные'],
 ['light_blue','Light blue','Голубая','Голубой','Голубые'],
 ['yellow','Yellow','Жёлтая','Жёлтый','Жёлтые'],
 ['lime','Lime','Лаймовая','Лаймовый','Лаймовые'],
 ['pink','Pink','Розовая','Розовый','Розовые'],
 ['gray','Gray','Серая','Серый','Серые'],
 ['light_gray','Light gray','Светло-серая','Светло-серый','Светло-серые'],
 ['cyan','Cyan','Бирюзовая','Бирюзовый','Бирюзовые'],
 ['purple','Purple','Фиолетовая','Фиолетовый','Фиолетовые'],
 ['blue','Blue','Синяя','Синий','Синие'],
 ['brown','Brown','Коричневая','Коричневый','Коричневые'],
 ['green','Green','Зелёная','Зелёный','Зелёные'],
 ['red','Red','Красная','Красный','Красные'],
 ['black','Black','Чёрная','Чёрный','Чёрные']
]);
const WOOL_FORMS=Object.freeze([
 ['wool','wool','шерсть',2],
 ['carpet','carpet','ковёр',3],
 ['wool_slab','wool slab','шерстяная плита',2],
 ['wool_double_slab','double wool slab','двойная шерстяная плита',2],
 ['wool_stairs','wool stairs','шерстяные ступени',4]
]);
const MATERIAL_FORMS=Object.freeze([
 ['concrete','concrete','бетон',3],
 ['concrete_slab','concrete slab','бетонная плита',2],
 ['concrete_double_slab','double concrete slab','двойная бетонная плита',2],
 ['concrete_stairs','concrete stairs','бетонные ступени',4],
 ['concrete_powder','concrete powder','бетонный порошок',3],
 ['terracotta','terracotta','терракота',2],
 ['stained_glass','stained glass','блок окрашенного стекла',3]
]);
const FINISHING_BLOCKS=Object.freeze([
 ...WOOL_COLORS.flatMap(([color,name,feminine])=>[
  [(color==='light_gray'?'silver':color)+'_glazed_terracotta',name+' glazed terracotta',feminine+' глазурованная терракота'],
  [color+'_stained_glass_pane',name+' stained glass pane',feminine+' окрашенная стеклянная панель']
 ]),
 ['tube_coral_block','Tube coral block','Блок трубчатого коралла'],
 ['dead_tube_coral_block','Dead tube coral block','Блок мёртвого трубчатого коралла'],
 ['brain_coral_block','Brain coral block','Блок мозгового коралла'],
 ['dead_brain_coral_block','Dead brain coral block','Блок мёртвого мозгового коралла'],
 ['bubble_coral_block','Bubble coral block','Блок пузырчатого коралла'],
 ['dead_bubble_coral_block','Dead bubble coral block','Блок мёртвого пузырчатого коралла'],
 ['fire_coral_block','Fire coral block','Блок огненного коралла'],
 ['dead_fire_coral_block','Dead fire coral block','Блок мёртвого огненного коралла'],
 ['horn_coral_block','Horn coral block','Блок рогового коралла'],
 ['dead_horn_coral_block','Dead horn coral block','Блок мёртвого рогового коралла'],
 ['glass','Glass','Стекло'],
 ['glass_pane','Glass pane','Стеклянная панель'],
 ['tinted_glass','Tinted glass','Тонированное стекло'],
 ['hardened_clay','Terracotta','Терракота']
]);
const WOOD_TYPES=Object.freeze([
 ['acacia','Acacia','акации'],
 ['bamboo','Bamboo','бамбука'],
 ['birch','Birch','берёзы'],
 ['cherry','Cherry','вишни'],
 ['crimson','Crimson','багрового дерева'],
 ['dark_oak','Dark oak','тёмного дуба'],
 ['jungle','Jungle','тропического дерева'],
 ['mangrove','Mangrove','мангрового дерева'],
 ['oak','Oak','дуба'],
 ['pale_oak','Pale oak','бледного дуба'],
 ['poplar','Poplar','тополя'],
 ['spruce','Spruce','ели'],
 ['warped','Warped','искажённого дерева']
]);
const WOOD_FORMS=Object.freeze([
 ['planks','planks','Доски из '],
 ['slab','slab','Плита из '],
 ['double_slab','double slab','Двойная плита из '],
 ['stairs','stairs','Ступени из ']
]);
const WOOD_BLOCKS=Object.freeze([
 ...WOOD_TYPES.flatMap(([wood,name,material])=>WOOD_FORMS.map(([form,label,prefix])=>[wood+'_'+form,name+' '+label,prefix+material])),
 ['bamboo_mosaic','Bamboo mosaic','Бамбуковая мозаика'],
 ['bamboo_mosaic_slab','Bamboo mosaic slab','Плита из бамбуковой мозаики'],
 ['bamboo_mosaic_double_slab','Bamboo mosaic double slab','Двойная плита из бамбуковой мозаики'],
 ['bamboo_mosaic_stairs','Bamboo mosaic stairs','Ступени из бамбуковой мозаики']
]);
const WOOD_FIXTURE_FORMS=Object.freeze([
 ['fence','fence','Забор из '],
 ['fence_gate','fence gate','Калитка из '],
 ['button','button','Кнопка из '],
 ['pressure_plate','pressure plate','Нажимная плита из '],
 ['trapdoor','trapdoor','Люк из ']
]);
const OAK_FIXTURE_IDS=Object.freeze({fence_gate:'fence_gate',button:'wooden_button',pressure_plate:'wooden_pressure_plate',trapdoor:'trapdoor'});
const FIXTURE_BLOCKS=Object.freeze([
 ...WOOD_TYPES.flatMap(([wood,name,material])=>WOOD_FIXTURE_FORMS.filter(([form])=>wood!=='bamboo'||!['fence','fence_gate'].includes(form)).map(([form,label,prefix])=>[wood==='oak'?(OAK_FIXTURE_IDS[form]??wood+'_'+form):wood+'_'+form,name+' '+label,prefix+material])),
 ['nether_brick_fence','Nether brick fence','Забор из кирпичей Нижнего мира'],
 ['iron_trapdoor','Iron trapdoor','Железный люк'],
 ['copper_trapdoor','Copper trapdoor','Медный люк'],
 ['waxed_copper_trapdoor','Waxed copper trapdoor','Вощёный медный люк'],
 ['exposed_copper_trapdoor','Exposed copper trapdoor','Потемневший медный люк'],
 ['waxed_exposed_copper_trapdoor','Waxed exposed copper trapdoor','Вощёный потемневший медный люк'],
 ['weathered_copper_trapdoor','Weathered copper trapdoor','Состарившийся медный люк'],
 ['waxed_weathered_copper_trapdoor','Waxed weathered copper trapdoor','Вощёный состарившийся медный люк'],
 ['oxidized_copper_trapdoor','Oxidized copper trapdoor','Окисленный медный люк'],
 ['waxed_oxidized_copper_trapdoor','Waxed oxidized copper trapdoor','Вощёный окисленный медный люк'],
 ['stone_button','Stone button','Каменная кнопка'],
 ['stone_pressure_plate','Stone pressure plate','Каменная нажимная плита'],
 ['polished_blackstone_button','Polished blackstone button','Кнопка из полированного чернита'],
 ['polished_blackstone_pressure_plate','Polished blackstone pressure plate','Нажимная плита из полированного чернита'],
 ['heavy_weighted_pressure_plate','Heavy weighted pressure plate','Железная весовая нажимная плита'],
 ['light_weighted_pressure_plate','Light weighted pressure plate','Золотая весовая нажимная плита']
]);
const CANDLE_BLOCKS=Object.freeze([['candle','Candle','Свеча'],...WOOL_COLORS.map(([color,en,ru])=>[color+'_candle',en+' candle',ru+' свеча'])]);
export const REVIEW_IDS=Object.freeze(['pumpkin','carved_pumpkin','lit_pumpkin','pumpkin_stem','melon_block','melon_stem','budding_amethyst','small_amethyst_bud','medium_amethyst_bud','large_amethyst_bud','amethyst_cluster','seagrass','mangrove_propagule','kelp','closed_eyeblossom','open_eyeblossom','firefly_bush',...['','exposed_','weathered_','oxidized_'].map(prefix=>prefix+'copper_golem_statue'),'skeleton_skull','wither_skeleton_skull','creeper_head','zombie_head','piglin_head','dragon_head','decorated_pot','conduit','water','flowing_water','lava','flowing_lava','chest','trapped_chest','ender_chest',...['','exposed_','weathered_','oxidized_'].flatMap(prefix=>[prefix+'copper_chest','waxed_'+prefix+'copper_chest']),...SHULKER_BOXES.map(([color])=>color+'_shulker_box'),'bell','player_head','fire','soul_fire','campfire','soul_campfire','barrel','dried_ghast','sculk_sensor','calibrated_sculk_sensor','sculk_shrieker','sculk_catalyst','composter','scaffolding','slime','honey_block','cactus','weeping_vines','twisting_vines','portal','end_portal_frame','trip_wire','tripwire_hook','heavy_core','iron_bars',...['','exposed_','weathered_','oxidized_'].flatMap(prefix=>[prefix+'copper_bars','waxed_'+prefix+'copper_bars']),'ladder','lectern','hopper','grindstone','flower_pot','dragon_egg','grass_path','stonecutter_block','sea_pickle','lever','bush','cactus_flower','deadbush','crimson_roots','warped_roots','crimson_fungus','warped_fungus','nether_sprouts','fern','short_grass','short_dry_grass','tall_dry_grass','reeds','hanging_roots','web','tube_coral','brain_coral','bubble_coral','fire_coral','horn_coral','dead_tube_coral','dead_brain_coral','dead_bubble_coral','dead_fire_coral','dead_horn_coral','tube_coral_fan','brain_coral_fan','bubble_coral_fan','fire_coral_fan','horn_coral_fan','dead_tube_coral_fan','dead_brain_coral_fan','dead_bubble_coral_fan','dead_fire_coral_fan','dead_horn_coral_fan','golden_dandelion','torchflower','poplar_sapling','lilac','rose_bush','peony','tall_grass','large_fern','sunflower','spore_blossom','pink_petals','wildflowers','nether_wart','torchflower_crop','sweet_berry_bush','wheat','carrots','potatoes','beetroot','azalea','flowering_azalea','bamboo','bamboo_sapling','oak_sapling','spruce_sapling','birch_sapling','jungle_sapling','acacia_sapling','dark_oak_sapling','cherry_sapling','pale_oak_sapling','dandelion','poppy','blue_orchid','allium','azure_bluet','red_tulip','orange_tulip','white_tulip','pink_tulip','oxeye_daisy','cornflower','lily_of_the_valley','wither_rose','brown_mushroom','red_mushroom','pale_hanging_moss','pale_moss_carpet','big_dripleaf','small_dripleaf_block','pitcher_crop','pitcher_plant','cave_vines','cave_vines_body_with_berries','cave_vines_head_with_berries','chorus_plant','chorus_flower','cocoa','farmland','snow_layer','end_rod','frame','glow_frame','enchanting_table','bee_nest','beehive','brown_mushroom_block','red_mushroom_block','mushroom_stem','nether_wart_block','warped_wart_block','shroomlight','moss_block','pale_moss_block','vine','glow_lichen','sculk_vein','resin_clump','waterlily','leaf_litter','frog_spawn','moss_carpet','mangrove_roots','muddy_mangrove_roots','dirt_with_roots','podzol','mycelium','crimson_nylium','warped_nylium','bubble_column',...WOOL_COLORS.flatMap(([color])=>WOOL_FORMS.map(([form])=>color+'_'+form)),...WOOL_COLORS.flatMap(([color])=>MATERIAL_FORMS.map(([form])=>color+'_'+form)),...FINISHING_BLOCKS.map(([id])=>id),...WOOD_BLOCKS.map(([id])=>id),...FIXTURE_BLOCKS.map(([id])=>id),'bed',...CANDLE_BLOCKS.map(([id])=>id)]);
export const TEXT=Object.fromEntries(Object.entries(createPreviewText({SHULKER_BOXES,WOOL_COLORS,WOOL_FORMS,MATERIAL_FORMS,FINISHING_BLOCKS,WOOD_BLOCKS,FIXTURE_BLOCKS})).map(([lang,labels])=>[lang,{
 ...labels,card_bed:lang==='ru'?'Кровать':'Bed',
 ...Object.fromEntries(WOOL_COLORS.map(([color,en,ru])=>['card_'+color+'_bed',lang==='ru'?ru+' кровать':en+' bed'])),
 ...Object.fromEntries(CANDLE_BLOCKS.map(([id,en,ru])=>['card_'+id,lang==='ru'?ru:en]))
}]));
