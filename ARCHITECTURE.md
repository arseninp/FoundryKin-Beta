# ARCHITECTURE — карта кода 0.8.65

Проверено чтением fk-core.js, fk-grid.js, fk-shapes.js, index.html (main 5311626). Указатели имеют вид файл::символ. Номера строк не даются: искать по символу.

## Загрузка

- app.html: fk-style.css, fk-base.css; `window.FK_V`; fk-i18n.js, fk-editor.js, fk-app.js, JSZip 3.10.1 (CDN). Внутри iframe грузится index.html.
- index.html: fk-base.css; fk-i18n.js → Three.js r128 (CDN) → fk-catalog.js → fk-shapes.js → fk-sculk.js → fk-lights.js → fk-details.js → fk-fixtures.js → fk-core.js → fk-tools.js → fk-grid.js → fk-help.js.
- Все собственные `?v=` равны FK_V. Порядок обязателен: sculk, lights, details, fixtures оборачивают предыдущие `FKShapes.build` и `FKCatalog.index`, поэтому идут после fk-shapes и fk-catalog и до fk-core.

## Файлы

| Файл | Роль и ключевые символы |
|---|---|
| app.html | Оболочка: экраны home/create/pack/edit/add/settings/diag, iframe редактора, FK_V |
| fk-app.js | Навигация, localStorage паков (fk070_packs), Save/Add, импорт/экспорт, FKAPP.migrate, диагностика |
| fk-editor.js | Мост FKE: загрузка iframe, open/editTexture, dirtyNow, closeMenu |
| fk-i18n.js | FK.t, словари EN/RU, FK.apply(document) |
| fk-base.css, fk-style.css | Темы, шапки, Montserrat; компоновка оболочки |
| index.html | Разметка Find и редактора, локальные стили, порядок скриптов |
| fk-catalog.js | FKCatalog: URLS_B, URLS_T, fetchJson, fetchExisting, build, index, loadAny (PNG/TGA, CDN-fallback), parseLoose |
| fk-shapes.js | FKShapes: SHAPES, VIEW_SCALE, viewClass, view, icon, build; построители box, ubox, plane, patch, cross, stem, bamboo, plant, door, bed, bell, brewing, leaf, dripstone, candle, anvil, beacon, flat, decal; boxUV; inkRect (проверить использование) |
| fk-sculk.js | Сенсоры, крикун, кактус: обёртки C.index и S.build |
| fk-lights.js | Фонари, цепи, факелы, костры: family(), C.index, H.build |
| fk-details.js | Котлы, end rod, lightning rod, bars, Cocoa, Conduit, daylight, grindstone, flower_pot, decorated_pot, dried_ghast, fire, soul_fire, frame, hopper, heavy_core, End-спрайты; flat-режим (определение FKShapes.flat искать здесь) |
| fk-fixtures.js | ladder, lectern, lever, sunflower, lilac, rose_bush, peony; явные пути текстур вариантов |
| fk-core.js | Состояние редактора, рендерер редактора, холсты слотов, история, dirty, selectBlock, FKAPI, FKAPI.ctx |
| fk-tools.js | Кисть, цвета, трансформации, настройки, меню FKM; работает через FKAPI.ctx |
| fk-grid.js | Find: поиск, карточки, очередь снимков, активный пак, восстановление прокрутки |
| fk-help.js | Справка и сведения о каталоге/ошибках |

Повторяющиеся помощники граней (face, box, plane, patch, ubox) продублированы в sculk, lights, details, fixtures и shapes: объединить в фазе бетонирования.

## Поток данных

1. fk-core::loadCatalog берёт FKCatalog.fetchJson(URLS_B, URLS_T) и fetchExisting. Кэш localStorage: foundrykin.catalog.v3 (поля b и p; cr не хранится) и foundrykin.exist.v2 (не все entity-пути). Затем useCatalog → FKCatalog.build → FKCatalog.index (цепочка расширений) → catalog {ids, b, p, cr, sp, forms, sig, members, mother}.
2. fk-grid::render фильтрует catalog.ids; карточка: IntersectionObserver → paint → enqueue → makePreview → snap3d → toDataURL → img.src.
3. Клик: fk-core::selectBlock(id) → ensureFiles (загрузка PNG, files[path] = {res, data, frames, aspect}) → setupSlots (canvas и MeshLambertMaterial на слот) → applyEntry (PNG на canvas) → build() → FKShapes.build.
4. Рисование: fk-tools → FKAPI.ctx (g, pushUndo, touched, files, say) → fk-core::touched → refreshTex (новая DataTexture) → drawEd.
5. Add/Save: fk-app читает FKAPI.files() (только dirty) → fk070_packs; экспорт через JSZip.

Хранилища: fk070_packs, fk070_settings, fk_hist (цвета), fk_brush. Размеры: ensureFiles выбирает 16/32/64; fcount делит вертикальную полосу на кадры; aspect хранит неквадратные картинки при упаковке (packCur, mkFile).

## Просмотр: два пути (корень текущих дефектов)

| Параметр | Редактор (fk-core.js) | Find (fk-grid.js) |
|---|---|---|
| Рендерер | WebGLRenderer в #stage, antialias, DPR до 2 | init3(): скрытый WebGLRenderer 256x256, preserveDrawingBuffer, DPR 1 |
| Камера | PerspectiveCamera(35), z = 3.9 * FKShapes.view(cur) | OrthographicCamera ±.95, z=3.9, zoom = 1/view(id) |
| Поворот группы | (.45, -.7, 0), далее палец и авто-вращение | (.6155, -.7854, 0) фиксирован |
| Ключи материалов | пути PNG (faceMap = пути) | up, down, north, south, east, west, plant, g1, g2, g3, tent; slot = up |
| Список текстур | все слоты блока | need(shape, id) вручную |
| Геометрия | FKShapes.build без iso | FKShapes.build с iso:true (cross, stem уже) |
| Прозрачность | texBuf().semi → depthWrite | semi(canvas) → depthWrite |
| Тонировка | нет | TINT: листва и трава берут carried-текстуру |
| Дверь | refreshDoor: DataTexture 2*res | snap3d: ручная сборка canvas 2*R |
| Цикл | loop(): постоянный requestAnimationFrame, пропуск при mode != edit или hidden | один кадр на карточку, toDataURL, затем dispose |
| Очередь | нет | pump, enqueue, MAX=6 одновременно |
| Кэш | нет | pv (готовые URL), imgCache (без лимита) |

Свет в обоих: Ambient .75 и Directional .55 в точке (2, 4, 3). Освобождение: fk-core::clearModel и finally-блок snap3d обходят геометрию; cleanup материалов в Find через own и tex.

## Известные дефекты по указателям

- fk-shapes.js::cross и ::stem: ширина и поворот зависят от E.iso (причина сжатых растений).
- fk-core.js::loop: бесконечный RAF; idle-вращение `group.rotation.y += dt*.0004`; watchRender ловит render_stalled.
- fk-core.js::setSlot: при carried-слоте дважды вызывает build.
- fk-grid.js::need: ручной второй список текстур; makePreview::TINT отдельное правило цвета.
- fk-grid.js: imgCache и pv не ограничены; pv сбрасывается целиком в discardEdits и applyPack; потеря WebGL-контекста навсегда отключает 3D (mode3d=false, восстановления нет).
- fk-grid.js::snap3d использует toDataURL (строка в памяти на каждый кадр); вместо этого toBlob с освобождением URL.
- Шаг rotate/zoom классов: VIEW_SCALE содержит 1, 1.4, 1.8, 2.3; viewClass(id) по регулярке; small_dripleaf_block в список не входит.
- Вызовы `FKShapes.flat` в fk-core и fk-grid защищены проверкой наличия; в экспорте fk-shapes.js этого символа нет (return {build, SHAPES, icon, view}).
- fk-catalog: кэш без cr; существующий список entity-путей неполон.
- Нет теста реального WebGL; все проверки до сих пор на заглушках.

## Целевая архитектура

Одна функция сборки модели от состояния (id, slot, faceMap, mats) без знания экрана; одна подготовка текстур и материалов с ключами-путями; один рендерер и один набор камер по размерным классам; редактор рисует по событию; карточка снимается тем же путём, кэшируется с лимитом и инвалидируется точечно. Расширения моделей заменить реестром (id → builder) без цепочки обёрток.
