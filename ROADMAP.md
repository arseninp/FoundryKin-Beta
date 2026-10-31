# ROADMAP — завершение моделей и интеграция

Обновлено 2026-10-31. Проверенный HEAD 5c5f9f4. Контекст/доказательства — CONTEXT; задачи — TODO; контракты — ARCHITECTURE. Это не выпуск приложения.

## 1. Восстановить целостность последнего пакета

5c5f9f4 содержит геометрию/назначения хоруса, но в utility-parts.mjs случайно вклеен текст dependencies.mjs с заголовками path/content. Настоящая зависимость chorus stem и часть согласованных тестов не записаны. Исправить конкретное повреждение, восстановить полный пакет и проверить сохранённые файлы/цепочку normalize→dependencies→preview→build. Не продолжать поверх синтаксически повреждённого модуля и не откатывать весь рефакторинг без оснований.

## 2. Закончить модельный scope по реальным данным

Уже записаны roots, cube states, composter/scaffolding, piston head backs, mushroom indexed variants, cage spawner/vault. Грибы не начинать заново; хор не считать готовым до пункта 1. Сохранять принятую geometry/UV, paths/carried/icons, исходные индексы/повторы и old-ID routes.

Использовать существующий coverage/inputValidation на полном PIN candidate и validate/tests. Разделять unresolved, missing builders, normalization, resources/dependencies и rendering. Старые 78/74 unresolved и ожидание 95 registry types — не текущий остаток и не готовность. Не создавать дубли аудита и не тратить каждый ход на неподтверждённую арифметику.

Открыты bamboo shoot/adult forms, torchflower relationship, Bedrock review азалии, реальные alpha/WebGL гелей, ресурсные связи/иконки и saved-ID routes. Модельный этап не объявлять завершённым по наличию builder ID.

## 3. Сохранить смысл объектов и источников

Дубли, формы, состояния, стадии и кадры — разные сущности. Wall coral fans остаются aliases без отдельных карточек/моделей/переключателей; candle cakes объединяются с cake при сохранении ресурсов, свечи отдельны. Waxed/infested требуют эквивалентности; oxidation сохранить, normal/deepslate не сливать. Obsolete stonecutter не возвращать.

Dependencies разрешают конкретные shared roles, не обход ownership и не замену entity adapter. Entities/cushion/bell отложены; sign/bed и другие block entities требуют source/inventory/geometry/material контракта. Перед основным переключением явно согласовать scope, не скрывать unsupported кубами и не выдавать срез за полный каталог.

## 4. Сделать новый путь проверяемым

Сохранить рабочий legacy до приёмки. Создать отдельную проверяемую страницу с реальными PNG/Three/WebGL; проверить normalize→compile→access→preview→registry. compileModelCatalog строгий, поэтому admission ограниченного среза решать явно. Проверить aliases/forms/states/icons, materials и обратное открытие исходных ID.

## 5. Интегрировать и принять редактор

Общий объект Find/editor, loaders и обновление материалов; независимые state/forms/stages/frames. EN/RU, role-based icon badges, Shared textures, растущие подписи и design tokens без редизайна бумаги. Плеер отдельно от state: timing/order, пауза при рисовании, экспорт всей ленты; часы/компас demo cycle.

Принять async targets, storage transactions, dimensions/alpha/import limits и Android-цепочку draw/undo/redo/Add/reopen/PNG/mcpack. Только затем переключить HTML/FK_V/cache и удалить заменённый legacy, не оставляя конкурирующие runtime.

## 6. Темп и следующие этапы

Средние законченные пакеты geometry/data/resources/states/tests. Готовый пакет сразу подавать на системное подтверждение без отдельного хода «готово». После записи проверять фактическое содержимое против одобренного пакета, не только список файлов. Обязательные постоянные сводки остатка владелец снял; не обещать даты/число коммитов без основания. Документы по запросу; после обрыва проверять GitHub.

Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы. Backup автоматически не обновлять, localStorage packs не очищать.
