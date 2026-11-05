# CONTEXT — вход новому чату

Обновлено 2026-11-05 по OLDCHAT22, текущему разговору и GitHub. Репозиторий arseninp/FoundryKin-Beta, только main. Проверенный кодовый HEAD перед документацией: 05f7a62f42a021b2c67d0cfbd3c87515db428aa6. Это не выпуск и не завершение всего рефакторинга.

## Точка продолжения

Владелец просит закрыть костры и перейти в новом чате к следующим моделям. Согласованный кодовый объём статичных campfire/soul_campfire в отдельном preview ЗАКРЫТ: builders существуют, пламя unlit/брёвна Lambert, общий lit picker/default true, независимая PNG, исходные ID и подписи EN/RU подключены. Не начинать повторную реализацию/подключение огня и костров и не ставить их снова первой задачей без конкретного воспроизводимого дефекта. Дым и воспроизведение анимации в этот статичный объём не входили.

Дальше — следующий согласованный объект/группа каталога: сначала проверить уже существующие assignment/builder/resources, затем делать недостающее подключение. Не подменять работу очередным дроблением файлов или новой инфраструктурой аудита. Полный existing coverage/inputValidation/compile всё ещё требует подтверждённого результата; чтение исходников не является свежим вычисленным отчётом.

Читать: CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → README → docs/review-principles.md. Последний полностью прочитанный архив Диска — OLDCHAT22; текущий разговор не объявлять выдуманным OLDCHAT23. Подробные прежние контракты сохранены в документах коммита 5b083a7 и истории 1043175/3fe2d82; они не отменены новой передачей.

## Что действительно подключено

Отдельный read-only preview: 67 SOURCE BLOCK IDs, не cards/полный каталог. Формула: прежние 29 + liquids 4 + chests 11 + shulkers 17 + bell + player_head + fire/soul_fire 2 + campfire/soul_campfire 2. REVIEW_IDS/TEXT находятся в preview-config.mjs, image helpers в preview-images.mjs, совместимые экспорты preview.mjs сохранены. Ожидание library test 113 builders не означает 113 принятых карточек.

Основной редактор НЕ переключён: index.html заново проверен и по-прежнему загружает fk-catalog/fk-shapes/fk-details/fk-core и другие legacy-модули с 0.9.1. Новый каталог/renderer не интегрирован с рисованием/undo/redo/reopen/export основного пути. Поэтому нельзя говорить, что все модели подключены к приложению или можно удалить legacy.

## Итог текущего разговора

- c3cb01e: bubble_column — только 18 owned texture roles и регрессии. Нет builder/assignment/preview. Внешний вид и движение отложены владельцем; не делать куб-заглушку.
- e076117: fire builder переписан через явную схему восьми плоскостей, текущая раскладка/UV сохранены как кандидат; объявлены шесть unlit roles, усилены валидация и cleanup. c5134e5: общий A/B picker. 8116bb5: fire/soul_fire в срезе и EN/RU, pinned checks записаны. 3fea102: resolver default primary и ранний отказ неверного variant; stageCount не менялся.
- 2b7d82c: только campfire.up unlit, брёвна Lambert, geometry/UV/другие lights не менялись. d578dc8: общий boolean lit picker/default true. 05f7a62: оба костра в срезе, EN/RU, expanded pinned checks. Листы/PNG не изменялись, дым/player не добавлялись.
- Bell/player_head уже записаны ранее. Последняя реплика ассистента OLDCHAT22 о несохранённой голове неверна: 1df7ce9/60ec0ad проверены в GitHub. Не повторять старый пакет.

## Проверки и границы завершения

В этом разговоре выполнены: весь resource-variants.test.mjs 9/9; весь fire-models.test.mjs 8/8, включая регистрацию; весь light-models.test.mjs 7/7, новая регрессия падает на старом коде; отдельные pure-controls/state checks. Последний связанный локальный стенд на четырёх production-модулях, сверенных по blob SHA: registry → controls → materials → campfire builder, 12 state/PNG сочетаний, 2 defaults, 6 invalid-state случаев, material update/dispose и сохранность borrowed textures. Использованы синтетические фикстуры и recording Three classes, не pinned catalog/PNG/TGA/WebGL/Android. Не суммировать пересекающиеся результаты.

Pinned shulker/bell/player/fire/campfire tests ЗАПИСАНЫ, успешный полный прогон не подтверждён. Existing validate автоматически запускает tools/*.test.mjs; workflow также строит REVIEW_IDS на real Three r128 без WebGL. Это не доказательство успешного Actions. Визуальные UV/scale/alpha, draw/export/Android и полная приёмка остаются общей задачей, а не поводом автоматически переделывать закрытые костры.

## Обязательные решения и сохранность

Только main; exact confirmation каждой записи и полный saved diff/content, после неоднозначного сбоя сначала GitHub. Малые самосогласованные пакеты, каждый файл <25000 UTF-8 bytes; новые permanent test files отдельно согласовать, existing tests не удалять массово. Документы менять по указанию владельца. Backup/refactor-0.9 не обновлять/не воссоздавать автоматически. fk070_packs/localStorage не очищать: backup кода не сохраняет пользовательские паки. Коротко по-русски, техническую отладку на владельца не перекладывать.

Без второго каталога/меню/monkey patches/адаптеров вокруг адаптеров. Unknown не cube; aliases требуют эквивалентности, не общей PNG. Сохранять source-ID reopen/owned/carried/icons/indexed repeats/shared dependencies без ownership transfer; PNG/form/slot/state/pose независимы, shared sheets без копирования/обрезки, dimensions/alpha/atlases/frame strips сохранить.

Chest/shulker whole-block facing удалён полностью: вращение жестом; chest open/double, ender без double, shulker open. Крышки сохранить; stem direction/amethyst growth face/UV стороны не удалять массово. Макет tablet/desktop отложен на другой чат, mobile/paper tokens сохранить. Полные mobs отложены, не недоделка голов. Будущий редактор скинов и поздняя примерка брони — план владельца, не готовая функция; player/head/hat UV/полный Steve sheet сохранить.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d, выпуски не смешивать. OLDCHAT19 final assistant reply исключён владельцем. OLDCHAT17 async PNG index/storage divergence/atlas heuristic/full GPU update — гипотезы, не доказанные блокеры. Ceiling-sign rotation suspicion снято. Сбои AI/коннектора не доказывают баг приложения. Перенос → совместная приёмка → чистка → runtime switch/FK_V/cache/удаление заменённого legacy после готовности.
