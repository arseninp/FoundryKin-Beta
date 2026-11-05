# ROADMAP — модели, приёмка и развитие редактора

Обновлено 2026-11-05 по OLDCHAT22/GitHub. Проверенный HEAD до документации: 60ec0ad78b28e17a5087a4849f1cb972e35752c0. CONTEXT/handoff — вход, TODO — задачи, ARCHITECTURE — контракты. Не выпуск.

## 1. Доделать модельный этап

Шалкеры/колокол/голова игрока уже подключены. REVIEW_IDS в preview-config.mjs: 63 source IDs (29 прежних + liquids 4 + chests 11 + shulkers 17 + bell + player_head), не cards/весь каталог. Bell статичный на стойках; player только head+hat в карточке Игрок. Не восстанавливать ошибочную последнюю реплику OLDCHAT22 о несохранённой голове.

Следующий согласованный кандидат bubble_column: проверить исходники/ресурсы и выбрать корректное представление, не куб-заглушку. Свежий existing coverage/inputValidation/full PIN compile ещё нужен, чтобы определить реальный остаток; ровно один пробел не доказан. Завершать модели, не подменять перенос бесконечным дроблением файлов/вторым аудитом.

Whole-block facing сундуков/шалкеров удалён полностью; вращение жестом, chest open/double, ender без double, shulker open. Крышки/UV/stem direction/growth face сохранить. Готовые головы/статуи/eyeblossom/pot/conduit/bed/sign/banner/предыдущие переносы не повторять.

## 2. Принять модельную цепочку

Targeted mocks/исторические локальные результаты не full PIN/CI/WebGL. Pinned shulker/bell/player tests записаны, успех не подтверждён; workflow сам не доказывает Actions. Нужны existing input/coverage/compile/validate/tests/CI и реальные PNG-TGA/Bedrock UV-scale/Three-WebGL/Android/export/source routes/reopen/forms/PNG/state/poses/frames/materials/lifecycle. Ограничения reference models/tint/alpha/kelp/dragon — ARCHITECTURE.

## 3. Подключить к основному редактору

Общий Find/editor/loaders/EN-RU/Shared textures/badges; animation player отдельно от static state, item icon UX согласовать. Принять draw/undo/redo/Add/reopen/PNG/mcpack/async/storage/import/dimensions/alpha/cache/URL lifecycle/pack-slot-frame-language-theme/Android. Read-only preview не редактор, основной путь пока legacy.

Только после совместной готовности — индивидуальная чистка тестов/дублей, runtime switch/FK_V/cache/удаление заменённого legacy. Сохранность пользовательских паков важнее технической чистки.

## 4. Будущий редактор скинов и примерка брони

По предложению владельца в конце OLDCHAT22: полноценный редактор скинов в карточке Игрок, позднее полное тело для примерки брони. Текущие head/hat UV/полный Steve sheet/routes — переиспользуемая основа, не готовый редактор скинов. При втором потребителе отделить описание головы от её размещения; не создавать обрезанные листы/фиктивное тело сейчас. Сложность/объём отдельно оценить, лёгкость реализации не обещана. Это не текущая задача вместо bubble_column.

## 5. Остальные отдельные этапы

Полные items/entities/mobs/cushion, IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы — отдельный scope. Макет tablet/desktop прямо отложен на другой чат, mobile/paper tokens сохранить. Документы обновлять только по указанию владельца. Только main/точное подтверждение/saved diff/<25000 UTF-8 bytes/file; новые permanent test files отдельно согласовать. Backup/fk070_packs не трогать.
