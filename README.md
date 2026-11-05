# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-05

Проверенный кодовый HEAD перед документацией: 05f7a62f42a021b2c67d0cfbd3c87515db428aa6. Основной редактор остаётся на legacy 0.9.1; index.html заново проверен. Новый каталог/renderer ещё не интегрирован с рисованием/undo/reopen/export основного пути. Это не выпуск и не завершение всего рефакторинга.

Отдельный read-only preview содержит 67 исходных ID, не число карточек/весь каталог: прежние 29 + liquids 4 + chests 11 + shulkers 17 + bell + player_head + fire/soul_fire + campfire/soul_campfire. REVIEW_IDS/TEXT — preview-config.mjs, image helpers — preview-images.mjs. В паки этот просмотр не пишет.

Статичное подключение костров закончено: два source IDs/EN-RU, общий lit picker/default true и независимая PNG, unlit-пламя и Lambert-брёвна. Огонь имеет A/B вариант независимо от PNG. Дым/animation playback не реализованы. Этот кодовый пакет не нужно начинать заново в следующем чате; вид в Bedrock ещё подлежит общей приёмке.

Локальные файлы тестов: resource-variants 9/9, fire-models 8/8, light-models 7/7. Связанный campfire стенд на production modules проверил 12 state/PNG сочетаний, defaults/invalid inputs/material updates; Three/источники синтетические. Полный PIN compile/успешный CI/реальные PNG-TGA/WebGL/Android/export не подтверждены. Записанные pinned tests и workflow не доказывают успешный запуск.

## Продолжение и сохранность

Следующий чат — следующие согласованные модели, не повторная реализация костров. Bubble_column имеет только роли ресурсов, без builder/assignment/preview; точный вид и движение отложены по скриншотам владельца. Будущий skin editor/примерка брони и полные mobs — отдельные этапы.

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → docs/review-principles.md. Полностью прочитанный архив — OLDCHAT22; текущий разговор не объявлять новым архивом до его реального появления.

Только main/точное подтверждение/saved diff, файлы <25000 UTF-8 bytes, новые test files отдельно согласовать. Документы по указанию владельца. Backup/refactor-0.9 не обновлять автоматически, fk070_packs/localStorage не очищать: backup кода не сохраняет пользовательские паки. Перенос → приёмка → чистка/runtime switch/удаление заменённого legacy. PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; Three.js r128/JSZip 3.10.1.
