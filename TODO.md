# TODO — перенос и приёмка

Обновлено 2026-11-04. Проверенный HEAD до документации: f77e3c5ea585b28837697d4f4d4416f01fa0f6a5. [x] = записанный код, не runtime/визуальная приёмка. Начать с CONTEXT/handoff.

## Точка продолжения

- [x] Завершить конкретную чистку лишних направлений сундуков/шалкеров: builders/resolver/chest menu/test loops/labels. Whole-block facing не возвращать; модель вращается жестом. Крышки/double/UV сохранены.
- [x] e4db3d6/196fc69: существующие шалкеры выведены в common picker/preview, только open и independent PNG, 17 цветов отдельно, EN/RU; без facing и повторного переноса geometry/sources/resolver. Отклонённый черновик с направлением не восстанавливать.
- [x] e255fc2: записаны fixture/pinned shulker tests в existing model-library.test.mjs; старые тесты сохранены, новых файлов нет.
- [x] f77e3c5: исправлены два устаревших model-policy ожидания без изменения production rules; локально проходят все 9 тестов этого файла.
- [ ] Получить подтверждённый результат pinned shulker integration и общей цепочки на PIN existing средствами; сохранённый тест/workflow не доказывает успешный Actions.

## Уже записано — не повторять

- [x] Materials/composite/canvas-GPU lifecycle/read-only preview/loader limits; общий FKModelState/FKM/CSS/preview-controls без второй реализации.
- [x] Eyeblossom одна closed/open card/glow; parent cards голов/статуй/source routes/PNG-form-state независимы; dragon head без полного моба.
- [x] Pot 23 patterns+ordinary/4 sides/common picker; conduit 6 resources/static active/resolver/picker/default inactive.
- [x] Water/lava 4 assignments/level 0..7/default 0/resolver/common picker/EN-RU/срез; не flow simulator.
- [x] Chest resources/single-double/static open/resolver/common picker/11 source IDs/waxed canonical routes, ender без double.
- [x] Срез 61 SOURCE ID = прежние 29 + liquids 4 + chest 11 + shulker 17, не cards/весь каталог. Shulker geometry/sources/open resolver/UI/срез есть. Основной editor не переключён.
- [x] Existing workflow pot/conduit/liquids/chest checks; новых test files не добавлено.

Bed/sign/cauldron/auxiliary/banner/fruit-stem/budding amethyst/aquatic/propagule/kelp не переносить заново. Полные mobs не недоделка голов. Stem direction/growth face/UV стороны сохранить — не лишний поворот всего сундука.

## Доказательства локальных проверок

Syntax/272 изолированных state-PNG checks используют compiler stub. Shulker source/geometry fixture выполнен на существующих модулях и Three-mock для 17 цветов; пойманы 3 намеренные ошибки. Model-policy: до 7 pass/2 fail, после 9 pass/0 fail; cube-регрессии обнаруживаются. Не суммировать и не выдавать за full PIN compile/CI/WebGL/Android/export. Workflow не расширяли из-за близости к лимиту 25000 байт.

## Остаётся

- [ ] Fresh coverage/inputValidation/full PIN compile/validate/tests/CI; bell/player_head/bubble_column пока лишь архивный предварительный остаток, не новый scope.
- [ ] Реальные PNG-TGA/Three/WebGL/Bedrock UV-scale/Android/export. Проверить cards/source IDs/reopen/menu/forms/PNG/poses/frames/materials/texture ownership/update/cleanup.
- [ ] Potted azalea/reference UV/dragon placement-scale/gel alpha/stem tint/kelp sides-UV-TGA; pot/conduit/liquids/chests/shulkers rendering.
- [ ] Bindings/dependencies/indexed repeats/aliases/forms/states/icons/carried/block-item icons и saved-ID сохранность. Unknown не cube.
- [ ] Общий Find/editor/loaders/EN-RU/Shared textures/badges; player timing/order/pause/export strip/clock-compass demo отдельно от static state. Item icon UX/scope согласовать; полные entities/cushion/bell отложены.
- [ ] Приёмка draw/undo/redo/Add/reopen/PNG/mcpack/Android, async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame.
- [ ] Лишь после успеха индивидуальная чистка тестов/дублей, переключение runtime/FK_V/cache и удаление заменённого legacy.

Макет tablet/desktop — ДРУГОЙ чат, не текущая задача. Исторические OLDCHAT17 гипотезы воспроизводить отдельно; excluded reply OLDCHAT19 не источник багов, ceiling-sign rotation suspicion снято. Только main/малые пакеты/точное подтверждение/saved diff, <25000 bytes/file, новые test files отдельно согласовать; backup/fk070_packs не трогать.
