# CONTEXT — вход новому чату

Обновлено 2026-10-31. Репозиторий arseninp/FoundryKin-Beta, ветка main. Проверенный HEAD перед этой документальной записью: 5c5f9f4f449ba0aba3be6847cd09287f0d716130. Это не выпуск приложения. Рефакторинг и блоковый этап НЕ завершены.

## Сначала: блокирующий дефект последнего коммита

В этой передаче прочитан OLDCHAT13 на Диске, все шесть прежних документов, список последних коммитов, полный diff 5c5f9f4, настоящий catalog/rules/dependencies.mjs и tools/model-library.test.mjs. Тесты не запускались; полный аудит репозитория и HTML не выполнялся.

5c5f9f4 нельзя считать законченным пакетом хоруса. В конец catalog/rules/utility-parts.mjs после функции буквально записаны строки `path: catalog/rules/dependencies.mjs`, `content:` и содержимое предполагаемого другого файла. Это посторонний текст в JS-модуле, включая повторный импорт chorusPlantResources; модуль синтаксически повреждён. Настоящий dependencies.mjs остался без chorus_flower/stem. В коммит вошло пять файлов, а не восемь из запроса: назначения, shared, utility-parts, plants и model-library.test. Не вошли dependencies.mjs, tools/model-policy.test.mjs, tools/chorus-models.test.mjs. Утверждение прошлого чата о проверке записи не подтверждает соответствие согласованному пакету.

Первый следующий кодовый пакет: убрать чужой хвост из utility-parts; записать объявление зависимости stem в настоящий dependencies; восстановить согласованные тесты политики и хоруса, предварительно проверив их наличие и текущую версию; проверить синтаксис сохранённых файлов и полную цепочку normalize→attach dependencies→preview→build. Геометрию хоруса и назначения не писать заново вслепую — они уже есть. Документальная запись этот код НЕ исправляет. Не объявлять новый каталог работоспособным до исправления и запуска проверок.

## Правила работы

Начинать с CONTEXT, TODO, ARCHITECTURE и нужных исходников. Архивы читать точечно, кроме прямого запроса владельца. Работать в main; refactor-0.9 слита и удалена, не воссоздавать. Backup по прежней проверке 304bc4a сохраняет код 6bd8b58; автоматически не обновлять. Паки fk070_packs находятся в localStorage; backup кода их не содержит. Не очищать storage ради кэша.

Владелец курирует поведение и внешний вид, не программирует. Краткие ответы по-русски; технические решения и отладку брать на себя, не поручать запуск скриптов владельцу. Готовить средние законченные пакеты geometry/data/bindings/states/tests без микрокоммитов помощников, дублирующих аудитов и гигантских переписываний. Если пакет готов, сразу запрашивать запись, не делать отдельный ход только с сообщением о готовности. Постоянные пересчёты остатка не обязательны: владелец снял это требование ради продуктивности. Не придумывать количество оставшихся моделей.

Каждая внешняя запись требует системного подтверждения точных полных аргументов и содержания. После записи проверять не только список/число файлов, но и полное содержимое или diff против одобренного пакета. Пример 5c5f9f4 показывает, почему недостаточно сказать «пять файлов проверены». После обрыва сначала проверить GitHub, не повторять уже записанное. Файлы менее 25000 UTF-8 байт по ответственности. Документы обновлять по запросу, не после каждого объекта. Sandbox и вложения прошлых ходов автоматически не доступны. Причины обрывов/смены модели Perplexity не установлены.

## Реализованное до OLDCHAT13

Предыдущая документальная точка 3e4a09f описывала код 4c52b9d. В библиотеке уже были potted azalea с pot/soil и potted preview; взрослый bamboo, ограды/калитки, pale moss carpet; поршни/redstone; ladder/lectern/lever/shelf; высокие цветы, path/enchanting table/stonecutter_block/sea pickle; посевы и turtle egg; vines/portals/tripwire; spore blossom/flowerbeds/sunflower/sniffer egg/pitcher/redstone wire; простые растения, tracks/metals, hopper/grindstone/frames.

OLDCHAT12 добавил cauldron/cocoa/daylight, flower pot/decorated pot/conduit/fire, dripleaf/sculk/cactus, pointed dripstone/dried ghast/barrel, stage_cross растения. Есть fence_gate→gate, десять coral_wall_fan aliases к обычным веерам, 17 candle_cake→cake и пять явных technical cube ID. Настенные веера не получают отдельных карточек/моделей/переключателей; обычные свечи самостоятельны. Принятые repeater/comparator перенесены из legacy, не заменены Java-приближением.

Slime и honey_block имеют внутренний объём/оболочку: 10/16 и 14/16 px соответственно. Имена honey_block в назначении и построителе совпадают. Legacy FKView получил обработку промежуточной PNG alpha; это не доказательство визуальной готовности новых гелей. Farmland высотой 15/16 с wet и snow_layer с layers 1..8 уже назначены; верх пашни wet=variants.up[0], dry=variants.up[1]. Не повторять эти подключения.

Coverage расширен inputValidation для нормализации, inventory и dependencies; workflow сохраняет coverage artifact. Это не доказательство успешного CI. Подробные исторические номера коммитов при необходимости доступны в GitHub/архивах; не переносить ошибочные финальные сводки как факты.

## Прогресс OLDCHAT13

Следующие коммиты присутствуют в истории main; детали, кроме отдельно проверенного последнего diff, восстановлены по архиву, не новыми запусками:

- 161d7fe: planar построение без частичной сцены, с очисткой геометрии при ошибках и без преждевременной мутации материалов; регрессионные тесты.
- e045744: crimson_roots/warped_roots→существующий cross; pot PNG сохраняются, выбор PNG не делает растение горшечным.
- 1b2d7eb/481e2e7: ульи и общий выбор индексированных текстур cube. Honey для bee_nest/beehive; crafter idle/triggered/crafting; suspicious sand/gravel brushing 0..3; chiseled bookshelf empty/occupied, не все комбинации книг; creaking heart inactive/dormant/active. Старый отдельный hive handler заменён.
- 3e7f9d8: composter с полым корпусом/внутренним дном и level 0..8; scaffolding с отдельными стойками, открытым каркасом и нижним настилом/обвязкой по bottom. Назначения, роли, регистрация и тесты. Java-reference geometry с Bedrock materials, не новые PNG и не обычный куб.
- c5f81c9: обратная грань выдвинутой головки поршня; head_back через объявленную зависимость textures/blocks/piston_top_normal. У липкого зелёная поверхность остаётся спереди; чужая PNG не добавляется в его owned edit slots. Это исправление обоих поршней, не открытая задача на реализацию.
- 711bfa2: red mushroom назначен существующему cube; brown/red mushroom block и mushroom_stem используют единый variant 0..15 с сохранением повторов. Defaults: шляпки 14, ножка 10. Общая геометрия/UV cube не менялись. Реализация выбора записана; полный вход/визуальная приёмка остаются открыты.
- 48a165f: mob_spawner/trial_spawner/vault→общий cage, наружные и внутренние грани, приподнятое внутреннее дно vault; 12/8 вариантов trial/vault. Без существ и предметов внутри — это entities.
- 5c5f9f4: геометрия chorus plant с шестью соединениями и chorus flower live/dead записана, но пакет повреждён и неполон, см. начало. Базовый детерминированный noside; случайные noside1..3 не добавлены. Ожидание 95 типов в библиотечном тесте записано, но не является успешным запуском реестра.

## Проверки и остаток

В OLDCHAT13 заявлены целевые тесты: 12 lowered/gel; 12 planar; 6 cross family; 13 cube preview; 7 structures; 6 mushrooms; 9 cage. После исправления поршней отдельно заявлен прогон 26 сохранённых тестов: redstone 13, structures 7, preview-parts 6. Это исторические сообщения с mock Three, не новые результаты этой передачи. Заявленные девять тестов хоруса были проверками подготовленного кода; они не доказывают корректность повреждённого сохранённого пакета. В этой передаче тесты НЕ запускались.

Исторический отчёт OLDCHAT12: 1275 исходных записей, 1112 assigned, 39 sign без построителя, 124 unresolved, 0 invalid. Далее заявлено 78 unresolved после 4c52b9d; в OLDCHAT13 промежуточно вычислено 74 после четырёх назначений. Это устаревшие основания, не текущий полный coverage и не количество новых моделей/карточек. После последующих пакетов свежий полный остаток не установлен. Не выдавать арифметику за результат прогона и не вычислять процент готовности.

Полные validate/tests/inputValidation/compileModelCatalog, зелёный CI, настоящие Three/WebGL, Android и экспорт остаются неподтверждёнными. inputValidation проверяет назначенные записи по отдельности, не объединения карточек, icons, preview или render. Использовать существующий tools/model-coverage.mjs, не создавать второй аудит.

## Дальнейший порядок и ограничения

Сначала исправить повреждение хоруса и проверить сохранённый пакет. Затем получить актуальные ошибки полного PIN-входа и выбрать следующий связный модельный пакет: unresolved, missing builders, normalization, resources/dependencies и rendering — разные категории. Не объявлять модели завершёнными и не переходить незаметно к UI.

Открыты bamboo_sapling/adult forms, crop/adult torchflower relationship, Bedrock PNG/UV potted azalea, alpha/WebGL гелей, общие зависимости, aliases/forms/states/icons/carried и saved-ID routes, lit blast furnace front, auxiliary end_gateway/lava_cauldron и block↔item icons. Decorated pot без черепковых узоров, conduit без активированной формы, fire без плеера. Unknown не подменять cube; obsolete stonecutter не возвращать, нужен stonecutter_block. Normal/deepslate руды не объединять; oxidation сохранить; waxed/infested aliases только по эквивалентности.

Entities/cushion и bell отложены; sign/bed и прочие block entities требуют общего проверяемого source/inventory/geometry/material adapter. 39 sign — исторические исходные записи, не 39 построителей. Перед переключением явно согласовать scope; не выдавать ограниченный срез за полный каталог.

По прежним документам рабочие app.html/index.html остаются на legacy 0.9.1; новый catalog/models и переключатели не подключены. Отдельная проверяемая страница не подтверждена созданной. HTML в этой передаче не перечитан. До приёмки legacy сохранить. Далее loaders/materials, общий объект Find/editor, state/forms/stages, Shared textures, role-based icon badges, EN/RU, растущие подписи, design tokens без редизайна бумаги. Плеер отдельно от state, timing и пауза при рисовании, экспорт всей ленты; часы/компас — demo cycle. UX поиска item icon ещё не утверждён.

Перед переключением проверить draw/undo/redo/Add/reopen/PNG/mcpack, Android, async targets/storage/URL lifecycle; затем синхронизировать FK_V/cache versions и удалить заменённый legacy. PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Старые JSON повторно не требовать без проверки необходимости и не смешивать версии.
