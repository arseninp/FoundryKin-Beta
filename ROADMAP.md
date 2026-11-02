# ROADMAP — перенос, проверка, очистка

Обновлено 2026-11-02. Кодовый HEAD: 4448dca87745ccf94203591952288a06d77eb01b. Доказательства CONTEXT, задачи TODO, контракты ARCHITECTURE. Не выпуск приложения.

## 1. Собрать модели и техническую основу

Продолжать недостающие модели вместе с source/inventory/bindings/materials/states/cards/saved-ID. Уже записанные materials/texture lifecycle, read-only preview slice, bed geometry/16 colour sources и sign geometry не создавать повторно. Следующее: review 4448dca по запросу владельца, затем листы пород/карточки табличек и оставшийся модельный scope.

Closed/open eyeblossom оставлять отдельными: объединение отменено в OLDCHAT16. Fruit+stem — отдельные карточки pumpkin/melon с сохранёнными вариантами; budding amethyst cards не сливать. Kelp A–D не рост; сохранять шесть ресурсов и animation definitions.

Unknown не превращать в cube; aliases/forms/states/stages/frames различать. Сохранять owned PNG, carried/icons, indexed repeats, saved routes и shared dependencies без ownership transfer. Sign/bed block entities не равны импорту всех entities; кровати уже имеют подключённые источники, таблички пока geometry-only. Entities/cushion/bell отложены. Scope согласовать до переключения.

## 2. Проверить собранный согласованный объём

Точечные проверки синтаксиса/diff/изменяемого поведения делать при каждом пакете. Общую кампанию compiler/CI/WebGL не ставить вместо переноса отсутствующих частей. После сборки — полный закреплённый вход через существующие coverage/inputValidation/compile/validate/tests; свежего coverage нет. Workflow preview-slice/95 scenarios существует, актуальное прохождение не подтверждено.

Реальные PNG/TGA/UV/Three/WebGL, gel alpha, potted azalea/reference models, stem tint, kelp; карточки/источники/reopen. Отдельный read-only preview уже записан, его наличие не доказывает Pages/браузерную приёмку и не заменяет editor.

## 3. Довести и принять новый редактор

Общий Find/editor объект и loaders, независимые PNG и geometry state/forms/stages/frames. EN/RU, Shared textures, role-based icon badges, растущие подписи/design tokens без редизайна бумаги. Плеер отдельно от state: timing/order, pause при рисовании, export ленты; clock/compass demo cycle. UX item icon согласовать.

Принять Android draw/undo/redo/Add/reopen/PNG/mcpack, async targets/storage transactions/import limits/dimensions/alpha/cache/URL lifecycle и переключения pack/slot/frame/language/theme.

## 4. Очистить после успеха

После совместной успешной проверки удалить ненужные/дублирующие/заменённые части. По отдельному разбору оценить существующие тесты, без массового удаления и обещаний автоматической очистки. Только после готовности/приёмки новой основы удалить дорефакторный runtime и синхронизировать HTML/FK_V/cache. До этого сохранить рабочий legacy.

## Рабочий темп и дальнейшие этапы

Небольшие согласованные пакеты, точное системное подтверждение каждой записи, затем полный diff/контент и самостоятельное продолжение следующей работы. После обрыва сначала GitHub. Новые постоянные test files без отдельного согласования не добавлять. Только main; файлы <25000 UTF-8 байт; backup и fk070_packs не трогать. Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
