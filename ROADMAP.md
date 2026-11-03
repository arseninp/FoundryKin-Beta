# ROADMAP — перенос, проверка, очистка

Обновлено 2026-11-03. Кодовый HEAD перед документальной записью: d7fb21715a633ccd61a4caf7ca78373e1289aa2a. Доказательства CONTEXT, задачи TODO, контракты ARCHITECTURE. Не выпуск приложения.

## 1. Собрать модели и техническую основу

Продолжать недостающие модели вместе с source/inventory/bindings/materials/states/cards/saved-ID. Уже записаны materials/textures lifecycle, read-only preview slice, bed sources, sign geometry/sheets, auxiliary вход/lava cauldron, сундуки с медной/двойной/open формой, шалкеры с цветами/open, banner geometry/sources/composition/ominous. Не повторять выполненное.

Текущая точка: четыре позы статуи медного голема записаны d7fb217; дальше подключить существующие entity-листы окисления без копирования PNG. Нужность глаз проверить отдельно. При будущем переносе entity голема переиспользовать геометрию, не дублировать. Полный entity adapter этим не завершён.

Closed/open eyeblossom раздельны. Pumpkin/melon — отдельные cards с соответствующим fruit+stem, вариантами/ID/PNG. Budding amethyst cards не сливать. Kelp A–D не рост, сохранить шесть ресурсов/animation definitions.

Unknown не заменять cube; aliases/forms/states/stages/frames различать. Сохранять owned PNG/carried/icons/indexed repeats/saved routes/shared dependencies без ownership transfer. Полные entities/cushion/bell отложены; scope согласовать до переключения.

## 2. Проверить собранный согласованный объём

Точечные syntax/diff/behaviour checks сопровождают пакеты. Общий аудит/техчистку/расширение CI не ставить вместо переноса. После сборки — полный PIN вход через существующие coverage/inputValidation/compile/validate/tests; свежего coverage нет. Workflow preview-slice/95 scenarios существует, актуальное прохождение не подтверждено.

Проверить реальные PNG/TGA/UV/Three/WebGL, карточки/источники/reopen, gel alpha/potted azalea/reference models/stem tint/kelp, новые block entities и состояния. Возможные проблемы OLDCHAT17 воспроизвести отдельно: async PNG target, память/storage, frame heuristic, стоимость полного texture update. Не объявлять их доказанными; ceiling sign rotation suspicion снято.

## 3. Довести и принять новый редактор

Общий Find/editor/loaders и независимые PNG/state/forms/stages/frames. EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги. Плеер отдельно от state: timing/order, pause при рисовании, export ленты; clock/compass demo. Static open/pose не равны плееру. UX item icon согласовать.

Принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async targets/storage transactions/import limits/dimensions/alpha/cache/URL lifecycle и переключения pack/slot/frame/language/theme. Отдельный preview не заменяет рабочий editor.

## 4. Очистить после успеха

После успешной совместной проверки удалить ненужные/дублирующие/заменённые части. Существующие тесты разбирать отдельно, без массового удаления. Только после готовности/приёмки удалить дорефакторный runtime и синхронизировать HTML/FK_V/cache; до этого сохранить рабочий legacy.

## Рабочий темп и дальнейшие этапы

Малые пакеты, точное системное подтверждение каждой записи, затем полный diff/контент и самостоятельное начало следующего шага. После обрыва сначала GitHub. Новые постоянные test files без отдельного согласования не добавлять. Только main; файлы <25000 UTF-8 байт; backup/fk070_packs не трогать. Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
