# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-08

Точка кода перед этим документальным пакетом: 8f9a1c9c115a1def557d986d11c3bfaf841521ab. Учтены OLDCHAT26, OLDCHAT27 и присланные результаты GitHub Actions. Рефакторинг не объявлен завершённым, это не выпуск. Основной editor по прежней передаче legacy; HTML/runtime в этом проходе заново не проверены. Read-only preview не доказывает editor draw/undo/reopen/export.

Подключены настоящий source ID bed с 16 цветными записями и owned sheets, свечи и cake/candle-cake sources, механизмы/рельсы/громоотводы, power groups печей/коптильни/лампы и дополнительные технические объекты. Последние 22 ID из OLDCHAT27 действительно записаны 73ca673 и включены в сборку preview. Candle cakes — aliases целого cake, не готовая свеча на торте.

Базовый список preview-config.mjs содержит 638 исходных ID: прежние 602 + bed + 17 свечей + 18 cake sources. Итоговые REVIEW_IDS собираются в preview.mjs со stone/wood/leaf data и дополнительными группами. Source IDs, expanded records и видимые карточки — разные количества. Старые 1177 не текущая полнота, заявленные 1275 не число принятых моделей. Coverage 1277 включает два auxiliary источника.

## Что проверено

По логам GitHub Actions на e07f971: validate 697 тестов прошли, ошибок и пропусков нет. Отдельный preview-slice не завершился: Explicit face variant required: north. Полного успешного построения всех геометрий пока не подтверждено.

Grass_path теперь именованно выбирает dirt для нижней грани, сохраняя coarse_dirt. Следующая статически подтверждённая неоднозначность mycelium исправлена в 8f9a1c9 через именованные defaults, snow-side ресурс сохранён. Результат CI после этой правки не проверен. По просьбе владельца выполнен переход к документации без новых тестов и ручных прогонов; automatic CI не отключён.

Реальные PNG/TGA, визуальная правильность UV/масштаба/alpha, WebGL/Android и editor integration требуют приёмки. Зелёные unit tests и coverage этого не заменяют.

## Продолжение и сохранность

Читать CONTEXT → docs/handoff-unified-cards.md → ARCHITECTURE → TODO → ROADMAP → docs/review-principles.md. Этот пакет обновляет оставшиеся пять документов: указание в передаче 8f9a1c9 «сначала закончить документы» относится к уже закрываемому документальному шагу, не к новому кругу рефакторинга.

При дальнейшем техническом продолжении: полный preview/ресурсная приёмка, затем конкретная editor integration, совместная проверка и индивидуальная чистка. Готовую геометрию повторно не переносить. Preview просмотр в пользовательские паки не пишет.

Только main/точное подтверждение каждой записи/saved content-diff/<25000 UTF-8 bytes/file. Понятную просьбу о подтверждении выносить в конец ответа: отдельный prompt у владельца может не отображаться. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Документы по запросу владельца, новые permanent tests отдельно согласовать. Chest/shulker whole-block facing не возвращать. Full mobs/skin editor/body/armor/tablet-desktop layout — будущие этапы.

PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; Three.js r128/JSZip 3.10.1. Полные модельные контракты — ARCHITECTURE и прежняя передача 3e503a8.
