# ARCHITECTURE

Обновлено 2026-11-05 по OLDCHAT22 и GitHub. Проверенный HEAD до документации: 60ec0ad78b28e17a5087a4849f1cb972e35752c0. Начать с CONTEXT/handoff. История подробных контрактов — 3fe2d82/1043175. Записанная основа не равна runtime/визуальной приёмке.

## Пути, данные и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. UI 0.9.1 по прежним проверкам, HTML здесь заново не исследован. Новый путь: PIN data → normalize → aliases/states/families/icons → compile → access → resolver → registry/materials/textures → scene. Основной editor не переключён; read-only preview не рисует/не экспортирует паки.

load/assembleChunks/manifest/hash/conflict checks и auxiliary end_gateway/lava_cauldron сохранены. parseLooseJson с 2f6c30e не меняет ,}/,] внутри строк; комментарии разделяют токены. resources различает unique owned faces/carried и indexed variants с повторами. normalize сохраняет named parts/door halves/известные furnace pairs. Unknown не cube. Dependencies разрешают конкретные shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst роли без ownership transfer.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. access canonicalizes aliases, сохраняет card/form/state; waxed source ID открывает обычный объект, не обязан возвращаться как plan.object.id, records/resources сохраняются. Alias требует эквивалентности, не общего листа; oxidation/normal/deepslate раздельны, неоднозначную PNG не отдавать первому владельцу. Coral wall fans aliases без mounting cards, candle cakes с cake при сохранении ресурсов.

## Представления и интерфейс

Eyeblossom одна closed/open card/default closed/cross-emissive_cross/обе records/routes/glow. Parent cards/familyDefaults используют реальные records без фиктивных entities. request.form/slot/state независимы, plan.forms описывает доступное. Default sheet голов/статуй — bindings.sheet; PNG вне model bindings загружается отдельно и не переключает geometry/pose/state. Общие sheets не копировать/обрезать.

Fruit отдельно или с соседним соответствующим направленным stem; pumpkin variants/IDs/owned PNG сохраняются, pumpkin/melon отдельно, composite forms:null без второго selector. Budding amethyst без growth или один stage/face, growth shared/source cards отдельно. Bamboo/shoot и torchflower/crop сохранены.

FKModelState: explicit dependencies/initial state/busy/stale/dispose; единые FKM/CSS в fk-menu.js/fk-menu.css, прежние реализации удалены. Root preview использует preview-controls.mjs и общий themed picker, не второй manager. b2c6eb2 вынес activePack/imageFrames/frameCanvas/createImageSource в preview-images.mjs; afd199b вынес REVIEW_IDS/SHULKER_BOXES/TEXT в preview-config.mjs. Совместимые экспорты preview.mjs сохранены, второго источника настроек/реализации нет.

REVIEW_IDS = 63 source IDs: прежние 29 + liquids 4 + chest 11 + shulker 17 + bell + player_head. Не cards/весь каталог; 4 golem source IDs невощёные. Вращение всей модели жестом; chest/shulker whole-block facing удалён из builders/resolver/меню/тестовых циклов/подписей. Chest open/double, ender без double, shulker open; движение крышки относительно основания сохранить. Stem direction/growth face/UV стороны не смешивать с этим решением. Static pose/open не плеер. Макет отложен, mobile/paper tokens сохранить.

## Материалы и lifecycle

createModelMaterials принимает descriptor/bindings/classified textures: isTexture и boolean userData.semi. Sprite/glow/emissive Basic-unlit, обычные Lambert, конфликт lit/unlit одного path отклоняется. semi=true → transparent=true/alphaTest=0/depthWrite=false; иначе false/.05/true. Default FrontSide/depthTest, planar builders задают DoubleSide. Materials владеют материалами/заимствуют textures; texture layer владеет GPU textures. Composite update/cleanup включает все части и ошибки; canvas-GPU lifecycle/loader timeout/cache/retry записаны. Dimensions/alpha/atlases/frame strips не менять ради видимости успеха.

## Специальные модели

- Liquids: 4 ID water/lava, integer level 0..7/default 0, height (8-level)/9, 6 roles/lava emissive. Resolver/common picker/PNG/EN-RU/workflow есть. Uniform-height Java-look reference, не neighbour-aware flow; нет slopes/falling/biome tint/overlays/timing, Bedrock appearance открыт.
- Chest: normal/trapped/ender + 8 copper source IDs; resolver выбирает sheet либо double_sheet независимо от PNG, wide sheets собственные, ender без double. Open двигает крышку/замок, не корпус; no facing. Menu и 11 source IDs записаны, waxed aliases учтены.
- Shulker: base/lid pinned geometry без головы, собственные sheets цветов/light_gray→silver, no whole-block facing. Open поднимает/поворачивает только крышку — статичный reference-кандидат, default false. e4db3d6/196fc69 подключили open/PNG/EN-RU/17 раздельных ID; фиктивной silver card нет. e255fc2 записал fixture/pinned checks.
- Bell: 9cf2a6f/d2333b3/2fe3362 — builder bell в models/fixtures.mjs, явное назначение и attachBellSource в compile/resolver. Пять частей legacy geometry: две стойки, перекладина, две части колокола. Sheet textures/entity/bell/bell, beam/posts из собственных ресурсов; native/icons/carried не теряются. Preview/EN-RU/independent PNG и pinned test записаны. Только статичный standing, другие крепления/звон не реализованы; визуальная приёмка открыта.
- Player head: 1df7ce9/60ec0ad — player_head → player/head через skull, полный textures/entity/steve 64x64 sheet, голова 8x8x8 и hat inflate 0.5 px, UV [0,0]/[32,0]. Оба куба центрированы по y=-.25 в блоковом размещении, не узел полной модели. Только форма head/independent PNG/source-parent routes/EN-RU; полного тела/редактора скинов нет. Последняя реплика OLDCHAT22 о несохранённом пакете неверна.
- Pot: base/23 patterns+ordinary, inventory checks/4 независимые стороны builder/resolver/common picker, незаданные ordinary, корпус/горловина/UV не меняются, PNG отдельно. Conduit: base/cage/open-closed eye/2 winds, default inactive/static active reference/picker, без animation/eye tracking, Bedrock alpha-UV-render не приняты.
- Heads/statues: skeleton/wither_skeleton/creeper/zombie/piglin/dragon + player, shared sheets/parent cards/routes; статуя 4 окисления/4 позы, waxed routes сохранены, без автоматических глаз/цветка. Полные mobs отложены. Dragon 256x256 textures/entity/dragon/dragon, 6 head cubes+jaw/mirror UV/static closed jaw через skull, placement/scale/UV открыты.
- Bed: 9 частей legacy geometry/UV, 16 owned sheets/silver mapping/bed→red_bed/reuse icons. Sign standing/wall/hanging по acacia@750f657, sheets/IDs/resources/icons/states; standing/attached rotation, ceiling/wall facing, прежнее подозрение ceiling rotation снято, Bedrock UV не принят.
- Lava cauldron/auxiliary уже есть, PNG не меняет contents. Banner standing/wall/static/base-pattern resources/canvas composition/16 colors/ordered layers/update, PNG не перезаписывать, tint только полотна. Ominous свой sheet без recolor/layers/отдельной card, TGA/WebGL открыты.

## Будущий редактор скинов

Владелец предложил полноценный редактор скинов в карточке Игрок, позднее полное тело для примерки брони. Отложенный этап, не обещание лёгкости/готовности. Сохранить полный лист/UV head-hat/source routes. Когда появится второй потребитель, отделить описание детали от блокового размещения и размещения на теле с pivot head. Сейчас общей функции детали/полной модели нет. Не добавлять фиктивный body selector и не прикреплять голову к чужому мобу ради тела.

## Остальные контракты и приёмка

Принятую legacy geometry/UV, особенно repeater/comparator, без дефекта не менять. Piston normal top/shared head_back/sticky front; composter 0..8/scaffolding bottom/cage без внутренних entities. Chorus corruption исправлена 86b6d8f; cave vines/berries/stem 0..7/attached есть, tint открыт. Cube indexed repeats сохранить. Slime/honey cores 10/16 и 14/16 с оболочкой 16px; farmland 15/16 wet=up[0]/dry=up[1], snow 1..8; seagrass short/tall/propagule ground-hanging age0..4. Kelp lower/top/6 paths/animation definitions, A–D не рост.

createModelLibrary регистрирует/запечатывает builders; full compile строг к unresolved/missing, slice не ослабляет compiler. Ожидание 113 builders после bell не принятое количество cards/свежий coverage. Pinned shulker/bell/player tests записаны, успешное выполнение/Actions не подтверждены. Targeted mocks/recording painter не full PIN compile/реальные PNG-TGA/WebGL/Android/export.

Следующий известный кандидат bubble_column, не доказанный единственный остаток. Bell/player_head больше не отсутствующие модели. Existing coverage/audit/inputValidation, не второй аудит. Открыты potted azalea/reference UV, dragon placement-scale, kelp sides-UV-TGA, gel alpha/stem tint, pot/conduit/liquid/chest/shulker/bell/player rendering, fire/placements, ограничения closed door/один growth. Полные entities/cushion и item default sprite/3D/scope отдельно.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d, не смешивать выпуски. Legacy cache foundrykin.catalog.v6/fk070_packs не очищать. Совместная приёмка draw/undo/redo/Add/reopen/PNG/mcpack/Android/async/storage/import/lifecycle/pack-slot-frame-language-theme предшествует runtime switch/FK_V/cache/удалению legacy. Документы менять только по указанию владельца; сохранность — CONTEXT/review-principles.
