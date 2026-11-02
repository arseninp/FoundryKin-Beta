# ARCHITECTURE

Обновлено 2026-11-02. Кодовый HEAD перед документальной записью: 4448dca87745ccf94203591952288a06d77eb01b. Границы свежей проверки — CONTEXT. Это описание записанной основы, не runtime acceptance.

## Пути приложения

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежней проверке UI 0.9.1; основной HTML здесь не перечитан. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → materials/textures → scene. В основном редакторе не принят.

После df1fcab/f03acbe material instance и canvas texture lifecycle уже подключены к новому preview; не повторять прежнюю задачу импорта materials. Отдельные preview.html/preview.mjs записаны b0e163d: read-only срез 17 исходных ID с переиспользованием PNG/TGA loader, states/rotation/manual frames. Это не полный каталог/редактор; Pages и настоящий WebGL не подтверждены. e64ef13 ограничивает loader timeout/cache по архиву.

## Данные и идентичность

load.mjs читает JSONC/assembleChunks; hashes проверяет вызывающий loader. resources.mjs разделяет unique paths/faces/carried и variants/carriedVariants с индексами/повторами. normalizeBlock добавляет named parts; door atlases сохраняют половины, furnace front normalization ограничена известными парами.

model-policy/rules/models задают назначения без unknown→cube. parts/utility-parts/aquatic-parts задают роли/стадии/части. dependencies разрешает конкретные shared ресурсы с inventory-проверкой, без передачи ownership: pot/soil, piston head_back, torch, pitcher pod, chorus stem, amethyst growth.

compile.mjs собирает records/cards/aliases/families/stateGroups/routes/reverse resource index/dependencies. access.mjs сохраняет исходные source/card/form/state и неоднозначный PNG не назначает первому владельцу. Aliases требуют эквивалентности, не общей PNG. Waxed/infested routes сохраняются, oxidation/normal/deepslate раздельны. Coral wall fans aliases без mounting; candle cakes объединены с cake, обычные свечи отдельно.

## Формы и составные модели

rules/forms связывает bamboo/shoot, torchflower/crop, pumpkin/stem и melon_block/stem, сохраняя source records и owned PNG. Fruit preview показывает плод отдельно либо плод и соседний направленный стебель вместе; варианты тыквы сохраняются. Budding amethyst без роста либо один small/medium/large/cluster на одной из шести граней, growth shared; карточки не объединять.

Edit PNG независим от state/form/stage. Closed/open eyeblossom остаются отдельными по отмене объединения в OLDCHAT16. Панель отдельного среза не означает интеграцию меню в основной editor.

## Материалы и lifecycle

emissive_cross разделяет plant/glow; registry хранит immutable emissiveRoles, glow требует MeshBasicMaterial, не Lambert. createModelMaterials принимает descriptor/bindings/classified textures (isTexture и boolean userData.semi), создаёт Basic для sprite/emissive, Lambert для остальных; конфликт lit/unlit по одному path отклоняется.

semi=true → transparent=true, alphaTest=0, depthWrite=false; иначе transparent=false, alphaTest=.05, depthWrite=true. По умолчанию FrontSide/depthTest, planar builders устанавливают DoubleSide. Материалы управляют только созданными материалами, заимствуют текстуры; texture layer управляет созданными GPU-текстурами. Composite lifecycle учитывает все части и cleanup ошибок. Подключение уже записано; это не доказательство настоящего PNG/WebGL результата.

## Библиотека и новые block entities

createModelLibrary регистрирует и запечатывает builders. compileModelCatalog сначала проверяет assignments/builders, unresolved/missing блокируют полный compile, затем compileCatalog/registry.validate. Read-only срез не должен незаметно ослаблять полный strict compiler. Library test ожидает 105 типов после bed/sign; это не успешный прогон и не число карточек.

Bed: eb98909 переносит девять частей с legacy размерами/UV; ae5cc41 подключает 16 цветных источников/owned sheets, light_gray_bed использует silver, bed маршрутизируется к red_bed без лишней карточки, colour icons переиспользованы. Полная runtime/визуальная приёмка открыта.

Sign: 4448dca добавляет models/signs.mjs, регистрацию sign и обновление существующего library test. Geometry candidate standing/wall/hanging с mounting/rotation/facing и sheet binding. Комментарий указывает acacia-rs/acacia@750f657 как reference, не Mojang geometry export. Листы пород/карточки ещё не подключены; review качества этого коммита — следующая задача. Общий adapter всех entities этим не завершён.

## Геометрия и ограничения

shapes.mjs: composeShape/requireRoles, planes/boxes/rotations. Принятые geometry/UV, особенно legacy repeater/comparator, без дефекта не переделывать. Piston normal top — shared head_back, sticky front сохраняется. Composter level 0..8, scaffolding bottom, cage без внутренних entities. Chorus corruption исправлена 86b6d8f. Cave vines body/head/berries, stem stage 0..7/attached/facing уже есть, stem tint нет.

Cube indexed states сохраняют повторы: hives/crafter/suspicious/bookshelf/heart/mushrooms/bulbs/ice/anchor. Slime/honey cores 10/16 и 14/16, оболочки 16 px; alpha отдельно. Farmland 15/16, wet=up[0]/dry=up[1]; snow layers 1..8. Seagrass short/tall; propagule ground/hanging age 0..4; kelp static lower/top с шестью paths и animation definitions, A–D не стадии роста.

Открыты Bedrock UV potted azalea/reference-моделей, kelp sides/UV/TGA, gel alpha/WebGL, decorated pot patterns, active conduit, lava_cauldron/fire playback, другие placements. Closed door и один выбранный amethyst growth — текущие ограничения.

## Проверки, порядок и сохранность

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Candidate исторически 1275 definitions/1241 terrain keys/8201 paths, не свежий coverage. Существующие model-coverage/audit/inputValidation различают assignments/builders/normalization/inventory/dependencies; не доказывают cards/render. Workflow содержит preview-slice/95 geometry scenarios и userData fix, актуальный успешный CI не подтверждён.

Сначала собрать недостающие модели/основу с точечными проверками, затем общая проверка, затем чистка, затем удаление принятого заменённого legacy. Не развивать тестовую инфраструктуру вместо переноса. Новые test files требуют отдельного согласования; существующие не удалять автоматически. Entities/cushion/bell отложены, item default sprite/3D явно. Scope согласовать до переключения.

Legacy cache foundrykin.catalog.v6; fk070_packs не очищать. Приёмка draw/undo/redo/Add/reopen/PNG/mcpack, Android, async/storage/import/dimensions/alpha/cache/URL lifecycle обязательна до заявления о завершении. FK_V/cache синхронизировать при переключении; не оставлять конкурирующие runtime.
