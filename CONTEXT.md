# CONTEXT — вход новому чату

Обновлено 2026-11-02. Репозиторий arseninp/FoundryKin-Beta, ветка main. Проверенный кодовый HEAD перед документальной записью: cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. Это не выпуск приложения. Рефакторинг и блоковый этап НЕ завершены.

## Точка остановки: материалы нового предпросмотра

Последний OLDCHAT15 на Диске прочитан целиком, затем все шесть документов начиная с CONTEXT. Сверены последние 12 коммитов; прочитаны текущие catalog/preview.mjs, catalog/rules/forms.mjs, models/materials.mjs и полный пятифайловый diff 5720f66. Остальные подробности OLDCHAT15 ниже основаны на архиве и истории, не на новом исполнении каждого пакета. Тесты, HTML, WebGL и полный аудит в этой передаче не выполнялись.

Последний кодовый коммит — cc5d4e2: добавлен models/materials.mjs. Модуль существует, но в прочитанном catalog/preview.mjs НЕ импортирован и НЕ подключён. Отклонённый после него запрос подключения из конца OLDCHAT15 не записан: история main заканчивается cc5d4e2. Не просить владельца пересылать старый запрос, не повторять уже записанный модуль и не трактовать отказ как поломку 3D-модели. Обрывы/смена AI-модели в чате не являются доказанными дефектами FoundryKin.

Следующие согласованные небольшие пакеты:
1. Изучить нужную цепочку загрузки/построения и заново подготовить подключение createModelMaterials к новому предпросмотру: обычный материал растения и unlit glow, обновление текстур, корректное освобождение материалов и геометрии, cleanup ошибок. Учесть составные плод+стебель и budding amethyst; не придумывать второй конкурирующий путь. Старый редактор пока не переключать.
2. Проверить сохранённое подключение и затем отдельно объединить открытый и закрытый глазоцвет в одну карточку с явным выбором «Закрытый / Открытый». Сохранить оба исходных ID, все собственные ресурсы, saved-ID routes и glow открытой формы. Выбор редактируемой PNG не переключает форму. Это согласовано, но ещё не записано.
3. Проверить совместную цепочку и продолжить оставшийся модельный scope по реальным данным. Не выдавать backend за подключённое меню или визуально принятую модель.

## Новые указания владельца

Работать небольшими самосогласованными частями из-за обрывов запросов, без повторных записей. Перед каждой записью точное системное подтверждение, после — проверка полного сохранённого содержания/diff. Ответы коротко по-русски: что записано, проверено и осталось. Причины обрывов не установлены.

Новые постоянные тестовые файлы без отдельного согласования НЕ добавлять. В OLDCHAT15 отклонён предложенный интеграционный тест плодов: локальные проверки можно выполнять без сохранения в репозитории. Существующие тесты этим решением не удалены; владелец попросил позже отдельно проверить их состав и необходимость. Не удалять их массово и не считать, что тесты автоматически исчезнут в конце рефакторинга. Разрешённые обновления существующего library test не являются новыми тестовыми файлами.

## Прогресс OLDCHAT15 — не повторять

- 0fa7846: компонент совместного просмотра плода со стеблем и его тесты. 593f918: связи pumpkin→pumpkin_stem и melon_block→melon_stem, явное состояние stem в новом preview. Тыква и арбуз — две разные карточки; «Без стебля» показывает плод, «Со стеблем» — плод и соседний направленный к нему стебель вместе. Варианты тыквы, исходные записи и owned PNG сохраняются, это не aliases стеблей. Текущий forms прочитан: кроме bamboo/shoot и torchflower/crop в нём уже есть обе связи плодов.
- f0df125: budding_amethyst без нароста либо с одним наростом стадии small/medium/large/cluster на одной из шести граней. Карточки аметистов не объединять и не удалять. Ресурс нароста declared shared, не owned PNG блока. Preview действительно импортирует обе обёртки выбора — fruit stem и budding amethyst.
- 18d7077: seagrass, короткая/высокая формы и согласованные нижняя/верхняя A/B, явное состояние отдельно от edit PNG.
- 37d0d48: mangrove_propagule, наземная/висячая форма и age 0..4, роли/назначение/регистрация. Java-reference с Bedrock materials; PNG/UV/WebGL ещё не приняты.
- 3c8062c: kelp как статический кандидат: нижний участок и верхушка, шесть исходных путей отдельно, анимационные определения сохранены. Не возвращать неверную идею «A–D — стадии роста» или произвольный bulb-переключатель. Точную Bedrock раскладку сторон/UV, TGA и анимацию проверить отдельно; плеер не подключён. Технический разбор брать на себя, не просить владельца разбираться с TGA.
- 5694f16: closed_eyeblossom→существующий cross.
- 5720f66: open_eyeblossom/firefly_bush→emissive_cross. Роли plant/glow сохраняют оба ресурса. Registry хранит immutable emissiveRoles:['glow']; builder требует MeshBasicMaterial для glow, иначе явно ошибается. Подготовка второго слоя не должна оставлять частичную сцену при проверяемой ошибке. Полный diff здесь прочитан. Library test теперь ожидает 103 типа, не 99; это не результат запуска и не число карточек.
- cc5d4e2: createModelMaterials(Three,descriptor,bindings,textures) создаёт собственные материалы по разрешённым ролям и заимствует текстуры. Sprite/glow используют MeshBasicMaterial, остальное MeshLambertMaterial. Требует texture.isTexture и boolean userData.semi; alpha policy: semi→transparent/alphaTest 0/depthWrite false, иначе alphaTest .05/depthWrite true. Возвращает mats/update/dispose, не клонирует и не освобождает текстуры. Пока отдельный модуль, не законченная интеграция.

## Ранее записанный прогресс

OLDCHAT11–13: potted azalea с pot/soil, adult bamboo/ограды/калитки, pale moss carpet; поршни/redstone, ladder/lectern/lever/shelf; высокие цветы, path/enchanting table/stonecutter_block/sea pickle, crops/turtle egg, vines/portals/tripwire, spore blossom/flowerbeds/sunflower/sniffer egg/pitcher/redstone wire, tracks/metals, hopper/grindstone/frames. Затем cauldron/cocoa/daylight, pots/conduit/fire, dripleaf/sculk/cactus, dripstone/dried ghast/barrel/stage_cross. Принятые repeater/comparator сохраняют legacy geometry/UV.

Slime/honey имеют ядро 10/16 и 14/16 при оболочке 16 px; legacy alpha policy отдельно от геометрии. Farmland высотой 15/16 с wet=up[0], dry=up[1]; snow_layer layers 1..8. Уже есть planar cleanup, nether roots→cross, индексированные cube states hives/crafter/suspicious/bookshelf/heart/mushrooms с повторами; composter level 0..8, scaffolding bottom, piston head_back через shared normal top и cage spawners/vault без внутренних entities.

OLDCHAT14: 86b6d8f исправил ошибочно вклеенный dependencies в utility-parts из 5c5f9f4, восстановил chorus_flower/stem и тесты — это НЕ текущий блокер. Далее e537ecc cave vines с berries; 71d4501 copper bulbs/frosted ice/respawn anchor; c6a70d5 ограниченная нормализация front lit furnace/blast furnace/smoker; aab86e1 dragon egg; 6aa8a0f bamboo/shoot; b9df7be torchflower/crop; 62c8af1 общий stem stage 0..7/attached/facing и stem/upperstem. Возрастная окраска stem ещё не сделана. Не повторять эти назначения как отсутствующие.

Wall coral fans остаются aliases без отдельных карточек/mounting. Candle cakes объединены с cake с сохранением ресурсов; обычные свечи самостоятельны. Waxed/infested требуют эквивалентности; oxidation сохранять, normal/deepslate не сливать. Unknown не подменять cube, obsolete stonecutter не возвращать. Формы, aliases, состояния, стадии и кадры — разные понятия.

## Проверки: не смешивать уровни доказательств

В этой передаче тесты не запускались. OLDCHAT15 сообщает до записей локальные проверки: композиция плодов 8, связь preview 16, затем 7 интеграционных без записи нового теста; amethyst 8, seagrass 6, propagule 8, kelp 6, closed eyeblossom 4, emissive plants 8 и повторный точечный прогон после записи, materials 10. Заявлена проверка синтаксиса. Это архивные результаты на заглушках/выбранных данных; журналы и среда не перенесены. Не суммировать перекрывающиеся прогоны, не выдавать их за свежие проверки или WebGL.

Предыдущие целевые тесты OLDCHAT13/14 остаются историческими, включая 11 интеграционных сценариев с recording registry, не настоящими builders/WebGL и не полным PIN candidate. Полные validate/tests/inputValidation/compileModelCatalog, зелёный CI, реальные Three/WebGL, Android и экспорт не подтверждены. Команды: node tools/validate.mjs; node --test tools/*.test.mjs. Запуск владельцу не поручать; доступные средства проверять, ограничения сообщать честно.

Исторический coverage: 1275 записей, 1112 assigned, 39 sign без builder, 124 unresolved/0 invalid, затем 78 и 74 unresolved в старых чатах. Свежего остатка нет. Использовать существующий tools/model-coverage.mjs, не второй аудит. Разделять unresolved/missing builders/normalization/inventory/dependencies/rendering. inputValidation проверяет отдельные assigned records, не карточки/icons/preview/render; artifact workflow не доказывает успешный CI.

## Оставшаяся интеграция и сохранность

Работать только в main; refactor-0.9 слита/удалена, не воссоздавать. Backup по прежней проверке 304bc4a содержит код 6bd8b58, автоматически не обновлять. fk070_packs в localStorage — пользовательские паки; backup кода их не содержит, storage ради кэша не очищать. Файлы менее 25000 UTF-8 байт по ответственности. Документы обновлять по запросу. Вложения/sandbox прошлых ходов автоматически не доступны.

Открыты bindings/dependencies/icons/carried/saved-ID, Bedrock PNG/UV potted azalea и Java-reference моделей, alpha/WebGL гелей, stem tint; auxiliary end_gateway/lava_cauldron и block↔item icons. Decorated pot без черепков, conduit без активированной формы, fire без плеера. Sign/bed и другие block entities требуют общего source/inventory/geometry/material adapter; путь в inventory не создаёт карточку. Entities/cushion/bell отложены; scope согласовать до переключения.

По прежней проверке app.html/index.html на legacy 0.9.1; HTML здесь не перечитан. Новый catalog/models и его видимые меню не приняты в основном UI, отдельная проверяемая страница не подтверждена. Сохранить legacy до приёмки. Далее реальный loader/materials, общий объект Find/editor, явные forms/states/stages, Shared textures, role-based icon badges, EN/RU, растущие подписи/design tokens без редизайна бумаги. UX поиска item icon не утверждён.

Плеер отдельно от state: timing/order, пауза при рисовании, экспорт всей ленты, часы/компас demo cycle. До переключения принять draw/undo/redo/Add/reopen/PNG/mcpack, Android, async targets/transactions/import limits/dimensions/alpha/cache/URL lifecycle. Затем синхронизировать FK_V/cache и удалить заменённый legacy, не оставлять конкурирующие runtime.

PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Не требовать старые JSON повторно без проверки необходимости и не смешивать выпуски.
