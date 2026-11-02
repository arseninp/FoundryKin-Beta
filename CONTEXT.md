# CONTEXT — вход новому чату

Обновлено 2026-11-02. arseninp/FoundryKin-Beta, main. Проверенный кодовый HEAD перед этой документальной записью: 4448dca87745ccf94203591952288a06d77eb01b. Это не выпуск приложения; рефакторинг и блоковый этап не завершены.

## Точка остановки

Прочитан полный OLDCHAT16 на Диске и шесть документов; сверены последние 12 коммитов и полный трёхфайловый diff 4448dca. Финал архива ошибочно сообщает, что таблички не записаны: GitHub уже содержит models/signs.mjs, регистрацию sign в models/library.mjs и обновление tools/model-library.test.mjs. Не повторять запись и не просить старое подтверждение. Следующая задача по текущему запросу владельца — проверить качество последнего кодового коммита 4448dca, затем продолжить подключение источников/листов пород и карточек табличек. Прочитанный diff ещё не является завершённым review геометрии, UV или runtime.

В этой передаче тесты, синтаксическая проверка, WebGL, CI и полный аудит не запускались. Остальные подробности OLDCHAT16 ниже — архив/история коммитов, не свежая проверка каждого модуля.

## Приоритеты владельца — актуальные

1. Сначала перенос оставшихся моделей и технической основы: источники, bindings, состояния, карточки, saved IDs и необходимые связи.
2. После сборки согласованного объёма — совместная проверка нового пути, настоящих изображений, WebGL, редактора и экспорта.
3. После успеха — удаление ненужных, дублирующих и заменённых частей.
4. Только после готовности/приёмки новой основы — удаление дорефакторной реализации.

Точечные проверки синтаксиса, diff и изменяемого поведения сопровождают перенос, но расширение CI/тестовой инфраструктуры не должно вытеснять недостающие части приложения. В OLDCHAT16 владелец отменил объединение closed/open eyeblossom: оставить отдельными карточками, задачу объединения не возобновлять.

Работать небольшими самосогласованными пакетами. После записи и проверки самостоятельно переходить к следующей работе без отдельного «давай дальше»; каждая следующая запись всё равно требует нового точного системного подтверждения. Новые постоянные тестовые файлы без отдельного согласования не добавлять. Существующие позже разобрать по необходимости, без массового удаления и обещаний автоматической очистки.

## Записано в OLDCHAT16 — не начинать заново

- df1fcab: экземпляр нового preview с материалами, обновлением текстур и освобождением геометрии/материалов; учёт составных сцен.
- f03acbe: models/textures.mjs и подключение canvas-текстур к lifecycle. Материалы заимствуют текстуры, отдельный слой управляет созданными GPU-текстурами.
- b0e163d: preview.html/preview.mjs, отдельный read-only просмотр среза 17 исходных ID, состояния, вращение, ручной выбор кадров, reuse существующего PNG/TGA loader. Это не весь каталог и не рабочий редактор.
- 860e977: workflow preview-slice для закреплённого входа и 95 сценариев геометрии на Three r128; наличие проверки не доказывает успешный запуск.
- 52cbb88: согласование устаревших ожиданий существующих тестов. Коммит есть в истории, полный diff здесь не проверен.
- e776d96: исправление инициализации userData в CI. Архив сообщает прежний провал обеих задач 860e977; актуальный результат после исправлений не подтверждён. Старые логи-вложения не перенесены.
- e64ef13: timeout изображений 20 секунд, cache 32 записи/16777216 пикселей, retry и защита от позднего ответа — по архиву, не свежий runtime-тест.
- eb98909: полная модель кровати с девятью частями, legacy размеры/UV и регистрация bed.
- ae5cc41: источники 16 цветных кроватей, owned sheets, light_gray→silver, маршрут bed→red_bed без отдельной карточки, reuse цветных icons. Полный compiler/визуальная приёмка не подтверждены.
- 4448dca: кандидат геометрии standing/wall/hanging signs, sign registration, library test ожидает 105 типов. Источник в комментарии — acacia-rs/acacia@750f657, не экспорт геометрии Mojang и не визуальная приёмка. Листы пород и карточки этим пакетом не подключены.

## Сохранённый предыдущий прогресс

OLDCHAT11–14: potted azalea с pot/soil; bamboo/ограды/moss; поршни/redstone/ladder/lectern/lever/shelf; растения, utility/workshop, tracks/metals, hopper/grindstone/frames; cauldron/cocoa/daylight/pots/conduit/fire; dripleaf/sculk/cactus/dripstone/dried ghast/barrel/stage_cross; slime/honey/farmland/snow; indexed cube states, mushrooms, composter/scaffolding/cage. Chorus corruption 5c5f9f4 исправлена 86b6d8f, не текущий блокер. Уже есть cave vines/berries, bulb/ice/anchor, furnace front normalization, dragon egg, bamboo/shoot, torchflower/crop, stem stage 0..7/attached/facing. Возрастная окраска stem открыта.

OLDCHAT15: 0fa7846/593f918 — две отдельные карточки pumpkin/melon с соответствующим плодом и соседним направленным стеблем; варианты тыквы, исходные IDs и owned PNG сохраняются. f0df125 — budding amethyst без нароста либо один выбранной стадии/грани, growth shared; карточки аметистов не объединять. 18d7077 seagrass short/tall; 37d0d48 propagule ground/hanging age 0..4; 3c8062c статический kelp с шестью ресурсами и animation definitions. A–D kelp не стадии роста; точные Bedrock sides/UV/TGA/playback открыты. 5694f16 closed eyeblossom→cross; 5720f66 open eyeblossom/firefly bush→emissive_cross с plant/glow и immutable emissiveRoles. cc5d4e2 — role-based materials, теперь подключение уже записано.

## Контракты и сохранность

Unknown не подменять cube. Aliases, формы, состояния, стадии и кадры различать. Edit PNG не управляет геометрией. Сохранять owned paths, carried/icons, исходные индексы/повторы и saved-ID routes. Dependencies разрешают конкретные shared roles без передачи ownership. Wall coral fans aliases без mounting; candle cakes объединены с cake, обычные свечи отдельны. Waxed/infested требуют эквивалентности; oxidation и normal/deepslate не сливать. Использовать stonecutter_block. Принятую legacy геометрию/UV, включая repeater/comparator, без конкретного дефекта не переделывать.

Glow требует MeshBasicMaterial, остальные обычные объёмные роли — Lambert; sprite unlit. Материалы требуют classified textures с isTexture и boolean userData.semi: semi→transparent/alphaTest 0/depthWrite false, иначе alphaTest .05/depthWrite true. Составные preview должны учитывать ресурсы всех частей, обновления и cleanup ошибок.

## Открытый объём

Bindings/dependencies/icons/carried/saved-ID и обратное открытие стеблей; Bedrock UV potted azalea и reference-моделей; alpha/WebGL гелей; stem tint; kelp; auxiliary end_gateway/lava_cauldron и block↔item icons. Decorated pot без черепков, conduit без active, fire без плеера. Кровати уже имеют отдельное подключение источников; не считать весь bed scope отсутствующим. Таблички требуют источников/листов/карточек и проверки геометрии; наличие entity-листа не означает перенос всех entities. Общий entity source/inventory/geometry/material adapter не завершён. Entities/cushion/bell отложены, scope до переключения согласовать.

Основной legacy ранее проверен на 0.9.1; app.html/index.html здесь заново не прочитаны. Отдельный preview теперь существует в репозитории, но публикация Pages, настоящие PNG/UV/WebGL и приёмка не подтверждены. Сохранить рабочий legacy. Далее общий Find/editor объект, EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги. UX item icon не утверждён. Плеер отдельно от state: timing/order, pause при рисовании, export ленты, demo cycle часов/компаса. Перед удалением legacy принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import limits/dimensions/alpha/cache/URL lifecycle, затем синхронизировать FK_V/cache.

## Доказательства и рабочие правила

Архивные targeted mocks и выбранный вход не равны полному compile/CI/WebGL. Не суммировать перекрывающиеся тестовые прогоны и не выдавать старые результаты за новые. Ожидаемые 105 library types — не число карточек и не успешный запуск. Свежего coverage нет: прежние 1275 записей, 1112 assigned, 39 sign missing builder, 124/78/74 unresolved исторические; после новых моделей требуют пересчёта. Использовать существующие tools/model-coverage.mjs/catalog/audit.mjs, не второй аудит. inputValidation отдельных records не доказывает карточки/preview/render. Команды: node tools/validate.mjs; node --test tools/*.test.mjs. Не перекладывать запуск/отладку на владельца.

Только main; refactor-0.9 слита/удалена, не воссоздавать. Backup по прежней проверке 304bc4a содержит код 6bd8b58, автоматически не обновлять. fk070_packs — пользовательские localStorage паки, backup кода их не содержит; storage ради кэша не очищать. Файлы <25000 UTF-8 байт по ответственности. После каждой записи полный diff/контент, после обрыва сначала GitHub. Вложения и sandbox прошлых ходов не переносятся. Причины сбоев AI неизвестны и не доказывают дефект FoundryKin. Отвечать коротко по-русски.

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Не требовать старые JSON повторно без проверки необходимости и не смешивать выпуски.
