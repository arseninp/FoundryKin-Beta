# ARCHITECTURE

Обновлено 2026-11-01. Проверенный кодовый HEAD: 62c8af15ec1fb4d9c4cc1c96caec9e349141df6a. Прочитаны OLDCHAT14 и шесть документов, история, полные diff восстановления хоруса и stem-пакета, текущие rules/forms. Тесты/HTML/полный аудит здесь не выполнялись. Остальные детали последних пакетов — архив и история, не новый запуск.

## Два пути

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По прежней проверке UI 0.9.1, HTML здесь не перечитан. Новый путь: data → normalize → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. Он не принят в основном UI; отдельная проверяемая страница не подтверждена.

Синтаксическое повреждение utility-parts в 5c5f9f4 исправлено 86b6d8f: чужой хвост удалён, chorus_flower/stem объявлен в настоящем dependencies, тесты восстановлены. Не описывать прежний дефект как текущую блокировку, но полный запуск нового пути всё ещё не подтверждён.

## Каталог, ресурсы и идентичность

- load.mjs: JSONC/assembleChunks; hashes проверяет вызывающий загрузчик.
- resources.mjs: unique paths/faces/carried отдельно от variants/carriedVariants с исходными индексами/повторами; normalizeBlock подключает named parts. Door atlases сохраняют половины. Нормализация lit furnace/blast_furnace/smoker ограниченно выравнивает переднюю грань с обычным состоянием, не меняя произвольные раскладки.
- model-policy/rules/models: специальные назначения и ограниченные шаблоны; unknown остаётся unresolved без cube fallback.
- parts/utility-parts: именованные роли частей/стадий. Farmland wet=up[0], dry=up[1]; composter rim/compost/ready из up и bottom/side. Cage хранит variant_N_face (1 mob, 12 trial, 8 vault). Chorus flower live/dead и shared stem. Cave vines сохраняет body/head и варианты berries. Stem для двух точных ID требует два variants.up и создаёт собственные роли stem/upperstem.
- dependencies.mjs: конкретные shared roles с inventory-проверкой, без передачи ownership. Pot/soil азалии, head_back поршней, torch_on/off устройств, pod pitcher, stem chorus_flower. Чужая PNG не становится owned edit slot.
- compile.mjs: records/cards/aliases/families/stateGroups/routes/reverse resource index/dependencies.
- identity/duplicates: aliases требуют эквивалентности ресурсов/моделей/состояний. Waxed/infested сохраняют ID routes; oxidation остаётся. Coral wall fans aliases без mounting форм; candle cakes aliases cake с сохранением ресурсов. Правила не равны полному входному прогону.
- access.mjs: saved ID/alias → source/card/form/state; неоднозначный PNG не выбирает первого владельца.

## Формы карточек и следующий составной просмотр

rules/forms.mjs декларативно связывает bamboo→shoot:bamboo_sapling и torchflower→crop:torchflower_crop при наличии обеих записей. Source IDs, модели и owned PNG остаются отдельными; forms не равны aliases. Посев факельника сохраняет две стадии. Явные дополнительные family rules объединяются с проверкой конфликтов.

Связи pumpkin/melon со стеблями ещё НЕ записаны. Общий builder stem не объединяет карточки. Следующая согласованная функция — две соответствующие карточки и явный просмотр «Без стебля / Со стеблем»: во втором варианте плод и соседний направленный к нему стебель видны одновременно. Это не замена плода отдельным стеблем. Сохранить pumpkin states, stage/attached/facing, source ID routes и владение ресурсами. Edit PNG не управляет видом. В legacy не встраивать эту функцию.

В OLDCHAT14 заявлен локальный составной компонент с семью проверками, но исходник/журнал в этой передаче не получены; доступность и запись не подтверждены. Допустимо согласованное разбиение: компонент с тестами → связь карточек/состояния/маршрутов → интеграция. Не дублировать существующую геометрию и не выдавать отдельный компонент за готовый каталог.

## Предпросмотр и состояния

Edit slot независим от geometry/state. Материал принадлежит объекту либо declared dependency; shared сообщает загрузчику внешние пути. Potted azalea меняет builder с pot/soil; crop/turtle egg сохраняют стадии/повторы; stage_cross считает непрерывные stage_N. Общей подключённой UI-панели нового пути ещё нет.

Общий cubeStateBindings выбирает синхронные индексы variants по граням и проверяет состояние/длины/пути:
- bee_nest/beehive honey false/true;
- crafter idle/triggered/crafting;
- suspicious sand/gravel brushing 0..3;
- chiseled bookshelf occupied false/true, не все комбинации книг;
- creaking heart inactive/dormant/active;
- mushroom blocks/stem variant 0..15, default 14/10;
- copper bulbs четыре режима, включая oxidation/waxed;
- frosted_ice 0..3;
- respawn_anchor charges 0..4 с синхронным up/side.

Повторы не удалять; старый отдельный hive handler заменён общим механизмом. Это новый backend-контракт, не уже подключённые переключатели сайта.

## Библиотека и геометрия

createModelLibrary собирает фабрики и запечатывает registry. compileModelCatalog до normalize проверяет назначения/builders; unresolved/missing блокируют полный compile. Затем compileCatalog и registry.validate. Plain/wrapped terrain/item atlas поддерживаются. Admission ограниченного среза требует явного решения.

В model-library.test на HEAD ожидается 99 типов после stem. Это не выполненная проверка и не число карточек/визуально принятых объектов. inspectModelCoverage не строит геометрию.

shapes.mjs: composeShape/requireRoles, плоскости/боксы/повороты/наклонные группы. Planar cleanup сохраняет сцену при проверяемых ошибках и освобождает подготовленную геометрию без преждевременной мутации материалов. Принятую legacy geometry/UV не переделывать ради формальной чистоты.

Поршень: корпус/inner, шток, front/head/head_back. Обычная текстура сзади обоих вариантов через dependency; sticky front зелёный. Structures: composter полый, level 0..8/ready; scaffolding открытый каркас/bottom; cage внутренние/наружные поверхности и дно vault на 3 px, без внутренних entities/items. Java-reference geometry с Bedrock materials требует PNG/WebGL проверки.

Plants: chorus plant шесть boolean connections, базовый noside без случайных noside1..3; flower live/dead/shared stem. Cave vines целый body+head со scale 1.4 и отдельные части scale 1, berries независим от edit PNG. Stem stage 0..7 меняет высоту/UV; attached использует connector и четыре facing. Исходное основание Java-reference на один пиксель ниже блока сохранено. Builder не меняет opacity/side/tint; игровая окраска по возрасту не добавлена.

Dragon egg: специализированная модель из шести элементов/33 граней через specials, Java reference с Bedrock material. Гели: slime 10/16 и honey 14/16 px ядро/оболочка, без принудительного opacity/clone; legacy alpha policy отдельна от геометрии. Farmland 15/16 wet; snow layers 1..8 (2..16 px).

Ограничения: closed door; один amethyst growth; potted azalea Bedrock UV review открыт; repeater/comparator сохраняют legacy; track плоский, workshop не все orientations. Decorated pot без черепков, conduit без активированной формы, cauldron без lava_cauldron, fire без плеера.

## Источники, аудит и сохранность

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторически candidate: 1275 определений, 1241 terrain key, 8201 resource path; auxiliary end_gateway/lava_cauldron. Это не свежий coverage. Использовать stonecutter_block, не obsolete stonecutter.

tools/model-coverage.mjs/catalog/audit.mjs проверяют assignments/builders/inputValidation/normalization/inventory/dependencies; inputValidation не доказывает cards/icons/preview/render. Artifact workflow не доказывает зелёный CI. Свежего полного остатка нет.

Item по умолчанию sprite, 3D явно. Entity source/inventory/geometry/material/render-controller adapter не реализован; inventory path не создаёт карточку. Sign/bed/bell/cushion требуют проверяемого источника; entities отложены, scope согласовать до переключения.

Отделять mocks, выбранный реальный вход, полный compile/CI, реальные Three/WebGL и Android/export. OLDCHAT14 сообщает 11 интеграционных проверок на выбранном входе с registry-recorder, не исполнением геометрии. Здесь тесты не запускались. Команды: node tools/validate.mjs; node --test tools/*.test.mjs.

Legacy cache foundrykin.catalog.v6; packs fk070_packs. Риски: saved ID, async targets, transactions/import limits, non-square atlas, dimensions/alpha/cache/URL lifecycle. Storage не очищать. До удаления legacy принять draw/undo/redo/Add/reopen/PNG/mcpack; при переключении синхронизировать loader/cache versions.
