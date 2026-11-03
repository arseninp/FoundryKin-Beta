# TODO — перенос моделей и технической основы

Обновлено 2026-11-03 по OLDCHAT20. Проверенный HEAD до документации: efb873044ce59c308bce2aaf11ba73c709d869bf. [x] означает записанный код, НЕ runtime/визуальную приёмку. Начать с CONTEXT/handoff.

## Текущая точка

- [ ] Изучить normalization/bindings/resolver/materials/controls жидкостей и подключить уже записанные water/lava к общему picker/срезу без повторного создания builders. level 0..7, default 0; PNG/state независимы.
- [ ] Проверить связку на pinned данных существующими средствами. Не называть uniform-height sample симуляцией течения или принятой Bedrock моделью.
- [ ] Вернуться к вопросу адаптивного макета tablet/desktop: editor/iframe/CSS/size consumers. Исследование не закончено, новая раскладка/редизайн не согласованы, mobile/paper tokens сохранить.

## Уже записано — не повторять

- [x] Materials/composite/canvas-GPU lifecycle/read-only preview/loader timeout-cache-retry.
- [x] Bed/sign/lava cauldron/auxiliary end_gateway; chest normal-trapped-ender-copper/double/static open; shulker sheets/directions/static candidate; banners resources/color/patterns/ominous.
- [x] Fruit+stem/budding amethyst/aquatic/propagule/kelp/emissive models.
- [x] Golem statues 4 stages/4 poses/sheets/source-waxed routes/parent cards/preview; головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon с geometry/sources/parent/source routes. Полные mobs отложены.
- [x] Eyeblossom одна card closed/open/cross-emissive_cross/glow; общий FKModelState/FKM/CSS; familyDefaults/plan.forms и independent form/slot/state, общий пункт Текстура/default sheets голов/статуй.
- [x] Decorated pot: 23 patterns + ordinary side, 4 независимые стороны в builder/resolver/общем picker, EN/RU и independent PNG.
- [x] Conduit: 6 resources/static active Java-reference candidate/resolver/shared picker activity-eye-wind, default inactive.
- [x] Controls вынесены в preview-controls.mjs, прежние определения удалены, root exports проверок сохранены.
- [x] Срез 29 source IDs: pot/conduit добавлены; НЕ cards/весь каталог. Основной editor не переключён; жидкости ещё вне среза.
- [x] Existing preview-slice workflow дополнен pot/conduit, без новых test files; результат Actions не подтверждён.
- [x] Water/lava builders + назначения 4 source IDs + existing library test (ожидание 112 builders, не coverage).

## Остаток и ограничения

- [ ] Получить свежий coverage/normalization/inputValidation/full compile на PIN; архивная сверка после жидкостей предварительно оставляет bell/player_head/bubble_column, не автоматическое согласование scope.
- [ ] Сохранить bindings/stages/indexed repeats/dependencies/aliases/forms/states/icons/carried/saved-ID/reopen/block-item icons. Unknown не cube.
- [ ] Bedrock PNG/UV potted azalea/reference/dragon placement-scale; gel alpha/stem tint/kelp sides-UV-TGA; pot patterns/conduit/liquids реальные изображения/render.
- [ ] Conduit animation/eye tracking и liquid slopes/falling/tint/overlays/timing отсутствуют; не объявлять обязательным новым scope без согласования. Fire geometry уже существует, player отдельный.
- [ ] Общий Find/editor/loaders, EN/RU/Shared textures/icon badges/design tokens, адаптивность после исследования.
- [ ] Player timing/order/pause при рисовании/export ленты/clock-compass demo отдельно от state; item icon UX согласовать. Полные entities/cushion/bell отложены.

## Приёмка и очистка

- [ ] Existing validate/tests/full compiler/CI и реальные PNG-TGA/Three/WebGL/Android/export; записанные workflow/mocks не прохождение.
- [ ] Проверить cards/source IDs/reopen/menu/forms/poses/PNG/frames и lifecycle/texture ownership/update/cleanup.
- [ ] Исторические гипотезы OLDCHAT17 воспроизводить отдельно (async PNG index, memory-storage save failure, atlas heuristic, full GPU update), не считать блокерами. Ceiling-sign rotation suspicion снято. Исключённую реплику OLDCHAT19 не возвращать в задачи.
- [ ] Принять draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame.
- [ ] После совместного успеха убрать ненужные/дубли; тесты разбирать индивидуально, без массового удаления.
- [ ] Лишь затем переключить основной runtime, синхронизировать FK_V/cache, удалить заменённый legacy.

Только main, малые самосогласованные пакеты, точное подтверждение и полный saved diff. Новые test files отдельно согласовать; <25000 UTF-8 байт на файл; backup/fk070_packs не трогать. Полные items/entities/IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы отдельные этапы.
