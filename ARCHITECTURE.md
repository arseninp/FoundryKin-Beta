# ARCHITECTURE

Обновлено 2026-11-02. Проверенный кодовый HEAD: cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. Границы свежей проверки — CONTEXT. Тесты/HTML/полный аудит здесь не выполнялись.

## Два пути и текущий незакрытый стык

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежней проверке UI 0.9.1; HTML здесь не перечитан. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. Он ещё не принят в основном UI; отдельная проверяемая страница не подтверждена.

Новый models/materials.mjs записан, но прочитанный catalog/preview.mjs его не импортирует. Ближайшая работа — подключить материалы и lifecycle, не создавать новый модуль заново и не переключать legacy. Затем отдельно объединить closed/open eyeblossom в одну карточку.

## Каталог, ресурсы и идентичность

load.mjs читает JSONC/assembleChunks, hashes проверяет вызывающий loader. resources.mjs разделяет unique paths/faces/carried и variants/carriedVariants с исходными индексами/повторами. normalizeBlock добавляет named parts. Door atlases сохраняют половины; furnace front normalization ограничена известными lit/normal парами.

model-policy/rules/models задают специальные назначения и ограниченные шаблоны; unknown остаётся unresolved. parts/utility-parts и aquatic-parts объявляют роли, стадии и части. dependencies разрешает конкретные shared resources с inventory-проверкой без передачи ownership: pot/soil, piston head_back, torch_on/off, pitcher pod, chorus stem, amethyst growth. Чужая PNG не становится owned edit slot.

compile.mjs собирает records/cards/aliases/families/stateGroups/routes/reverse resource index/dependencies. access.mjs открывает source/card/form/state по исходному ID; неоднозначный PNG не выбирает первого владельца. Aliases требуют эквивалентности, а не просто общей текстуры. Waxed/infested сохраняют routes; oxidation и normal/deepslate остаются раздельными. Coral wall fans aliases без mounting, candle cakes объединены с cake при сохранении ресурсов.

## Формы и составные предпросмотры

Текущий rules/forms.mjs связывает bamboo→shoot:bamboo_sapling, torchflower→crop:torchflower_crop, pumpkin→stem:pumpkin_stem и melon_block→stem:melon_stem при наличии обеих записей; explicit rules объединяются с проверкой конфликтов. Исходные записи/модели/owned PNG сохраняются, формы не aliases.

Preview обёрнут withFruitStemSelection и withBuddingAmethystSelection. Плод+стебель — отдельные соответствующие карточки тыквы и арбуза, явный stem: плод один либо плод и соседний направленный к нему стебель вместе. Сохранить варианты тыквы и saved IDs. Budding amethyst: без нароста либо один small/medium/large/cluster на одной из шести граней, ресурс нароста shared; карточки аметистов не объединять.

Edit slot независим от geometry/state/form/stage. Открытый/закрытый глазоцвет пока не объединены; следующая согласованная связь должна сохранить оба source ID, ресурсы и glow открытого. UI-панель нового пути ещё не подключена.

## Материалы и светящиеся слои

5720f66 добавил emissive_cross для open_eyeblossom/firefly_bush. Utility bindings разделяют plant/glow и проверяют порядок двух ресурсов. Registry копирует/замораживает emissiveRoles:['glow']. Builder требует unlit MeshBasicMaterial для glow, а не молча использует освещаемый материал; готовит оба слоя до добавления, очищает подготовленную геометрию при ошибке второго слоя, задаёт glow renderOrder=1.

cc5d4e2 добавил createModelMaterials(Three,descriptor,bindings,textures). Вход — разрешённые role→path bindings и классифицированные textures с isTexture=true и boolean userData.semi. Sprite и emissive roles используют MeshBasicMaterial, другие MeshLambertMaterial. Одинаковый path с конфликтующими lit/unlit ролями отклоняется.

semi=true: transparent=true, alphaTest=0, depthWrite=false; иначе transparent=false, alphaTest=.05, depthWrite=true. Исходно FrontSide/depthTest=true, нужный planar builder ставит DoubleSide. Модуль владеет только созданными материалами, не клонирует/не освобождает текстуры; возвращает mats/update/dispose, update предварительно проверяет полный lookup.

Подключение к preview/loader/lifecycle ещё не записано. Требуется сохранить emissive policy, обновление карт и cleanup при ошибках/смене объекта, включая составные сцены. Обычный Lambert для glow намеренно приводит к ошибке builder. Наличие materials.mjs не доказывает работающий WebGL.

## Состояния и библиотека

Общий cubeStateBindings синхронно выбирает индекс по граням и сохраняет повторы: hive honey, crafter modes, suspicious brushing 0..3, bookshelf empty/occupied (не все комбинации книг), creaking heart modes, mushroom variant 0..15 (defaults 14/10), copper bulb 4 modes включая waxed/oxidation, frosted ice 0..3, respawn anchor 0..4. Potted azalea меняет builder с pot/soil, crop/turtle egg/stage_cross сохраняют реальные стадии.

createModelLibrary регистрирует и запечатывает builders. Library test ожидает 103 типа после seagrass/propagule/kelp/emissive_cross; это не запуск, не число карточек и не визуальная готовность. compileModelCatalog проверяет assignments/builders до normalize, unresolved/missing блокируют полный compile, затем compileCatalog/registry.validate. Admission ограниченного среза требует явного решения.

## Геометрия и ограничения

shapes.mjs — composeShape/requireRoles, плоскости/боксы/повороты. Принятую legacy geometry/UV не переделывать ради чистоты; repeater/comparator сохраняют прежнюю реализацию. Поршни используют normal top как shared head_back и сохраняют зелёную sticky front. Composter полый level 0..8; scaffolding bottom; cage имеет внутренние поверхности/дно vault без entities/items внутри.

Chorus plant: шесть connections и базовый noside без случайных noside1..3, flower live/dead/shared stem. Дефект границ utility-parts/dependencies 5c5f9f4 исправлен 86b6d8f, не текущий блокер. Cave vines целый body+head и отдельные части, berries отдельно от PNG. Stem stage 0..7/attached/facing, роли stem/upperstem, без возрастной окраски.

Seagrass short/tall и согласованные lower/upper A/B. Mangrove propagule ground/hanging age 0..4 — Java-reference с Bedrock materials. Kelp — статический кандидат lower+top с шестью путями, анимационные определения сохранены; A–D не стадии роста. Точные Bedrock sides/UV/TGA и плеер ещё открыты.

Dragon egg: шесть элементов/33 грани Java-reference. Slime/honey: ядра 10/16 и 14/16 при оболочке 16 px; alpha policy отдельно. Farmland 15/16 wet=up[0]/dry=up[1]; snow 1..8 layers. Ограничения: closed door, один amethyst growth, potted azalea Bedrock UV review, workshop не все orientations, decorated pot без черепков, conduit без active, cauldron без lava_cauldron, fire без плеера.

## Источники, аудит и сохранность

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторический candidate: 1275 определений/1241 terrain key/8201 resource path, auxiliary end_gateway/lava_cauldron; это не свежий coverage. tools/model-coverage.mjs/catalog/audit.mjs проверяют assignments/builders/inputValidation/normalization/inventory/dependencies, не принятую визуализацию карточек. Artifact workflow не доказывает зелёный CI.

Item по умолчанию sprite, 3D явно. Entity source/inventory/geometry/material/render-controller adapter не реализован; sign/bed и прочие block entities требуют проверяемого источника, inventory path не создаёт карточку. Scope согласовать до переключения, entities/cushion/bell отложены.

Отделять targeted mocks, выбранный реальный вход, полный compile/CI, настоящие Three/WebGL и Android/export. Здесь тестов не было. Новые постоянные тестовые файлы без отдельного согласования не добавлять; существующие не удалять автоматически.

Legacy cache foundrykin.catalog.v6; packs fk070_packs не очищать. До удаления legacy принять draw/undo/redo/Add/reopen/PNG/mcpack, async targets/storage/import limits/dimensions/alpha/cache/URL lifecycle; при переключении синхронизировать FK_V/cache.
