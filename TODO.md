# TODO — завершение переноса каталога

Обновлено 2026-11-08. Проверенный HEAD до документации: 836ad36a953f49dd2f08cc7996b0f6172b87385b. [x] означает сохранённый код/явно указанный исторический результат, не визуальную приёмку. Начать с CONTEXT.

## Сохранено, не выполнять повторно

- [x] Bubble_column → existing sprite, 18 owned roles/source variants/paths и EN/RU/preview (4dbdcd2/4f1ef0b). Без симуляции потока.
- [x] Пакеты 80 wool, 112 material, 46 finishing, 56 wood/mosaic и 79 fixtures. Реплика об отсутствии 79 ID опровергнута 0dd77aa.
- [x] 213 stone + 34 + 26 mineral = 273 дополнительных ID; 50 древесных; 14 leaf. Текущий состав кода: 602+273+50+14=939.
- [x] preview-text factory/разделение edfc234, сохранены exports базового конфига; итоговые REVIEW_IDS/TEXT собираются в preview.mjs.
- [x] Stale 67 исправлено b41c99b: непустота/уникальность/source и compiled membership.
- [x] Явные bindings четырёх indexed buttons/plates и пяти stone stairs; регрессии existing resource-variants. По OLDCHAT25 16/16 прошли на 11b7b83; в этой сессии не запускались.
- [x] foliage cutout/opaque → resolver/common picker, PNG независимо; leaf ID подключены 4b37171. 836ad36 добавляет 3 normalized-fixture resolver integration tests. Не повторять финальный leaf hookup draft OLDCHAT25.

## Следующий согласованный объём

- [ ] Завершить по-ID учёт исходных 1275: assignment, registered builder, resources/bindings, states, preview, статус и следующее действие. Auxiliary end_gateway/lava_cauldron отдельно. Непроверенное не называть отсутствующим; 336 вне списка не число новых моделей.
- [ ] Проверять несколько общих семейств сразу и подключать готовое крупным самосогласованным пакетом. ID брать из реальных исходных записей, не придумывать по имени. Особые контракты/дефекты — в отдельный остаток, не блокировать ими готовые группы.
- [ ] Получить фактические fresh coverage/inputValidation/full PIN compile, полный набор тестов и Actions на конкретном SHA. Не выдавать metadata/mock tests за production compile.
- [ ] Проверить весь leaf путь с реальными ресурсами, cutout/opaque/PNG, alpha/material lifecycle; биомная окраска не выполнена по передаче.

## Общая приёмка и основной editor

- [ ] PNG/TGA/real Three-WebGL/UV/scale/alpha/Android, включая dragon/potted azalea/gels/stem tint/kelp, pot/conduit/liquids/chests/shulkers/bell/fire/campfires/bubble sprite. Не переделывать готовую геометрию без дефекта.
- [ ] Source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases/forms/states/independent PNG/GPU update-cleanup.
- [ ] Составить конечный список оставшихся legacy editor путей: выбор объекта, загрузка ресурсов, состояния, draw, history, Add/reopen, PNG/mcpack export; перенести на единственную новую основу без второго runtime.
- [ ] Принять Find/loaders/EN-RU/Shared textures/badges, draw/undo/redo/Add/reopen/export/async/storage/import/dimensions/alpha/cache/URL lifecycle/language-theme-pack-slot-frame/Android. Preview не означает editor switch.
- [ ] Только после готовности — индивидуальная чистка заменённого кода/тестов, runtime switch/FK_V/cache/удаление legacy.

## Отдельный будущий scope

- [ ] Animation timing/order/playback/pause/export strip/clock-compass и smoke/точная particle simulation — не блокеры статичного bubble/campfire scope.
- [ ] Полный skin editor/player body/поздняя примерка брони, full mobs/entities/items/cushion — отдельно. Head/hat/full Steve sheet/routes сохранить.
- [ ] Tablet/desktop layout — другой этап, mobile/paper tokens сохранить.

Работать без искусственных остановок внутри одной большой задачи: после «да» запись → saved diff → следующая подготовка, результат объединять со следующим подтверждением. Новая запись — отдельное точное подтверждение. Малую самостоятельную задачу завершать итогом; фон не обещать. Только main/<25000 UTF-8 bytes/file; новые permanent tests отдельно согласовать, существующие не удалять массово. Документы по запросу владельца. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Chest/shulker facing не возвращать. OLDCHAT25 ненадёжный конец не основание повторного подключения или отката; прочие исключённые реплики и сохранённые контракты — CONTEXT/ARCHITECTURE.
