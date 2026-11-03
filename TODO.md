# TODO — перенос моделей и технической основы

Обновлено 2026-11-03. Кодовый HEAD перед документальной записью: d7fb21715a633ccd61a4caf7ca78373e1289aa2a. [x] означает записанный код, не runtime/визуальную приёмку. История и границы доказательств — CONTEXT.md.

## Ближайшая работа

- [ ] Подключить статуи медного голема к существующим entity-листам четырёх степеней окисления, без копирования PNG, с сохранением исходных ID/ресурсов/отдельных стадий. Геометрия standing/sitting/running/star уже записана d7fb217, не повторять.
- [ ] По источнику выяснить нужность слоя глаз для статуи; не подключать автоматически всё из entity. Геометрию впоследствии переиспользовать для entity голема без второй копии.
- [ ] Продолжить оставшиеся модели/техническую основу по закреплённому входу; общий аудит/техчистку не ставить вместо переноса.

## Уже записано

- [x] Preview material/composite lifecycle, canvas/GPU textures, отдельный read-only срез 17 ID, loader timeout/cache/retry; workflow и существующие CI fixes. Успешный CI не подтверждён.
- [x] Полная bed geometry и 16 цветных источников/routes.
- [x] 4448dca/f1d0922: sign geometry и собственные листы пород; больше не geometry-only.
- [x] 8f6db92/2c2773a: lava_cauldron content и общий auxiliary вход end_gateway/lava_cauldron.
- [x] 8bf072d/6be7c3c/1cc08cb: chest geometry, normal/trapped/ender sources и восемь медных ID.
- [x] ec2a23c/9e0b694: chest state.double и static state.open; ender без double.
- [x] af0a740/881e567/f76a52e: shulker_box geometry, все цветные/неокрашенный sources, шесть направлений, static open candidate.
- [x] d4975ed/ddbf7a3/7fcbd37/0ab44ac: banner geometry/sources, color/pattern composition и ominous sheet mode.
- [x] d7fb217: четыре позы статуи голема и регистрация, пока без источников/карточек.

Предыдущие модели/fruit+stem/budding amethyst/aquatic/propagule/kelp/emissive plants не начинать заново. Closed/open eyeblossom оставлять отдельными. Статические состояния не равны плееру/меню основного редактора.

## Остаток технической основы

- [ ] Bindings/stages/indexed repeats/dependencies, aliases/forms/states/icons/carried/saved-ID/reopening и block↔item icons.
- [ ] Bedrock PNG/UV potted azalea/reference-моделей, alpha гелей, stem tint, kelp sides/UV/TGA; A–D не рост.
- [ ] Остальные block-entity adapters; decorated pot patterns, active conduit, fire/player scope согласовать до переключения. Полные entities/cushion/bell отложены. Unknown не заменять cube.
- [ ] Общий Find/editor/loaders, EN/RU, Shared textures/icon badges, подписи/design tokens без редизайна бумаги.
- [ ] Player отдельно от state: timing/order, pause при рисовании, export ленты, clocks/compass demo; UX item icon согласовать.

## После сборки согласованного объёма

- [ ] Полный PIN candidate/coverage/inputValidation/compile и существующие validate/tests/CI. Свежих counts нет, второй аудит не создавать.
- [ ] Реальные PNG/TGA/Three/WebGL, UV, карточки/источники, Android/editor/export и lifecycle.
- [ ] Воспроизвести ВОЗМОЖНЫЕ проблемы OLDCHAT17: async PNG target по индексу; память/storage при ошибке сохранения; imageFrames atlas heuristic; лишнее полное GPU update. Это не подтверждённые дефекты и не текущие блокеры. Подозрение rotation ceiling sign снято.
- [ ] Принять draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle и переключения языка/темы/пака/слота/кадра.
- [ ] После успеха удалить ненужные/дублирующие части; существующие тесты разобрать отдельно без массового удаления.
- [ ] Только после готовности/приёмки переключить основной runtime, синхронизировать FK_V/cache и удалить заменённый legacy.

Малые согласованные пакеты с точечными проверками; каждая запись требует отдельного точного подтверждения и сверки полного diff. После сверки самостоятельно начинать следующий шаг. Новые постоянные test files — только с отдельным согласованием. Только main, файлы <25000 UTF-8 байт; backup/fk070_packs не трогать. Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
