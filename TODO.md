# TODO — завершение переноса и приёмка

Обновлено 2026-11-08 по OLDCHAT26/27, сохранённому 8f9a1c9c115a1def557d986d11c3bfaf841521ab и присланным CI-логам. [x] означает сохранённый код или прямо указанный результат на конкретном SHA, не визуальную приёмку. CONTEXT/handoff читать первыми. Этот документальный пакет закрывает упомянутое там обновление остальных пяти документов.

## Сохранено — не повторять

- [x] Прежние подключения stone/wood/leaf/copper/cube/indexed/fixtures/signs/joinery/extra; 79 старых fixtures сохранены 0dd77aa, stale 67 исправлено b41c99b. Config/text разделение edfc234 не отменять.
- [x] Bed: один исходный ID → 16 цветных records, bed → red_bed, light_gray → silver, прежняя геометрия/9 частей. Base preview-config 638 = 602 + bed + 17 candles + 18 cake/candle-cake sources.
- [x] Candle lit/shared picker, whole-cake face bindings; candle cakes aliases cake с сохранением ресурсов, не реализованная свеча на торте.
- [x] OLDCHAT27: механизмы/4 rails/8 lightning rods, power groups печей/коптильни/лампы, дополнительные кубические/технические источники, шесть texture modes structure_block.
- [x] 73ca673: последние 22 ID записаны и включены в REVIEW_IDS/TEXT. Уплотнение таблиц/reviewRows не потеря подключений.
- [x] fa9800b VM test import/count error; fd6b777 mock normal.count; 650da80 актуальные metal/crafter ожидания с negative checks; 95c9777 порядок и границы групп; d3a21c3 bed expansion в CI.
- [x] d3a21c3 validate 694/694; e07f971 validate 697/697, fail 0/skipped 0 — результаты присланных логов.
- [x] e07f971 grass_path down=dirt по имени; coarse_dirt/variants/paths сохранены, три регрессии в существующем файле.
- [x] 8f9a1c9 mycelium named defaults: up mycelium_top/down dirt/side mycelium_side, count 2; snow-side сохраняется. После правки тестов не запускали.
- [x] Bubble_column existing sprite/18 owned roles/одна выбранная texture, без симуляции. Leaf 14 ID/cutout-opaque/shared picker; biome tint не принят. Existing indexed button/plate/stair bindings и regressions сохранены.

## Ближайшая техническая точка при возобновлении

Владелец выбрал сначала закончить документы, без дополнительных тестов и ручных прогонов. Ниже технические долги, не требование немедленно попросить новые логи. Existing automatic CI не отключать, тесты не удалять.

- [ ] Полный успешный preview-slice: на e07f971 обход остановился с Explicit face variant required: north; на d3a21c3 было down. Конкретная mycelium неоднозначность найдена статически и исправлена, но лог сам не содержит ID. Результат после 8f9a1c9 не проверен; другие блокеры не исключены.
- [ ] При дальнейшей отладке диагностировать source ID/model/face, не вводить общий fallback на первую PNG.
- [ ] Сверить точные REVIEW_IDS length/unique/source membership с исходным множеством. Заявленные OLDCHAT27 1275 не число принятых моделей/карточек. Coverage 1277 включает auxiliary end_gateway/lava_cauldron.
- [ ] Закончить по-ID resource/state classification: assignment → builder → resources/bindings → states → preview. Отсутствие проверки не называть отсутствием модели, готовую геометрию не писать повторно.
- [ ] При согласованном возвращении к приёмке получить свежий compile/coverage/inputValidation/tests/Actions на конкретном SHA. Исторические mocks и coverage report не заменяют полный geometry sweep.
- [ ] Leaf с реальными images/alpha/material lifecycle/PNG/cutout-opaque; biome tint отдельно.

## Совместная приёмка и основной editor

- [ ] PNG/TGA/real Three-WebGL/UV/scale/alpha/Android: dragon/potted azalea/gels/stem tint/kelp, pot/conduit/liquids/chests/shulkers/bell/fire/campfires/bubble sprite и новые группы. Geometry без дефекта не переделывать.
- [ ] Source-ID reopen/owned/carried/icons/indexed repeats/dependencies/aliases/forms/states/independent PNG/GPU update-cleanup.
- [ ] По коду определить и закрыть конкретные оставшиеся legacy editor Find/resources/states/draw/history/Add/reopen/PNG-mcpack export пути на единственной новой основе. Read-only preview не editor switch.
- [ ] Совместно принять loaders/EN-RU/Shared textures/badges/draw/undo/redo/Add/reopen/export/async/storage/import/dimensions/alpha/cache/URL lifecycle/language-theme-pack-slot-frame/Android.
- [ ] Только после готовности — индивидуальная чистка заменённых путей/тестов, runtime switch/FK_V/cache/removal legacy. Packs/localStorage заранее не очищать.

## Будущий scope

- [ ] Animation timing/order/playback/pause/export strip/clock-compass/smoke/точная particle simulation; не блокеры статичного bubble/campfire.
- [ ] Full skin editor/player body/поздняя примерка брони/full mobs/entities/items/cushion. Head/hat/full Steve sheet/routes сохранить.
- [ ] Tablet/desktop layout отдельно, mobile/paper tokens сохранить; IndexedDB/большие паки/user backup/PWA-offline/права на ресурсы отдельно.

Только main/<25000 UTF-8 bytes/file; новые permanent tests отдельно согласовать. Каждая запись с точным подтверждением и проверкой saved diff/content. Владелец не всегда видит отдельный prompt: просьбу о записи явно выносить в конец ответа. После подтверждения продолжать подготовку без искусственных остановок. Backup/refactor-0.9/fk070_packs/localStorage не трогать. Chest/shulker facing не возвращать. Подробные контракты — ARCHITECTURE/CONTEXT и прежняя передача 3e503a8.
