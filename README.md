# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-08

Проверенный main HEAD перед документацией: 6289e137144a70929084e9d1c2a7e5722c170bae. Последний прочитанный архив — OLDCHAT26. Рефакторинг продолжается, это не выпуск. Основной editor по прежней передаче legacy; HTML/runtime в этом документальном проходе заново не проверены. Read-only preview не доказывает editor draw/undo/reopen/export.

Статический состав preview ожидается 1177 записей: прежние 939 (602 base + 273 stone/mineral + 50 wood + 14 leaf) и новые 55 copper + 41 cube + 10 indexed + 39 fixtures + 39 signs + 35 doors/shelves + 19 alias/technical. Это не свежий compile/unique audit и не число моделей/карточек. Base — preview-config.mjs, text — preview-text.mjs, stone/wood/leaf — отдельные data modules, новые группы и итоговая сборка — preview.mjs. Просмотр в паки не пишет.

Copper bulb 4 modes, frosted ice 4 stages и respawn anchor 5 charge values выведены в общий picker независимо от PNG. Двери/полки подключены в статичном scope. Финальная реплика архива про bed не подтверждена текущим preview.mjs; готовность всех моделей/ресурсов ещё не установлена.

Bubble_column использует existing sprite с одной texture и 18 owned roles без симуляции. Leaf cutout/opaque независим от edited PNG, biome tint не заявлен готовым. Fire A/B/campfire lit-unlit статичны, без smoke/playback.

Full coverage/inputValidation/PIN compile/tests/Actions, реальные PNG-TGA/WebGL/Android и визуальная приёмка этим проходом не подтверждены. Старые частичные Node mock/fixture результаты не заменяют полный прогон.

## Продолжение и сохранность

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → docs/review-principles.md. Продолжение — сверка реальных оставшихся ID/подключение готового, затем editor integration/совместная приёмка/чистка. Ненадёжный конец чата не основание отката проверенного прогресса или повтора неподтверждённой записи.

Только main/точное подтверждение каждой записи/saved content-diff/<25000 UTF-8 bytes/file. Внутри одной большой задачи после подтверждения продолжать без ожидания «продолжай». Документы по запросу владельца, новые permanent tests отдельно согласовать. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Full mobs/skin editor/body/armor/tablet-desktop layout — будущие этапы. PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; Three.js r128/JSZip 3.10.1.
