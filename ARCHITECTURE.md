# ARCHITECTURE

Обновлено 2026-11-05. Проверенный кодовый HEAD перед документацией: 05f7a62f42a021b2c67d0cfbd3c87515db428aa6. Начать с CONTEXT/handoff. Подробные прежние геометрические и ресурсные контракты в ARCHITECTURE@5b083a7 и истории 3fe2d82 остаются обязательными; эта передача не разрешает их отменять или переносить модели заново.

## Пути, данные и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. HTML заново проверен, основной editor по-прежнему legacy 0.9.1. Новый путь: PIN data → normalize/aliases/states/families/icons → compile/access/resolver → registry/materials/textures → scene. Read-only preview не рисует и не экспортирует паки. Новый путь ещё не подключён к editor draw/undo/reopen/export.

load/assembleChunks/manifest/hash/conflict checks и auxiliary end_gateway/lava_cauldron сохранить. parseLooseJson с 2f6c30e сохраняет ,}/,] внутри строк и разделяет токены комментариев пробелом. Unique owned paths/face resources и indexed variants с повторами — разные контракты. Named parts/door halves/furnace pairs сохранить. Dependencies используют конкретные shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst роли без ownership transfer. Unknown не cube.

compile собирает records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. Access сохраняет source-ID reopen/card/form/state, canonical waxed ID может открыть ordinary object при сохранении исходной record/resources. Alias требует эквивалентности, не общего листа; oxidation/normal/deepslate раздельны. Не отдавать неоднозначную PNG первому владельцу. Coral wall fans aliases/no mounting cards, candle cakes с cake при сохранении ресурсов.

## Карточки, ресурсы и меню

Parent cards/familyDefaults используют реальные records без фиктивных entities. PNG/form/slot/state/pose независимы, default sheet голов/статуй — bindings.sheet; выбранная PNG вне bindings загружается отдельно. Shared sheets без копий/обрезки; dimensions/alpha/atlases/frame strips сохранить. Eyeblossom одна closed/open card с явными cross/emissive_cross/обе records/routes/glow. Fruit со своим соответствующим stem/pumpkin variants/source IDs/owned PNG сохранить; pumpkin/melon отдельно, composite forms:null без второго selector. Budding amethyst без growth или один stage/face, source growth cards отдельно. Kelp A–D не рост, шесть paths/animation definitions сохранить.

Общие FKModelState/FKM/CSS, fk-menu.js/css и preview-controls.mjs, без второго manager/меню. Config/REVIEW_IDS/TEXT — preview-config.mjs; image helpers — preview-images.mjs; совместимые preview.mjs exports сохранены. Срез 67 source IDs, не cards/весь каталог. Library expectation 113 builders не количество принятого контента.

Вращение whole model жестом. Chest/shulker facing удалён полностью из builders/resolver/controls/tests/labels; не возвращать. Chest open/double, ender без double, shulker open; крышка двигается относительно основания. Stem direction/growth face/UV стороны не удалять массово. Static pose/open не animation player. Tablet/desktop layout отложен, mobile/paper tokens сохранять.

## Материалы и жизненный цикл

createModelMaterials: descriptor/bindings/classified textures с isTexture и boolean userData.semi. Sprite/glow/emissive roles — Basic-unlit, обычные роли — Lambert; conflicting lit/unlit одного path отклоняется. semi true → transparent true/alphaTest 0/depthWrite false, иначе false/.05/true. Default FrontSide/depthTest, planar builders задают DoubleSide. Materials владеют материалами и заимствуют textures; texture layer владеет GPU textures. Composite update/cleanup всех частей и ошибок, canvas-GPU lifecycle/loader limits/cache/retry сохранить. Не менять PNG/opacity ради видимости успеха.

## Fire и campfire — завершённый статичный пакет

Fire/soul_fire: SPECIAL_MODELS → общий fire builder из models/fire.mjs через specials/library. e076117: явная схема 4 внутренних наклонных и 4 периметральных плоскостей, full-frame UV, без roof, текущая раскладка остаётся кандидатом. Unlit роли всех шести binding names; primary/up и alternate/down не зависят от PNG. Проверяются ID/state/materials; preparation cleanup пытается освободить все созданные geometries и сохраняет ошибки через AggregateError. c5134e5/8116bb5: A/B picker и source IDs/EN-RU; 3fea102: resolver default primary/ранняя variant validation, stageCount не менялся.

Campfire/soul_campfire: общий существующий builder в models/lights.mjs. down — raw log, north/side — lit log, up — flame. 2b7d82c: emissiveRoles:['up']; пламя unlit, брёвна Lambert, geometry/UV/другие lights не менялись. lit false использует raw log и убирает два flame planes, lit true/default — 28 log faces + 2 flame planes. d578dc8/05f7a62: общий boolean lit/default true, independent PNG/source IDs/EN-RU/срез/pinned checks. Дым и playback не реализованы. Согласованный кодовый объём этих статичных костров в preview закрыт, не начинать заново без дефекта.

## Сохранённые специальные модели

Liquids: 4 IDs, level integer 0..7/default 0, height (8-level)/9, lava emissive; ровный reference sample, не flow simulator/slopes/falling/biome tint/overlays/timing. Chest: 11 IDs, sheet/double_sheet выбор независимо от PNG, wide sheets собственные, ender без double, waxed canonical routes. Shulker: 17 source IDs/base-lid/static open/default closed, light_gray→silver sheet без silver card, без facing.

Pot: 23 patterns+ordinary/4 независимые стороны/common picker, base/body/UV сохранить. Conduit: 6 resources/default inactive/static active reference/eye-wind picker, без eye tracking/player. Bell: пять legacy parts на стойках, собственный sheet/owned beam-posts/independent PNG; другие крепления и звон не реализованы. Player_head: skull/head+hat inflate 0.5px/full Steve 64x64 sheet → player/head, не тело/skin editor. При будущем втором потребителе отделить описание детали от её размещения/pivot на теле.

Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon и статуи 4 окислений/4 поз сохранить; полные mobs отложены, unavailable Mob не показывать готовым. Dragon: 256x256 sheet/head+jaw/mirror UV/static closed jaw, placement-scale-UV не приняты. Статуе не добавлять глаза/цветок автоматически, четыре golem source IDs среза невощёные.

Bed 9 legacy parts/16 sheets/silver mapping/bed→red_bed; sign standing/wall/hanging по acacia@750f657, standing/attached rotation и ceiling/wall facing сохранить, старое ceiling suspicion снято. Banner: source PNG не перезаписывать, 16 colors/ordered layers/canvas update, tint только полотна; ominous собственный sheet без recolor/layers/отдельной card. Cauldron/auxiliary содержимое не зависит от PNG. Принятую geometry/UV, особенно repeater/comparator, без дефекта не переделывать. Остальные подробные контракты piston/gels/farmland/snow/chorus/vines/dripleaf/aquatic/propagule сохранены в указанной прежней архитектуре и исходниках.

## Остаток и границы доказательств

Bubble_column: только 18 texture roles, без assignment/builder/preview, точный вид/траектории отложены по скриншотам владельца. Не объявлять единственным оставшимся ID без fresh coverage. Existing coverage/audit/inputValidation, не второй аудит. Full compile строг к unresolved/missing, slice не ослабляет compiler.

Локальные unit/recording Three и связанный campfire стенд проверяют код, не реальные PNG/TGA/WebGL/Bedrock/Android/export. Pinned integration/workflow записаны, successful execution не подтверждён. Общая приёмка и editor integration остаются отдельным этапом. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d. Не очищать foundrykin.catalog.v6/fk070_packs ради кэша. Только после приёмки — runtime switch/FK_V/cache/removal legacy.
