# Передача — подключение каталога после OLDCHAT26

Обновлено 2026-11-08. Проверенный main HEAD до документации: 6289e137144a70929084e9d1c2a7e5722c170bae. Начать с CONTEXT. Все прежние модельные контракты, включая полную передачу 3e503a8, сохраняются. Не выпуск.

## Сохранённая точка

Статический состав preview.mjs: прежние 939 (602 base + 273 stone/mineral + 50 wood + 14 leaf) + 55 copper + 41 cube + 10 indexed + 39 fixtures + 39 signs + 35 joinery + 19 extra = ожидаемые 1177 записей. Это не свежий compile/unique-membership audit. Арифметические 98 до 1275 не проверенный список отсутствующих моделей; auxiliary отдельно.

Сохранены 90be95e/625f3c5 (55+41), 17da1cf (terrain.texture_data tests), 1b4d8c9/7a347c0 (общие indexed controls и 10 ID), 68b797e (39 fixtures), 7026a8b (39 signs), 87ecba5 (extensible membership test по истории), a05134a (22 doors + 13 shelves). Door/shelf scope статичный, не обещание открывания.

В EXTRA_SOURCE_REVIEW_BLOCKS есть 10 coral wall fans + 4 waxed statues + 5 technical ID. dba560c/6289e13 с одинаковым commit message не два пакета по 19. Последний get_commit не вернул files/patch; полный diff не установлен. Финальная реплика OLDCHAT26 про bed не подтверждается текущим preview.mjs: явного bed нет. Не считать кровать подключённой и не повторять оборванный пакет без сверки.

Indexed cube picker уже сохранён: bulb mode off/lit/powered/lit_powered, frosted_ice stage 0..3, respawn_anchor charges 0..4, EN/RU и validation. PNG независимо. Sign source имена standing_sign/wall_sign, darkoak_* сохранять.

Базовые IDs/TEXT — preview-config.mjs/preview-text.mjs; stone/wood/leaf в отдельных таблицах, новые группы сейчас в preview.mjs; там итоговая сборка. Helpers — preview-images.mjs. Общий FKModelState/FKM и preview-controls.mjs, без второго меню. Сохранённое разделение edfc234 не отменять.

## Не повторять старую работу

Bubble_column уже sprite/preview с одной выбранной texture и 18 owned roles, без симуляции. 79 fixtures из 0dd77aa сохранены, stale 67 исправлено b41c99b. Explicit indexed button/plate/stair bindings и existing regressions сохранены. 14 leaf ID подключены, foliage cutout/opaque независимо от PNG; biome tint не заявлен готовым. 836ad36 только три integration cases, не повторное подключение.

## Продолжение и проверки

Сверять реальные оставшиеся source IDs по assignment → builder → resources/bindings/states → preview; готовое подключать крупными группами, геометрию повторно не писать. Full per-ID classification ещё нет. Пользовательское «все модели готовы?» не основание утверждать полноту ресурсов/состояний всех ID.

OLDCHAT26 сообщает 13 Node mock checks (7 light + 6 primitive) и sign adapter 39 positive/39 negative на synthetic records, 26 sheet entries. OLDCHAT25: resource-variants 16/16 на 11b7b83. Это история, не прогон на HEAD. В этой сессии только чтение/статическая сверка; full compile/coverage/tests/Actions/images/WebGL/Android не выполнялись.

После подключения — совместная приёмка и editor draw/history/reopen/export integration, затем индивидуальная чистка/runtime switch. Read-only preview не означает готовность основного legacy editor.

После подтверждённой записи проверить saved content/diff и сразу готовить следующий пакет без ожидания «продолжай»; новая запись требует точного подтверждения. Только main/<25000 UTF-8 bytes/file. Новые permanent tests отдельно согласовать; существующие не удалять массово. Документы по запросу владельца. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Full mobs/skin editor/body/armor/layout — отдельный scope. Подробные контракты и исключённые реплики — CONTEXT/ARCHITECTURE.
