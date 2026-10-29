# TODO — закрыть блоковый этап

Checkpoint: 07caecd, 2026-10-29. Работать в main, backup не менять без запроса. [x] — наличие кода/targeted проверки, не приёмка runtime.

## Первым делом

- [ ] Сверить HEAD и необходимые исходники, не читать гигантские чаты целиком.
- [ ] Запустить node tools/validate.mjs, существующие tests и coverage на закреплённых данных; не поручать владельцу и не заявлять запуск без среды.
- [ ] Пересчитать карту. 981/51/243 — арифметический ориентир от прежнего baseline, не свежий полный compile.
- [ ] Разделить syntax errors, incomplete coverage, реальные потери ресурсов, CI, WebGL и export acceptance. Не создавать ещё один отчётный helper.

## Записано, но не подключено к HTML

- [x] Compiler/access/preview/registry и 30 типов построителей.
- [x] Closed door, amethyst growth, unpotted azalea bindings.
- [x] Java-reference potted azalea candidate и geometry tests.
- [ ] Bedrock PNG/UV review горшечной азалии, регистрация, объявление pot/soil ресурсов и выбор формы. Не обходить resource ownership в preview.
- [ ] Полный каталог/CI/Three/WebGL текущей точки не подтверждены.

## Модели и ресурсы блоков

- [ ] Standing/wall/hanging таблички (39 записей старой карты) перенести в новом каркасе в рамках БЛОКОВ, не откладывать на entities.
- [ ] Bamboo family и росток, pale moss carpet, поршни, repeater/comparator, redstone torch: geometry + assignments + roles + states.
- [ ] Разобрать прежние 243 unresolved по классам: там есть другие специальные объекты, растения, bed, мебель, порталы, культуры. Unknown не получает cube по умолчанию.
- [ ] Сохранять принятые геометрию/UV; аналоги пород/цветов/окисления исправлять классом.
- [ ] Проверить aliases/forms/states/icons/carried и последовательности вариантов; старые IDs продолжают открываться.
- [ ] Нормализовать фронт lit-печей, не терять анимацию и альтернативные ресурсы.
- [ ] Проверить весь PNG inventory и item↔block icon links; существование пути не доказывает верный role/UV.
- [ ] Auxiliary end_gateway/lava_cauldron явно включить или исключить с причиной. Проверять hashes и совместимость family plan/state groups на полном candidate.

## Интеграция

- [ ] Создать отдельную проверяемую страницу перенесённого среза: unsupported объекты помечены, не подменены кубами. Срез не заменяет полного конечного каталога.
- [ ] До переключения основного app закрыть весь scoped block catalog и полный normalize→compile→access→preview→registry путь.
- [ ] Новый Find/editor и loader; snapshots и editor используют одну модель.
- [ ] Общая state panel, icon badges, Shared textures, EN/RU, растущие подписи и общие стили без редизайна светлой темы.
- [ ] Плеер отдельно от состояний: flipbook order/timing, пауза при рисовании, вся лента в экспорте.
- [ ] Saved-ID openTexture, storage transactions, async target binding, исходные размеры/альфа и import limits.
- [ ] Настоящий Three/WebGL/Android: draw/undo/redo→Add→reopen→PNG→mcpack; Back, язык, тема, pack/slot/frame switching.
- [ ] После приёмки переключить HTML, синхронизировать FK_V/cache versions и удалить заменённый legacy runtime.

## После блоков

Полные items, затем entity/block-entity adapters. Все будущие entity данные заранее не нужны: отдельный source fixture с геометрией/материалами/текстурами/вариантами. IndexedDB, большие паки, backup пользовательских данных, PWA/offline и права на ресурсы — отдельные задачи.
