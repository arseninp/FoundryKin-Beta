# TODO — завершение переноса каталога

Обновлено 2026-11-08 по OLDCHAT26 и main 6289e137144a70929084e9d1c2a7e5722c170bae. [x] — сохранённый код/явно оговорённый исторический результат, не визуальная приёмка. Начать с CONTEXT.

## Сохранено — не повторять

- [x] Прежние 939 source ID: 602 base + 273 stone/mineral + 50 wood + 14 leaf. Bubble_column existing sprite/18 owned roles/одна выбранная texture без симуляции; leaf cutout/opaque/shared picker.
- [x] 55 copper (90be95e), 41 cube (625f3c5), terrain.texture_data test fix (17da1cf).
- [x] Indexed cube controls (1b4d8c9): bulb 4 modes, frosted ice 4 stages, anchor 5 charge values; 10 ID подключены 7a347c0.
- [x] 39 fixtures (68b797e), 39 signs (7026a8b), 22 doors + 13 shelves (a05134a). Статичный scope, готовую геометрию не переносить заново.
- [x] В preview есть 19 extra source ID: wall fans/waxed statues/technical. dba560c/6289e13 не считать двумя пакетами.
- [x] Stale 67 исправлено b41c99b, 79 старых fixtures сохранены 0dd77aa. Explicit indexed button/plate/stair bindings и existing regressions сохранены. Config/text разделение edfc234 сохранено.
- [x] По истории 87ecba5 обновил extensible membership test; не означает успешный запуск.

## Следующий согласованный объём

- [ ] Получить фактические REVIEW_IDS length/unique/membership и full compile на конкретном SHA. Статический ожидаемый состав 1177, не доказанный runtime результат. Арифметические 98 до 1275 не готовый список остатка; auxiliary отдельно.
- [ ] Закончить по-ID таблицу исходных 1275: assignment → builder → resources/bindings → states → preview, статус/следующее действие. Непроверенное не называть отсутствующим.
- [ ] Подключать готовые реальные семейства крупными самосогласованными пакетами; конкретные ресурсные/state пробелы отдельно. Не писать готовые модели повторно.
- [ ] Разрешить оборванную точку bed по коду/реальным ресурсам: последняя реплика OLDCHAT26 не доказывает запись, в прочитанном preview.mjs явного bed нет. Не повторять неподтверждённый пакет вслепую.
- [ ] Проверить фактическое содержание/разницу dba560c и 6289e13, если потребуется разбор последних записей: get_commit последнего вернул только metadata без files/patch; не объявлять полный diff проверенным.
- [ ] Fresh full coverage/inputValidation/PIN compile/tests/Actions на конкретном SHA, включая новые resource/sign/controls tests. Исторические 13 Node mock checks и 39+39 synthetic sign adapter checks не заменяют полный прогон.
- [ ] Leaf с реальными images/alpha/material lifecycle/PNG/cutout-opaque; biome tint не заявлен готовым.

## Общая приёмка и основной editor

- [ ] PNG/TGA/real Three-WebGL/UV/scale/alpha/Android, включая dragon/potted azalea/gels/stem tint/kelp, pot/conduit/liquids/chests/shulkers/bell/fire/campfires/bubble sprite и новые группы. Не переделывать geometry без дефекта.
- [ ] Source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases/forms/states/independent PNG/GPU update-cleanup.
- [ ] По коду определить оставшиеся legacy editor пути Find/resources/states/draw/history/Add/reopen/PNG-mcpack export; перенести на единственную новую основу. Read-only preview не editor switch.
- [ ] Совместно принять loaders/EN-RU/Shared textures/badges/draw/undo/redo/Add/reopen/export/async/storage/import/dimensions/alpha/cache/URL lifecycle/language-theme-pack-slot-frame/Android.
- [ ] Только после готовности — индивидуальная чистка заменённого кода/тестов, runtime switch/FK_V/cache/removal legacy.

## Будущий scope

- [ ] Animation timing/order/playback/pause/export strip/clock-compass/smoke/точная particle simulation. Не блокеры статичного bubble/campfire.
- [ ] Full skin editor/player body/поздняя примерка брони/full mobs/entities/items/cushion. Head/hat/full Steve sheet/routes сохранить.
- [ ] Tablet/desktop layout отдельно, mobile/paper tokens сохранить.

После «да»: точная запись → saved content/diff → следующая подготовка без ожидания «продолжай». Каждая новая запись требует подтверждения. Только main/<25000 UTF-8 bytes/file; новые permanent tests отдельно согласовать. Документы по запросу владельца; backup/refactor-0.9/fk070_packs/localStorage не трогать. Chest/shulker facing не возвращать. Ненадёжные концовки не основание отката проверенного кода; подробные контракты — CONTEXT/ARCHITECTURE и прежняя передача 3e503a8.
