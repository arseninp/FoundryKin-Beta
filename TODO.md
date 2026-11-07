# TODO — подключение моделей и общая приёмка

Обновлено 2026-11-07. Кодовый HEAD перед этим обновлением документации: 989bba4db0f6c999ce7d2efa2c5eee28099fb761. [x] означает записанный код/указанный локальный результат, не визуальную приёмку приложения. Начать с актуального CONTEXT; прежний handoff и прочие документы могут содержать старые числа. Подробные прежние задачи — 5b083a7 и e1b4cd2; архитектурные ограничения сохраняются.

## Точка продолжения для нового чата

- [x] Последний пакет: moss_carpet, mangrove_roots, muddy_mangrove_roots, dirt_with_roots, podzol, mycelium, crimson_nylium, warped_nylium; EN/RU, только preview-config.mjs, полный saved diff 989bba4 проверен. Не подключать повторно.
- [x] REVIEW_IDS содержит 228 исходных ID. Это не число уникальных builders/карточек и не полное покрытие каталога. Все ID/SHULKER_BOXES/TEXT оставлены в одном preview-config.mjs по решению владельца; preview-review-ids.mjs НЕ создавался.
- [x] Локальная проверка списка до записи: 220 → 228 ID, порядок прежних записей, отсутствие дублей, Object.freeze. Это не full compile/coverage/WebGL.
- [ ] Выполнить анализ актуального кода в новом чате со свежим контекстом, как планирует владелец. Сверять реальные assignment/builder/resources/controls и REVIEW_IDS; не дублировать готовые модели и не подменять задачу новой инфраструктурой или бесконечным дроблением файлов.
- [ ] Получить подтверждённый результат existing coverage/inputValidation/full PIN compile/tests/Actions. В прежней документации manifest содержал 1275 block IDs; это не свежий вычисленный отчёт. Полный остаток каталога здесь не посчитан.

## Последние сохранённые подключения

- [x] 1ad0456: brown_mushroom_block, red_mushroom_block, mushroom_stem; EN/RU.
- [x] 79d6527: nether_wart_block, warped_wart_block, shroomlight; EN/RU.
- [x] d969a04: moss_block, pale_moss_block; EN/RU.
- [x] 49c21dc: vine, glow_lichen, sculk_vein, resin_clump, waterlily, leaf_litter, frog_spawn; EN/RU. Существующие decal/rail — статичные плоскости, не новые стороны крепления/плотность/анимация.
- [x] 989bba4: восемь ID из точки продолжения, 16 подписей EN/RU. Прежние подключения/подписи сохранены; модели/контролы/PNG/цвет и структура файлов не менялись.
- [ ] Повторно проверить актуальные контролы stage_cross/crop и обратимый pot toggle azalea/potted_azalea вместе с их регрессиями. По предшествующей передаче они записаны и локально проверялись, но нового полного прогона здесь нет. PNG и state/form должны оставаться независимыми.

## Исторически сохранено до 2026-11-05

- [x] c3cb01e: bubble_column — 18 named owned roles и регрессии, source paths/variants сохранены, pumpkin_side не используется как роль модели; assignment/builder не добавлен.
- [x] e076117/c5134e5/8116bb5/3fea102: fire/soul_fire — восемь плоскостей, unlit/cleanup, общий A/B picker/PNG, EN-RU/срез, resolver default primary/early validation. StageCount не менялся.
- [x] 2b7d82c/d578dc8/05f7a62: оба костра — unlit только пламя, geometry/UV сохранены, lit/PNG/EN-RU/срез и expanded pinned checks. Статичный кодовый пакет закрыт, не делать костры снова первой задачей без воспроизводимого дефекта.
- [x] Старый срез 67 ID расширен; актуальное число — 228. Конфигурация по-прежнему в preview-config.mjs, image helpers — preview-images.mjs.
- [x] По старой передаче: resource-variants 9/9, fire-models 8/8, light-models 7/7; регрессии чувствительны к подменам. Это исторические результаты, не новый прогон на HEAD 989bba4.
- [x] По старой передаче: связанный стенд registry/controls/materials/campfire на четырёх сверенных по SHA модулях, 12 state/PNG сочетаний, 2 defaults, 6 invalid-state случаев, material update/dispose/borrowed textures. Синтетические fixtures/recording Three, не PIN compile/WebGL. Counts не суммировать.

## Общие проверки, не повторный перенос готовых моделей

- [ ] Запустить полный набор записанных тестов, включая pinned shulker/bell/player/fire/campfire и новые контролы. Наличие workflow/тестов не равно успешному исполнению. Полный набор и браузерная проверка последних подключений в этом этапе не запускались.
- [ ] Реальные PNG/TGA/Three-WebGL/Bedrock UV-scale-alpha/Android/export, включая огонь и костры. Дым и animation player — отдельный scope, не заявленные возможности статичного preview.
- [ ] Potted azalea UV/dragon placement-scale/gel alpha/stem tint/kelp sides-UV-TGA; pot/conduit/liquids/chests/shulkers/bell appearance.
- [ ] Проверить source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases/forms/states, independent PNG и GPU texture ownership/update/cleanup.
- [ ] Довести общий Find/editor/loaders/EN-RU/Shared textures/badges; animation timing/order/pause/export strip/clock-compass и item icon UX отдельно от static state.
- [ ] Проверить актуальное состояние интеграции основного редактора. По прежней передаче editor НЕ переключён, последние подключения меняли только конфиг. Принять draw/undo/redo/Add/reopen/PNG/mcpack/Android/async/storage/import/dimensions/alpha/cache/URL lifecycle/language-theme-pack-slot-frame.
- [ ] Только после готовности — индивидуальная чистка дублей/тестов, runtime switch/FK_V/cache и удаление заменённого legacy. Просьба убрать ненужные файлы не разрешает удалять используемый код заранее.

## Отложенное владельцем

- [ ] Bubble_column: референсы 1000053516.jpg и 1000053518.jpg из прежнего чата, в репозиторий не загружены. Отдельные пузырьки; траектория со слов владельца — над магмой спирально вниз, над soul sand прямо вверх. Проверить geometry/UV/alpha/Fancy Bubbles; роли текстур не доказывают geometry/animation. Builder/assignment/preview отсутствуют по прежней передаче; не делать cube fallback.
- [ ] Полноценный skin editor в карточке Игрок, позже тело для примерки брони. Сохранить player/head/hat UV/полный Steve sheet/source routes; фиктивное тело не показывать.
- [ ] Полные mobs/entities/cushion/большие items этапы отдельно; полные мобы не недоделка перенесённых голов. Макет tablet/desktop — другой чат, mobile/paper tokens сохранять.

Готовые bed/sign/cauldron/auxiliary/banner/fruit-stem/budding amethyst/aquatic/propagule/kelp/eyeblossom/pot/conduit/головы/статуи/liquids/chests/shulkers/bell/player_head/fire/campfires повторно не переносить. Chest/shulker facing не возвращать; stem direction/growth face/UV стороны сохранить. OLDCHAT19 final reply исключён, OLDCHAT17 гипотезы не доказанные баги, ceiling-sign suspicion снято. Только main/exact confirmation/saved diff; после коммита сразу готовить следующий этап, но следующую запись согласовывать отдельно. Прежний лимит <25000 bytes/file не повод дробить preview-config.mjs: 2026-11-07 владелец решил оставить один файл до реальной проблемы с полным чтением. Новые permanent test files отдельно согласовать; документы менять по указанию владельца, обновление для переноса запрошено. Backup/fk070_packs/localStorage не трогать.
