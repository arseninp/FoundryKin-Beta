# ARCHITECTURE — FoundryKin 0.8.44

База: main, код 28258ae. Запуск app.html. В корне 13 файлов приложения и 5 документов; каждый файл меньше 25 000 Б.

## Загрузка

Оболочка: fk-style.css, затем общая fk-base.css; FK_V; fk-i18n.js → fk-editor.js → fk-app.js → JSZip 3.10.1.

Редактор — один iframe с index.html?v=FK_V. В index.html локальные стили, затем fk-base.css; скрипты fk-i18n.js → three.js r128 → fk-catalog.js → fk-shapes.js → fk-core.js → fk-tools.js → fk-grid.js → fk-help.js. Все собственные подключения версионированы одним значением. Не менять порядок без проверки зависимостей: fk-core.js и fk-grid.js вызывают FKShapes.

НЕТ runtime PATCHES/NEWPATCHES, строковых якорей, srcdoc и внедрения тела функций. Не возвращать их механизмы.

## Ответственность файлов

| Файл | Роль |
|---|---|
| app.html | Экраны оболочки, форма, iframe, подключения, FK_V. |
| fk-base.css | Montserrat (Google Fonts), палитры, общие переменные и компоненты шапки для оболочки и iframe. |
| fk-style.css | Геометрия оболочки, экраны, карточки паков/текстур, кнопки вне шапки, нижняя панель. |
| fk-app.js | Навигация, форма, данные паков/localStorage, импорт/экспорт, Add, диагностика (сверяет версию скрипта с FK_V). |
| fk-editor.js | Мост FKE: загрузка iframe, URL с версией, вызовы FKAPI, подписка на состояние. |
| index.html | Разметка редактора и локальные стили холста, слотов, форм, инструментов, карточек Find. |
| fk-catalog.js | Загрузка и индекс данных Mojang, список растений, формы, особые блоки (двери, маяк, рельсы, азалия, cave_vines, аметисты), PNG/TGA. Без состояния холста. |
| fk-shapes.js | Построители моделей Three.js: FKShapes.build(E). Не хранит состояние. |
| fk-core.js | Модель данных, холсты, история, выбор блока/слота, файлы и dirty, загрузка каталога, FKAPI, SVG форм, подписи слотов, сцена редактора. |
| fk-tools.js | Рисование, кисть/ластик, заливка, пипетка/замена цвета, трансформации, палитра, настройки, менеджер FKM. |
| fk-grid.js | Find: поиск, карточки, снимки через FKShapes, подстановка активного пака, возврат прокрутки. |
| fk-help.js | Справка по состоянию каталога, ошибкам; кнопки ⋮ и sheet. |
| fk-i18n.js | EN/RU, fallback на EN, параметры строк. |

## FKShapes (fk-shapes.js)

FKShapes.build(E) добавляет меши в E.group. Окружение E: shape, cur (id блока), slot, faceMap (грань → ключ материала), mats (ключ → материал), group, hiddenMat, SHAPES, refreshDoor, iso (необязательно). Редактор передаёт пути текстур как ключи, карточки Find — имена граней (up, down, north…, plant, g1–g3).

Модели: обычные боксы по SHAPES (cube, slab, stairs, wall, fence, gate, button, plate, trapdoor, candle, carpet); door; beacon; plant (крест из двух плоскостей) с вариантами azalea, bamboo, cave_vines, amethyst_cluster; rail — одна горизонтальная плоскость (рельсы, кувшинка, икра, подстилка); decal — одна вертикальная плоскость у стены (vine, glow_lichen, sculk_vein, resin_clump).

Флаг iso задаёт ориентацию креста для карточек Find: камера снимков повёрнута ровно на 45°, поэтому плоскости стоят под 0° и 90° с шириной w/√2. Без iso (редактор) — ±45° и полная ширина.

Правило: новые модели добавлять здесь и только здесь; fk-grid.js и fk-core.js собственных построителей не держат. Поля faceMap для групп: g1, g2, g3 у amethyst_cluster.

## Общий интерфейс для новых разделов

Подключать fk-base.css после локальных стилей. Шапки: fk-header и модификатор fk-header--shell либо fk-header--find. Дети: fk-header-back, fk-header-bubble, fk-header-field, fk-header-help, fk-header-action. Размеры задаются --fk-header-* только в базе; назначать размеры Back по отдельным ID запрещено. Montserrat и палитры (--bg/--panel/--ink/--mute/--line/--acc/--find/--red) определены в базе; --find ссылается на --acc. Размеры карточек, холста и инструментов пока локальны.

## Границы API

- FKE (fk-editor.js) — API оболочки: open, editTexture, info, getMode/setMode, reset, ready/busy, files/current/objInfo, dirtyNow/markSaved, closeMenu, scrollY, pendingEdit, doc.
- FKAPI принадлежит iframe: state, subscribe, setMode, cur/files, loading/loaded, openTexture, stats, grid, ctx, version/pending/edits/busy.
- FKAPI.ctx — узкая связь инструментов с холстом, разрешением, историей и сообщениями.
- grid() даёт каталог, файлы/dirty, shapes, select/load, edited, discard/setPack, obj и shapeFor.
- FKAPP.migrate группирует импортированные текстуры после получения каталога (ищет путь среди pathsFor всех карточек).
- FKM — одно открытое меню и интеграция с history.

Статус каталога — loading/ready/failed/empty, источник cache/network/file, ошибка — code/detail.

## Каталог и группы блоков

indexCatalog строит b (id → 6 путей по граням), sp (особые блоки со списком слотов и faceMap), forms/kids (плиты, ступени и т. п.), sig/members/mother (блоки с одинаковыми путями в одной карточке). Особые группы: cave_vines поглощает cave_vines_body_with_berries и cave_vines_head_with_berries (слоты body, head); amethyst_cluster поглощает large/medium/small_amethyst_bud (kind 'pick', четыре слота, g1–g3 в faceMap). Поглощённые id из списка карточек убраны. Растения: список имён и эвристика в buildCatalog, флаг p хранится в кэше.

shapeKeysFor: дверь → door; свеча → candle; ковёр → carpet; рельсы, кувшинка, икра, подстилка → rail; лоза/лишайник/скульк-вена/смола → decal; растение → plant (без куба); иначе cube плюс доступные формы.

## Модель данных и селекторы

Обычные грани группируются по пути текстуры; один слот обслуживает несколько граней. Подписи слотов — slotLabels (имена файлов, составные при нескольких ключах). Find сравнивает содержимое data URL. Позиция списка сохраняется при клике; при возврате догружаются карточки до нужной высоты.

## Хранилище и внешние данные

localStorage: fk070_packs, fk070_settings, fk_hist, fk_brush, foundrykin.catalog.v3, foundrykin.exist.v2. Каталог и ресурсы — Mojang bedrock-samples через сеть/CDN; JSZip, three.js и шрифт внешние.

## Известный долг

- lastT в fk-core.js используется и как время кадра, и как terrain-данные: разделить.
- Кэш каталога хранит b/p, но не cr: carried-данные могут отсутствовать до обновления из сети.
- fk-app.js местами меняет объекты до save; у чтения иконки нет надёжного токена формы.
- Освобождение геометрий при build в редакторе, фоновые кадры скрытого редактора, очередь превью, асинхронные гонки требуют аудита.
- Пересечения навигации, истории, меню и загрузки iframe.
- Разрешение в ensureFiles выбирается по старому правилу 16/32, импорт PNG читает размер: полный цикл 64px не доказан.
- Классификация растений и плоских блоков по именам; блоки вне списков остаются кубами.
- Карточки Find для групп и новых моделей не проверены на телефоне (0.8.42–0.8.44).
