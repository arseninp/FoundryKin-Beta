# CONTEXT — вход новому чату

Обновлено 2026-11-04 по текущему разговору и GitHub. arseninp/FoundryKin-Beta, только main. Проверенный HEAD перед документацией: 6ccafe6d7b9e8d277fd513e70bca3a8d5d1b5105. Завершена конкретная чистка лишних направлений сундуков/шалкеров, НЕ весь рефакторинг и НЕ приёмка приложения. Основной редактор не переключён.

## Читать и продолжать отсюда

CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Предыдущие подробные документы: 3fe2d82d7a7c5a76ddf9f60db861f880bf6ec2d9; история до него — d41f384/40c82f0/aae3661. OLDCHAT20 — последний прочитанный архив Диска; продолжение этого разговора не выдавать за новый архивный файл.

Следующий кодовый участок при продолжении — подключить уже существующие шалкеровые ящики к отдельному preview: только открытие/закрытие и независимая PNG, цвета раздельно, без facing/выбора положения всего блока. Геометрию и источники заново не переносить. Владелец сначала попросил обновить документы; новый кодовый пакет этим обновлением не записывается.

## Обязательное уточнение владельца

Модель уже вращается жестом. Не переносить в меню каждый параметр builder и не предлагать снова поворот всего сундука/шалкера на бок. Владелец неоднократно потребовал удалить лишнее полностью, а не только скрыть кнопку. У сундука нужны open/double, у шалкера open; у ender_chest double запрещён. Поворот/подъём крышки при открытии — полезное относительное движение, его сохранить. Технические UV-грани не являются переключателями положения. Направление соседнего стебля и грань нароста аметиста — другая логика, её не удалять массовой заменой facing/north/south.

Макет tablet/desktop и адаптацию отложить на ДРУГОЙ чат по прямому указанию владельца. Здесь макет не переделывали. Телефонный сценарий/paper tokens сохранять; конкретный редизайн не согласован.

## Текущий записанный статус

- df3d6b1: resolver явно нормализует liquid level 0..7/default 0. b165cfc: 4 IDs water/flowing_water/lava/flowing_lava включены в preview, общий picker уровня/PNG и EN/RU. 311cdb4: existing workflow дополнен liquid checks.
- ef08f4f: resolver сундуков выбирает только нужный sheet/double_sheet независимо от PNG. 759666f: 11 chest source IDs включены в срез (chest/trapped/ender + 4 стадии copper и 4 waxed); общий picker. 17fe666: checks состояний/листов/materials/aliases. Начальное ожидание source ID исправлено на canonical target: waxed ID открывает обычный объект, исходная record/ресурсы не удалены.
- 44f7d6e первоначально нормализовал open/facing шалкера; контракт facing далее ОТМЕНЁН, не восстанавливать его по старому коммиту.
- 4d99f7b: из models/chests.mjs и models/shulker-boxes.mjs удалены таблицы направлений, чтение facing и повороты всего блока; из catalog/preview.mjs — их defaults/checks. Крышки, double, размеры/UV/sheets сохранены.
- c2b7384: поле facing сундука и циклы/ожидания направления удалены из controls/workflow. 6ccafe6: удалены последние две EN/RU-подписи chest_facing. Конкретная чистка в этой новой цепочке завершена; это не очистка всего проекта.

REVIEW_IDS сейчас 44 SOURCE BLOCK IDs, не 44 cards/весь каталог: прежние 29 + 4 жидкости + 11 сундуков. Шалкеровых ID в срезе пока НЕТ. Черновики подключения 17 шалкеров/среза 61 с направлением отклонены и НЕ записаны. Их код, подписи, SHULKER_COLORS и schema facing не считать существующими.

Опечатка record.paths вместо plan.paths в техническом черновике controls обнаружена до записи. Было запрошено новое подтверждение; c2b7384 сохраняет исходное plan.paths. Не ставить исправление этой опечатки как баг репозитория.

## Сохранённый прогресс и ограничения

Eyeblossom одна card closed/open с явными cross/emissive_cross, обе records/routes/resources/glow. Единые FKModelState/FKM/CSS; controls вынесены в preview-controls.mjs без второго меню. Parent cards/familyDefaults используют реальные records, form/slot/state независимы; PNG вне model bindings загружается отдельно. Default model sheet голов/статуй — bindings.sheet.

Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon и статуи 4 окислений/4 поз уже подключены. Полные мобы/их скелет/развёртки отложены, не недоделка голов; недоступный Моб не показывать готовым. Dragon: textures/entity/dragon/dragon, 256x256 sheet, 6 head cubes+jaw/mirror UV/static closed jaw через skull; не новая PNG/полное тело. Placement/scale/UV не приняты. Статуе не добавлять глаза/цветок автоматически; четыре golem ID среза невощёные, не приёмка всех waxed routes.

Pot уже имеет 23 узора+обычную сторону и 4 независимых выбора в общем меню; корпус/UV сохранены. Conduit — 6 resources/default inactive/static active Java-reference-кандидат с eye/wind picker, без анимации/слежения глаза. Water/lava — uniform-height sample (8-level)/9, lava emissive; не world simulator, без slopes/falling/biome tint/overlays/timing. Shulker geometry/base-lid/shared sheets уже есть; default closed/upright, open — статичный reference-кандидат, не плеер.

Bed/sign/cauldron/auxiliary/chest/shulker/banner, fruit+stem/budding amethyst/aquatic/propagule/kelp/materials/lifecycle не делать заново. Детали сохранены в Git/ARCHITECTURE. Предварительный неназначенный остаток bell/player_head/bubble_column — из архивной сверки после 4 liquid assignments, НЕ свежий coverage и не согласование отложенного scope. Fire builder существует, player отдельный.

## Доказательства и сохранность

В этом разговоре выполнялись точечные Node-проверки, synthetic records/controls, Three mock и сравнения старых/новых builders через recording painter; последняя label-правка проверена по исходному blob SHA, синтаксису всего входа и точному сравнению словарей/44 IDs. Перекрывающиеся числа не суммировать. Это НЕ full pinned compile/успешный Actions/реальные PNG-TGA/WebGL/Android/export. Полный новый coverage не получен. Saved workflow не равен выполненному тесту. В документальном ходе перечитаны 7 документов и проверен полный diff последней записи; полный проект заново не исполнялся.

Только main; refactor-0.9/backup не воссоздавать и автоматически не обновлять. fk070_packs — пользовательские localStorage паки, backup кода их не сохраняет; storage ради кэша не очищать. Точное подтверждение каждой записи + полный saved diff; после неоднозначного сбоя сначала GitHub. Малые самосогласованные пакеты, файлы <25000 UTF-8 байт по ответственности. Новые permanent test files отдельно согласовать, существующие не удалять массово. Коротко по-русски, техническую отладку на владельца не перекладывать.

Без второго каталога/меню/monkey patches/адаптеров вокруг адаптеров. Unknown не cube. Aliases требуют эквивалентности, не общей PNG; oxidation/normal/deepslate раздельны. Сохранять source IDs/reopen/owned/carried/icons/indexed repeats/concrete shared dependencies без ownership transfer. PNG/form/state/pose независимы, sheets без копий/обрезки, dimensions/alpha/atlases/frame strips сохранить. EN/RU, IDs без перевода. Glow/sprite Basic-unlit, обычные Lambert; materials заимствуют textures, texture layer владеет GPU textures; composite update/cleanup всех частей/ошибок. Принятую legacy geometry/UV, особенно repeater/comparator, без дефекта не переделывать.

Перенос → совместная приёмка → чистка → переключение/удаление заменённого legacy после готовности. Принять draw/undo/redo/Add/reopen/PNG/mcpack/Android/async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame, затем FK_V/cache. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d, выпуски не смешивать.

Последняя реплика ассистента OLDCHAT19 исключена владельцем; не возвращать PNG-frame диагнозы. OLDCHAT17 async PNG index/save-storage divergence/atlas heuristic/full GPU update — отдельные гипотезы для воспроизведения, не доказанные блокеры. Ceiling-sign rotation suspicion снято: standing/attached rotation, ceiling/wall facing; это не повод массово удалять другие модельные контракты. Сбои AI/коннектора не доказывают дефект приложения.
