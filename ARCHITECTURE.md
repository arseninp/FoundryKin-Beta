# ARCHITECTURE

Обновлено 2026-10-31. Проверенный HEAD 5c5f9f4f449ba0aba3be6847cd09287f0d716130. Эта передача прочитала документацию, OLDCHAT13, последние коммиты и целевые исходники/diff; тесты и полный аудит не выполнялись. Текущий новый путь повреждён последним пакетом: см. P0 в CONTEXT/TODO.

## Два пути

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежним документам рабочий UI 0.9.1; HTML здесь повторно не проверен. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. Он не принят в основном UI; отдельная проверяемая страница не подтверждена.

В 5c5f9f4 в utility-parts.mjs вклеены заголовки path/content и код dependencies.mjs с повторным импортом. Это синтаксически повреждённый модуль, а настоящий dependencies остался без chorus. Нельзя считать перечисленные ниже новые контракты полностью работоспособными до исправления сохранённых файлов.

## Каталог и ресурсы

- load.mjs: JSONC/assembleChunks; hashes проверяет вызывающий загрузчик.
- resources.mjs: уникальные paths/faces/carried отдельно от variants/carriedVariants, где сохраняются исходные индексы и повторы. normalizeBlock подключает named parts; общие door atlases сохраняют половины.
- model-policy/rules/models: точные специальные назначения и ограниченные шаблоны; неизвестные остаются unresolved, не cube fallback.
- parts и utility-parts: именованные роли частей/стадий. Farmland wet=variants.up[0], dry=variants.up[1]; composter rim/compost/ready из трёх вариантов up плюс bottom/side. Cage хранит variant_N_face для всех исходных индексов (1 mob, 12 trial, 8 vault). Chorus flower live/dead и stem подготовлены в utility-parts, но модуль сейчас повреждён.
- dependencies.mjs: разрешение конкретных общих ролей с проверкой inventory, без передачи ownership. Реально объявлены pot/soil азалии, head_back поршней, torch_on/off устройств, pod pitcher. Chorus stem есть в shared.mjs и привязках, но его объявление в настоящем dependencies ещё отсутствует.
- compile.mjs: records/cards/aliases/families/stateGroups/routes/reverse resource index и dependencies.
- identity/duplicates: aliases требуют эквивалентности ресурсов, модели и состояний. Waxed/infested сохраняют old-ID routes; oxidation остаётся. Coral wall fans — aliases обычных без отдельной формы; candle cakes имеют правила cake aliases при сохранении ресурсов. Наличие правил не заменяет полный входной прогон.
- states.mjs: группы одинаковой модели, включая датчики/pitcher; bamboo sapling/adult нуждаются в связи форм.
- access.mjs: saved ID/alias → source/card/form/state; неоднозначный PNG не выбирает первого владельца.

## Предпросмотр и состояния

Edit slot независим от геометрии и state. Материал принадлежит объекту или конкретной declared dependency; shared сообщает загрузчику внешние пути. Potted azalea меняет построитель и использует pot/soil; crop/turtle egg сохраняют повторы стадий; stage_cross считает непрерывные stage_N bindings. Часть состояний проверяет сам builder, общей UI-панели ещё нет.

Общий cubeStateBindings в preview заменил отдельную обработку ульев. Он синхронно выбирает индекс variants по граням и проверяет допустимые состояния/длины/принадлежность путей:

- bee_nest/beehive: honey false/true;
- crafter: mode idle/triggered/crafting, повторяющиеся пути не удаляются;
- suspicious sand/gravel: brushing 0..3;
- chiseled bookshelf: occupied false/true, не все комбинации книг;
- creaking heart: inactive/dormant/active;
- brown/red mushroom block и mushroom_stem: variant 0..15. Default 14 для шляпок, 10 для ножки; геометрия и UV общего cube не изменены.

Это контракты нового пути, не уже подключённые переключатели рабочего приложения.

## Библиотека и геометрия

createModelLibrary собирает фабрики и запечатывает registry. compileModelCatalog сначала проверяет назначения/наличие builders; unresolved/missing блокируют полный compile до normalize. Потом compileCatalog и registry.validate проверяют записи. Plain/wrapped terrain/item atlas поддерживаются. Ограниченный admission среза требует явного решения.

inspectModelCoverage проверяет назначение и наличие model ID, не строит геометрию. В tools/model-library.test.mjs записано ожидание 95 типов после хоруса; оно не выполнено этой передачей и не доказывает запуск повреждённого каталога.

shapes.mjs: composeShape/requireRoles, плоскости/боксы/повороты/наклонные группы. Сохранять принятую legacy geometry/UV; менять по конкретному дефекту, не ради формальной чистоты. Planar получил единый безопасный путь построения с очисткой геометрии и без частичной сцены при проверяемых ошибках.

Поршень разделяет корпус/inner, шток, front/head и head_back. Задняя грань выдвинутой головки добавлена для обоих вариантов; dependency head_back использует piston_top_normal, sticky front остаётся зелёным. Чужая PNG не становится собственным edit slot липкого поршня.

Structures: composter — внутреннее дно и четыре стенки, level 0..8, ready material на 8; scaffolding — отдельные стойки/открытый каркас/настил, bottom добавляет нижнюю площадку и обвязку. Cage — наружные и внутренние грани, vault с внутренним дном на 3 px, индексированные варианты trial/vault. Внутренние существа и предметы не включены. Геометрия новых структур основана на Java references с Bedrock materials; PNG/WebGL review отдельно.

Plants: chorus plant имеет шесть независимых boolean connections, базовый noside без случайных noside1..3; chorus flower — составная форма с dead и общей текстурой stem. Геометрия записана, но её ресурсное подключение/сохранённые тесты пакета неполны.

Гели: slime ядро 10/оболочка 16 px, honey_block 14/16; исходные материалы без принудительного opacity/clone. Legacy FKView alpha policy — отдельный уровень от новой геометрии. Реальная прозрачность и сортировка WebGL не приняты. Farmland 15/16 с wet; snow layers 1..8 (2..16 px). Edit PNG не переключает состояния.

Другие ограничения: closed door; один amethyst growth; potted azalea ожидает Bedrock UV review; repeater/comparator сохраняют принятую legacy geometry; track плоский; workshop реализует не все игровые orientations. Decorated pot без черепков, conduit без активированной формы, cauldron без lava_cauldron, fire без плеера.

## Аудит, источники и сохранность

Существующий tools/model-coverage.mjs/catalog/audit.mjs: назначения, builders, inputValidation назначенных записей, normalization/inventory/dependencies. inputValidation не доказывает корректность объединённых карточек, icons, preview или render. Workflow с artifact не доказывает зелёный CI. Отсутствие данных означает не проверено.

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторически candidate: 1275 определений, 1241 terrain key, 8201 resource path; auxiliary end_gateway/lava_cauldron. Это не свежий замер. Нужен stonecutter_block, obsolete stonecutter не возвращать.

Item по умолчанию sprite, 3D только явно. Entity source/inventory/geometry/material/render-controller adapter не реализован; inventory path не создаёт карточку. Sign/bed/bell/cushion требуют проверяемого источника; entities отложены владельцем, scope согласовать до переключения.

Разделять tests на mocks, реальные JSON, full compile/CI, Three/WebGL, Android/export. Исторические целевые результаты — CONTEXT; новые тесты здесь не запускались. Команды: node tools/validate.mjs; node --test tools/*.test.mjs. Полный актуальный прогон не подтверждён.

Legacy cache foundrykin.catalog.v6; packs fk070_packs. Риски: saved ID, async targets, transactions/import limits, non-square atlas, dimensions/alpha, cache/URL lifecycle. Storage не очищать. До удаления legacy принять draw/undo/redo/Add/reopen/PNG/mcpack; при переключении синхронизировать loader/cache versions.
