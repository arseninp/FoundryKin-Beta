# ARCHITECTURE

Обновлено 2026-11-03. Кодовый HEAD перед документальной записью: d7fb21715a633ccd61a4caf7ca78373e1289aa2a. Описание записанной основы по документам, OLDCHAT17 и истории; не свежая runtime acceptance. Границы проверки — CONTEXT.

## Пути приложения

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежней проверке UI 0.9.1; HTML в этой передаче не перечитан. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → materials/textures → scene. В основном редакторе не принят.

df1fcab/f03acbe подключают material instance/composite и canvas/GPU texture lifecycle. b0e163d — отдельный read-only preview.html/preview.mjs для 17 исходных ID, reuse PNG/TGA loader, states/rotation/manual frames. e64ef13 — loader timeout/cache/retry. Это не полный каталог/редактор; Pages/WebGL не подтверждены.

## Данные и идентичность

load.mjs читает JSONC/assembleChunks; hashes проверяет вызывающий loader. 2c2773a подключает auxiliary end_gateway/lava_cauldron через общую сборку входа с сохранением manifest/hash/conflict checks по архиву. Полный compile не подтверждён. resources.mjs разделяет unique paths/faces/carried и variants/carriedVariants с индексами/повторами. normalizeBlock добавляет named parts; door atlases сохраняют половины, furnace normalization ограничена известными парами.

model-policy/rules/models задают assignments без unknown→cube. parts/utility-parts/aquatic-parts — роли/стадии/части. dependencies разрешает конкретные shared ресурсы без передачи ownership: pot/soil, piston head_back, torch, pitcher pod, chorus stem, amethyst growth.

compile.mjs собирает records/cards/aliases/families/stateGroups/routes/reverse resource index/dependencies. access.mjs сохраняет source/card/form/state; неоднозначный PNG не назначать первому владельцу. Aliases требуют эквивалентности, не общей PNG. Waxed/infested routes сохранять; oxidation/normal/deepslate раздельны. Coral wall fans aliases без mounting; candle cakes с cake, обычные свечи отдельно.

## Формы и составные модели

rules/forms связывает bamboo/shoot, torchflower/crop, pumpkin/stem и melon_block/stem с сохранением records/owned PNG. Fruit preview показывает плод отдельно либо с соседним соответствующим направленным стеблем; pumpkin variants сохраняются, pumpkin/melon cards раздельны. Budding amethyst без growth либо один small/medium/large/cluster на одной из шести граней, growth shared; cards не объединять.

Edit PNG независим от state/form/stage. Closed/open eyeblossom раздельны по решению владельца. Панель отдельного среза не означает меню рабочего editor.

## Материалы и lifecycle

emissive_cross разделяет plant/glow, registry хранит immutable emissiveRoles. createModelMaterials принимает descriptor/bindings/classified textures с isTexture и boolean userData.semi: Basic для sprite/glow, Lambert для обычных ролей; конфликт lit/unlit по одному path отклоняется.

semi=true → transparent=true, alphaTest=0, depthWrite=false; иначе transparent=false, alphaTest=.05, depthWrite=true. По умолчанию FrontSide/depthTest, planar builders задают DoubleSide. Материалы владеют только созданными материалами и заимствуют textures; texture layer владеет созданными GPU textures. Composite lifecycle учитывает все части/update/cleanup ошибок.

## Block entities и источники

createModelLibrary регистрирует/запечатывает builders. compileModelCatalog проверяет assignments/builders, unresolved/missing блокируют полный compile, затем compileCatalog/registry.validate. Read-only slice не должен ослаблять strict compiler. Builder counts не равны cards или успешным тестам; свежих counts здесь нет.

Bed: девять частей с legacy geometry/UV, 16 цветных owned sheets, light_gray→silver, bed→red_bed без лишней карточки, reuse icons.

Sign: 4448dca geometry standing/wall/hanging, acacia-rs/acacia@750f657 reference, не Mojang geometry export. f1d0922 уже подключил собственные листы пород, сохранив ID/ресурсы/icons/states. По сравнению в OLDCHAT17 standing/attached используют rotation, ceiling/wall — facing; подозрение о ceiling rotation снято. Визуальная Bedrock приёмка открыта.

Cauldron: lava_cauldron использует прежний корпус/UV и отдельную лаву по умолчанию; PNG не переключает содержимое. Auxiliary вход уже записан.

Chest: одиночная geometry и normal/trapped/ender sources; вся медная группа из восьми ID использует тот же builder с соответствующими листами. state.double выбирает двойную форму/собственные wide sheets обычного/ловушки/медных сундуков, ender double запрещён. state.open статически поднимает крышку и замок, корпус остаётся; facing/double совместимы по архиву.

Shulker box: основание/крышка из закреплённой Mojang geometry без головы существа; шесть направлений, неокрашенный/цветные sheets, light gray→shulker_silver, цвета не сливать. state.open поднимает/поворачивает крышку; открытая поза Java-reference кандидат, Bedrock не подтверждён.

Banner: standing/wall static geometry candidates, base/pattern owned resources. catalog/banner-preview.mjs участвует в canvas composition: 16 state.color, ordered state.patterns, пересборка на image update. По архиву источники не перезаписываются, tint/patterns только на полотне, стойка/перекладина/alpha сохраняются. state.ominous использует banner_illager без recolor/layers, обычные color/patterns сохранены, отдельной карточки нет. Реальные TGA/WebGL открыты.

Copper golem statue: d7fb217 — standing/sitting/running/star geometry и builder. Sources/cards ещё не подключены. Следующий пакет использует существующие entity sheets четырёх стадий без копирования PNG; слой глаз требует отдельного обоснования для статуи. В будущем entity голема переиспользует геометрическую основу, не копию. Это не завершённый общий entity adapter.

Static open/double/pose не являются анимационным плеером или подключённым меню рабочего editor.

## Геометрия и ограничения

shapes.mjs: composeShape/requireRoles, planes/boxes/rotations. Принятые legacy geometry/UV, особенно repeater/comparator, без дефекта не переделывать. Piston normal top shared head_back, sticky front сохраняется. Composter 0..8, scaffolding bottom, cage без внутренних entities. Chorus corruption исправлена 86b6d8f. Cave vines/berries, stem 0..7/attached/facing есть; stem tint открыт.

Cube indexed states сохраняют повторы hives/crafter/suspicious/bookshelf/heart/mushrooms/bulbs/ice/anchor. Slime/honey cores 10/16 и 14/16, оболочки 16 px, alpha отдельно. Farmland 15/16, wet=up[0]/dry=up[1]; snow 1..8. Seagrass short/tall; propagule ground/hanging age 0..4; kelp static lower/top с шестью paths/animation definitions, A–D не рост.

Открыты Bedrock UV potted azalea/reference-моделей, kelp sides/UV/TGA, gel alpha/WebGL, decorated pot patterns, active conduit, fire/player, другие placements. Closed door и один выбранный amethyst growth — текущие ограничения.

## Проверки и сохранность

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Candidate исторически 1275 definitions/1241 terrain keys/8201 paths, не свежий coverage. Существующие model-coverage/audit/inputValidation различают assignments/builders/normalization/inventory/dependencies, но не доказывают cards/render. Workflow/95 scenarios и CI fixes существуют; актуальное прохождение не подтверждено. Возможные проблемы OLDCHAT17 перечислены в CONTEXT как отложенные гипотезы, не доказанные дефекты.

Сначала перенос с точечными проверками, затем общая проверка, затем чистка, затем удаление принятого заменённого legacy. Новые test files требуют отдельного согласования; существующие не удалять автоматически. Полные entities/cushion/bell отложены, scope согласовать до переключения. Item default sprite/3D явно.

Legacy cache foundrykin.catalog.v6; fk070_packs не очищать. До завершения принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle. FK_V/cache синхронизировать при переключении, не оставлять конкурирующие runtime.
