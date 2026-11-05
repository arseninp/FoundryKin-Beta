# Передача: костры закрыты, продолжить следующие модели

Обновлено 2026-11-05 по текущему разговору, OLDCHAT22 и GitHub. Проверенный кодовый HEAD до документации: 05f7a62f42a021b2c67d0cfbd3c87515db428aa6, main. Начать с CONTEXT. Подробные прежние контракты — 5b083a7/1043175/3fe2d82, не отменяются этой передачей.

## Что закрыто

Владелец заканчивает чат и просит в новом сразу брать следующие модели. Статичные campfire/soul_campfire в отдельном preview реализованы и подключены. Не начинать их заново и не превращать оставшуюся общую визуальную приёмку в задачу повторного переноса. Пламя — Basic-unlit, брёвна — Lambert; lit false/true независимо от выбранной PNG, default true; EN/RU, оба source IDs. Дым и animation playback не добавлялись.

Ключевые записи: 2b7d82c — emissiveRoles:['up'] и регрессия; d578dc8 — общий lit picker; 05f7a62 — ID/подписи/pinned checks. Fire/soul_fire: e076117 — переписанная сборка/cleanup/unlit; c5134e5 — A/B; 8116bb5 — вывод в preview; 3fea102 — ранняя variant validation/default primary. Геометрия кандидатов/UV и PNG не переделывались произвольно. StageCount не менялся.

## Где подключено

REVIEW_IDS/TEXT в preview-config.mjs: 67 исходных ID = 29 прежних + 4 liquids + 11 chests + 17 shulkers + bell + player_head + 2 fires + 2 campfires. Не число cards/весь каталог. Library test ожидает 113 builders, не 113 принятых объектов. Helpers — preview-images.mjs, прежние экспорты preview.mjs сохранены. Общие FKModelState/FKM/CSS/preview-controls, второго меню нет.

Это отдельный read-only preview. Основной editor всё ещё legacy, HTML заново проверен; новый путь рисования/undo/reopen/export не подключён. Не обещать, что изменения уже работают в основном редакторе, и не удалять старые файлы.

## Какие доказательства есть

Локальные полные файлы: resource-variants 9/9, fire-models 8/8, light-models 7/7. Pure-controls/state checks отдельно. Завершающий стенд с настоящими registry/controls/materials/campfire builder, сверенными по blob SHA: 12 сочетаний state/PNG, 2 defaults, 6 invalid-state случаев; обновление материалов не меняет геометрию, borrowed textures не освобождаются материалами. Fixtures/Three recording classes синтетические. Это НЕ полный pinned compile/CI/реальные PNG-TGA/WebGL/Android. Counts не суммировать.

Pinned tests шести групп shulker/bell/player/fire/campfire записаны в existing files, успешный запуск не подтверждён. Existing validate запускает все tools/*.test.mjs; workflow содержит real Three r128/no-WebGL путь, но его наличие не равно успешному Actions.

## Продолжение

Взять следующий согласованный объект/группу каталога, проверив уже существующие назначения/геометрию/источники; не добавлять ещё один аудит и не дробить файлы ради процесса. В manifest 1275 block IDs, но свежего полного coverage/inputValidation/compile результата нет. Ручная сверка исходных частей не доказывает закрытие всего каталога.

Bubble_column: подготовлены только 18 texture roles, builder/assignment/preview нет. Владелец отложил точную геометрию/UV/движение по двум своим скриншотам: отдельные пузырьки, над магмой со слов владельца спирально вниз, над soul sand прямо вверх. Не куб-заглушка, не единственный доказанный остаток.

Player_head уже сохранён в 1df7ce9/60ec0ad, последняя реплика OLDCHAT22 об обратном исключена. Будущий skin editor и примерка брони — отложенный план с переиспользованием head/hat/полного sheet. Полные mobs и макет отдельно.

Не возвращать chest/shulker whole-block facing: жест вращает модель, крышки/open/double сохранить, ender без double. Unknown не cube; source IDs/resources/PNG-form-state/owned/shared contracts сохранить. Только main/exact confirmation/saved diff/<25000 bytes/file, backup/fk070_packs не трогать. Остальные обязательные контракты — CONTEXT/ARCHITECTURE/review-principles и указанные прежние документы.
