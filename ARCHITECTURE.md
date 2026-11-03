# ARCHITECTURE

Обновлено 2026-11-03 по OLDCHAT20; проверенный HEAD до документации efb873044ce59c308bce2aaf11ba73c709d869bf. Начать с CONTEXT. Полная предыдущая версия в d41f384; записанная основа не равна runtime/визуальной приёмке.

## Пути и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули; по прежним проверкам UI 0.9.1, здесь HTML заново не исследован. Новый путь: pinned data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → materials/textures → scene. Основной editor не переключён. Read-only preview не рисует и не экспортирует паки.

load/assembleChunks, manifest/hash/conflict checks и auxiliary end_gateway/lava_cauldron сохраняются. resources различает unique paths/faces/carried и indexed variants с повторами; normalize сохраняет named parts/door halves/известные furnace pairs. model-policy/rules/models назначают models без unknown→cube. Dependencies разрешают конкретные shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst роли без ownership transfer.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. access сохраняет source/card/form/state; неоднозначную PNG не отдавать первому владельцу. Alias требует эквивалентности, а не общего листа; oxidation/normal/deepslate раздельны. Waxed/infested routes сохранять. Coral wall fans aliases без mounting cards, candle cakes с cake при сохранении ресурсов.

## Карточки, формы и интерфейс

Eyeblossom — одна closed_eyeblossom card, bloom closed/open/default closed с явными cross/emissive_cross, обе records/routes/glow сохранены. Existing forms/compile/access используют реальные records/familyDefaults без фиктивных entities. Родители голов skeleton/wither_skeleton/creeper/zombie/piglin/ender_dragon, статуй — соответствующие стадии copper golem. Исходные IDs открывают правильную форму. Полные mobs отложены, недоступный Mob не показывать готовым.

request.form/slot/state раздельны, plan.forms описывает доступные формы. Default model sheet голов/статуй — bindings.sheet, explicit PNG/sprite сохраняют свои правила. Выбранная PNG может загружаться вне bindings и не переключает geometry/state/pose. Общие sheets не копировать/обрезать.

Fruit отдельно либо с соседним соответствующим направленным stem; pumpkin variants/IDs/owned PNG сохранены, pumpkin/melon раздельны. Composite fruit возвращает forms:null без второго selector. Budding amethyst: без growth или один small/medium/large/cluster на одной из шести граней; growth shared, source cards не сливать. Bamboo/shoot и torchflower/crop сохраняются.

FKModelState поддерживает явные language/doneLabel/manager/initial state, busy/stale events/dispose с legacy вызовом. Единые FKM/CSS вынесены в fk-menu.js/fk-menu.css, прежние реализации удалены. Preview использует общий themed picker. В 5eeed20 существующие controls вынесены из root preview.mjs в preview-controls.mjs, экспорты проверок сохранены. Не второй manager/панель. Вращение жестом; без rotation/facing меню голов/статуй. Static pose/open не player.

Root preview.mjs сейчас содержит 29 REVIEW_IDS: прежние 27 + decorated_pot + conduit. Это source block IDs, не cards/полный каталог; четыре golem IDs невощёные. Water/lava пока вне среза. Адаптивность tablet/desktop не принята: CSS/layout/iframe/size consumers ещё исследовать, редизайн не согласован; mobile/paper tokens сохранить.

## Материалы и lifecycle

createModelMaterials использует descriptors/bindings/classified textures с isTexture и boolean userData.semi; sprite/glow Basic-unlit, обычные роли Lambert. Lit/unlit conflict одного path отклоняется. semi=true → transparent=true, alphaTest=0, depthWrite=false; иначе transparent=false, alphaTest=.05, depthWrite=true. Default FrontSide/depthTest, planar builders задают DoubleSide. Materials владеют материалами и заимствуют textures, texture layer владеет GPU textures. Composite update/cleanup включает все части и ошибки. Canvas/GPU lifecycle и loader timeout/cache/retry уже записаны.

## Block entities и специальные модели

- Bed: 9 частей legacy geometry/UV, 16 owned sheets, light_gray→silver, bed→red_bed/reuse icons.
- Sign: standing/wall/hanging по acacia-rs/acacia@750f657, не Mojang export; листы пород/IDs/resources/icons/states подключены. Standing/attached rotation, ceiling/wall facing; прежнее подозрение ceiling rotation снято. Bedrock UV не принят.
- Lava cauldron: прежний корпус/UV, отдельная лава по умолчанию, PNG не меняет contents; auxiliary вход есть.
- Chest: normal/trapped/ender/8 copper IDs, double с собственными wide sheets; ender double запрещён. Static open поднимает крышку/замок, корпус остаётся.
- Shulker: base/lid pinned geometry без головы, 6 направлений/все sheets, silver mapping; static open Java-reference-кандидат, не принятый Bedrock.
- Banner: standing/wall static, base/pattern resources, canvas composition/16 colors/ordered patterns/update. Источники не перезаписывать, tint только полотна. Ominous собственный banner_illager без recolor/layers/отдельной card; TGA/WebGL открыты.
- Copper statue: 4 позы standing/sitting/running/star, sheets 4 окислений/source/waxed routes/parent cards/preview; глаза/цветок не добавлены, полный mob отложен.
- Skulls/piglin/dragon: готовые головы со shared sheets/source routes/parent cards/preview, не bodies. Dragon 6 head cubes+jaw/mirror UV/closed jaw через skull, textures/entity/dragon/dragon 256x256; placement/scale/UV открыты.
- Decorated pot (70ec5f8/1fcf149/56724d3): базовый sheet + таблица 23 узоров/обычной стороны с inventory checks; builder/resolver выбирают стороны независимо, незаданные обычные; корпус/горловина/UV сохранены. Общий picker четырёх сторон/EN-RU, PNG независимо; без новых cards/копий PNG.
- Conduit (cdac9c4/93b9565/eb3fa90/5eeed20): base/cage/open-closed eye/two winds, default inactive; static active Java-reference geometry, state/resolver/shared picker. Нет animation/eye tracking, Bedrock UV/alpha/render не принят.
- Liquids (efb8730): models/liquids.mjs предоставляет water/lava builders для water/flowing_water/lava/flowing_lava. level integer 0..7/default 0; uniform height (8-level)/9, 6 face roles; lava emissive. Java-look reference acacia-rs/acacia@750f657; не world simulator, без neighbour slopes/falling/biome tint/overlays/timing. Подключение к root preview/меню ещё не сделано.

## Геометрия, проверки и открытые ограничения

shapes: composeShape/requireRoles/planes/boxes/rotations. Принятую legacy geometry/UV, особенно repeater/comparator, без дефекта не менять. Piston normal top/shared head_back/sticky front; composter 0..8/scaffolding bottom/cage без внутренних entities сохранять. Chorus corruption исправлена 86b6d8f. Cave vines/berries и stem 0..7/attached/facing есть, stem tint открыт.

Cube indexed repeats hives/crafter/suspicious/bookshelf/heart/mushrooms/bulbs/ice/anchor сохранять. Slime/honey cores 10/16 и 14/16 с оболочкой 16px/alpha; farmland 15/16 wet=up[0]/dry=up[1], snow 1..8; seagrass short/tall, propagule ground/hanging age 0..4. Kelp static lower/top с 6 paths/animation definitions, A–D не рост.

Открыты potted azalea/reference Bedrock UV, kelp sides/UV/TGA, gel alpha/WebGL/stem tint, реальные pot patterns/conduit/liquids render, fire/player/placements, closed door/один amethyst growth ограничения. Полные entities/cushion/bell отложены; scope согласовать, item default sprite/3D явно. Предварительные неназначенные bell/player_head/bubble_column — не свежий coverage.

createModelLibrary регистрирует/запечатывает builders; compileModelCatalog строг к unresolved/missing, затем compileCatalog/registry.validate. Slice не ослабляет full compiler. Ожидание 112 builders по OLDCHAT20 не cards/coverage/render. df07052/ae7120e расширили existing workflow, успешный Actions не подтверждён. Исторические mocks не full compile/реальные PNG-TGA/WebGL/Android/export; в текущей передаче исполняемые проверки не запускались.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d; 1275 definitions/1241 terrain keys/8201 paths — исторические числа, не свежий coverage. Пользоваться existing coverage/audit/inputValidation, не вторым аудитом. Legacy cache foundrykin.catalog.v6; fk070_packs не очищать. Приёмка draw/undo/redo/Add/reopen/PNG/mcpack/Android/lifecycle и pack/slot/frame/language/theme предшествует переключению runtime, FK_V/cache и удалению legacy. Все правила сохранности — CONTEXT.
