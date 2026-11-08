# ARCHITECTURE

Обновлено 2026-11-08 по OLDCHAT25 и GitHub, HEAD перед документацией: 836ad36a953f49dd2f08cc7996b0f6172b87385b. Начать с CONTEXT/handoff. Подробные контракты ARCHITECTURE@5b083a7 и истории 3fe2d82 сохраняются; готовые модели не переносить повторно.

## Пути, данные и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежней передаче основной editor legacy 0.9.1; HTML/runtime в этой документальной сессии заново не проверены. Новый путь: PIN data → normalize/aliases/states/families/icons → compile/access/resolver → registry/materials/textures → scene. Read-only preview не рисует/не экспортирует паки; интеграция editor draw/undo/reopen/export не подтверждена.

load/assembleChunks/manifest/hash/conflict checks и auxiliary end_gateway/lava_cauldron сохранять. 1275 исходных ID считать отдельно от 2 auxiliary. parseLooseJson с 2f6c30e сохраняет ,}/,] внутри строк и разделяет токены комментариев пробелом. Unique owned paths и indexed variants с повторами — разные контракты. Named parts/door halves/furnace pairs сохранять. Shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst dependencies без ownership transfer. Unknown не cube.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. Access сохраняет source-ID reopen/card/form/state; canonical waxed ID может открывать ordinary object при сохранении source record/resources. Alias требует эквивалентности, не общего листа; oxidation/normal/deepslate раздельны. Не отдавать неоднозначную PNG первому владельцу. Coral wall fans aliases/no mounting cards, candle cakes с cake при сохранении ресурсов.

## Сборка preview и общие controls

preview-config.mjs экспортирует 602 базовых REVIEW_IDS и TEXT=createPreviewText(...) из preview-text.mjs. preview.mjs объединяет base с preview-stone-data.mjs (273), preview-wood-data.mjs (50), preview-leaf-data.mjs (14), формирует итоговые 939 REVIEW_IDS и дополняет EN/RU. compileReview использует итоговый список и production compiler; строгие проверки не ослаблять ради среза. Эти числа описывают код/тестовые ожидания, не результат полного исполнения.

edfc234 устранил реальное превышение лимита файла разделением текста, лимит не повышался. Не повторять старый план preview-review-ids и не считать все данные одним файлом. Helpers — preview-images.mjs; совместимые exports preview.mjs сохранять. Общие FKModelState/FKM/fk-menu.js/css/preview-controls.mjs, без второго manager/каталога/меню.

Parent cards/familyDefaults используют реальные records без фиктивных entities. PNG/form/slot/state/pose независимы; sheet голов/статуй — bindings.sheet, выбранная PNG вне bindings загружается отдельно. Sheets без копий/обрезки, dimensions/alpha/atlases/frame strips сохранить. Eyeblossom одна closed/open card с cross/emissive_cross/обе records/routes/glow. Pumpkin/melon отдельно, свой stem и variants/owned PNG; composite forms:null. Budding amethyst без нароста либо один stage/face; source growth cards отдельно. Kelp A–D не рост, шесть paths и animation definitions сохранить.

Whole model вращается жестом. Chest/shulker facing удалён из builders/resolver/controls/tests/labels, не возвращать. Chest open/double, ender без double, shulker open; крышка относительно основания. Stem direction/growth face/UV стороны и sign placement не удалять массово. Static pose/open не playback. Tablet/desktop layout отложен, mobile/paper tokens сохранить.

## Новые ресурсные контракты

Bubble_column → existing sprite (4dbdcd2), aquaticBindings сохраняет 18 owned roles при этом назначении; preview подключён 4f1ef0b. Sprite использует выбранный slot, resourcePaths для sprite берёт его, а не все 18 binding paths. Исходные variants/paths сохраняются, включая pumpkin_side вне ролей пузырей. Одна выбранная текстура на плоскости; без particle engine, выдуманного порядка высот, новой PNG и симуляции столба.

utility-parts.mjs: wooden_button/wooden_pressure_plate получают явный oak default, stone_button/stone_pressure_plate — stone; индексированные варианты 6/7 не удаляются. normal_stone_stairs/stone_brick_stairs/prismarine_stairs и sandstone/red_sandstone_stairs получают именованные face bindings. normal_stone_stairs и stone_stairs не путать; sandstone имеет разные up/down/side. Named bindings не заменяют исходные alternatives/repeats. Регрессии — existing tools/resource-variants.test.mjs.

Листва: catalog/leaf-preview.mjs задаёт строгий foliage cutout/opaque контракт для 14 реальных ID; default cutout. Resolver синхронно выбирает все faces, общий picker хранит foliage независимо от edited slot. Icon/sprite view не потребляет leaf control. Сохранять отдельные source identities и cutout/opaque/carried ресурсы. Биомный tint не заявлен готовым. 4b37171 уже подключает листьевые ID; 836ad36 только расширяет existing leaf-preview tests.

## Материалы и lifecycle

createModelMaterials: descriptor/bindings/classified textures с isTexture и boolean userData.semi. Sprite/glow/emissive — Basic-unlit, обычные роли Lambert; conflicting lit/unlit одного path отклоняется. semi true → transparent true/alphaTest 0/depthWrite false, иначе false/.05/true. FrontSide/depthTest по умолчанию, planar builders задают DoubleSide. Materials владеют материалами и заимствуют textures; texture layer владеет GPU textures. Composite update/cleanup всех частей/ошибок, canvas-GPU lifecycle/loader limits/cache/retry сохранить. Не менять PNG/opacity ради видимости успеха.

## Сохранённые модели

Fire/soul_fire: 4 внутренних наклонных + 4 периметральных плоскости/full-frame UV/без roof, раскладка остаётся кандидатом. Unlit все шесть roles; primary/up и alternate/down независимы от PNG. ID/state/material validation, cleanup всех geometries/AggregateError; resolver default primary/ранняя validation, stageCount не менялся. Campfire/soul_campfire: down raw log/north lit log/up flame, emissiveRoles:['up']; lit false 28 log faces, lit true/default ещё 2 flame planes. Общий lit picker/PNG/EN-RU/source IDs; дым/playback не входят. Кодовый статичный scope закрыт, не реализовывать заново без дефекта.

Liquids: 4 IDs, level integer 0..7/default 0, height (8-level)/9, lava emissive; не flow/slopes/falling/biome tint/overlays/timing. Chest: 11 IDs, sheet/double_sheet независимо от PNG, wide sheets собственные, ender без double, waxed canonical routes. Shulker: 17 source IDs/base-lid/static open/default closed, light_gray→silver sheet без silver card.

Pot: 23 patterns+ordinary/4 стороны/common picker/base-body-UV. Conduit: 6 resources/default inactive/static active Java-reference/eye-wind picker без tracking/player. Bell: 5 legacy parts на стойках/свой sheet/owned beam-posts/PNG; другие крепления/звон не реализованы. Player_head: skull/head+hat inflate 0.5px/full Steve 64x64 sheet → player/head, не тело/skin editor; при втором потребителе отделить описание детали от placement/pivot.

Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon и 4 окисления/4 позы статуи сохранить; full mobs отложены, недоступные формы не показывать. Dragon 256x256/head+jaw/mirror UV/static closed jaw, placement-scale-UV не приняты. Статуе глаза/цветок автоматически не добавлять, четыре source IDs среза невощёные.

Bed 9 legacy parts/16 sheets/silver mapping/bed→red_bed. Sign standing/wall/hanging по acacia@750f657, standing/attached rotation и ceiling/wall facing сохранить; ceiling suspicion снято. Banner source PNG не перезаписывать, 16 colors/ordered layers/canvas update/tint только полотна; ominous свой sheet без recolor/layers/отдельной card. Cauldron/auxiliary contents не зависят от PNG. Принятую geometry/UV, особенно repeater/comparator, без дефекта не переделывать. Остальные контракты piston/gels/farmland/snow/chorus/vines/dripleaf/aquatic/propagule — прежняя архитектура/исходники.

## Границы доказательств

Полной по-ID ресурсно-состоянийной сверки нет. Existing coverage/audit/inputValidation использовать без второй системы. b41c99b уже убрал stale 67 в library test; 113 builders — прежнее ожидание, не число принятых карточек и не свежий пересчёт. OLDCHAT25 сообщает resource-variants 16/16 на 11b7b83, не прогон на текущем HEAD. Последние resolver cases — normalized fixtures/registry spy, не geometry/PNG/WebGL. Полный compile/tests/CI и визуальная приёмка здесь не выполнялись. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d. Не очищать foundrykin.catalog.v6/fk070_packs ради кэша. Приёмка editor предшествует runtime switch/FK_V/cache/removal legacy.
