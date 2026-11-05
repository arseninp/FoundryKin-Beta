# Передача: модели, общий preview и следующий участок

Обновлено 2026-11-05 по OLDCHAT22 и GitHub. Проверенный HEAD до документации: 60ec0ad78b28e17a5087a4849f1cb972e35752c0, main. Читать после CONTEXT. Предыдущие документы: 1043175/3fe2d82, история d41f384/40c82f0/aae3661. Это не выпуск и не визуальная приёмка.

## Где остановились

Следующий согласованный кандидат — bubble_column: сначала исходные записи/ресурсы и корректное представление, не куб-заглушка. Свежий existing coverage/inputValidation/full PIN compile не получен; нельзя утверждать, что остался ровно один объект. Владелец просит доделывать модели, а не бесконечно дробить файлы/расширять аудит.

Шалкеры, bell и player_head УЖЕ записаны. Последний ответ ассистента OLDCHAT22 о несохранённой голове ошибочен: 1df7ce9 и 60ec0ad существуют в main, их полные diff проверены в этом проходе. Не переотправлять прежний пакет. После сбоя сначала проверять GitHub.

## Что добавлено

- e4db3d6/196fc69: 17 раздельных shulker source IDs/open/independent PNG/EN-RU. light_gray→silver sheet без silver card. e255fc2 — fixture и pinned integration.
- f77e3c5 — актуальные model-policy ожидания без отката готовых назначений. 2f6c30e — parseLooseJson/string/comment-boundary регрессии.
- b2c6eb2 — preview-images.mjs для read-only image helpers; afd199b — preview-config.mjs для REVIEW_IDS/SHULKER_BOXES/TEXT. Старые экспорты preview.mjs сохранены.
- 9cf2a6f/d2333b3/2fe3362 — bell: 5 частей legacy geometry, sheet/owned supports, assignment/resolver/preview/PNG/EN-RU и записанный pinned test. Только статичный колокол на стойках, без других креплений/звона.
- 1df7ce9/60ec0ad — player_head/skull/Steve sheet/head+hat, player parent card с единственной формой head, PNG и source/parent routes; записаны проверки в existing integration test. Не полное тело и не редактор скинов.

REVIEW_IDS в preview-config.mjs: 63 source IDs = прежние 29 + liquids 4 + chests 11 + shulkers 17 + bell 1 + player_head 1. Не cards/full catalog. Ожидание library test 113 builders не означает приёмку 113 объектов.

## Решение о будущем игроке

Владелец предложил полноценный редактор скинов, затем тело для примерки брони. Зафиксировать как отложенный план. Текущие head/hat UV/полный sheet/маршруты сохранить; не создавать обрезанную PNG, фиктивное тело или неработающий selector. При втором потребителе отделить описание детали от её блокового размещения и размещения на теле. Сейчас полной модели/общего helper детали нет.

## Не потерять

Чистка chest/shulker whole-block facing завершена 4d99f7b/c2b7384/6ccafe6. Жест вращает модель; chest open/double, ender без double, shulker open. Относительное движение крышек/UV/stem direction/growth face сохранить. Отклонённые facing drafts не восстанавливать; нынешний shulker UI — другой, сохранённый вариант. record.paths typo был лишь черновиком, plan.paths в main сохранено. Макет — другой чат. Документы менять только по указанию владельца.

Eyeblossom/головы/статуи/pot/conduit/liquids/chests/bed/sign/banner и предыдущие переносы не повторять. Независимые form/slot/state/PNG, source records/routes/owned resources/shared sheets без копирования, waxed canonical routes при сохранении исходных IDs/resources. Четыре golem IDs среза невощёные; полные mobs отложены, не недоделка голов. Остальные контракты — ARCHITECTURE.

## Доказательства

Локальные checks из OLDCHAT22 — исторические mock/targeted результаты, не новый запуск и не full PIN/CI/WebGL/Android/export. Pinned shulker/bell/player integration записан, успех не подтверждён. Не суммировать counts; workflow не доказательство исполнения. В этом документальном проходе тесты проекта не запускались. Дальше нужны existing coverage/inputValidation/compile/tests и совместная визуальная приёмка; не второй аудит.

Только main/точное подтверждение/saved diff/<25000 UTF-8 bytes/file; новые test files отдельно согласовать. Backup/fk070_packs не трогать. OLDCHAT19 final reply исключён, OLDCHAT17 — гипотезы, ceiling-sign suspicion снято. После приёмки — чистка/runtime switch, не наоборот.
