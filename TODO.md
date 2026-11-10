# TODO — оставшаяся работа после OLDCHAT32

Обновлено2026-11-10. Кодовая база перед docs-write3f2cf4fc785c171a58036bee06ddd8df4f93dab5. [x] означает сохранённый код, не полный CI/визуальную приёмку. CONTEXT/handoff первыми. Прежние модельные контракты сохраняются.

## Уже записано — не повторять

- [x] Compiled editor0a502af, material families adb5d5d, frames/history/PNG291b5d9, GPU reuse0f27ede; физическая чистка не завершена.
- [x] Double slabs a048519/b82838b со строгими validators/smooth stone side; items loader/generator/icons8cd50c9/de36127/449872f и generated atlas75 из3e698c4; observer b7bf780/6b649d4; signs c92aaa9/cave vines c3d8970/hanging8c3805b.
- [x] MERS8485bb4 без PBR, TGA diagnostics44a5f84, conduit UVbf90910 и expectations b89b4b5. Пользователь подтвердил conduit/MERS, не весь RGBA/export.
- [x] Banner family/resources50d12e1, groups3bcf213/da03234, snapshot dimensions d5a6145; bubble normalization337f753 без pumpkin_side.
- [x] Bubble groups833e3f9, pot/ghast groups bc0f118:18 ресурсов пузырей,23 рисунка горшка,4 стадии гаста.
- [x] Общий начальный ракурс восьми model keys41bf23b, не изменение геометрии/UV.
- [x] Usage/notes43dcfd2/f245aa6/a804a64/6726278: информационный блок над stage, отдельно от PNG, лишние file/shared lists из справки убраны.
- [x] Cauldron family7d37e29 и подписи воды0195317; исходные IDs/resources и независимость PNG/content сохранены.
- [x] Banner layers57a7e30/f50a901/eec565b:0–16, рисунок/цвет/move/remove preview. Миниатюры отдельно открыты.
- [x] Usage reuse8b8da8a/3f2cf4f, не постоянный cache и не измеренный benchmark.

## Ближайший законченный пакет

- [ ] Play/Pause существующих кадров: один кадр в секунду сверху вниз, после последнего первый, без JSON timing/order. Не подключать подготовку flipbook metadata как обязательную зависимость.
- [ ] Использовать fr/fi/setFrame, сохранить историю каждого кадра, обновление editor/model и полный вертикальный PNG в packCur.
- [ ] Остановка при смене объекта/slot, начале рисования, выходе/скрытии, смене/сбросе пака; реальные hooks tools/async, отсутствие устаревших callbacks и нескольких таймеров.
- [ ] Проверить цикл, Play/Pause, остановки, history, экспорт, отсутствие постоянного render loop. Код ещё не записан; последняя проверка OLDCHAT32 упала в обвязке, успешные тесты не заявлять.

## Ресурсы, дефекты и макет

- [ ] Миниатюры рисунков знамени; существующее управление слоями не повторять, новую палитру/цветные PNG не добавлять.
- [ ] Carried бамбука сверить семантически; не объявлять icon по имени/директории. Icons filter — адресный вход в ту же карточку, не второй каталог.
- [ ] MERS: получить результат существующей TGA диагностики и проверить decode/draw/history/Add/reopen/export с RGBA/subsurface alpha. Не требовать повторно оригинальный TGA через чат.
- [ ] Швы/белые линии/исчезающие поверхности: alpha/inflate/UV пока гипотезы, не global opaque/DoubleSide.
- [ ] Сквозная приёмка котла/families/aliases/source-ID/reopen/sign/hanging/cave-vines/borrowed, не повторное подключение.
- [ ] Пользовательский каталог после D и позднее повторный обход на пропущенные families. Общая часть PNG не автоматическое объединение.
- [ ] Масштаб маленьких объектов пока не менять.

## Сквозная приёмка и завершение

- [ ] Свежие compile/tests/coverage/inputValidation/полный preview-slice на конкретном SHA, не старые697/697 и не сумма локальных тестов из чата.
- [ ] Real PNG/TGA/WebGL/UV/alpha/Android, async/storage/import/limits/GPU cleanup.
- [ ] Find→form/state/resource→draw/undo/redo→Add→reopen→PNG/mcpack, owned/carried/icons/indexed repeats/dependencies.
- [ ] Профилировать задержки, не обещать ускорение от сворачивания/одного прохода без замеров.
- [ ] Удалять только подтверждённо заменённый legacy/HTML/exports, сохранить PNG/TGA loader/validators.

## Отложено

Версии/cache и перенос истории в архив не задерживают блоки/макет. Старые логи не удалять.1.0.0 — обсуждённая будущая версия, не установленная этим docs-only. Перед архивированием проверить ссылки/CI и сохранить действующие контракты. После блоков перед дальнейшей догрузкой items — планируемый глубокий аудит безопасности, не выполненный; docs/code-map.md пока не создана.

Full mobs/skin/body/armor/entities/дальнейшие items/cushion/tablet-desktop layout/IndexedDB/большие паки/user backup/PWA/offline/права — будущие этапы. Точные particles/smoke/PBR не обещаны.

## Доказательства и правила

В текущем docs-проходе приложение/Node/CI/браузер/WebGL не запускались. История и целевые модули прочитаны, полные diff a804a64/41bf23b сверены, не все diff/код. Пользовательское «все ок вроде» — ограниченная проверка тогдашнего UI; дальнейшая проверка отложена из-за интернета. Сейчас ничего проверять/присылать не нужно.

Только main, каждый внешний write с точным подтверждением полного пакета, затем saved diff/content и продолжение. Новые permanent tests отдельно согласовать, существующие не ослаблять. <25000 UTF-8 bytes/file. Бэкап/refactor-0.9/fk070_packs/localStorage не менять/не переносить/не очищать, не требовать чистки кэша. Ответы кратко по-русски с ясным действием владельца.
