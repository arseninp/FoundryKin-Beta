# ARCHITECTURE

Обновлено 2026-11-08 по OLDCHAT26, OLDCHAT27, сохранённому main 8f9a1c9c115a1def557d986d11c3bfaf841521ab и присланным CI-логам. Не выпуск. CONTEXT/handoff — точка передачи. Этот пакет завершает обновление пяти документов, запланированное в CONTEXT/handoff на 8f9a1c9; та документальная задача не является оставшейся технической работой. Подробные прежние контракты ARCHITECTURE@3e503a8, 5b083a7 и 3fe2d82 остаются действующими; сводка не разрешает упрощать модели.

## Данные, пути и идентичность

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk modules; 0.9.1 по прежней передаче, runtime/HTML заново не проверены. Новый путь: PIN → normalize/aliases/states/families/icons → compile/access/resolver → registry/materials/textures → scene. Read-only preview не заменяет editor draw/history/Add/reopen/export.

load/assembleChunks/manifest/hash/conflict checks сохранять. 1275 source ID и auxiliary end_gateway/lava_cauldron разные множества; coverage 1277 не число принятых карточек. parseLooseJson (2f6c30e) сохраняет ,}/,] в строках и разделяет токены комментариев пробелом. Owned unique paths не indexed alternatives/repeats. Named parts/door halves/furnace pairs и shared pot/soil/piston head_back/torch/pitcher/chorus/amethyst dependencies сохранять без ownership transfer. Unknown не cube, stonecutter_block identity сохранить.

Compiler сохраняет records/cards/aliases/families/stateGroups/routes/reverse index/dependencies. Access сохраняет source-ID reopen/card/form/state. Waxed aliases открывают ordinary object только при эквивалентности с сохранением source record/resources; окисления/normal/deepslate не сливать. Общий PNG не доказательство alias. Coral wall fan aliases без отдельных mounting cards; candle cakes с cake при сохранении ресурсов.

## Preview и controls

preview-config.mjs: 638 base source IDs — прежние 602 + bed + 17 candles + 18 cake/candle-cake sources. TEXT строится из preview-text.mjs и явных дополнений. preview.mjs объединяет base со stone/wood/leaf data modules и дополнительными группами copper/cube/indexed/fixtures/signs/joinery/extra/mechanisms/remaining cubes/power/remaining. Последние 22 ID в REMAINING_REVIEW_BLOCKS сохранены 73ca673 и подключены к REVIEW_IDS/TEXT; полный diff прочитан. reviewRows переводит [id,ru,en?] в [id,en,ru], с английским fallback из ID. Уплотнение таблиц не означает удаления подключений.

Прежние 1177 — исторический срез OLDCHAT26, не актуальная полнота. Заявление OLDCHAT27 о 1275 ID не заменяет полного сравнения множеств и resource/state audit. REVIEW_IDS содержит исходные ID, compiled records может содержать дополнительные записи адаптера bed. CI проверяет уникальность исходного списка и точное ожидаемое расширение 16 bed records, не требует ложного равенства только исходным ID. compileReview использует production compiler. edfc234 config/text разделение ради лимита не отменять. Helpers preview-images.mjs/совместимые exports сохранять.

Общий FKModelState/FKM/fk-menu.js/css/preview-controls.mjs, без второго manager/menu/catalog/runtime. Bulb mode off/lit/powered/lit_powered, frosted_ice stage 0..3, respawn_anchor charges 0..4 уже есть; 10 ID подключены. Candle lit boolean, null отклоняется; ресурс определяется состоянием, не edited PNG. Механизмы/рельсы/громоотводы и power groups печей/коптильни/лампы подключены; structure_block имеет шесть texture modes. Сохранять defaults/validation/EN-RU и независимость PNG.

Sign table: 13 пород × standing/wall/hanging; oak standing/wall без oak_ prefix, darkoak standing/wall без dark_oak_. Hanging использует отдельный sheet; standing/wall общий. Joinery — 22 закрытые двери и 13 статичных полок, не заявленная интерактивность. Extra — 10 wall fans/4 waxed statues/5 technical IDs. Bed подключён через настоящий ID bed и существующий adapter, не 16 выдуманных исходных ID.

Parent cards/familyDefaults используют реальные records, без фиктивных entities. PNG/form/slot/state/pose независимы. Sheet голов/статуй — bindings.sheet, выбранная PNG вне bindings грузится отдельно; sheets без crops/copies, dimensions/alpha/atlases/frame strips сохранить. Eyeblossom одна closed/open card, cross/emissive_cross, обе records/routes/glow. Pumpkin/melon отдельно со своими stem/variants/owned PNG, composite forms:null. Budding amethyst без нароста или один stage/face, source growth cards отдельно. Kelp A–D не рост, шесть paths/animation definitions сохранить.

Whole-model rotation жестом. Chest/shulker whole-block facing удалён из builders/resolver/controls/tests/labels; не возвращать. Open/lid-relative/double сохранить, ender без double. Stem direction/growth face/UV faces/sign placement не удалять массово. Static pose/open не playback.

## Ресурсы и lifecycle

Bubble_column → existing sprite (4dbdcd2/4f1ef0b): aquaticBindings сохраняет 18 owned roles/variants/paths, pumpkin_side вне bubble roles. Sprite/resourcePaths берёт выбранный slot, не все 18 bindings. Одна texture/plane, без нового builder/PNG/particle engine/порядка высот.

utility-parts: wooden_button/wooden_pressure_plate oak default, stone_button/stone_pressure_plate stone; indexed variants 6/7 сохранять. normal_stone_stairs/stone_brick_stairs/prismarine_stairs/sandstone/red_sandstone stairs имеют named face bindings. normal_stone_stairs не stone_stairs; sandstone up/down/side раздельны. Existing resource-variants regressions не заменяют alternatives/repeats.

e07f971: grass_path именованно выбирает dirt для down из общего dirt/coarse_dirt атласа, оставляет variants/paths обоих ресурсов и неизменную геометрию; три регрессии в существующем тесте. 8f9a1c9: mycelium в FIXED_PRIMITIVES, model cube, count 2 на грань, up mycelium_top/down dirt/side mycelium_side; snow-side и повторы сохраняются. Снежный picker не заявлен готовым. Это конкретные ресурсные привязки, не общий fallback на первый элемент. После mycelium правки новых тестов не запускали.

Leaf contract catalog/leaf-preview.mjs для 14 реальных ID: default cutout, cutout/opaque синхронно для faces через resolver/common picker, edited PNG независимо. Icon/sprite leaf control не потребляет. Source identities/cutout/opaque/carried сохранить. Biome tint не подтверждён. 4b37171 подключает ID, 836ad36 только integration tests.

createModelMaterials: descriptor/bindings/classified textures, isTexture и boolean userData.semi. Sprite/glow/emissive Basic-unlit, обычные Lambert; conflicting lit/unlit path отклонять. semi true → transparent true/alphaTest 0/depthWrite false, иначе false/.05/true. FrontSide/depthTest default, planar DoubleSide. Materials владеют материалами и заимствуют textures; texture layer владеет GPU textures. Composite update/cleanup охватывает все части/ошибки, AggregateError и canvas-GPU/loader limits/cache/retry сохранить. PNG/opacity ради успеха не менять.

## Сохранённые модельные контракты

Fire/soul_fire: 4 внутренних наклонных + 4 периметральных planes/full-frame UV/без roof, раскладка кандидат. Unlit все шесть roles; primary/up и alternate/down независимо от PNG; validation/cleanup всех geometries/default primary, stageCount не менялся. Campfire/soul_campfire: down raw log/north lit log/up flame, emissiveRoles:['up']; unlit 28 log faces, lit/default ещё 2 flame planes. Lit picker/PNG/EN-RU/source IDs сохранены; smoke/playback не реализованы.

Liquids 4 ID: integer level 0..7/default 0, height (8-level)/9, lava emissive; не flow/slopes/falling/biome tint/overlays/timing. Chest 11 ID: sheet/double_sheet независимо от PNG, wide sheets собственные, ender без double, waxed routes. Shulker 17 source ID: base/lid/static open/default closed, light_gray→silver sheet без silver card.

Pot: 23 patterns+ordinary/4 стороны/shared picker/base-body-UV. Conduit: 6 resources/default inactive/static active Java-reference/eye-wind picker без tracking/player. Bell: 5 legacy parts на стойках/свой sheet/owned beam-posts/PNG, без других креплений/звона. Player_head: skull/head+hat inflate 0.5px/full Steve 64x64 → player/head, не тело/skin editor; при втором потребителе отделить деталь от placement/pivot.

Skeleton/wither/creeper/zombie/piglin/dragon heads и statue 4 oxidation/4 poses сохранять. Dragon 256x256/head+jaw/mirror UV/static closed jaw, placement-scale-UV не приняты. Статуе глаза/цветок автоматически не добавлять; extra waxed ID не новые стадии/геометрии. Full mobs отдельно, фиктивных доступных форм нет.

Bed: 9 legacy parts/16 owned sheets, light_gray→silver, bed→red_bed. Подключение source ID и adapter подтверждено; mock normal.count исправлен fd6b777, строгий контракт модели не ослаблен. Sign reference acacia@750f657: standing/attached rotation, ceiling/wall facing; suspicion снято. Banner 16 colors/ordered layers/canvas update/tint только полотна; source PNG не перезаписывать, ominous свой sheet без recolor/layers/отдельной card. Cauldron/auxiliary contents не зависят от PNG. Принятые geometry/UV, особенно repeater/comparator, без дефекта не переделывать. Прочие piston/gels/farmland/snow/chorus/vines/dripleaf/aquatic/propagule контракты — прежняя полная архитектура и исходники.

## Границы доказательств

Full per-ID resource/state audit ещё нет. Existing coverage/audit/inputValidation, не вторая система. Stale 67 уже исправлено; 113 builders — тестовое ожидание, не число принятых карточек. OLDCHAT26 13 mock Node cases/sign fixture checks и OLDCHAT25 resource-variants 16/16 — исторические сообщения.

По присланным CI-логам: 73ca673 — validate 686/694, 8 fail; d3a21c3 — 694/694, preview down ambiguity; e07f971 — 697/697, fail 0/skipped 0, preview north ambiguity в общем обходе. Coverage artifact сообщает 1277 assigned/registered, 0 unresolved/missingBuilders/invalid, inputValidation 1277 passed; это не проверка всех геометрий/изображений. Mycelium неоднозначность подтверждена статически и исправлена 8f9a1c9; лог не содержит source ID и не доказывает перечень пройденных объектов. Успешного полного geometry sweep пока нет. После 8f9a1c9 результат CI не проверен.

По просьбе владельца перейти к документации без новых тестов/ручных прогонов; автоматический CI не выключать. Полные PNG-TGA/WebGL/UV/scale/alpha/Android и editor draw/history/reopen/export не приняты. Следующая техническая приёмка при возобновлении должна учитывать эти ограничения.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d. Не очищать foundrykin.catalog.v6/fk070_packs/localStorage. После editor acceptance — runtime switch/FK_V/cache/removal. Tablet/desktop layout/full mobs/skin editor/body/armor — будущий scope; mobile/paper tokens сохранить.
