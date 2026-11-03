# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-03

Проверенный HEAD до этой документации: efb873044ce59c308bce2aaf11ba73c709d869bf. Рефакторинг/блоковый этап не завершены, это не выпуск/визуальная приёмка. Основной editor не переключён на новый путь; legacy UI 0.9.1 по прежним проверкам, HTML здесь заново не исследован.

Новая основа разделяет каталог/модели/ресурсы/состояния/materials/lifecycle. Bed/sign/cauldron/chest/shulker/banner и предыдущие plant/fruit/aquatic модели уже переносились. Головы skeleton/wither_skeleton/creeper/zombie/piglin/dragon и статуи 4 окислений/4 поз находятся в parent cards с сохранением source IDs. Eyeblossom одна card closed/open/glow. Полные mobs отложены, не недоделка голов.

OLDCHAT20 добавил decorated pot с 23 узорами/обычной стороной и 4 независимыми choices, static active Java-reference conduit с activity/eye/wind picker. Общие controls вынесены в preview-controls.mjs без второй реализации меню. PNG/form/state/pose независимы.

Отдельный read-only preview теперь включает 29 source block IDs, НЕ 29 cards/весь каталог/редактор. Основы water/lava и назначения 4 ID уже записаны; в срез/меню жидкости ещё не подключены — это текущая точка продолжения. Uniform-height level 0..7 не симуляция потока и не принятый Bedrock render.

Existing workflow дополнен проверками pot/conduit, но успешный Actions/full compile/реальные PNG-TGA/WebGL/Android/export не подтверждены. Исторические mocks этого не заменяют. Вопрос адаптации tablet/desktop открыт, конкретный редизайн не согласован; mobile/paper tokens сохраняются.

## Навигация и сохранность

Читать CONTEXT.md → docs/handoff-unified-cards.md → ARCHITECTURE.md → TODO.md → ROADMAP.md → docs/review-principles.md. Предыдущие полные документы сохранены в d41f384. В этой передаче прочитаны полный OLDCHAT20, семь документов, 15 коммитов, root preview.mjs и models/liquids.mjs; тесты/compile/CI/браузер не запускались, весь код/diff заново не исследован.

Порядок: перенос/основа с точечными проверками → совместная приёмка → чистка → переключение/удаление legacy после готовности. Только main/точное подтверждение каждой записи/saved diff; новые test files отдельно согласовать, существующие не удалять массово. backup автоматически не обновлять/refactor-0.9 не воссоздавать. fk070_packs не очищать: backup кода не сохраняет пользовательские паки.

PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d, candidate в репозитории. Legacy Three.js r128/JSZip 3.10.1. Прочие контракты и границы доказательств — CONTEXT/ARCHITECTURE.
