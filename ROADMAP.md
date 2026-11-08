# ROADMAP — завершить перенос, принять, очистить

Обновлено 2026-11-08. Проверенный HEAD main до документации: 836ad36a953f49dd2f08cc7996b0f6172b87385b. Не выпуск. Контекст — CONTEXT/handoff, детали — ARCHITECTURE/TODO.

## 1. Закончить каталог и техническую основу

Текущий состав отдельного preview — 939 source IDs (602 base + 273 stone/mineral + 50 wood + 14 leaf), не число геометрий и не полный каталог. Полная таблица статусов для 1275 исходных ID ещё нужна; auxiliary отдельно. Массово сверять и подключать готовые семейства, исправлять только доказанные пробелы, не создавать модели повторно. Bubble_column уже sprite/18 owned roles/preview без симуляции; foliage cutout/opaque и leaf ID уже подключены. Старые числа 67/228 и финальный повторный leaf draft OLDCHAT25 не использовать как актуальный статус.

## 2. Совместная проверка и editor integration

Получить full coverage/inputValidation/PIN compile/tests/Actions на конкретном SHA. Локальные metadata/fixtures/registry spy не заменяют реальных PNG-TGA/WebGL/Bedrock UV-scale-alpha/Android. Перенести оставшиеся editor Find/resources/states/draw/history/reopen/export пути на новую основу; определить фактический остаток по коду. Preview read-only не означает editor switch. Принять draw/undo/redo/Add/reopen/PNG/mcpack/async/storage/import/lifecycle/language-theme-pack-slot-frame.

## 3. Чистка после готовности

После совместной приёмки удалить конкретные заменённые пути/дубли, проверить тесты индивидуально, выполнить runtime switch/FK_V/cache. Не удалять работающий legacy заранее, не очищать паки/localStorage.

## 4. Будущие отдельные этапы

Skin editor в карточке Игрок, позже body/примерка брони с переиспользованием head/hat/full sheet/routes; full mobs/entities/items/cushion; animation playback/smoke/particle simulation; tablet/desktop layout; IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы — отдельный scope. Фиктивные готовые формы не показывать.

Одна большая задача — без остановок ради отчётности: после подтверждения записать/проверить/готовить следующий пакет. Новая запись требует точного подтверждения; изменение направления/материалы/реальный блокер обсуждать отдельно. Только main/<25000 UTF-8 bytes/file, новые permanent tests отдельно согласовать, документы по просьбе владельца. Backup/refactor-0.9/fk070_packs не трогать.
