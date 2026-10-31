# ARCHITECTURE

Обновлено 2026-10-31. Кодовая точка: 4c52b9d5508422e705b4e5ef28056391350d2ecd. Границы проверки и история — CONTEXT. Эта передача проверила library/gels/model assignments и последний diff, но не выполнила полный аудит всех модулей или тесты.

## Два пути

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. По истории это рабочий UI 0.9.1; HTML перед изменением интеграции нужно перепроверить. Новый путь: data → normalization → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. Его полноценный UI и отдельная проверяемая страница ещё не подтверждены.

## Каталог и контракты

- load.mjs: JSONC/assembleChunks; контрольные суммы проверяет вызывающий загрузчик.
- resources.mjs: уникальные paths/faces/carried отдельно от variants/carriedVariants с повторами и исходными индексами. normalizeBlock подключает named parts. Shared door atlases сохраняют свои половины.
- rules/models.mjs/model-policy.mjs: явные специальные назначения и ограниченные шаблоны; unknown остаётся unresolved. slime→slime, honey_block→honey_block, farmland→farmland, snow_layer→snow_layer уже записаны. Имена гелей совпадают с gels.mjs.
- rules/parts.mjs и специализированные parts: именованные роли частей и индексированные варианты. В последнем проверенном diff utility-parts задаёт farmland wet=variants.up[0], dry=variants.up[1], bottom=down, side=north и отвергает неполный верх. Порядок исходных вариантов не меняется.
- rules/dependencies.mjs: объявленные общие роли, проверка пути и inventory. Pot/soil азалии, torch_on/off устройств, pod pitcher не становятся собственными редактируемыми слотами. Dependencies не заменяют entity source adapter.
- compile.mjs: records/cards/aliases/families/stateGroups/routes/reverse resource index и зависимости.
- identity/rules/duplicates: aliases требуют эквивалентности ресурсов, модели и состояний. Waxed/infested сохраняют old-ID routes; oxidation variants не удаляются. Добавлены правила десяти coral_wall_fan→coral_fan и 17 candle_cake→cake. Объявленное правило не заменяет проверку применения на полном входе.
- states.mjs: группы одинаковой модели, включая режимы датчиков и pitcher crop/plant. Bamboo sapling/adult требуют связи форм, не простого объединения state groups.
- access.mjs: saved ID/alias → source/card/form/state. Неоднозначный PNG не выбирает первого владельца.
- preview.mjs: edit slot независим от state. Материал должен принадлежать объекту или конкретной declared dependency. Возвращает shared для загрузчика. Potted azalea переключает модель и down/south/west bindings; crop/turtle egg используют варианты с повторами. По истории cc26bd0 добавил подсчёт стадий stage_cross по непрерывным stage_N. Часть состояний проверяется построителями; общей UI-панели ещё нет.

## Библиотека и геометрия

models/library.mjs непосредственно проверен: createModelLibrary собирает фабрики, включая gels, specials, dripleaf, sculk, dried-ghast и barrel, и запечатывает registry. compileModelCatalog сначала проверяет план и наличие построителей; unresolved/missing блокируют компиляцию до normalize. Затем compileCatalog и registry.validate проверяют записи. Поддерживаются plain/wrapped terrain/item atlas. Режим ограниченного среза не подтверждён реализованным.

inspectModelCoverage проверяет назначение и наличие model ID, не строит геометрию и не доказывает UV/материалы/визуальную готовность. Число типов реестра не равно числу исходных блоков, карточек или принятых моделей.

models/shapes.mjs предоставляет composeShape/requireRoles и операции плоскостей, боксов, поворотов и наклонных групп. Модели группируются по ответственности; перенос сохраняет принятую legacy geometry/UV без необоснованных переписываний. Closed door без открывания, один amethyst с growth, potted azalea с отдельным Bedrock PNG/UV review. Repeater/comparator используют принятую legacy геометрию. Track остаётся плоской формой, workshop — downward hopper/floor grindstone/frames, не все игровые состояния.

По истории OLDCHAT12 добавлены utility/decorative модели, fire, dripleaf/sculk/cactus, pointed dripstone/dried ghast/barrel и stage_cross растения. Состояния выбирают части/материалы независимо от PNG. Декорированный горшок пока без черепковых узоров, conduit без активированной формы, fire без плеера, cauldron без lava_cauldron.

Проверенный gels.mjs строит ядро и оболочку исходными материалами: slime 10/16 px, honey_block 14/16 px. Мёд использует up/down/north; принудительного opacity и клонирования материалов нет. По истории fk-view.js изменяет blending/depth policy по промежуточной альфе PNG и пересчитывает её после обновления текстуры. Это разные уровни: геометрия новой библиотеки и материал общего legacy viewer. Реальные PNG, порядок прозрачного WebGL-рендеринга и результат в UI не подтверждены.

Farmland и snow_layer добавлены в specials по истории fca127c и назначены последним проверенным коммитом. Farmland: высота 15/16, wet; snow: layers 1..8, высота 2..16 px. Интеграционный тест в 4c52b9d проверяет нормализацию закреплённых записей и роли, не рабочие UI-переключатели.

## Аудит и источники

Существующий tools/model-coverage.mjs используется для отчёта назначений; по истории 9dca5f4 добавил catalog/audit.mjs и inputValidation: нормализация назначенных записей, инвентарь ресурсов и объявленные dependencies. Ошибки разделяются по ID/этапу; отсутствие данных не считать успешной проверкой. Это не геометрическая или браузерная приёмка.

По истории validate.yml сохраняет coverage artifact даже после неуспешных тестов, если запуск не отменён; ошибка тестов не подавляется. strands.test.mjs исправлен в bae756f. Наличие workflow и исправления не доказывает зелёный CI или доступность артефакта. Полный CLI и inputValidation текущего candidate ещё нужно получить и проверить.

PIN Mojang: 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторические размеры candidate: 1275 определений, 1241 terrain key, 8201 resource path; auxiliary end_gateway/lava_cauldron. Это не новый замер. Старый stonecutter по прежней истории исключён, modern stonecutter_block нужен.

Item по умолчанию sprite, 3D — по явному объявлению. Entity source/geometry/material/render-controller adapter не реализован. Inventory пути сам по себе не создаёт карточку. Таблички, кровати, колокол, cushion и другие отдельные ресурсы требуют проверяемого источника и ownership; entities отложены владельцем. Сохранять PNG dimensions/alpha, atlas и frame sequences.

## Проверки и сохранность

Не смешивать целевые stub-тесты, реальные JSON, полный compile, CI и настоящий WebGL. Документальная передача тесты не запускала. Команды среды исполнения: node tools/validate.mjs; node --test tools/*.test.mjs. Их запуск не перекладывать на владельца. Полный свежий coverage с inputValidation, compiler, Android и export остаются неподтверждёнными.

Legacy cache foundrykin.catalog.v6; packs fk070_packs. Риски: saved ID, async target binding, storage transactions/import limits, non-square atlases, глобальное изменение разрешения, cache limits и URL lifecycle. Не очищать storage. Перед удалением legacy проверить draw/undo/redo/Add/reopen/PNG/mcpack; при переключении синхронизировать loader/cache versions.
