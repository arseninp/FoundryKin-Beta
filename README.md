# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-08

Проверенный HEAD main перед документацией: 836ad36a953f49dd2f08cc7996b0f6172b87385b. Рефакторинг продолжается, это не выпуск. Основной editor по прежней передаче остаётся legacy; его runtime/HTML в этой документальной сессии заново не проверяли. Новый preview не доказывает готовность editor draw/undo/reopen/export.

Отдельный read-only preview собирает 939 исходных ID: 602 базовых + 273 каменных/минеральных + 50 древесных + 14 лиственных. Это состав кода и интеграционное ожидание, не результат свежего полного compile и не число уникальных моделей/карточек. Базовый список — preview-config.mjs; переводы — preview-text.mjs; дополнительные группы — preview-stone-data.mjs, preview-wood-data.mjs, preview-leaf-data.mjs; итоговая сборка — preview.mjs. В паки просмотр не пишет.

Bubble_column использует существующий sprite с одной выбранной текстурой, сохранены 18 owned roles; симуляции потока нет. Листва имеет общий cutout/opaque picker независимо от edited PNG; биомный tint не реализован по передаче. Огонь A/B и костры lit/unlit статичны, smoke/playback не входят в реализованный scope.

Полные coverage/inputValidation/PIN compile/tests/Actions, реальные PNG-TGA/WebGL/Android и визуальная приёмка не подтверждены этой сессией. Исторические локальные результаты и новые normalized-fixture/registry-spy tests не заменяют эти проверки.

## Продолжение и сохранность

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → docs/review-principles.md. Последний прочитанный архив — OLDCHAT25; его ненадёжный конец не основание повторного leaf подключения. Продолжение — массовая сверка/подключение оставшихся реальных ID, затем editor integration/совместная приёмка/чистка.

Только main, точное подтверждение каждой записи и saved diff; <25000 UTF-8 bytes/file. После подтверждения продолжать одну большую задачу без лишнего ожидания «продолжай». Документы по запросу владельца; новые permanent tests отдельно согласовать. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Полные mobs/skin editor/примерка брони/tablet-desktop layout — будущие этапы. PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; Three.js r128/JSZip 3.10.1.
