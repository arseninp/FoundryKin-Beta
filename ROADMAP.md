# ROADMAP — модели и интеграция

Обновлено 2026-11-01. Проверенный кодовый HEAD 62c8af15ec1fb4d9c4cc1c96caec9e349141df6a. Контекст/доказательства — CONTEXT, задачи — TODO, контракты — ARCHITECTURE. Это не выпуск приложения.

## 1. Закончить согласованный просмотр плода со стеблем

Хорус восстановлен 86b6d8f; не начинать это исправление заново. Stem для pumpkin_stem/melon_stem записан 62c8af1, но составной просмотр и объединение карточек ещё нет.

Цель: тыква с собственным стеблем — одна карточка, арбуз с собственным стеблем — другая. Явное меню «Без стебля / Со стеблем»: только плод либо плод и направленный к нему стебель рядом. Это не простая замена плода отдельным стеблем и не объединение тыквы с арбузом. Сохранить source IDs/PNG, параметры стебля и варианты тыквы. Выбор PNG не управляет видом.

По просьбе владельца разделить на самосогласованные небольшие пакеты: компонент с тестами → подключение карточек/состояния/маршрутов → интеграция и saved-ID reopen. Локальный компонент, заявленный в OLDCHAT14, не считать перенесённым: его код/журнал здесь не получены. Не дублировать builders и не менять legacy редактор ради этой задачи.

## 2. Закончить модельный scope по реальным данным

После прежних roots/cube states/structures/piston backs/mushrooms/cage записаны исправленный chorus, cave vines, bulb/ice/anchor states, furnace front normalization, dragon egg, bamboo/shoot и torchflower/crop forms, stem growth/attached/facing. Записанные возможности не повторять по старым TODO.

Использовать существующий coverage/inputValidation на полном PIN candidate и validate/tests; отделять unresolved/missing builders/normalization/inventory/dependencies/rendering. Свежего полного остатка нет. Старые 78/74 unresolved и ожидаемые 99 registry types не являются текущим coverage/готовностью. Не создавать дубли аудита и не считать каждый ход неподтверждённый остаток.

Открыты Bedrock PNG/UV азалии/новых Java-reference моделей, возрастная окраска stem, alpha/WebGL гелей, ресурсные связи/иконки и saved-ID routes. Регистрация не закрывает модельный этап.

## 3. Сохранить смысл объектов и источников

Дубли, формы, состояния, стадии и кадры различать. Bamboo/shoot и torchflower/crop связаны карточками, не aliases исходных записей. Wall coral fans остаются aliases без отдельных карточек/переключателей крепления; candle cakes объединяются с cake при сохранении ресурсов, обычные свечи отдельны. Waxed/infested требуют эквивалентности; oxidation сохранять, normal/deepslate не сливать. Obsolete stonecutter не возвращать.

Dependencies разрешают конкретные shared roles, не обход ownership и не замену entity adapter. Entities/cushion/bell отложены; sign/bed и прочие block entities требуют source/inventory/geometry/material контракта. Перед основным переключением явно согласовать scope, не скрывать unsupported кубами и не выдавать срез за полный каталог.

## 4. Сделать новый путь проверяемым

Сохранить рабочий legacy до приёмки. Создать отдельную проверяемую страницу с реальными PNG/Three/WebGL, проверить normalize→compile→access→preview→registry. Admission ограниченного среза решить явно при строгом compileModelCatalog. Проверить aliases/forms/states/icons/materials и открытие исходных ID. Исторические 11 интеграционных сценариев OLDCHAT14 не заменяют полный candidate и реальные builders/rendering.

## 5. Интегрировать и принять редактор

Общий объект Find/editor, loaders и обновление материалов; независимые state/forms/stages/frames. EN/RU, role-based icon badges, Shared textures, растущие подписи/design tokens без редизайна бумаги. Плеер отдельно от state: timing/order, пауза при рисовании, экспорт ленты; часы/компас demo cycle.

Принять async targets, storage transactions, dimensions/alpha/import limits и Android-цепочку draw/undo/redo/Add/reopen/PNG/mcpack. Затем переключить HTML/FK_V/cache и удалить заменённый legacy, не оставляя конкурирующие runtime. HTML в этой документальной передаче не перечитан.

## 6. Темп и следующие этапы

Пакеты geometry/data/resources/states/tests; для текущей функции согласовано разбиение из пункта 1. Готовый пакет сразу на точное системное подтверждение, после записи сверять полный фактический diff/контент. После обрыва проверить GitHub. Документы по запросу; числа/сроки/количество коммитов не выдумывать. Причины обрывов провайдера неизвестны.

Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы. Backup автоматически не обновлять; fk070_packs не очищать.
