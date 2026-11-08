# CONTEXT — вход новому чату

Обновлено 2026-11-08 по прочитанному OLDCHAT26 на Диске, предупреждению владельца о ненадёжном конце и сохранённому GitHub. Проверенный HEAD main перед документацией: 6289e137144a70929084e9d1c2a7e5722c170bae. Только arseninp/FoundryKin-Beta/main. Это не выпуск, не завершение рефакторинга и не визуальная приёмка.

Читать: CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Прежние контракты 5b083a7/1043175/3fe2d82 и полная передача 3e503a8 сохраняются, кроме явно обновлённого статуса.

## Точка продолжения

Продолжать сверку и подключение оставшихся реальных ID крупными самосогласованными группами: assignment → registered builder → resources/bindings/states → preview. Не писать готовую геометрию повторно и не строить новую инфраструктуру вместо переноса. Полной по-ID таблицы пяти статусов для исходных 1275 ещё нет.

По составу текущего preview.mjs ожидается 1177 записей REVIEW_IDS: прежние 939 + 55 copper + 41 cube + 10 indexed cube + 39 fixtures + 39 signs + 35 doors/shelves + 19 alias/technical. Это статический состав, не результат свежего compile или проверки уникальности. Прежние 939 = 602 base + 273 stone/mineral + 50 wood + 14 leaf. Базовый экспорт preview-config.mjs не весь срез. Разницу 1275−1177=98 не выдавать за проверенный список остатка или число отсутствующих моделей: нужны сверка множеств, уникальности и auxiliary end_gateway/lava_cauldron отдельно.

Конец OLDCHAT26 не надёжный журнал записей. В текущем файле есть EXTRA_SOURCE_REVIEW_BLOCKS: 10 coral wall fans, 4 waxed copper golem statues, allow/deny/border_block/barrier/structure_void. История содержит dba560c и 6289e13 с одинаковым сообщением про 19 ID; пакет не считать дважды. get_commit для 6289e13 вернул metadata без files/patch, поэтому полный diff последнего коммита этим не проверен. Финальное «обновляю ... bed» не подтверждено: явного bed в прочитанном preview.mjs нет. Не объявлять кровать подключённой и не повторять оборванную запись вслепую; сначала проверить реальный исходный ID, ресурсы и существующую модель.

## Что уже записано — не повторять

- 90be95e: 55 copper primitive ID; 625f3c5: 41 cube ID. 17da1cf: исправление двух обращений тестового входа к terrain.texture_data; не новая модель.
- 1b4d8c9: общий picker для copper bulb mode off/lit/powered/lit_powered, frosted_ice stage 0..3, respawn_anchor charges 0..4. Наличие этого кода подтверждено чтением preview-controls.mjs. 7a347c0 добавляет 10 соответствующих source ID в preview. Не ставить controls повторной задачей.
- 68b797e: 39 fixtures/aliases; 7026a8b: 39 sign source ID (13 пород × standing/wall/hanging). Имена standing_sign/wall_sign и darkoak_standing_sign/darkoak_wall_sign не заменять выдуманными oak/dark_oak именами.
- 87ecba5: по истории обновлён тест extensible membership/preserved prefix; наличие теста не результат запуска. a05134a: 22 двери и 13 полок, статичный scope.
- 4dbdcd2/4f1ef0b: bubble_column → existing sprite/preview, 18 owned roles и исходные variants/paths сохранены. Одна выбранная текстура на плоскости; не particle simulation. pumpkin_side остаётся исходным ресурсом, не ролью пузырей.
- b62b86b/86da89c/a88ba7a/caa865d/0dd77aa: 80 wool/112 materials/46 finishing/56 wood-mosaic/79 fixtures. Отрицание сохранения 79 в старом чате неверно.
- b41c99b: stale 67 исправлено на непустоту/уникальность/source и compiled membership.
- 1e9fa87/d500fd4: explicit bindings четырёх indexed buttons/plates и пяти stone stairs; fcdd2f5/11b7b83 — existing resource-variants regressions. Alternatives/repeats сохранять.
- 390f4d3/7d2ff51/c1dce9c/e0291e6: 273 stone/mineral; 4cc1347: 50 wood; 95928be/74f90ab/1ea0dfd/4b37171: foliage cutout/opaque/resolver/picker/14 leaf. 836ad36 добавляет только три integration cases.
- edfc234: preview-config/preview-text уже разделены из-за реального лимита валидатора. Не восстанавливать старый монолит и не дробить дальше ради процесса.

## Где искать

preview-config.mjs: base IDs/TEXT через preview-text.mjs. preview-stone-data.mjs/preview-wood-data.mjs/preview-leaf-data.mjs: дополнительные таблицы. Новые copper/cube/indexed/fixture/sign/joinery/extra таблицы сейчас в preview.mjs; там итоговые REVIEW_IDS/TEXT и compileReview. Helpers — preview-images.mjs; общий UI — FKModelState/FKM/preview-controls.mjs; leaf contract — catalog/leaf-preview.mjs. Второй каталог/manager/menu/runtime не создавать.

## Доказательства и ограничения

OLDCHAT26 сообщает 7/7 light-models и первые 6 primitive-models в Node на production-модулях с mock Three, а также 39 положительных + 39 отрицательных проверок sign adapter на синтетических normalized records и проверку 26 sheet entries. Это исторические сообщения, не повторный запуск на 6289e13 и не WebGL. OLDCHAT25 сообщает resource-variants 16/16 на 11b7b83. Нельзя суммировать перекрывающиеся проверки или выдавать fixture/registry-spy за реальную геометрию и изображения.

В этом документальном проходе прочитаны OLDCHAT26, все семь прежних документов, история main, preview.mjs, preview-controls.mjs и tools/model-library.test.mjs. Тесты не запускались. Full coverage/inputValidation/PIN compile/tests/Actions/PNG-TGA/WebGL/Android и визуальная приёмка не подтверждены. Основной editor legacy по прежней передаче; HTML/runtime заново не проверены. Preview не доказывает draw/undo/reopen/export и не разрешает удалять legacy. Биомный tint листвы не заявлен готовым.

## Правила и сохранность

Одна большая согласованная задача без искусственных остановок: после «да» выполнить ровно подтверждённую запись, проверить saved content/diff и сразу продолжить подготовку следующего пакета без ожидания «продолжай». Новая запись требует отдельного точного подтверждения. Остановка — обязательное подтверждение, изменение направления, существенная неоднозначность, материалы владельца или реальный блокер. Малую самостоятельную задачу завершать итогом, фон не обещать. ZIP в старой реплике — ошибка диктовки.

Только main; <25000 UTF-8 bytes/file, валидатор не ослаблять. Новые permanent test files отдельно согласовать; существующие не удалять массово. Документы по запросу владельца. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Кратко по-русски, техническую отладку не перекладывать на владельца. После неоднозначного сбоя смотреть GitHub, не повторять запись слепо и не делать HEAD отдельным ритуалом каждого ответа.

Unknown не cube. Сохранять source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases, независимые PNG/form/slot/state/pose и общие sheets без copies/crops. Waxed aliases только при эквивалентности, окисления раздельно. Chest/shulker whole-block facing не возвращать; open/lid/double сохранить, ender без double. Полные mobs, skin editor/body/поздняя примерка брони, tablet/desktop layout отложены; head/hat/full Steve sheet/routes сохранить, фиктивные формы не показывать.

Предупреждение владельца о конце OLDCHAT26 не доказывает дефект кода и не разрешает откат подтверждённого прогресса. Также исключены ненадёжные OLDCHAT25 ending и OLDCHAT19 final; OLDCHAT22 unwritten-player_head опровергнут 1df7ce9/60ec0ad. OLDCHAT17 гипотезы не доказанные баги, ceiling-sign suspicion снято. PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d. Перенос → совместная приёмка/editor integration → чистка/runtime switch/FK_V/cache/removal только после готовности.
