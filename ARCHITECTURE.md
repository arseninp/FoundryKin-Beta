# ARCHITECTURE — FoundryKin

Состояние на 2026-10-29, `main` = `353ee09` (0.9.1). Не результат нового полного CI или WebGL-аудита. Ветка `refactor-0.9` (`c9423ef`) описана отдельно и в приложении не используется.

## Порядок загрузки

Оболочка `app.html`: FK_V (0.9.1), стили, `fk-i18n.js` → `fk-editor.js` → `fk-app.js`, JSZip 3.10.1; FKE открывает `index.html` в iframe.

Редактор (`index.html`, стили `fk-base.css` и `fk-model-state.css`):

```text
fk-i18n.js → Three.js r128 → fk-catalog-data.js → fk-catalog.js
→ fk-shapes.js → fk-sculk.js → fk-lights.js → fk-details.js
→ fk-fixtures.js → fk-strands.js → fk-curation.js → fk-blocks-b.js
→ fk-view.js → fk-model-state.js → fk-core.js → fk-pixel-grid.js
→ fk-tools.js → fk-grid.js → fk-help.js
```

Расширения оборачивают `FKCatalog.index`, `FKShapes.build/view`; curation оборачивает `bindFamilies`. Поздняя обёртка может перекрывать раннюю. Общий реестр в `main` не внедрён (прототип — в `refactor-0.9`).

## Карта модулей

| Модуль | Ответственность |
|---|---|
| app.html, fk-app.js | Паки, навигация, Save/Add, импорт/экспорт, диагностика |
| fk-editor.js | Мост оболочки и iframe |
| fk-i18n.js, fk-base.css, fk-style.css, стили index.html | Переводы, темы, компоновка, шапки |
| fk-model-state.css | Оформление панели состояний |
| fk-catalog-data.js | Закреплённые данные, манифест, SHA-256, инвентарь ресурсов |
| fk-catalog.js | build/index, extra-пути, семейства, загрузка PNG/TGA |
| fk-shapes.js | Общие формы, базовые модели (включая четыре кристалла аметиста), иконки форм |
| fk-sculk.js, fk-lights.js, fk-details.js | Специализированные модели и слоты |
| fk-fixtures.js | Полки, лестница, кафедра, рычаг, бамбуковые ограды, бледный ковёр, подготовка высоких цветов |
| fk-strands.js | Pale hanging moss и sulfur spike |
| fk-curation.js | Фильтрация дублей, слияния состояний/тыкв/pitcher, trapdoor; модели лампы, факела, repeater/comparator (redstoneDevice), sunflower; `H.previewStates` для механизмов |
| fk-blocks-b.js | Поршни, культуры, turtle egg, flowerbeds, крючок/леска, лозы, Nether portal, рамка Края |
| fk-view.js | Один рендерер, сцены, камеры, свет, материалы/текстуры, build/clear/render/capture |
| fk-core.js | FKAPI, редактор, слоты/холсты, подготовка моделей и снимков |
| fk-grid.js | Find, категории, поиск, видимость, кэш карточек |
| fk-model-state.js | Панель состояний просмотра: схема `previewStates[id]`, тематическое окно через `FKM`, значения в памяти |
| fk-pixel-grid.js | SVG-сетка над холстом, не входит в PNG |
| fk-tools.js, fk-help.js | Рисование, палитра, менеджер окон FKM, справка |

## Данные и выбор объектов

1. FKCatalogData и FKCatalog.load читают `data/catalog-candidate/` и `data/catalog-families/`.
2. build разрешает terrain-ключи в пути. Для массива primary берёт первый элемент; extra сохраняет все пути, поэтому равные primary не доказывают равенство состояний.
3. Цепочка index добавляет списки `sp[id]={kind,list,fm}`, фильтрует дубли, объединяет ресурсы. `sp` вытесняет обычный carried-слот; принимается только строковая форма `carried_textures`.
4. bindFamilies скрывает дочерние карточки и задаёт familyOf/variantForm/formEntries.
5. describe выбирает ID, shape, слоты и faceMap; slotsFor/pathsFor используют sp.
6. ensureFiles → readImage → drawFrame готовят данные для редактора и Find. Редактор: selectBlock → setupSlots → applyEntry → FKView.build. Find: grid().preview → previewBlock → FKView.capture.
7. Add собирает изменённые пути всего выбранного семейства. Состояния модели не подменяют игровые block states в паке.

`openTexture` игнорирует переданный ID объекта и ищет первый подходящий по пути (известный дефект).

## Состояния просмотра

Схема: массив полей `{key, label:[en,ru], values:[{value,label}]}`, ключ `[a-z][a-z0-9_]*`, значения string/boolean/конечное число. Репитер: `power` (auto/off/on), `delay` 1–4. Компаратор: `power`, `subtract`. `E.state` читается моделью `redstoneDevice`. Режим `auto` связывает питание с выбранным PNG-слотом — это остаточная скрытая связь.

Также управление моделью через выбранный слот осталось у поршней (inner → выдвинут), sulfur spike (направление, `tip_merge`), pale moss (из-за слотов). Согласовано перевести на явные параметры панели.

## Общий просмотр

- Один ленивый WebGLRenderer; отдельные сцены редактора и снимка.
- Ортографическая камера ±0.95, z=3.9, стартовый поворот (.6155, -PI/4, 0).
- Ambient .75, Directional .55 в (2,4,3). Nearest, alphaTest .05.
- Рендер по запросу, без idle. Снимки синхронные toDataURL.
- End portal/gateway и textures/items/ — фронтальные спрайты. Nether portal — вертикальная плоскость. End portal frame — корпус 13 px с глазом.
- Общий biome tint не реализован.
- Факел: `torchPost` — у включённого варианта две перпендикулярные плоскости с полной областью PNG.

## Кэш, хранение

`foundrykin.catalog.v6`: b/p/cr/extra, existing, familyPlan, версия, source commit. Паки `fk070_packs` и настройки — отдельно. Сброс кэша не удаляет паки. Оригиналы с Mojang `46ba6ea985fb5a92d79a9419198f10dda14c199d`. Холст 16/32/64.

## Ветка refactor-0.9 (не в приложении)

- `catalog/resources.mjs` — нормализация путей и граней, carried в обеих формах, иконки.
- `catalog/identity.mjs` — алиасы с проверкой, что дубль не теряет модель/состояние/ресурс.
- `catalog/rules/duplicates.mjs` — waxed_/infested_ → обычный блок.
- `catalog/items.mjs`, `catalog/rules/icons.mjs` — индексация item-атласа, связи блок→иконка (двери, кровати bed_silver, таблички, и др.).
- `catalog/compile.mjs` — единый сборщик; `catalog/access.mjs` — выбор объекта по сохранённому ID без угадывания.
- `models/registry.mjs`, `models/strands.mjs` — явный реестр и перенесённая геометрия.
- `tools/validate.mjs`, `.github/workflows/validate.yml` для ветки.

## Проверки

```sh
for file in fk-*.js; do node --check "$file"; done
node --test tools/*.test.mjs
```

validate.yml: Node 22, contents: read. Есть тесты strands, curation, blocks-b, catalog-cleanup, сборщиков, данных, семейств и `tools/model-state-ui.test.mjs`. Многие на заглушках; цепочка загрузки целиком не проверяется. Gate-layout тест использует частичную маску.

## Ограничения и долг

Entity pipeline, головы, таблички, полный items-каталог — впереди. Проигрыватель кадров не реализован. Лимиты кэшей, точечная инвалидация, toBlob/revokeObjectURL, общие помощники, большие атласы и транзакционное хранение отложены. Полный аудит мёртвого кода не выполнен.
