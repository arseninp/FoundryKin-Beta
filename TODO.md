# TODO — следующие модели и общая приёмка

Обновлено 2026-11-05. Кодовый HEAD перед документацией: 05f7a62f42a021b2c67d0cfbd3c87515db428aa6. [x] означает записанный код/указанный локальный результат, не визуальную приёмку всего приложения. Начать с CONTEXT/handoff. Подробные прежние задачи — 5b083a7 и e1b4cd2; архитектурные ограничения сохраняются.

## Точка продолжения для нового чата

- [x] Закрыть согласованный статичный пакет campfire/soul_campfire в отдельном preview: builder/пламя unlit/брёвна Lambert, общий lit picker/default true, independent PNG, source IDs/EN-RU. Не ставить повторную реализацию или подключение костров первой задачей нового чата.
- [ ] Перейти к следующему согласованному объекту/группе, сначала сверив уже существующие assignment/builder/resources. Не дублировать модели и не заменять работу новым аудитом/бесконечным дроблением файлов.
- [ ] Получить результат existing coverage/inputValidation/full PIN compile/tests/Actions. В manifest 1275 block IDs; ручная сверка не является полным вычисленным покрытием.

## Сохранено в этом разговоре

- [x] c3cb01e: bubble_column — 18 named owned roles и регрессии, source paths/variants сохранены, pumpkin_side не используется как роль модели; assignment/builder не добавлен.
- [x] e076117/c5134e5/8116bb5/3fea102: fire/soul_fire — явная сборка восьми плоскостей, unlit/cleanup, общий A/B picker/PNG, EN-RU/срез, resolver default primary/early validation. StageCount не менялся.
- [x] 2b7d82c/d578dc8/05f7a62: оба костра — unlit только пламя, старые geometry/UV сохранены, lit/PNG/EN-RU/срез и расширенные pinned checks.
- [x] REVIEW_IDS = 67 source IDs, не cards/полный каталог; конфигурация в preview-config.mjs, image helpers в preview-images.mjs, прежние экспорты preview.mjs сохранены.
- [x] Локальные полные resource-variants 9/9, fire-models 8/8, light-models 7/7; новые регрессии чувствительны к установленным подменам.
- [x] Дополнительный связанный локальный стенд на production registry/controls/materials/campfire builder (4 модуля сверены по SHA): 12 state/PNG сочетаний, 2 defaults, 6 invalid-state случаев, material update/dispose/borrowed texture checks. Синтетические fixtures/recording Three, не PIN compile/WebGL. Counts не суммировать.

## Общие проверки, не повторный перенос костров

- [ ] Подтверждённый запуск записанных pinned shulker/bell/player/fire/campfire tests; наличие workflow/тестов не равно успешному исполнению.
- [ ] Реальные PNG/TGA/Three-WebGL/Bedrock UV-scale-alpha/Android/export, включая огонь и костры. Дым и animation player — отдельный scope, не заявленные возможности статичного preview.
- [ ] Potted azalea UV/dragon placement-scale/gel alpha/stem tint/kelp sides-UV-TGA; pot/conduit/liquids/chests/shulkers/bell appearance.
- [ ] Проверить source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases/forms/states, independent PNG и GPU texture ownership/update/cleanup.
- [ ] Довести общий Find/editor/loaders/EN-RU/Shared textures/badges; animation timing/order/pause/export strip/clock-compass и item icon UX отдельно от static state.
- [ ] Подключить новый путь к основному редактору и принять draw/undo/redo/Add/reopen/PNG/mcpack/Android/async/storage/import/dimensions/alpha/cache/URL lifecycle/language-theme-pack-slot-frame. Сейчас editor НЕ переключён.
- [ ] Только после готовности — индивидуальная чистка дублей/тестов, runtime switch/FK_V/cache и удаление заменённого legacy. Просьба убрать ненужные файлы не разрешает удалять используемый код заранее.

## Отложенное владельцем

- [ ] Bubble_column: референс — скриншоты 1000053516.jpg и 1000053518.jpg текущего чата, в репозиторий не загружены. На кадрах отдельные пузырьки; траектория со слов владельца — над магмой спирально вниз, над soul sand прямо вверх. Проверить геометрию/UV/alpha/режим Fancy Bubbles; роли текстур не доказывают geometry/animation. Builder/assignment/preview отсутствуют; не делать cube fallback.
- [ ] Полноценный skin editor в карточке Игрок, позже тело для примерки брони. Сохранить player/head/hat UV/полный Steve sheet/source routes; фиктивное тело не показывать.
- [ ] Полные mobs/entities/cushion/большие items этапы отдельно; полные мобы не недоделка перенесённых голов. Макет tablet/desktop — другой чат, mobile/paper tokens сохранять.

Готовые bed/sign/cauldron/auxiliary/banner/fruit-stem/budding amethyst/aquatic/propagule/kelp/eyeblossom/pot/conduit/головы/статуи/liquids/chests/shulkers/bell/player_head повторно не переносить. Chest/shulker facing не возвращать; stem direction/growth face/UV стороны сохранить. OLDCHAT19 final reply исключён, OLDCHAT17 гипотезы не доказанные баги, ceiling-sign suspicion снято. Только main/exact confirmation/saved diff/<25000 bytes/file, новые permanent test files отдельно согласовать; документы только по указанию владельца, backup/fk070_packs не трогать.
