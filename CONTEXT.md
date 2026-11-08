# CONTEXT — текущая передача

Обновлено 2026-11-08 после OLDCHAT26, OLDCHAT27 и разбора CI с владельцем. Только arseninp/FoundryKin-Beta/main. Последний проверенный SHA до этого пакета: e07f9718fcd66c843d7e32d0a0c46906a9399584. Не выпуск и не завершение рефакторинга.

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Текущий статус здесь заменяет устаревшие 1177/неподключённый bed в старых документах. Подробные модельные контракты ARCHITECTURE и прежней передачи 3e503a8 сохраняются. Прежний полный CONTEXT доступен на e07f971; сокращение входной сводки не отменяет его правила и сохранность.

## Последнее решение владельца

После адресного исправления перейти к обновлению документации без дополнительных ручных прогонов и без новых тестов. Это не разрешение выключать existing CI, удалять тесты или объявлять неподтверждённый успех. Автоматический CI после push может выполняться; его новый результат не проверен. Следующий документальный пакет должен обновить оставшиеся ARCHITECTURE/TODO/ROADMAP/README/review-principles, не ждать новых логов и не продолжать бесконечный рефакторинг.

## Что сохранено после OLDCHAT26

- e11f113: прежнее обновление семи документов по OLDCHAT26. На том этапе bed действительно ещё не был подтверждён.
- 74e5107 и последующая сохранённая конфигурация: настоящий source ID bed подключён; адаптер создаёт 16 цветных записей, bed → red_bed, light_gray → silver sheet. Новую геометрию кроватей не писать.
- В base preview-config сейчас 638 source ID: прежние 602 плюс bed, 17 свечей и 18 cake/candle-cake ID. Геометрия торта целая, свечные торты — aliases cake, не обещание свечи на торте.
- В OLDCHAT27 сохранены состояния свечей, механизмы/рельсы/громоотводы, power groups печей/коптильни/лампы, новые кубические и технические объекты, шесть texture modes structure_block.
- 73ca673: последняя группа 22 source ID действительно записана в REMAINING_REVIEW_BLOCKS и включена в REVIEW_IDS/TEXT. Полный diff: только preview.mjs. Добавлен reviewRows и уплотнены прежние таблицы; большой deletion count не означает утрату подключений.
- Заявленные в OLDCHAT27 1275 исходных ID не называть 1275 принятыми геометриями/карточками. Полного свежего сравнения множества REVIEW_IDS с исходными 1275 этим проходом не выполнено. В coverage 1277 учитываются auxiliary end_gateway/lava_cauldron; множества различать.

## Подтверждённые проверки и исправления

На 73ca673: validate 694 tests, 686 pass, 8 fail; preview-slice остановился на неверном равенстве source IDs и expanded records кроватей.

Сохранены:
- fa9800b: tools/catalog-data.test.mjs использует VM main-context loader с правильным filename; исправлено ожидание ошибки counts. Производственный fk-catalog-data.js не переписан.
- fd6b777: normal.count=24 в тестовом BoxGeometry; рабочая модель кровати и её строгая проверка атрибутов сохранены.
- 650da80: старые отрицания существующих copper_chest/copper_golem_statue и crafter modes заменены точными положительными проверками; unknown IDs и грибная изоляция сохранены.
- 95c9777: тест групп сохраняет порядок, source membership и уникальность с учётом base 638/previous 975.
- d3a21c3: CI сравнивает compiled records с source IDs плюс 16 bed records; проверяет уникальность и alias bed → red_bed. Остальной workflow сохранён.
- e07f971: grass_path явно выбирает dirt для down по имени, сохраняет coarse_dirt/variants/paths; три регрессии в существующем lowered-catalog-integration.test.mjs. Геометрия не менялась.

По присланным логам на d3a21c3: validate 694/694, preview-slice остановился на Explicit face variant required: down. По логам на e07f971: validate 697/697, fail 0, skipped 0; preview-slice остановился на Explicit face variant required: north в общем обходе. Это не успешная полная геометрическая проверка.

Текущий пакет добавляет mycelium в существующие FIXED_PRIMITIVES: cube, два indexed entries на грань, up mycelium_top/down dirt/side mycelium_side. Нормальные и snow-side исходные варианты не удаляются. Дефект неоднозначности подтверждён исходниками; лог сам не содержит ID, поэтому не выдавать статическую локализацию за трассировку всех пройденных объектов. После этой правки дополнительных тестов не запускали и новых регрессий не добавляли по решению владельца. Следующие потенциальные блокеры полного обхода ещё не исключены.

## Дальнейшая работа

Сначала закончить обновление остальных пяти документов, не теряя эту точку. Затем при возобновлении технической приёмки проверить полный preview/ресурсные состояния; зелёные unit tests не доказательство визуальной готовности. При новых ошибках нужны source ID/model/face в диагностике, не fallback на первый PNG. Не объявлять все ресурсы/состояния всех ID готовыми без проверки.

После подтверждённого каталога — конкретные legacy editor Find/resources/states/draw/history/Add/reopen/export пути, совместная приёмка и только затем индивидуальная чистка/runtime switch/FK_V/cache/removal. Preview read-only не заменяет основной редактор. Full PNG-TGA/WebGL/UV/scale/alpha/Android и пользовательская приёмка не выполнены.

## Правила и сохранность

Кратко по-русски, технические решения не перекладывать на владельца. В конце ответа понятная сводка: что сделано, что дальше, что требуется. В интерфейсе владельца отдельный запрос подтверждения может не показываться: просьбу о записи явно писать в конце обычного ответа, с точными файлами/объёмом. «Продолжай» без конкретного ожидающего запроса не разрешение произвольных записей. Каждая новая запись требует точного подтверждения; после записи проверить saved diff/content и продолжать подготовку без лишнего «продолжай». Не обещать фон.

Только main, <25000 UTF-8 bytes/file, валидатор не ослаблять. Новые permanent test files отдельно согласовать; existing tests массово не удалять. Документы по запросу владельца. Backup/refactor-0.9/fk070_packs/localStorage не трогать. После сбоя смотреть фактический GitHub перед повторной записью, не делать HEAD ритуалом каждого ответа.

Один каталог/menu/state picker/runtime, без дублирующих managers/wrappers. Unknown не cube. Source-ID reopen/owned/carried/icons/indexed alternatives и repeats/shared dependencies/aliases сохранять. PNG/form/slot/state/pose независимы, sheets без copies/crops. Waxed aliases только при эквивалентности, окисления раздельно. Chest/shulker whole-block facing не возвращать; open/lid/double сохранять, ender без double. Head/hat/full Steve sheet/routes сохранять; full mobs/skin editor/body/armor/tablet-desktop layout отложены. Biome tint листвы не принят; static bubble/fire/campfire не playback/particle simulation.

OLDCHAT26/25/19 ненадёжные концовки не основание отката проверенного прогресса. OLDCHAT22 unwritten-player_head опровергнут 1df7ce9/60ec0ad. OLDCHAT17 гипотезы не доказанные баги; ceiling-sign suspicion снято. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d, версии не смешивать.
