# ARCHITECTURE — FoundryKin

Состояние на 2026-10-28, кодовая точка `caaff4609af0a5b51a52e5caeca976c7674da31a`. Не считать этот документ результатом нового полного CI или WebGL-аудита.

## Порядок загрузки

Оболочка `app.html`: FK_V, стили, `fk-i18n.js` → `fk-editor.js` → `fk-app.js`, JSZip 3.10.1; FKE открывает `index.html` в iframe.

Редактор:

```text
fk-i18n.js → Three.js r128 → fk-catalog-data.js → fk-catalog.js
→ fk-shapes.js → fk-sculk.js → fk-lights.js → fk-details.js
→ fk-fixtures.js → fk-strands.js → fk-curation.js → fk-blocks-b.js
→ fk-view.js → fk-model-state.js → fk-core.js → fk-pixel-grid.js
→ fk-tools.js → fk-grid.js → fk-help.js
```

Расширения оборачивают `FKCatalog.index`, `FKShapes.build/view`. Curation дополнительно оборачивает `bindFamilies` для обычного trapdoor. Поздняя обёртка может перекрывать раннюю; это не второй WebGLRenderer. Общий реестр пока не внедрён.

FK_V/большинство ресурсов — 0.8.92, blocks-b — ?v=0.8.93. Несогласованность существует в коде, документация её не исправляет.

## Карта модулей

| Модуль | Ответственность |
|---|---|
| app.html, fk-app.js | Паки, навигация, Save/Add, импорт/экспорт, диагностика |
| fk-editor.js | Мост оболочки и iframe |
| fk-i18n.js, fk-base.css, fk-style.css, стили index.html | Переводы, темы, компоновка, шапки |
| fk-catalog-data.js | Закреплённые данные, манифест, SHA-256, инвентарь ресурсов |
| fk-catalog.js | build/index, extra-пути, семейства, загрузка PNG/TGA |
| fk-shapes.js | Общие формы, базовые модели, размерные классы, иконки форм |
| fk-sculk.js, fk-lights.js, fk-details.js | Специализированные модели и слоты |
| fk-fixtures.js | Полки, лестница, кафедра, рычаг, бамбуковые ограды, бледный ковёр, подготовка высоких цветов |
| fk-strands.js | Сегментированные pale hanging moss и sulfur spike |
| fk-curation.js | Фильтрация дублей, слияния состояний/тыкв/pitcher, trapdoor metadata; специальные модели первого пакета и единственная геометрия sunflower |
| fk-blocks-b.js | Поршни, культуры, turtle egg, flowerbeds со стеблями, крючок/леска, лозы, Nether portal, end portal frame |
| fk-view.js | Один рендерер, сцены, камеры, свет, материалы/текстуры, build/clear/render/capture |
| fk-core.js | FKAPI, редактор, слоты/холсты, общая подготовка моделей и снимков |
| fk-grid.js | Find, категории, поиск, видимость, кэш карточек, прокрутка |
| fk-model-state.js | Переключатели состояния просмотра без записи PNG/паков |
| fk-pixel-grid.js | Отдельная SVG-сетка над холстом, не входит в PNG |
| fk-tools.js, fk-help.js | Рисование, палитра, справка |

## Данные и выбор объектов

1. FKCatalogData и FKCatalog.load читают закреплённые наборы `data/catalog-candidate/` и `data/catalog-families/`.
2. build разрешает terrain-ключи в пути. Для массива primary берёт первый элемент; extra сохраняет все пути. Поэтому равные primary ещё не доказывают равенство состояний (ошибка с pumpkin_face_on уже встречалась).
3. Цепочка index добавляет специальные списки `sp[id]={kind,list,fm}`, фильтрует дубли и объединяет ресурсы. Генерируемые семейства и runtime-слияния — разные слои.
4. bindFamilies оставляет дочерние определения в b, скрывает их самостоятельные карточки в ids и задаёт familyOf/variantForm/formEntries. Обычный trapdoor получает одноформную запись с ключом trapdoor, используя существующую геометрию.
5. describe выбирает ID, shape, слоты и faceMap. slotsFor/pathsFor используют sp; выбранная форма семейства открывает конкретный вариант с собственными ресурсами.
6. ensureFiles → readImage → drawFrame готовят одинаковые данные для редактора и Find. Редактор: selectBlock → setupSlots → applyEntry → FKView.build. Find: grid().preview → previewBlock → FKView.capture.
7. Рисование меняет холст и dirty, обновляет материал; Add собирает изменённые пути всего выбранного семейства через familyPaths. Состояния модели не подменяют игровые block states в экспортируемом паке.

Объединения не создают новые PNG: редактируются реальные пути. Общий путь текстуры может использоваться несколькими объектами. `openTexture` ищет первый подходящий объект; это существенно для голов с одинаковым skull-placeholder и требует исправления на entity-этапе.

## Общий просмотр

- Один ленивый WebGLRenderer; отдельные сцены/группы редактора и снимка.
- Ортографическая камера ±0.95, z=3.9, стартовый поворот (.6155, -PI/4, 0); zoom через FKShapes.view.
- Ambient .75, Directional .55 в (2,4,3). Nearest, alphaTest .05, общая политика depthWrite по полупрозрачности.
- DataTexture с общим переворотом строк; doorTexture собирает половины двери.
- Рендер по запросу; ручной поворот, без idle. Снимки синхронные toDataURL, буфер переиспользуется. Геометрия, материалы и текстуры снимков освобождаются.
- End portal/gateway и textures/items/ — фронтальные спрайты. Nether portal — вертикальная 3D-плоскость. End portal frame — корпус 13 px с глазом по слоту. Не смешивать эти три объекта.
- Цветы и стебли рисуются совместно; у tripwire hook слот лески переключает прикреплённую модель. Отдельный trip_wire остаётся самостоятельным объектом.
- Общий biome tint не реализован. Копирование Java-геометрии не подтверждает Bedrock UV и окраску.

## Кэш, хранение и состояния

`foundrykin.catalog.v6`: b/p/cr/extra, existing, familyPlan, версия и source commit. Пользовательские паки `fk070_packs` и настройки — отдельные данные. Сброс кэша не должен удалять паки.

Оригиналы загружаются с Mojang `46ba6ea985fb5a92d79a9419198f10dda14c199d` через raw/CDN; не использовать live-main. Холст выбирает 16/32/64, frames/aspect — ограниченная поддержка анимационных/неквадратных ресурсов, не универсальный atlas pipeline.

Pale moss: base/tip, четыре стороны none/short/tall, upper_block_bit. FKModelState хранит выбор в памяти, FKView передаёт state; dirty и PNG не меняются.

## Проверки и рабочий процесс

```sh
for file in fk-*.js; do node --check "$file"; done
node --test tools/*.test.mjs
```

validate.yml: Node 22, contents: read, push/PR по заданным путям и workflow_dispatch, без автокоммитов. Markdown-only запись не обязана запустить validate. Генераторы catalog-audit/catalog-candidate/family-data/legacy-check — отдельные workflows. fix-bamboo-gate-bedrock.yml оставлен как отключённая миграция-заглушка, не как рабочий редактор исходников.

Существуют специализированные тесты strands, curation, blocks-b и catalog-cleanup, а также сборщиков, данных и семейств. Многие используют заглушки или ограниченный набор модулей; их наличие не доказывает проверку всей цепочки загрузки. Последний полный успешный прогон не подтверждён. Gate-layout тест использует частичную маску скриншота, а не полный оригинальный PNG.

## Ограничения и долг

Полный entity pipeline, головы и таблички, полный items-каталог — впереди. Репитер/компаратор пока без объёмных верхних деталей. Лимиты кэшей, точечная инвалидация, toBlob/revokeObjectURL, общий реестр/помощники, большие атласы и транзакционное хранение отложены. Полный аудит мёртвого кода не выполнен: последняя очистка удаляет конкретную перекрытую ветку sunflower, не все потенциальные дубли.
