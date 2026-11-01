# CONTEXT — вход новому чату

Обновлено 2026-11-01. Репозиторий arseninp/FoundryKin-Beta, ветка main. Проверенный HEAD перед документальной записью: 62c8af15ec1fb4d9c4cc1c96caec9e349141df6a. Это не выпуск приложения. Рефакторинг и блоковый этап НЕ завершены.

## Точка остановки и следующий шаг

Прочитан целиком последний архив OLDCHAT14 на Диске, затем все шесть документов начиная с CONTEXT. Проверены последние десять коммитов, полные diff 86b6d8f и 62c8af1, текущий catalog/rules/forms.mjs. Тесты в этой передаче не запускались; HTML и весь код повторно не проверялись. Детали промежуточных пакетов ниже, кроме этих проверенных diff и forms, восстановлены по архиву и истории, не новым исполнением.

Реальный последний кодовый коммит — 62c8af1 со стеблями. Финальное сообщение OLDCHAT14 ошибочно называет последней записью связь факельника b9df7be. Не переносить эту сводку как факт и не повторять уже записанный stem.

Следующая согласованная задача: в НОВОМ catalog/models объединить тыкву с её стеблем в одну карточку, арбуз с его стеблем — в другую; дать явный вариант просмотра «Без стебля / Со стеблем». Во втором варианте плод остаётся видимым, рядом появляется направленный к нему стебель. Это НЕ просто переключение «отдельный плод / отдельный стебель» и НЕ объединение тыквы с арбузом. Сохранить исходные ID, owned PNG, параметры stage/attached/facing и существующие состояния тыквы. Выбор редактируемой PNG не переключает просмотр.

Эта функция пока НЕ записана. forms.mjs содержит только bamboo→shoot:bamboo_sapling и torchflower→crop:torchflower_crop. В OLDCHAT14 заявлен локальный компонент совместного просмотра и семь тестов, но его код/приложения здесь не получены и не проверены. Не называть его доступным или готовым в репозитории. Проверить имеющийся код, при необходимости восстановить компонент.

Владелец попросил разделить работу, чтобы не перегружать запрос: 1) компонент совместного просмотра с тестами; 2) связь карточек/явного состояния и маршрутов; 3) интеграционные проверки открытия исходных ID. Каждый записываемый шаг должен быть самосогласованным; отдельный компонент не выдавать за законченную пользовательскую функцию. Legacy редактор ради этой задачи не менять. Не задавать повторно уже решённый вопрос о желаемом просмотре.

## Правила работы

Начинать с CONTEXT, TODO, ARCHITECTURE и нужных исходников. Архивы читать точечно, кроме прямого запроса владельца. Работать в main; refactor-0.9 слита и удалена, не воссоздавать. Backup по прежней проверке 304bc4a сохраняет код 6bd8b58; автоматически не обновлять. Паки fk070_packs находятся в localStorage; backup кода их не содержит. Не очищать storage ради кэша.

Владелец курирует поведение и внешний вид, не программирует. Краткие ответы по-русски; технические решения и отладку брать на себя, не поручать запуск скриптов владельцу. Обычно готовить средние законченные пакеты geometry/data/bindings/states/tests; для текущей задачи явно согласовано разбиение выше. Без микрокоммитов помощников, дублирующих аудитов и гигантских переписываний. Готовый пакет сразу подавать на системное подтверждение. Постоянный пересчёт остатка не обязателен; числа не придумывать.

Каждая внешняя запись требует системного подтверждения точных полных аргументов/содержания. После записи сверять полное содержимое или diff с одобренным пакетом, а не только число файлов. После обрыва сначала проверить GitHub. Файлы менее 25000 UTF-8 байт по ответственности. Документы обновлять по запросу. Sandbox, файлы и вложения прошлых ходов автоматически не доступны. Причины обрывов/смены модели Perplexity не установлены.

## Прогресс до OLDCHAT14

Предыдущие документы описывали код 5c5f9f4 и OLDCHAT13. Уже реализованы potted azalea с pot/soil и potted preview; adult bamboo/ограды/калитки, pale moss carpet; поршни/redstone; ladder/lectern/lever/shelf; высокие цветы, path/enchanting table/stonecutter_block/sea pickle; посевы/turtle egg; vines/portals/tripwire; spore blossom/flowerbeds/sunflower/sniffer egg/pitcher/redstone wire; простые растения, tracks/metals, hopper/grindstone/frames.

OLDCHAT12: cauldron/cocoa/daylight, flower pot/decorated pot/conduit/fire, dripleaf/sculk/cactus, pointed dripstone/dried ghast/barrel, stage_cross растения. Fence_gate→gate, десять coral_wall_fan aliases без отдельных карточек/креплений, 17 candle_cake→cake с сохранением ресурсов; обычные свечи самостоятельны. Пять явных technical cube ID. Принятые repeater/comparator перенесены из legacy, не заменены Java-приближением.

Slime/honey_block: внутренний объём 10/16 и 14/16 px при оболочке 16 px; honey_block IDs совпадают. Legacy FKView получил промежуточную PNG alpha, но визуальная готовность новых гелей не доказана. Farmland высотой 15/16 с wet, snow_layer с layers 1..8 уже назначены. Wet=variants.up[0], dry=variants.up[1]. Coverage расширен inputValidation; workflow сохраняет artifact, что не доказывает успешный CI.

OLDCHAT13, наличие пакетов восстановлено по прежней передаче/истории, не новыми запусками:
- 161d7fe: planar cleanup без частичной сцены и преждевременной мутации материалов.
- e045744: crimson_roots/warped_roots→cross; pot PNG сохраняются, выбор PNG не делает растение горшечным.
- 1b2d7eb/481e2e7: общий индексированный cube preview вместо отдельного hive handler. Honey ульев; crafter idle/triggered/crafting; suspicious sand/gravel brushing 0..3; bookshelf empty/occupied, не все комбинации книг; creaking heart inactive/dormant/active.
- 3e7f9d8: полый composter level 0..8; scaffolding с открытым каркасом и bottom. Java-reference geometry с Bedrock materials.
- c5f81c9: head_back обоих поршней через dependency piston_top_normal; зелёная sticky front сохраняется, чужая PNG не становится owned edit slot.
- 711bfa2: red mushroom→cube; mushroom blocks/stem variant 0..15 с повторами, defaults 14/10. Общая cube geometry/UV не менялась.
- 48a165f: cage для mob/trial spawner/vault, внутренние поверхности/дно vault, 12/8 вариантов trial/vault, без существ/предметов внутри.
- 5c5f9f4: chorus geometry/assignments записаны, но dependencies ошибочно вклеен в utility-parts, часть тестов отсутствовала. Это исторический дефект, исправленный ниже, не текущий P0.

## Прогресс OLDCHAT14

- 86b6d8f: удалён чужой хвост utility-parts; в настоящий dependencies добавлен chorus_flower/stem; добавлен chorus-models.test и исправлено ожидание политики. Полный diff четырёх файлов проверен в этой передаче. Chorus plant имеет шесть connections и базовый noside без случайных noside1..3; flower live/dead использует shared stem без передачи ownership.
- e537ecc: cave_vines — тело над концом; body/head_with_berries — одноблочные части. Явный berries независим от edit PNG, назначения/роли/регистрация/тесты.
- 71d4501: индексированный preview для четырёх режимов copper bulbs, включая waxed/oxidation; frosted_ice 0..3; respawn_anchor 0..4 с синхронным выбором граней и сохранением повторов.
- c6a70d5: нормализация front у lit furnace/blast_furnace/smoker к стороне обычного состояния. Правило ограничено известными ID/раскладкой, пользовательские/правильные раскладки не переставляет.
- aab86e1: dragon_egg, шесть элементов/33 грани, назначение/регистрация в specials и тесты. Java reference с Bedrock material, не визуальная приёмка.
- 6aa8a0f: bamboo и bamboo_sapling связаны формами одной карточки, shoot сохраняет source ID/model/PNG; не alias взрослого.
- b9df7be: torchflower и torchflower_crop связаны через crop с двумя собственными стадиями; правило применяется при наличии обоих ID.
- 62c8af1: pumpkin_stem/melon_stem→общий stem; стадии 0..7, attached и четыре facing; собственные роли stem/upperstem, регистрация и тесты. Полный diff семи файлов проверен здесь. Библиотечный тест теперь ожидает 99 типов, это НЕ результат запуска и не число карточек/принятых объектов. Игровое окрашивание по возрасту и UI не добавлены. Плоды со стеблями пока не связаны карточками.

## Проверки и границы доказательств

В этой передаче тестов не было. OLDCHAT14 сообщает целевые прогоны до записей: chorus 12, cave vines 8, cube preview 9, furnace normalization/state groups 7, specials 9; bamboo 12 (5 новых и 7 интеграционных), torchflower 6 чистых правил. Для stem сначала заявлялось восемь проверок черновика; перед фактической записью — пять сохранённых геометрических тестов с mock Three. Не суммировать это как один полный прогон и не утверждать запуск всех семи файлов stem-пакета.

Между dragon egg и bamboo в архиве заявлено 11 интеграционных проверок: семь существующих catalog-state-integration и четыре дополнительных сценария chorus/cave vines/egg, bulbs/anchor и печей. Использовались реальные модули компилятора/preview на выбранных входных структурах и фикстурах; registry только фиксировал вызовы. Это не построение реальной геометрии, не полный PIN candidate, не строгий compileModelCatalog/CI/WebGL. Дополнительный журнал в этой передаче не получен. Исторические тесты OLDCHAT13 остаются в архиве; они не заменяют текущий запуск.

Исторический coverage: 1275 записей, 1112 assigned, 39 sign без построителя, 124 unresolved, 0 invalid; затем 78 unresolved в OLDCHAT12 и промежуточные 74 в OLDCHAT13. Свежего полного остатка нет. Не считать проценты и не выдавать арифметику за запуск. Использовать существующий tools/model-coverage.mjs; inputValidation проверяет назначенные записи по отдельности, не карточки/icons/preview/render.

Полные validate/tests/inputValidation/compileModelCatalog, зелёный CI, настоящие Three/WebGL, Android и экспорт не подтверждены. Команды: node tools/validate.mjs; node --test tools/*.test.mjs. Не поручать запуск владельцу и не заявлять невозможность без проверки доступных средств.

## Оставшаяся интеграция и сохранность

После текущего плод+стебель продолжить фактические ошибки PIN-входа: unresolved, missing builders, normalization, dependencies и rendering — разные категории. Не повторять исправление хоруса, связи bamboo/torchflower или front печей как отсутствующую реализацию; полный вход и визуальная приёмка этих функций ещё открыты.

Открыты Bedrock PNG/UV potted azalea, alpha/WebGL гелей, resource bindings/dependencies, aliases/forms/states/icons/carried и saved-ID routes, auxiliary end_gateway/lava_cauldron, block↔item icons. Decorated pot без черепков, conduit без активированной формы, fire без плеера. Unknown не подменять cube; stonecutter_block вместо obsolete stonecutter. Normal/deepslate не объединять; oxidation сохранять; waxed/infested aliases только по эквивалентности.

Entities/cushion/bell отложены. Sign/bed и прочие block entities требуют общего source/inventory/geometry/material adapter. 39 sign — исторические исходные записи, не 39 построителей. До переключения явно согласовать scope, не выдавать срез за полный каталог.

По прежней проверке app.html/index.html остаются на legacy 0.9.1; новые catalog/models и переключатели не подключены. HTML здесь не перечитан. Отдельная проверяемая страница не подтверждена. До приёмки legacy сохранить. Далее loaders/materials, общий объект Find/editor, state/forms/stages, Shared textures, role-based icon badges, EN/RU, растущие подписи и design tokens без редизайна бумаги. Плеер отдельно от state, timing и пауза при рисовании, экспорт всей ленты; часы/компас demo cycle. UX поиска item icon не утверждён.

Перед переключением принять draw/undo/redo/Add/reopen/PNG/mcpack, Android, async targets/storage/URL lifecycle, затем синхронизировать FK_V/cache и удалить заменённый legacy. PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Старые JSON не требовать повторно без проверки необходимости и не смешивать выпуски.
