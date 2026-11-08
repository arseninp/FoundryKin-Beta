# ARCHITECTURE

Обновлено 2026-11-08 по OLDCHAT26 и сохранённому main 6289e137144a70929084e9d1c2a7e5722c170bae. Не выпуск. CONTEXT/handoff — текущая точка. Подробные прежние контракты ARCHITECTURE@3e503a8, 5b083a7 и 3fe2d82 остаются действующими; ниже актуальная сводка, не разрешение упрощать модели.

## Данные, пути и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk modules; 0.9.1 по прежней передаче, runtime/HTML заново не проверены. Новый путь: PIN → normalize/aliases/states/families/icons → compile/access/resolver → registry/materials/textures → scene. Read-only preview не заменяет editor draw/history/Add/reopen/export.

load/assembleChunks/manifest/hash/conflict checks сохранять. 1275 source ID и auxiliary end_gateway/lava_cauldron разные множества. parseLooseJson (2f6c30e) сохраняет ,}/,] в строках и разделяет токены комментариев пробелом. Owned unique paths не indexed alternatives/repeats. Named parts/door halves/furnace pairs и shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst dependencies сохранять без ownership transfer. Unknown не cube, stonecutter_block identity сохранить.

Compiler сохраняет records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. Access сохраняет source-ID reopen/card/form/state. Waxed aliases открывают ordinary object только при эквивалентности с сохранением source record/resources; окисления/normal/deepslate не сливать. Общий PNG не доказательство alias. Coral wall fan aliases без отдельных mounting cards; candle cakes с cake при сохранении ресурсов.

## Preview и controls

preview-config.mjs: 602 base IDs и TEXT из preview-text.mjs. preview.mjs объединяет stone 273/wood 50/leaf 14 и новые copper 55/cube 41/indexed 10/fixtures 39/signs 39/joinery 35/extra 19. Ожидается 1177 записей по статическому составу, не свежий compile/unique audit. Новые таблицы сейчас в entry point; не утверждать, что они вынесены в отдельные файлы. compileReview использует итоговые REVIEW_IDS и production compiler. edfc234 — уже выполненное config/text разделение ради лимита. Helpers preview-images.mjs/совместимые exports сохранять.

Общий FKModelState/FKM/fk-menu.js/css/preview-controls.mjs, без второго manager/menu/catalog/runtime. Bulb mode off/lit/powered/lit_powered, frosted_ice stage 0..3, respawn_anchor charges 0..4 уже выведены в общий picker в 1b4d8c9; соответствующие 10 ID подключены 7a347c0. Сохранить defaults/validation/EN-RU, PNG отдельно.

Sign table: 13 пород × standing/wall/hanging; oak standing/wall без oak_ prefix, darkoak standing/wall без dark_oak_. Hanging использует отдельный sheet; standing/wall общий. Joinery — 22 закрытые двери и 13 статичных полок, не заявленная интерактивность. Extra — 10 wall fans/4 waxed statues/5 technical IDs. В последнем preview.mjs явного bed нет; финальная реплика чата не доказательство подключения.

Parent cards/familyDefaults используют реальные records, без фиктивных entities. PNG/form/slot/state/pose независимы. Sheet голов/статуй — bindings.sheet, выбранная PNG вне bindings грузится отдельно; sheets без crops/copies, dimensions/alpha/atlases/frame strips сохранить. Eyeblossom одна closed/open card, cross/emissive_cross, обе records/routes/glow. Pumpkin/melon отдельно со своими stem/variants/owned PNG, composite forms:null. Budding amethyst без нароста или один stage/face, source growth cards отдельно. Kelp A–D не рост, шесть paths/animation definitions сохранить.

Whole-model rotation жестом. Chest/shulker whole-block facing удалён из builders/resolver/controls/tests/labels; не возвращать. Open/lid-relative/double сохранить, ender без double. Stem direction/growth face/UV faces/sign placement не удалять массово. Static pose/open не playback.

## Ресурсы и lifecycle

Bubble_column → existing sprite (4dbdcd2/4f1ef0b): aquaticBindings сохраняет 18 owned roles/variants/paths, pumpkin_side вне bubble roles. Sprite/resourcePaths берёт выбранный slot, не все 18 bindings. Одна texture/plane, без нового builder/PNG/particle engine/порядка высот.

utility-parts: wooden_button/wooden_pressure_plate oak default, stone_button/stone_pressure_plate stone; indexed variants 6/7 сохранять. normal_stone_stairs/stone_brick_stairs/prismarine_stairs/sandstone/red_sandstone stairs имеют named face bindings. normal_stone_stairs не stone_stairs; sandstone up/down/side раздельны. Existing resource-variants regressions не заменяют alternatives/repeats.

Leaf contract catalog/leaf-preview.mjs для 14 реальных ID: default cutout, cutout/opaque синхронно для faces через resolver/common picker, edited PNG независимо. Icon/sprite leaf control не потребляет. Source identities/cutout/opaque/carried сохранить. Biome tint не подтверждён. 4b37171 подключает ID, 836ad36 только integration tests.

createModelMaterials: descriptor/bindings/classified textures, isTexture и boolean userData.semi. Sprite/glow/emissive Basic-unlit, обычные Lambert; conflicting lit/unlit path отклонять. semi true → transparent true/alphaTest 0/depthWrite false, иначе false/.05/true. FrontSide/depthTest default, planar DoubleSide. Materials владеют материалами и заимствуют textures; texture layer владеет GPU textures. Composite update/cleanup охватывает все части/ошибки, AggregateError и canvas-GPU/loader limits/cache/retry сохранить. PNG/opacity ради успеха не менять.

## Сохранённые модельные контракты

Fire/soul_fire: 4 внутренних наклонных + 4 периметральных planes/full-frame UV/без roof, раскладка кандидат. Unlit все шесть roles; primary/up и alternate/down независимо от PNG; validation/cleanup всех geometries/default primary, stageCount не менялся. Campfire/soul_campfire: down raw log/north lit log/up flame, emissiveRoles:['up']; unlit 28 log faces, lit/default ещё 2 flame planes. Lit picker/PNG/EN-RU/source IDs сохранены; smoke/playback не реализованы.

Liquids 4 ID: integer level 0..7/default 0, height (8-level)/9, lava emissive; не flow/slopes/falling/biome tint/overlays/timing. Chest 11 ID: sheet/double_sheet независимо от PNG, wide sheets собственные, ender без double, waxed routes. Shulker 17 source ID: base/lid/static open/default closed, light_gray→silver sheet без silver card.

Pot: 23 patterns+ordinary/4 стороны/shared picker/base-body-UV. Conduit: 6 resources/default inactive/static active Java-reference/eye-wind picker без tracking/player. Bell: 5 legacy parts на стойках/свой sheet/owned beam-posts/PNG, без других креплений/звона. Player_head: skull/head+hat inflate 0.5px/full Steve 64x64 → player/head, не тело/skin editor; при втором потребителе отделить деталь от placement/pivot.

Skeleton/wither/creeper/zombie/piglin/dragon heads и statue 4 oxidation/4 poses сохранять. Dragon 256x256/head+jaw/mirror UV/static closed jaw, placement-scale-UV не приняты. Статуе глаза/цветок автоматически не добавлять; extra waxed ID не новые стадии/геометрии. Full mobs отдельно, фиктивных доступных форм нет.

Bed model: 9 legacy parts/16 sheets/silver mapping/bed→red_bed по прежней архитектуре, не доказательство preview hookup. Sign reference acacia@750f657: standing/attached rotation, ceiling/wall facing; suspicion снято. Banner 16 colors/ordered layers/canvas update/tint только полотна; source PNG не перезаписывать, ominous свой sheet без recolor/layers/отдельной card. Cauldron/auxiliary contents не зависят от PNG. Принятые geometry/UV, особенно repeater/comparator, без дефекта не переделывать. Прочие piston/gels/farmland/snow/chorus/vines/dripleaf/aquatic/propagule контракты — прежняя полная архитектура и исходники.

## Границы доказательств

Full per-ID resource/state audit ещё нет. Existing coverage/audit/inputValidation, не вторая система. Stale 67 уже исправлено; 113 builders — тестовое ожидание, не число принятых карточек. OLDCHAT26 13 mock Node cases/sign fixture checks и OLDCHAT25 resource-variants 16/16 — исторические сообщения. В этом проходе тесты/full compile/CI/images/WebGL/Android не запускались.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d. Не очищать foundrykin.catalog.v6/fk070_packs/localStorage. После editor acceptance — runtime switch/FK_V/cache/removal. Tablet/desktop layout/full mobs/skin editor/body/armor — будущий scope; mobile/paper tokens сохранить.
