# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-04

Проверенный HEAD до документации: 6ccafe6d7b9e8d277fd513e70bca3a8d5d1b5105. Рефакторинг/блоковый этап не завершены; основной editor не переключён, это не выпуск/визуальная приёмка. Legacy UI 0.9.1 по прежним проверкам; HTML здесь заново не исследован.

Отдельный read-only preview включает 44 исходных ID, не 44 cards/весь каталог: к прежним 29 добавлены вода/лава (4 IDs) и сундуки (11 IDs, включая waxed copper routes). Общий picker, независимые PNG/form/state; liquids level 0..7, chests open/double, ender без double.

Чистка лишних направлений сундуков/шалкеров завершена: удалены whole-block facing из builders/resolver, меню сундука, циклов проверок и подписей. Вращение жестом, открытие крышек/UV/размеры сохранены. Макет отложен на другой чат.

Shulker geometry/sources/open resolver уже есть, но ящики ещё не включены в срез/меню. Продолжение — подключение без facing, только open/PNG/раздельные цвета. Старый черновик 17 shulkers/61 slice отклонён и не записан.

Головы/статуи/eyeblossom/pot patterns/static active conduit и предыдущие модели уже переносились. Полные mobs отложены, не недоделка голов. Liquids не flow simulator, static poses не player.

Workflow дополнен проверками, но successful Actions/full compile/реальные PNG-TGA/WebGL/Android/export пока не подтверждены. Локальные mocks этого не заменяют.

## Навигация и сохранность

CONTEXT.md → docs/handoff-unified-cards.md → ARCHITECTURE.md → TODO.md → ROADMAP.md → docs/review-principles.md. Предыдущие подробные документы — 3fe2d82; актуальная передача основана на текущем разговоре/GitHub, не на выдуманном новом архиве.

Только main/точное подтверждение/saved diff; новые test files отдельно согласовать, существующие не удалять массово. Backup не обновлять автоматически/refactor-0.9 не воссоздавать. fk070_packs не очищать: backup кода не сохраняет пользовательские паки. Перенос → совместная приёмка → чистка/переключение legacy после успеха. PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; Three.js r128/JSZip 3.10.1. Остальные контракты — CONTEXT/ARCHITECTURE.
