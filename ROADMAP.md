# ROADMAP — перенос, приёмка, очистка

Обновлено 2026-11-04. Проверенный HEAD до документации: 6ccafe6d7b9e8d277fd513e70bca3a8d5d1b5105. Контекст — CONTEXT/handoff, задачи — TODO, контракты — ARCHITECTURE. Не выпуск.

## 1. Текущая передача

Конкретная чистка whole-block facing сундуков/шалкеров завершена. Модель вращается жестом; отдельные направления не возвращать. Open крышки и chest double сохранены, ender double запрещён. Не смешивать лишний поворот блока с UV-гранями/stem direction/growth face.

Срез 44 source IDs: прежние 29 + 4 liquids + 11 chests. Жидкости и сундуки уже подключены к common picker/resolver/срезу, их не переносить заново. Shulker geometry/sources/open resolver есть, UI/срез ещё нет. Следующий участок при продолжении — только open/independent PNG/цвета в существующем picker, без facing. Отклонённый черновик 17 shulkers/61 slice не записан.

## 2. Продолжить согласованную основу

Не повторять головы/статуи/eyeblossom/pot/conduit/bed/sign/cauldron/auxiliary/banner/fruit-stem/budding amethyst/aquatic/propagule/kelp/materials. Полные mobs/скелет/развёртки/cushion/bell отдельно, не недоделка голов. Предварительный bell/player_head/bubble_column остаток подтвердить existing coverage, не выдавать за свежий прогон/согласованный scope.

Макет и tablet/desktop адаптация прямо отложены владельцем на другой чат. Здесь не начинать редизайн; mobile/paper tokens сохранить.

## 3. Принять результат

Targeted проверки сопровождают перенос, но general audit/CI expansion не заменяет его. Workflow pot/conduit/liquids/chest записан, успешный Actions не подтверждён; mocks/synthetic/recording-painter counts не full chain и не суммируются.

Нужны full PIN input/coverage/compile/validate/tests/CI, реальные PNG-TGA/Bedrock UV-scale/Three-WebGL/Android/export, source routes/reopen/menu/forms/state/texture/poses/frames и lifecycle. Ограничения reference models/tint/alpha/kelp — ARCHITECTURE.

## 4. Довести редактор и очистить после успеха

Общий Find/editor/loaders/EN-RU/Shared textures/badges; player отдельно от static state, item icon UX согласовать. Принять draw/undo/redo/Add/reopen/PNG/mcpack, async/storage/import/dimensions/alpha/cache/URL lifecycle/pack-slot-frame-language-theme/Android. Preview не editor.

Только после совместной готовности — индивидуальная чистка тестов/дублей, runtime switch, FK_V/cache и удаление заменённого legacy. Только main/точное подтверждение/saved diff/<25000 bytes/file; новые permanent test files отдельно согласовать. Backup/fk070_packs не трогать. Полные items/entities/IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы — отдельные этапы.
