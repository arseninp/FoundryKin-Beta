# ARCHITECTURE

Обновлено 2026-11-04. Проверенный HEAD до документации: 6ccafe6d7b9e8d277fd513e70bca3a8d5d1b5105. Начать с CONTEXT. Подробная предыдущая версия — 3fe2d82; основа не равна визуальной/runtime приёмке.

## Пути, данные и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. UI 0.9.1 по прежним проверкам, HTML здесь заново не исследован. Новый путь: PIN data → normalize → aliases/states/families/icons → compile → access → resolver → registry/materials/textures → scene. Основной editor не переключён. Read-only preview не рисует/не экспортирует паки.

load/assembleChunks/manifest/hash/conflict checks и auxiliary end_gateway/lava_cauldron сохранены. resources различает unique owned faces/carried и indexed variants с повторами. normalize сохраняет named parts/door halves/известные furnace pairs. Unknown не cube. Dependencies разрешают конкретные shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst роли без ownership transfer.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. access canonicalizes aliases, сохраняет card/form/state; waxed source ID открывает обычный объект, не обязан возвращаться как plan.object.id. Исходные records/resources сохраняются. Alias требует эквивалентности, не общего листа; oxidation/normal/deepslate раздельны, неоднозначную PNG не отдавать первому владельцу. Coral wall fans aliases без mounting cards, candle cakes с cake при сохранении ресурсов.

## Представления и интерфейс

Eyeblossom одна card closed/open/default closed с явными cross/emissive_cross/обеими records/routes/glow. Parent cards/familyDefaults используют реальные records без фиктивных entities. request.form/slot/state независимы, plan.forms описывает доступное. Default model sheet голов/статуй — bindings.sheet; выбранная PNG может загружаться вне model bindings, не переключает geometry/pose/state. Общие sheets не копировать/обрезать.

Fruit отдельно или с соседним соответствующим направленным stem; pumpkin variants/IDs/owned PNG сохраняются, pumpkin/melon отдельно, composite forms:null без второго selector. Budding amethyst без growth или один stage/face, growth shared/source cards отдельно. Bamboo/shoot и torchflower/crop сохранены.

FKModelState имеет explicit dependencies/initial state/busy/stale/dispose; единые FKM/CSS вынесены в fk-menu.js/fk-menu.css с удалением старых реализаций. Root preview использует preview-controls.mjs и общий themed picker, не второй manager/панели. REVIEW_IDS сейчас 44 source IDs: прежние 29 + liquids 4 + chest 11. Не 44 cards/полный каталог; 4 golem source IDs невощёные. Шалкеров в срезе нет.

Вращение всей модели — жестом. Whole-block facing сундуков и шалкеров удалён из builders/resolver/меню/тестовых циклов/подписей (4d99f7b/c2b7384/6ccafe6); не восстанавливать. Chest state open/double, ender double запрещён; shulker state open. Крышка движется относительно основания — это не лишний поворот блока. Направление stem/грань growth/UV стороны не смешивать с этим решением. Static pose/open не player. Макет отложен на другой чат; mobile/paper tokens сохранить.

## Материалы и lifecycle

createModelMaterials принимает descriptor/bindings/classified textures: isTexture и boolean userData.semi. Sprite/glow/emissive Basic-unlit, обычные Lambert, конфликт lit/unlit одного path отклоняется. semi=true → transparent=true/alphaTest=0/depthWrite=false; иначе false/.05/true. Default FrontSide/depthTest, planar builders задают DoubleSide. Materials владеют своими материалами/заимствуют textures, texture layer владеет GPU textures. Composite update/cleanup включает все части и ошибки; canvas-GPU lifecycle и loader timeout/cache/retry уже записаны.

## Специальные модели и их статус

- Liquids: water/lava builders для 4 IDs, level integer 0..7/default 0, height (8-level)/9, 6 roles/lava emissive. df3d6b1/b165cfc/311cdb4 — resolver/common level picker/PNG/EN-RU/workflow. Uniform-height Java-look reference, не neighbour-aware flow; нет slopes/falling/biome tint/overlays/timing, Bedrock render открыт.
- Chest: normal/trapped/ender + 8 copper source IDs. Resolver выбирает только sheet либо double_sheet, wide sheets обычного/ловушки/медных собственные, ender без double. Open поднимает крышку/замок, корпус остаётся; no facing. Menu open/double и 11 IDs в preview записаны, waxed aliases учитываются в проверках.
- Shulker: base/lid pinned geometry без головы, собственные sheets каждого цвета/light_gray→silver; no whole-block facing. Open поднимает/поворачивает только крышку — static Java-reference-кандидат. Resolver default open:false; меню/цветовой срез ещё не записаны. Не добавлять фиктивную silver card из совместимого имени builder.
- Pot: базовый лист/23 узора+ordinary, inventory checks, 4 независимые стороны в builder/resolver/common picker; незаданные ordinary, корпус/горловина/UV не меняются, PNG отдельно.
- Conduit: base/cage/open-closed eye/2 winds, default inactive; static active Java-reference geometry/resolver/shared picker. Animation/eye tracking/Bedrock alpha-UV-render не приняты.
- Heads/statues: skeleton/wither_skeleton/creeper/zombie/piglin/dragon shared sheets/parent cards/source routes/preview; статуя 4 окисления/4 позы, waxed routes сохранены, глаза/цветок автоматически не добавлены. Полные mobs отложены. Dragon textures/entity/dragon/dragon 256x256, head+jaw/mirror UV/closed jaw через skull, placement/scale/UV открыты.
- Bed: 9 частей legacy geometry/UV, 16 owned sheets, silver mapping/bed→red_bed/reuse icons. Sign standing/wall/hanging по acacia@750f657, листы/IDs/resources/icons/states есть; standing/attached rotation, ceiling/wall facing, прежнее подозрение ceiling rotation снято, Bedrock UV не принят.
- Lava cauldron/auxiliary уже есть; PNG не меняет contents. Banner standing/wall/static/base-pattern resources/canvas composition/16 colors/ordered layers/update, источники не перезаписывать, tint только полотна. Ominous собственный sheet без recolor/layers/отдельной card; TGA/WebGL открыты.

## Остальные контракты и приёмка

Принятую legacy geometry/UV, особенно repeater/comparator, без дефекта не менять. Piston normal top/shared head_back/sticky front; composter 0..8/scaffolding bottom/cage без внутренних entities сохранить. Chorus corruption исправлена 86b6d8f; cave vines/berries/stem 0..7/attached есть, tint открыт. Cube indexed repeats сохранить. Slime/honey cores 10/16 и 14/16 с оболочкой 16px; farmland 15/16 wet=up[0]/dry=up[1], snow 1..8; seagrass short/tall/propagule ground-hanging age0..4. Kelp lower/top/6 paths/animation definitions, A–D не рост.

createModelLibrary регистрирует/запечатывает builders; full compile строг к unresolved/missing, slice не ослабляет compiler. Ожидание 112 builders из library test — не принятые cards/новый coverage. Workflow дополнен pot/conduit/liquids/chest, successful Actions не подтверждён. Targeted mocks/recording painter не full PIN compile/реальные PNG-TGA/WebGL/Android/export.

Открыты potted azalea/reference Bedrock UV, dragon placement-scale, kelp sides-UV-TGA, gel alpha/stem tint, pot/conduit/liquid/chest/shulker rendering, fire/player/placements, closed door/один growth ограничения. Bell/player_head/bubble_column — предварительный архивный остаток, не fresh coverage. Полные entities/cushion/bell отложены, item default sprite/3D и scope согласовать.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d; старые inventory counts не coverage. Existing coverage/audit/inputValidation, не второй аудит. Legacy cache foundrykin.catalog.v6/fk070_packs не очищать. Совместная приёмка editor/Android/export/lifecycle/pack-slot-frame-language-theme предшествует runtime switch/FK_V/cache/удалению legacy. Сохранность — CONTEXT/review-principles.
