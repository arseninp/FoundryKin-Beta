# CONTEXT — вход новому чату

Обновлено 2026-11-03 по полному OLDCHAT20 на Диске и текущему GitHub. Репозиторий arseninp/FoundryKin-Beta, только main. Проверенный HEAD до этой документальной записи: efb873044ce59c308bce2aaf11ba73c709d869bf. Рефакторинг и блоковый этап НЕ завершены. Это не выпуск и не визуальная приёмка; основной редактор не переключён на новый путь.

## Читать и продолжать отсюда

Порядок: CONTEXT.md → docs/handoff-unified-cards.md → ARCHITECTURE.md → TODO.md → ROADMAP.md → README.md → docs/review-principles.md. Предыдущие полные версии документов сохранены в d41f3843a8ef4fc66872784c11d6f50a7b5f49dc; история голов и дракона — также в 40c82f0. Не повторять выполненные пакеты из старых TODO.

Точка продолжения — вода и лава. efb8730 добавил models/liquids.mjs, регистрацию builders water/lava, назначения water/flowing_water/lava/flowing_lava и обновление существующего library test. В прочитанном liquids.mjs есть явный state.level 0..7, default 0, равномерная высота (8-level)/9, шесть ресурсных ролей; lava объявляет их emissive. Это редакторский образец ровного уровня с Java-reference, НЕ симуляция соседских уклонов/падения/течения, без biome tint, overlays и анимационного тайминга. Bedrock appearance не принят. Не создавать builders заново.

В прочитанном корневом preview.mjs REVIEW_IDS содержит 29 source block IDs: прежние 27 + decorated_pot + conduit. Жидкостей в срезе нет. Следующий небольшой пакет после изучения consumers — связать уже записанные жидкости с resolver/общими controls и срезом, сохраняя независимость PNG/state. Сначала проверить существующие bindings/normalization/материалы и поведение level, а не придумывать второй путь. Расширение просмотра и создание геометрии — разные задачи.

Вопрос владельца об адаптации узкого макета под планшет/компьютер остаётся открытым: исследование editor/iframe/CSS/size consumers не завершено. OLDCHAT20 фактически продолжился моделями, поэтому макет больше не единственная точка остановки. Широкая раскладка/breakpoints/редизайн не согласованы; телефонный сценарий и paper/design tokens сохранить.

## Прогресс OLDCHAT20 — не повторять

- 70ec5f8: источники decorated pot — базовый лист, 23 узора и обычная сторона, inventory checks; без новых cards/копий PNG.
- 1fcf149: существующий builder/resolver поддерживают независимые стороны горшка. Незаданные стороны обычные; корпус/горловина/UV сохранены, PNG не задаёт узор.
- 56724d3: горшок в preview, четыре выбора через общий picker, 23 узора + Без рисунка, EN/RU; срез стал 28 IDs.
- df07052: проверки горшка добавлены в существующий preview-slice workflow, без нового test file. Записанный workflow не означает успешный Actions.
- cdac9c4: шесть ресурсов conduit — база, оболочка, открытый/закрытый глаз, два вихря. Неактивный вид сохранён.
- 93b9565: статичный Java-reference-кандидат активного conduit: оболочка, глаз, два слоя вихря. Нет анимации и слежения глаза за камерой; Bedrock UV/alpha/render не приняты.
- eb3fa90: resolver независимо выбирает активность, глаз и вихрь; default неактивный, PNG не переключает состояние.
- 5eeed20: существующая логика controls перенесена из preview.mjs в preview-controls.mjs, старые определения удалены, экспорты для проверок сохранены. Conduit подключён к общему picker; срез 29 IDs. Не второй manager/панель.
- ae7120e: существующий workflow проверяет conduit state/materials/update/cleanup/заимствованные textures. Успешный Actions не подтверждён.
- efb8730: основа жидкостей; по OLDCHAT20 ожидание библиотеки — 112 builders, не число cards/принятых моделей и не свежий coverage.

## Сохранённый предыдущий прогресс и объём

Eyeblossom уже одна card closed/open с явным cross/emissive_cross, обе records/resources/routes/glow сохранены. Existing FKModelState переработан; единые FKM/CSS вынесены в fk-menu.js/fk-menu.css с удалением прежних реализаций. Preview использует общий themed picker. Parent cards/familyDefaults используют реальные source records, без фиктивных entities. request.form/slot/state и plan.forms раздельны; выбранная PNG загружается даже вне model bindings. Default model view голов/статуй — bindings.sheet.

Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon, статуи четырёх окислений/четырёх поз и их parent/source-ID routes уже подключены к отдельному preview. Не объявлять их ошибочными только из-за отсутствия браузерной приёмки. Dragon: textures/entity/dragon/dragon, общий 256x256 sheet, 6 head cubes + jaw, mirror UV/static closed jaw через skull, без нового builder ID/отдельной PNG/полного тела. Placement/scale/UV не приняты. Четыре golem IDs среза невощёные; это не приёмка всех waxed routes.

Полные мобы/их скелет/развёртки — отдельный будущий этап, не недоделка голов. Недоступный Моб не показывать готовым. Статуе автоматически не добавлять глаза/цветок, окисления не сливать. Отдельных rotation/facing controls голов/статуй не нужно: жест; внутренние builder protocols сохранить. Позы и static open — не плеер.

Bed/sign/cauldron/auxiliary/chest/shulker/banner, fruit+stem/budding amethyst/aquatic/propagule/kelp/materials/lifecycle уже переносились. Не начинать заново по старой передаче. Детали — ARCHITECTURE и история Git.

## Остаток и доказательства

В OLDCHAT20 чтением шести входных chunks/правил названы семь ID без назначения ДО efb8730: bell, player_head, bubble_column, water, flowing_water, lava, flowing_lava. После назначения четырёх жидкостей предварительный остаток — bell/player_head/bubble_column. Это вывод из архивной сверки и последующего коммита, НЕ свежий полный coverage. Колокол/голова игрока не становятся согласованным объёмом автоматически. Fire уже имеет builder; отсутствие player не означает отсутствие геометрии.

OLDCHAT20 сообщает изолированные syntax/JS/Three mock проверки горшка, conduit и жидкостей; числа перекрываются, не суммировать. Они не full normalize → compile → resolver → UI, не реальные PNG/TGA/WebGL/Android/export. В этой сессии тесты, компиляция, CI и браузер НЕ запускались. Прочитаны полный OLDCHAT20, семь прежних документов, последние 15 коммитов, текущие preview.mjs и models/liquids.mjs; весь код/все diff заново не проверены. История подтверждает коммиты, не результат исполнения.

Последняя реплика ассистента OLDCHAT19 ранее исключена владельцем: не возвращать её PNG-frame заявления как диагноз/задачу. Исторические гипотезы OLDCHAT17 (async PNG index, memory/storage save failure, atlas heuristic, full GPU update) — отдельно для воспроизведения, не доказанные блокеры. Подозрение ceiling-sign rotation снято: standing/attached rotation, ceiling/wall facing. Сбои AI/коннектора не доказывают дефект приложения.

## Постоянные контракты и сохранность

Только main; refactor-0.9 не воссоздавать, backup автоматически не обновлять. fk070_packs — пользовательские localStorage паки, backup кода их не сохраняет; ради кэша storage не очищать. Каждая запись — точное подтверждение и полный saved diff/контент; после неоднозначного сбоя сначала GitHub. Малые самосогласованные пакеты, файлы <25000 UTF-8 байт по ответственности. Новые постоянные test files отдельно согласовать, существующие не удалять массово. Отвечать коротко по-русски, техническую отладку на владельца не перекладывать.

Не создавать второй каталог/меню/monkey-patch chains/адаптеры вокруг адаптеров. Unknown не cube. Различать aliases/forms/states/stages/frames; сохранять source IDs/reopen/owned paths/carried/icons/indexed repeats и конкретные shared dependencies без передачи ownership. Общая PNG не основание alias, oxidation/normal/deepslate не сливать; waxed/infested только при эквивалентности. PNG/form/state/pose независимы, общие sheets напрямую без копирования/обрезки. EN/RU, IDs без перевода, paper tokens сохранять.

Принятую legacy geometry/UV, особенно repeater/comparator, без конкретного дефекта не переделывать. Glow/sprite Basic-unlit, обычные роли Lambert; материалы заимствуют textures, texture layer владеет GPU textures. Composite update/cleanup учитывает все части и ошибки. Сохранять PNG dimensions/alpha/atlases/frame strips.

Перенос/основа с точечными проверками → совместная приёмка → чистка → удаление заменённого legacy после успеха. Принять draw/undo/redo/Add/reopen/PNG/mcpack, Android, async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame; лишь затем переключать основной runtime и синхронизировать FK_V/cache. PIN Mojang/bedrock-samples: 46ba6ea985fb5a92d79a9419198f10dda14c199d, выпуски не смешивать.
