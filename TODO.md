# TODO — перенос моделей и технической основы

Обновлено 2026-11-03. Проверенный HEAD до записи: 40c82f0e6e3be884f73d0ee61bf8a8a385e5164d. [x] — записанный код, НЕ runtime/визуальная приёмка. Начать с CONTEXT/handoff.

## Текущая точка

- [ ] Ответить на уже сформулированный вопрос владельца об адаптивном макете: прочитать editor/iframe/preview CSS/ограничения/size consumers и установить, что сделано для планшета/компьютера. Не просить повторять вопрос. Новая раскладка/breakpoints/редизайн не согласованы; сохранить телефонный сценарий и paper/design tokens.
- [ ] После обсуждения продолжить согласованные модели/основу, не начинать полных мобов и не повторять выполненное.

Последняя реплика ассистента OLDCHAT19 исключена владельцем. Она не порождает задачу/блокер и не подменяет вопрос о макете.

## Уже записано

- [x] Materials/composite/canvas/GPU lifecycle, read-only preview, loader timeout/cache/retry.
- [x] Bed geometry/16 sheets; sign geometry/листы пород; lava_cauldron content и auxiliary end_gateway/lava_cauldron.
- [x] Chest normal/trapped/ender/медные sources/double/static open, ender без double; shulker sheets/шесть направлений/static open candidate; banner sources/color/ordered patterns/ominous.
- [x] Статуи голема: четыре позы/общие sheets четырёх стадий окисления/source и waxed routes/материнские cards/preview menu. Глаза/цветок автоматически не добавлены.
- [x] Skeleton/wither skeleton/creeper/zombie/piglin головы: geometry/sources/parent cards/старые source-ID routes.
- [x] Dragon head/jaw без тела, общий textures/entity/dragon/dragon, parent ender_dragon/preview, без новой PNG головы.
- [x] Одна карточка глазоцвета closed/open с cross/emissive_cross, обе records/resources/glow/routes. Старый запрет объединения отменён.
- [x] Переработан существующий FKModelState, единые FKM/CSS извлечены без второй реализации, themed picker подключён к preview.
- [x] familyDefaults, раздельные request.form/slot/state, plan.forms, согласованный fruit/stem consumer.
- [x] Общий пункт Текстура, PNG/form/pose/state независимы, default bindings.sheet для model view голов/статуй, загрузка выбранной PNG вне модели.
- [x] Срез 27 source IDs, не число cards/не весь каталог. Четыре golem IDs — невощёные стадии; основной editor не переключён.

Предыдущие fruit+stem/budding amethyst/aquatic/propagule/kelp/emissive models не делать заново. Полные существа/скелет/развёртки отложены, НЕ недоделка этапа голов. Rotation/facing меню голов/статуй не добавлять, есть жест. Позы статичны, не плеер.

## Остаток технической основы

- [ ] Проверить bindings/stages/indexed repeats/dependencies/aliases/forms/states/icons/carried/saved-ID/reopen и block↔item icons в согласованном объёме.
- [ ] Bedrock PNG/UV potted azalea/reference models/dragon head placement/scale; gel alpha, stem tint, kelp sides/UV/TGA. A–D не рост.
- [ ] Остальные block-entity adapters, decorated pot patterns, active conduit, fire/player scope согласовать. Полные entities/cushion/bell отложены. Unknown не cube.
- [ ] Общий Find/editor/loaders, EN/RU, Shared textures/icon badges, подписи/design tokens; адаптивную компоновку определить после исследования layout.
- [ ] Player отдельно от state: timing/order/pause при рисовании/export ленты/clock-compass demo; UX item icon согласовать.

## Приёмка и очистка

- [ ] Полный PIN candidate/coverage/inputValidation/compile и existing validate/tests/CI. Workflow не означает успешный Actions, свежего coverage нет.
- [ ] Реальные PNG/TGA/Three/WebGL, меню/cards/source routes/forms/poses/PNG/frames, Android/editor/export/lifecycle. Исторические mocks не заменяют приёмку.
- [ ] Исторические возможные проблемы OLDCHAT17 воспроизвести отдельно: async PNG index, память/storage при save failure, imageFrames atlas heuristic, полное GPU update. Не доказанные блокеры; ceiling sign rotation suspicion снято. Не смешивать с исключённой репликой OLDCHAT19.
- [ ] Принять draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle и language/theme/pack/slot/frame.
- [ ] После успеха убрать ненужные/дублирующие части, тесты разбирать индивидуально без массового удаления.
- [ ] Только после готовности/приёмки переключить основной runtime, синхронизировать FK_V/cache и удалить заменённый legacy.

Только main, малые пакеты, точное подтверждение каждой записи и полный saved diff/контент. Новые test files отдельно согласовать. Файлы <25000 UTF-8 байт; backup/fk070_packs не трогать. Полные items/entities, IndexedDB, большие паки/пользовательский backup, PWA/offline/права на ресурсы — отдельные этапы.
