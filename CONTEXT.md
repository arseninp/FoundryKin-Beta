# CONTEXT — вход новому чату

Обновлено 2026-11-05 по полностью прочитанному OLDCHAT22 на Диске и GitHub. Репозиторий arseninp/FoundryKin-Beta, только main. Проверенный HEAD перед этой документацией: 60ec0ad78b28e17a5087a4849f1cb972e35752c0. Это не выпуск: модельный этап/рефакторинг и визуальная приёмка не завершены, основной редактор не переключён.

## Порядок чтения и точка продолжения

CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Предыдущая документальная точка 1043175 частично синхронизировала лишь CONTEXT/handoff/TODO; оставшиеся документы ещё описывали 44 ID. История подробных решений: 3fe2d82, d41f384/40c82f0/aae3661. Теперь последний прочитанный архив — OLDCHAT22.

Следующий согласованный модельный участок — bubble_column: проверить исходные записи/ресурсы и корректное представление; не подставлять куб ради compile. Это известный оставшийся кандидат, НЕ доказательство, что во всём каталоге остался ровно один ID. Свежий полный отчёт existing coverage/inputValidation/full PIN compile пока не получен. Продолжать конкретные модели, не дробление файлов и не новую инфраструктуру аудита. Bell/player_head/shulkers повторно не реализовывать.

Последняя реплика ассистента OLDCHAT22 ошибочно утверждает, что player_head не сохранён. GitHub это опровергает: 1df7ce9 содержит геометрию/источники/маршрут, 60ec0ad — preview и тестовые ожидания. Не повторять запись старого пакета и не откатывать готовую голову. bubble_column в проверенной последующей истории не реализован. После неоднозначного сбоя всегда сначала проверять GitHub.

## Текущий записанный статус

- Жидкости: df3d6b1/b165cfc/311cdb4 — 4 water/flowing_water/lava/flowing_lava ID, level 0..7/default 0, общий picker/PNG/EN-RU/checks.
- Сундуки: ef08f4f/759666f/17fe666 — 11 исходных ID, sheet/double_sheet независимо от PNG, open/double; ender без double. Waxed source ID открывает canonical ordinary object при сохранении исходных records/resources.
- 4d99f7b/c2b7384/6ccafe6 полностью убрали whole-block facing сундуков/шалкеров из builders/resolver/controls/test loops/labels. Крышки/UV/размеры сохранены. 44f7d6e facing-контракт отменён.
- e4db3d6/196fc69: 17 шалкеров (undyed + 16 цветов) включены в preview/common picker, open/независимая PNG/EN-RU, без facing. light_gray использует silver sheet, фиктивной silver card нет. e255fc2 записал source/geometry fixture и pinned integration в existing model-library.test.mjs.
- f77e3c5: исправлены старые model-policy ожидания для 24 copper source IDs, 3 обычных chest IDs и unknown; production rules не менялись.
- 2f6c30e: parseLooseJson сохраняет ,} и ,] внутри строк; комментарии разделяют токены пробелом; добавлены регрессии в existing catalog-audit.test.mjs.
- b2c6eb2: activePack/imageFrames/frameCanvas/createImageSource перенесены в preview-images.mjs, прежние экспорты preview.mjs сохранены. afd199b: REVIEW_IDS/SHULKER_BOXES/EN-RU-конфигурация перенесены в preview-config.mjs; REVIEW_IDS реэкспортируется из preview.mjs. Не искать актуальный список только в старом месте.
- 9cf2a6f/d2333b3/2fe3362: bell перенесён из legacy, назначен и подключён к preview. Пять частей статичного колокола на стойках, собственный sheet и owned beam/posts, независимая PNG. Другие крепления и звон не реализованы.
- 1df7ce9/60ec0ad: player_head → card player → form head, skull builder с головой и внешним слоем 0.5 px, полный textures/entity/steve sheet без обрезки, независимая PNG/EN-RU. Полного тела/редактора скинов нет.

REVIEW_IDS = 63 SOURCE BLOCK IDs: прежние 29 + 4 liquids + 11 chests + 17 shulkers + bell + player_head. Это не число карточек, builders и не весь каталог. Ожидание библиотеки теперь 113 builders, не 113 принятых объектов.

## Решения владельца

В будущем реализовать полноценный редактор скинов в карточке Игрок; позднее можно добавить тело для примерки брони. Это отложенный план, не готовая функция и не обещание лёгкой реализации. Сохранить голову/hat UV/полный skin sheet/source routes. Пока показывать только доступную форму head без фиктивного тела. При появлении полной модели отделить описание общей детали от размещения блоковой головы/узла head на теле; второй потребитель пока не реализован.

Владелец решает, когда обновлять документы. Этот запрос разрешает подготовить именно документальный пакет; далее не переключаться с кода на документацию самовольно. Вращение всей модели уже жестом: chest open/double, shulker open; относительное движение крышки сохранить. Stem direction/amethyst growth face/UV стороны — другие контракты, их не удалять массово. Макет tablet/desktop отложен на другой чат, mobile/paper tokens сохранять.

## Сохранённая основа

Eyeblossom одна closed/open card с cross/emissive_cross/обеими records/routes/glow. Parent cards/familyDefaults используют реальные records; form/slot/state/PNG независимы. Default sheet голов/статуй — bindings.sheet. Общие FKModelState/FKM/CSS/preview-controls, без второго меню. Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon и статуи 4 окислений/4 поз уже есть; полные мобы отложены, недоступный Mob не выдавать готовым. Dragon 256x256/head+jaw/mirror UV/static closed jaw без тела; placement/scale/UV не приняты. Статуе не добавлять глаза/цветок автоматически, 4 golem ID среза невощёные.

Pot 23 patterns+ordinary/4 независимые стороны; conduit 6 resources/default inactive/static active reference/eye-wind picker без плеера и слежения; liquids uniform-height sample (8-level)/9, не flow simulator/tint/timing. Shulker base/lid/default closed/static open — не плеер. Bed/sign/cauldron/auxiliary/banner/fruit-stem/budding amethyst/aquatic/propagule/kelp/materials/lifecycle не делать заново. Остальные контракты — ARCHITECTURE.

## Доказательства и сохранность

OLDCHAT22 сообщает локальные targeted проверки: 272 изолированных state/PNG с compiler stub; shulker fixture на Three-mock для 17 цветов с 3 намеренными ошибками; model-policy 9/9; загрузчик 6/6; image helpers 14 checks; config extraction 8 checks с compiler/resolver stubs; bell geometry/connection checks; player head 12 mock/metadata checks. Это исторические сообщения, не новый запуск здесь. Не суммировать их и не выдавать за full PIN compile/CI/реальные PNG-TGA/WebGL/Android/export. Pinned интеграционные тесты шалкеров/колокола/головы записаны, успешное выполнение не подтверждено. В этом проходе прочитаны архив и 7 документов, сверены история и сохранённые diff bell/player; тесты проекта не запускались.

Только main; backup/refactor-0.9 не обновлять/не воссоздавать автоматически. fk070_packs — пользовательские localStorage паки, backup кода их не сохраняет; storage ради кэша не очищать. Каждая запись — точное подтверждение и полный saved diff/content. Малые самосогласованные пакеты, файлы <25000 UTF-8 байт по ответственности; новые permanent test files отдельно согласовать, существующие не удалять массово. Коротко по-русски, отладку на владельца не перекладывать.

Без второго каталога/меню/monkey patches/адаптеров вокруг адаптеров. Unknown не cube; aliases требуют эквивалентности, не общей PNG; oxidation/normal/deepslate раздельны. Сохранять source-ID reopen/owned/carried/icons/indexed repeats/shared dependencies без ownership transfer, dimensions/alpha/atlases/frame strips. Sprite/glow Basic-unlit, обычные Lambert; materials заимствуют textures, texture layer владеет GPU textures; composite cleanup/update всех частей/ошибок. EN/RU, IDs без перевода. Принятую legacy geometry/UV, особенно repeater/comparator, без дефекта не менять.

Перенос → совместная приёмка → чистка → runtime switch/удаление заменённого legacy после готовности draw/undo/redo/Add/reopen/PNG/mcpack/Android/async/storage/import/lifecycle/language-theme-pack-slot-frame; лишь затем FK_V/cache. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d, выпуски не смешивать. OLDCHAT19 final assistant reply исключён владельцем; OLDCHAT17 async PNG index/storage divergence/atlas heuristic/full GPU update — гипотезы для воспроизведения, не доказанные блокеры. Ceiling-sign rotation suspicion снято. Сбои AI/коннектора не доказывают дефект приложения.
