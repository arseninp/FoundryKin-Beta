# ARCHITECTURE

Обновлено 2026-11-03 по OLDCHAT19. Проверенный HEAD до документации: 40c82f0e6e3be884f73d0ee61bf8a8a385e5164d. Записанная основа не равна runtime/визуальной приёмке. Начать с CONTEXT.

## Пути приложения

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежним проверкам UI 0.9.1; HTML здесь заново не проверялся. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → materials/textures → scene. Основной editor не переключён.

df1fcab/f03acbe — material instance/composite и canvas/GPU lifecycle; b0e163d — отдельный read-only preview, e64ef13 — loader timeout/cache/retry. Теперь REVIEW_IDS — 27 source IDs, не число cards/полный каталог. Это не редактор/рисование/export.

## Данные и идентичность

load.mjs читает JSONC/assembleChunks; hashes проверяет вызывающий loader. 2c2773a добавил auxiliary end_gateway/lava_cauldron через общую сборку с manifest/hash/conflict checks по истории. resources.mjs разделяет unique paths/faces/carried и indexed variants/carriedVariants с повторами. normalizeBlock добавляет named parts, door atlases сохраняют половины, furnace normalization ограничена известными парами.

model-policy/rules/models назначают models без unknown→cube. parts/utility-parts/aquatic-parts задают роли/стадии/части. Dependencies разрешают конкретные shared pot/soil, piston head_back, torch, pitcher pod, chorus stem, amethyst growth без ownership transfer.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. access сохраняет source/card/form/state; неоднозначный PNG не отдавать первому владельцу. Alias требует эквивалентности, не общей PNG. Waxed/infested routes сохранять, oxidation/normal/deepslate раздельны. Coral wall fans aliases без mounting; candle cakes с cake, обычные свечи отдельно.

## Карточки и представления

f2479ea: одна closed_eyeblossom card, bloom closed/open, default closed, явный models contract cross/emissive_cross. Обе records/resources/routes/glow остаются; строгая проверка остальных групп сохраняется. Старое требование раздельных cards отменено.

7cb4a83: существующие forms/compile/access различают parent card и реальную source record, familyDefaults выбирает доступную форму без фиктивной entity-record. Головы относятся к skeleton/wither_skeleton/creeper/zombie/piglin/ender_dragon, статуи — к соответствующей стадии copper golem. Source block IDs открывают правильную форму. Полные entities отложены, недоступный Моб не показывать готовым.

df72fa6: request.form отдельно от request.slot/request.state, plan.forms описывает доступные формы. d715eca: default model view голов/статуй — bindings.sheet; явный slot/sprite сохраняют правила. PNG не меняет geometry/state/pose; модель использует объявленные bindings. Общую развёртку не копировать/обрезать.

rules/forms сохраняет bamboo/shoot, torchflower/crop, pumpkin/stem, melon_block/stem. Fruit отдельно либо с соседним соответствующим направленным стеблем, pumpkin variants/ID/owned PNG сохраняются; pumpkin/melon cards раздельны. Composite fruit возвращает forms:null, без второго selector. Budding amethyst без growth либо один small/medium/large/cluster на одной из шести граней; growth shared, исходные cards не сливать.

## Общий интерфейс

2d222fc: FKModelState с явными language/doneLabel/manager/начальным state, сохранением legacy вызова, busy/stale events/dispose. b8cbd84/4b4d417: единые sheet CSS/FKM извлечены из index.html/fk-tools.js в fk-menu.css/fk-menu.js, прежние реализации удалены. 356de40 подключает общий themed picker в preview вместо select состояний. Не создавать второй manager/специальные панели голов.

preview.mjs формирует controls из stateGroups/forms и поддержанных параметров; частные FIELDS/MODEL_FIELDS для части параметров остаются. d715eca хранит form/slot/state раздельно, даёт пункт Текстура/загрузку выбранной PNG вне bindings. Это read-only, не изменение пака. Вращение жестом, без rotation/facing controls голов/статуй; позы статичны, кадры вручную, не плеер.

Адаптивность tablet/desktop — текущий вопрос владельца, а не уже принятая архитектура. Исследовать существующие layout/iframe/CSS/size consumers; готовность широкого макета не установлена. Сохранять телефонный сценарий и paper/design tokens. Новая раскладка/редизайн не согласованы. Последняя реплика ассистента OLDCHAT19 исключена владельцем и не задаёт техническую задачу.

## Материалы и lifecycle

emissive_cross разделяет plant/glow; registry хранит immutable emissiveRoles. createModelMaterials принимает descriptor/bindings/classified textures с isTexture и boolean userData.semi: Basic для sprite/glow, Lambert для обычных ролей; lit/unlit конфликт одного path отклоняется.

semi=true → transparent=true, alphaTest=0, depthWrite=false; иначе transparent=false, alphaTest=.05, depthWrite=true. Default FrontSide/depthTest; planar builders задают DoubleSide. Materials владеют своими материалами/заимствуют textures; texture layer владеет созданными GPU textures. Composite учитывает все части/update/cleanup ошибок.

## Block entities и источники

createModelLibrary регистрирует/запечатывает builders. compileModelCatalog проверяет assignments/builders, unresolved/missing блокируют full compile, затем compileCatalog/registry.validate. Slice не ослабляет strict compiler. Builder counts не равны cards/успешным тестам; свежего coverage нет.

- Bed: девять частей с legacy geometry/UV, 16 owned sheets, light_gray→silver, bed→red_bed без лишней card, reuse icons.
- Sign: 4448dca geometry standing/wall/hanging по acacia-rs/acacia@750f657, не Mojang export; f1d0922 sheets пород с IDs/resources/icons/states. Standing/attached — rotation, ceiling/wall — facing; подозрение ceiling rotation снято. Bedrock UV/WebGL не приняты.
- Cauldron: lava_cauldron сохраняет прежний корпус/UV, отдельная лава по умолчанию; PNG не переключает содержимое. Auxiliary вход записан.
- Chest: normal/trapped/ender и восемь медных ID. double использует собственные wide sheets обычного/ловушки/медных, ender double запрещён. Static open поднимает крышку/замок, корпус остаётся; facing/double совместимы по истории.
- Shulker: base/lid pinned geometry без головы, шесть направлений, все sheets, light gray→shulker_silver. Цвета не сливать. Static open — подъём/поворот lid, Java-reference кандидат, Bedrock не принят.
- Banner: standing/wall static candidates, owned base/pattern; banner-preview canvas composition, 16 color/ordered patterns, пересборка при image update. Источники не перезаписывать, tint только полотна. Ominous — banner_illager без recolor/layers; обычные параметры сохраняются, отдельной card нет. Реальные TGA/WebGL открыты.
- Copper statue: d7fb217 geometry standing/sitting/running/star, bd83fbd sheets четырёх стадий, 8e64e04 preview menu. Источники уже подключены; глаза/цветок не добавлены. Waxed routes сохраняются, срез — четыре невощёные стадии. Полный моб отложен.
- Skulls/piglin: 74f40c8/199ddc6/67cf7ed/c9eca2d/4ad9cd2/62146c2 — geometry/shared sheets готовых голов, детали handoff. Не полные entities.
- Dragon: c71716b head/jaw через skull, 6 head cubes + 1 jaw cube, mirror UV/static closed jaw. b9fe64e sheet textures/entity/dragon/dragon и parent ender_dragon, 40c82f0 preview. Общий 256x256 sheet, без отдельной PNG головы/тела. Bedrock placement/scale/UV не приняты.

## Геометрия и открытые ограничения

shapes.mjs: composeShape/requireRoles, planes/boxes/rotations. Принятые legacy geometry/UV, особенно repeater/comparator, без дефекта не менять. Piston normal top shared head_back/sticky front сохраняются. Composter 0..8, scaffolding bottom, cage без внутренних entities. Chorus corruption исправлена 86b6d8f. Cave vines/berries и stem 0..7/attached/facing есть; stem tint открыт.

Cube indexed states сохраняют повторы hives/crafter/suspicious/bookshelf/heart/mushrooms/bulbs/ice/anchor. Slime/honey cores 10/16 и 14/16, оболочки 16 px, alpha отдельно. Farmland 15/16, wet=up[0]/dry=up[1], snow 1..8. Seagrass short/tall; propagule ground/hanging age 0..4. Kelp static lower/top, шесть paths/animation definitions, A–D не рост.

Открыты Bedrock UV potted azalea/reference models, kelp sides/UV/TGA, gel alpha/WebGL, decorated pot patterns, active conduit, fire/player/placements. Closed door/один amethyst growth — ограничения. Полные entities/cushion/bell отложены, scope согласовать до переключения; item default sprite/3D явно.

## Проверки и сохранность

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторические 1275 definitions/1241 terrain keys/8201 paths — не свежий coverage. Existing coverage/audit/inputValidation различают assignments/builders/normalization/inventory/dependencies, не доказывают render. Workflow обновлён, успешный CI не подтверждён. Targeted/mocked OLDCHAT19 не full compile/PNG/WebGL/Android/export.

Перенос с точечными проверками → совместная приёмка → чистка → удаление заменённого legacy после успеха. Новые test files согласовать, существующие не удалять массово. Legacy cache foundrykin.catalog.v6; пользовательские fk070_packs не очищать. Принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame, затем синхронизировать FK_V/cache.
