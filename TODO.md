# TODO — перенос моделей и технической основы

Обновлено 2026-11-02. Кодовый HEAD перед документальной записью: 4448dca87745ccf94203591952288a06d77eb01b. [x] — записанный код, не runtime/визуальная приёмка. История и правила — CONTEXT.md.

## Ближайшая работа

- [ ] По текущему запросу проверить качество последнего кодового коммита 4448dca: sign geometry, UV/placements, lifecycle/errors, регистрация и существующий тест. Полный diff прочитан, review не завершён; ничего повторно не записывать.
- [ ] Подключить проверенные источники/листы пород/карточки табличек с owned sheets, icons и saved-ID routes. Не выдавать geometry-only пакет за подключённые карточки.
- [ ] Продолжить недостающие модели и техническую основу по реальному закреплённому входу; не заменять перенос расширением тестовой инфраструктуры.

## Уже записано после OLDCHAT15

- [x] df1fcab: preview material instance lifecycle и составные сцены.
- [x] f03acbe: canvas textures и GPU lifecycle.
- [x] b0e163d: отдельные preview.html/preview.mjs для read-only среза 17 исходных ID.
- [x] 860e977: workflow preview-slice/95 geometry scenarios; прохождение не подтверждено.
- [x] 52cbb88/e776d96: существующие тестовые ожидания и userData CI; свежий зелёный CI не подтверждён.
- [x] e64ef13: timeout/cache/retry loader.
- [x] eb98909/ae5cc41: полная модель bed и источники 16 цветных кроватей; bed→red_bed, light_gray→silver.
- [x] 4448dca: sign geometry candidate/registration, existing library test expects 105 types.

Объединение closed/open eyeblossom отменено владельцем в OLDCHAT16. Оставить отдельными; не возвращать в очередь. Предыдущие модели, fruit+stem, budding amethyst, aquatic/propagule/kelp и emissive plants уже записаны; подробности CONTEXT.

## Остаток технической основы

- [ ] Bindings/stages/indexed repeats/dependencies, aliases/forms/states/icons/carried/saved-ID и reopening.
- [ ] Bedrock PNG/UV азалии/reference-моделей, alpha гелей, stem tint, kelp sides/UV/TGA; A–D не рост.
- [ ] Auxiliary end_gateway/lava_cauldron, block↔item icons, оставшиеся block-entity adapters; кровати не считать неподключёнными целиком.
- [ ] Decorated pot patterns, active conduit, fire/player scope — согласовать необходимый объём до переключения. Entities/cushion/bell отложены. Unknown не заменять cube.
- [ ] Общий Find/editor/loaders, EN/RU, Shared textures/icon badges, подписи/design tokens без редизайна бумаги.
- [ ] Player отдельно от state: timing/order, pause при рисовании, export ленты, clocks/compass demo; UX item icon согласовать.

## После сборки согласованного объёма

- [ ] Совместный полный PIN candidate/coverage/inputValidation/compile и существующие validate/tests/CI. Использовать существующий аудит; свежих counts нет.
- [ ] Реальные PNG/TGA/Three/WebGL, карточки и источники, Android, editor/export, async/storage/import/dimensions/alpha/cache/URL lifecycle.
- [ ] Принять draw/undo/redo/Add/reopen/PNG/mcpack и переключения языка/темы/пака/слота/кадра.
- [ ] После успеха удалить ненужные/дублирующие части; существующие тесты разобрать отдельно, без массового удаления.
- [ ] Только после готовности/приёмки новой основы переключить основной runtime, синхронизировать FK_V/cache и удалить заменённый legacy.

Точечные проверки сопровождают перенос и не требуют откладывать его до всеобщей тестовой кампании. Малые согласованные пакеты; после проверки записи самостоятельно продолжать следующий шаг. Каждая запись — отдельное точное подтверждение и сверка полного diff. Новые постоянные test files без отдельного согласования не добавлять. Только main, файлы <25000 UTF-8 байт; backup/fk070_packs не трогать. Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
